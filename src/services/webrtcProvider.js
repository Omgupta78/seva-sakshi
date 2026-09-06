/**
 * ---------------------------------------------------------------------
 * WEBRTC PROVIDER — REAL peer-to-peer video between two devices
 * ---------------------------------------------------------------------
 * This is a genuine WebRTC connection (not a simulation). It uses PeerJS for
 * the signaling handshake (SDP offer/answer + ICE) and a real RTCPeerConnection
 * underneath; media flows directly device-to-device. Each device gets a short
 * peer code; one device enters the other's code to connect.
 *
 * Signaling broker: PeerJS's public cloud server by default (fine for a
 * prototype/demo). To self-host, set VITE_PEERJS_HOST/PORT/PATH/KEY (run your
 * own PeerServer). NAT traversal uses Google STUN by default; add a TURN server
 * (VITE_TURN_URL/USERNAME/CREDENTIAL) for calls across restrictive networks.
 * TURN credentials here are client ICE config (short-lived in production),
 * never RTSP/database secrets.
 *
 * The call UI talks ONLY to this module — no PeerJS types leak into components,
 * so the broker can be swapped (LiveKit / Twilio / raw WebSocket signaling)
 * without changing the UI.
 * ---------------------------------------------------------------------
 */
import Peer from 'peerjs'

const env = import.meta.env ?? {}

/** ICE servers for NAT traversal. STUN is enough on many networks; TURN relays
 *  media when a direct path can't be established. */
export const ICE_SERVERS = [
  { urls: env.VITE_STUN_URL || 'stun:stun.l.google.com:19302' },
  ...(env.VITE_TURN_URL
    ? [{ urls: env.VITE_TURN_URL, username: env.VITE_TURN_USERNAME, credential: env.VITE_TURN_CREDENTIAL }]
    : []),
]

/** True when a self-hosted PeerServer is configured (else the public cloud broker). */
export const SELF_HOSTED = !!env.VITE_PEERJS_HOST
export const SIGNALING_LABEL = SELF_HOSTED ? 'Self-hosted PeerServer' : 'PeerJS public broker'

function peerOptions() {
  const opts = { config: { iceServers: ICE_SERVERS } }
  if (env.VITE_PEERJS_HOST) {
    opts.host = env.VITE_PEERJS_HOST
    opts.port = Number(env.VITE_PEERJS_PORT) || 443
    opts.path = env.VITE_PEERJS_PATH || '/'
    opts.secure = env.VITE_PEERJS_SECURE !== 'false'
    if (env.VITE_PEERJS_KEY) opts.key = env.VITE_PEERJS_KEY
  }
  return opts
}

function mapError(err) {
  const t = err?.type || err?.name || ''
  if (t === 'peer-unavailable') return 'That code is not online. Check the code and that the other device has the call open.'
  if (t === 'browser-incompatible') return 'This browser does not support WebRTC.'
  if (t === 'network' || t === 'server-error' || t === 'socket-error') return 'Cannot reach the signaling server. Check your connection.'
  if (t === 'unavailable-id') return 'This peer code is already in use. Reopen the call to get a new one.'
  return err?.message || 'A WebRTC error occurred.'
}

/**
 * Create a real call session. The caller supplies the local MediaStream (from
 * getUserMedia) and callbacks; this returns a small handle the UI drives.
 *
 * @param {{ localStream: MediaStream|null, onOpen:(id)=>void, onStatus:(s)=>void,
 *           onRemoteStream:(s:MediaStream)=>void, onError:(msg)=>void }} cfg
 */
/** Short, phone-friendly room code (avoids ambiguous chars like O/0, I/1). */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_NAMESPACE = 'sevasakshi-' // scope our ids on the shared public broker
function randomCode(len = 6) {
  let c = ''
  for (let i = 0; i < len; i++) c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return c
}
/** Normalise a user-typed code: uppercase, strip spaces and any pasted namespace. */
export function normalizeCode(input) {
  return String(input || '').trim().toUpperCase().replace(/\s+/g, '').replace(CODE_NAMESPACE.toUpperCase(), '')
}

export function createCallSession({ localStream, onOpen, onStatus, onRemoteStream, onError }) {
  let peer = null
  let currentCall = null
  let stream = localStream
  let code = randomCode()
  let retries = 0

  function bindCall(call) {
    currentCall = call
    call.on('stream', (remote) => { onRemoteStream?.(remote); onStatus?.('connected') })
    call.on('close', () => onStatus?.('ended'))
    call.on('error', (e) => onError?.(mapError(e)))
  }

  function buildPeer() {
    peer = new Peer(CODE_NAMESPACE + code, peerOptions())
    peer.on('open', () => onOpen?.(code)) // hand the UI the SHORT code
    peer.on('call', (call) => {
      onStatus?.('incoming')
      call.answer(stream ?? undefined) // answer with our real local media
      bindCall(call)
    })
    peer.on('disconnected', () => onStatus?.('disconnected'))
    peer.on('close', () => onStatus?.('ended'))
    peer.on('error', (e) => {
      // Rare collision on the shared broker → pick a new code and retry once or twice.
      if (e?.type === 'unavailable-id' && retries < 3) {
        retries += 1
        code = randomCode()
        try { peer?.destroy() } catch { /* noop */ }
        buildPeer()
        return
      }
      onError?.(mapError(e))
    })
  }
  buildPeer()

  return {
    get peerId() { return code },
    setLocalStream(s) { stream = s },
    /** Initiate a call to another device's SHORT code. */
    call(remoteId) {
      if (!peer) return onError?.('Call session not ready.')
      if (!stream) return onError?.('Start your camera before calling.')
      const short = normalizeCode(remoteId)
      if (!short) return onError?.('Enter the other device’s code.')
      if (short === code) return onError?.('That is your own code — enter the OTHER device’s code.')
      onStatus?.('calling')
      const c = peer.call(CODE_NAMESPACE + short, stream)
      if (!c) return onError?.('Could not place the call.')
      bindCall(c)
    },
    /** Hang up the current call but keep the session (peer) alive. */
    hangup() { try { currentCall?.close() } catch { /* noop */ } currentCall = null },
    /** Tear everything down (call + peer). */
    destroy() {
      try { currentCall?.close() } catch { /* noop */ }
      try { peer?.destroy() } catch { /* noop */ }
      currentCall = null
      peer = null
    },
  }
}
