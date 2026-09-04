import { useState } from 'react'
import { X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { VERIFICATION_RADIUS_KM, formatDistance } from '../../data/geoData.js'

function SummaryRow({ label, value, tone }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-plum-950/5 py-2.5 last:border-0">
      <span className="text-sm text-plum-950/60">{label}</span>
      <span className={`text-right text-sm font-bold ${tone ?? 'text-plum-950'}`}>{value}</span>
    </div>
  )
}

/**
 * Pre-submission review. Everything shown here is data already captured
 * during the inspection — the report text is composed from it in the
 * open (and shown before sending) rather than generated invisibly, so
 * the inspector signs off on exactly what gets filed.
 */
export default function SubmitReportSheet({ inspection, distanceKm, onClose, onSubmit, submitting }) {
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  const assessed = inspection.checklist.filter((c) => c.status)
  const total = inspection.checklist.length
  const compliant = inspection.checklist.filter((c) => c.status === 'compliant').length
  const shortfalls = inspection.checklist.filter((c) => c.status === 'non-compliant' || c.status === 'partially-compliant')
  const fv = inspection.fieldVerification
  const locationVerified = distanceKm !== null && distanceKm !== undefined && distanceKm <= VERIFICATION_RADIUS_KM

  const composed = {
    summary: `${inspection.projectName} (${inspection.organizationName}) inspected on ${new Date().toISOString().slice(0, 10)}. ${compliant} of ${total} checklist areas assessed compliant.${fv?.observation ? ` Observation: ${fv.observation}` : ''}`,
    findings: [
      ...shortfalls.map((c) => `${c.category}: ${c.status === 'non-compliant' ? 'Non-compliant' : 'Partially compliant'}${c.remarks ? ` — ${c.remarks}` : ''}`),
      ...(fv?.comments ? [`Inspector comments: ${fv.comments}`] : []),
      ...(shortfalls.length === 0 ? ['No shortfalls recorded against the assessed checklist areas.'] : []),
    ].join('\n'),
    recommendation:
      shortfalls.length > 0
        ? 'Follow-up required on the shortfalls listed above; schedule a re-inspection.'
        : 'No corrective action required; continue routine monitoring.',
  }

  function handleSubmit() {
    if (!confirmed) {
      setError('Please confirm the report is accurate before submitting.')
      return
    }
    onSubmit(composed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum-950/50">
      <button type="button" aria-label="Close" tabIndex={-1} className="absolute inset-0 cursor-default" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="submit-sheet-title" className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white">
        <div className="flex items-center justify-between border-b border-plum-950/10 px-4 py-3.5">
          <h2 id="submit-sheet-title" className="text-base font-bold text-plum-950">
            Review & Submit
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-plum-950/50 active:bg-plum-50">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <h3 className="mb-1 text-xs font-bold tracking-wide text-plum-950/50 uppercase">Inspection Summary</h3>
          <SummaryRow label="Inspection" value={inspection.id} />
          <SummaryRow label="Project" value={inspection.projectName} />
          <SummaryRow label="Organization" value={inspection.organizationName} />
          <SummaryRow label="Inspector" value={inspection.teamName} />

          <h3 className="mt-4 mb-1 text-xs font-bold tracking-wide text-plum-950/50 uppercase">Completion</h3>
          <SummaryRow
            label="Checklist completion"
            value={`${assessed.length} / ${total} assessed`}
            tone={assessed.length === total ? 'text-[#16794f]' : 'text-[#a15c00]'}
          />
          <SummaryRow label="Compliant areas" value={`${compliant} / ${total}`} />
          <SummaryRow label="Shortfalls recorded" value={shortfalls.length} tone={shortfalls.length > 0 ? 'text-[#D6262B]' : 'text-[#16794f]'} />
          <SummaryRow label="Evidence captured" value={`${inspection.evidence.length} item${inspection.evidence.length === 1 ? '' : 's'}`} />
          <SummaryRow
            label="Location verification"
            value={distanceKm === null || distanceKm === undefined ? 'Not captured' : locationVerified ? `Verified (${formatDistance(distanceKm)})` : `Away from site (${formatDistance(distanceKm)})`}
            tone={locationVerified ? 'text-[#16794f]' : 'text-[#a15c00]'}
          />

          <h3 className="mt-4 mb-1 text-xs font-bold tracking-wide text-plum-950/50 uppercase">Observations</h3>
          {fv?.observation || fv?.comments ? (
            <div className="space-y-2 rounded-xl bg-plum-50/60 p-3 text-sm text-plum-950/80">
              {fv.observation && <p>{fv.observation}</p>}
              {fv.comments && <p className="text-plum-950/60">{fv.comments}</p>}
              {(fv.staffInterviewed || fv.beneficiariesInterviewed) && (
                <p className="text-xs text-plum-950/50">
                  {fv.staffInterviewed || 0} staff and {fv.beneficiariesInterviewed || 0} beneficiaries interviewed
                  {fv.staffRoles ? ` (${fv.staffRoles})` : ''}.
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-xl bg-plum-50/60 p-3 text-sm text-plum-950/50">No observations recorded.</p>
          )}

          <h3 className="mt-4 mb-1 text-xs font-bold tracking-wide text-plum-950/50 uppercase">Report to be filed</h3>
          <div className="rounded-xl border border-plum-950/10 p-3 text-sm text-plum-950/80">
            <p>{composed.summary}</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-plum-950/70">
              {composed.findings.split('\n').map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <p className="mt-2 font-medium text-plum-950">{composed.recommendation}</p>
          </div>

          {assessed.length < total && (
            <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-amber-50 p-3 text-xs text-[#a15c00]">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {total - assessed.length} checklist area{total - assessed.length === 1 ? '' : 's'} not yet assessed. You can still
              submit, but they'll be filed as unassessed.
            </p>
          )}
        </div>

        <div className="border-t border-plum-950/10 px-4 py-3.5">
          <label className="mb-3 flex items-start gap-2.5 text-sm text-plum-950/80">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked)
                setError('')
              }}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-plum-950/30 text-plum-800"
            />
            I confirm this report reflects what I observed at the site.
          </label>
          {error && <p className="mb-2 text-xs font-medium text-[#D6262B]">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#D6262B] text-base font-bold text-white active:bg-[#a91f24] disabled:opacity-60"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            {submitting ? 'Submitting…' : 'Submit Inspection Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
