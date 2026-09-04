/**
 * ---------------------------------------------------------------------
 * RANDOM VIDEO CHECK — configuration, eligibility rules & selection
 * ---------------------------------------------------------------------
 * A "random video check" lets an officer open a short, ad-hoc video
 * interaction with an authorised person connected to a project. WHO can be
 * randomly selected is governed by explicit, auditable rules below — not a
 * black box — so the choice can always be explained.
 *
 * Guardrails baked into the rules:
 *   - Beneficiaries are private individuals. A beneficiary is only eligible
 *     for a random video interaction if they are an adult (18+) AND have a
 *     recorded consent to be contacted by video. Minors are never selected.
 *   - Staff and the Project Incharge act in an official capacity, so they
 *     are eligible when on the active roster.
 *   - Only non-sensitive identity is ever surfaced (see privacy note in the
 *     service). Phone numbers, IDs and contact details are never shown just
 *     to place a call.
 *
 * All demo data; no real people.
 * ---------------------------------------------------------------------
 */

export const PARTICIPANT_TYPES = ['project-incharge', 'staff', 'beneficiary']

export const TYPE_LABEL = {
  'project-incharge': 'Project Incharge',
  staff: 'Staff Member',
  beneficiary: 'Beneficiary',
}

/**
 * Configured eligibility rules. `weight` biases the seeded random pick so
 * official points of contact come up more often than beneficiaries, while
 * every eligible person still has a real chance. `rationale` is shown in the
 * UI so the officer sees why a category is in or out.
 */
export const ELIGIBILITY_RULES = {
  'project-incharge': {
    weight: 3,
    rationale: 'Authorised point of contact for the project — eligible when the project is active.',
  },
  staff: {
    weight: 2,
    rationale: 'On-roster staff acting in an official capacity — eligible when marked available.',
  },
  beneficiary: {
    weight: 1,
    rationale: 'Eligible only if an adult (18+) with recorded consent to be contacted by video. Minors are never selected.',
  },
}

/** Inspection contexts a random check can be attached to. */
export const CHECK_CONTEXTS = [
  'Routine presence & availability verification',
  'Facility condition spot-check',
  'Attendance corroboration',
  'Fund-utilisation confirmation',
  'Grievance follow-up',
  'General compliance interaction',
]

export const CALL_STATUSES = ['requested', 'accepted', 'rejected', 'ongoing', 'ended', 'missed']

export const CALL_STATUS_LABEL = {
  requested: 'Requested',
  accepted: 'Accepted',
  rejected: 'Declined',
  ongoing: 'Ongoing',
  ended: 'Ended',
  missed: 'Missed',
}

/** Audit event types recorded for every call. */
export const AUDIT_EVENTS = {
  REQUESTED: 'call-requested',
  ACCEPTED: 'call-accepted',
  REJECTED: 'call-rejected',
  STARTED: 'call-started',
  ENDED: 'call-ended',
}

export const AUDIT_EVENT_LABEL = {
  'call-requested': 'Call requested',
  'call-accepted': 'Call accepted',
  'call-rejected': 'Call declined',
  'call-started': 'Call started',
  'call-ended': 'Call ended',
}
