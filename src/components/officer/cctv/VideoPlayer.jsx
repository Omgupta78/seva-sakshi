import { useEffect, useRef, useState } from 'react'
import { Loader2, VideoOff, AlertTriangle, Radio, FlaskConical, Smartphone } from 'lucide-react'
import { useAsync } from '../../../hooks/useAsync.js'
import { getStream, stopStream } from '../../../services/streamProvider.js'
import { createCameraViewer } from '../../../services/webrtcProvider.js'

/**
 * FRONTEND VIDEO PLAYER (demo).
 *
 * This is the third, cleanly-separated layer: it knows how to *render* a
 * feed but nothing about RTSP, credentials, or how the stream was brokered.
 * On mount it asks cctvStreamService for a playback descriptor (transport +
 * short-lived token) and plays whatever safe source that returns.
 *
 * Because no real gateway/camera is connected, the descriptor comes back in
 * `mode: 'placeholder'`, and we render a clearly-labelled SIMULATED feed —
 * never a claim that a live government camera is on screen. When a real
 * gateway returns `mode: 'live'` with an HLS/WebRTC `playbackUrl`, swap the
 * simulated scene for a `<video>` (HLS) or RTCPeerConnection (WebRTC) here;
 * nothing else in the app needs to change.
 */
export default function VideoPlayer({ camera }) {
  const { data: session, loading } = useAsync(() => getStream(camera.id), [camera.id])
  const [clock, setClock] = useState(() => new Date())
  const phoneRef = useRef(null)
  const [phoneStream, setPhoneStream] = useState(null) // live phone feed, if any device is broadcasting this camera id

  // Release the (simulated) gateway session token on unmount / camera change.
  useEffect(() => {
    return () => stopStream(session?.token)
  }, [session])

  // Try to attach a LIVE PHONE feed broadcasting under this camera's id. If a
  // phone is broadcasting (via /camera), its real video replaces the demo
  // placeholder; otherwise the honest placeholder shows. Keeps retrying so it
  // picks the feed up as soon as a phone comes online (or reconnects).
  useEffect(() => {
    let stopped = false
    let viewer = null
    let retry = null
    const attempt = () => {
      if (stopped) return
      viewer = createCameraViewer({
        code: camera.id,
        onStream: (s) => { if (!stopped) setPhoneStream(s) },
        onStatus: (s) => {
          if (s === 'ended' && !stopped) { // phone stopped/dropped → clear and look again
            setPhoneStream(null)
            try { viewer?.stop() } catch { /* noop */ }
            retry = setTimeout(attempt, 5000)
          }
        },
        onError: () => { // no phone yet (or a stale peer) → try again shortly
          try { viewer?.stop() } catch { /* noop */ }
          if (!stopped) retry = setTimeout(attempt, 5000)
        },
      })
    }
    setPhoneStream(null)
    attempt()
    return () => { stopped = true; if (retry) clearTimeout(retry); try { viewer?.stop() } catch { /* noop */ } setPhoneStream(null) }
  }, [camera.id])

  useEffect(() => { if (phoneRef.current && phoneStream) phoneRef.current.srcObject = phoneStream }, [phoneStream])

  // Live on-screen-display clock, like a real camera timestamp overlay.
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const offline = camera.status === 'offline'
  const unstable = camera.status === 'warning'
  const stamp = clock.toLocaleString('en-IN', { hour12: false })

  // A real phone is broadcasting this camera id — show the genuine live feed.
  if (phoneStream) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0b0a14]">
        <video ref={phoneRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 rounded bg-black/45 px-2 py-1 font-mono text-[11px] text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              {camera.id} · {camera.label}
            </div>
            <div className="rounded bg-black/45 px-2 py-1 font-mono text-[11px] text-white/90 backdrop-blur-sm">{stamp}</div>
          </div>
          <div className="flex items-end justify-between">
            <span className="inline-flex items-center gap-1 rounded bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-wide text-amber-200/90 uppercase backdrop-blur-sm">
              <Smartphone className="h-3 w-3" aria-hidden="true" /> Live phone feed · not a fixed CCTV camera
            </span>
          </div>
        </div>
        <span className="pointer-events-none absolute top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white">
          <Radio className="h-3 w-3" aria-hidden="true" /> LIVE
        </span>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0b0a14]">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <p className="text-xs">Connecting to stream…</p>
        </div>
      ) : session?.mode === 'not-configured' ? (
        <NotConfigured reason={session?.reason} />
      ) : offline || !session?.available ? (
        <NoSignal reason={session?.reason} />
      ) : (
        <>
          <SimulatedScene unstable={unstable} />

          {/* OSD overlay — top-left: camera id + REC; top-right: live time. */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 rounded bg-black/45 px-2 py-1 font-mono text-[11px] text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                {camera.id} · {camera.label}
              </div>
              <div className="rounded bg-black/45 px-2 py-1 font-mono text-[11px] text-white/90 backdrop-blur-sm">{stamp}</div>
            </div>

            <div className="flex items-end justify-between">
              <span className="rounded bg-black/45 px-2 py-1 text-[10px] font-semibold tracking-wide text-amber-200/90 uppercase backdrop-blur-sm">
                Sample feed · not a live government camera
              </span>
              <span className="rounded bg-black/45 px-2 py-1 font-mono text-[10px] text-white/70 backdrop-blur-sm">
                {camera.resolution} · {camera.fps}fps
              </span>
            </div>
          </div>

          {/* Status + mode pills, top-center. In demo mode the feed is clearly
              marked "DEMO STREAM" so it is never mistaken for a live camera. */}
          <div className="pointer-events-none absolute top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {unstable ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-bold text-black">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" /> UNSTABLE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white">
                <Radio className="h-3 w-3" aria-hidden="true" /> {session?.mode === 'demo' ? 'DEMO' : 'LIVE'}
              </span>
            )}
            {session?.mode === 'demo' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-200 uppercase backdrop-blur-sm">
                <FlaskConical className="h-3 w-3" aria-hidden="true" /> Demo Stream
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** "Camera gateway not configured" — no media gateway wired; never a fake feed. */
function NotConfigured({ reason }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(45deg,#111827,#111827_10px,#0b0a14_10px,#0b0a14_20px)] px-6 text-center text-white/60">
      <VideoOff className="h-8 w-8" aria-hidden="true" />
      <p className="text-sm font-semibold text-white/80">Camera gateway not configured</p>
      <p className="max-w-xs text-xs">{reason ?? 'No media gateway is configured for this deployment.'}</p>
    </div>
  )
}

/** "No signal" state for an offline camera — honest, not a frozen frame. */
function NoSignal({ reason }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(0deg,#111827,#111827_2px,#0b0a14_2px,#0b0a14_4px)] text-center text-white/55">
      <VideoOff className="h-8 w-8" aria-hidden="true" />
      <p className="text-sm font-semibold text-white/75">No signal</p>
      <p className="max-w-xs px-4 text-xs">{reason ?? 'This camera is not currently reachable.'}</p>
    </div>
  )
}

/**
 * A self-contained animated "surveillance view" — pure SVG/CSS, no external
 * assets or network. Deliberately abstract (a courtyard with moving dots),
 * so it reads as a demo feed and never implies real footage of real people.
 */
function SimulatedScene({ unstable }) {
  return (
    <div className={`absolute inset-0 ${unstable ? 'cctv-flicker' : ''}`}>
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="cctv-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e2537" />
            <stop offset="1" stopColor="#0b0a14" />
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill="url(#cctv-sky)" />
        {/* perspective floor */}
        <polygon points="0,180 320,180 250,90 70,90" fill="#141a29" />
        <line x1="70" y1="90" x2="0" y2="180" stroke="#243049" strokeWidth="1" />
        <line x1="250" y1="90" x2="320" y2="180" stroke="#243049" strokeWidth="1" />
        <line x1="120" y1="90" x2="70" y2="180" stroke="#1c2437" strokeWidth="1" />
        <line x1="200" y1="90" x2="250" y2="180" stroke="#1c2437" strokeWidth="1" />
        <line x1="30" y1="135" x2="290" y2="135" stroke="#1c2437" strokeWidth="1" />
        {/* a slow-moving "subject" dot to give the feed life */}
        <circle r="4" fill="#5b6b8f">
          <animateMotion dur="14s" repeatCount="indefinite" path="M90,150 L150,120 L210,150 L150,165 Z" />
        </circle>
        <circle r="3" fill="#455066">
          <animateMotion dur="19s" repeatCount="indefinite" path="M230,160 L200,110 L120,120 L110,160 Z" />
        </circle>
      </svg>
      {/* scanline sheen */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03),rgba(255,255,255,0.03)_1px,transparent_1px,transparent_3px)]" />
    </div>
  )
}
