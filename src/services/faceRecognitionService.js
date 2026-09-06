/**
 * ---------------------------------------------------------------------
 * FaceRecognitionService — the single recognition interface (spec §5)
 * ---------------------------------------------------------------------
 * The app depends on THIS named interface, not on any specific recognition
 * library. It composes the existing pieces behind one contract:
 *
 *     detectFace(frame, opts)     -> { detection, faceCount, quality }
 *     enrollFace(studentId, opts) -> { status, sampleCount }        (no templates)
 *     matchFace(frame, opts)      -> { recognitionStatus, studentId, confidence, source }
 *     getConfidence(result)       -> number | null
 *
 * MODE is 'mock' today → MockFaceRecognitionService. Every result carries a
 * DEMO/MOCK label so the UI never presents simulated recognition as real AI.
 * To go live, provide a RealFaceRecognitionService with the same four methods
 * and swap `activeService` — the Attendance/Enrolment UI does not change.
 *
 * Biometric templates are produced by the provider and handed straight to the
 * in-memory biometricVault; they are NEVER returned from this service or shown
 * in the UI, and are NEVER persisted to localStorage.
 * ---------------------------------------------------------------------
 */
import { loadModels, detectFaces, alignFace, computeEmbedding } from './faceRecognitionProvider.js'
import { enroll as vaultEnroll, getEnrollmentMeta } from './biometricVault.js'
import { detectFace as providerDetect, recognizeFace as providerRecognize } from './recognitionProvider.js'

export const MODE = 'mock'
export const MODE_LABEL = MODE === 'mock' ? 'DEMO / MOCK' : 'Live Recognition'

/** The mock implementation used by the prototype. */
export const MockFaceRecognitionService = {
  id: 'mock',
  label: 'MockFaceRecognitionService',

  /** Detection only — how many faces are in the frame (never identity). */
  async detectFace(frame, opts = {}) {
    return providerDetect(frame, opts)
  },

  /**
   * Enrol a student's face. Frames are turned into embeddings by the provider
   * and stored in the vault; only a non-biometric status/metadata is returned.
   */
  async enrollFace(studentId, { samples = 3 } = {}) {
    await loadModels()
    const embeddings = []
    for (let i = 0; i < samples; i++) {
      const det = detectFaces(null, { scenario: 'one', identityToken: studentId })[0]
      if (!det) { const e = new Error('No face detected — try again in better light.'); e.code = 'NO_FACE'; throw e }
      embeddings.push(computeEmbedding(alignFace(det), { identityToken: studentId, sampleIndex: i }))
    }
    vaultEnroll(studentId, embeddings) // templates stay in the vault
    const meta = getEnrollmentMeta(studentId)
    return { status: meta.status, sampleCount: meta.sampleCount } // no embeddings
  },

  /** Recognise the (single) face in a frame → structured status + confidence. */
  async matchFace(frame, opts = {}) {
    return providerRecognize(frame, opts)
  },

  /** Convenience accessor for a match result's confidence. */
  getConfidence(result) {
    return result?.confidence ?? null
  },
}

/** The active service the app talks to. Swap for a real one to go live. */
let activeService = MockFaceRecognitionService

export function getFaceRecognitionService() {
  return activeService
}
export function setFaceRecognitionService(service) {
  activeService = service ?? MockFaceRecognitionService
}

// Convenience re-exports so callers can `import { matchFace } from '.../faceRecognitionService'`.
export const detectFace = (frame, opts) => activeService.detectFace(frame, opts)
export const enrollFace = (studentId, opts) => activeService.enrollFace(studentId, opts)
export const matchFace = (frame, opts) => activeService.matchFace(frame, opts)
export const getConfidence = (result) => activeService.getConfidence(result)
