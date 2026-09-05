/**
 * ---------------------------------------------------------------------
 * USERS SERVICE — user & role administration (MANAGE_USERS only)
 * ---------------------------------------------------------------------
 * Every function here is guarded by MANAGE_USERS in the service tier, so
 * only a Super Admin can list users or change roles — enforced server-side
 * (the demo stand-in), not by hiding the page. Demo data only.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { requirePermission } from './authz.js'
import { PERMISSIONS, ROLES, ROLE_LABELS, permissionsForRole } from '../data/rbac.js'
import { record as recordAudit } from './auditService.js'

const SEED_USERS = [
  { id: 'USR-001', name: 'Priya Sharma', email: 'priya.sharma@dosje.gov.in', role: ROLES.DOSJE_OFFICER, district: 'Pune', status: 'active' },
  { id: 'USR-002', name: 'Rohan Deshmukh', email: 'rohan.deshmukh@dosje.gov.in', role: ROLES.PMU_OFFICER, district: 'Mumbai', status: 'active' },
  { id: 'USR-003', name: 'Arjun Nair', email: 'arjun.nair@dosje.gov.in', role: ROLES.INSPECTION_TEAM, district: 'Nashik', status: 'active' },
  { id: 'USR-004', name: 'Meera Joshi', email: 'meera.joshi@maharashtra.gov.in', role: ROLES.STATE_AUTHORITY, district: 'Mumbai', status: 'active' },
  { id: 'USR-005', name: 'Vikram Patil', email: 'vikram.patil@nagpur.gov.in', role: ROLES.DISTRICT_AUTHORITY, district: 'Nagpur', status: 'active' },
  { id: 'USR-006', name: 'Sunita Rane', email: 'contact@ashramshala-wada.org', role: ROLES.NGO_INSTITUTE, district: 'Thane', status: 'active' },
  { id: 'USR-007', name: 'Anjali Deshpande', email: 'audit.viewer@dosje.gov.in', role: ROLES.VIEW_ONLY, district: 'Pune', status: 'active' },
  { id: 'USR-008', name: 'System Administrator', email: 'admin@dosje.gov.in', role: ROLES.SUPER_ADMIN, district: 'New Delhi', status: 'active' },
]

let store = SEED_USERS.map((u) => ({ ...u }))

function decorate(u) {
  return { ...u, roleLabel: ROLE_LABELS[u.role] ?? u.role, permissionCount: permissionsForRole(u.role).length }
}

export async function listUsers(params = {}) {
  requirePermission(PERMISSIONS.MANAGE_USERS)
  await delay()
  const { search = '', role = 'all', status = 'all' } = params
  let rows = store.map(decorate)
  const q = search.trim().toLowerCase()
  if (q) rows = rows.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  if (role !== 'all') rows = rows.filter((u) => u.role === role)
  if (status !== 'all') rows = rows.filter((u) => u.status === status)
  return { items: rows, total: rows.length }
}

export async function updateUserRole(id, role) {
  requirePermission(PERMISSIONS.MANAGE_USERS)
  await delay(150)
  const u = store.find((x) => x.id === id)
  if (!u) throw new NotFoundError(`User ${id} not found`)
  const from = u.role
  u.role = role
  recordAudit('CHANGE_USER_ROLE', { entityId: id, metadata: { user: u.name, from, to: role } })
  return decorate(u)
}

export async function setUserStatus(id, status) {
  requirePermission(PERMISSIONS.MANAGE_USERS)
  await delay(150)
  const u = store.find((x) => x.id === id)
  if (!u) throw new NotFoundError(`User ${id} not found`)
  u.status = status
  recordAudit('CHANGE_USER_STATUS', { entityId: id, metadata: { user: u.name, to: status } })
  return decorate(u)
}

/** Deactivate a user (soft) — they can no longer log in, but their history,
 *  audit trail and inspection records all remain. Reversible. */
export async function deactivateUser(id) {
  requirePermission(PERMISSIONS.USER_DEACTIVATE)
  await delay(150)
  const u = store.find((x) => x.id === id)
  if (!u) throw new NotFoundError(`User ${id} not found`)
  if (u.status === 'deactivated') throw new Error('User is already deactivated.')
  u.status = 'deactivated'
  recordAudit('USER_DEACTIVATED', { entityId: id, metadata: { user: u.name } })
  return decorate(u)
}

export async function activateUser(id) {
  requirePermission(PERMISSIONS.USER_DEACTIVATE)
  await delay(150)
  const u = store.find((x) => x.id === id)
  if (!u) throw new NotFoundError(`User ${id} not found`)
  u.status = 'active'
  recordAudit('USER_ACTIVATED', { entityId: id, metadata: { user: u.name } })
  return decorate(u)
}

/** Reset a user's access (force re-authentication / new credentials). */
export async function resetUserAccess(id) {
  requirePermission(PERMISSIONS.MANAGE_USERS)
  await delay(150)
  const u = store.find((x) => x.id === id)
  if (!u) throw new NotFoundError(`User ${id} not found`)
  recordAudit('USER_ACCESS_RESET', { entityId: id, metadata: { user: u.name } })
  return decorate(u)
}

/** Permanently remove a user — Super Admin only. Audit history is retained. */
export async function deleteUser(id) {
  requirePermission(PERMISSIONS.PERMANENT_DELETE)
  await delay(150)
  const u = store.find((x) => x.id === id)
  if (!u) throw new NotFoundError(`User ${id} not found`)
  store = store.filter((x) => x.id !== id)
  recordAudit('USER_DELETED', { entityId: id, metadata: { user: u.name } })
  return { id, deleted: true }
}
