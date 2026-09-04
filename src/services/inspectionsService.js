import { delay, NotFoundError } from './apiClient.js'
import { INSPECTIONS, TEAMS } from '../data/inspectionsSeedData.js'
import { PROJECTS, ORGANIZATIONS, LOCATIONS } from '../data/projectsSeedData.js'
import { validateInspectionInput } from '../data/inspectionModels.js'

// In-memory store — see apiClient.js for why, and how to swap for a real API.
// Stands in for what would be four related tables in a real backend:
// inspections, inspection_assignments (assignedTeamId + timeline entries),
// inspection_checklists (embedded per inspection), inspection_evidence
// (embedded per inspection), inspection_reports (embedded per inspection).
let store = [...INSPECTIONS]
let nextIdNum = store.length + 1

function nowIso() {
  return new Date().toISOString().slice(0, 19)
}

function resolveInspection(insp) {
  const project = PROJECTS.find((p) => p.id === insp.projectId)
  const org = ORGANIZATIONS.find((o) => o.id === insp.organizationId)
  const location = LOCATIONS.find((l) => l.id === project?.locationId)
  const team = TEAMS.find((t) => t.id === insp.assignedTeamId)
  // A direct inspector assignment (from the AI-assisted engine) takes display
  // priority over a legacy team assignment when both are somehow present.
  const teamName = insp.assignedInspectorName ? insp.assignedInspectorName : (team?.name ?? 'Unassigned')
  return {
    ...insp,
    projectName: project?.name ?? 'Unknown project',
    organizationName: org?.name ?? 'Unknown organization',
    district: location?.district ?? '—',
    state: location?.state ?? '—',
    teamName,
    teamMembers: insp.assignedInspectorName ? [insp.assignedInspectorName] : (team?.members ?? []),
  }
}

/** Who should be recorded as the "actor" for a lifecycle event — the assigned inspector if one exists, else the first team member. */
function primaryActor(insp) {
  if (insp.assignedInspectorName) return insp.assignedInspectorName
  return TEAMS.find((t) => t.id === insp.assignedTeamId)?.members[0] ?? 'Inspector'
}

function appendTimeline(insp, stage, actor) {
  return { ...insp, timeline: [...insp.timeline, { stage, timestamp: nowIso(), actor }], lastUpdated: nowIso() }
}

function saveAndResolve(idx) {
  return resolveInspection(store[idx])
}

/**
 * @param {Object} params
 * @param {string} [params.search]
 * @param {string} [params.status] 'all' | one of INSPECTION_STATUSES
 * @param {string} [params.priority] 'all' | one of PRIORITIES
 * @param {string} [params.riskLevel] 'all' | one of RISK_LEVELS
 * @param {string} [params.type] 'all' | one of INSPECTION_TYPES
 * @param {string} [params.sortBy]
 * @param {'asc'|'desc'} [params.sortDir]
 * @param {number} [params.page]
 * @param {number} [params.pageSize]
 */
export async function listInspections(params = {}) {
  await delay()
  const { search = '', status = 'all', priority = 'all', riskLevel = 'all', type = 'all', sortBy = 'scheduledDate', sortDir = 'desc', page = 1, pageSize = 6 } = params

  let rows = store.map(resolveInspection)

  const q = search.trim().toLowerCase()
  if (q) {
    rows = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.organizationName.toLowerCase().includes(q) ||
        r.teamName.toLowerCase().includes(q)
    )
  }
  if (status !== 'all') rows = rows.filter((r) => r.status === status)
  if (priority !== 'all') rows = rows.filter((r) => r.priority === priority)
  if (riskLevel !== 'all') rows = rows.filter((r) => r.riskLevel === riskLevel)
  if (type !== 'all') rows = rows.filter((r) => r.type === type)

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

/** Pending inspections with no one assigned yet (neither a team nor a direct inspector) — the /officer/inspection-assignment queue. */
export async function listUnassignedInspections() {
  await delay()
  return store.filter((i) => !i.assignedTeamId && !i.assignedInspectorId).map(resolveInspection)
}

export async function getInspection(id) {
  await delay()
  const found = store.find((i) => i.id === id)
  if (!found) throw new NotFoundError(`Inspection ${id} not found`)
  const resolved = resolveInspection(found)
  const history = store
    .filter((i) => i.projectId === found.projectId && i.id !== found.id)
    .map(resolveInspection)
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
  return { ...resolved, projectHistory: history }
}

export async function createInspection(input) {
  await delay()
  const errors = validateInspectionInput(input)
  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed')
    err.fieldErrors = errors
    throw err
  }

  const project = PROJECTS.find((p) => p.id === input.projectId)
  const id = `INSP-${3100 + nextIdNum++}`
  const created = nowIso()
  const timeline = [{ stage: 'created', timestamp: created, actor: 'Priya Sharma' }]
  if (input.assignedTeamId) timeline.push({ stage: 'assigned', timestamp: created, actor: 'Priya Sharma' })

  const record = {
    id,
    projectId: input.projectId,
    organizationId: input.organizationId,
    type: input.type,
    scheduledDate: input.scheduledDate,
    priority: input.priority,
    reason: input.reason.trim(),
    requiredAreas: input.requiredAreas,
    assignedTeamId: input.assignedTeamId || null,
    status: input.assignedTeamId ? 'assigned' : 'pending',
    riskLevel: project?.riskLevel ?? 'watch',
    lastUpdated: created,
    checklist: input.requiredAreas.map((category, i) => ({ id: `CHK-new-${id}-${i}`, category, status: null, remarks: '', evidenceIds: [] })),
    evidence: [],
    report: null,
    timeline,
  }
  store = [record, ...store]
  return resolveInspection(record)
}

export async function assignTeam(id, teamId) {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  let updated = { ...store[idx], assignedTeamId: teamId, status: store[idx].status === 'pending' ? 'assigned' : store[idx].status }
  updated = appendTimeline(updated, 'assigned', 'Priya Sharma')
  store[idx] = updated
  return saveAndResolve(idx)
}

/** Direct inspector assignment (from the AI-Assisted Random Inspection Assignment engine) — sits alongside the legacy assignTeam(). */
export async function assignInspector(id, inspector) {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  let updated = {
    ...store[idx],
    assignedInspectorId: inspector.id,
    assignedInspectorName: inspector.name,
    status: store[idx].status === 'pending' ? 'assigned' : store[idx].status,
  }
  updated = appendTimeline(updated, 'assigned', 'Priya Sharma')
  store[idx] = updated
  return saveAndResolve(idx)
}

/**
 * Read-only snapshot of every inspection, resolved, for the assignment
 * engine to compute workload/rotation against. Not paginated/filtered —
 * this is an internal cross-module read, not a UI-facing list call.
 */
export async function getInspectionsSnapshot() {
  await delay(80)
  return store.map(resolveInspection)
}

export function getTeamsById() {
  return Object.fromEntries(TEAMS.map((t) => [t.id, t]))
}

export async function acceptInspection(id) {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  const actor = primaryActor(store[idx])
  let updated = { ...store[idx], status: 'scheduled' }
  updated = appendTimeline(updated, 'accepted', actor)
  store[idx] = updated
  return saveAndResolve(idx)
}

/**
 * Starts an inspection. `meta` is optional and comes from the mobile
 * inspector module: { startedAt, coords, distanceKm, locationVerified }.
 * The officer-side desktop button calls this with no meta, unchanged.
 *
 * If the inspection was still merely 'assigned' (never formally
 * accepted), starting it in the field implies acceptance, so both
 * timeline stages are recorded rather than leaving a gap.
 */
export async function startInspection(id, meta = null) {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  const actor = primaryActor(store[idx])
  let updated = { ...store[idx], status: 'in-progress' }

  if (updated.status !== 'cancelled' && !updated.timeline.some((t) => t.stage === 'accepted')) {
    updated = appendTimeline(updated, 'accepted', actor)
  }
  if (meta) {
    updated.startedAt = meta.startedAt ?? nowIso()
    updated.startLocation = meta.coords ?? null
    updated.startDistanceKm = meta.distanceKm ?? null
    updated.locationVerified = meta.locationVerified ?? false
  }
  updated = appendTimeline(updated, 'started', actor)
  store[idx] = updated
  return saveAndResolve(idx)
}

/**
 * Staff/beneficiary verification notes from the field. Deliberately
 * stores counts, roles and observations only — no names or identifying
 * details of interviewees (see FieldVerificationForm.jsx).
 */
export async function saveFieldVerification(id, data) {
  await delay(200)
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  store[idx] = { ...store[idx], fieldVerification: { ...data, recordedAt: nowIso() }, lastUpdated: nowIso() }
  return saveAndResolve(idx)
}

/** Every inspection assigned to this inspector — directly, or via a team they're a member of. */
export async function listInspectionsForInspector(inspectorName) {
  await delay()
  return store
    .filter((insp) => {
      if (insp.assignedInspectorName === inspectorName) return true
      const team = TEAMS.find((t) => t.id === insp.assignedTeamId)
      return team?.members.includes(inspectorName) ?? false
    })
    .map(resolveInspection)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
}

export async function cancelInspection(id) {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  store[idx] = { ...store[idx], status: 'cancelled', lastUpdated: nowIso() }
  return saveAndResolve(idx)
}

export async function updateChecklistItem(id, itemId, patch) {
  await delay(200)
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  const checklist = store[idx].checklist.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
  store[idx] = { ...store[idx], checklist, lastUpdated: nowIso() }
  return saveAndResolve(idx)
}

export async function addEvidence(id, input) {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  const inspection = store[idx]
  const project = PROJECTS.find((p) => p.id === inspection.projectId)
  const location = LOCATIONS.find((l) => l.id === project?.locationId)
  const actor = primaryActor(inspection)

  const evidenceItem = {
    id: `EVD-new-${Date.now()}`,
    type: input.type,
    description: input.description.trim(),
    fileRef: input.fileRef?.trim() || '',
    timestamp: nowIso(),
    inspector: input.inspectorName ?? actor,
    inspectorId: input.inspectorId ?? null,
    inspectionId: id,
    projectId: inspection.projectId,
    location: location?.district ?? '—',
    // Captured on mobile: exact GPS at the moment of capture, plus a local
    // object-URL preview. In production the blob uploads to storage and
    // `previewUrl` becomes the stored file's URL.
    coords: input.coords ?? null,
    previewUrl: input.previewUrl ?? null,
  }

  const hasEvidenceStage = inspection.timeline.some((t) => t.stage === 'evidence-uploaded')
  let updated = { ...inspection, evidence: [evidenceItem, ...inspection.evidence] }
  if (!hasEvidenceStage) updated = appendTimeline(updated, 'evidence-uploaded', actor)
  else updated.lastUpdated = nowIso()

  store[idx] = updated
  return saveAndResolve(idx)
}

export async function submitReport(id, input) {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  const inspection = store[idx]
  const actor = primaryActor(inspection)

  const report = {
    summary: input.summary.trim(),
    findings: input.findings.split('\n').map((f) => f.trim()).filter(Boolean),
    recommendation: input.recommendation.trim(),
    submittedBy: actor,
    submittedAt: nowIso(),
    reviewedBy: null,
    reviewedAt: null,
    status: 'pending-review',
  }

  let updated = { ...inspection, report, status: 'completed' }
  updated = appendTimeline(updated, 'report-submitted', actor)
  store[idx] = updated
  return saveAndResolve(idx)
}

export async function reviewAndCloseReport(id, reviewedBy = 'Priya Sharma') {
  await delay()
  const idx = store.findIndex((i) => i.id === id)
  if (idx === -1) throw new NotFoundError(`Inspection ${id} not found`)
  const inspection = store[idx]
  if (!inspection.report) throw new Error('Cannot review an inspection with no submitted report.')

  let updated = {
    ...inspection,
    report: { ...inspection.report, status: 'reviewed', reviewedBy, reviewedAt: nowIso() },
  }
  updated = appendTimeline(updated, 'reviewed', reviewedBy)
  updated = appendTimeline(updated, 'closed', reviewedBy)
  store[idx] = updated
  return saveAndResolve(idx)
}

export function resetInspectionsStore() {
  store = [...INSPECTIONS]
  nextIdNum = store.length + 1
}
