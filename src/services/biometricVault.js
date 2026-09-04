/**
 * ---------------------------------------------------------------------
 * BIOMETRIC VAULT — sensitive face templates, isolated from the frontend
 * ---------------------------------------------------------------------
 * Face embeddings are biometric data and are treated as sensitive:
 *
 *   - They live ONLY in this module's private `vault` map. No React state,
 *     no localStorage/sessionStorage/IndexedDB, ever.
 *   - No function here RETURNS a raw embedding. Callers can enrol, match
 *     (getting back an id + score only), read non-biometric metadata
 *     (sample count / status / dates), deactivate, or delete — nothing else.
 *   - Raw templates are never logged.
 *   - Deletion and deactivation are first-class; a configurable retention
 *     sweep can purge old templates.
 *
 * In production this file's responsibilities belong on a secured server with
 * encryption at rest; the browser would send frames and receive match
 * results, so templates would never reach the client. The API shape below is
 * intentionally the same, so that swap changes only the implementation.
 * ---------------------------------------------------------------------
 */
import { cosineSimilarity } from './faceRecognitionProvider.js'
import { ATTENDANCE_CONFIG } from '../data/attendanceModels.js'

/** Private store: studentId -> { templates:number[][], status, enrolledAt, updatedAt }.
 *  Deliberately NOT exported. */
const vault = new Map()

/** Store templates for a student (replaces any existing enrolment). */
export function enroll(studentId, embeddings, { at } = {}) {
  if (!studentId || !Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Enrolment requires a student id and at least one sample.')
  }
  const now = at ?? new Date().toISOString()
  const existing = vault.get(studentId)
  vault.set(studentId, {
    templates: embeddings.map((e) => [...e]),
    status: 'enrolled',
    enrolledAt: existing?.enrolledAt ?? now,
    updatedAt: now,
  })
  return getEnrollmentMeta(studentId)
}

/** Non-biometric metadata only — safe to surface in the UI. */
export function getEnrollmentMeta(studentId) {
  const rec = vault.get(studentId)
  if (!rec) return { studentId, status: 'not-enrolled', sampleCount: 0, enrolledAt: null, updatedAt: null }
  return {
    studentId,
    status: rec.status,
    sampleCount: rec.templates.length,
    enrolledAt: rec.enrolledAt,
    updatedAt: rec.updatedAt,
  }
}

export function isEnrolled(studentId) {
  const rec = vault.get(studentId)
  return !!rec && rec.status === 'enrolled'
}

/**
 * Compare a probe embedding against all ACTIVE enrolments.
 * @returns {{ studentId: string|null, score: number }} best match; studentId
 *          is null when nothing clears the threshold (stays Unknown).
 */
export function matchEmbedding(embedding, threshold = ATTENDANCE_CONFIG.matchThreshold) {
  let best = { studentId: null, score: 0 }
  for (const [studentId, rec] of vault.entries()) {
    if (rec.status !== 'enrolled') continue
    // score against this identity = its closest sample
    let s = 0
    for (const t of rec.templates) s = Math.max(s, cosineSimilarity(embedding, t))
    if (s > best.score) best = { studentId, score: s }
  }
  // Below threshold → not confident enough → Unknown (studentId cleared).
  if (best.score < threshold) return { studentId: null, score: +best.score.toFixed(4) }
  return { studentId: best.studentId, score: +best.score.toFixed(4) }
}

/** Deactivate (retain but stop matching) — reversible. */
export function deactivate(studentId) {
  const rec = vault.get(studentId)
  if (rec) rec.status = 'deactivated'
  return getEnrollmentMeta(studentId)
}

export function reactivate(studentId) {
  const rec = vault.get(studentId)
  if (rec) rec.status = 'enrolled'
  return getEnrollmentMeta(studentId)
}

/** Permanently delete a student's biometric templates. */
export function deleteEnrollment(studentId) {
  vault.delete(studentId)
  return getEnrollmentMeta(studentId)
}

/** Retention sweep — purge templates older than `days`. Returns purged count. */
export function retentionSweep(days = ATTENDANCE_CONFIG.retentionDays) {
  const cutoff = Date.now() - days * 86400000
  let purged = 0
  for (const [id, rec] of vault.entries()) {
    if (new Date(rec.enrolledAt).getTime() < cutoff) {
      vault.delete(id)
      purged++
    }
  }
  return purged
}

/** Count of active enrolments (non-biometric aggregate). */
export function enrolledCount() {
  let n = 0
  for (const rec of vault.values()) if (rec.status === 'enrolled') n++
  return n
}
