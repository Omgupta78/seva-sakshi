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
  u.role = role
  return decorate(u)
}

export async function setUserStatus(id, status) {
  requirePermission(PERMISSIONS.MANAGE_USERS)
  await delay(150)
  const u = store.find((x) => x.id === id)
  if (!u) throw new NotFoundError(`User ${id} not found`)
  u.status = status
  return decorate(u)
}
