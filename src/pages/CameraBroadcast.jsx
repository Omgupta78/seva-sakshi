import { useEffect, useRef, useState } from 'react'
import { Video, VideoOff, RefreshCw, Radio, ShieldCheck, Loader2, SwitchCamera, CircleStop } from 'lucide-react'
import { getLocalMedia, releaseStream } from '../services/videoCallProvider.js'
import { createCameraBroadcast, SIGNALING_LABEL } from '../services/webrtcProvider.js'

/**
 * PHONE-AS-CAMERA broadcaster (public page, open it on the phone).
 *
 * Turns this device into a live camera: it captures the (rear) camera and
 * broadcasts it over real WebRTC under a short camera code. The monitoring
 * dashboard's "View Live" for the SAME code then shows this phone's video.
 *
 * This is a genuine live phone feed — it is labelled as such everywhere and
 * never presented as a configured CCTV gateway. Nothing is recorded here.
 */
export default function CameraBroadcast() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const castRef = useRef(null)

  const [code, setCode] = useState('CAM-0003')
  const [facing, setFacing] = useState('environment') // rear camera by default
  const [stream, setStream] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | starting | ready | live | error
  const [viewers, setViewers] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream }, [stream])

  function teardownCast() {
    try { castRef.current?.stop() } catch { /* noop */ }
    castRef.current = null
    setViewers(0)
  }

  function stopAll() {
    teardownCast()
    releaseStream(streamRef.current)
    streamRef.current = null
    setStream(null)
    setPhase('idle')
  }

  // Release everything when leaving the page.
  useEffect(() => () => stopAll(), []) // eslint-disable-line react-hooks/exhaustive-deps

  async function startBroadcast() {
    setError(null)
    setPhase('starting')
    const res = await getLocalMedia({ video: { facingMode: facing }, audio: false })
    if (!res.stream) { setError(res.error); setPhase('error'); return }
    streamRef.current = res.stream
    setStream(res.stream)
    castRef.current = createCameraBroadcast({
      code,
      stream: res.stream,
      onStatus: (s, n) => {
        if (s === 'online') setPhase('live')
        if (s === 'viewer') setViewers(n ?? 0)
      },
      onError: (msg) => { setError(msg); setPhase('error'); teardownCast() },
    })
    setPhase('live')
  }

  async function switchCamera() {
    const next = facing === 'environment' ? 'user' : 'environment'
    setFacing(next)
    if (phase !== 'live') return
    // Re-acquire with the new facing mode and hand the new stream to the cast.
    const res = await getLocalMedia({ video: { facingMode: next }, audio: false })
    if (!res.stream) { setError(res.error); return }
    releaseStream(streamRef.current)
    streamRef.current = res.stream
    setStream(res.stream)
    // simplest reliable swap: restart the broadcast with the new stream
    teardownCast()
    castRef.current = createCameraBroadcast({
      code, stream: res.stream,
      onStatus: (s, n) => { if (s === 'viewer') setViewers(n ?? 0) },
      onError: (msg) => { setError(msg); teardownCast() },
    })
  }

  const live = phase === 'live'

  return (
    <div className="min-h-screen bg-[#0b0a14] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-extrabold">Seva Sakshi — Phone Camera</p>
            <p className="text-[11px] text-white/55">Use this phone as a live monitoring camera</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${live ? 'bg-red-600/90 text-white' : 'bg-white/10 text-white/70'}`}>
            {live ? <><Radio className="h-3 w-3" aria-hidden="true" /> LIVE</> : 'Offline'}
          </span>
        </header>

        {/* Preview */}
        <div className="relative mx-4 aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-black sm:aspect-video">
          {stream ? (
            <video ref={videoRef} autoPlay playsInline muted className={`h-full w-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/55">
              {phase === 'starting' ? <><Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" /><p className="text-sm">Starting camera…</p></>
                : <><VideoOff className="h-8 w-8" aria-hidden="true" /><p className="text-sm">Camera off</p></>}
            </div>
          )}
          {live && (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
                <span className="rounded bg-black/50 px-2 py-1 font-mono text-[11px] backdrop-blur-sm">{code}</span>
                <span className="rounded bg-black/50 px-2 py-1 text-[11px] backdrop-blur-sm">{viewers} watching</span>
              </div>
              <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-[10px] font-semibold tracking-wide text-amber-200 uppercase backdrop-blur-sm">
                Live phone feed · not a CCTV camera
              </span>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-3 px-4">
          <div>
            <label htmlFor="cam-code" className="mb-1 block text-xs font-semibold text-white/60">Camera code (match the camera you open in the dashboard)</label>
            <input id="cam-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} disabled={live}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:outline-none disabled:opacity-60" />
          </div>

          {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</p>}

          <div className="flex items-center gap-2">
            {!live ? (
              <button type="button" onClick={startBroadcast} disabled={!code.trim() || phase === 'starting'} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#138808] py-3 text-sm font-bold text-white hover:bg-[#0f6b06] disabled:opacity-50">
                <Video className="h-4 w-4" aria-hidden="true" /> Start broadcasting
              </button>
            ) : (
              <button type="button" onClick={stopAll} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#D6262B] py-3 text-sm font-bold text-white hover:bg-[#a91f24]">
                <CircleStop className="h-4 w-4" aria-hidden="true" /> Stop broadcasting
              </button>
            )}
            <button type="button" onClick={switchCamera} title="Switch front/back camera" className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
              {phase === 'idle' ? <RefreshCw className="h-4 w-4" aria-hidden="true" /> : <SwitchCamera className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-white/50">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Real peer-to-peer video via {SIGNALING_LABEL}. Keep this page open and the screen on while broadcasting. Nothing is recorded. In the dashboard, open <span className="font-mono text-white/70">{code}</span> → “View Live” to watch this feed.
          </p>
        </div>

        <div className="flex-1" />
        <footer className="px-4 py-3 text-center text-[10px] text-white/35">Seva Sakshi · DoSJE monitoring · live phone camera (WebRTC)</footer>
      </div>
    </div>
  )
}
