import { useRef, useState } from 'react'
import { Camera, Video, X } from 'lucide-react'
import { formatCoords } from '../../data/geoData.js'

/**
 * Camera capture for field evidence.
 *
 * Uses a plain file input with `capture` rather than getUserMedia: on
 * Android this opens the native camera app (better optics, flash,
 * focus, and no permission juggling), and on a desktop browser it
 * degrades to a normal file picker so the flow stays testable.
 *
 * No backend exists to upload to, so the file is held as an object URL
 * for in-session preview and the filename is recorded as the reference.
 * In production this is where the upload would happen.
 */
export default function EvidenceCapture({ onSave, coords, saving }) {
  const photoInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [pending, setPending] = useState(null) // { type, file, previewUrl }
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')

  function handleFile(type, event) {
    const file = event.target.files?.[0]
    event.target.value = '' // let the same file be picked again later
    if (!file) return
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl)
    setPending({ type, file, previewUrl: URL.createObjectURL(file) })
    setCaption('')
    setError('')
  }

  function discard() {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl)
    setPending(null)
    setCaption('')
  }

  async function save() {
    if (!caption.trim()) {
      setError('Add a short caption describing what this shows.')
      return
    }
    await onSave({
      type: pending.type,
      description: caption,
      fileRef: pending.file.name,
      previewUrl: pending.previewUrl,
    })
    setPending(null)
    setCaption('')
  }

  return (
    <section className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
      <h2 className="mb-1 text-sm font-bold text-plum-950">Capture Evidence</h2>
      <p className="mb-3 text-xs text-plum-950/50">
        GPS at capture: <span className="font-mono">{coords ? formatCoords(coords) : 'not captured yet'}</span>
      </p>

      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFile('photo', e)} className="hidden" />
      <input ref={videoInputRef} type="file" accept="video/*" capture="camcorder" onChange={(e) => handleFile('video', e)} className="hidden" />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl bg-plum-800 text-sm font-bold text-white active:bg-plum-900"
        >
          <Camera className="h-6 w-6" aria-hidden="true" />
          Take Photo
        </button>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-plum-800 text-sm font-bold text-plum-800 active:bg-plum-50"
        >
          <Video className="h-6 w-6" aria-hidden="true" />
          Record Video
        </button>
      </div>

      {pending && (
        <div className="mt-4 rounded-xl border border-plum-950/10 p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-xs font-bold tracking-wide text-plum-950/50 uppercase">{pending.type} ready to save</p>
            <button type="button" onClick={discard} aria-label="Discard capture" className="rounded-full p-1 text-plum-950/40 active:bg-plum-50">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {pending.type === 'photo' ? (
            <img src={pending.previewUrl} alt="Captured evidence preview" className="max-h-56 w-full rounded-lg object-cover" />
          ) : (
            <video src={pending.previewUrl} controls className="max-h-56 w-full rounded-lg" />
          )}

          <p className="mt-1.5 truncate text-[11px] text-plum-950/40">{pending.file.name}</p>

          <input
            type="text"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value)
              setError('')
            }}
            placeholder="Caption — what does this show?"
            aria-label="Evidence caption"
            className="mt-2 min-h-12 w-full rounded-xl border border-plum-950/15 px-3 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs font-medium text-[#D6262B]">{error}</p>}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-3 min-h-12 w-full rounded-xl bg-[#D6262B] text-sm font-bold text-white active:bg-[#a91f24] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Evidence'}
          </button>
        </div>
      )}
    </section>
  )
}
