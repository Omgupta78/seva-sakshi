/**
 * ---------------------------------------------------------------------
 * VIDEO CHECK SERVICE — participant selection, call records & audit
 * ---------------------------------------------------------------------
 * Same demo-service pattern as the rest of the app (async functions over an
 * in-memory store; swap each body for fetch() to go live). Three concerns
 * live here:
 *
 *   1. Rule-based random selection of an eligible participant. The rules in
 *      data/videoCheckData.js decide WHO is eligible; a seeded weighted
 *      random then picks one, and the full trace is returned so the choice
 *      is reproducible and auditable — never a black box.
 *
 *   2. Call records — METADATA ONLY (who/when/status). Calls are NOT
 *      recorded: every record carries `recorded: false`. A real recording
 *      would require explicit legal authorisation and a separate, consented
 *      pipeline; it is deliberately not implemented here.
 *
 *   3. An append-only audit log of the call lifecycle (requested / accepted
 *      / rejected / started / ended).
 *
 * PRIVACY: only the minimum identity needed to hold the interaction is ever
 * exposed. Staff and the Project Incharge are shown by name + official role.
 * Beneficiaries — private individuals — are shown by a masked name and type
 * only; their age, phone, ID and contact details are never surfaced to place
 * a call.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { PROJECTS, ORGANIZATIONS, LOCATIONS } from '../data/projectsSeedData.js'
import { requirePermission } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'
import {
  ELIGIBILITY_RULES,
  CHECK_CONTEXTS,
  AUDIT_EVENTS,
} from '../data/videoCheckData.js'

const calls = [] // in-memory call records (metadata only)
const audit = [] // append-only audit events
let callSeq = 4200

// --- deterministic helpers ------------------------------------------------

/** Small stable hash of a string → non-negative int. */
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Seeded PRNG (mulberry32) — same family used by the assignment engine, so a
 *  given seed always reproduces the same pick. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** "Aarav Shinde" → "Aarav S." — enough to identify in the call, not more. */
function maskName(name) {
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function resolveProject(p) {
  const org = ORGANIZATIONS.find((o) => o.id === p.organizationId)
  const location = LOCATIONS.find((l) => l.id === p.locationId)
  return {
    ...p,
    organizationName: org?.name ?? 'Unknown organization',
    contactPerson: p.contactPerson ?? org?.contactPerson ?? 'Project Incharge',
    state: location?.state ?? '—',
    district: location?.district ?? '—',
  }
}

// --- eligibility ----------------------------------------------------------

/**
 * Build the eligible / excluded participant lists for a project by applying
 * the configured rules. Returns display-safe participants only.
 */
function buildPool(project) {
  const eligible = []
  const excluded = []

  // 1) Project Incharge — eligible when the project is active.
  const inchargeActive = project.status === 'active'
  const incharge = {
    id: `${project.id}-INCHARGE`,
    type: 'project-incharge',
    displayName: project.contactPerson,
    role: 'Project Incharge',
  }
  if (inchargeActive) eligible.push(incharge)
  else excluded.push({ ...incharge, reason: `Project is ${project.status} — incharge not on active duty for checks.` })

  // 2) Staff — eligible when marked available (deterministic in the demo).
  for (const s of project.staff ?? []) {
    const available = hash(s.id) % 5 !== 0 // ~1 in 5 unavailable
    const p = { id: s.id, type: 'staff', displayName: s.name, role: s.role }
    if (available) eligible.push(p)
    else excluded.push({ ...p, reason: 'Marked unavailable on the roster.' })
  }

  // 3) Beneficiaries — adults (18+) with recorded video consent only.
  for (const b of project.beneficiaries ?? []) {
    const adult = b.age >= 18
    const consented = adult && hash(b.id) % 2 === 0 // deterministic demo consent among adults
    const p = { id: b.id, type: 'beneficiary', displayName: maskName(b.name), role: 'Beneficiary' }
    if (!adult) {
      excluded.push({ ...p, reason: 'Under 18 — excluded from random video interaction.' })
    } else if (!consented) {
      excluded.push({ ...p, reason: 'No recorded consent to be contacted by video.' })
    } else {
      eligible.push(p)
    }
  }

  return { eligible, excluded }
}

// --- public API -----------------------------------------------------------

/** Active projects available for a video check (for the picker). */
export async function getVideoCheckProjects() {
  requirePermission(PERMISSIONS.VIEW_VIDEO_CHECK)
  await delay(120)
  return PROJECTS.filter((p) => p.status === 'active')
    .map(resolveProject)
    .map((p) => ({ id: p.id, name: p.name, organizationName: p.organizationName, district: p.district, state: p.state }))
}

/** Eligible + excluded participants for a project, with the rules applied. */
export async function getEligibleParticipants(projectId) {
  await delay()
  const raw = PROJECTS.find((p) => p.id === projectId)
  if (!raw) throw new NotFoundError(`Project ${projectId} not found`)
  const project = resolveProject(raw)
  const { eligible, excluded } = buildPool(project)
  return { project, eligible, excluded, rules: ELIGIBILITY_RULES }
}

/**
 * Run the rule-based random selection. Reproducible: pass a `seed` to repeat
 * an earlier pick; otherwise one is generated and returned. The `trace`
 * carries every eligible candidate with its weight and cumulative window, so
 * the outcome can be independently re-checked.
 */
export async function runRandomSelection(projectId, { seed } = {}) {
  await delay()
  const raw = PROJECTS.find((p) => p.id === projectId)
  if (!raw) throw new NotFoundError(`Project ${projectId} not found`)
  const project = resolveProject(raw)
  const { eligible, excluded } = buildPool(project)

  if (eligible.length === 0) {
    return { project, participant: null, context: null, seed: null, eligible, excluded, trace: [] }
  }

  const usedSeed = seed ?? (hash(projectId) ^ (Date.now() & 0xffff)) >>> 0
  const rand = mulberry32(usedSeed)

  // weighted window
  const weights = eligible.map((p) => ELIGIBILITY_RULES[p.type]?.weight ?? 1)
  const total = weights.reduce((a, b) => a + b, 0)
  let acc = 0
  const trace = eligible.map((p, i) => {
    const from = acc
    acc += weights[i]
    return { id: p.id, type: p.type, displayName: p.displayName, weight: weights[i], windowFrom: +(from / total).toFixed(3), windowTo: +(acc / total).toFixed(3) }
  })

  const roll = rand()
  const pickIndex = trace.findIndex((t) => roll >= t.windowFrom && roll < t.windowTo)
  const participant = eligible[pickIndex === -1 ? eligible.length - 1 : pickIndex]

  const context = CHECK_CONTEXTS[Math.floor(rand() * CHECK_CONTEXTS.length)]

  return { project, participant, context, seed: usedSeed, roll: +roll.toFixed(3), eligible, excluded, trace }
}

// --- call records + audit -------------------------------------------------

function logAudit(callId, event, note = null) {
  audit.push({ id: `EVT-${audit.length + 1}`, callId, event, at: new Date().toISOString(), note })
}

/**
 * Create a call record in `requested` state. Metadata only — no media is
 * captured or stored, and `recorded` is always false.
 */
export async function requestCall({ projectId, participant, participantType, context, officer }) {
  requirePermission(PERMISSIONS.VIEW_VIDEO_CHECK)
  await delay(200)
  const raw = PROJECTS.find((p) => p.id === projectId)
  if (!raw) throw new NotFoundError(`Project ${projectId} not found`)
  const project = resolveProject(raw)

  const id = `VC-${callSeq++}`
  const record = {
    id,
    projectId,
    projectName: project.name,
    participantType,
    participantName: participant?.displayName ?? '—',
    participantRole: participant?.role ?? '—',
    officerId: officer?.id ?? officer?.employeeId ?? 'OFFICER',
    officerName: officer?.name ?? 'Authorised Officer',
    context,
    requestedAt: new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    status: 'requested',
    recorded: false, // calls are never auto-recorded
  }
  calls.unshift(record)
  logAudit(id, AUDIT_EVENTS.REQUESTED, `${participantType} · ${context}`)
  return record
}

function patchCall(callId, patch) {
  const rec = calls.find((c) => c.id === callId)
  if (!rec) throw new NotFoundError(`Call ${callId} not found`)
  Object.assign(rec, patch)
  return rec
}

export async function markAccepted(callId) {
  await delay(150)
  const rec = patchCall(callId, { status: 'accepted' })
  logAudit(callId, AUDIT_EVENTS.ACCEPTED)
  return rec
}

export async function markRejected(callId) {
  await delay(150)
  const rec = patchCall(callId, { status: 'rejected', endedAt: new Date().toISOString() })
  logAudit(callId, AUDIT_EVENTS.REJECTED)
  return rec
}

export async function startCall(callId) {
  await delay(120)
  const rec = patchCall(callId, { status: 'ongoing', startedAt: new Date().toISOString() })
  logAudit(callId, AUDIT_EVENTS.STARTED)
  return rec
}

export async function endCall(callId) {
  await delay(120)
  const rec = patchCall(callId, { status: 'ended', endedAt: new Date().toISOString() })
  logAudit(callId, AUDIT_EVENTS.ENDED)
  return rec
}

export async function listCalls() {
  await delay()
  return { items: [...calls] }
}

export async function getCallAudit(callId) {
  await delay(100)
  return audit.filter((e) => e.callId === callId)
}
