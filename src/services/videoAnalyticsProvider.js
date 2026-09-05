/**
 * ---------------------------------------------------------------------
 * VIDEO ANALYTICS PROVIDER — future AI-video abstraction (spec §17)
 * ---------------------------------------------------------------------
 * This is an ARCHITECTURE STUB. No real AI video analytics runs here, and
 * nothing in this module should ever be presented as a proven event. It exists
 * so a real analytics engine (edge device or server-side model) can be dropped
 * in later behind the same interface:
 *
 *     getEvents(cameraId, opts) -> AnalyticsEvent[]
 *     getEventTypes()           -> supported event types
 *
 * MODE is 'demo': getEvents returns a small set of clearly-labelled sample
 * events ONLY when explicitly asked (includeDemo), each tagged demo:true so the
 * UI stamps "DEMO AI EVENT". By default it returns nothing — we do not
 * fabricate surveillance events.
 *
 * A real deployment would set MODE to 'live' and return model output; every
 * such event would still be an INDICATOR requiring human verification, never a
 * standalone accusation.
 * ---------------------------------------------------------------------
 */

export const MODE = 'demo'

/** Event categories the architecture is prepared to surface (advisory only). */
export const EVENT_TYPES = [
  { id: 'crowding', label: 'Crowding' },
  { id: 'inactivity', label: 'Unusual inactivity' },
  { id: 'restricted-area', label: 'Restricted-area activity' },
  { id: 'unexpected-movement', label: 'Unexpected movement' },
]

export function getEventTypes() {
  return EVENT_TYPES
}

/**
 * Analytics events for a camera. In demo mode this returns sample events only
 * when `includeDemo` is set, each labelled DEMO. It never runs real detection.
 * @returns {{ id, type, label, message, at, demo, advisory }[]}
 */
export async function getEvents(cameraId, { includeDemo = false } = {}) {
  if (MODE !== 'demo' || !includeDemo) return []
  const now = Date.now()
  return [
    { id: `AIE-${cameraId}-1`, type: 'crowding', label: 'Crowding', message: 'Higher-than-usual gathering detected near the covered area.', at: new Date(now - 12 * 60000).toISOString(), demo: true, advisory: true },
    { id: `AIE-${cameraId}-2`, type: 'inactivity', label: 'Unusual inactivity', message: 'No movement in the frame during expected active hours.', at: new Date(now - 90 * 60000).toISOString(), demo: true, advisory: true },
  ]
}

export const DISCLAIMER = 'DEMO AI EVENT — sample analytics only. No real AI video analysis is running; these are not proven events and require human verification.'
