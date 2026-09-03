import Dialog from './Dialog.jsx'

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', tone = 'default', onConfirm, onClose, confirming }) {
  return (
    <Dialog
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              tone === 'danger' ? 'bg-[#D6262B] hover:bg-[#a91f24]' : 'bg-plum-800 hover:bg-plum-900'
            }`}
          >
            {confirming ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      {message}
    </Dialog>
  )
}
