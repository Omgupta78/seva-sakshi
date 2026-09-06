import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, PhoneCall, Loader2, Copy, Check, ShieldCheck, CircleSlash, X, Radio } from 'lucide-react'
import { getLocalMedia, setMuted, setCameraOff, releaseStream } from '../../services/videoCallProvider.js'
import { createCallSession, SIGNALING_LABEL, SELF_HOSTED } from '../../services/webrtcProvider.js'

/**
 * REAL two-device video call (WebRTC via PeerJS). Local AND remote video are
 * real device cameras — nothing is simulated. One device shares its code; the
 * other enters it to connect. Media flows peer-to-peer.
 *
 * `title`/`subtitle` let each portal label the call context; behaviour is
 * identical everywhere.
 */
export default function LiveVideoCall({ title = 'Live Video Call', subtitle, onClose, fixedCode = null, autoCallCode = null }) {
  const localRef = useRef(null)
  const remoteRef = useRef(null)
  const sessionRef = useRef(null)

  const [status, setStatus] = useState('starting-media') // starting-media | ready | calling | incoming | connected | ended | disconnected | error
  const [peerId, setPeerId] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [mediaError, setMediaError] = useState(null)
  const [error, setError] = useState(null)
  const [remoteInput, setRemoteInput] = useState('')
  const [incoming, setIncoming] = useState(false)
  const [fellBack, setFellBack] = useState(false) // fixed code was busy → using a random one
  const [muted, setMutedState] = useState(false)
  const [cameraOff, setCameraOffState] = useState(false)
  const [copied, setCopied] = useState(false)

  // 1) Acquire real local camera/mic, then open a real WebRTC session.
  useEffect(() => {
    let disposed = false
    let session = null
    ;(async () => {
      const res = await getLocalMedia({ video: true, audio: true })
      if (disposed) { releaseStream(res.stream); return }
      setLocalStream(res.stream)
      setMediaError(res.error)
      if (!res.hasVideo) setCameraOffState(true)
      session = createCallSession({
        localStream: res.stream,
        fixedCode,
        onOpen: (id) => {
          if (disposed) return
          setPeerId(id)
          setStatus((s) => (s === 'starting-media' || s === 'registering' ? 'ready' : s))
          // Department flow: auto-dial the institution's code once we're open.
          if (autoCallCode) { setStatus('calling'); session.call(autoCallCode) }
        },
        onStatus: (s) => { if (!disposed) setStatus(s) },
        onFixedUnavailable: (fallbackCode) => { if (!disposed) { setFellBack(true); setPeerId(fallbackCode); setStatus('ready') } },
        onIncoming: () => { if (!disposed) setIncoming(true) },
        onRemoteStream: (remote) => { if (!disposed) { setIncoming(false); setRemoteStream(remote) } },
        onError: (msg) => { if (!disposed) { setError(msg); setStatus((s) => (s === 'connected' ? s : 'error')) } },
      })
      sessionRef.current = session
    })()
    return () => {
      disposed = true
      try { session?.destroy() } catch { /* noop */ }
      releaseStream(localStream)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function acceptIncoming() { setIncoming(false); sessionRef.current?.accept() }
  function declineIncoming() { setIncoming(false); sessionRef.current?.decline() }

  useEffect(() => { if (localRef.current && localStream) localRef.current.srcObject = localStream }, [localStream])
  useEffect(() => { if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream }, [remoteStream])

  const connected = status === 'connected'

  function placeCall() {
    setError(null)
    sessionRef.current?.call(remoteInput)
  }
  function hangup() {
    sessionRef.current?.hangup()
    setRemoteStream(null)
    setStatus('ended')
  }
  function toggleMute() { setMutedState((m) => setMuted(localStream, !m)) }
  function toggleCamera() { setCameraOffState((c) => setCameraOff(localStream, !c)) }
  async function copyCode() {
    try { await navigator.clipboard.writeText(peerId); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* noop */ }
  }
  function close() {
    try { sessionRef.current?.destroy() } catch { /* noop */ }
    releaseStream(localStream)
    onClose?.()
  }

  const statusText = {
    'starting-media': 'Starting your camera…',
    registering: 'Reserving your code…',
    ready: (fixedCode && !fellBack) ? `Online — reachable as ${peerId ?? '…'}. Waiting for a call.` : 'Ready — share your code or enter the other device’s code',
    calling: 'Calling…',
    incoming: 'Incoming call…',
    connected: 'Connected',
    disconnected: 'Signaling disconnected — reopen to reconnect',
    ended: 'Call ended',
    error: error ?? 'Error',
  }[status]

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#0b0a14] text-white" role="dialog" aria-modal="true" aria-label="Live video call">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{title}</p>
          {subtitle && <p className="truncate text-[11px] text-white/60">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${connected ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-200'}`}>
            {connected ? <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden="true" /> : <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
            {statusText}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70"><Radio className="h-3 w-3" aria-hidden="true" /> Real WebRTC</span>
          <button type="button" onClick={close} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/15"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>

      {/* Video area */}
      <div className="relative flex-1 px-4">
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#1e2537] to-[#0b0a14]">
          {/* Remote (real) */}
          {remoteStream ? (
            <video ref={remoteRef} autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/55">
              <PhoneCall className="h-8 w-8" aria-hidden="true" />
              <p className="max-w-sm text-sm">{connected ? 'Waiting for remote video…' : 'No one connected yet. Share your code, or enter the other device’s code and press Call.'}</p>
            </div>
          )}

          {/* Local (real) — picture-in-picture */}
          <div className="absolute right-4 bottom-4 h-32 w-44 overflow-hidden rounded-xl border border-white/15 bg-black/60 shadow-lg sm:h-36 sm:w-56">
            <video ref={localRef} autoPlay playsInline muted className={`h-full w-full -scale-x-100 object-cover ${cameraOff || !localStream ? 'hidden' : ''}`} />
            {(cameraOff || !localStream) && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-white/50"><VideoOff className="h-6 w-6" aria-hidden="true" /><span className="text-[10px]">{localStream ? 'Camera off' : 'No camera'}</span></div>
            )}
            <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80">You{muted ? ' · muted' : ''}</span>
          </div>
        </div>
      </div>

      {incoming && !connected && (
        <div className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-400/40 bg-green-500/15 p-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-green-200"><PhoneCall className="h-5 w-5 animate-pulse" aria-hidden="true" /> Incoming video call…</span>
          <div className="flex gap-2">
            <button type="button" onClick={declineIncoming} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/20"><PhoneOff className="h-4 w-4" aria-hidden="true" /> Decline</button>
            <button type="button" onClick={acceptIncoming} className="flex items-center gap-1.5 rounded-full bg-[#138808] px-5 py-2 text-sm font-bold text-white hover:bg-[#0f6b06]"><PhoneCall className="h-4 w-4" aria-hidden="true" /> Accept</button>
          </div>
        </div>
      )}

      {fellBack && <p className="mx-4 mt-2 rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-200">Your institution code <span className="font-semibold">{fixedCode}</span> is busy on the public broker (a previous session may still be held for ~1 min). You are now reachable at the temporary code shown below — read it to the caller and have them use <span className="font-semibold">“Call code”</span>.</p>}
      {mediaError && <p className="mx-4 mt-2 rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-200">{mediaError}</p>}
      {error && <p className="mx-4 mt-2 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</p>}

      {/* Connect strip (before connected) */}
      {!connected && (
        <div className="mx-4 mt-3 grid gap-3 rounded-xl bg-white/5 p-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-white/50 uppercase">Your code — read it to the other device</p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 rounded-lg bg-black/40 px-3 py-2 text-center font-mono text-2xl font-bold tracking-[0.35em] text-white">{peerId ?? '••••••'}</code>
              <button type="button" onClick={copyCode} disabled={!peerId} aria-label="Copy code" className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40">
                {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-white/50 uppercase">Enter the other device’s 6-char code</p>
            <div className="flex items-center gap-2">
              <input value={remoteInput} onChange={(e) => setRemoteInput(e.target.value.toUpperCase())} maxLength={12} placeholder="e.g. 4F7K2Q" className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-center font-mono text-xl tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:outline-none" />
              <button type="button" onClick={placeCall} disabled={!peerId || !remoteInput.trim() || status === 'calling'} className="flex items-center gap-1.5 rounded-lg bg-plum-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-plum-600 disabled:opacity-40">
                <PhoneCall className="h-4 w-4" aria-hidden="true" /> Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-5">
        <Ctl onClick={toggleMute} active={!muted} disabled={!localStream} label={muted ? 'Unmute' : 'Mute'} icon={muted ? MicOff : Mic} danger={muted} />
        <Ctl onClick={toggleCamera} active={!cameraOff} disabled={!localStream} label={cameraOff ? 'Camera on' : 'Camera off'} icon={cameraOff ? VideoOff : VideoIcon} danger={cameraOff} />
        {connected
          ? <button type="button" onClick={hangup} className="flex items-center gap-2 rounded-full bg-[#D6262B] px-5 py-3 text-sm font-bold text-white hover:bg-[#a91f24]"><PhoneOff className="h-5 w-5" aria-hidden="true" /> Hang up</button>
          : <button type="button" onClick={close} className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white/80 hover:bg-white/20"><PhoneOff className="h-5 w-5" aria-hidden="true" /> Close</button>}
      </div>

      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-4 text-center text-[11px] text-white/40">
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Peer-to-peer · signaling via {SIGNALING_LABEL}{SELF_HOSTED ? '' : ' (public broker)'}</span>
        <span className="inline-flex items-center gap-1"><CircleSlash className="h-3.5 w-3.5" aria-hidden="true" /> Not recorded</span>
      </p>
    </div>
  )
}

function Ctl({ onClick, active, disabled, label, icon: Icon, danger }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${danger ? 'bg-[#D6262B]/80 text-white hover:bg-[#D6262B]' : active ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white/10 text-white/70'}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
