/**
 * ---------------------------------------------------------------------
 * PROTOTYPE PERSISTENCE — localStorage-backed store snapshots
 * ---------------------------------------------------------------------
 * The service layer keeps its "tables" as in-memory arrays (see apiClient.js).
 * This module snapshots those arrays to localStorage so prototype data survives
 * a hard page reload, while keeping the SAME data model so a real backend can
 * replace it later — a service swaps `loadStore(key, seed)` / `saveStore(key)`
 * for `fetch()` calls and nothing else changes.
 *
 * SECURITY — what MUST NOT be persisted here:
 *   - passwords / credentials (never in these stores to begin with),
 *   - raw face embeddings / biometric templates (these live only in the
 *     in-memory biometricVault and are deliberately NOT snapshotted).
 * Only non-sensitive operational records (students, attendance results, camera
 * config, inspections) are persisted. Callers are responsible for not putting
 * sensitive fields into a persisted store.
 * ---------------------------------------------------------------------
 */

const PREFIX = 'seva-sakshi:v1:'

function available() {
  try {
    const k = `${PREFIX}__probe`
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

const STORAGE_OK = available()

/**
 * Load a persisted snapshot, or fall back to the seed (and persist it so the
 * first render and every later reload agree).
 * @param {string} key
 * @param {*|(() => *)} seed  value or factory
 */
export function loadStore(key, seed) {
  const fresh = () => (typeof seed === 'function' ? seed() : seed)
  if (!STORAGE_OK) return fresh()
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw != null) return JSON.parse(raw)
  } catch {
    /* corrupt/unavailable — fall through to seed */
  }
  const value = fresh()
  saveStore(key, value)
  return value
}

/** Snapshot the current store value. Best-effort; never throws to the caller. */
export function saveStore(key, value) {
  if (!STORAGE_OK) return
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* quota/serialisation error — prototype continues in memory */
  }
}

export function clearStore(key) {
  if (!STORAGE_OK) return
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

/** Highest numeric suffix across ids like "SES-124" / "STU-1007" (for id sequencing). */
export function maxIdNum(items, field = 'id') {
  let max = 0
  for (const it of items ?? []) {
    const n = parseInt(String(it?.[field] ?? '').replace(/\D+/g, ''), 10)
    if (Number.isFinite(n) && n > max) max = n
  }
  return max
}
