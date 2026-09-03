import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Pencil } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { getProject } from '../../services/projectsService.js'
import { RiskBadge, ProjectStatusBadge } from '../../components/officer/table/Badges.jsx'
import EditProjectModal from '../../components/officer/project/EditProjectModal.jsx'
import {
  OverviewTab,
  BeneficiariesTab,
  StaffTab,
  AttendanceTab,
  CctvTab,
  InspectionsTab,
  DocumentsTab,
  IssuesTab,
} from '../../components/officer/project/ProjectTabs.jsx'

const TABS = [
  { key: 'overview', label: 'Overview', Component: OverviewTab },
  { key: 'beneficiaries', label: 'Beneficiaries', Component: BeneficiariesTab },
  { key: 'staff', label: 'Staff', Component: StaffTab },
  { key: 'attendance', label: 'Attendance', Component: AttendanceTab },
  { key: 'cctv', label: 'CCTV', Component: CctvTab },
  { key: 'inspections', label: 'Inspections', Component: InspectionsTab },
  { key: 'documents', label: 'Documents', Component: DocumentsTab },
  { key: 'issues', label: 'Issues', Component: IssuesTab },
]

export default function ProjectDetails() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const { data: project, loading, error, refetch } = useAsync(() => getProject(id), [id])

  if (loading) {
    return <p className="p-6 text-center text-sm text-plum-950/50">Loading project…</p>
  }
  if (error || !project) {
    return (
      <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-plum-950">Project not found.</p>
        <Link to="/officer/projects" className="mt-2 inline-block text-sm text-plum-800 hover:underline">
          Back to Projects
        </Link>
      </div>
    )
  }

  const ActiveTabComponent = TABS.find((t) => t.key === activeTab)?.Component ?? OverviewTab

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Link to="/officer/projects" className="inline-flex items-center gap-1 text-sm font-medium text-plum-800 no-underline hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to Projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-plum-950/50">{project.id}</p>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{project.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <RiskBadge level={project.riskLevel} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 bg-white px-3.5 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <nav aria-label="Project sections" className="flex flex-wrap gap-1 border-b border-plum-950/10 px-3 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? 'page' : undefined}
              className={`rounded-t-lg px-3 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.key ? 'border-b-2 border-plum-800 text-plum-800' : 'text-plum-950/55 hover:text-plum-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 sm:p-5">
          <ActiveTabComponent project={project} />
        </div>
      </div>

      {editing && (
        <EditProjectModal
          project={project}
          onClose={() => setEditing(false)}
          onUpdated={() => {
            setEditing(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}
