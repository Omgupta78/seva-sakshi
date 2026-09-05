/**
 * ---------------------------------------------------------------------
 * ATTENDANCE SESSIONS — the shared operational attendance record
 * ---------------------------------------------------------------------
 * ONE store, read by all three portals:
 *   - Institution (teacher) OPERATES: create session → start capture → face
 *     recognition (assist) → review/correct → submit.
 *   - Department MONITORS the aggregated, submitted results (never edits a
 *     routine session).
 *   - Inspector INDEPENDENTLY VERIFIES against the reported figures and can
 *     raise a discrepancy finding.
 *   - AI ASSISTS recognition and feeds anomaly indicators; humans decide.
 *
 * Face recognition is an assist: every recognised result carries a confidence
 * and can be Unknown; nothing is treated as certain. No biometric templates
 * or embeddings are exposed here — recognition runs through the provider and
 * the secure vault; this service only sees {studentId, result, confidence}.
 * Guarded by VIEW_ATTENDANCE / ATTENDANCE_CORRECT; audited throughout.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { requirePermission, getActor } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'
import { record as recordAudit } from './auditService.js'
import { recognizeFace, MODE as RECOGNITION_MODE, MODE_LABEL as RECOGNITION_MODE_LABEL } from './recognitionProvider.js'
import { RECOGNITION_STATUS, ATTENDANCE_SOURCE, SESSION_STATE_LABEL, REVIEW_RECOGNITION } from '../data/attendanceModels.js'
import { INSTITUTION_STUDENTS, CLASSES, sectionOf } from '../data/institutionData.js'

export { CLASSES }
export { RECOGNITION_MODE, RECOGNITION_MODE_LABEL }
export const INSTITUTE_ID = 'INST-001'

export const SESSION_TYPES = [
  { id: 'morning', label: 'Morning Attendance', time: '09:00' },
  { id: 'afternoon', label: 'Afternoon Attendance', time: '14:00' },
  { id: 'evening', label: 'Evening Attendance', time: '18:00' },
]
export const RESULTS = ['present', 'absent', 'unknown']

const roster = (cls) => INSTITUTION_STUDENTS.filter((s) => s.class === cls && s.status === 'active')

let seq = 100
let sessions = seedSessions()

function nowISO() { return new Date().toISOString() }
function today() { return new Date().toISOString().slice(0, 10) }

function counts(students) {
  return {
    present: students.filter((s) => s.result === 'present').length,
    absent: students.filter((s) => s.result === 'absent').length,
    unknown: students.filter((s) => s.result === 'unknown').length,
    total: students.length,
  }
}
function pct(students) {
  const c = counts(students)
  return c.total ? Math.round((c.present / c.total) * 100) : 0
}
function decorate(s) {
  const c = counts(s.students)
  // `unknown` is the "needs review" bucket; surface it under the spec name too.
  return {
    ...s,
    ...c,
    reviewCount: c.unknown,
    attendancePct: pct(s.students),
    statusLabel: SESSION_STATE_LABEL[s.status] ?? s.status,
    recognitionMode: RECOGNITION_MODE,
    recognitionModeLabel: RECOGNITION_MODE_LABEL,
  }
}

// --- seed: a week of submitted history + a couple of today's sessions -----
function seedSessions() {
  const out = []
  for (let d = 6; d >= 1; d--) {
    const date = new Date(); date.setDate(date.getDate() - d)
    const iso = date.toISOString().slice(0, 10)
    for (const cls of CLASSES) {
      const r = roster(cls)
      const base = [92, 88, 76, 95][CLASSES.indexOf(cls)] ?? 85
      const students = r.map((st, i) => {
        const present = (i * 7 + d) % 100 < base
        return { studentId: st.id, name: st.name, result: present ? 'present' : 'absent', confidence: present ? 88 + ((i + d) % 10) : null, method: 'face', recognitionStatus: present ? RECOGNITION_STATUS.MATCHED : RECOGNITION_STATUS.NOT_AVAILABLE, source: ATTENDANCE_SOURCE.MOCK_DEMO }
      })
      out.push({ id: `SES-${seq++}`, class: cls, section: sectionOf(cls), instituteId: INSTITUTE_ID, date: iso, sessionType: 'morning', startTime: '09:00', endTime: '09:35', teacher: 'Kavita More', teacherId: 'STF-05', status: 'submitted', submittedAt: `${iso}T09:35:00`, students, createdAt: `${iso}T08:55:00` })
    }
  }
  return out
}

// --- reads ----------------------------------------------------------------
export async function listAttendanceSessions(params = {}) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay()
  const { date = 'all', cls = 'all', sessionType = 'all', status = 'all' } = params
  let rows = sessions.map(decorate)
  if (date !== 'all') rows = rows.filter((r) => r.date === date)
  if (cls !== 'all') rows = rows.filter((r) => r.class === cls)
  if (sessionType !== 'all') rows = rows.filter((r) => r.sessionType === sessionType)
  if (status !== 'all') rows = rows.filter((r) => r.status === status)
  rows.sort((a, b) => b.date.localeCompare(a.date) || a.class.localeCompare(b.class))
  return { items: rows, total: rows.length }
}

export async function getAttendanceSession(id) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay()
  const s = sessions.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Session ${id} not found`)
  return decorate(s)
}

// --- teacher workflow -----------------------------------------------------
export async function createAttendanceSession({ cls, sessionType = 'morning' }) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(200)
  const type = SESSION_TYPES.find((t) => t.id === sessionType) ?? SESSION_TYPES[0]
  const actor = getActor()
  const s = {
    id: `SES-${seq++}`, class: cls, section: sectionOf(cls), instituteId: INSTITUTE_ID, date: today(), sessionType, startTime: type.time, endTime: null,
    teacher: actor.name, teacherId: actor.id ?? null, status: 'draft',
    students: roster(cls).map((st) => ({ studentId: st.id, name: st.name, result: null, confidence: null, method: null, recognitionStatus: RECOGNITION_STATUS.NOT_AVAILABLE, source: null, reviewStatus: 'pending' })),
    createdAt: nowISO(), submittedAt: null,
  }
  sessions = [s, ...sessions]
  recordAudit('ATTENDANCE_SESSION_CREATED', { entityId: s.id, metadata: { class: cls, session: type.label } })
  return decorate(s)
}

export async function startAttendanceSession(id) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(150)
  const s = sessions.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Session ${id} not found`)
  s.status = 'in-progress'
  recordAudit('ATTENDANCE_STARTED', { entityId: id, metadata: { class: s.class } })
  return decorate(s)
}

/**
 * Run face recognition against the class roster (assist). Demo: produces
 * realistic per-student confidences plus a couple of absences and one
 * unknown/low-confidence case. The provider + vault do the real matching in
 * production; this service only ever sees id + result + confidence.
 */
export async function runRecognition(id) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(600)
  const s = sessions.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Session ${id} not found`)
  const n = s.students.length
  // Every student goes through the RecognitionProvider facade. Detection is a
  // separate step: NO_FACE / MULTIPLE_FACES / LOW_CONFIDENCE / NOT_MATCHED all
  // route to human review — attendance is never auto-marked from detection.
  s.students = await Promise.all(s.students.map(async (st, i) => {
    // Absent = an enrolled student never seen during the session (no run).
    if (i === n - 1) {
      return { ...st, result: 'absent', confidence: null, method: 'face', recognitionStatus: RECOGNITION_STATUS.NOT_AVAILABLE, source: ATTENDANCE_SOURCE.MOCK_DEMO, timestamp: nowISO(), original: 'absent', reviewStatus: 'auto' }
    }
    // Demo scenarios exercise each detection/recognition outcome across a class.
    const scenario = i === n - 2 ? 'no-face' : i === Math.floor(n / 2) ? 'multiple' : i === 1 ? 'low-confidence' : 'match'
    const rec = await recognizeFace(null, { scenario, identityToken: st.studentId })
    const needsReview = REVIEW_RECOGNITION.includes(rec.recognitionStatus)
    const result = rec.recognitionStatus === RECOGNITION_STATUS.MATCHED ? 'present' : 'unknown'
    return {
      ...st,
      result,
      confidence: rec.confidence,
      method: 'face',
      recognitionStatus: rec.recognitionStatus,
      source: rec.source,
      timestamp: rec.timestamp,
      faceCount: rec.faceCount,
      original: result,
      reviewStatus: needsReview ? 'pending' : 'auto',
    }
  }))
  s.status = 'review'
  const c = counts(s.students)
  recordAudit('FACE_MATCH_RESULT', { entityId: id, metadata: { class: s.class, present: c.present, absent: c.absent, review: c.unknown, mode: RECOGNITION_MODE } })
  return decorate(s)
}

/** Teacher correction — original preserved, reason required for AI overrides. */
export async function correctResult(id, studentId, newResult, reason) {
  requirePermission(PERMISSIONS.ATTENDANCE_CORRECT)
  await delay(150)
  const s = sessions.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Session ${id} not found`)
  if (s.status === 'submitted') {
    throw new Error('This session is submitted and locked. Submitted attendance cannot be edited directly — raise a correction request.')
  }
  const st = s.students.find((x) => x.studentId === studentId)
  if (!st) throw new NotFoundError(`Student ${studentId} not in session`)
  const from = st.result
  const wasAiResult = st.method === 'face' && !st.corrected
  if (wasAiResult && from !== newResult && !reason?.trim()) {
    throw new Error('Please give a reason when changing an AI recognition result.')
  }
  st.result = newResult
  st.corrected = true
  st.source = ATTENDANCE_SOURCE.MANUAL
  st.reviewStatus = 'resolved'
  st.teacherOverride = true
  st.teacherOverrideReason = reason?.trim() || 'Teacher review'
  st.correction = { previousValue: from, newValue: newResult, reason: reason?.trim() || 'Teacher review', changedBy: getActor().name, changedAt: nowISO(), role: getActor().role }
  recordAudit('ATTENDANCE_CORRECTED', { entityId: id, metadata: { student: st.name, from, to: newResult, reason: reason?.trim() || undefined } })
  return decorate(s)
}

/** Resolve an unknown recognition to present/absent (counts as a correction). */
export async function resolveUnknown(id, studentId, result, reason) {
  return correctResult(id, studentId, result, reason || 'Resolved unknown recognition')
}

/** Submit attendance. Refuses while unresolved unknowns remain unless override. */
export async function submitAttendanceSession(id, { override = false } = {}) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(250)
  const s = sessions.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Session ${id} not found`)
  if (s.status === 'submitted') {
    const err = new Error('This session has already been submitted and is locked.')
    err.alreadySubmitted = true
    throw err
  }
  if (!s.students.length) throw new Error('This session has no students to submit.')
  const unresolved = s.students.filter((x) => x.result === 'unknown').length
  if (unresolved > 0 && !override) {
    const err = new Error(`${unresolved} unresolved case(s) remain. Resolve them or use an authorised override.`)
    err.unresolved = unresolved
    throw err
  }
  s.status = 'submitted'
  s.submittedAt = nowISO()
  s.endTime = new Date().toTimeString().slice(0, 5)
  s.overrideUsed = unresolved > 0 && override
  const c = counts(s.students)
  recordAudit('ATTENDANCE_SUBMITTED', { entityId: id, metadata: { class: s.class, present: c.present, absent: c.absent, unresolved, override: s.overrideUsed || undefined } })
  return decorate(s)
}

// --- monitoring (Department) ----------------------------------------------
/** Per-class attendance overview with a monitoring status. */
export async function getAttendanceMonitoring() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(150)
  const t = today()
  const byClass = CLASSES.map((cls) => {
    const submittedToday = sessions.find((s) => s.class === cls && s.date === t && s.status === 'submitted')
    const recent = sessions.filter((s) => s.class === cls && s.status === 'submitted').slice(0, 5)
    const rate = submittedToday ? pct(submittedToday.students) : (recent.length ? Math.round(recent.reduce((n, s) => n + pct(s.students), 0) / recent.length) : 0)
    const status = rate >= 85 ? 'Normal' : rate >= 78 ? 'Watch' : 'Requires Review'
    return { class: cls, attendancePct: rate, status, pendingSubmission: !submittedToday, students: roster(cls).length }
  })
  const pending = byClass.filter((c) => c.pendingSubmission).length
  return {
    byClass,
    pendingSubmissions: pending,
    overallPct: byClass.length ? Math.round(byClass.reduce((n, c) => n + c.attendancePct, 0) / byClass.length) : 0,
    lowAttendanceClasses: byClass.filter((c) => c.status !== 'Normal').length,
  }
}

/**
 * Advisory AI insights over submitted attendance (spec §12). These are
 * INDICATORS ONLY — never a claim that fraud occurred. Every insight is tagged
 * `advisory: true` so the UI can attach the "requires human verification"
 * disclaimer. Transparent, explainable maths (means/deltas), not a black box.
 */
export async function getAttendanceInsights() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(160)
  const submitted = sessions.filter((s) => s.status === 'submitted')
  const insights = []

  // 7-day trend: newest submitted per class vs its prior 7-day average.
  for (const cls of CLASSES) {
    const rows = submitted.filter((s) => s.class === cls).sort((a, b) => b.date.localeCompare(a.date))
    if (rows.length < 3) continue
    const latest = pct(rows[0].students)
    const prior = rows.slice(1, 8)
    const avg = Math.round(prior.reduce((n, s) => n + pct(s.students), 0) / prior.length)
    const delta = latest - avg
    if (delta <= -12) insights.push({ id: `INS-${cls}-drop`, type: 'trend-down', severity: 'high', message: `${cls}: attendance fell ${Math.abs(delta)}% vs its 7-day average (${avg}% → ${latest}%).` })
    else if (delta >= 15) insights.push({ id: `INS-${cls}-spike`, type: 'trend-up', severity: 'medium', message: `${cls}: unusually high attendance — ${delta}% above its 7-day average (${avg}% → ${latest}%).` })
  }

  // Low-attendance classes (below threshold on the latest submitted session).
  const mon = CLASSES.map((cls) => {
    const latest = submitted.filter((s) => s.class === cls).sort((a, b) => b.date.localeCompare(a.date))[0]
    return { class: cls, pct: latest ? pct(latest.students) : null }
  }).filter((c) => c.pct != null && c.pct < 78)
  if (mon.length) insights.push({ id: 'INS-low', type: 'low-attendance', severity: 'medium', message: `${mon.length} class(es) below the 78% threshold: ${mon.map((c) => `${c.class} (${c.pct}%)`).join(', ')}.` })

  // Repeated-absence pattern: students absent in most of their recent sessions.
  const perStudent = {}
  for (const s of submitted) for (const st of s.students) {
    const rec = perStudent[st.studentId] ?? { name: st.name, total: 0, absent: 0 }
    rec.total++; if (st.result === 'absent') rec.absent++
    perStudent[st.studentId] = rec
  }
  const chronic = Object.values(perStudent).filter((r) => r.total >= 4 && r.absent / r.total >= 0.5)
  if (chronic.length) insights.push({ id: 'INS-chronic', type: 'repeated-absence', severity: 'medium', message: `Repeated-absence pattern for ${chronic.length} student(s) (absent in ≥50% of recent sessions).` })

  return {
    insights: insights.map((i) => ({ ...i, advisory: true })),
    disclaimer: 'AI-generated indicator — requires human verification. These signals do not by themselves prove any wrongdoing.',
    generatedAt: nowISO(),
  }
}

// --- student attendance profile -------------------------------------------
export async function getStudentAttendanceProfile(studentId) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay()
  const rows = sessions
    .filter((s) => s.students.some((x) => x.studentId === studentId))
    .map((s) => {
      const st = s.students.find((x) => x.studentId === studentId)
      return { sessionId: s.id, date: s.date, sessionType: s.sessionType, result: st.result, method: st.corrected ? 'teacher-corrected' : 'face-recognition', status: s.status }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
  const present = rows.filter((r) => r.result === 'present').length
  const last7 = rows.slice(0, 7)
  const last30 = rows.slice(0, 30)
  const rate = (arr) => (arr.length ? Math.round((arr.filter((r) => r.result === 'present').length / arr.length) * 100) : 0)
  return { history: rows, todayResult: rows.find((r) => r.date === today())?.result ?? '—', weekPct: rate(last7), monthPct: rate(last30), overallPct: rows.length ? Math.round((present / rows.length) * 100) : 0 }
}

// --- inspector verification -----------------------------------------------
const findings = []

/**
 * Inspector records an independent attendance verification finding. This never
 * modifies institutional attendance — it captures reported vs observed and is
 * attached to the inspection for departmental review.
 */
export async function recordVerificationFinding({ inspectionId, cls, reportedPct, observedPct, note }) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(200)
  const discrepancy = Math.abs((reportedPct ?? 0) - (observedPct ?? 0))
  const finding = {
    id: `AVF-${findings.length + 1}`,
    inspectionId: inspectionId ?? null,
    class: cls ?? null,
    reportedPct, observedPct, discrepancy,
    note: note?.trim() || (discrepancy >= 10 ? 'Attendance reported by institution differs from inspection observation.' : 'Attendance consistent with inspection observation.'),
    by: getActor().name, role: getActor().role, at: nowISO(),
  }
  findings.unshift(finding)
  recordAudit('ATTENDANCE_VERIFICATION_FINDING', { entityId: inspectionId ?? finding.id, metadata: { class: cls, reported: `${reportedPct}%`, observed: `${observedPct}%`, discrepancy: `${discrepancy}%` } })
  return finding
}

export async function listVerificationFindings() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(100)
  return { items: [...findings] }
}

/** Low-attendance students for institution alerts (threshold configurable). */
export async function getLowAttendanceStudents(threshold = 75) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(120)
  const low = INSTITUTION_STUDENTS.filter((s) => s.status === 'active' && s.attendancePct < threshold)
    .map((s) => ({ id: s.id, name: s.name, class: s.class, attendancePct: s.attendancePct, threshold }))
    .sort((a, b) => a.attendancePct - b.attendancePct)
  return { items: low, threshold }
}
