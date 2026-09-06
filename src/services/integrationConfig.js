/**
 * ---------------------------------------------------------------------
 * INTEGRATION CONFIG — the single source of truth for what is actually wired
 * ---------------------------------------------------------------------
 * Seva Sakshi talks to three external integrations that are NOT connected in
 * this repository:
 *   - RECOGNITION   — an authorized biometric identity provider,
 *   - CCTV_GATEWAY  — a media gateway (RTSP → HLS/WebRTC),
 *   - VIDEO_SERVICE — a WebRTC signaling + STUN/TURN service.
 *
 * Each is one of:
 *   'not-connected' / 'not-configured'  → the honest default. The UI shows an
 *        explicit "provider not connected / gateway not configured" state and
 *        NEVER fabricates a result (no fake face match, stream or participant).
 *   'demo'  → clearly-labelled simulated behaviour, for demonstrations only.
 *   'live'  → a real provider is wired (swap points documented per service).
 *
 * Resolution order: build-time env var → localStorage demo opt-in → default.
 * The localStorage opt-in (`seva-demo-integrations = '1'`) turns ALL three to
 * 'demo' for a controlled demonstration; it is developer-set and everything it
 * enables stays visibly labelled DEMO.
 *
 * Required env vars for LIVE (see INTEGRATION-STATUS.md):
 *   VITE_RECOGNITION_MODE = live | demo | not-connected
 *   VITE_CCTV_GATEWAY     = live | demo | not-configured   (+ gateway/backend URL, server-side RTSP creds)
 *   VITE_VIDEO_SERVICE    = live | demo | not-configured   (+ signaling URL, STUN/TURN)
 * ---------------------------------------------------------------------
 */

function demoOptIn() {
  try { return localStorage.getItem('seva-demo-integrations') === '1' } catch { return false }
}

function resolve(envValue, allowed, fallback) {
  const v = String(envValue ?? '').toLowerCase()
  if (allowed.includes(v)) return v
  if (demoOptIn()) return 'demo'
  return fallback
}

const env = import.meta.env ?? {}

export const RECOGNITION = resolve(env.VITE_RECOGNITION_MODE, ['live', 'demo', 'not-connected'], 'not-connected')
export const CCTV_GATEWAY = resolve(env.VITE_CCTV_GATEWAY, ['live', 'demo', 'not-configured'], 'not-configured')
export const VIDEO_SERVICE = resolve(env.VITE_VIDEO_SERVICE, ['live', 'demo', 'not-configured'], 'not-configured')

/** Human labels for the honest "unavailable" states. */
export const LABELS = {
  recognitionNotConnected: 'Identity verification provider not connected',
  cctvNotConfigured: 'Camera gateway not configured',
  videoNotConfigured: 'Video service not configured',
}

export const isRecognitionConnected = () => RECOGNITION === 'live'
export const isRecognitionAvailable = () => RECOGNITION === 'live' || RECOGNITION === 'demo'
export const isCctvConfigured = () => CCTV_GATEWAY === 'live'
export const isCctvAvailable = () => CCTV_GATEWAY === 'live' || CCTV_GATEWAY === 'demo'
export const isVideoConfigured = () => VIDEO_SERVICE === 'live'
export const isVideoAvailable = () => VIDEO_SERVICE === 'live' || VIDEO_SERVICE === 'demo'
