import { delay, NotFoundError } from './apiClient.js'
import { ORGANIZATIONS, LOCATIONS, PROJECTS } from '../data/projectsSeedData.js'
import { validateOrganizationInput } from '../data/models.js'

// In-memory store — see apiClient.js for why, and how to swap for a real API.
let store = [...ORGANIZATIONS]
let nextIdNum = store.length + 1

function resolveOrganization(o) {
  const location = LOCATIONS.find((l) => l.id === o.locationId)
  const relatedProjects = PROJECTS.filter((p) => o.projectIds.includes(p.id))
  const projects = relatedProjects.map((p) => ({ id: p.id, name: p.name, status: p.status }))
  const inspectionHistory = relatedProjects
    .flatMap((p) => p.inspectionHistory.map((h) => ({ ...h, projectName: p.name })))
    .sort((a, b) => b.date.localeCompare(a.date))
  return {
    ...o,
    state: location?.state ?? '—',
    district: location?.district ?? '—',
    projects,
    inspectionHistory,
  }
}

/**
 * @param {Object} params
 * @param {'institute'|'ngo'} params.category  required — which page is asking
 * @param {string} [params.search]
 * @param {string} [params.type] 'all' | one of ORG_TYPES
 * @param {string} [params.status] 'all' | 'active' | 'inactive'
 * @param {string} [params.district] 'all' | district name
 */
export async function listOrganizations(params = {}) {
  await delay()
  const { category, search = '', type = 'all', status = 'all', district = 'all' } = params

  let rows = store.filter((o) => !category || o.category === category).map(resolveOrganization)

  const q = search.trim().toLowerCase()
  if (q) {
    rows = rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.contactPerson.toLowerCase().includes(q)
    )
  }
  if (type !== 'all') rows = rows.filter((r) => r.type === type)
  if (status !== 'all') rows = rows.filter((r) => r.status === status)
  if (district !== 'all') rows = rows.filter((r) => r.district === district)

  rows.sort((a, b) => a.name.localeCompare(b.name))
  return { items: rows, total: rows.length }
}

export async function getOrganization(id) {
  await delay()
  const found = store.find((o) => o.id === id)
  if (!found) throw new NotFoundError(`Organization ${id} not found`)
  return resolveOrganization(found)
}

export async function createOrganization(input) {
  await delay()
  const errors = validateOrganizationInput(input)
  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed')
    err.fieldErrors = errors
    throw err
  }

  const id = `ORG-${String(nextIdNum++).padStart(3, '0')}`
  const record = {
    id,
    name: input.name.trim(),
    type: input.type,
    category: input.type === 'NGO' ? 'ngo' : 'institute',
    registrationNumber: input.registrationNumber.trim(),
    registrationDate: input.registrationDate || new Date().toISOString().slice(0, 10),
    locationId: input.locationId,
    contactPerson: input.contactPerson.trim(),
    contactPhone: input.contactPhone.trim(),
    contactEmail: input.contactEmail?.trim() || '',
    status: 'active',
    complianceStatus: 'watch',
    projectIds: [],
  }
  store = [record, ...store]
  return resolveOrganization(record)
}

export async function updateOrganization(id, patch) {
  await delay()
  const idx = store.findIndex((o) => o.id === id)
  if (idx === -1) throw new NotFoundError(`Organization ${id} not found`)
  store[idx] = { ...store[idx], ...patch }
  return resolveOrganization(store[idx])
}

export async function setOrganizationStatus(id, status) {
  return updateOrganization(id, { status })
}

export function resetOrganizationsStore() {
  store = [...ORGANIZATIONS]
  nextIdNum = store.length + 1
}
