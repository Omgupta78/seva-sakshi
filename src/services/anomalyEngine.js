/**
 * ---------------------------------------------------------------------
 * ANOMALY ENGINE — transparent baseline detection (explainable first)
 * ---------------------------------------------------------------------
 * Approach, in order of preference:
 *   1. TRANSPARENT BASELINE (implemented here): for each metric compute the
 *      project's own historical mean and standard deviation, then measure how
 *      far the latest observation deviates (z-score / % change). Every flag
 *      carries the numbers that produced it, so a human can check the maths.
 *   2. A pluggable ML detector (e.g. Isolation Forest) can be added as an
 *      extra entry in DETECTORS for multivariate cases — the engine already
 *      treats detectors as swappable. It is intentionally NOT the default:
 *      the baseline method is explainable, which matters for review.
 *
 * An anomaly is an INDICATOR, never proof. Output is always framed as
 * "Anomaly detected — requires officer review", with a reason and a
 * recommended review action; it never asserts fraud/misconduct.
 * ---------------------------------------------------------------------
 */
import { buildAllAnalytics } from '../data/analyticsData.js'

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical']

/** Score→risk bands (documented, so the level is explainable). */
export function riskFromScore(score) {
  if (score >= 75) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

// --- stats helpers --------------------------------------------------------
const vals = (s) => s.map((d) => d.value)
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0 }
function std(a) {
  if (a.length < 2) return 0
  const m = mean(a)
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1))
}
/** severity in [0,1]; a 4σ deviation saturates to 1. */
function severityFromZ(z) { return Math.max(0, Math.min(1, Math.abs(z) / 4)) }
function score(severity01, weight) { return Math.round(Math.max(0, Math.min(1, severity01)) * 100 * weight) }
const pct = (n) => `${n >= 0 ? '+' : ''}${Math.round(n)}%`

/** Metric importance weights — higher = a deviation matters more. */
const WEIGHT = {
  attendanceLow: 0.9,
  attendanceSudden: 0.78,
  attendanceIdentical: 0.7,
  attendanceVsInspection: 0.95,
  cctvDowntime: 0.72,
  overdueInspection: 0.62,
  complianceFailures: 0.95,
  reportingFrequency: 0.6,
}

const ACTION = {
  attendanceLow: 'Schedule a surprise inspection to verify on-ground presence.',
  attendanceSudden: 'Verify the cause of the sudden change against field records.',
  attendanceIdentical: 'Review the raw attendance registers for copy-forward or auto-filled entries.',
  attendanceVsInspection: 'Reconcile reported attendance with the last inspection’s field notes.',
  cctvDowntime: 'Verify camera connectivity and request a maintenance report.',
  overdueInspection: 'Assign an inspector to clear the overdue inspection.',
  complianceFailures: 'Escalate for compliance review and a corrective-action plan.',
  reportingFrequency: 'Review recent report submissions for accuracy and timing.',
}

const METRIC_LABEL = {
  attendanceLow: 'Attendance level',
  attendanceSudden: 'Attendance change',
  attendanceIdentical: 'Attendance variability',
  attendanceVsInspection: 'Attendance vs inspection',
  cctvDowntime: 'CCTV uptime',
  overdueInspection: 'Inspection schedule',
  complianceFailures: 'Compliance results',
  reportingFrequency: 'Reporting frequency',
}

const today = () => new Date().toISOString().slice(0, 10)

function makeAnomaly(a, category, { expected, observed, deviation, reason, severity01, breakdown }) {
  const sc = score(severity01, WEIGHT[category])
  return {
    projectId: a.projectId,
    projectName: a.projectName,
    district: a.district,
    category,
    metric: METRIC_LABEL[category],
    detectedDate: today(),
    expectedValue: expected,
    observedValue: observed,
    deviation,
    reason,
    riskLevel: riskFromScore(sc),
    score: sc,
    scoreBreakdown: breakdown,
    recommendedAction: ACTION[category],
  }
}

// --- detectors ------------------------------------------------------------
// Each returns 0..n anomalies for one project's analytics bundle.

function detectAttendance(a) {
  const out = []
  const s = a.series.attendance
  const series = vals(s)
  const baselineSlice = series.slice(0, -3) // exclude last 3 days
  const base = mean(baselineSlice)
  const sd = std(baselineSlice) || 1
  const latest = series[series.length - 1]
  const z = (latest - base) / sd
  const pctDev = ((latest - base) / base) * 100

  // 1) unusually low attendance
  if (z <= -1.5 && pctDev <= -12) {
    out.push(makeAnomaly(a, 'attendanceLow', {
      expected: `${base.toFixed(0)}%`, observed: `${latest.toFixed(0)}%`, deviation: pct(pctDev),
      reason: `Attendance on ${s[s.length - 1].date} was ${Math.abs(Math.round(pctDev))}% below the project's ${a.windowDays}-day baseline (observed ${latest.toFixed(0)}% vs expected ${base.toFixed(0)}%, ${z.toFixed(1)}σ). Anomaly detected — requires officer review.`,
      severity01: severityFromZ(z),
      breakdown: `z = ${z.toFixed(1)}σ · weight ${WEIGHT.attendanceLow} · below-baseline`,
    }))
  }

  // 2) sudden change (last-3-day avg vs preceding-3-day avg)
  const last3 = mean(series.slice(-3))
  const prev3 = mean(series.slice(-6, -3)) || base
  const jump = ((last3 - prev3) / (prev3 || 1)) * 100
  if (Math.abs(jump) >= 25 && out.length === 0) {
    out.push(makeAnomaly(a, 'attendanceSudden', {
      expected: `${prev3.toFixed(0)}%`, observed: `${last3.toFixed(0)}%`, deviation: pct(jump),
      reason: `Attendance ${jump < 0 ? 'dropped' : 'rose'} ${Math.abs(Math.round(jump))}% over the last 3 days versus the prior 3 days (${prev3.toFixed(0)}% → ${last3.toFixed(0)}%). Anomaly detected — requires officer review.`,
      severity01: Math.min(1, Math.abs(jump) / 60),
      breakdown: `3-day shift ${pct(jump)} · weight ${WEIGHT.attendanceSudden}`,
    }))
  }

  // 3) implausibly constant (identical values repeated)
  const sd30 = std(series)
  if (sd30 < 0.4) {
    out.push(makeAnomaly(a, 'attendanceIdentical', {
      expected: 'natural daily variation', observed: `constant ~${latest.toFixed(0)}%`, deviation: 'σ ≈ 0',
      reason: `Attendance has been effectively identical (${latest.toFixed(0)}%) for ${a.windowDays} days with near-zero variance (σ=${sd30.toFixed(2)}). Real attendance normally fluctuates. Anomaly detected — requires officer review.`,
      severity01: 0.62,
      breakdown: `σ=${sd30.toFixed(2)} over ${a.windowDays}d · weight ${WEIGHT.attendanceIdentical}`,
    }))
  }

  // 4) attendance inconsistent with inspection observations
  if (a.lastInspection?.lowPresenceObserved && latest >= base) {
    out.push(makeAnomaly(a, 'attendanceVsInspection', {
      expected: 'consistent with field notes', observed: `${latest.toFixed(0)}% reported`, deviation: 'mismatch',
      reason: `Reported attendance is ${latest.toFixed(0)}% (at/above baseline), but the last inspection on ${a.lastInspection.date} noted low physical presence ("${a.lastInspection.outcome}"). The record and the field observation disagree. Anomaly detected — requires officer review.`,
      severity01: 0.8,
      breakdown: `reported ≥ baseline while inspection noted issues · weight ${WEIGHT.attendanceVsInspection}`,
    }))
  }
  return out
}

function detectCctv(a) {
  const series = vals(a.series.cctvUptime)
  const base = mean(series.slice(0, -1))
  const outages = series.filter((v) => v < 50).length
  if (outages >= 3) {
    return [makeAnomaly(a, 'cctvDowntime', {
      expected: `${base.toFixed(0)}% uptime`, observed: `${outages} outage days`, deviation: `${outages}×`,
      reason: `CCTV uptime fell below 50% on ${outages} of the last ${a.windowDays} days (baseline ${base.toFixed(0)}%). Repeated downtime leaves gaps in monitoring coverage. Anomaly detected — requires officer review.`,
      severity01: Math.min(1, outages / 8),
      breakdown: `${outages} sub-50% days · weight ${WEIGHT.cctvDowntime}`,
    })]
  }
  return []
}

function detectOverdue(a) {
  if (a.overdueDays > 0) {
    return [makeAnomaly(a, 'overdueInspection', {
      expected: 'inspected on schedule', observed: `${a.overdueDays} days overdue`, deviation: `+${a.overdueDays}d`,
      reason: `The next scheduled inspection is ${a.overdueDays} days overdue. Overdue inspections reduce oversight and can mask emerging issues. Anomaly detected — requires officer review.`,
      severity01: Math.min(1, a.overdueDays / 20),
      breakdown: `${a.overdueDays}d overdue · weight ${WEIGHT.overdueInspection}`,
    })]
  }
  return []
}

function detectCompliance(a) {
  const fails = a.complianceHistory.filter((c) => c.result === 'non-compliant').length
  if (fails >= 3) {
    return [makeAnomaly(a, 'complianceFailures', {
      expected: '≤1 failure in 6 checks', observed: `${fails}/6 failed`, deviation: `${fails}/6`,
      reason: `${fails} of the last 6 compliance checks were non-compliant. A repeated pattern of failures warrants closer review. Anomaly detected — requires officer review.`,
      severity01: Math.min(1, fails / 5),
      breakdown: `${fails}/6 non-compliant · weight ${WEIGHT.complianceFailures}`,
    })]
  }
  return []
}

function detectReporting(a) {
  const series = vals(a.series.reports)
  const weeklyBaseline = mean(series.slice(0, -7)) * 7
  const last7 = series.slice(-7).reduce((x, y) => x + y, 0)
  const base = weeklyBaseline || 1
  const z = (last7 - base) / (std(series.slice(0, -7)) * 7 || 1)
  const devPct = ((last7 - base) / base) * 100
  if (Math.abs(devPct) >= 60 && Math.abs(z) >= 1.5) {
    return [makeAnomaly(a, 'reportingFrequency', {
      expected: `${base.toFixed(0)}/week`, observed: `${last7}/week`, deviation: pct(devPct),
      reason: `Report filings in the last 7 days (${last7}) are ${pct(devPct)} versus the project's weekly baseline (${base.toFixed(0)}). Unusual reporting cadence can indicate back-dating or data issues. Anomaly detected — requires officer review.`,
      severity01: severityFromZ(z),
      breakdown: `weekly z = ${z.toFixed(1)}σ · weight ${WEIGHT.reportingFrequency}`,
    })]
  }
  return []
}

/** Ordered, swappable detector list. Add an Isolation-Forest detector here. */
const DETECTORS = [detectAttendance, detectCctv, detectOverdue, detectCompliance, detectReporting]

/** Run every detector over every project and return scored anomalies. */
export function runAnalysis() {
  const bundles = buildAllAnalytics()
  const anomalies = []
  for (const a of bundles) {
    for (const d of DETECTORS) anomalies.push(...d(a))
  }
  return anomalies.sort((x, y) => y.score - x.score)
}

/** Aggregate series for the dashboard charts (averaged across projects). */
export function buildChartSeries() {
  const bundles = buildAllAnalytics()
  const n = bundles.length || 1
  const days = bundles[0]?.series.attendance.map((d) => d.date) ?? []
  const avgOver = (metric) => days.map((date, i) => Math.round(bundles.reduce((s, b) => s + (b.series[metric][i]?.value ?? 0), 0) / n))
  // Inspection trend: overdue-weighted proxy — count of projects inspected per 5-day bucket (demo)
  const complianceTrend = bundles[0]?.complianceHistory.map((_, i) => {
    const compliant = bundles.reduce((s, b) => s + (b.complianceHistory[i]?.result === 'compliant' ? 1 : 0), 0)
    return { compliant, nonCompliant: n - compliant }
  }) ?? []
  return {
    days,
    attendance: avgOver('attendance'),
    cctvUptime: avgOver('cctvUptime'),
    reports: avgOver('reports'),
    compliance: complianceTrend,
  }
}
