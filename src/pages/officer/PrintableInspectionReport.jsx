import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Printer } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { getInspection } from '../../services/inspectionsService.js'
import { exportPDF } from '../../utils/reportExports.js'
import { statusLabel, typeLabel } from '../../data/inspectionModels.js'
import { ChecklistItemBadge } from '../../components/officer/table/Badges.jsx'
import EmblemMark from '../../components/EmblemMark.jsx'

export default function PrintableInspectionReport() {
  const { id } = useParams()
  const { data: insp, loading, error } = useAsync(() => getInspection(id), [id])

  if (loading) return <p className="py-12 text-center text-sm text-plum-950/50">Loading inspection…</p>
  if (error || !insp) {
    return (
      <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-plum-950">Inspection not found.</p>
        <Link to="/officer/reports" className="mt-2 inline-block text-sm text-plum-800">Back to reports</Link>
      </div>
    )
  }

  const inspector = insp.teamMembers?.length ? insp.teamMembers.join(', ') : insp.teamName
  const report = insp.report
  const issues = (insp.checklist ?? []).filter((c) => c.status === 'non-compliant' || c.status === 'partially-compliant')

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Controls (hidden when printing) */}
      <div className="no-print flex items-center justify-between">
        <Link to="/officer/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-plum-800 no-underline hover:underline">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Reports
        </Link>
        <button type="button" onClick={exportPDF} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700">
          <Printer className="h-4 w-4" aria-hidden="true" /> Print / Save as PDF
        </button>
      </div>

      {/* The printable document */}
      <div className="printable-report rounded-2xl border border-plum-950/10 bg-white p-6 shadow-sm sm:p-8">
        {/* Letterhead */}
        <div className="flex items-center gap-3 border-b border-plum-950/15 pb-4">
          <EmblemMark className="h-12 w-auto" />
          <div>
            <p className="text-xs tracking-wide text-plum-950/60 uppercase">Government of India · Department of Social Justice &amp; Empowerment</p>
            <h1 className="text-lg font-extrabold text-plum-950">Inspection Report</h1>
            <p className="text-xs text-plum-950/55">Seva Sakshi Monitoring Platform · {typeLabel(insp.type)} inspection</p>
          </div>
        </div>

        {/* Summary grid */}
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 print-break">
          <Field label="Inspection ID"><span className="font-mono">{insp.id}</span></Field>
          <Field label="Final status"><span className="font-semibold">{statusLabel(insp.status)}</span>{report?.status ? ` · ${report.status}` : ''}</Field>
          <Field label="Risk level" className="capitalize">{insp.riskLevel}</Field>
          <Field label="Project">{insp.projectName}</Field>
          <Field label="Organization">{insp.organizationName}</Field>
          <Field label="Location">{insp.district}, {insp.state}</Field>
          <Field label="Inspector / Team">{inspector}</Field>
          <Field label="Scheduled date/time">{new Date(insp.scheduledDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Field>
          <Field label="Priority" className="capitalize">{insp.priority}</Field>
        </dl>

        {/* Checklist */}
        <Section title="Inspection checklist">
          {insp.checklist?.length ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-plum-950/15 text-xs text-plum-950/60 uppercase">
                  <th className="py-1.5 pr-2 font-semibold">Area</th>
                  <th className="py-1.5 pr-2 font-semibold">Result</th>
                  <th className="py-1.5 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {insp.checklist.map((c) => (
                  <tr key={c.id} className="border-b border-plum-950/5 align-top">
                    <td className="py-1.5 pr-2 font-medium text-plum-950">{c.category}</td>
                    <td className="py-1.5 pr-2"><ChecklistItemBadge status={c.status} /></td>
                    <td className="py-1.5 text-plum-950/75">{c.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Muted>No checklist recorded.</Muted>}
        </Section>

        {/* Observations */}
        <Section title="Observations">
          {report ? (
            <>
              <p className="text-sm text-plum-950/85">{report.summary}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-plum-950/80">
                {report.findings.map((fnd, i) => <li key={i}>{fnd}</li>)}
              </ul>
            </>
          ) : <Muted>Inspection not yet completed — observations pending.</Muted>}
        </Section>

        {/* Evidence */}
        <Section title="Evidence collected">
          {insp.evidence?.length ? (
            <ul className="space-y-1.5 text-sm">
              {insp.evidence.map((e) => (
                <li key={e.id} className="flex flex-wrap gap-x-2 text-plum-950/80">
                  <span className="rounded bg-plum-50 px-1.5 py-0.5 text-[10px] font-semibold text-plum-800 uppercase">{e.type}</span>
                  <span>{e.description}</span>
                  {e.fileRef && <span className="font-mono text-xs text-plum-950/45">({e.fileRef})</span>}
                  <span className="text-xs text-plum-950/45">— {e.inspector}, {new Date(e.timestamp).toLocaleDateString('en-IN')}</span>
                </li>
              ))}
            </ul>
          ) : <Muted>No evidence attached.</Muted>}
        </Section>

        {/* Issues */}
        <Section title="Issues identified">
          {issues.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-plum-950/80">
              {issues.map((c) => <li key={c.id}><span className="font-medium">{c.category}:</span> {c.remarks}</li>)}
            </ul>
          ) : <Muted>No compliance issues recorded in the checklist.</Muted>}
        </Section>

        {/* Recommendations */}
        <Section title="Recommendations">
          <p className="text-sm text-plum-950/85">{report?.recommendation ?? '—'}</p>
        </Section>

        {/* Sign-off */}
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-plum-950/15 pt-4 text-xs text-plum-950/70 print-break">
          <div>
            <p className="font-semibold text-plum-950">Submitted by</p>
            <p>{report?.submittedBy ?? inspector}</p>
            <p className="text-plum-950/45">{report?.submittedAt ? new Date(report.submittedAt).toLocaleString('en-IN') : '—'}</p>
          </div>
          <div>
            <p className="font-semibold text-plum-950">Reviewed by</p>
            <p>{report?.reviewedBy ?? '—'}</p>
            <p className="text-plum-950/45">{report?.reviewedAt ? new Date(report.reviewedAt).toLocaleString('en-IN') : '—'}</p>
          </div>
        </div>
        <p className="mt-4 text-[10px] text-plum-950/40">This report is generated by the Seva Sakshi monitoring platform for official use. Findings support human review and are not, by themselves, a determination of wrongdoing.</p>
      </div>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wide text-plum-950/50 uppercase">{label}</dt>
      <dd className={`mt-0.5 text-sm text-plum-950/85 ${className}`}>{children}</dd>
    </div>
  )
}
function Section({ title, children }) {
  return (
    <section className="mt-5 print-break">
      <h2 className="mb-2 text-sm font-bold text-plum-950">{title}</h2>
      {children}
    </section>
  )
}
function Muted({ children }) {
  return <p className="text-sm text-plum-950/50 italic">{children}</p>
}
