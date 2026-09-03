/**
 * ---------------------------------------------------------------------
 * DATA MODELS — Inspection Management module
 * ---------------------------------------------------------------------
 * Same approach as data/models.js for Projects/Organizations: plain-JS
 * shape documentation the service layer's validators and factories key
 * off, standing in for a real backend schema.
 *
 * Relationships:
 *   Project      --< Inspection            (Project.id === Inspection.projectId)
 *   Organization --< Inspection            (Organization.id === Inspection.organizationId)
 *   Team         --< Inspection            (Team.id === Inspection.assignedTeamId)
 *   Inspection   -- InspectionChecklist    (1:1, embedded as Inspection.checklist)
 *   Inspection   --< InspectionEvidence    (1:many, embedded as Inspection.evidence)
 *   Inspection   -- InspectionReport       (1:1, embedded as Inspection.report, once submitted)
 *   Inspection   --< TimelineEvent         (1:many, embedded as Inspection.timeline)
 * ---------------------------------------------------------------------
 */

/**
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string[]} members
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {string} id
 * @property {string} category            one of CHECKLIST_CATEGORIES
 * @property {'compliant'|'partially-compliant'|'non-compliant'|'not-applicable'|null} status  null = not yet assessed
 * @property {string} remarks
 * @property {string[]} evidenceIds
 */

/**
 * @typedef {Object} InspectionEvidence
 * @property {string} id
 * @property {'photo'|'video'|'document'|'text'} type
 * @property {string} description        for 'text': the observation itself; otherwise a caption
 * @property {string} fileRef             demo-only stand-in for an uploaded file's name/reference
 * @property {string} timestamp           ISO datetime
 * @property {string} inspector
 * @property {string} inspectionId
 * @property {string} projectId
 * @property {string} location
 */

/**
 * @typedef {Object} InspectionReport
 * @property {string} summary
 * @property {string[]} findings
 * @property {string} recommendation
 * @property {string} submittedBy
 * @property {string} submittedAt
 * @property {string|null} reviewedBy
 * @property {string|null} reviewedAt
 * @property {'pending-review'|'reviewed'} status
 */

/**
 * @typedef {Object} TimelineEvent
 * @property {string} stage   one of TIMELINE_STAGES
 * @property {string} timestamp  ISO datetime
 * @property {string} actor
 */

/**
 * @typedef {Object} Inspection
 * @property {string} id
 * @property {string} projectId
 * @property {string} organizationId
 * @property {'routine'|'surprise'|'follow-up'|'special'|'ai-triggered'} type
 * @property {string} scheduledDate  ISO date
 * @property {'low'|'medium'|'high'} priority
 * @property {string} reason
 * @property {string[]} requiredAreas   subset of CHECKLIST_CATEGORIES
 * @property {string|null} assignedTeamId
 * @property {'pending'|'assigned'|'scheduled'|'in-progress'|'completed'|'overdue'|'cancelled'} status
 * @property {'healthy'|'watch'|'high'} riskLevel
 * @property {string} lastUpdated  ISO datetime
 * @property {ChecklistItem[]} checklist
 * @property {InspectionEvidence[]} evidence
 * @property {InspectionReport|null} report
 * @property {TimelineEvent[]} timeline
 */

export const INSPECTION_STATUSES = ['pending', 'assigned', 'scheduled', 'in-progress', 'completed', 'overdue', 'cancelled']
export const INSPECTION_TYPES = ['routine', 'surprise', 'follow-up', 'special', 'ai-triggered']
export const PRIORITIES = ['low', 'medium', 'high']
export const CHECKLIST_ITEM_STATUSES = ['compliant', 'partially-compliant', 'non-compliant', 'not-applicable']
export const EVIDENCE_TYPES = ['photo', 'video', 'document', 'text']
export const TIMELINE_STAGES = ['created', 'assigned', 'accepted', 'started', 'evidence-uploaded', 'report-submitted', 'reviewed', 'closed']

export const CHECKLIST_CATEGORIES = [
  'Infrastructure',
  'Staff Availability',
  'Beneficiary Presence',
  'Attendance Records',
  'Documents',
  'Facilities',
  'Safety',
  'Scheme Compliance',
  'CCTV Availability',
  'Financial/Document Compliance',
]

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  scheduled: 'Scheduled',
  'in-progress': 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}
export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

const TYPE_LABELS = {
  routine: 'Routine',
  surprise: 'Surprise',
  'follow-up': 'Follow-up',
  special: 'Special',
  'ai-triggered': 'AI-triggered Review',
}
export function typeLabel(type) {
  return TYPE_LABELS[type] ?? type
}

/** Validates the Create Inspection form. Returns a { field: message } error map. */
export function validateInspectionInput(input) {
  const errors = {}
  if (!input.projectId) errors.projectId = 'Please select a project.'
  if (!input.organizationId) errors.organizationId = 'Please select an implementing organization.'
  if (!input.type) errors.type = 'Please select an inspection type.'
  if (!input.scheduledDate) errors.scheduledDate = 'Please choose an inspection date.'
  if (!input.priority) errors.priority = 'Please select a priority.'
  if (!input.reason?.trim()) errors.reason = 'Please give a reason for this inspection.'
  if (!input.requiredAreas || input.requiredAreas.length === 0) errors.requiredAreas = 'Select at least one inspection area.'
  return errors
}
