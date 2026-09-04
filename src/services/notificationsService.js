/**
 * ---------------------------------------------------------------------
 * NOTIFICATIONS SERVICE — centralized feed, clean polling, preferences
 * ---------------------------------------------------------------------
 * In-memory demo store. Real-time delivery:
 *   - There is no backend here, so "live" updates use clean POLLING: the
 *     context calls poll() on an interval and at most one queued item is
 *     released per call (the queue is tiny — deliberately not noisy).
 *   - With a backend, replace poll() with an EventSource (SSE) or WebSocket
 *     subscription; the store/actions below stay identical.
 *
 * Notification PREFERENCES (which categories the officer wants) live in
 * localStorage — a non-sensitive UI setting — and gate future delivery.
 * ---------------------------------------------------------------------
 */
import { delay } from './apiClient.js'
import { buildSeedNotifications, buildIncomingQueue, NOTIFICATION_CATEGORIES } from '../data/notificationsData.js'

let store = buildSeedNotifications()
let incoming = buildIncomingQueue()
let seq = 6000

const PREFS_KEY = 'seva-sakshi-notif-prefs'

// --- preferences ----------------------------------------------------------
export function getPreferences() {
  const base = Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c, true]))
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
    return { ...base, ...saved }
  } catch {
    return base
  }
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* storage unavailable — preferences simply won't persist this session */
  }
  return prefs
}

// --- reads ----------------------------------------------------------------
export async function listNotifications() {
  await delay(120)
  return { items: store.filter((n) => !n.archived).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) }
}

/** Synchronous snapshot (used by the context between polls). */
export function snapshot() {
  return store.filter((n) => !n.archived).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export function unreadCount() {
  return store.filter((n) => !n.archived && !n.read).length
}

// --- polling (stands in for SSE/WebSocket) --------------------------------
/**
 * Release at most one queued notification, respecting preferences. Returns
 * the current snapshot plus the item added (if any).
 */
export function poll() {
  const prefs = getPreferences()
  let added = null
  while (incoming.length && !added) {
    const next = incoming.shift()
    if (prefs[next.category] === false) continue // muted category — drop silently
    added = {
      id: `NTF-${seq++}`,
      ...next,
      projectName: next.projectName ?? null,
      timestamp: new Date().toISOString(),
      read: false,
      archived: false,
    }
    store = [added, ...store]
  }
  return { items: snapshot(), added }
}

// --- actions --------------------------------------------------------------
export function markRead(id) {
  const n = store.find((x) => x.id === id)
  if (n) n.read = true
  return snapshot()
}
export function markAllRead() {
  store.forEach((n) => { if (!n.archived) n.read = true })
  return snapshot()
}
export function archive(id) {
  const n = store.find((x) => x.id === id)
  if (n) n.archived = true
  return snapshot()
}
export function remove(id) {
  store = store.filter((x) => x.id !== id)
  return snapshot()
}
