/**
 * Seed data for the Inspection Management module. Demo data only — no
 * real people, organizations, or incidents. Ties into the existing
 * Projects/Organizations seed data (projectsSeedData.js) via
 * projectId/organizationId, matching the relationships documented in
 * inspectionModels.js.
 */
import { PROJECTS, ORGANIZATIONS, LOCATIONS } from './projectsSeedData.js'
import { CHECKLIST_CATEGORIES } from './inspectionModels.js'

export const TEAMS = [
  { id: 'TEAM-01', name: 'Pune Field Team', members: ['Priya Sharma', 'Ananya Iyer'] },
  { id: 'TEAM-02', name: 'Nagpur Field Team', members: ['Vikram Patil', 'Rajesh Gaikwad'] },
  { id: 'TEAM-03', name: 'Thane Field Team', members: ['Rohan Deshmukh', 'Meera Joshi'] },
  { id: 'TEAM-04', name: 'Nashik-Kolhapur Field Team', members: ['Arjun Nair', 'Sneha Kulkarni'] },
]

const REASONS = {
  routine: 'Scheduled quarterly compliance review.',
  surprise: 'Unannounced check prompted by a recent monitoring alert.',
  'follow-up': 'Follow-up on issues raised during the previous inspection.',
  special: 'Special review requested by PMU given the institute\'s compliance watch status.',
  'ai-triggered': 'AI Analytics flagged an unusual pattern for human review.',
}

// One primary inspection per project, deliberately spanning every status.
const INSPECTION_BASE = [
  { id: 'INSP-3001', projectIdx: 0, type: 'routine', status: 'completed', priority: 'low', teamId: 'TEAM-01' },
  { id: 'INSP-3002', projectIdx: 1, type: 'surprise', status: 'in-progress', priority: 'high', teamId: 'TEAM-01' },
  { id: 'INSP-3003', projectIdx: 2, type: 'follow-up', status: 'scheduled', priority: 'medium', teamId: 'TEAM-02' },
  { id: 'INSP-3004', projectIdx: 3, type: 'routine', status: 'completed', priority: 'low', teamId: 'TEAM-03' },
  { id: 'INSP-3005', projectIdx: 4, type: 'special', status: 'assigned', priority: 'medium', teamId: 'TEAM-04' },
  { id: 'INSP-3006', projectIdx: 5, type: 'routine', status: 'completed', priority: 'low', teamId: 'TEAM-04' },
  { id: 'INSP-3007', projectIdx: 6, type: 'surprise', status: 'overdue', priority: 'high', teamId: 'TEAM-03' },
  { id: 'INSP-3008', projectIdx: 7, type: 'ai-triggered', status: 'pending', priority: 'medium', teamId: null },
  { id: 'INSP-3009', projectIdx: 8, type: 'routine', status: 'cancelled', priority: 'low', teamId: 'TEAM-01' },
  { id: 'INSP-3010', projectIdx: 9, type: 'ai-triggered', status: 'pending', priority: 'high', teamId: null },
]

function team(id) {
  return TEAMS.find((t) => t.id === id)
}

function iso(dateStr, hh = 9, mm = 0) {
  return `${dateStr}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Where an inspection sits on the calendar, by status — active work is
 * near-term (so an inspector's "Today's Inspections" is meaningful and
 * the data doesn't go stale), finished/abandoned work stays in the past.
 */
function scheduledDateFor(status, createdDate) {
  switch (status) {
    case 'in-progress':
    case 'assigned':
      return todayIso()
    case 'scheduled':
      return addDays(todayIso(), 1)
    case 'pending':
      return addDays(todayIso(), 3)
    case 'overdue':
      return addDays(todayIso(), -9)
    default: // completed, cancelled — historical
      return addDays(createdDate, 3)
  }
}

/** Which timeline stages a given status implies have already happened. */
const STAGES_REACHED = {
  pending: ['created'],
  assigned: ['created', 'assigned'],
  scheduled: ['created', 'assigned', 'accepted'],
  'in-progress': ['created', 'assigned', 'accepted', 'started'],
  overdue: ['created', 'assigned'],
  cancelled: ['created', 'assigned'],
  completed: ['created', 'assigned', 'accepted', 'started', 'evidence-uploaded', 'report-submitted', 'reviewed', 'closed'],
}

function buildTimeline(status, createdDate, teamObj, primaryInspector, seed) {
  const stages = STAGES_REACHED[status] ?? ['created']
  const actors = {
    created: 'Priya Sharma',
    assigned: 'Priya Sharma',
    accepted: primaryInspector,
    started: primaryInspector,
    'evidence-uploaded': primaryInspector,
    'report-submitted': primaryInspector,
    reviewed: 'Priya Sharma',
    closed: 'Priya Sharma',
  }
  return stages.map((stage, i) => ({
    stage,
    timestamp: iso(addDays(createdDate, i), 9 + ((seed + i) % 6)),
    actor: teamObj ? actors[stage] : 'Priya Sharma',
  }))
}

function buildChecklist(requiredAreas, status, riskLevel, seed) {
  const assess = status === 'in-progress' || status === 'completed' || status === 'overdue'
  return requiredAreas.map((category, i) => {
    if (!assess) return { id: `CHK-${seed}-${i}`, category, status: null, remarks: '', evidenceIds: [] }
    // Partially through the list for in-progress; all assessed for completed.
    const assessedCount = status === 'completed' ? requiredAreas.length : Math.ceil(requiredAreas.length / 2)
    if (i >= assessedCount) return { id: `CHK-${seed}-${i}`, category, status: null, remarks: '', evidenceIds: [] }

    const roll = (seed + i * 7) % 10
    let itemStatus
    if (riskLevel === 'high') itemStatus = roll < 4 ? 'non-compliant' : roll < 7 ? 'partially-compliant' : 'compliant'
    else if (riskLevel === 'watch') itemStatus = roll < 2 ? 'non-compliant' : roll < 5 ? 'partially-compliant' : 'compliant'
    else itemStatus = roll < 1 ? 'partially-compliant' : 'compliant'

    const remarks =
      itemStatus === 'compliant'
        ? `${category} verified on site, meets requirements.`
        : itemStatus === 'partially-compliant'
          ? `${category} partially in order — minor gaps noted, follow-up recommended.`
          : `${category} did not meet requirements during this visit.`

    return { id: `CHK-${seed}-${i}`, category, status: itemStatus, remarks, evidenceIds: [] }
  })
}

function buildEvidence(inspectionId, projectId, status, district, inspector, createdDate, seed) {
  if (status !== 'in-progress' && status !== 'completed') return []
  const templates = [
    { type: 'photo', description: 'Classroom / facility photo taken during walkthrough.', fileRef: `IMG_${seed}021.jpg` },
    { type: 'document', description: 'Attendance register photographed for record.', fileRef: `attendance_register_${seed}.pdf` },
    { type: 'text', description: 'Beneficiaries present and accounted for at time of visit; staff cooperative.', fileRef: '' },
    { type: 'photo', description: 'CCTV control room / camera installation check.', fileRef: `IMG_${seed}034.jpg` },
  ]
  const count = status === 'completed' ? 4 : 2
  return templates.slice(0, count).map((t, i) => ({
    id: `EVD-${seed}-${i}`,
    type: t.type,
    description: t.description,
    fileRef: t.fileRef,
    timestamp: iso(addDays(createdDate, i + 1), 10 + i),
    inspector,
    inspectionId,
    projectId,
    location: district,
  }))
}

function buildReport(status, project, org, inspector, createdDate) {
  if (status !== 'completed') return null
  const positive = project.riskLevel === 'healthy'
  return {
    summary: positive
      ? `${org.name} was found largely compliant during this ${project.projectType.toLowerCase()} inspection.`
      : `${org.name} showed compliance gaps during this inspection that require follow-up.`,
    findings: positive
      ? ['Attendance records matched beneficiary rolls.', 'Staff and facilities met scheme requirements.', 'No safety concerns observed.']
      : ['Attendance records showed minor discrepancies.', 'Some documentation was incomplete at time of visit.', 'Follow-up inspection recommended within 30 days.'],
    recommendation: positive ? 'No corrective action required; continue routine monitoring.' : 'Schedule a follow-up inspection and request missing documentation.',
    submittedBy: inspector,
    submittedAt: iso(addDays(createdDate, 5), 16),
    reviewedBy: 'Priya Sharma',
    reviewedAt: iso(addDays(createdDate, 6), 11),
    status: 'reviewed',
  }
}

export const INSPECTIONS = INSPECTION_BASE.map((base, idx) => {
  const seed = idx + 1
  const project = PROJECTS[base.projectIdx]
  const org = ORGANIZATIONS.find((o) => o.id === project.organizationId)
  const location = LOCATIONS.find((l) => l.id === project.locationId)
  const teamObj = base.teamId ? team(base.teamId) : null
  const inspector = teamObj ? teamObj.members[seed % teamObj.members.length] : 'Unassigned'

  const createdDate = addDays('2026-08-15', seed)
  const scheduledDate = scheduledDateFor(base.status, createdDate)
  const requiredAreas = CHECKLIST_CATEGORIES.filter((_, i) => (i + seed) % 2 === 0).slice(0, 5)
  const lastStageTimeline = buildTimeline(base.status, createdDate, teamObj, inspector, seed)

  return {
    id: base.id,
    projectId: project.id,
    organizationId: org.id,
    type: base.type,
    scheduledDate,
    priority: base.priority,
    reason: REASONS[base.type],
    requiredAreas,
    assignedTeamId: base.teamId,
    status: base.status,
    riskLevel: project.riskLevel,
    lastUpdated: lastStageTimeline[lastStageTimeline.length - 1]?.timestamp ?? iso(createdDate),
    checklist: buildChecklist(requiredAreas, base.status, project.riskLevel, seed),
    evidence: buildEvidence(base.id, project.id, base.status, location.district, inspector, createdDate, seed),
    report: buildReport(base.status, project, org, inspector, createdDate),
    timeline: lastStageTimeline,
  }
})
