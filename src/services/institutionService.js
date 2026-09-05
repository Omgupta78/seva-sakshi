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
import { INSTITUTION_STUDENTS, TODAYS_ATTENDANCE, ATTENTION_ITEMS, CLASSES } from '../data/institutionData.js'

let students = INSTITUTION_STUDENTS.map((s) => ({ ...s }))

export { CLASSES }

export async function getInstitutionSummary() {
  requirePermission(PERMISSIONS.VIEW_ATTENDANCE)
  await delay(120)
  const active = students.filter((s) => s.status === 'active')
  const totalPresentToday = TODAYS_ATTENDANCE.reduce((n, c) => n + c.present, 0)
  const totalToday = TODAYS_ATTENDANCE.reduce((n, c) => n + c.total, 0)
  const avgPct = active.length ? Math.round(active.reduce((n, s) => n + s.attendancePct, 0) / active.length) : 0
  return {
    totalStudents: students.length,
    presentToday: totalPresentToday,
    attendancePct: totalToday ? Math.round((totalPresentToday / totalToday) * 100) : 0,
    avgAttendancePct: avgPct,
    pendingReviews: ATTENTION_ITEMS.length,
    faceEnrolled: students.filter((s) => s.faceEnrolled).length,
  }
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
  if (!input.name?.trim()) { const e = new Error('Validation failed'); e.fieldErrors = { name: 'Name is required.' }; throw e }
  if (!input.class) { const e = new Error('Validation failed'); e.fieldErrors = { class: 'Class is required.' }; throw e }
  const id = `STU-${1001 + students.length}`
  const record = { id, name: input.name.trim(), class: input.class, rollNo: input.rollNo || '—', status: 'active', faceEnrolled: false, attendancePct: 0, guardianPhone: input.guardianPhone || '' }
  students = [record, ...students]
  recordAudit('CREATE_PROJECT', { entityId: id, entity: 'Beneficiary', metadata: { name: record.name, class: record.class } })
  return record
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
