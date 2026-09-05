/**
 * ---------------------------------------------------------------------
 * ATTENDANCE SERVICE — profiles, enrolment, sessions, recognition, records
 * ---------------------------------------------------------------------
 * Orchestrates the module over in-memory stores (swap each body for fetch()).
 * It is the ONLY place that touches the recognition provider and the
 * biometric vault, and it is careful never to hand a raw embedding back to a
 * caller: enrolment samples are embedded and buffered internally, matching
 * returns an id + score only. Face recognition is treated throughout as an
 * ASSISTANCE aid — results carry a score and can be Unknown, and the officer
 * makes the final call.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { PROJECTS, ORGANIZATIONS, LOCATIONS } from '../data/projectsSeedData.js'
import { STUDENT_SEED, SESSION_SEED } from '../data/attendanceSeedData.js'
import { ATTENDANCE_CONFIG, validateStudentProfile, validateSession } from '../data/attendanceModels.js'
import { loadModels, detectFaces, alignFace, computeEmbedding } from './faceRecognitionProvider.js'
import * as vault from './biometricVault.js'
import { requirePermission } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'

// --- in-memory stores -----------------------------------------------------
let students = []
let sessions = []
let records = []
let studentSeq = 5007
let sessionSeq = 9002
let recordSeq = 1

/** Transient per-student enrolment buffers — embeddings held here only until
 *  finalised into the vault, and never returned to a caller. */
const enrollmentBuffers = new Map()

function resolveProjectName(projectId) {
  const p = PROJECTS.find((x) => x.id === projectId)
  if (!p) return { projectName: 'Unknown project', organizationId: null, organizationName: 'Unknown', district: '—' }
  const org = ORGANIZATIONS.find((o) => o.id === p.organizationId)
  const loc = LOCATIONS.find((l) => l.id === p.locationId)
  return { projectName: p.name, organizationId: org?.id ?? null, organizationName: org?.name ?? 'Unknown', district: loc?.district ?? '—' }
}

function decorateStudent(s) {
  const meta = vault.getEnrollmentMeta(s.id)
  return {
    ...s,
    ...resolveProjectName(s.projectId),
    enrollment: meta.status, // 'not-enrolled' | 'enrolled' | 'deactivated'
    sampleCount: meta.sampleCount,
    enrolledAt: meta.enrolledAt,
  }
}

// --- seeding --------------------------------------------------------------
// Guard with a shared promise (not a boolean) so concurrent first calls all
// await the SAME seeding run rather than racing past a half-set flag.
let seedPromise = null
function ensureSeed() {
  if (!seedPromise) seedPromise = doSeed()
  return seedPromise
}
async function doSeed() {
  await loadModels()
  students = STUDENT_SEED.map((s) => ({
    id: s.id,
    name: s.name,
    projectId: s.projectId,
    organizationId: resolveProjectName(s.projectId).organizationId,
    department: s.department,
    status: s.status,
    createdAt: new Date().toISOString(),
  }))
  // Pre-enrol flagged students by generating templates through the provider
  // (identity token = student id, so they later match themselves).
  for (const s of STUDENT_SEED.filter((x) => x.preEnrolled)) {
    const embeddings = []
    for (let i = 0; i < ATTENDANCE_CONFIG.samplesRequired; i++) {
      const det = detectFaces(null, { scenario: 'one', identityToken: s.id })[0]
      embeddings.push(computeEmbedding(alignFace(det), { identityToken: s.id, sampleIndex: i }))
    }
    vault.enroll(s.id, embeddings)
  }
  sessions = SESSION_SEED.map((x) => ({ ...x, ...resolveProjectName(x.projectId), createdAt: new Date().toISOString() }))
}

// --- config ---------------------------------------------------------------
export async function getAttendanceConfig() {
  await delay(80)
  return { ...ATTENDANCE_CONFIG }
}

// --- students / profiles --------------------------------------------------
export async function listStudents(params = {}) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await ensureSeed()
  await delay()
  const { search = '', projectId = 'all', status = 'all', enrollment = 'all' } = params
  let rows = students.map(decorateStudent)
  const q = search.trim().toLowerCase()
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
  if (projectId !== 'all') rows = rows.filter((r) => r.projectId === projectId)
  if (status !== 'all') rows = rows.filter((r) => r.status === status)
  if (enrollment !== 'all') rows = rows.filter((r) => r.enrollment === enrollment)
  return { items: rows, total: rows.length }
}

export async function getStudent(id) {
  await ensureSeed()
  await delay()
  const s = students.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Student ${id} not found`)
  return decorateStudent(s)
}

export async function createStudent(input) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await ensureSeed()
  await delay()
  const errors = validateStudentProfile(input)
  if (Object.keys(errors).length) {
    const err = new Error('Validation failed')
    err.fieldErrors = errors
    throw err
  }
  const { organizationId } = resolveProjectName(input.projectId)
  const record = {
    id: input.id?.trim() || `BEN-${studentSeq++}`,
    name: input.name.trim(),
    projectId: input.projectId,
    organizationId,
    department: input.department,
    status: input.status || 'active',
    createdAt: new Date().toISOString(),
  }
  if (students.some((s) => s.id === record.id)) {
    const err = new Error('Validation failed')
    err.fieldErrors = { id: 'A beneficiary with this ID already exists.' }
    throw err
  }
  students = [record, ...students]
  return decorateStudent(record)
}

export async function setStudentStatus(id, status) {
  await ensureSeed()
  await delay()
  const s = students.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Student ${id} not found`)
  s.status = status
  return decorateStudent(s)
}

// --- enrolment (biometric) ------------------------------------------------
/** Begin/restart an enrolment capture buffer for a student. */
export async function startEnrollment(studentId) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await ensureSeed()
  await loadModels()
  enrollmentBuffers.set(studentId, [])
  return { collected: 0, required: ATTENDANCE_CONFIG.samplesRequired }
}

/**
 * Evaluate a captured frame and, if it is a single good-quality face, buffer
 * its embedding. Returns ONLY capture validity/metadata — never the embedding.
 * @param {string} studentId
 * @param {{scenario?: string}} frameOpts drives the demo detector
 */
export async function captureEnrollmentSample(studentId, frameOpts = {}) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await delay(160)
  const buf = enrollmentBuffers.get(studentId)
  if (!buf) throw new Error('Enrolment not started.')

  const faces = detectFaces(null, { scenario: frameOpts.scenario ?? 'one', identityToken: studentId })
  if (faces.length === 0) return capResult(buf, { ok: false, faceCount: 0, reason: 'No face detected. Position the face in the frame.' })
  if (faces.length > 1) return capResult(buf, { ok: false, faceCount: faces.length, reason: 'Multiple faces detected. Only one person may enrol at a time.' })

  const face = faces[0]
  if (face.quality < ATTENDANCE_CONFIG.minSampleQuality) {
    return capResult(buf, { ok: false, faceCount: 1, quality: face.quality, reason: 'Image quality too low (blur / lighting). Try again.' })
  }

  const embedding = computeEmbedding(alignFace(face), { identityToken: studentId, sampleIndex: buf.length })
  buf.push(embedding)
  return capResult(buf, { ok: true, faceCount: 1, quality: face.quality })
}

function capResult(buf, extra) {
  return { collected: buf.length, required: ATTENDANCE_CONFIG.samplesRequired, ...extra }
}

/** Finalise: write buffered templates to the vault. */
export async function finalizeEnrollment(studentId) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await delay(220)
  const buf = enrollmentBuffers.get(studentId)
  if (!buf || buf.length < ATTENDANCE_CONFIG.samplesRequired) {
    throw new Error(`Need ${ATTENDANCE_CONFIG.samplesRequired} good samples before enrolling.`)
  }
  const meta = vault.enroll(studentId, buf)
  enrollmentBuffers.delete(studentId)
  return { studentId, status: meta.status, sampleCount: meta.sampleCount, enrolledAt: meta.enrolledAt }
}

export async function cancelEnrollment(studentId) {
  enrollmentBuffers.delete(studentId)
  return { ok: true }
}

export async function deactivateEnrollment(studentId) {
  await delay(150)
  return vault.deactivate(studentId)
}
export async function reactivateEnrollment(studentId) {
  await delay(150)
  return vault.reactivate(studentId)
}
export async function deleteEnrollment(studentId) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await delay(150)
  return vault.deleteEnrollment(studentId)
}

// --- live recognition -----------------------------------------------------
/**
 * Run one recognition pass over a frame. Returns id + score + status only.
 * Never returns an embedding. Unknown faces stay Unknown.
 * @param {{scenario?: string, identityToken?: string, threshold?: number}} opts
 *        In demo mode `identityToken` says who is "in front of the camera".
 */
export async function recognizeFrame(opts = {}) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await ensureSeed()
  await delay(200)
  const scenario = opts.scenario ?? 'one'
  const faces = detectFaces(null, { scenario, identityToken: opts.identityToken ?? null })

  if (faces.length === 0) return { status: 'no-face' }
  if (faces.length > 1) return { status: 'multiple-faces', faceCount: faces.length }
  const face = faces[0]
  if (face.quality < ATTENDANCE_CONFIG.minSampleQuality) return { status: 'low-quality', quality: face.quality }

  const embedding = computeEmbedding(alignFace(face), { identityToken: opts.identityToken ?? `anon-${Date.now()}` })
  const threshold = opts.threshold ?? ATTENDANCE_CONFIG.matchThreshold
  const match = vault.matchEmbedding(embedding, threshold)

  if (!match.studentId) return { status: 'unknown', matchScore: match.score, quality: face.quality, threshold }

  const s = students.find((x) => x.id === match.studentId)
  return {
    status: 'recognized',
    studentId: match.studentId,
    studentName: s?.name ?? match.studentId,
    matchScore: match.score,
    quality: face.quality,
    threshold,
  }
}

// --- sessions -------------------------------------------------------------
export async function listSessions() {
  await ensureSeed()
  await delay()
  const withCounts = sessions.map((s) => ({ ...s, presentCount: records.filter((r) => r.sessionId === s.id && r.status === 'present').length }))
  return { items: withCounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }
}

export async function getSession(id) {
  await ensureSeed()
  await delay()
  const s = sessions.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Session ${id} not found`)
  return { ...s, presentCount: records.filter((r) => r.sessionId === s.id && r.status === 'present').length }
}

export async function createSession(input, officer) {
  await ensureSeed()
  await delay()
  const errors = validateSession(input)
  if (Object.keys(errors).length) {
    const err = new Error('Validation failed')
    err.fieldErrors = errors
    throw err
  }
  const record = {
    id: `SES-${sessionSeq++}`,
    subject: input.subject,
    projectId: input.projectId,
    ...resolveProjectName(input.projectId),
    date: input.date,
    startTime: input.startTime || new Date().toTimeString().slice(0, 5),
    endTime: '',
    officerId: officer?.id ?? 'OFFICER',
    officerName: officer?.name ?? 'Authorised Officer',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  sessions = [record, ...sessions]
  return record
}

export async function closeSession(id) {
  await ensureSeed()
  await delay()
  const s = sessions.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Session ${id} not found`)
  s.status = 'closed'
  s.endTime = new Date().toTimeString().slice(0, 5)
  return s
}

// --- attendance records ---------------------------------------------------
/**
 * Mark a recognised student present in a session. Enforces one record per
 * student per session (duplicate prevention). Unknown faces must not reach
 * here — the caller only marks confirmed candidates.
 */
export async function markAttendance(sessionId, { studentId, matchScore, officerId }) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await ensureSeed()
  await delay(150)
  const session = sessions.find((x) => x.id === sessionId)
  if (!session) throw new NotFoundError(`Session ${sessionId} not found`)
  if (!studentId) throw new Error('Cannot mark attendance without an identified student.')

  const existing = records.find((r) => r.sessionId === sessionId && r.studentId === studentId)
  if (existing) return { duplicate: true, record: existing }

  const s = students.find((x) => x.id === studentId)
  const now = new Date()
  const record = {
    id: `ATT-${String(recordSeq++).padStart(4, '0')}`,
    studentId,
    studentName: s?.name ?? studentId,
    sessionId,
    date: session.date,
    time: now.toTimeString().slice(0, 8),
    status: 'present',
    matchScore: matchScore ?? null,
    officerId: officerId ?? session.officerId,
  }
  records = [record, ...records]
  return { duplicate: false, record }
}

export async function listRecords(sessionId) {
  await ensureSeed()
  await delay()
  const items = records.filter((r) => !sessionId || r.sessionId === sessionId)
  return { items: [...items] }
}

/** Non-biometric aggregates for the hub KPIs. */
export async function getAttendanceStats() {
  await ensureSeed()
  await delay(120)
  const today = new Date().toISOString().slice(0, 10)
  return {
    students: students.length,
    enrolled: vault.enrolledCount(),
    activeSessions: sessions.filter((s) => s.status === 'active').length,
    presentToday: records.filter((r) => r.date === today && r.status === 'present').length,
  }
}
