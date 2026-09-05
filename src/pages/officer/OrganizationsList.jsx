import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, PowerOff, Power } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { listOrganizations, deactivateOrganization, reactivateOrganization } from '../../services/organizationsService.js'
import { ORG_TYPES } from '../../data/models.js'
import DataTable from '../../components/officer/table/DataTable.jsx'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'
import { OrgStatusBadge, ComplianceBadge } from '../../components/officer/table/Badges.jsx'
import OrganizationFilters from '../../components/officer/organization/OrganizationFilters.jsx'
import AddOrganizationModal from '../../components/officer/organization/AddOrganizationModal.jsx'
import EditOrganizationModal from '../../components/officer/organization/EditOrganizationModal.jsx'
import OrganizationDetailsDialog from '../../components/officer/organization/OrganizationDetailsDialog.jsx'

const initialFilters = { search: '', type: 'all', status: 'all', district: 'all' }

/**
 * Shared list page for both /officer/institutes and /officer/ngos —
 * `category` selects which slice of the Organization store to show.
 */
export default function OrganizationsList({ category }) {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [filters, setFilters] = useState(initialFilters)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(null) // organization pending activate/deactivate confirmation

  const { data, loading, refetch } = useAsync(() => listOrganizations({ ...filters, category }), [JSON.stringify(filters), category])

  const typeOptions = category === 'ngo' ? [] : ORG_TYPES.filter((t) => t !== 'NGO')
  const title = category === 'ngo' ? 'NGOs' : 'Institutes'
  const addLabel = category === 'ngo' ? 'Add NGO' : 'Add Organization'
  const canToggle = hasPermission(category === 'ngo' ? PERMISSIONS.NGO_DEACTIVATE : PERMISSIONS.INSTITUTE_DEACTIVATE)

  async function runToggle(reason) {
    const org = togglingStatus
    if (org.status === 'active') { await deactivateOrganization(org.id, reason); toast.success(`${org.name} deactivated successfully.`) }
    else { await reactivateOrganization(org.id); toast.success(`${org.name} reactivated.`) }
    setTogglingStatus(null)
    refetch()
  }

  const columns = [
    { key: 'name', label: 'Organization Name', render: (r) => <span className="font-semibold text-plum-950">{r.name}</span> },
    { key: 'registrationNumber', label: 'Registration Details', render: (r) => <span className="text-xs">{r.registrationNumber}</span> },
    { key: 'projects', label: 'Projects', render: (r) => r.projects.length },
    { key: 'district', label: 'Location', render: (r) => `${r.district}, ${r.state}` },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'status', label: 'Status', render: (r) => <OrgStatusBadge status={r.status} /> },
    { key: 'complianceStatus', label: 'Compliance', render: (r) => <ComplianceBadge status={r.complianceStatus} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <ActionMenu items={[
          { label: 'View', icon: Eye, onClick: () => setViewing(r) },
          { label: 'Edit', icon: Pencil, onClick: () => setEditing(r) },
          { label: 'Deactivate', icon: PowerOff, tone: 'danger', onClick: () => setTogglingStatus(r), hidden: !canToggle || r.status !== 'active' },
          { label: 'Reactivate', icon: Power, onClick: () => setTogglingStatus(r), hidden: !canToggle || r.status === 'active' },
        ]} />
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{title}</h1>
        <p className="text-sm text-plum-950/60">Implementing organizations registered under DoSJE schemes.</p>
      </div>

      <div className="flex w-fit gap-1 rounded-lg border border-plum-950/10 bg-white p-1 shadow-sm">
        <Link
          to="/officer/institutes"
          className={`rounded-md px-3.5 py-1.5 text-sm font-semibold no-underline ${
            category === 'institute' ? 'bg-plum-800 text-white' : 'text-plum-950/60 hover:text-plum-950'
          }`}
        >
          Institutes
        </Link>
        <Link
          to="/officer/ngos"
          className={`rounded-md px-3.5 py-1.5 text-sm font-semibold no-underline ${
            category === 'ngo' ? 'bg-plum-800 text-white' : 'text-plum-950/60 hover:text-plum-950'
          }`}
        >
          NGOs
        </Link>
      </div>

      <OrganizationFilters filters={filters} onChange={setFilters} typeOptions={typeOptions} onAdd={() => setShowAddModal(true)} addLabel={addLabel} />

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <DataTable columns={columns} rows={data?.items ?? []} loading={loading} emptyMessage={`No ${title.toLowerCase()} match these filters.`} />
        {data && <p className="px-1 py-2 text-xs text-plum-950/50">{data.total} total</p>}
      </div>

      {showAddModal && (
        <AddOrganizationModal
          defaultType={category === 'ngo' ? 'NGO' : undefined}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false)
            refetch()
          }}
        />
      )}

      {editing && (
        <EditOrganizationModal
          organization={editing}
          onClose={() => setEditing(null)}
          onUpdated={() => {
            setEditing(null)
            refetch()
          }}
        />
      )}

      {viewing && <OrganizationDetailsDialog organization={viewing} onClose={() => setViewing(null)} />}

      {togglingStatus && (
        <ConfirmActionModal
          title={togglingStatus.status === 'active' ? 'Deactivate Organization?' : 'Reactivate Organization?'}
          description={
            togglingStatus.status === 'active'
              ? `Are you sure you want to deactivate ${togglingStatus.name}? It will be marked inactive, but its historical projects, inspections, attendance and reports will remain available.`
              : `Reactivate ${togglingStatus.name}? It will appear in active organization lists again.`
          }
          confirmLabel={togglingStatus.status === 'active' ? 'Deactivate' : 'Reactivate'}
          loadingLabel={togglingStatus.status === 'active' ? 'Deactivating…' : 'Reactivating…'}
          onConfirm={runToggle}
          onClose={() => setTogglingStatus(null)}
        />
      )}
    </div>
  )
}
