/**
 * ---------------------------------------------------------------------
 * INSTITUTION SERVICE — the institution's operational reads (guarded)
 * ---------------------------------------------------------------------
 * Same demo-service pattern as the rest of the app. Reads are gated by
 * VIEW_ATTENDANCE so only institution roles (or Super Admin) can call them.
 * In production these are the shared attendance endpoints scoped to the
 * caller's institution id from the session.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { requirePermission } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'
import { record as recordAudit } from './auditService.js'
import { loadModels, detectFaces, alignFace, computeEmbedding, PROVIDER_INFO } from './faceRecognitionProvider.js'
import { enroll as vaultEnroll, getEnrollmentMeta } from './biometricVault.js'
import { INSTITUTION_STUDENTS, TODAYS_ATTENDANCE, ATTENTION_ITEMS, CLASSES, INSTITUTION_PROFILE, INSTITUTION_STAFF, INSTITUTION_DOCUMENTS, UPCOMING_INSPECTION, READINESS_CHECKLIST } from '../data/institutionData.js'

export { PROVIDER_INFO }

let students = INSTITUTION_STUDENTS.map((s) => ({ ...s }))

export { CLASSES }

export async function getInstitutionSummary() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(120)
  const active = students.filter((s) => s.status === 'active')
  const totalPresentToday = TODAYS_ATTENDANCE.reduce((n, c) => n + c.present, 0)
  const totalToday = TODAYS_ATTENDANCE.reduce((n, c) => n + c.total, 0)
  const avgPct = active.length ? Math.round(active.reduce((n, s) => n + s.attendancePct, 0) / active.length) : 0
  const pendingDocs = INSTITUTION_DOCUMENTS.filter((d) => d.required && d.status !== 'verified').length
  return {
    totalStudents: students.length,
    presentToday: totalPresentToday,
    absentToday: Math.max(0, totalToday - totalPresentToday),
    attendancePct: totalToday ? Math.round((totalPresentToday / totalToday) * 100) : 0,
    avgAttendancePct: avgPct,
    pendingReviews: ATTENTION_ITEMS.length,
    faceEnrolled: students.filter((s) => s.faceEnrolled).length,
    pendingDocuments: pendingDocs,
    alerts: ATTENTION_ITEMS.filter((a) => a.severity === 'warn').length,
    upcomingInspection: UPCOMING_INSPECTION,
  }
}

export async function getInstitutionProfile() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(110)
  const active = students.filter((s) => s.status === 'active').length
  return { ...INSTITUTION_PROFILE, activeStudents: active, totalStudents: students.length, staffCount: INSTITUTION_STAFF.filter((s) => s.status === 'active').length }
}

export async function listInstitutionStaff() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(120)
  return { items: INSTITUTION_STAFF.map((s) => ({ ...s })), total: INSTITUTION_STAFF.length }
}

export async function listInstitutionDocuments() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(120)
  return { items: INSTITUTION_DOCUMENTS.map((d) => ({ ...d })), total: INSTITUTION_DOCUMENTS.length }
}

export async function getInspectionReadiness() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(120)
  const items = READINESS_CHECKLIST.map((c) => ({ ...c }))
  const done = items.filter((c) => c.done).length
  return { items, done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0, upcoming: UPCOMING_INSPECTION }
}

export async function getTodaysAttendance() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(120)
  return { items: TODAYS_ATTENDANCE }
}

export async function getAttentionItems() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(100)
  return { items: ATTENTION_ITEMS }
}

export async function listInstitutionStudents(params = {}) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay()
  const { search = '', cls = 'all', status = 'all' } = params
  let rows = students.map((s) => ({ ...s }))
  const q = search.trim().toLowerCase()
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
  if (cls !== 'all') rows = rows.filter((r) => r.class === cls)
  if (status !== 'all') rows = rows.filter((r) => r.status === status)
  rows.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
  return { items: rows, total: rows.length }
}

export async function getInstitutionStudent(id) {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay()
  const s = students.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Student ${id} not found`)
  // Synthesise a short attendance history (no biometric data exposed).
  const history = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().slice(0, 10), present: (s.attendancePct + i * 3) % 100 > 20 }
  })
  return { ...s, history }
}

export async function addInstitutionStudent(input) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await delay()
  const fieldErrors = {}
  if (!input.name?.trim()) fieldErrors.name = 'Name is required.'
  if (!input.class) fieldErrors.class = 'Class is required.'
  if (!input.section?.trim()) fieldErrors.section = 'Section is required.'
  if (!input.rollNo?.trim()) fieldErrors.rollNo = 'Roll number is required.'
  const wantedId = input.id?.trim()
  if (wantedId && students.some((x) => x.id.toLowerCase() === wantedId.toLowerCase())) {
    fieldErrors.id = `Student ID "${wantedId}" already exists.`
  }
  if (input.contact?.trim() && !/^[+\d][\d\s-]{6,}$/.test(input.contact.trim())) {
    fieldErrors.contact = 'Enter a valid contact number.'
  }
  if (Object.keys(fieldErrors).length) { const e = new Error('Validation failed'); e.fieldErrors = fieldErrors; throw e }

  // Auto-generate a non-colliding id when one wasn't supplied.
  let id = wantedId
  if (!id) { let n = 1001 + students.length; while (students.some((x) => x.id === `STU-${n}`)) n++; id = `STU-${n}` }
  const record = {
    id, name: input.name.trim(), class: input.class, section: input.section.trim(), rollNo: input.rollNo.trim(),
    dob: input.dob || '', gender: input.gender || '', guardianName: input.guardianName?.trim() || '',
    contact: input.contact?.trim() || '', photo: null,
    status: 'active', faceStatus: 'not_enrolled', faceEnrolled: false, attendancePct: 0,
  }
  students = [record, ...students]
  recordAudit('STUDENT_CREATED', { entityId: id, entity: 'Student', metadata: { name: record.name, class: record.class } })
  return { ...record }
}

/** Edit an existing student. Only roster/profile fields — never biometric data. */
export async function updateInstitutionStudent(id, patch) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await delay(150)
  const s = students.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Student ${id} not found`)
  const fieldErrors = {}
  if (patch.name != null && !patch.name.trim()) fieldErrors.name = 'Name is required.'
  if (patch.section != null && !patch.section.trim()) fieldErrors.section = 'Section is required.'
  if (patch.rollNo != null && !patch.rollNo.trim()) fieldErrors.rollNo = 'Roll number is required.'
  if (patch.contact?.trim() && !/^[+\d][\d\s-]{6,}$/.test(patch.contact.trim())) fieldErrors.contact = 'Enter a valid contact number.'
  if (Object.keys(fieldErrors).length) { const e = new Error('Validation failed'); e.fieldErrors = fieldErrors; throw e }
  const allowed = ['name', 'class', 'section', 'rollNo', 'dob', 'gender', 'guardianName', 'contact']
  for (const k of allowed) if (patch[k] != null) s[k] = typeof patch[k] === 'string' ? patch[k].trim() : patch[k]
  recordAudit('STUDENT_UPDATED', { entityId: id, metadata: { name: s.name, class: s.class } })
  return { ...s }
}

/**
 * Prototype face enrolment. Captured samples are turned into embeddings by the
 * (currently simulated) recognition provider and handed STRAIGHT to the
 * biometric vault — no embedding is ever returned to the caller or the UI.
 * Only a status flag + non-biometric metadata come back.
 */
export async function enrollStudentFace(id, { samples = 3 } = {}) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await delay(250)
  const s = students.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Student ${id} not found`)
  await loadModels()
  const embeddings = []
  for (let i = 0; i < samples; i++) {
    const det = detectFaces(null, { scenario: 'one', identityToken: id })[0]
    if (!det) { const e = new Error('No face detected — please try again in better light.'); e.code = 'NO_FACE'; throw e }
    embeddings.push(computeEmbedding(alignFace(det), { identityToken: id, sampleIndex: i }))
  }
  vaultEnroll(id, embeddings) // embeddings never leave the vault boundary
  s.faceStatus = 'enrolled'
  s.faceEnrolled = true
  recordAudit('FACE_ENROLLED', { entityId: id, metadata: { name: s.name, samples } })
  return { student: { ...s }, enrollment: getEnrollmentMeta(id) } // meta only, no templates
}

/** Update a student's face-enrolment status flag (no embeddings pass through here). */
export async function setStudentFaceStatus(id, faceStatus) {
  requirePermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  await delay(150)
  const s = students.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Student ${id} not found`)
  s.faceStatus = faceStatus
  s.faceEnrolled = faceStatus === 'enrolled'
  recordAudit('FACE_ENROLLMENT_STATUS', { entityId: id, metadata: { name: s.name, status: faceStatus } })
  return { ...s }
}

export async function setInstitutionStudentStatus(id, status) {
  requirePermission(PERMISSIONS.STUDENT_DEACTIVATE)
  await delay(150)
  const s = students.find((x) => x.id === id)
  if (!s) throw new NotFoundError(`Student ${id} not found`)
  s.status = status
  recordAudit(status === 'active' ? 'STUDENT_REACTIVATED' : 'STUDENT_DEACTIVATED', { entityId: id, metadata: { name: s.name } })
  return { ...s }
}
