import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Minimal accessible modal dialog used for the "Forgot Password" and
 * "Citizen Login" demo actions. Traps Escape-to-close and returns focus
 * to the close button on open.
 */
export default function Modal({ title, children, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 px-4">
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-base font-semibold text-navy-950">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded p-1 text-navy-900/50 hover:bg-sky-100 hover:text-navy-900"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>
        <div className="text-sm leading-relaxed text-navy-950/70">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
