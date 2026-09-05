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

/**
 * Structured attendance model (spec §2/§3). The internal session store keeps its
 * existing compact result values ('present' | 'absent' | 'unknown') for
 * back-compatibility; these enums add the richer vocabulary the UI/spec use and
 * map onto those values, so nothing downstream breaks.
 */

/** Per-student recognition outcome from the RecognitionProvider (spec §3). */
export const RECOGNITION_STATUS = {
  MATCHED: 'MATCHED',
  NOT_MATCHED: 'NOT_MATCHED',
  NO_FACE: 'NO_FACE',
  MULTIPLE_FACES: 'MULTIPLE_FACES',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
}
export const RECOGNITION_LABEL = {
  MATCHED: 'Matched',
  NOT_MATCHED: 'Not matched',
  NO_FACE: 'No face',
  MULTIPLE_FACES: 'Multiple faces',
  LOW_CONFIDENCE: 'Low confidence',
  NOT_AVAILABLE: 'Not available',
}

/** How an attendance result was produced (spec §3). */
export const ATTENDANCE_SOURCE = {
  FACE_RECOGNITION: 'FACE_RECOGNITION',
  MANUAL: 'MANUAL',
  MOCK_DEMO: 'MOCK_DEMO',
}

/** Spec session statuses (§2) mapped to the store's internal values. */
export const SESSION_STATE = {
  NOT_STARTED: 'draft',
  ACTIVE: 'in-progress',
  REVIEW_REQUIRED: 'review',
  SUBMITTED: 'submitted',
  LOCKED: 'locked',
}
/** Display label for an internal session status value. */
export const SESSION_STATE_LABEL = {
  draft: 'Not Started',
  'in-progress': 'Active',
  review: 'Review Required',
  submitted: 'Submitted',
  locked: 'Locked',
}

/** A NEEDS_REVIEW recognition outcome maps to the store's 'unknown' bucket. */
export const REVIEW_RECOGNITION = [
  RECOGNITION_STATUS.NO_FACE,
  RECOGNITION_STATUS.MULTIPLE_FACES,
  RECOGNITION_STATUS.LOW_CONFIDENCE,
  RECOGNITION_STATUS.NOT_MATCHED,
]

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
