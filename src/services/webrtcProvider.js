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
  // TURN relays media when a direct/STUN path can't be established (e.g. a phone
  // on mobile data ↔ a PC on Wi-Fi, or behind carrier/symmetric NAT). Multiple
  // endpoints may be given as a comma-separated VITE_TURN_URL, sharing one set
  // of credentials. These are CLIENT ICE credentials (short-lived in prod),
  // never RTSP/DB secrets.
  ...(env.VITE_TURN_URL
    ? [{
        urls: env.VITE_TURN_URL.split(',').map((u) => u.trim()).filter(Boolean),
        username: env.VITE_TURN_USERNAME,
        credential: env.VITE_TURN_CREDENTIAL,
      }]
    : []),
]

/** True when a TURN relay is configured (needed for cross-network calls). */
export const HAS_TURN = !!env.VITE_TURN_URL

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

/** A truly silent, disabled audio track. Used only as the LOCAL outgoing
 *  placeholder when the device has no camera or mic at all, so the WebRTC
 *  connection still has one media line to negotiate and ICE can complete
 *  (otherwise a zero-track call can stall in 'connecting' forever). It carries
 *  no real audio and is not a fabricated remote participant. */
function silentAudioTrack() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    const ctx = new Ctx()
    const dst = ctx.createMediaStreamDestination()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0
    osc.connect(gain); gain.connect(dst); osc.start()
    const track = dst.stream.getAudioTracks()[0]
    if (track) track.enabled = false
    return track ?? null
  } catch { return null }
}

/** Return a stream safe to send: the real one when it has tracks, else a
 *  minimal stream with a single silent placeholder track so the call still
 *  negotiates (receive-only). */
function negotiableStream(stream) {
  if (stream && stream.getTracks().length > 0) return stream
  const s = new MediaStream()
  const t = silentAudioTrack()
  if (t) s.addTrack(t)
  return s
}

export function createCallSession({ localStream, onOpen, onStatus, onRemoteStream, onError, onIncoming, onFixedUnavailable, fixedCode = null }) {
  let peer = null
  let currentCall = null
  let pendingCall = null // incoming call awaiting Accept/Decline
  let stream = localStream
  // A fixed code (e.g. an institution ID) makes this device reachable at a
  // stable address so callers don't need a copy-pasted code.
  const fixed = fixedCode ? normalizeCode(fixedCode) : null
  let fixedActive = !!fixed // becomes false if we must fall back to a random code
  let code = fixed ?? randomCode()
  let retries = 0
  let destroyed = false
  let retryTimer = null
  let openTimer = null // watchdog: broker must acknowledge us within a few seconds
  let opened = false
  let reconnects = 0
  let switching = false // true while we intentionally tear down a peer to rebuild it
  let callWatch = null // polls the RTCPeerConnection so camera-off calls still connect
  let connectTimer = null // fails a call that never establishes (e.g. a ghost peer)

  /** Destroy the current peer as part of a rebuild (retry / fallback), without
   *  letting its 'close' event surface as a spurious 'ended' to the UI. */
  function destroyForRebuild() {
    switching = true
    try { peer?.destroy() } catch { /* noop */ }
  }

  function stopWatch() { if (callWatch) { clearInterval(callWatch); callWatch = null } }
  function clearConnectTimer() { if (connectTimer) { clearTimeout(connectTimer); connectTimer = null } }

  function markConnected() { clearConnectTimer(); onStatus?.('connected'); stopWatch() }

  function bindCall(call) {
    currentCall = call
    call.on('stream', (remote) => { onRemoteStream?.(remote); markConnected() })
    call.on('close', () => { clearConnectTimer(); stopWatch(); onStatus?.('ended') })
    call.on('error', (e) => { clearConnectTimer(); stopWatch(); onError?.(mapError(e)) })
    // A call that never connects must not hang on "Calling…" forever — this is
    // exactly what happens when dialing a ghost id on the public broker (the id
    // is registered but the dead peer never answers). Fail it after a while with
    // guidance to use the shareable code instead.
    clearConnectTimer()
    connectTimer = setTimeout(() => {
      stopWatch()
      try { call.close() } catch { /* noop */ }
      onError?.('No answer — the other device didn’t connect. It may be offline, or reachable at a temporary code (ask them for it and use “Call code”).')
    }, 25000)
    // Report 'connected' from the underlying RTCPeerConnection too, so a call
    // still shows connected when a side has no camera and sends no media (no
    // remote 'stream' event). Real camera calls also fire the 'stream' path.
    // We attach a state-change listener as soon as the PC exists (fast path)
    // and keep polling as a fallback; we never give up early on a transient
    // 'failed', because the call may still recover — only 'close'/destroy stop
    // the watch. This keeps the CALLER's UI in sync with the answerer.
    let bound = false
    stopWatch()
    callWatch = setInterval(() => {
      const pc = call.peerConnection
      if (!pc) return
      if (!bound) {
        bound = true
        const check = () => {
          if (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') markConnected()
        }
        pc.addEventListener('connectionstatechange', check)
        pc.addEventListener('iceconnectionstatechange', check)
      }
      if (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') markConnected()
    }, 400)
  }

  function buildPeer() {
    peer = new Peer(CODE_NAMESPACE + code, peerOptions())
    // Watchdog: if the broker never sends 'open', the signaling server is
    // unreachable (public broker down/blocked, or a bad self-host config).
    // Surface it instead of leaving the user staring at "Starting…" forever.
    if (openTimer) clearTimeout(openTimer)
    openTimer = setTimeout(() => {
      if (!opened && !destroyed) {
        onError?.(`Could not reach the signaling server (${SIGNALING_LABEL}). Check both devices are online${SELF_HOSTED ? ' and can reach your PeerServer' : '; the public broker may be busy — reopen to retry'}.`)
      }
    }, 12000)
    peer.on('open', () => {
      const firstOpen = !opened
      opened = true
      reconnects = 0
      switching = false
      if (openTimer) { clearTimeout(openTimer); openTimer = null }
      // Only announce 'open' the FIRST time. PeerJS re-emits 'open' after a
      // reconnect to the broker; re-running onOpen would reset the call status
      // (and re-dial an auto-call), clobbering an already-connected call.
      if (firstOpen) onOpen?.(code) // hand the UI the code
    })
    peer.on('call', (call) => {
      // Do NOT auto-answer — surface an incoming-call notification and let the
      // user Accept (which starts their media) or Decline.
      pendingCall = call
      onStatus?.('incoming')
      onIncoming?.({ from: call.peer })
      call.on('close', () => { if (pendingCall === call) { pendingCall = null; onStatus?.('ended') } })
    })
    peer.on('disconnected', () => {
      // The socket to the broker dropped but the peer is not destroyed — the id
      // is still ours. Reconnect a few times to stay reachable (keeps the
      // institute online through brief network blips) before giving up.
      if (destroyed) return
      if (reconnects < 5) {
        reconnects += 1
        try { peer?.reconnect() } catch { /* noop */ }
      } else {
        onStatus?.('disconnected')
      }
    })
    peer.on('close', () => { if (!switching && !destroyed) onStatus?.('ended') })
    peer.on('error', (e) => {
      if (e?.type === 'unavailable-id') {
        if (fixedActive) {
          // The fixed code is held by SOME peer on the broker. Usually this is
          // our OWN stale registration (a quick reload) and the broker frees
          // the id within a second or two, so retry a few times first.
          if (retries < 4 && !destroyed) {
            retries += 1
            destroyForRebuild()
            onStatus?.('registering')
            retryTimer = setTimeout(() => { if (!destroyed) buildPeer() }, 1500)
            return
          }
          // Still can't claim it — most often a stale/ghost peer lingering on
          // the shared PUBLIC broker (it frees only after a ~60s timeout).
          // Don't dead-end the user: fall back to a random, shareable code so
          // this device is still reachable; the caller dials it manually.
          if (!destroyed) {
            fixedActive = false
            retries = 0
            code = randomCode()
            destroyForRebuild()
            onFixedUnavailable?.(code)
            buildPeer()
          }
          return
        }
        if (retries < 3) { retries += 1; code = randomCode(); destroyForRebuild(); buildPeer(); return }
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
      pendingCall.answer(negotiableStream(stream))
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
      // Drop any previous, still-ringing attempt (e.g. a stuck call to a ghost
      // id) before placing the new one, so re-dialing cleanly switches targets.
      clearConnectTimer(); stopWatch()
      try { currentCall?.close() } catch { /* noop */ }
      onStatus?.('calling')
      // Use our real media, or a minimal placeholder stream when the camera is
      // unavailable (receive-only — the other side's video still comes through,
      // and the connection still negotiates so it can reach 'connected').
      const c = peer.call(CODE_NAMESPACE + short, negotiableStream(stream))
      if (!c) return onError?.('Could not place the call.')
      bindCall(c)
    },
    /** Hang up the current call but keep the session (peer) alive. */
    hangup() { clearConnectTimer(); stopWatch(); try { currentCall?.close() } catch { /* noop */ } currentCall = null },
    /** Tear everything down (call + peer). */
    destroy() {
      destroyed = true
      clearConnectTimer()
      stopWatch()
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
      if (openTimer) { clearTimeout(openTimer); openTimer = null }
      try { currentCall?.close() } catch { /* noop */ }
      try { peer?.destroy() } catch { /* noop */ }
      currentCall = null
      peer = null
    },
  }
}

/* ---------------------------------------------------------------------
 * PHONE-AS-CAMERA (one-way live feed) — a phone broadcasts its camera and
 * the monitoring dashboard views it. This is a REAL WebRTC stream (same
 * PeerJS broker + STUN/TURN as the call), one-directional: the broadcaster
 * sends video, the viewer only receives. It is clearly labelled a live PHONE
 * feed in the UI — it never impersonates a configured CCTV gateway.
 * Camera peer ids are namespaced separately so they can't collide with call
 * codes: sevasakshi-CAM-<code>.
 * ------------------------------------------------------------------- */
const CAM_PREFIX = 'CAM-'
function cameraPeerId(code) { return CODE_NAMESPACE + CAM_PREFIX + normalizeCode(code) }

/**
 * Start broadcasting `stream` as the camera identified by `code`. Auto-answers
 * every viewer with the camera video (receive-only for the viewer). Returns a
 * handle with the live viewer count and a stop().
 */
export function createCameraBroadcast({ code, stream, onStatus, onError }) {
  let peer = null
  let destroyed = false
  let reconnects = 0
  let claimRetries = 0 // reclaiming the fixed camera id past a stale/ghost peer
  let claimTimer = null
  const calls = new Set()

  function build() {
    peer = new Peer(cameraPeerId(code), peerOptions())
    peer.on('open', () => { reconnects = 0; claimRetries = 0; if (claimTimer) { clearTimeout(claimTimer); claimTimer = null } onStatus?.('online') })
    peer.on('call', (call) => {
      // A viewer wants the feed — answer immediately with our camera stream.
      try { call.answer(stream) } catch (e) { onError?.(mapError(e)); return }
      calls.add(call)
      onStatus?.('viewer', calls.size)
      const cleanup = () => { calls.delete(call); onStatus?.('viewer', calls.size) }
      call.on('close', cleanup)
      call.on('error', cleanup)
    })
    peer.on('disconnected', () => {
      if (destroyed) return
      if (reconnects < 8) { reconnects += 1; try { peer?.reconnect() } catch { /* noop */ } }
      else onStatus?.('disconnected')
    })
    peer.on('error', (e) => {
      if (e?.type === 'unavailable-id') {
        // A camera MUST keep its fixed code (viewers look it up by that id), so
        // we can't fall back to a random one. On the shared public broker the
        // id is usually held by our OWN stale/ghost peer from a previous run,
        // which the broker frees after a ~60s timeout — so keep retrying to
        // reclaim it (up to ~90s) rather than giving up.
        if (!destroyed && claimRetries < 22) {
          claimRetries += 1
          onStatus?.('reserving', claimRetries)
          try { peer?.destroy() } catch { /* noop */ }
          claimTimer = setTimeout(() => { if (!destroyed) build() }, 4000)
          return
        }
        onError?.('This camera code is busy on the signaling broker (a previous session is still held). Wait about a minute and try again, pick a different code, or use your own signaling server.')
        return
      }
      onError?.(mapError(e))
    })
  }
  build()

  return {
    get cameraId() { return CAM_PREFIX + normalizeCode(code) },
    stop() {
      destroyed = true
      if (claimTimer) { clearTimeout(claimTimer); claimTimer = null }
      calls.forEach((c) => { try { c.close() } catch { /* noop */ } })
      calls.clear()
      try { peer?.destroy() } catch { /* noop */ }
      peer = null
    },
  }
}

/**
 * View the live phone feed broadcasting under `code`. Delivers the remote
 * MediaStream via onStream. onStatus: 'connecting' | 'live' | 'ended'. onError
 * fires when no phone is broadcasting that code (or on a real failure).
 */
export function createCameraViewer({ code, onStream, onStatus, onError }) {
  let peer = null
  let destroyed = false
  let current = null
  let watch = null
  let timer = null
  const stopWatch = () => { if (watch) { clearInterval(watch); watch = null } }
  const clearTimer = () => { if (timer) { clearTimeout(timer); timer = null } }

  peer = new Peer(peerOptions()) // random viewer id from the broker
  peer.on('open', () => {
    onStatus?.('connecting')
    // Receive-only: call with a minimal placeholder stream; we want the
    // broadcaster's video back, we send nothing meaningful.
    const call = peer.call(cameraPeerId(code), negotiableStream(null))
    if (!call) { onError?.('Could not connect to the camera.'); return }
    current = call
    call.on('stream', (remote) => { clearTimer(); stopWatch(); onStream?.(remote); onStatus?.('live') })
    call.on('close', () => { clearTimer(); stopWatch(); onStatus?.('ended') })
    call.on('error', (e) => { clearTimer(); stopWatch(); onError?.(mapError(e)) })
    // If the feed never arrives, tell the user rather than spin forever.
    timer = setTimeout(() => { if (!destroyed) onError?.('No live phone feed for this camera. On the phone, open the camera page and Start broadcasting under this code.') }, 9000)
  })
  peer.on('error', (e) => {
    if (e?.type === 'peer-unavailable') { onError?.('No phone is broadcasting this camera right now.'); return }
    onError?.(mapError(e))
  })

  return {
    stop() {
      destroyed = true
      clearTimer(); stopWatch()
      try { current?.close() } catch { /* noop */ }
      try { peer?.destroy() } catch { /* noop */ }
      peer = null
    },
  }
}
