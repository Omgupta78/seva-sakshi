import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Sparkles, Ban, Archive } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { listInspections, cancelInspection, archiveInspection } from '../../services/inspectionsService.js'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'
import { typeLabel } from '../../data/inspectionModels.js'
import DataTable from '../../components/officer/table/DataTable.jsx'
import Pagination from '../../components/officer/table/Pagination.jsx'
import { InspectionStatusBadge, PriorityBadge, RiskBadge } from '../../components/officer/table/Badges.jsx'
import InspectionFilters from '../../components/officer/inspection/InspectionFilters.jsx'
import AiAssignmentDialog from '../../components/officer/assignment/AiAssignmentDialog.jsx'

const initialFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  riskLevel: 'all',
  type: 'all',
  sortBy: 'scheduledDate',
  sortDir: 'desc',
  page: 1,
  pageSize: 6,
}

function formatDateTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function InspectionsList() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const toast = useToast()
  const canAssign = hasPermission(PERMISSIONS.ASSIGN_INSPECTION)
  const canCancel = hasPermission(PERMISSIONS.INSPECTION_CANCEL)
  const [filters, setFilters] = useState(initialFilters)
  const [assigning, setAssigning] = useState(null)
  const [action, setAction] = useState(null) // { type, inspection }

  const { data, loading, refetch } = useAsync(() => listInspections(filters), [JSON.stringify(filters)])

  function handleSort(key) {
    setFilters((prev) => ({ ...prev, sortBy: key, sortDir: prev.sortBy === key && prev.sortDir === 'asc' ? 'desc' : 'asc', page: 1 }))
  }

  const columns = [
    { key: 'id', label: 'Inspection ID', sortable: true },
    { key: 'projectName', label: 'Project', render: (r) => <span className="block max-w-[180px] truncate font-semibold text-plum-950">{r.projectName}</span> },
    { key: 'organizationName', label: 'Organization', render: (r) => <span className="block max-w-[180px] truncate">{r.organizationName}</span> },
    { key: 'teamName', label: 'Inspector / Team' },
    { key: 'district', label: 'Location', render: (r) => `${r.district}, ${r.state}` },
    { key: 'scheduledDate', label: 'Scheduled Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <InspectionStatusBadge status={r.status} /> },
    { key: 'priority', label: 'Priority', sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'riskLevel', label: 'Risk Level', render: (r) => <RiskBadge level={r.riskLevel} /> },
    { key: 'lastUpdated', label: 'Last Updated', render: (r) => formatDateTime(r.lastUpdated) },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => navigate(`/officer/inspections/${r.id}`)} aria-label={`View ${r.id}`} className="rounded-lg p-1.5 text-plum-800 hover:bg-plum-50">
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          {canAssign && !r.assignedTeamId && !r.assignedInspectorId && (
            <button type="button" onClick={() => setAssigning(r)} aria-label={`Assign inspector to ${r.id}`} className="rounded-lg p-1.5 text-plum-800 hover:bg-plum-50">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <ActionMenu items={[
            { label: 'View', icon: Eye, onClick: () => navigate(`/officer/inspections/${r.id}`) },
            { label: 'Cancel inspection', icon: Ban, tone: 'danger', onClick: () => setAction({ type: 'cancel', inspection: r }), hidden: !canCancel || r.status === 'completed' || r.status === 'cancelled' },
            { label: 'Archive inspection', icon: Archive, onClick: () => setAction({ type: 'archive', inspection: r }), hidden: !canCancel || r.status !== 'completed' || r.archived },
          ]} />
        </div>
      ),
    },
  ]

  async function runAction() {
    const { type, inspection } = action
    if (type === 'cancel') { await cancelInspection(inspection.id); toast.success(`Inspection ${inspection.id} cancelled.`) }
    else if (type === 'archive') { await archiveInspection(inspection.id); toast.success(`Inspection ${inspection.id} archived.`) }
    setAction(null)
    refetch()
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Inspections</h1>
        <p className="text-sm text-plum-950/60">Every inspection across projects — routine, surprise, follow-up, special, and AI-triggered.</p>
      </div>

      <InspectionFilters filters={filters} onChange={setFilters} />

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <DataTable
          columns={columns}
          rows={(data?.items ?? []).map((r) => ({ ...r, type: typeLabel(r.type) }))}
          loading={loading}
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onSort={handleSort}
          onRowClick={(r) => navigate(`/officer/inspections/${r.id}`)}
          emptyMessage="No inspections match these filters."
        />
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />}
      </div>

      {assigning && (
        <AiAssignmentDialog
          inspection={assigning}
          onClose={() => setAssigning(null)}
          onAssigned={() => {
            setAssigning(null)
            refetch()
          }}
        />
      )}

      {action?.type === 'cancel' && (
        <ConfirmActionModal title="Cancel inspection?"
          description={`Cancel inspection ${action.inspection.id} for ${action.inspection.projectName}? This is only allowed for inspections that are not yet completed.`}
          confirmLabel="Cancel inspection" loadingLabel="Cancelling…" onConfirm={runAction} onClose={() => setAction(null)} />
      )}
      {action?.type === 'archive' && (
        <ConfirmActionModal title="Archive inspection?"
          description={`Archive completed inspection ${action.inspection.id}? Its report, checklist and evidence remain accessible to authorised users.`}
          confirmLabel="Archive inspection" loadingLabel="Archiving…" onConfirm={runAction} onClose={() => setAction(null)} />
      )}
    </div>
  )
}
