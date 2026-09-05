/**
 * ---------------------------------------------------------------------
 * STREAM CONFIGURATION — non-sensitive playback config (spec §1)
 * ---------------------------------------------------------------------
 * Describes HOW a camera is delivered to the browser — never the RTSP source
 * or any credential. RTSP is an INGESTION protocol consumed only by the media
 * gateway (server-side); the browser only ever receives HLS or WebRTC (or a
 * clearly-labelled DEMO stream).
 *
 * A per-camera config carries:
 *   cameraId, streamType, mediaServerId, playbackUrl, status
 *
 * In production these rows come from the backend (GET /api/cameras/:id/config)
 * and `playbackUrl` is populated per-session by requestCameraPlayback — it is
 * NOT stored here. Nothing in this file is a secret.
 * ---------------------------------------------------------------------
 */

/** Browser-playable output types + the DEMO placeholder. RTSP is NOT here — a
 *  browser never plays RTSP. */
export const STREAM_TYPES = { DEMO: 'DEMO', HLS: 'HLS', WEBRTC: 'WEBRTC' }

/** Ingestion protocols the media gateway accepts from a physical camera. These
 *  stay server-side; they are never played directly in the browser. */
export const INGESTION_PROTOCOLS = { RTSP: 'RTSP', WEBRTC: 'WEBRTC' }

/** Configured media gateways (demo placeholder — no real gateway connected). */
export const MEDIA_SERVERS = [
  { id: 'MG-DEMO-1', label: 'Demo Gateway (not connected)', kind: 'demo' },
  // { id: 'MG-PROD-1', label: 'Production Media Gateway', kind: 'mediamtx' }, // add when a real gateway is deployed
]

export const DEFAULT_MEDIA_SERVER_ID = 'MG-DEMO-1'

/** Config lifecycle status (distinct from live connection health). */
export const CONFIG_STATUS = { CONFIGURED: 'configured', UNCONFIGURED: 'unconfigured' }

/**
 * In LIVE mode an RTSP camera is repackaged to HLS by the gateway, and a WebRTC
 * camera is relayed as WebRTC. This maps a camera's ingestion/source protocol
 * to the browser output type it will be served as.
 */
export function outputTypeForIngestion(ingestion) {
  const p = String(ingestion ?? '').toLowerCase()
  return p === 'webrtc' ? STREAM_TYPES.WEBRTC : STREAM_TYPES.HLS
}

/**
 * Build the non-sensitive stream config for a camera.
 * @param {string} cameraId
 * @param {{ mode?: 'demo'|'live', ingestion?: string }} opts
 * @returns {{ cameraId, streamType, ingestion, mediaServerId, playbackUrl, status }}
 */
export function getStreamConfig(cameraId, { mode = 'demo', ingestion = 'rtsp' } = {}) {
  const streamType = mode === 'demo' ? STREAM_TYPES.DEMO : outputTypeForIngestion(ingestion)
  return {
    cameraId,
    streamType,
    ingestion: ingestion?.toUpperCase?.() ?? 'RTSP', // server-side only
    mediaServerId: DEFAULT_MEDIA_SERVER_ID,
    playbackUrl: null, // filled per-session by the gateway; never persisted client-side
    status: CONFIG_STATUS.CONFIGURED,
  }
}
