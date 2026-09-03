import { Link } from 'react-router-dom'
import { typeLabel } from '../../../data/inspectionModels.js'
import { InspectionStatusBadge } from '../table/Badges.jsx'

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-plum-950/50 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-plum-950">{value}</dd>
    </div>
  )
}

export function InspectionOverviewTab({ inspection }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-bold text-plum-950">Project Information</h3>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Project" value={<Link to={`/officer/projects/${inspection.projectId}`} className="text-plum-800 no-underline hover:underline">{inspection.projectName}</Link>} />
          <Field label="Implementing Organization" value={inspection.organizationName} />
          <Field label="Location" value={`${inspection.district}, ${inspection.state}`} />
        </dl>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-plum-950">Assignment & Schedule</h3>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label={inspection.assignedInspectorId ? 'Assigned Inspector' : 'Assigned Team'} value={inspection.teamName} />
          <Field label="Members" value={inspection.teamMembers.length > 0 ? inspection.teamMembers.join(', ') : '—'} />
          <Field label="Scheduled Date" value={inspection.scheduledDate} />
          <Field label="Inspection Type" value={typeLabel(inspection.type)} />
          <Field label="Last Updated" value={new Date(inspection.lastUpdated).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} />
        </dl>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-plum-950">Reason</h3>
        <p className="text-sm text-plum-950/70">{inspection.reason}</p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-plum-950">Required Inspection Areas</h3>
        <div className="flex flex-wrap gap-1.5">
          {inspection.requiredAreas.map((area) => (
            <span key={area} className="rounded-full border border-plum-950/15 bg-plum-50/60 px-2.5 py-0.5 text-xs font-medium text-plum-950/80">
              {area}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HistoryTab({ inspection }) {
  if (inspection.projectHistory.length === 0) {
    return <p className="rounded-xl border border-dashed border-plum-950/15 p-6 text-center text-sm text-plum-950/50">No other inspections recorded for this project yet.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            <th className="px-3 py-2.5 font-semibold">Inspection ID</th>
            <th className="px-3 py-2.5 font-semibold">Type</th>
            <th className="px-3 py-2.5 font-semibold">Scheduled Date</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {inspection.projectHistory.map((h) => (
            <tr key={h.id} className="border-b border-plum-950/5 last:border-0">
              <td className="px-3 py-2.5">
                <Link to={`/officer/inspections/${h.id}`} className="font-medium text-plum-800 no-underline hover:underline">
                  {h.id}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-plum-950/70">{typeLabel(h.type)}</td>
              <td className="px-3 py-2.5 text-plum-950/70">{h.scheduledDate}</td>
              <td className="px-3 py-2.5">
                <InspectionStatusBadge status={h.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
