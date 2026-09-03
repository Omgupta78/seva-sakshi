import { Link } from 'react-router-dom'
import Dialog from '../Dialog.jsx'
import { OrgStatusBadge, ComplianceBadge, ProjectStatusBadge } from '../table/Badges.jsx'

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-plum-950/50 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-plum-950">{value}</dd>
    </div>
  )
}

export default function OrganizationDetailsDialog({ organization, onClose }) {
  return (
    <Dialog title={organization.name} onClose={onClose} size="lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <OrgStatusBadge status={organization.status} />
        <ComplianceBadge status={organization.complianceStatus} />
        <span className="text-xs text-plum-950/50">{organization.type}</span>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Registration Number" value={organization.registrationNumber} />
        <Field label="Registered On" value={organization.registrationDate} />
        <Field label="Location" value={`${organization.district}, ${organization.state}`} />
        <Field label="Contact Person" value={organization.contactPerson} />
        <Field label="Contact Phone" value={organization.contactPhone} />
        <Field label="Contact Email" value={organization.contactEmail || '—'} />
      </dl>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-bold text-plum-950">Projects ({organization.projects.length})</h3>
        {organization.projects.length === 0 ? (
          <p className="text-sm text-plum-950/50">No projects linked yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {organization.projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-plum-950/10 px-3 py-2">
                <Link to={`/officer/projects/${p.id}`} onClick={onClose} className="text-sm font-medium text-plum-800 no-underline hover:underline">
                  {p.name}
                </Link>
                <ProjectStatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-bold text-plum-950">Inspection History</h3>
        {organization.inspectionHistory.length === 0 ? (
          <p className="text-sm text-plum-950/50">No inspections recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-plum-950/10">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Project</th>
                  <th className="px-3 py-2 font-semibold">Inspector</th>
                  <th className="px-3 py-2 font-semibold">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {organization.inspectionHistory.map((h) => (
                  <tr key={h.id} className="border-b border-plum-950/5 last:border-0">
                    <td className="px-3 py-2 text-plum-950/85">{h.date}</td>
                    <td className="px-3 py-2 text-plum-950/70">{h.projectName}</td>
                    <td className="px-3 py-2 font-medium text-plum-950">{h.inspector}</td>
                    <td className="px-3 py-2 text-plum-950/70">{h.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Dialog>
  )
}
