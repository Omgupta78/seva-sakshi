import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { listProjects, archiveProject, restoreProject, deleteProject } from '../../services/projectsService.js'
import DataTable from '../../components/officer/table/DataTable.jsx'
import Pagination from '../../components/officer/table/Pagination.jsx'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'
import { RiskBadge, ProjectStatusBadge } from '../../components/officer/table/Badges.jsx'
import ProjectFilters from '../../components/officer/project/ProjectFilters.jsx'
import AddProjectModal from '../../components/officer/project/AddProjectModal.jsx'
import EditProjectModal from '../../components/officer/project/EditProjectModal.jsx'

const initialFilters = {
  search: '', status: 'all', riskLevel: 'all', district: 'all', schemeId: 'all',
  sortBy: 'name', sortDir: 'asc', page: 1, pageSize: 6,
}

export default function ProjectsList() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [filters, setFilters] = useState(initialFilters)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [action, setAction] = useState(null) // { type: 'archive'|'restore'|'delete', project }

  const { data, loading, refetch } = useAsync(() => listProjects(filters), [JSON.stringify(filters)])
  const canArchive = hasPermission(PERMISSIONS.PROJECT_ARCHIVE)
  const canDelete = hasPermission(PERMISSIONS.PERMANENT_DELETE)

  function handleSort(key) {
    setFilters((prev) => ({ ...prev, sortBy: key, sortDir: prev.sortBy === key && prev.sortDir === 'asc' ? 'desc' : 'asc', page: 1 }))
  }

  const columns = [
    { key: 'id', label: 'Project ID', sortable: true },
    { key: 'name', label: 'Project Name', sortable: true, render: (r) => <span className="font-semibold text-plum-950">{r.name}</span> },
    { key: 'schemeName', label: 'Scheme', render: (r) => <span className="block max-w-[220px] truncate">{r.schemeName}</span> },
    { key: 'state', label: 'State', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    { key: 'organizationName', label: 'Implementing Organization', render: (r) => <span className="block max-w-[200px] truncate">{r.organizationName}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <ProjectStatusBadge status={r.status} /> },
    { key: 'riskLevel', label: 'Risk Level', sortable: true, render: (r) => <RiskBadge level={r.riskLevel} /> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu items={[
            { label: 'View', icon: Eye, onClick: () => navigate(`/officer/projects/${r.id}`) },
            { label: 'Edit', icon: Pencil, onClick: () => setEditingProject(r) },
            { label: 'Archive', icon: Archive, onClick: () => setAction({ type: 'archive', project: r }), hidden: !canArchive || r.status === 'archived' },
            { label: 'Restore', icon: ArchiveRestore, onClick: () => setAction({ type: 'restore', project: r }), hidden: !canArchive || r.status !== 'archived' },
            { label: 'Delete permanently', icon: Trash2, tone: 'danger', onClick: () => setAction({ type: 'delete', project: r }), hidden: !canDelete },
          ]} />
        </div>
      ),
    },
  ]

  async function runAction(reason) {
    const { type, project } = action
    if (type === 'archive') { await archiveProject(project.id, reason); toast.success(`Project ${project.id} archived successfully.`) }
    else if (type === 'restore') { await restoreProject(project.id); toast.success(`Project ${project.id} restored.`) }
    else if (type === 'delete') { await deleteProject(project.id); toast.success(`Project ${project.id} permanently deleted.`) }
    setAction(null)
    refetch()
  }

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
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />}
      </div>

      {showAddModal && <AddProjectModal onClose={() => setShowAddModal(false)} onCreated={() => { setShowAddModal(false); refetch() }} />}
      {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onUpdated={() => { setEditingProject(null); refetch() }} />}

      {action?.type === 'archive' && (
        <ConfirmActionModal
          title="Archive Project?"
          description={`You are about to archive Project ${action.project.id}. The project will no longer appear in active project lists, but its historical inspections, reports and attendance records will be retained.`}
          confirmLabel="Archive Project" loadingLabel="Archiving…"
          onConfirm={runAction} onClose={() => setAction(null)}
        />
      )}
      {action?.type === 'restore' && (
        <ConfirmActionModal
          title="Restore Project?"
          description={`Restore Project ${action.project.id} to the active projects list?`}
          confirmLabel="Restore" loadingLabel="Restoring…"
          onConfirm={runAction} onClose={() => setAction(null)}
        />
      )}
      {action?.type === 'delete' && (
        <ConfirmActionModal
          title="Permanently delete project?"
          tone="danger"
          warning="Permanent deletion cannot be undone."
          description={`This permanently removes Project ${action.project.id}. It is refused if the project has historical inspections, attendance or reports — archive it instead.`}
          confirmLabel="Delete permanently" loadingLabel="Deleting…"
          requireConfirmText={action.project.id}
          onConfirm={runAction} onClose={() => setAction(null)}
        />
      )}
    </div>
  )
}
