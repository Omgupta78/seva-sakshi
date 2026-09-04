import { useEffect, useRef, useState } from 'react'
import { Camera, VideoOff, Loader2, MonitorPlay } from 'lucide-react'
import { getLocalMedia, releaseStream } from '../../../services/videoCallProvider.js'

/**
 * Reusable camera surface for enrolment and live attendance.
 * - The camera is opened ONLY on an explicit user action ("Open Camera").
 * - Reports status to the parent; the parent owns the capture/recognition.
 * - If the camera is denied/unavailable, offers a clearly-labelled demo
 *   simulation path so the flow can still be exercised (no real biometrics).
 */
export default function CameraCapture({ onStatusChange, onUseSimulation, guide = true, children }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | starting | live | denied | error
  const [stream, setStream] = useState(null)
  const [message, setMessage] = useState(null)

  function update(next, msg = null) {
    setStatus(next)
    setMessage(msg)
    onStatusChange?.(next)
  }

  async function openCamera() {
    update('starting')
    const res = await getLocalMedia({ video: true, audio: false })
    if (res.stream) {
      setStream(res.stream)
      update('live')
    } else {
      update('denied', res.error)
    }
  }

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])
  useEffect(() => () => releaseStream(stream), [stream])

  return (
    <div className="overflow-hidden rounded-2xl border border-plum-950/10 bg-[#0b0a14]">
      <div className="relative aspect-video w-full">
        {status === 'live' ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            {guide && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-3/4 w-2/5 rounded-[45%] border-2 border-dashed border-white/40" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02)_1px,transparent_1px,transparent_3px)]" />
            {children}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/70">
            {status === 'starting' ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
                <p className="text-sm">Starting camera…</p>
              </>
            ) : status === 'denied' || status === 'error' ? (
              <>
                <VideoOff className="h-8 w-8 text-white/50" aria-hidden="true" />
                <p className="max-w-xs text-sm">{message ?? 'Camera unavailable.'}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={openCamera} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">
                    Retry camera
                  </button>
                  {onUseSimulation && (
                    <button type="button" onClick={onUseSimulation} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-3 py-2 text-xs font-semibold text-white hover:bg-plum-700">
                      <MonitorPlay className="h-3.5 w-3.5" aria-hidden="true" /> Use demo simulation
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Camera className="h-8 w-8 text-white/50" aria-hidden="true" />
                <p className="text-sm">The camera is off. It opens only when you start it.</p>
                <button type="button" onClick={openCamera} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700">
                  <Camera className="h-4 w-4" aria-hidden="true" /> Open Camera
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
