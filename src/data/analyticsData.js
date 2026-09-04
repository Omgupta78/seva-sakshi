/**
 * ---------------------------------------------------------------------
 * ANALYTICS DATA — synthesized monitoring history for anomaly detection
 * ---------------------------------------------------------------------
 * Real deployments would read these series from the operational database.
 * Here we synthesize a deterministic 30-day history per project for the
 * metrics the engine analyses, and deliberately inject a few anomalies into
 * specific projects so the TRANSPARENT BASELINE detectors have something
 * real to find (the baseline is computed from the quiet part of the window,
 * so an injected recent dip is genuinely a deviation — not hard-coded).
 *
 * Nothing here asserts wrongdoing. An anomaly is only an indicator for human
 * review; the engine's job is to explain WHY a value looks unusual.
 * ---------------------------------------------------------------------
 */
import { PROJECTS, ORGANIZATIONS, LOCATIONS } from './projectsSeedData.js'

export const ANALYTICS_WINDOW_DAYS = 30

/** Which anomalies to inject per project (everything else stays normal). */
const ANOMALY_PROFILES = {
  'PRJ-2202': ['attendance-drop'], // sudden low attendance
  'PRJ-2203': ['attendance-identical'], // implausibly constant attendance
  'PRJ-2205': ['attendance-vs-inspection', 'overdue'],
  'PRJ-2207': ['cctv-downtime'], // repeated CCTV outages
  'PRJ-2210': ['compliance-failures', 'reporting-spike'],
}

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function dayISO(offsetFromToday) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetFromToday)
  return d.toISOString().slice(0, 10)
}

/** Build a 30-day series (oldest→newest), clamped to [min,max]. `perturb`
 *  can nudge specific recent days to inject an anomaly. */
function series(seedStr, base, noise, { min = 0, max = 100, perturb } = {}) {
  const rand = mulberry32(hash(seedStr))
  const out = []
  for (let i = 0; i < ANALYTICS_WINDOW_DAYS; i++) {
    const daysFromToday = -(ANALYTICS_WINDOW_DAYS - 1 - i)
    let v = base + (rand() * 2 - 1) * noise
    if (perturb) v = perturb(i, v, ANALYTICS_WINDOW_DAYS)
    out.push({ date: dayISO(daysFromToday), value: Math.round(Math.max(min, Math.min(max, v)) * 10) / 10 })
  }
  return out
}

function resolveMeta(p) {
  const org = ORGANIZATIONS.find((o) => o.id === p.organizationId)
  const loc = LOCATIONS.find((l) => l.id === p.locationId)
  return { organizationName: org?.name ?? 'Unknown', district: loc?.district ?? '—', state: loc?.state ?? '—' }
}

/** Full analytics bundle for one project — series + supporting facts. */
export function buildProjectAnalytics(p) {
  const flags = ANOMALY_PROFILES[p.id] ?? []
  const meta = resolveMeta(p)
  const attBase = p.attendancePercentage || 80
  const cctvBase = p.cctvStatus === 'online' ? 97 : p.cctvStatus === 'partial' ? 86 : 62

  // Attendance
  const attendance = series(`${p.id}-att`, attBase, 4, {
    perturb: flags.includes('attendance-drop')
      ? (i, v, n) => (i >= n - 3 ? attBase * 0.55 + (i % 2) : v) // last 3 days ~45% below
      : flags.includes('attendance-identical')
        ? () => attBase // implausibly constant
        : flags.includes('attendance-vs-inspection')
          ? (i, v, n) => (i >= n - 5 ? Math.min(99, attBase + 12) : v) // reported unusually high
          : undefined,
  })

  // CCTV uptime
  const cctvUptime = series(`${p.id}-cctv`, cctvBase, 3, {
    perturb: flags.includes('cctv-downtime')
      ? (i, v, n) => ([n - 2, n - 4, n - 5, n - 8].includes(i) ? 8 + (i % 5) : v) // repeated outages
      : undefined,
  })

  // Daily reports filed (reporting frequency)
  const reports = series(`${p.id}-rep`, 1, 0.9, {
    min: 0, max: 12,
    perturb: flags.includes('reporting-spike')
      ? (i, v, n) => (i >= n - 4 ? 6 + (i % 3) : v) // sudden burst of filings
      : undefined,
  }).map((d) => ({ ...d, value: Math.max(0, Math.round(d.value)) }))

  // Compliance history — last 6 checks (older→newest)
  const compRand = mulberry32(hash(`${p.id}-comp`))
  const complianceHistory = Array.from({ length: 6 }, (_, i) => {
    let result
    if (flags.includes('compliance-failures')) result = i >= 3 ? 'non-compliant' : compRand() > 0.5 ? 'non-compliant' : 'compliant'
    else if (p.complianceStatus === 'non-compliant') result = compRand() > 0.6 ? 'non-compliant' : 'compliant'
    else if (p.complianceStatus === 'watch') result = compRand() > 0.75 ? 'non-compliant' : 'compliant'
    else result = compRand() > 0.95 ? 'non-compliant' : 'compliant'
    return { date: dayISO(-(5 - i) * 5), result }
  })

  // Last inspection outcome (for attendance-vs-inspection cross-check)
  const lastInspection = {
    date: p.lastInspection,
    outcome: flags.includes('attendance-vs-inspection') ? 'Issues noted' : p.riskLevel === 'high' ? 'Follow-up required' : 'Compliant',
    lowPresenceObserved: flags.includes('attendance-vs-inspection'),
  }

  return {
    projectId: p.id,
    projectName: p.name,
    organizationName: meta.organizationName,
    district: meta.district,
    state: meta.state,
    riskLevel: p.riskLevel,
    beneficiaryCount: p.beneficiaryCount,
    staffCount: p.staffCount,
    windowDays: ANALYTICS_WINDOW_DAYS,
    series: { attendance, cctvUptime, reports },
    complianceHistory,
    lastInspection,
    overdueDays: flags.includes('overdue') ? 12 : 0,
  }
}

/** Analytics bundles for every project. */
export function buildAllAnalytics() {
  return PROJECTS.map(buildProjectAnalytics)
}
