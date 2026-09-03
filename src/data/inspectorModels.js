/**
 * ---------------------------------------------------------------------
 * DATA MODELS — AI-Assisted Random Inspection Assignment engine
 * ---------------------------------------------------------------------
 * "AI-Assisted" here means a transparent, documented scoring formula
 * plus a controlled, seeded random factor — NOT a machine-learning
 * model, and NOT plain unweighted random selection. Every score shown
 * to an officer is reproducible from the inputs below; the only
 * non-deterministic step is which *eligible, similarly-scored*
 * candidate gets picked, and even that is seeded so a given generation
 * can be replayed from its audit record. See services/assignmentEngine.js
 * for the actual scoring/selection logic this file's constants feed.
 *
 * Relationships:
 *   Inspector    --< Inspection   (via Inspection.assignedInspectorId — new,
 *                                  alongside the existing assignedTeamId
 *                                  used by inspections assigned the older,
 *                                  plain "pick a team" way)
 *   Organization -- Inspector     conflict-of-interest is DERIVED, not
 *                                  stored twice: an inspector has a COI
 *                                  with any Organization whose
 *                                  contactPerson matches their name.
 * ---------------------------------------------------------------------
 */

/**
 * @typedef {Object} Inspector
 * @property {string} id
 * @property {string} name
 * @property {string} homeDistrict
 * @property {string[]} expertise        subset of EXPERTISE_AREAS
 * @property {number} maxWorkload        max concurrent active inspections
 * @property {'available'|'unavailable'} availability
 * @property {string} [unavailableReason]
 */

/**
 * @typedef {Object} AssignmentAuditEntry
 * @property {string} id
 * @property {string} inspectionId
 * @property {'generate'|'accept'|'manual'} action
 * @property {string} generatedBy        officer name
 * @property {string} timestamp          ISO datetime
 * @property {string[]} eligibleInspectorIds
 * @property {{inspectorId:string, score:number}[]} candidateScores
 * @property {string|null} selectedInspectorId
 * @property {number|null} seed          RNG seed used, for reproducibility
 * @property {boolean} manualOverride
 * @property {string} [reason]           required when manualOverride is true
 */

export const EXPERTISE_AREAS = [
  'Infrastructure & Safety',
  'Attendance & Biometric Systems',
  'Financial/Document Compliance',
  'Child & Beneficiary Welfare',
  'CCTV & Technical Systems',
  'NGO Governance',
  'Skill Development Programs',
]

/** Maps an inspection's checklist categories (inspectionModels.js) to the closest expertise area, to suggest defaults. */
export const CATEGORY_TO_EXPERTISE = {
  Infrastructure: 'Infrastructure & Safety',
  'Staff Availability': 'NGO Governance',
  'Beneficiary Presence': 'Child & Beneficiary Welfare',
  'Attendance Records': 'Attendance & Biometric Systems',
  Documents: 'Financial/Document Compliance',
  Facilities: 'Infrastructure & Safety',
  Safety: 'Infrastructure & Safety',
  'Scheme Compliance': 'NGO Governance',
  'CCTV Availability': 'CCTV & Technical Systems',
  'Financial/Document Compliance': 'Financial/Document Compliance',
}

/**
 * Approximate road-distance lookup (km) between the platform's 7
 * Maharashtra districts — plausible, not survey-accurate; good enough
 * to drive a "how far would this inspector have to travel" score.
 * Symmetric: distanceKm(A,B) === distanceKm(B,A).
 */
export const DISTRICT_DISTANCES_KM = {
  'Pune|Nagpur': 660, 'Pune|Nashik': 210, 'Pune|Thane': 150, 'Pune|Solapur': 250, 'Pune|Kolhapur': 230, 'Pune|Amravati': 500,
  'Nagpur|Nashik': 500, 'Nagpur|Thane': 780, 'Nagpur|Solapur': 450, 'Nagpur|Kolhapur': 700, 'Nagpur|Amravati': 155,
  'Nashik|Thane': 165, 'Nashik|Solapur': 380, 'Nashik|Kolhapur': 430, 'Nashik|Amravati': 430,
  'Thane|Solapur': 380, 'Thane|Kolhapur': 370, 'Thane|Amravati': 640,
  'Solapur|Kolhapur': 230, 'Solapur|Amravati': 440,
  'Kolhapur|Amravati': 660,
}

/**
 * Transparent scoring weights — must sum to 1. Shown in the UI's
 * "Why was this inspector selected?" panel so the formula is never a
 * black box.
 */
export const SCORE_WEIGHTS = {
  expertise: 0.3,
  workload: 0.25,
  location: 0.25,
  rotation: 0.2, // rewards NOT having recently inspected this same project — spreads work out
}

/** Manual assignment always requires a real reason (this is the one place officer judgment overrides the engine). */
export function validateManualAssignmentReason(reason) {
  if (!reason || !reason.trim()) return 'A reason is required to manually override the recommended assignment.'
  if (reason.trim().length < 10) return 'Please give a slightly more specific reason (at least 10 characters).'
  return null
}
