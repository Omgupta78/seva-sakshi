import { useEffect, useRef, useState } from 'react'
import { Camera, VideoOff, Loader2, MonitorPlay, CheckCircle2, ShieldCheck, RefreshCw, X } from 'lucide-react'
import { getLocalMedia, releaseStream } from '../../services/videoCallProvider.js'
import { enrollStudentFace } from '../../services/institutionService.js'

/**
 * PROTOTYPE Face Enrollment.
 *
 * Working: camera permission, live preview, frame capture, confirm, and the
 * enrolment status update (embeddings are produced by the provider and stored
 * in the biometric vault server-side — never surfaced here).
 * Mock: the recognition/embedding engine is simulated (clearly labelled).
 *
 * The camera opens ONLY on an explicit user action and is released on capture,
 * cancel, success and unmount. A demo-capture fallback keeps the flow usable
 * when the camera is denied or unavailable.
 */
export default function FaceEnrollmentDialog({ student, onClose, onEnrolled }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [status, setStatus] = useState('idle') // idle|starting|live|denied|captured|enrolling|done
  const [message, setMessage] = useState(null)
  const [photo, setPhoto] = useState(null) // data URL preview (not biometric)
  const [demo, setDemo] = useState(false)

  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream }, [stream])
  useEffect(() => () => releaseStream(stream), [stream])

  function stopCamera() { releaseStream(stream); setStream(null) }

  async function openCamera() {
    setStatus('starting'); setMessage(null)
    const res = await getLocalMedia({ video: true, audio: false })
    if (res.stream) { setStream(res.stream); setStatus('live') }
    else { setStatus('denied'); setMessage(res.error ?? 'Camera unavailable.') }
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) { setMessage('Capture failed — try again.'); return }
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1) // un-mirror the selfie view
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setPhoto(canvas.toDataURL('image/jpeg', 0.8))
    stopCamera()
    setStatus('captured')
  }

  function demoCapture() {
    setDemo(true); setPhoto(null); stopCamera(); setStatus('captured')
  }

  function retake() { setPhoto(null); setStatus('idle'); if (demo) setStatus('idle') }

  async function confirm() {
    setStatus('enrolling'); setMessage(null)
    try {
      const res = await enrollStudentFace(student.id, { samples: 3 })
      setStatus('done')
      onEnrolled?.(res.student)
    } catch (e) {
      setMessage(e.message ?? 'Enrolment failed. Please try again.')
      setStatus('captured')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Face enrolment">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-plum-950/10 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-plum-950">Face Enrolment</h2>
            <p className="text-[11px] text-plum-950/55">{student.name} · {student.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-plum-950/60 hover:bg-plum-50"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>

        <div className="space-y-3 p-4">
          {/* Prototype banner — never presents mock recognition as real AI */}
          <div className="flex items-start gap-2 rounded-xl border border-[#e2a610]/35 bg-amber-50 p-2.5 text-[11px] text-[#a15c00]">
            <MonitorPlay className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span><strong>Prototype Face Enrolment.</strong> The camera and capture are real; the face-recognition engine is simulated and not yet connected. No biometric template is shown or stored in the browser.</span>
          </div>

          {status === 'done' ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#138808]" aria-hidden="true" />
              <p className="text-sm font-bold text-plum-950">{student.name} enrolled</p>
              <p className="text-xs text-plum-950/60">Face-enrolment status is now <strong>Enrolled</strong>. The student can be recognised in attendance sessions.</p>
              <button type="button" onClick={onClose} className="mt-2 rounded-lg bg-plum-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Done</button>
            </div>
          ) : status === 'captured' ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-plum-950/10 bg-[#0b0a14]">
                <div className="relative flex aspect-video w-full items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Captured preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/70"><Camera className="h-8 w-8" aria-hidden="true" /><p className="text-xs">Demo sample captured (no camera)</p></div>
                  )}
                </div>
              </div>
              {message && <p className="text-xs font-medium text-[#D6262B]">{message}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={retake} disabled={status === 'enrolling'} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-plum-950/15 py-2.5 text-sm font-semibold text-plum-950 hover:bg-plum-50 disabled:opacity-60"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Retake</button>
                <button type="button" onClick={confirm} disabled={status === 'enrolling'} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#138808] py-2.5 text-sm font-semibold text-white hover:bg-[#0f6b06] disabled:opacity-60">
                  {status === 'enrolling' ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enrolling…</> : <>Confirm &amp; Enrol</>}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-plum-950/10 bg-[#0b0a14]">
                <div className="relative aspect-video w-full">
                  {status === 'live' ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-3/4 w-2/5 rounded-[45%] border-2 border-dashed border-white/40" /></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/70">
                      {status === 'starting' ? (
                        <><Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" /><p className="text-sm">Starting camera…</p></>
                      ) : status === 'denied' ? (
                        <>
                          <VideoOff className="h-8 w-8 text-white/50" aria-hidden="true" />
                          <p className="max-w-xs text-sm">{message ?? 'Camera unavailable.'}</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            <button type="button" onClick={openCamera} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">Retry camera</button>
                            <button type="button" onClick={demoCapture} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-3 py-2 text-xs font-semibold text-white hover:bg-plum-700"><MonitorPlay className="h-3.5 w-3.5" aria-hidden="true" /> Use demo capture</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Camera className="h-8 w-8 text-white/50" aria-hidden="true" />
                          <p className="text-sm">The camera is off. It opens only when you start it.</p>
                          <button type="button" onClick={openCamera} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700"><Camera className="h-4 w-4" aria-hidden="true" /> Enable Camera</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {status === 'live' && (
                <button type="button" onClick={capture} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-plum-800 py-3 text-sm font-semibold text-white hover:bg-plum-700"><Camera className="h-4 w-4" aria-hidden="true" /> Capture Photo</button>
              )}
            </>
          )}

          <p className="flex items-start gap-1.5 text-[11px] text-plum-950/50"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> Consent-based capture. The photo preview is not persisted; only a secure template (server-side in production) backs recognition.</p>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
