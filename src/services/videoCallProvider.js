/**
 * ---------------------------------------------------------------------
 * VIDEO CALL PROVIDER — media + signaling abstraction (demo mode)
 * ---------------------------------------------------------------------
 * The call UI talks only to this abstraction, never directly to WebRTC or a
 * vendor SDK. That keeps the signaling/transport swappable: today it runs in
 * DEMO MODE (no signaling server), and a real deployment would replace the
 * internals with one of:
 *
 *   - raw WebRTC:  new RTCPeerConnection(iceConfig) + a signaling channel
 *     (WebSocket) to exchange SDP offer/answer and ICE candidates, and
 *     addTrack() for the local stream / ontrack for the remote stream;
 *   - a provider SDK: Twilio Video, Agora, 100ms, Daily, or a self-hosted
 *     Jitsi/LiveKit room — each exposes the same connect / local / remote /
 *     leave shape wrapped below.
 *
 * What is real here vs simulated:
 *   - LOCAL video/mic ARE real: we call getUserMedia so the officer sees
 *     their own camera (with graceful fallback if permission is denied —
 *     the call still proceeds, audio/'video off').
 *   - The REMOTE participant is SIMULATED (there is no peer to connect to),
 *     so the remote tile renders a clearly-labelled placeholder. Connection
 *     status is driven through a realistic connecting → connected lifecycle.
 *
 * No media is recorded anywhere in this module.
 * ---------------------------------------------------------------------
 */

export const PROVIDER = 'demo'
export const PROVIDER_LABEL = 'Demo (no live signaling)'

/**
 * Acquire the officer's local camera + microphone.
 * @returns {Promise<{ stream: MediaStream|null, hasVideo: boolean, hasAudio: boolean, error: string|null }>}
 */
export async function getLocalMedia({ video = true, audio = true } = {}) {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { stream: null, hasVideo: false, hasAudio: false, error: 'This browser cannot access camera/microphone.' }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
    return {
      stream,
      hasVideo: stream.getVideoTracks().length > 0,
      hasAudio: stream.getAudioTracks().length > 0,
      error: null,
    }
  } catch (err) {
    const map = {
      NotAllowedError: 'Camera/microphone permission was denied. The call will continue without your video.',
      NotFoundError: 'No camera or microphone was found on this device.',
      NotReadableError: 'Your camera or microphone is already in use by another app.',
    }
    return { stream: null, hasVideo: false, hasAudio: false, error: map[err?.name] ?? 'Could not start your camera/microphone.' }
  }
}

/** Enable/disable the local audio tracks (mute). Returns the new muted state. */
export function setMuted(stream, muted) {
  stream?.getAudioTracks().forEach((t) => { t.enabled = !muted })
  return muted
}

/** Enable/disable the local video tracks (camera off). Returns the new cameraOff state. */
export function setCameraOff(stream, off) {
  stream?.getVideoTracks().forEach((t) => { t.enabled = !off })
  return off
}

/** Stop every track and release the camera/mic. */
export function releaseStream(stream) {
  stream?.getTracks().forEach((t) => t.stop())
}

/**
 * Simulate the signaling handshake with the remote participant. In a real
 * provider this is where SDP/ICE negotiation happens; here we just move
 * through a realistic status lifecycle and report it back via `onStatus`.
 *
 * @returns {{ cancel: () => void }} teardown handle
 */
export function connectToParticipant({ onStatus }) {
  const timers = []
  onStatus?.('connecting')
  timers.push(setTimeout(() => onStatus?.('ringing'), 700))
  timers.push(setTimeout(() => onStatus?.('connected'), 2200))
  return {
    cancel() {
      timers.forEach(clearTimeout)
    },
  }
}
