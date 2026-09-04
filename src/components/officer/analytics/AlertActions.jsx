import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ClipboardCheck, StickyNote, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { reviewAlert, assignInspection, addNote, resolveAlert, dismissAlert } from '../../../services/alertsService.js'

/** Officer actions on an alert: Review, Assign Inspection, Add Note, Resolve,
 *  Dismiss (with a required reason). Every action is recorded in the audit. */
export default function AlertActions({ alert, officer, onChanged }) {
  const [busy, setBusy] = useState(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [dismissOpen, setDismissOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)

  const closed = alert.status === 'resolved' || alert.status === 'dismissed'

  async function run(key, fn) {
    setBusy(key)
    setError(null)
    try { await fn(); onChanged?.() } catch (e) { setError(e.message ?? 'Action failed.') } finally { setBusy(null) }
  }

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-bold text-plum-950">Officer actions</h2>

      {closed ? (
        <p className="mb-3 rounded-lg bg-plum-50 p-2.5 text-xs text-plum-950/70">This alert is {alert.status}. You can still add a note for the record.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => run('review', () => reviewAlert(alert.id, officer))} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-800 hover:bg-plum-50 disabled:opacity-50">
            {busy === 'review' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />} Review
          </button>
          <button type="button" disabled={busy} onClick={() => run('assign', () => assignInspection(alert.id, officer))} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-800 hover:bg-plum-50 disabled:opacity-50">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Assign Inspection
          </button>
          <button type="button" onClick={() => setNoteOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-800 hover:bg-plum-50">
            <StickyNote className="h-4 w-4" aria-hidden="true" /> Add Note
          </button>
          <button type="button" disabled={busy} onClick={() => run('resolve', () => resolveAlert(alert.id, officer))} className="flex items-center gap-1.5 rounded-lg bg-[#138808] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0f6b06] disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Resolve
          </button>
          <button type="button" onClick={() => setDismissOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-[#D6262B]/25 px-3 py-2 text-sm font-semibold text-[#D6262B] hover:bg-red-50">
            <XCircle className="h-4 w-4" aria-hidden="true" /> Dismiss
          </button>
        </div>
      )}

      {/* Assign inspection deep-link */}
      {!closed && (
        <p className="mt-2 text-[11px] text-plum-950/50">
          Assigning flags this for follow-up and logs it. To schedule now, open <Link to="/officer/inspections/create" className="text-plum-800 hover:underline">Create Inspection</Link>.
        </p>
      )}

      {noteOpen && (
        <div className="mt-3 space-y-2">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Add a review note…" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          <button type="button" disabled={busy || !note.trim()} onClick={() => run('note', async () => { await addNote(alert.id, note, officer); setNote(''); setNoteOpen(false) })} className="rounded-lg bg-plum-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-plum-700 disabled:opacity-50">Save note</button>
        </div>
      )}

      {dismissOpen && !closed && (
        <div className="mt-3 space-y-2 rounded-lg border border-[#D6262B]/20 bg-red-50/40 p-3">
          <label htmlFor="dismiss-reason" className="text-xs font-semibold text-plum-950">Reason for dismissal (required)</label>
          <textarea id="dismiss-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="e.g. Known planned event explains the dip; verified with site." className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          <button type="button" disabled={busy || !reason.trim()} onClick={() => run('dismiss', async () => { await dismissAlert(alert.id, reason, officer); setReason(''); setDismissOpen(false) })} className="rounded-lg bg-[#D6262B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#a91f24] disabled:opacity-50">Confirm dismissal</button>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-medium text-[#D6262B]">{error}</p>}
    </div>
  )
}
