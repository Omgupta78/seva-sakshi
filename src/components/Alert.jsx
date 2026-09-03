import { AlertTriangle, X } from 'lucide-react'

/**
 * Inline, dismissible error notification shown above the login form
 * when a submitted login attempt fails.
 */
export default function Alert({ message, onDismiss }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-lg border border-error-600/25 bg-red-50 px-3.5 py-3 text-sm text-error-600"
    >
      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" strokeWidth={2} />
      <p className="flex-1 leading-snug font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-0.5 text-error-600/70 hover:text-error-600"
          aria-label="Dismiss error message"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
