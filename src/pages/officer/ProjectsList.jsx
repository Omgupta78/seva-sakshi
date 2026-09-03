import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listProjects } from '../../services/projectsService.js'
import DataTable from '../../components/officer/table/DataTable.jsx'
import Pagination from '../../components/officer/table/Pagination.jsx'
import { RiskBadge, ProjectStatusBadge } from '../../components/officer/table/Badges.jsx'
import ProjectFilters from '../../components/officer/project/ProjectFilters.jsx'
import AddProjectModal from '../../components/officer/project/AddProjectModal.jsx'
import EditProjectModal from '../../components/officer/project/EditProjectModal.jsx'

const initialFilters = {
  search: '',
  status: 'all',
  riskLevel: 'all',
  district: 'all',
  schemeId: 'all',
  sortBy: 'name',
  sortDir: 'asc',
  page: 1,
  pageSize: 6,
}

const COLUMNS = (onView, onEdit) => [
  { key: 'id', label: 'Project ID', sortable: true },
  { key: 'name', label: 'Project Name', sortable: true, render: (r) => <span className="font-semibold text-plum-950">{r.name}</span> },
  { key: 'schemeName', label: 'Scheme', render: (r) => <span className="block max-w-[220px] truncate">{r.schemeName}</span> },
  { key: 'state', label: 'State', sortable: true },
  { key: 'district', label: 'District', sortable: true },
  { key: 'organizationName', label: 'Implementing Organization', render: (r) => <span className="block max-w-[200px] truncate">{r.organizationName}</span> },
  { key: 'projectType', label: 'Project Type' },
  { key: 'status', label: 'Status', sortable: true, render: (r) => <ProjectStatusBadge status={r.status} /> },
  { key: 'lastInspection', label: 'Last Inspection', sortable: true },
  { key: 'riskLevel', label: 'Risk Level', sortable: true, render: (r) => <RiskBadge level={r.riskLevel} /> },
  {
    key: 'actions',
    label: 'Actions',
    render: (r) => (
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onView(r)} aria-label={`View ${r.name}`} className="rounded-lg p-1.5 text-plum-800 hover:bg-plum-50">
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onEdit(r)} aria-label={`Edit ${r.name}`} className="rounded-lg p-1.5 text-plum-800 hover:bg-plum-50">
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    ),
  },
]

export default function ProjectsList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(initialFilters)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const { data, loading, refetch } = useAsync(() => listProjects(filters), [JSON.stringify(filters)])

  function handleSort(key) {
    setFilters((prev) => ({
      ...prev,
      sortBy: key,
      sortDir: prev.sortBy === key && prev.sortDir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  const columns = COLUMNS((r) => navigate(`/officer/projects/${r.id}`), (r) => setEditingProject(r))

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Projects</h1>
        <p className="text-sm text-plum-950/60">All projects under DoSJE schemes across implementing organizations.</p>
      </div>

      <ProjectFilters filters={filters} onChange={setFilters} onAddProject={() => setShowAddModal(true)} />

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          loading={loading}
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onSort={handleSort}
          onRowClick={(r) => navigate(`/officer/projects/${r.id}`)}
          emptyMessage="No projects match these filters."
        />
        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          />
        )}
      </div>

      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false)
            refetch()
          }}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={() => {
            setEditingProject(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
