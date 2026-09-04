/**
 * ---------------------------------------------------------------------
 * AI-ASSISTED ATTENDANCE — models, enums & configuration
 * ---------------------------------------------------------------------
 * Face recognition here is an ASSISTANCE / VERIFICATION aid for authorised
 * monitoring, not an authority in itself. It is never presented as perfectly
 * accurate; the final operational decision always rests with the officer.
 *
 * We do not train a model. Recognition runs through a swappable provider
 * (services/faceRecognition/provider.js) so a reputable pretrained model
 * (face-api.js in the browser, or a server-side ArcFace/InsightFace / AWS
 * Rekognition endpoint) can be dropped in later without touching the UI.
 *
 * Biometric data (face embeddings) is sensitive and is deliberately kept out
 * of the frontend, out of localStorage, and out of every normal API response
 * (see services/biometricVault.js). This file only carries non-biometric
 * shapes plus tunable configuration.
 * ---------------------------------------------------------------------
 */

/** Tunable recognition/attendance settings (a real deployment would load these
 *  from admin config). Threshold and retention are intentionally adjustable. */
export const ATTENDANCE_CONFIG = {
  /** Cosine-similarity score at/above which a face is considered a candidate
   *  match. Higher = stricter. Configurable by design. */
  matchThreshold: 0.62,
  /** Face samples captured per enrolment (multiple angles → robust template). */
  samplesRequired: 5,
  /** Controlled frame processing: recognition runs at most once per interval,
   *  NOT on every camera frame. */
  frameIntervalMs: 1500,
  /** How long biometric templates are retained before a retention sweep would
   *  purge them. Configurable; surfaced in the privacy notice. */
  retentionDays: 180,
  /** Embedding dimensionality of the (pretrained) model output. */
  embeddingDim: 128,
  /** Minimum detector quality [0..1] to accept a sample (rejects blurry / low
   *  light / low-resolution captures). */
  minSampleQuality: 0.45,
}

export const STUDENT_STATUS = ['active', 'inactive']

/** Biometric enrolment state — distinct from the person's profile status. */
export const ENROLLMENT_STATUS = ['not-enrolled', 'enrolled', 'deactivated']

export const ATTENDANCE_STATUS = ['present', 'unknown', 'absent']

export const SESSION_STATUS = ['scheduled', 'active', 'closed']

/** Government section a beneficiary/student is associated with (demo set). */
export const DEPARTMENTS = [
  'Social Welfare',
  'Backward Class Welfare',
  'Divyang (Disability) Welfare',
  'Education & Scholarships',
  'Safai Karamchari Welfare',
]

/** Attendance subjects/purposes a session can cover. */
export const SESSION_SUBJECTS = [
  'Morning Roll Call',
  'Hostel Night Presence',
  'Class Attendance',
  'Meal Headcount',
  'Skill Training Session',
  'Special Inspection Verification',
]

export function statusTitle(s) {
  return typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/** Validate a beneficiary/student profile (non-biometric fields only). */
export function validateStudentProfile(input) {
  const errors = {}
  if (!input.name || input.name.trim().length < 2) errors.name = 'Enter the full name.'
  if (!input.projectId) errors.projectId = 'Select a project.'
  if (!input.organizationId) errors.organizationId = 'Organization is required.'
  if (!input.department) errors.department = 'Select a department.'
  if (input.status && !STUDENT_STATUS.includes(input.status)) errors.status = 'Invalid status.'
  return errors
}

/** Validate an attendance session. */
export function validateSession(input) {
  const errors = {}
  if (!input.subject) errors.subject = 'Select a subject.'
  if (!input.projectId) errors.projectId = 'Select a project.'
  if (!input.date) errors.date = 'Pick a date.'
  return errors
}
