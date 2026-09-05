/**
 * ---------------------------------------------------------------------
 * STREAM PROVIDER — the single video-playback boundary (spec §7)
 * ---------------------------------------------------------------------
 * Components render video ONLY through this facade — never RTSP, never a
 * media-server URL, never a credential. The real pipeline is:
 *
 *     PHYSICAL CCTV → RTSP → MEDIA SERVER / GATEWAY → WebRTC / HLS → BROWSER
 *
 * and the browser receives only a short-lived, brokered playback descriptor.
 *
 *     getStream(cameraId)  -> { mode, provider, available, transport, label,
 *                               token, expiresAt, reason }
 *     getStatus(cameraId)  -> { connection, mode, transport }
 *     stopStream(token)    -> releases the brokered session
 *
 * MODE is 'demo' today (DemoStreamProvider): no real gateway is connected, so
 * a stream comes back labelled "DEMO STREAM" and the player shows a clearly
 * simulated scene — never presented as a live government camera. The
 * WebRTC/HLS providers are prepared: when a real gateway is wired, set
 * STREAM_MODE to 'live' and return the gateway's playbackUrl from the
 * underlying broker; nothing in the components changes.
 *
 * This facade delegates to the two existing brokers (Department project fleet
 * and institution-scoped cameras) and normalises their output, so RBAC and
 * "no credentials in the browser" continue to be enforced there.
 * ---------------------------------------------------------------------
 */
import { requestPlayback, releasePlayback } from './cctvStreamService.js'
import { requestInstitutionPlayback } from './institutionCctvService.js'

/** 'demo' = DemoStreamProvider (simulated); 'live' = real gateway (WebRTC/HLS). */
export const STREAM_MODE = 'demo'
export const STREAM_MODE_LABEL = STREAM_MODE === 'demo' ? 'Demo Stream' : 'Live Stream'

/** Providers behind this facade. Only the demo one is active today. */
export const STREAM_PROVIDERS = {
  demo: 'DemoStreamProvider',
  webrtc: 'WebRTCStreamProvider', // prepared — relays gateway WebRTC
  hls: 'HLSStreamProvider', // prepared — plays brokered HLS (.m3u8)
}

/** Connection lifecycle a player surfaces (spec §6/§14). */
export const CONNECTION = { LIVE: 'LIVE', CONNECTING: 'CONNECTING', OFFLINE: 'OFFLINE', NO_SIGNAL: 'NO_SIGNAL', ERROR: 'ERROR' }

/** Institution-scoped cameras use the ICAM- prefix; project fleet uses CAM-. */
function isInstitutionCamera(id) { return /^ICAM-/i.test(id ?? '') }

/**
 * Ask the (demo) gateway for a safe playback descriptor for one camera.
 * Routes to the correct broker; both enforce their own RBAC and never return
 * an RTSP URL or credential.
 */
export async function getStream(cameraId) {
  const raw = isInstitutionCamera(cameraId)
    ? await requestInstitutionPlayback(cameraId)
    : await requestPlayback(cameraId)
  return {
    cameraId,
    mode: STREAM_MODE,
    provider: STREAM_PROVIDERS[STREAM_MODE] ?? STREAM_PROVIDERS.demo,
    available: !!raw.available,
    transport: raw.transport ?? null, // 'hls' | 'webrtc' | null
    // Honest labelling: a demo stream is never called "LIVE CCTV".
    label: raw.available ? (STREAM_MODE === 'demo' ? 'DEMO STREAM' : 'LIVE') : 'Live feed unavailable',
    token: raw.token ?? null,
    expiresAt: raw.expiresAt ?? null,
    reason: raw.reason ?? null,
  }
}

/** Lightweight connection status for one camera. */
export async function getStatus(cameraId) {
  const s = await getStream(cameraId)
  return {
    cameraId,
    connection: s.available ? CONNECTION.LIVE : CONNECTION.OFFLINE,
    mode: s.mode,
    transport: s.transport,
  }
}

/** Release a brokered playback session (revoke token / stop the pipeline). */
export async function stopStream(token) {
  return releasePlayback(token)
}
