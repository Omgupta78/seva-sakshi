import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Eye } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listUnassignedInspections } from '../../services/inspectionsService.js'
import { typeLabel } from '../../data/inspectionModels.js'
import DataTable from '../../components/officer/table/DataTable.jsx'
import { PriorityBadge, RiskBadge, InspectionStatusBadge } from '../../components/officer/table/Badges.jsx'
import AiAssignmentDialog from '../../components/officer/assignment/AiAssignmentDialog.jsx'
import AssignmentAuditLog from '../../components/officer/assignment/AssignmentAuditLog.jsx'

/**
 * PMU assignment queue: every inspection with no one assigned yet
 * (typically pending, occasionally overdue) — a focused view distinct
 * from the full /officer/inspections list, for the specific job of
 * getting an inspector on each one via the AI-Assisted Random
 * Inspection Assignment engine (or a reason-required manual override).
 */
export default function InspectionAssignmentPage() {
  const [assigning, setAssigning] = useState(null)
  const [auditKey, setAuditKey] = useState(0) // bump to force AssignmentAuditLog to refetch after an assignment
  const { data, loading, refetch } = useAsync(() => listUnassignedInspections(), [])

  const columns = [
    { key: 'id', label: 'Inspection ID' },
    { key: 'projectName', label: 'Project', render: (r) => <span className="block max-w-[200px] truncate font-semibold text-plum-950">{r.projectName}</span> },
    { key: 'organizationName', label: 'Organization', render: (r) => <span className="block max-w-[200px] truncate">{r.organizationName}</span> },
    { key: 'district', label: 'Location', render: (r) => `${r.district}, ${r.state}` },
    { key: 'type', label: 'Type', render: (r) => typeLabel(r.type) },
    { key: 'priority', label: 'Priority', render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'riskLevel', label: 'Risk Level', render: (r) => <RiskBadge level={r.riskLevel} /> },
    { key: 'status', label: 'Status', render: (r) => <InspectionStatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Link to={`/officer/inspections/${r.id}`} aria-label={`View ${r.id}`} className="rounded-lg p-1.5 text-plum-800 hover:bg-plum-50">
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setAssigning(r)}
            className="flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#a91f24]"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Assign
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Inspection Assignment</h1>
        <p className="text-sm text-plum-950/60">
          Inspections awaiting an inspector — use AI-Assisted Random Inspection Assignment, or assign manually with a reason.
        </p>
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <DataTable columns={columns} rows={data ?? []} loading={loading} emptyMessage="Nothing waiting on assignment — every inspection has an inspector." />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold text-plum-950">Assignment Audit Log</h2>
        <AssignmentAuditLog key={auditKey} />
      </div>

      {assigning && (
        <AiAssignmentDialog
          inspection={assigning}
          onClose={() => setAssigning(null)}
          onAssigned={() => {
            setAssigning(null)
            refetch()
            setAuditKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}
