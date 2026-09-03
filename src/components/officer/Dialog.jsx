import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Flexible modal dialog for the officer module (plum-themed, unlike the
 * Login page's navy Modal.jsx — kept separate rather than reworking a
 * shared component another page already depends on). Pass `footer` for
 * custom actions (e.g. Cancel/Confirm); omit it for a single "Close"
 * button. `size` controls max-width: 'sm' (default), 'md', 'lg'.
 */
export default function Dialog({ title, children, onClose, footer, size = 'sm' }) {
  const closeButtonRef = useRef(null)
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-950/50 px-4 py-6">
      <button type="button" aria-label="Close dialog" tabIndex={-1} className="absolute inset-0 cursor-default" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`relative flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl ${widths[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-plum-950/10 px-5 py-4">
          <h2 id="dialog-title" className="text-base font-bold text-plum-950">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded p-1 text-plum-950/50 hover:bg-plum-50 hover:text-plum-950"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm leading-relaxed text-plum-950/80">{children}</div>
        <div className="flex justify-end gap-2 border-t border-plum-950/10 px-5 py-3.5">
          {footer ?? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
