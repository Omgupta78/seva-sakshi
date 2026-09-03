import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Power } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listOrganizations, setOrganizationStatus } from '../../services/organizationsService.js'
import { ORG_TYPES } from '../../data/models.js'
import DataTable from '../../components/officer/table/DataTable.jsx'
import { OrgStatusBadge, ComplianceBadge } from '../../components/officer/table/Badges.jsx'
import OrganizationFilters from '../../components/officer/organization/OrganizationFilters.jsx'
import AddOrganizationModal from '../../components/officer/organization/AddOrganizationModal.jsx'
import EditOrganizationModal from '../../components/officer/organization/EditOrganizationModal.jsx'
import OrganizationDetailsDialog from '../../components/officer/organization/OrganizationDetailsDialog.jsx'
import ConfirmDialog from '../../components/officer/ConfirmDialog.jsx'

const initialFilters = { search: '', type: 'all', status: 'all', district: 'all' }

/**
 * Shared list page for both /officer/institutes and /officer/ngos —
 * `category` selects which slice of the Organization store to show.
 */
export default function OrganizationsList({ category }) {
  const [filters, setFilters] = useState(initialFilters)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [togglingStatus, setTogglingStatus] = useState(null) // organization pending activate/deactivate confirmation
  const [toggleSubmitting, setToggleSubmitting] = useState(false)

  const { data, loading, refetch } = useAsync(() => listOrganizations({ ...filters, category }), [JSON.stringify(filters), category])

  const typeOptions = category === 'ngo' ? [] : ORG_TYPES.filter((t) => t !== 'NGO')
  const title = category === 'ngo' ? 'NGOs' : 'Institutes'
  const addLabel = category === 'ngo' ? 'Add NGO' : 'Add Organization'

  async function confirmToggleStatus() {
    setToggleSubmitting(true)
    try {
      await setOrganizationStatus(togglingStatus.id, togglingStatus.status === 'active' ? 'inactive' : 'active')
      setTogglingStatus(null)
      refetch()
    } finally {
      setToggleSubmitting(false)
    }
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
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setViewing(r)} aria-label={`View ${r.name}`} className="rounded-lg p-1.5 text-plum-800 hover:bg-plum-50">
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setEditing(r)} aria-label={`Edit ${r.name}`} className="rounded-lg p-1.5 text-plum-800 hover:bg-plum-50">
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setTogglingStatus(r)}
            aria-label={r.status === 'active' ? `Deactivate ${r.name}` : `Activate ${r.name}`}
            className={`rounded-lg p-1.5 hover:bg-plum-50 ${r.status === 'active' ? 'text-[#D6262B]' : 'text-[#16794f]'}`}
          >
            <Power className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
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
        <ConfirmDialog
          title={togglingStatus.status === 'active' ? 'Deactivate Organization' : 'Activate Organization'}
          message={
            togglingStatus.status === 'active'
              ? `Deactivate ${togglingStatus.name}? It will be marked inactive and flagged for follow-up.`
              : `Activate ${togglingStatus.name}?`
          }
          confirmLabel={togglingStatus.status === 'active' ? 'Deactivate' : 'Activate'}
          tone={togglingStatus.status === 'active' ? 'danger' : 'default'}
          confirming={toggleSubmitting}
          onConfirm={confirmToggleStatus}
          onClose={() => setTogglingStatus(null)}
        />
      )}
    </div>
  )
}
