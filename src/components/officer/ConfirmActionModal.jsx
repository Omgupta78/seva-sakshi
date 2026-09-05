import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Dialog from './Dialog.jsx'

/**
 * Reusable confirmation modal for state-changing / destructive actions
 * (archive, deactivate, decommission, cancel, permanent delete).
 *
 * - `tone`: 'default' (archive/deactivate — neutral plum) or 'danger'
 *   (permanent delete — red).
 * - `warning`: optional emphasised line (e.g. "cannot be undone").
 * - `requireConfirmText`: when set, the confirm button stays disabled until
 *   the user types this exact value — used for high-risk permanent deletion.
 * - `onConfirm`: async; its rejection is caught and shown as an error state
 *   (the modal stays open). On success the caller closes the modal.
 * - `reasonRequired`: when true, a reason textarea is shown and its value is
 *   passed to onConfirm(reason).
 */
export default function ConfirmActionModal({
  title,
  description,
  warning,
  confirmLabel = 'Confirm',
  loadingLabel = 'Working…',
  tone = 'default',
  requireConfirmText = null,
  reasonRequired = false,
  reasonPlaceholder = 'Reason for this change…',
  onConfirm,
  onClose,
  children,
}) {
  const [typed, setTyped] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const typeOk = !requireConfirmText || typed.trim() === requireConfirmText
  const reasonOk = !reasonRequired || reason.trim().length > 0
  const canConfirm = typeOk && reasonOk && !submitting

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(reason.trim())
      // caller closes on success
    } catch (e) {
      setError(e?.message ?? 'The action could not be completed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title={title}
      onClose={submitting ? () => {} : onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${tone === 'danger' ? 'bg-[#D6262B] hover:bg-[#a91f24]' : 'bg-plum-800 hover:bg-plum-900'}`}
          >
            {submitting ? loadingLabel : confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {tone === 'danger' && (
          <div className="flex items-start gap-2 rounded-lg border border-[#D6262B]/25 bg-red-50 p-2.5 text-xs text-[#D6262B]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{warning ?? 'This action cannot be undone.'}</span>
          </div>
        )}
        <p className="text-sm text-plum-950/80">{description}</p>
        {tone !== 'danger' && warning && <p className="text-xs text-plum-950/55">{warning}</p>}
        {children}

        {reasonRequired && (
          <div>
            <label htmlFor="cam-reason" className="mb-1 block text-xs font-semibold text-plum-950/70">Reason (required)</label>
            <textarea id="cam-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder={reasonPlaceholder} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </div>
        )}

        {requireConfirmText && (
          <div>
            <label htmlFor="confirm-text" className="mb-1 block text-xs font-semibold text-plum-950/70">
              Type <span className="font-mono font-bold text-plum-950">{requireConfirmText}</span> to confirm
            </label>
            <input id="confirm-text" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 font-mono text-sm focus:outline-none" />
          </div>
        )}

        {error && <p className="rounded-lg bg-red-50 p-2 text-xs font-medium text-[#D6262B]">{error}</p>}
      </div>
    </Dialog>
  )
}
