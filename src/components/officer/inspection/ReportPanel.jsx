import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { submitReport, reviewAndCloseReport } from '../../../services/inspectionsService.js'

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

  async function handleReview() {
    setReviewing(true)
    try {
      const updated = await reviewAndCloseReport(inspection.id)
      onChanged(updated)
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

      {canReview && r.status === 'pending-review' && (
        <button
          type="button"
          onClick={handleReview}
          disabled={reviewing}
          className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {reviewing ? 'Closing…' : 'Review & Close Inspection'}
        </button>
      )}
    </div>
  )
}
