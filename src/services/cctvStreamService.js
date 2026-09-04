/**
 * ---------------------------------------------------------------------
 * STREAMING SERVICE — broker between camera sources and the browser
 * ---------------------------------------------------------------------
 * Cameras speak RTSP (and some newer cameras/gateways, WebRTC). A browser
 * CANNOT and MUST NOT play raw RTSP, and a camera's RTSP URL + credentials
 * must never reach the client. That job belongs to a server-side media
 * gateway (e.g. MediaMTX / Janus / Amazon Kinesis Video Streams) which, in
 * production:
 *
 *   1. holds the private RTSP URL + credentials as a server-side secret
 *      (env / secret manager) — NEVER shipped in frontend code,
 *   2. re-packages the RTSP feed into a browser-safe transport:
 *        - HLS   (.m3u8) for wide compatibility / recording playback, or
 *        - WebRTC for low-latency live view,
 *   3. issues the browser a SHORT-LIVED, per-session playback URL + token,
 *      scoped to one camera and one authenticated officer.
 *
 * This file simulates step 3 only. Given a camera id it returns a safe
 * "playback descriptor": the transport the browser should use, an expiring
 * demo token, and — because there is no real gateway or real camera here —
 * a placeholder feed. No RTSP URL, IP, or credential is ever part of what
 * this returns. To go live, replace `requestPlayback` with a call to your
 * gateway's session endpoint; the descriptor shape stays the same.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { CAMERAS } from '../data/cctvSeedData.js'

/** Transports a browser can actually play. RTSP is intentionally absent. */
export const BROWSER_TRANSPORTS = ['hls', 'webrtc']

/** How a source protocol is delivered to the browser once brokered. */
const TRANSPORT_FOR_SOURCE = {
  rtsp: 'hls', // RTSP is repackaged to HLS server-side
  webrtc: 'webrtc', // WebRTC can be relayed through the gateway as WebRTC
}

const TOKEN_TTL_SECONDS = 60

/** Opaque, non-reversible demo token — stands in for a signed gateway token. */
function mintToken(cameraId) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `demo_${cameraId}_${Date.now().toString(36)}_${rand}`
}

/**
 * Ask the (simulated) gateway for a playback session for one camera.
 *
 * Returns a descriptor safe to hand a browser player. In production the
 * body becomes:
 *   const res = await fetch(`/api/cctv/${cameraId}/playback`, { method: 'POST' })
 *   if (!res.ok) throw new Error('Could not start stream')
 *   return res.json()   // { transport, playbackUrl, token, expiresAt, ... }
 *
 * @param {string} cameraId
 * @returns {Promise<{
 *   cameraId: string,
 *   available: boolean,
 *   transport: 'hls'|'webrtc'|null,
 *   mode: 'placeholder'|'live',
 *   playbackUrl: string|null,
 *   token: string|null,
 *   expiresAt: string|null,
 *   reason: string|null,
 * }>}
 */
export async function requestPlayback(cameraId) {
  await delay(250)
  const cam = CAMERAS.find((c) => c.id === cameraId)
  if (!cam) throw new NotFoundError(`Camera ${cameraId} not found`)

  const transport = TRANSPORT_FOR_SOURCE[cam.sourceProtocol] ?? 'hls'

  // An offline camera has no reachable source, so the gateway cannot mint a
  // session — surface that honestly rather than showing a frozen frame.
  if (cam.status === 'offline') {
    return {
      cameraId,
      available: false,
      transport: null,
      mode: 'placeholder',
      playbackUrl: null,
      token: null,
      expiresAt: null,
      reason: 'Camera is offline — the gateway has no active source to stream.',
    }
  }

  const token = mintToken(cameraId)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString()

  return {
    cameraId,
    available: true,
    transport,
    // No real gateway/camera is connected, so there is no live URL to play.
    // A real deployment returns e.g. `/media/{session}/index.m3u8` (HLS) or a
    // WebRTC offer endpoint here — always a brokered URL, never the RTSP source.
    mode: 'placeholder',
    playbackUrl: null,
    token,
    expiresAt,
    // A warning camera can still be viewed, but the feed may be degraded.
    reason: cam.status === 'warning' ? 'Connection is unstable — feed may drop or lag.' : null,
  }
}

/**
 * Best-effort teardown of a playback session (revoke token, stop the
 * gateway pipeline). No-op in the demo; wire to DELETE /api/cctv/session.
 */
export async function releasePlayback(token) {
  if (!token) return
  await delay(120)
}
