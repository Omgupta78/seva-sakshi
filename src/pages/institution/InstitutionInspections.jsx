import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { listInspections } from '../../services/inspectionsService.js'
import { InspectionStatusBadge, RiskBadge } from '../../components/officer/table/Badges.jsx'

export default function InstitutionInspections() {
  const { user } = useAuth()
  const { data, loading } = useAsync(() => listInspections({ pageSize: 500 }), [])
  const rows = (data?.items ?? []).filter((i) => !user?.organizationId || i.organizationId === user.organizationId)

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Inspections</h1>
        <p className="text-sm text-plum-950/60">Departmental inspections for your institution. Read-only — inspections are scheduled and conducted by DoSJE.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">Inspection ID</th><th className="px-3 py-2.5 font-semibold">Project</th><th className="px-3 py-2.5 font-semibold">Inspector / Team</th>
              <th className="px-3 py-2.5 font-semibold">Scheduled</th><th className="px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Risk</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-plum-950/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-10 text-center text-plum-950/50">No inspections recorded for your institution yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-plum-950/5 text-plum-950/85 last:border-0">
                <td className="px-3 py-2.5 font-mono text-xs font-semibold text-plum-950">{r.id}</td>
                <td className="px-3 py-2.5">{r.projectName}</td>
                <td className="px-3 py-2.5">{r.teamName}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{r.scheduledDate}</td>
                <td className="px-3 py-2.5"><InspectionStatusBadge status={r.status} /></td>
                <td className="px-3 py-2.5"><RiskBadge level={r.riskLevel} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
