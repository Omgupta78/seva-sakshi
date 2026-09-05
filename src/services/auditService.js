/**
 * ---------------------------------------------------------------------
 * AUDIT SERVICE — centralized, append-only activity log
 * ---------------------------------------------------------------------
 * Every important administrative action is recorded here with who did it,
 * their role, the action, the entity + id, a timestamp, device info, the
 * result, and safe metadata. Design points:
 *
 *   - APPEND-ONLY at the application layer: this module exposes `record()`
 *     (append) and read/list only. There is no update or delete export, so
 *     application code cannot rewrite history. (A real backend would also
 *     make the underlying table insert-only / WORM.)
 *   - NO SENSITIVE DATA: metadata is sanitized to strip anything that looks
 *     like a password, token, or biometric template/embedding before it is
 *     stored. Biometrics are referenced by id/count only, never by value.
 *   - Actor is taken from the authorization context (authz.getActor()), the
 *     same session the service tier already trusts.
 *   - Reads are restricted to VIEW_AUDIT_LOGS (Super Admin); recording is
 *     never blocked by the actor's permissions — all actions must be logged.
 * ---------------------------------------------------------------------
 */
import { delay } from './apiClient.js'
import { getActor, requirePermission } from './authz.js'
import { PERMISSIONS, ROLE_LABELS } from '../data/rbac.js'

/** action key → { label, entity } */
export const ACTION_META = {
  VIEW_PROJECT: { label: 'Viewed project', entity: 'Project' },
  CREATE_PROJECT: { label: 'Created project', entity: 'Project' },
  EDIT_PROJECT: { label: 'Edited project', entity: 'Project' },
  ASSIGN_INSPECTION: { label: 'Assigned inspection', entity: 'Inspection' },
  CHANGE_INSPECTION_ASSIGNMENT: { label: 'Changed inspection assignment', entity: 'Inspection' },
  CREATE_INSPECTION: { label: 'Created inspection', entity: 'Inspection' },
  START_INSPECTION: { label: 'Started inspection', entity: 'Inspection' },
  UPLOAD_EVIDENCE: { label: 'Uploaded evidence', entity: 'Inspection' },
  SUBMIT_INSPECTION: { label: 'Submitted inspection report', entity: 'Inspection' },
  REVIEW_INSPECTION: { label: 'Reviewed & closed inspection', entity: 'Inspection' },
  REVIEW_ANOMALY: { label: 'Reviewed anomaly', entity: 'Anomaly Alert' },
  RESOLVE_ANOMALY: { label: 'Resolved anomaly', entity: 'Anomaly Alert' },
  DISMISS_ANOMALY: { label: 'Dismissed anomaly', entity: 'Anomaly Alert' },
  CREATE_ATTENDANCE_SESSION: { label: 'Created attendance session', entity: 'Attendance Session' },
  MARK_ATTENDANCE: { label: 'Marked attendance', entity: 'Attendance Session' },
  BIOMETRIC_ENROLLED: { label: 'Biometric enrollment created', entity: 'Biometric' },
  BIOMETRIC_DEACTIVATED: { label: 'Biometric enrollment deactivated', entity: 'Biometric' },
  BIOMETRIC_DELETED: { label: 'Biometric enrollment deleted', entity: 'Biometric' },
  CHANGE_USER_ROLE: { label: 'Changed user role', entity: 'User' },
  CHANGE_USER_STATUS: { label: 'Changed user status', entity: 'User' },
  REQUEST_VIDEO_CALL: { label: 'Requested video call', entity: 'Video Call' },
  // Lifecycle / destructive actions
  PROJECT_ARCHIVED: { label: 'Archived project', entity: 'Project' },
  PROJECT_RESTORED: { label: 'Restored project', entity: 'Project' },
  PROJECT_DELETED: { label: 'Permanently deleted project', entity: 'Project' },
  INSTITUTE_DEACTIVATED: { label: 'Deactivated organization', entity: 'Organization' },
  ORGANIZATION_REACTIVATED: { label: 'Reactivated organization', entity: 'Organization' },
  STUDENT_DEACTIVATED: { label: 'Deactivated beneficiary', entity: 'Beneficiary' },
  STUDENT_REACTIVATED: { label: 'Reactivated beneficiary', entity: 'Beneficiary' },
  BIOMETRIC_ENROLLMENT_REMOVED: { label: 'Removed biometric enrollment', entity: 'Biometric' },
  CAMERA_DECOMMISSIONED: { label: 'Decommissioned camera', entity: 'CCTV Camera' },
  CAMERA_DISABLED: { label: 'Disabled camera', entity: 'CCTV Camera' },
  CAMERA_ENABLED: { label: 'Enabled camera', entity: 'CCTV Camera' },
  INSPECTION_CANCELLED: { label: 'Cancelled inspection', entity: 'Inspection' },
  INSPECTION_ARCHIVED: { label: 'Archived inspection', entity: 'Inspection' },
  ATTENDANCE_CORRECTED: { label: 'Corrected attendance', entity: 'Attendance Session' },
  USER_DEACTIVATED: { label: 'Deactivated user', entity: 'User' },
  USER_ACTIVATED: { label: 'Activated user', entity: 'User' },
  USER_ACCESS_RESET: { label: 'Reset user access', entity: 'User' },
  USER_DELETED: { label: 'Permanently deleted user', entity: 'User' },
  // Session-based attendance lifecycle
  ATTENDANCE_SESSION_CREATED: { label: 'Created attendance session', entity: 'Attendance Session' },
  ATTENDANCE_STARTED: { label: 'Started attendance capture', entity: 'Attendance Session' },
  FACE_MATCH_RESULT: { label: 'Recorded face-match results', entity: 'Attendance Session' },
  ATTENDANCE_CONFIRMED: { label: 'Confirmed attendance result', entity: 'Attendance Session' },
  ATTENDANCE_SUBMITTED: { label: 'Submitted attendance', entity: 'Attendance Session' },
  ATTENDANCE_REOPENED: { label: 'Reopened attendance session', entity: 'Attendance Session' },
  ATTENDANCE_REVIEWED: { label: 'Reviewed attendance', entity: 'Attendance Session' },
  ATTENDANCE_VERIFICATION_FINDING: { label: 'Attendance verification finding', entity: 'Inspection' },
}

export const AUDIT_ENTITIES = [...new Set(Object.values(ACTION_META).map((m) => m.entity))]

const SENSITIVE_KEY = /password|passwd|secret|token|embedding|descriptor|template|biometric|vector|face/i

/** Remove anything sensitive from metadata before it is ever stored. */
function sanitize(metadata) {
  const out = {}
  for (const [k, v] of Object.entries(metadata ?? {})) {
    if (SENSITIVE_KEY.test(k)) continue
    if (typeof v === 'object' && v !== null) continue // no nested blobs in an audit line
    out[k] = v
  }
  return out
}

function deviceInfo() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || ''
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown OS'
  const br = /Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Browser'
  return `${br} on ${os}`
}

let seq = 7000
const store = seedLogs()

/**
 * Append one audit record. Fire-and-forget from call sites (never throws to
 * the caller — logging must not break the primary action).
 * @param {string} action  key in ACTION_META
 * @param {{ entityId?: string, projectId?: string, result?: string, metadata?: object, entity?: string }} [ctx]
 */
export function record(action, ctx = {}) {
  try {
    const meta = ACTION_META[action]
    const actor = getActor()
    store.push({
      id: `AUD-${seq++}`,
      timestamp: new Date().toISOString(),
      userId: actor.id ?? '—',
      userName: actor.name ?? 'Unknown',
      role: actor.role,
      action,
      actionLabel: meta?.label ?? action,
      entity: ctx.entity ?? meta?.entity ?? 'System',
      entityId: ctx.entityId ?? '—',
      projectId: ctx.projectId ?? null,
      result: ctx.result ?? 'success',
      device: deviceInfo(),
      ip: '—', // captured server-side in production; not available client-side
      metadata: sanitize(ctx.metadata),
    })
  } catch {
    /* auditing must never break the primary action */
  }
}

/**
 * List audit records — restricted to VIEW_AUDIT_LOGS. Supports filtering,
 * search and pagination. Newest first.
 */
export async function listAuditLogs(params = {}) {
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS)
  await delay()
  const { user = 'all', role = 'all', action = 'all', entity = 'all', projectId = 'all', dateFrom = '', dateTo = '', search = '', page = 1, pageSize = 12 } = params

  let rows = [...store].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  if (user !== 'all') rows = rows.filter((r) => r.userName === user)
  if (role !== 'all') rows = rows.filter((r) => r.role === role)
  if (action !== 'all') rows = rows.filter((r) => r.action === action)
  if (entity !== 'all') rows = rows.filter((r) => r.entity === entity)
  if (projectId !== 'all') rows = rows.filter((r) => r.projectId === projectId)
  if (dateFrom) rows = rows.filter((r) => r.timestamp.slice(0, 10) >= dateFrom)
  if (dateTo) rows = rows.filter((r) => r.timestamp.slice(0, 10) <= dateTo)
  const q = search.trim().toLowerCase()
  if (q) {
    rows = rows.filter((r) =>
      r.actionLabel.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q) ||
      r.entity.toLowerCase().includes(q) || String(r.entityId).toLowerCase().includes(q) ||
      JSON.stringify(r.metadata).toLowerCase().includes(q))
  }

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const items = rows.slice((safePage - 1) * pageSize, safePage * pageSize)
  return { items, total, page: safePage, pageSize, totalPages }
}

export async function getAuditFilterOptions() {
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS)
  await delay(80)
  const uniq = (a) => [...new Set(a)].filter(Boolean).sort()
  return {
    users: uniq(store.map((r) => r.userName)),
    roles: uniq(store.map((r) => r.role)).map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r })),
    actions: Object.entries(ACTION_META).map(([k, m]) => ({ value: k, label: m.label })),
    entities: AUDIT_ENTITIES,
    projects: uniq(store.map((r) => r.projectId)),
  }
}

export async function getAuditStats() {
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS)
  await delay(80)
  const today = new Date().toISOString().slice(0, 10)
  return {
    total: store.length,
    today: store.filter((r) => r.timestamp.slice(0, 10) === today).length,
    users: new Set(store.map((r) => r.userName)).size,
    denied: store.filter((r) => r.result === 'denied').length,
  }
}

// --- seed -----------------------------------------------------------------
function seedLogs() {
  const ROLES_BY_USER = {
    'System Administrator': 'SUPER_ADMIN',
    'Priya Sharma': 'DOSJE_OFFICER',
    'Rohan Deshmukh': 'PMU_OFFICER',
    'Arjun Nair': 'INSPECTION_TEAM',
  }
  const raw = [
    ['Priya Sharma', 'VIEW_PROJECT', 'PRJ-2202', 'PRJ-2202', { name: 'SC/ST Hostel Support Program' }, 20],
    ['Priya Sharma', 'ASSIGN_INSPECTION', 'INSP-3005', 'PRJ-2205', { inspector: 'Arjun Nair' }, 60],
    ['Arjun Nair', 'START_INSPECTION', 'INSP-3005', 'PRJ-2205', { locationVerified: true }, 120],
    ['Arjun Nair', 'UPLOAD_EVIDENCE', 'INSP-3005', 'PRJ-2205', { type: 'photo', count: 2 }, 130],
    ['Arjun Nair', 'SUBMIT_INSPECTION', 'INSP-3005', 'PRJ-2205', { status: 'pending-review' }, 150],
    ['Priya Sharma', 'REVIEW_ANOMALY', 'ALT-4100', 'PRJ-2202', { risk: 'critical' }, 200],
    ['Priya Sharma', 'DISMISS_ANOMALY', 'ALT-4106', 'PRJ-2205', { reason: 'planned event' }, 240],
    ['Priya Sharma', 'CHANGE_INSPECTION_ASSIGNMENT', 'INSP-3003', 'PRJ-2203', { from: 'TEAM-02', to: 'TEAM-01' }, 300],
    ['System Administrator', 'CHANGE_USER_ROLE', 'USR-005', null, { from: 'VIEW_ONLY', to: 'DISTRICT_AUTHORITY' }, 360],
    ['Priya Sharma', 'CREATE_ATTENDANCE_SESSION', 'SES-9001', 'PRJ-2201', { subject: 'Morning Roll Call' }, 420],
    ['Priya Sharma', 'BIOMETRIC_ENROLLED', 'BEN-5005', 'PRJ-2204', { samples: 5 }, 500],
    ['Priya Sharma', 'BIOMETRIC_DEACTIVATED', 'BEN-5003', 'PRJ-2202', {}, 900],
    ['Rohan Deshmukh', 'VIEW_PROJECT', 'PRJ-2207', 'PRJ-2207', { name: 'NGO Trust Community Outreach' }, 1000],
    ['Rohan Deshmukh', 'ASSIGN_INSPECTION', 'INSP-3007', 'PRJ-2207', { inspector: 'Ananya Iyer' }, 1100],
    ['Priya Sharma', 'REQUEST_VIDEO_CALL', 'VC-4200', 'PRJ-2202', { participantType: 'project-incharge' }, 1300],
    ['Priya Sharma', 'RESOLVE_ANOMALY', 'ALT-4103', 'PRJ-2205', {}, 1500],
    ['System Administrator', 'CHANGE_USER_STATUS', 'USR-010', null, { to: 'suspended' }, 1800],
    ['Priya Sharma', 'EDIT_PROJECT', 'PRJ-2201', 'PRJ-2201', { field: 'contactPhone' }, 2000],
    ['Arjun Nair', 'MARK_ATTENDANCE', 'SES-9001', 'PRJ-2201', { student: 'BEN-5001' }, 2200],
    ['Priya Sharma', 'CREATE_INSPECTION', 'INSP-3011', 'PRJ-2208', { type: 'surprise' }, 2600],
    ['Priya Sharma', 'VIEW_PROJECT', 'PRJ-2210', 'PRJ-2210', { name: 'Samata Foundation Outreach' }, 3000],
    ['Rohan Deshmukh', 'REVIEW_ANOMALY', 'ALT-4102', 'PRJ-2210', { risk: 'high' }, 3400],
    ['Arjun Nair', 'START_INSPECTION', 'INSP-3002', 'PRJ-2202', { locationVerified: false }, 4000],
    ['Priya Sharma', 'BIOMETRIC_DELETED', 'BEN-5006', 'PRJ-2204', {}, 5000],
    ['System Administrator', 'CHANGE_USER_ROLE', 'USR-007', null, { from: 'VIEW_ONLY', to: 'VIEW_ONLY' }, 6000],
  ]
  return raw.map((r, i) => {
    const [userName, action, entityId, projectId, metadata, minsAgo] = r
    const meta = ACTION_META[action]
    return {
      id: `AUD-${6000 + i}`,
      timestamp: new Date(Date.now() - minsAgo * 60000).toISOString(),
      userId: '—',
      userName,
      role: ROLES_BY_USER[userName] ?? 'DOSJE_OFFICER',
      action,
      actionLabel: meta.label,
      entity: meta.entity,
      entityId,
      projectId,
      result: 'success',
      device: 'Chrome on Windows',
      ip: '—',
      metadata: sanitize(metadata),
    }
  })
}
