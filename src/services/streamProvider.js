/**
 * ---------------------------------------------------------------------
 * STREAM PROVIDER — the single video-playback boundary (spec §2/§4)
 * ---------------------------------------------------------------------
 * Components render video ONLY through this facade — never RTSP, never a
 * media-server URL, never a credential. The real pipeline is:
 *
 *   PHYSICAL CCTV → RTSP → MEDIA SERVER/GATEWAY → WebRTC/HLS → BACKEND authz → BROWSER
 *
 * and the browser receives only a short-lived, brokered playback descriptor.
 *
 *   requestCameraPlayback(cameraId) -> descriptor   (the documented boundary)
 *   getStatus(cameraId)             -> { connection, mode, transport }
 *   getCameraHealth(cameraId)       -> { status, lastSeen, latency, reason }
 *   stopStream(token)               -> releases the brokered session
 *
 * PROVIDERS
 *   - DemoStreamProvider  (ACTIVE): simulated feed, labelled "DEMO STREAM".
 *   - HLSStreamProvider   (PLACEHOLDER): plays a brokered .m3u8 in live mode.
 *   - WebRTCStreamProvider(PLACEHOLDER): relays gateway WebRTC in live mode.
 * The UI does not know or care which provider is active — it only reads the
 * normalised descriptor.
 *
 * STREAM_MODE is 'demo' by default and MUST NOT default to 'live'. In 'live'
 * mode, when no real gateway/URL is available the descriptor comes back
 * `available:false` with label "Live feed unavailable" — we never silently
 * fall back to fake live footage.
 * ---------------------------------------------------------------------
 */
import { requestPlayback, releasePlayback } from './cctvStreamService.js'
import { requestInstitutionPlayback } from './institutionCctvService.js'
import { getStreamConfig, STREAM_TYPES } from '../data/streamConfig.js'
import { CAMERAS } from '../data/cctvSeedData.js'
import { INSTITUTION_CAMERAS } from '../data/institutionCctvData.js'
import { CCTV_GATEWAY, LABELS } from './integrationConfig.js'

/** 'not-configured' (default, honest) | 'demo' (simulated, labelled) | 'live'.
 *  Driven by integrationConfig. When 'not-configured' the player shows
 *  "Camera gateway not configured" — never a fake stream called live. */
export const STREAM_MODE = CCTV_GATEWAY
export const STREAM_MODE_LABEL = STREAM_MODE === 'live' ? 'Live Stream' : STREAM_MODE === 'demo' ? 'Demo Stream' : LABELS.cctvNotConfigured

/** Connection lifecycle a player surfaces (spec §6/§7). */
export const CONNECTION = { LIVE: 'LIVE', CONNECTING: 'CONNECTING', OFFLINE: 'OFFLINE', NO_SIGNAL: 'NO_SIGNAL', ERROR: 'ERROR' }

/** Camera-health status (spec §6). */
export const HEALTH_STATUS = { ONLINE: 'ONLINE', OFFLINE: 'OFFLINE', CONNECTING: 'CONNECTING', NO_SIGNAL: 'NO_SIGNAL', ERROR: 'ERROR' }

/** Institution-scoped cameras use the ICAM- prefix; the project fleet uses CAM-. */
function isInstitutionCamera(id) { return /^ICAM-/i.test(id ?? '') }

// --- providers ------------------------------------------------------------

/** DemoStreamProvider (ACTIVE) — delegates to the demo brokers, which return a
 *  safe descriptor (no URL/credential) and honestly report offline cameras. */
const DemoStreamProvider = {
  id: 'demo',
  label: 'DemoStreamProvider',
  async getStream(cameraId) {
    const raw = isInstitutionCamera(cameraId)
      ? await requestInstitutionPlayback(cameraId)
      : await requestPlayback(cameraId)
    return {
      available: !!raw.available,
      transport: raw.transport ?? null,
      label: raw.available ? 'DEMO STREAM' : 'Live feed unavailable',
      token: raw.token ?? null,
      expiresAt: raw.expiresAt ?? null,
      reason: raw.reason ?? null,
      playbackUrl: null,
    }
  },
  async stopStream(token) { return releasePlayback(token) },
}

/**
 * HLSStreamProvider (PLACEHOLDER) — in live mode this would POST to the backend
 * playback endpoint and receive a short-lived, brokered `.m3u8` URL to feed an
 * HLS player (e.g. hls.js). No gateway is connected, so it reports unavailable
 * rather than inventing a feed.
 */
const HLSStreamProvider = {
  id: 'hls',
  label: 'HLSStreamProvider',
  async getStream() {
    // TODO(live): const r = await fetch(`/api/cctv/${cameraId}/playback`, { method:'POST' })
    //             return { available:true, transport:'hls', playbackUrl:r.playbackUrl, token:r.token, ... }
    return { available: false, transport: 'hls', label: 'Live feed unavailable', token: null, expiresAt: null, playbackUrl: null, reason: 'HLS media gateway not connected.' }
  },
  async stopStream() { /* revoke session at the gateway in live mode */ },
}

/**
 * WebRTCStreamProvider (PLACEHOLDER) — in live mode this negotiates a WebRTC
 * session with the gateway (SDP offer/answer via the backend) and hands the
 * player a MediaStream. Not connected here.
 */
const WebRTCStreamProvider = {
  id: 'webrtc',
  label: 'WebRTCStreamProvider',
  async getStream() {
    return { available: false, transport: 'webrtc', label: 'Live feed unavailable', token: null, expiresAt: null, playbackUrl: null, reason: 'WebRTC media gateway not connected.' }
  },
  async stopStream() { /* close RTCPeerConnection + revoke session in live mode */ },
}

export const STREAM_PROVIDERS = {
  demo: DemoStreamProvider.label,
  hls: HLSStreamProvider.label,
  webrtc: WebRTCStreamProvider.label,
}

/** Choose the provider for a config. Demo mode → Demo; live mode → by streamType. */
function selectProvider(streamType) {
  if (STREAM_MODE === 'demo') return DemoStreamProvider
  if (streamType === STREAM_TYPES.WEBRTC) return WebRTCStreamProvider
  return HLSStreamProvider // HLS is the default browser output for repackaged RTSP
}

/** Non-biometric camera lookup for ingestion/heartbeat (no credentials here). */
function cameraMeta(cameraId) {
  const cam = isInstitutionCamera(cameraId)
    ? INSTITUTION_CAMERAS.find((c) => c.id === cameraId)
    : CAMERAS.find((c) => c.id === cameraId)
  return cam ?? null
}

// --- public boundary ------------------------------------------------------

/**
 * Request a playback session for one camera (spec §2). Resolves the camera's
 * stream config, routes to the active provider, and returns a browser-safe
 * descriptor — never an RTSP URL or credential.
 */
export async function requestCameraPlayback(cameraId) {
  // Honest boundary: no media gateway configured → never fabricate a stream.
  if (STREAM_MODE === 'not-configured') {
    return {
      cameraId, mode: 'not-configured', provider: null, streamType: null, mediaServerId: null,
      available: false, transport: null, label: LABELS.cctvNotConfigured,
      token: null, expiresAt: null, playbackUrl: null,
      reason: 'No media gateway is configured for this deployment. Configure VITE_CCTV_GATEWAY + a gateway/backend to enable live playback.',
    }
  }
  const meta = cameraMeta(cameraId)
  const cfg = getStreamConfig(cameraId, { mode: STREAM_MODE, ingestion: meta?.sourceProtocol ?? 'rtsp' })
  const provider = selectProvider(cfg.streamType)
  const raw = await provider.getStream(cameraId)
  return {
    cameraId,
    mode: STREAM_MODE,
    provider: provider.label,
    streamType: cfg.streamType,
    mediaServerId: cfg.mediaServerId,
    available: !!raw.available,
    transport: raw.transport ?? null,
    // Honest labelling: a demo stream is never called "LIVE CCTV".
    label: raw.label ?? (raw.available ? (STREAM_MODE === 'demo' ? 'DEMO STREAM' : 'LIVE') : 'Live feed unavailable'),
    token: raw.token ?? null,
    expiresAt: raw.expiresAt ?? null,
    playbackUrl: raw.playbackUrl ?? null, // brokered, per-session; never RTSP
    reason: raw.reason ?? null,
  }
}

/** Back-compat alias — existing players import `getStream`. */
export const getStream = requestCameraPlayback

/** Lightweight connection status for one camera. */
export async function getStatus(cameraId) {
  const s = await requestCameraPlayback(cameraId)
  return {
    cameraId,
    connection: s.available ? CONNECTION.LIVE : CONNECTION.OFFLINE,
    mode: s.mode,
    transport: s.transport,
  }
}

/**
 * Camera health for status UIs (spec §6). Derives from the (non-sensitive)
 * inventory heartbeat + status. `latency` and precise `lastSeen` come from the
 * gateway in a live deployment; here they are demo values.
 * @returns {{ status, lastSeen, latency, reason }}
 */
export async function getCameraHealth(cameraId) {
  const meta = cameraMeta(cameraId)
  if (!meta) return { status: HEALTH_STATUS.ERROR, lastSeen: null, latency: null, reason: 'Camera not found in inventory.' }
  const map = { online: HEALTH_STATUS.ONLINE, warning: HEALTH_STATUS.CONNECTING, offline: HEALTH_STATUS.OFFLINE }
  const status = map[meta.status] ?? HEALTH_STATUS.NO_SIGNAL
  const ageSec = meta.lastHeartbeat ? Math.max(0, Math.round((Date.now() - new Date(meta.lastHeartbeat).getTime()) / 1000)) : null
  const latency = status === HEALTH_STATUS.ONLINE ? 40 + (Math.abs(hash(cameraId)) % 60) // ms (demo)
    : status === HEALTH_STATUS.CONNECTING ? 180 + (Math.abs(hash(cameraId)) % 220) : null
  const reason = status === HEALTH_STATUS.OFFLINE ? 'No heartbeat from the camera/gateway.'
    : status === HEALTH_STATUS.CONNECTING ? 'Connection unstable — intermittent packet loss.' : null
  return { status, lastSeen: meta.lastHeartbeat ?? null, lastSeenAgeSec: ageSec, latency, reason }
}

/** Release a brokered playback session (revoke token / stop the pipeline). */
export async function stopStream(token) {
  return releasePlayback(token)
}

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619) }
  return h | 0
}
