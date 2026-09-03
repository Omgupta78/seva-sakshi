import { delay } from './apiClient.js'

/**
 * In-memory audit trail for the assignment engine — every "generate",
 * "accept", and "manual" action records who did it, when, the full
 * eligible-candidate list with scores, what was picked (and the seed,
 * for a "generate"/"accept" so the draw can be replayed), and — for a
 * manual override — the required reason. This is the AUDIT section of
 * the brief; a real backend would persist this to an
 * inspection_assignment_audit table rather than a page-lifetime array.
 */
let auditLog = []
let nextId = 1

export async function recordAuditEntry(entry) {
  await delay(120)
  const record = { id: `AUD-${nextId++}`, timestamp: new Date().toISOString(), ...entry }
  auditLog = [record, ...auditLog]
  return record
}

export async function listAuditEntries({ inspectionId } = {}) {
  await delay(120)
  return inspectionId ? auditLog.filter((e) => e.inspectionId === inspectionId) : auditLog
}

export function resetAuditLog() {
  auditLog = []
  nextId = 1
}
