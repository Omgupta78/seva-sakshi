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

export function createCallSession({ localStream, onOpen, onStatus, onRemoteStream, onError, onIncoming, fixedCode = null }) {
  let peer = null
  let currentCall = null
  let pendingCall = null // incoming call awaiting Accept/Decline
  let stream = localStream
  // A fixed code (e.g. an institution ID) makes this device reachable at a
  // stable address so callers don't need a copy-pasted code.
  const fixed = fixedCode ? normalizeCode(fixedCode) : null
  let code = fixed ?? randomCode()
  let retries = 0
  let destroyed = false
  let retryTimer = null

  function bindCall(call) {
    currentCall = call
    call.on('stream', (remote) => { onRemoteStream?.(remote); onStatus?.('connected') })
    call.on('close', () => { clearInterval(watch); onStatus?.('ended') })
    call.on('error', (e) => { clearInterval(watch); onError?.(mapError(e)) })
    // Fallback: report 'connected' from the underlying RTCPeerConnection too,
    // so a call still shows connected when one side has its camera off (no
    // remote 'stream' event). Real camera calls also fire the 'stream' path.
    const watch = setInterval(() => {
      const pc = call.peerConnection
      if (!pc) return
      if (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        onStatus?.('connected'); clearInterval(watch)
      } else if (['failed', 'closed'].includes(pc.connectionState)) {
        clearInterval(watch)
      }
    }, 500)
  }

  function buildPeer() {
    peer = new Peer(CODE_NAMESPACE + code, peerOptions())
    peer.on('open', () => onOpen?.(code)) // hand the UI the code
    peer.on('call', (call) => {
      // Do NOT auto-answer — surface an incoming-call notification and let the
      // user Accept (which starts their media) or Decline.
      pendingCall = call
      onStatus?.('incoming')
      onIncoming?.({ from: call.peer })
      call.on('close', () => { if (pendingCall === call) { pendingCall = null; onStatus?.('ended') } })
    })
    peer.on('disconnected', () => onStatus?.('disconnected'))
    peer.on('close', () => onStatus?.('ended'))
    peer.on('error', (e) => {
      if (e?.type === 'unavailable-id') {
        if (fixed) {
          // The fixed code is held by SOME peer on the broker. In practice this
          // is almost always our OWN stale registration — a quick reload, or
          // React StrictMode's double-mount in dev — and the broker frees the
          // id a second or two after that socket drops. So retry a few times
          // with a short delay before concluding another device truly holds it.
          if (retries < 6 && !destroyed) {
            retries += 1
            try { peer?.destroy() } catch { /* noop */ }
            onStatus?.('registering')
            retryTimer = setTimeout(() => { if (!destroyed) buildPeer() }, 1200)
            return
          }
          onError?.('This code is already online on another device. Only one device per code can be reachable.')
          return
        }
        if (retries < 3) { retries += 1; code = randomCode(); try { peer?.destroy() } catch { /* noop */ } buildPeer(); return }
      }
      onError?.(mapError(e))
    })
  }
  buildPeer()

  return {
    get peerId() { return code },
    get hasIncoming() { return !!pendingCall },
    setLocalStream(s) { stream = s },
    /** Accept the pending incoming call (answers with our local media, or an
     *  empty stream when the camera is unavailable → receive-only). */
    accept() {
      if (!pendingCall) return
      pendingCall.answer(stream ?? new MediaStream())
      bindCall(pendingCall)
      pendingCall = null
    },
    /** Decline the pending incoming call. */
    decline() {
      try { pendingCall?.close() } catch { /* noop */ }
      pendingCall = null
      onStatus?.('ready')
    },
    /** Initiate a call to another device's code. */
    call(remoteId) {
      if (!peer) return onError?.('Call session not ready.')
      const short = normalizeCode(remoteId)
      if (!short) return onError?.('Enter the other device’s code.')
      if (short === code) return onError?.('That is your own code — enter the OTHER device’s code.')
      onStatus?.('calling')
      // Use our real media, or an empty stream when the camera is unavailable
      // (receive-only — the other side's video still comes through).
      const c = peer.call(CODE_NAMESPACE + short, stream ?? new MediaStream())
      if (!c) return onError?.('Could not place the call.')
      bindCall(c)
    },
    /** Hang up the current call but keep the session (peer) alive. */
    hangup() { try { currentCall?.close() } catch { /* noop */ } currentCall = null },
    /** Tear everything down (call + peer). */
    destroy() {
      destroyed = true
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
      try { currentCall?.close() } catch { /* noop */ }
      try { peer?.destroy() } catch { /* noop */ }
      currentCall = null
      peer = null
    },
  }
}
