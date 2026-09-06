import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * ---------------------------------------------------------------------
 * useCamera — the reusable device-camera primitive (spec §3)
 * ---------------------------------------------------------------------
 * One place that owns the browser camera lifecycle for the whole app:
 *   - opens the camera ONLY when start() is called (never on mount/page load),
 *   - exposes a live <video> ref for preview,
 *   - capture() grabs a still frame as a JPEG data URL (un-mirrored),
 *   - stop() releases every MediaStreamTrack,
 *   - classifies failures into stable statuses the UI can branch on,
 *   - stops all tracks automatically on unmount / navigation away.
 *
 * Mobile-first: defaults to the front camera (facingMode 'user') at a
 * phone-friendly resolution; pass { facingMode: 'environment' } for the rear
 * camera. Uses only the standard navigator.mediaDevices.getUserMedia API.
 *
 * status: 'idle' | 'starting' | 'live' | 'denied' | 'unavailable'
 *       | 'unsupported' | 'in-use' | 'error'
 */
export function useCamera({ facingMode = 'user' } = {}) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const stop = useCallback(() => {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus('idle')
  }, [])

  const start = useCallback(async () => {
    // Guard: unsupported browser / insecure context (getUserMedia needs HTTPS or localhost).
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera access, or the page is not served over HTTPS.')
      setStatus('unsupported')
      return { ok: false, status: 'unsupported' }
    }
    setStatus('starting')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Best-effort play; some mobile browsers require the muted+playsInline attrs on the element.
        try { await videoRef.current.play() } catch { /* autoplay policy — preview still binds */ }
      }
      setStatus('live')
      return { ok: true, status: 'live' }
    } catch (err) {
      const name = err?.name || ''
      let next = 'error'
      let message = 'Could not start the camera. Please try again.'
      if (name === 'NotAllowedError' || name === 'SecurityError') { next = 'denied'; message = 'Camera permission was denied. Enable it in your browser settings to continue.' }
      else if (name === 'NotFoundError' || name === 'OverconstrainedError') { next = 'unavailable'; message = 'No camera device was found on this device.' }
      else if (name === 'NotReadableError' || name === 'AbortError') { next = 'in-use'; message = 'The camera is already in use by another app or tab.' }
      streamRef.current = null
      setError(message)
      setStatus(next)
      return { ok: false, status: next, error: message }
    }
  }, [facingMode])

  /** Grab the current frame as a JPEG data URL (un-mirrored). Returns null if not live. */
  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    // Front camera preview is mirrored for the user; un-mirror the saved frame.
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.8)
  }, [facingMode])

  // Always release the camera when the component using the hook unmounts.
  useEffect(() => stop, [stop])

  return { videoRef, status, error, start, stop, capture, isLive: status === 'live' }
}
