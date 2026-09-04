import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, VideoIcon, VideoOff, PhoneOff, PhoneCall, Loader2, ShieldCheck, CircleSlash } from 'lucide-react'
import { getLocalMedia, setMuted, setCameraOff, releaseStream, connectToParticipant } from '../../../services/videoCallProvider.js'
import { markAccepted, startCall, markRejected, endCall } from '../../../services/videoCheckService.js'
import ParticipantTypeBadge from './ParticipantTypeBadge.jsx'

const STATUS_TEXT = {
  connecting: 'Connecting…',
  ringing: 'Requesting — waiting for participant to accept…',
  live: 'Connected',
  ended: 'Call ended',
}

/**
 * Full-screen video-call interface. Local video is the officer's real camera
 * (getUserMedia); the remote participant is simulated (DEMO MODE — no live
 * signaling). Drives the call lifecycle and its audit events through the
 * service, and never records any media.
 */
export default function VideoCallStage({ call, onClose }) {
  const localRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [mediaError, setMediaError] = useState(null)
  const [phase, setPhase] = useState('connecting') // connecting | ringing | live | ended
  const [muted, setMutedState] = useState(false)
  const [cameraOff, setCameraOffState] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [busy, setBusy] = useState(false)

  // Acquire local camera/mic (graceful if denied) + run the connection sim.
  useEffect(() => {
    let cancelled = false
    let conn
    getLocalMedia({ video: true, audio: true }).then((res) => {
      if (cancelled) {
        releaseStream(res.stream)
        return
      }
      setStream(res.stream)
      setMediaError(res.error)
      if (!res.hasVideo) setCameraOffState(true)
      conn = connectToParticipant({
        onStatus: async (s) => {
          if (cancelled) return
          if (s === 'connecting') setPhase('connecting')
          if (s === 'ringing') setPhase('ringing')
          if (s === 'connected') {
            await markAccepted(call.id)
            await startCall(call.id)
            if (!cancelled) setPhase('live')
          }
        },
      })
    })
    return () => {
      cancelled = true
      conn?.cancel()
    }
  }, [call.id])

  // Attach the stream to the <video> element once both exist.
  useEffect(() => {
    if (localRef.current && stream) localRef.current.srcObject = stream
  }, [stream])

  // Release camera/mic on unmount.
  useEffect(() => () => releaseStream(stream), [stream])

  // Call duration timer.
  useEffect(() => {
    if (phase !== 'live') return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  function toggleMute() {
    setMutedState((m) => setMuted(stream, !m))
  }
  function toggleCamera() {
    setCameraOffState((c) => setCameraOff(stream, !c))
  }

  async function handleDecline() {
    setBusy(true)
    await markRejected(call.id)
    releaseStream(stream)
    onClose({ outcome: 'rejected' })
  }

  async function handleEnd() {
    setBusy(true)
    if (phase === 'live') await endCall(call.id)
    else await markRejected(call.id) // ending before connect = not answered
    releaseStream(stream)
    onClose({ outcome: phase === 'live' ? 'ended' : 'rejected' })
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#0b0a14] text-white" role="dialog" aria-modal="true" aria-label="Video call">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${phase === 'live' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-200'}`}>
            {phase === 'live' ? <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" /> : <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
            {STATUS_TEXT[phase]}
          </span>
          {phase === 'live' && <span className="font-mono text-sm text-white/80">{mmss}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
            <CircleSlash className="h-3 w-3" aria-hidden="true" /> Not being recorded
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70">Demo mode</span>
        </div>
      </div>

      {/* Video area */}
      <div className="relative flex-1 px-4">
        {/* Remote (simulated) */}
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#1e2537] to-[#0b0a14]">
          <RemoteSimulated name={call.participantName} connected={phase === 'live'} />
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-black/45 px-2.5 py-1.5 backdrop-blur-sm">
            <ParticipantTypeBadge type={call.participantType} />
            <span className="text-sm font-semibold text-white">{call.participantName}</span>
          </div>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/45 px-2 py-1 text-[10px] font-semibold tracking-wide text-amber-200/90 uppercase backdrop-blur-sm">
            Simulated participant · demo — no live connection
          </span>
        </div>

        {/* Local (real camera) */}
        <div className="absolute right-6 bottom-4 h-32 w-44 overflow-hidden rounded-xl border border-white/15 bg-black/60 shadow-lg sm:h-36 sm:w-56">
          <video ref={localRef} autoPlay playsInline muted className={`h-full w-full -scale-x-100 object-cover ${cameraOff || !stream ? 'hidden' : ''}`} />
          {(cameraOff || !stream) && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-white/50">
              <VideoOff className="h-6 w-6" aria-hidden="true" />
              <span className="text-[10px]">{stream ? 'Camera off' : 'No camera'}</span>
            </div>
          )}
          <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80">You{muted ? ' · muted' : ''}</span>
        </div>
      </div>

      {mediaError && (
        <p className="mx-4 mt-2 rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-200">{mediaError}</p>
      )}

      {/* Participant info + context strip */}
      <div className="mx-4 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70">
        <span><span className="text-white/45">Project:</span> {call.projectName}</span>
        <span><span className="text-white/45">Context:</span> {call.context}</span>
        <span><span className="text-white/45">Officer:</span> {call.officerName}</span>
        <span className="font-mono text-white/45">{call.id}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-5">
        <ControlButton onClick={toggleMute} active={!muted} disabled={!stream} label={muted ? 'Unmute' : 'Mute'} icon={muted ? MicOff : Mic} danger={muted} />
        <ControlButton onClick={toggleCamera} active={!cameraOff} disabled={!stream} label={cameraOff ? 'Camera on' : 'Camera off'} icon={cameraOff ? VideoOff : VideoIcon} danger={cameraOff} />
        {phase === 'ringing' || phase === 'connecting' ? (
          <button
            type="button"
            onClick={handleDecline}
            disabled={busy}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/15 disabled:opacity-50"
          >
            <PhoneOff className="h-5 w-5" aria-hidden="true" /> Cancel request
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleEnd}
          disabled={busy}
          className="flex items-center gap-2 rounded-full bg-[#D6262B] px-5 py-3 text-sm font-bold text-white hover:bg-[#a91f24] disabled:opacity-50"
        >
          <PhoneOff className="h-5 w-5" aria-hidden="true" /> End Call
        </button>
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-4 text-[11px] text-white/40">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Metadata (who, when, status) is logged for audit. No audio or video is recorded.
      </p>
    </div>
  )
}

function ControlButton({ onClick, active, disabled, label, icon: Icon, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
        danger ? 'bg-[#D6262B]/80 text-white hover:bg-[#D6262B]' : active ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white/10 text-white/70'
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

/** Simulated remote tile — an abstract "connected participant" avatar. */
function RemoteSimulated({ name, connected }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {connected ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-plum-800/60 text-4xl font-bold text-white/90">
            {String(name ?? '?').trim().charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" /> Simulated live participant
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-white/50">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          <span className="text-sm">Placing call…</span>
        </div>
      )}
    </div>
  )
}
