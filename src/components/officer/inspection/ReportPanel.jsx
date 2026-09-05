import { useState } from 'react'
import { CheckCircle2, RotateCcw, Flag, AlertTriangle } from 'lucide-react'
import { submitReport, reviewInspection } from '../../../services/inspectionsService.js'

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function SubmitReportForm({ inspectionId, onSubmitted }) {
  const [summary, setSummary] = useState('')
  const [findings, setFindings] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!summary.trim() || !recommendation.trim()) {
      setError('Please fill in the summary and recommendation.')
      return
    }
    setSubmitting(true)
    try {
      const updated = await submitReport(inspectionId, { summary, findings, recommendation })
      onSubmitted(updated)
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{error}</p>}
      <div>
        <label htmlFor="report-summary" className="mb-1 block text-sm font-medium text-plum-950">
          Summary
        </label>
        <textarea id="report-summary" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="report-findings" className="mb-1 block text-sm font-medium text-plum-950">
          Findings (one per line)
        </label>
        <textarea id="report-findings" rows={4} value={findings} onChange={(e) => setFindings(e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="report-recommendation" className="mb-1 block text-sm font-medium text-plum-950">
          Recommendation
        </label>
        <textarea id="report-recommendation" rows={2} value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none" />
      </div>
      <button type="submit" disabled={submitting} className="rounded-lg bg-[#D6262B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60">
        {submitting ? 'Submitting…' : 'Submit Report'}
      </button>
    </form>
  )
}

export default function ReportPanel({ inspection, canSubmit, canReview, onChanged }) {
  const [reviewing, setReviewing] = useState(false)
  const [decisionForm, setDecisionForm] = useState(null) // 'request-correction' | 'flag'
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  async function runDecision(decision, reasonText = '') {
    setReviewing(true)
    setError('')
    try {
      const updated = await reviewInspection(inspection.id, { decision, reason: reasonText })
      setDecisionForm(null)
      setReason('')
      onChanged(updated)
    } catch (e) {
      setError(e.message || 'Could not complete the review action.')
    } finally {
      setReviewing(false)
    }
  }

  if (!inspection.report) {
    if (canSubmit) return <SubmitReportForm inspectionId={inspection.id} onSubmitted={onChanged} />
    return <p className="rounded-xl border border-dashed border-plum-950/15 p-6 text-center text-sm text-plum-950/50">No report has been submitted yet.</p>
  }

  const r = inspection.report
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            r.status === 'reviewed' ? 'border-[#138808]/25 bg-green-50 text-[#16794f]' : 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]'
          }`}
        >
          {r.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-plum-950/50 uppercase">Summary</h4>
        <p className="mt-0.5 text-sm text-plum-950">{r.summary}</p>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-plum-950/50 uppercase">Findings</h4>
        <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-sm text-plum-950/80">
          {r.findings.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-plum-950/50 uppercase">Recommendation</h4>
        <p className="mt-0.5 text-sm text-plum-950">{r.recommendation}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-plum-950/10 pt-3 text-xs text-plum-950/60 sm:grid-cols-4">
        <div>
          <dt className="font-semibold uppercase">Submitted By</dt>
          <dd>{r.submittedBy}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase">Submitted At</dt>
          <dd>{formatTimestamp(r.submittedAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase">Reviewed By</dt>
          <dd>{r.reviewedBy ?? '—'}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase">Reviewed At</dt>
          <dd>{formatTimestamp(r.reviewedAt)}</dd>
        </div>
      </dl>

      {r.reviewNote && (
        <div className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${r.flagged ? 'border-[#D6262B]/25 bg-red-50 text-[#b23b3b]' : 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]'}`}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span><strong>{r.flagged ? 'Flagged for review' : 'Correction requested'}:</strong> {r.reviewNote}</span>
        </div>
      )}

      {canReview && r.status === 'pending-review' && (
        <div className="space-y-2 border-t border-plum-950/10 pt-3">
          {error && <p className="rounded-lg bg-red-50 p-2 text-xs font-medium text-[#D6262B]">{error}</p>}
          {decisionForm ? (
            <div className="rounded-xl border border-plum-950/12 bg-plum-50/40 p-3">
              <label htmlFor="review-reason" className="mb-1 block text-xs font-semibold text-plum-950/70">Reason ({decisionForm === 'flag' ? 'flag' : 'correction'} — required)</label>
              <textarea id="review-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={decisionForm === 'flag' ? 'Why is this being flagged?' : 'What must the inspector correct?'} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none" />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => { setDecisionForm(null); setReason('') }} className="rounded-lg border border-plum-950/15 px-3 py-1.5 text-xs font-semibold text-plum-950 hover:bg-white">Cancel</button>
                <button type="button" disabled={reviewing || !reason.trim()} onClick={() => runDecision(decisionForm, reason)} className="rounded-lg bg-plum-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-plum-900 disabled:opacity-50">{reviewing ? 'Saving…' : decisionForm === 'flag' ? 'Flag for review' : 'Request correction'}</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => runDecision('approve')} disabled={reviewing} className="flex items-center gap-1.5 rounded-lg bg-[#138808] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f6b06] disabled:opacity-60">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {reviewing ? 'Working…' : 'Approve & Close'}
              </button>
              <button type="button" onClick={() => setDecisionForm('request-correction')} disabled={reviewing} className="flex items-center gap-1.5 rounded-lg border border-[#e2a610]/40 bg-amber-50 px-4 py-2 text-sm font-semibold text-[#a15c00] hover:bg-amber-100 disabled:opacity-60">
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Request Correction
              </button>
              <button type="button" onClick={() => setDecisionForm('flag')} disabled={reviewing} className="flex items-center gap-1.5 rounded-lg border border-[#D6262B]/30 px-4 py-2 text-sm font-semibold text-[#D6262B] hover:bg-red-50 disabled:opacity-60">
                <Flag className="h-4 w-4" aria-hidden="true" /> Flag for Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
