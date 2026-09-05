/**
 * ---------------------------------------------------------------------
 * DATA MODELS — Projects / Institutes / NGOs module
 * ---------------------------------------------------------------------
 * Plain-JS shape documentation (JSDoc typedefs) plus small factory/
 * validation helpers used by the service layer's create/update calls.
 * There is no TypeScript in this project, so these typedefs are the
 * closest equivalent to a schema — keep them in sync with
 * projectsSeedData.js and any real backend model that replaces it.
 *
 * Relationships:
 *   Organization --< Project   (Organization.id === Project.organizationId)
 *   Location     --< Project   (Location.id === Project.locationId)
 *   Location     --< Organization (Location.id === Organization.locationId)
 *   Scheme       --< Project   (Scheme.id === Project.schemeId)
 * ---------------------------------------------------------------------
 */

/**
 * @typedef {Object} Scheme
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} state
 * @property {string} district
 */

/**
 * @typedef {Object} Organization
 * @property {string} id
 * @property {string} name
 * @property {'Ashram Shala'|'Hostel'|'School'|'Skill Center'|'NGO'} type
 * @property {'institute'|'ngo'} category
 * @property {string} registrationNumber
 * @property {string} registrationDate  ISO date
 * @property {string} locationId
 * @property {string} contactPerson
 * @property {string} contactPhone
 * @property {string} contactEmail
 * @property {'active'|'inactive'} status
 * @property {'compliant'|'watch'|'non-compliant'} complianceStatus
 * @property {string[]} projectIds
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} schemeId
 * @property {string} organizationId
 * @property {string} locationId
 * @property {string} projectType
 * @property {'active'|'completed'|'paused'|'planned'} status
 * @property {'healthy'|'watch'|'high'} riskLevel
 * @property {string} lastInspection   ISO date
 * @property {string} nextInspection   ISO date
 * @property {number} beneficiaryCount
 * @property {number} staffCount
 * @property {number} attendancePercentage
 * @property {'online'|'offline'|'partial'} cctvStatus
 * @property {'compliant'|'watch'|'non-compliant'} complianceStatus
 * @property {string} contactPerson
 * @property {string} contactPhone
 * @property {{x:number,y:number}|null} mapPosition  percentage coords on the schematic state map, null if unmapped
 */

export const PROJECT_STATUSES = ['active', 'completed', 'paused', 'planned', 'archived']
export const RISK_LEVELS = ['healthy', 'watch', 'high']
export const COMPLIANCE_STATUSES = ['compliant', 'watch', 'non-compliant']
export const ORG_TYPES = ['Ashram Shala', 'Hostel', 'School', 'Skill Center', 'NGO']
export const PROJECT_TYPES = ['Scholarship Disbursement', 'Residential Care', 'Skill Training', 'Community Outreach', 'Infrastructure']

/** Validates the fields the Add Project form collects. Returns a { field: message } error map. */
export function validateProjectInput(input) {
  const errors = {}
  if (!input.name?.trim()) errors.name = 'Project name is required.'
  if (!input.schemeId) errors.schemeId = 'Please select a scheme.'
  if (!input.organizationId) errors.organizationId = 'Please select an implementing organization.'
  if (!input.locationId) errors.locationId = 'Please select a district.'
  if (!input.projectType) errors.projectType = 'Please select a project type.'
  if (input.beneficiaryCount !== undefined && input.beneficiaryCount !== '' && Number(input.beneficiaryCount) < 0)
    errors.beneficiaryCount = 'Beneficiary count cannot be negative.'
  return errors
}

/** Validates the fields the Add Organization form collects. */
export function validateOrganizationInput(input) {
  const errors = {}
  if (!input.name?.trim()) errors.name = 'Organization name is required.'
  if (!input.type) errors.type = 'Please select a type.'
  if (!input.locationId) errors.locationId = 'Please select a district.'
  if (!input.registrationNumber?.trim()) errors.registrationNumber = 'Registration number is required.'
  if (!input.contactPerson?.trim()) errors.contactPerson = 'Contact person is required.'
  if (!input.contactPhone?.trim()) errors.contactPhone = 'Contact phone is required.'
  else if (!/^[0-9+\-\s]{7,15}$/.test(input.contactPhone.trim())) errors.contactPhone = 'Enter a valid phone number.'
  if (input.contactEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail.trim()))
    errors.contactEmail = 'Enter a valid email address.'
  return errors
}
