import { delay, NotFoundError } from './apiClient.js'
import { PROJECTS, ORGANIZATIONS, LOCATIONS, SCHEMES } from '../data/projectsSeedData.js'
import { validateProjectInput } from '../data/models.js'
import { requirePermission, getActor } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'
import { record as recordAudit } from './auditService.js'

// In-memory store — see apiClient.js for why, and how to swap for a real API.
let store = [...PROJECTS]
let nextIdNum = store.length + 1

function resolveProject(p) {
  const org = ORGANIZATIONS.find((o) => o.id === p.organizationId)
  const location = LOCATIONS.find((l) => l.id === p.locationId)
  const scheme = SCHEMES.find((s) => s.id === p.schemeId)
  return {
    ...p,
    organizationName: org?.name ?? 'Unknown organization',
    state: location?.state ?? '—',
    district: location?.district ?? '—',
    schemeName: scheme?.name ?? 'Unknown scheme',
  }
}

/**
 * @param {Object} params
 * @param {string} [params.search]
 * @param {string} [params.status] 'all' | one of PROJECT_STATUSES
 * @param {string} [params.riskLevel] 'all' | one of RISK_LEVELS
 * @param {string} [params.district] 'all' | district name
 * @param {string} [params.schemeId] 'all' | scheme id
 * @param {string} [params.sortBy] a field name on the resolved project
 * @param {'asc'|'desc'} [params.sortDir]
 * @param {number} [params.page] 1-indexed
 * @param {number} [params.pageSize]
 */
export async function listProjects(params = {}) {
  requirePermission(PERMISSIONS.VIEW_PROJECTS)
  await delay()

  const {
    search = '',
    status = 'all',
    riskLevel = 'all',
    district = 'all',
    schemeId = 'all',
    sortBy = 'name',
    sortDir = 'asc',
    page = 1,
    pageSize = 6,
  } = params

  let rows = store.map(resolveProject)

  const q = search.trim().toLowerCase()
  if (q) {
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.organizationName.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
    )
  }
  if (status !== 'all') rows = rows.filter((r) => r.status === status)
  if (riskLevel !== 'all') rows = rows.filter((r) => r.riskLevel === riskLevel)
  if (district !== 'all') rows = rows.filter((r) => r.district === district)
  if (schemeId !== 'all') rows = rows.filter((r) => r.schemeId === schemeId)

  rows.sort((a, b) => {
    const av = a[sortBy]
    const bv = b[sortBy]
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
    return sortDir === 'desc' ? -cmp : cmp
  })

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const items = rows.slice((safePage - 1) * pageSize, safePage * pageSize)

  return { items, total, page: safePage, pageSize, totalPages }
}

export async function getProject(id) {
  requirePermission(PERMISSIONS.VIEW_PROJECTS)
  await delay()
  const found = store.find((p) => p.id === id)
  if (!found) throw new NotFoundError(`Project ${id} not found`)
  const resolved = resolveProject(found)
  recordAudit('VIEW_PROJECT', { entityId: id, projectId: id, metadata: { name: resolved.name } })
  return resolved
}

export async function createProject(input) {
  requirePermission(PERMISSIONS.EDIT_PROJECTS)
  await delay()
  const errors = validateProjectInput(input)
  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed')
    err.fieldErrors = errors
    throw err
  }

  const id = `PRJ-${2300 + nextIdNum++}`
  const record = {
    id,
    name: input.name.trim(),
    schemeId: input.schemeId,
    organizationId: input.organizationId,
    locationId: input.locationId,
    projectType: input.projectType,
    status: input.status || 'planned',
    riskLevel: 'healthy',
    lastInspection: '—',
    nextInspection: input.nextInspection || '—',
    beneficiaryCount: Number(input.beneficiaryCount) || 0,
    staffCount: Number(input.staffCount) || 0,
    attendancePercentage: 0,
    cctvStatus: 'offline',
    complianceStatus: 'watch',
    contactPerson: input.contactPerson || '',
    contactPhone: input.contactPhone || '',
    mapPosition: null,
    beneficiaries: [],
    staff: [],
    attendanceWeek: [],
    documents: [],
    issues: [],
    inspectionHistory: [],
  }
  store = [record, ...store]
  recordAudit('CREATE_PROJECT', { entityId: id, projectId: id, metadata: { name: record.name } })
  return resolveProject(record)
}

export async function updateProject(id, patch) {
  requirePermission(PERMISSIONS.EDIT_PROJECTS)
  await delay()
  const idx = store.findIndex((p) => p.id === id)
  if (idx === -1) throw new NotFoundError(`Project ${id} not found`)
  store[idx] = { ...store[idx], ...patch }
  recordAudit('EDIT_PROJECT', { entityId: id, projectId: id, metadata: { fields: Object.keys(patch).join(', ') } })
  return resolveProject(store[idx])
}

// --- lifecycle: archive (soft) / restore / permanent delete ---------------

/** A project carries historical records if it has inspections, beneficiaries
 *  or attendance — those must never be cascade-deleted. */
function hasDependencies(p) {
  return (p.inspectionHistory?.length ?? 0) > 0
    || (p.beneficiaries?.length ?? 0) > 0
    || (p.attendanceWeek?.length ?? 0) > 0
    || (p.lastInspection && p.lastInspection !== '—')
}

/** Soft-delete: move an active project to Archived, preserving all history. */
export async function archiveProject(id, reason) {
  requirePermission(PERMISSIONS.PROJECT_ARCHIVE)
  await delay()
  const idx = store.findIndex((p) => p.id === id)
  if (idx === -1) throw new NotFoundError(`Project ${id} not found`)
  if (store[idx].status === 'archived') throw new Error('Project is already archived.')
  const previousStatus = store[idx].status
  store[idx] = { ...store[idx], status: 'archived', previousStatus, archivedAt: new Date().toISOString(), archivedBy: getActor().name }
  recordAudit('PROJECT_ARCHIVED', { entityId: id, projectId: id, metadata: { from: previousStatus, to: 'archived', reason: reason || undefined } })
  return resolveProject(store[idx])
}

/** Restore an archived project to its prior status. */
export async function restoreProject(id) {
  requirePermission(PERMISSIONS.PROJECT_ARCHIVE)
  await delay()
  const idx = store.findIndex((p) => p.id === id)
  if (idx === -1) throw new NotFoundError(`Project ${id} not found`)
  if (store[idx].status !== 'archived') throw new Error('Only an archived project can be restored.')
  const to = store[idx].previousStatus || 'active'
  store[idx] = { ...store[idx], status: to, archivedAt: null, archivedBy: null }
  recordAudit('PROJECT_RESTORED', { entityId: id, projectId: id, metadata: { to } })
  return resolveProject(store[idx])
}

/** Permanent delete — Super Admin only, and refused if history exists. */
export async function deleteProject(id) {
  requirePermission(PERMISSIONS.PERMANENT_DELETE)
  await delay()
  const found = store.find((p) => p.id === id)
  if (!found) throw new NotFoundError(`Project ${id} not found`)
  if (hasDependencies(found)) {
    throw new Error('This project has historical inspections, attendance or reports. Archive it instead of permanently deleting it.')
  }
  store = store.filter((p) => p.id !== id)
  recordAudit('PROJECT_DELETED', { entityId: id, projectId: id, metadata: { name: found.name } })
  return { id, deleted: true }
}

export function resetProjectsStore() {
  store = [...PROJECTS]
  nextIdNum = store.length + 1
}
