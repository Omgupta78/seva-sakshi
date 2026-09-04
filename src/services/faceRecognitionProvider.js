/**
 * ---------------------------------------------------------------------
 * FACE RECOGNITION PROVIDER — swappable pretrained-model boundary
 * ---------------------------------------------------------------------
 * The whole module talks to face recognition ONLY through this interface:
 *
 *     loadModels()                       -> Promise<void>
 *     detectFaces(frame, opts)           -> Detection[]        (0..n faces)
 *     alignFace(detection)               -> AlignedFace
 *     computeEmbedding(alignedFace, ctx) -> number[]           (unit vector)
 *
 * We do NOT train anything. To use a reputable pretrained model, replace the
 * demo body of each function with one of:
 *
 *   • Browser (client-side), face-api.js — pretrained SSD-MobileNet /
 *     TinyFaceDetector for detection, 68-point landmarks for alignment, and
 *     FaceRecognitionNet (ResNet-34) for a 128-D descriptor:
 *         await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
 *         const d = await faceapi.detectAllFaces(video)
 *                       .withFaceLandmarks().withFaceDescriptors()
 *         // d[i].descriptor is the embedding
 *
 *   • Server-side (recommended for biometrics) — send the FRAME to a service
 *     running ArcFace / InsightFace / AWS Rekognition and receive the
 *     embedding there, so raw templates never live in the browser at all.
 *
 * DEMO MODE (this file): there is no pretrained model bundled, so embeddings
 * are SIMULATED — deterministically derived from an identity token so the
 * matching maths downstream is real and testable, while detection outcomes
 * can be driven for the required test scenarios. This is clearly surfaced in
 * the UI; recognition is never presented as real or perfectly accurate.
 * ---------------------------------------------------------------------
 */
import { ATTENDANCE_CONFIG } from '../data/attendanceModels.js'

export const PROVIDER_INFO = {
  mode: 'demo',
  label: 'Demo provider (simulated embeddings)',
  swapTarget: 'face-api.js (browser) or ArcFace/InsightFace (server)',
}

let loaded = false

/** In production this loads pretrained weights (face-api nets / SDK init). */
export async function loadModels() {
  if (loaded) return
  await new Promise((r) => setTimeout(r, 300))
  loaded = true
}

export function isLoaded() {
  return loaded
}

// --- deterministic helpers (demo only) -----------------------------------

function seedFrom(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A deterministic unit vector for an identity token (the simulated template). */
function baseVector(identityToken) {
  const rand = mulberry32(seedFrom(identityToken))
  const v = Array.from({ length: ATTENDANCE_CONFIG.embeddingDim }, () => rand() * 2 - 1)
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}

/**
 * Detect faces in a frame. In DEMO mode the outcome is driven by
 * `opts.scenario` so the required tests (one / none / multiple / low quality)
 * can be exercised without a live model.
 * @returns {{ box: object, quality: number, identityToken: string|null }[]}
 */
export function detectFaces(_frame, opts = {}) {
  const { scenario = 'one', identityToken = null } = opts
  const box = { x: 0.3, y: 0.2, width: 0.4, height: 0.55 }
  switch (scenario) {
    case 'none':
      return []
    case 'multiple':
      return [
        { box, quality: 0.8, identityToken },
        { box: { ...box, x: 0.05 }, quality: 0.7, identityToken: null },
      ]
    case 'low-quality':
      return [{ box, quality: 0.28, identityToken }]
    case 'one':
    default:
      return [{ box, quality: 0.86, identityToken }]
  }
}

/** Landmark-based alignment. Demo: passthrough carrying quality + identity. */
export function alignFace(detection) {
  return { quality: detection.quality, identityToken: detection.identityToken }
}

/**
 * Produce an embedding for an aligned face. DEMO: derived from the identity
 * token (so a person matches themselves) with quality-scaled noise; an
 * absent/unknown token yields a random-ish vector that will NOT match anyone.
 * The returned vector is SENSITIVE — callers must hand it straight to the
 * biometric vault and never expose or log it.
 * @returns {number[]} unit vector of length ATTENDANCE_CONFIG.embeddingDim
 */
export function computeEmbedding(alignedFace, ctx = {}) {
  const token = alignedFace.identityToken ?? ctx.identityToken ?? `anon-${Math.random()}`
  const base = baseVector(token)
  const quality = alignedFace.quality ?? 0.8
  const noiseAmt = (1 - quality) * 0.25 + 0.02
  const rand = mulberry32(seedFrom(token + (ctx.sampleIndex ?? 0)))
  const noisy = base.map((x) => x + (rand() * 2 - 1) * noiseAmt)
  const norm = Math.sqrt(noisy.reduce((s, x) => s + x * x, 0)) || 1
  return noisy.map((x) => x / norm)
}

/** Cosine similarity of two unit-ish vectors → [-1, 1]. */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}
