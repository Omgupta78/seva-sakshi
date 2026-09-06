/**
 * ---------------------------------------------------------------------
 * RECOGNITION PROVIDER — the single face-recognition boundary
 * ---------------------------------------------------------------------
 * The attendance module talks to face recognition ONLY through this facade:
 *
 *     detectFace(frame, opts)     -> { detection, faceCount, quality }
 *     recognizeFace(frame, opts)  -> { recognitionStatus, studentId, confidence, source, timestamp }
 *
 * DETECTION and RECOGNITION are deliberately separate concerns (spec §5/§6):
 *   - detectFace answers "how many faces are in this frame?" — NO_FACE /
 *     ONE_FACE / MULTIPLE_FACES. Attendance is NEVER marked from detection
 *     alone; NO_FACE and MULTIPLE_FACES always route to human review.
 *   - recognizeFace runs only when exactly one face is present, and returns a
 *     structured recognitionStatus + confidence.
 *
 * MODE is 'demo' today: outcomes are simulated (clearly surfaced in the UI as
 * "Demo Recognition Mode") and never presented as real AI. The real path is
 * already wired below (detect → align → embed → match the biometric vault); to
 * go live, flip MODE to 'live' after loading a pretrained model in
 * faceRecognitionProvider.js. NOTHING in the attendance UI or service changes —
 * that is the point of this boundary.
 * ---------------------------------------------------------------------
 */
import { loadModels, detectFaces, alignFace, computeEmbedding, PROVIDER_INFO } from './faceRecognitionProvider.js'
import { matchEmbedding } from './biometricVault.js'
import { ATTENDANCE_CONFIG, RECOGNITION_STATUS, ATTENDANCE_SOURCE } from '../data/attendanceModels.js'
import { RECOGNITION, LABELS, isRecognitionAvailable } from './integrationConfig.js'

/** 'not-connected' (default, honest) | 'demo' (simulated, labelled) | 'live' (real model + vault). */
export const MODE = RECOGNITION
export const MODE_LABEL = MODE === 'live' ? 'Live Recognition' : MODE === 'demo' ? 'Demo Recognition (simulated)' : LABELS.recognitionNotConnected
export const CONNECTED = isRecognitionAvailable()
export const PROVIDER = PROVIDER_INFO

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0)
}

/**
 * Count faces in a frame (detection only — no identity).
 * @returns {{ detection: 'NO_FACE'|'ONE_FACE'|'MULTIPLE_FACES', faceCount: number, quality: number }}
 */
export async function detectFace(frame, { scenario = 'one', identityToken = null } = {}) {
  const dets = detectFaces(frame, { scenario, identityToken })
  const faceCount = dets.length
  const detection = faceCount === 0 ? 'NO_FACE' : faceCount > 1 ? 'MULTIPLE_FACES' : 'ONE_FACE'
  return { detection, faceCount, quality: dets[0]?.quality ?? 0 }
}

/**
 * Recognise the (single) face in a frame. Runs detection first; only a single
 * detected face proceeds to identity matching.
 * @returns {{ recognitionStatus: string, studentId: string|null, confidence: number|null,
 *             source: string, timestamp: string, faceCount: number }}
 */
export async function recognizeFace(frame, { scenario = 'match', identityToken = null } = {}) {
  // Honest boundary: with no authorized provider connected we NEVER fabricate an
  // identity match. Callers must fall back to authorized manual verification.
  if (!isRecognitionAvailable()) {
    return { recognitionStatus: RECOGNITION_STATUS.NOT_AVAILABLE, studentId: null, confidence: null, source: null, timestamp: new Date().toISOString(), faceCount: 0 }
  }
  const source = MODE === 'demo' ? ATTENDANCE_SOURCE.MOCK_DEMO : ATTENDANCE_SOURCE.FACE_RECOGNITION
  const timestamp = new Date().toISOString()

  // Map the demo scenario onto a detector outcome so detection is exercised.
  const detScenario = scenario === 'no-face' ? 'none' : scenario === 'multiple' ? 'multiple' : scenario === 'low-confidence' ? 'low-quality' : 'one'
  const det = await detectFace(frame, { scenario: detScenario, identityToken })
  const base = { studentId: null, confidence: null, source, timestamp, faceCount: det.faceCount }

  if (det.detection === 'NO_FACE') return { ...base, recognitionStatus: RECOGNITION_STATUS.NO_FACE }
  if (det.detection === 'MULTIPLE_FACES') return { ...base, recognitionStatus: RECOGNITION_STATUS.MULTIPLE_FACES }

  // Exactly one face → recognise.
  if (MODE === 'demo') {
    if (scenario === 'low-confidence') return { ...base, recognitionStatus: RECOGNITION_STATUS.LOW_CONFIDENCE, confidence: 41 + (hash(identityToken) % 8) }
    if (scenario === 'not-matched') return { ...base, recognitionStatus: RECOGNITION_STATUS.NOT_MATCHED }
    // Deterministic demo confidence (labelled as demo everywhere it is shown).
    const confidence = 88 + (hash(identityToken) % 11)
    return { ...base, recognitionStatus: RECOGNITION_STATUS.MATCHED, studentId: identityToken, confidence }
  }

  // --- LIVE path (used once MODE === 'live') --------------------------------
  await loadModels()
  const aligned = alignFace(detectFaces(frame, { scenario: 'one', identityToken })[0])
  const embedding = computeEmbedding(aligned, { identityToken })
  const { studentId, score } = matchEmbedding(embedding)
  if (!studentId) {
    const conf = Math.round(score * 100)
    return score < ATTENDANCE_CONFIG.matchThreshold * 0.7
      ? { ...base, recognitionStatus: RECOGNITION_STATUS.NOT_MATCHED }
      : { ...base, recognitionStatus: RECOGNITION_STATUS.LOW_CONFIDENCE, confidence: conf }
  }
  return { ...base, recognitionStatus: RECOGNITION_STATUS.MATCHED, studentId, confidence: Math.round(score * 100) }
}
