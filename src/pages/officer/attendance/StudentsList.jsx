import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Trash2, PlayCircle, PauseCircle, PowerOff, Power } from 'lucide-react'
import { useAsync } from '../../../hooks/useAsync.js'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useToast } from '../../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../../data/rbac.js'
import {
  listStudents, reactivateEnrollment, deleteEnrollment, removeFaceEnrollment, deactivateStudent, reactivateStudent,
} from '../../../services/attendanceService.js'
import ActionMenu from '../../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../../components/officer/ConfirmActionModal.jsx'
import { EnrollmentStatusBadge, StudentStatusBadge } from '../../../components/officer/attendance/Badges.jsx'

export default function StudentsList() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const canManage = hasPermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  const canRemoveBio = hasPermission(PERMISSIONS.BIOMETRIC_REMOVE)
  const canDeactivate = hasPermission(PERMISSIONS.STUDENT_DEACTIVATE)
  const [filters, setFilters] = useState({ search: '', enrollment: 'all', status: 'all' })
  const { data, loading, refetch } = useAsync(() => listStudents(filters), [JSON.stringify(filters)])
  const [action, setAction] = useState(null) // { type, student }
  const rows = data?.items ?? []

  async function run(reason) {
    const { type, student: s } = action
    if (type === 'remove-bio') { await removeFaceEnrollment(s.id, reason); toast.success('Face enrollment removed successfully.') }
    else if (type === 'delete-bio') { await deleteEnrollment(s.id); toast.success('Biometric template permanently deleted.') }
    else if (type === 'reactivate-bio') { await reactivateEnrollment(s.id); toast.success('Face enrollment reactivated.') }
    else if (type === 'deactivate-student') { await deactivateStudent(s.id, reason); toast.success(`${s.name} deactivated successfully.`) }
    else if (type === 'reactivate-student') { await reactivateStudent(s.id); toast.success(`${s.name} reactivated.`) }
    setAction(null)
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
          <label htmlFor="stu-search" className="sr-only">Search students</label>
          <input id="stu-search" type="search" placeholder="Search by name or ID…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm text-plum-950 focus:outline-none" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
          <option value="all">All Beneficiaries</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filters.enrollment} onChange={(e) => setFilters({ ...filters, enrollment: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
          <option value="all">All Enrollment</option>
          <option value="enrolled">Enrolled</option>
          <option value="not-enrolled">Not Enrolled</option>
          <option value="deactivated">Deactivated</option>
        </select>
        {canManage && (
          <Link to="/officer/attendance/enrollment" className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-3.5 py-2 text-sm font-semibold text-white no-underline hover:bg-[#a91f24]">
            <UserPlus className="h-4 w-4" aria-hidden="true" /> Enroll New
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">ID</th>
              <th className="px-3 py-2.5 font-semibold">Name</th>
              <th className="px-3 py-2.5 font-semibold">Project</th>
              <th className="px-3 py-2.5 font-semibold">Department</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">Biometric</th>
              <th className="px-3 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-plum-950/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-plum-950/50">No beneficiaries match these filters.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-plum-950/5 text-plum-950/85 last:border-0">
                <td className="px-3 py-2.5 font-mono text-xs font-semibold text-plum-950">{r.id}</td>
                <td className="px-3 py-2.5 font-semibold text-plum-950">{r.name}</td>
                <td className="px-3 py-2.5"><span className="block max-w-[180px] truncate">{r.projectName}</span></td>
                <td className="px-3 py-2.5 text-xs">{r.department}</td>
                <td className="px-3 py-2.5"><StudentStatusBadge status={r.status} /></td>
                <td className="px-3 py-2.5">
                  <EnrollmentStatusBadge status={r.enrollment} />
                  {r.enrollment === 'enrolled' && <span className="ml-1 text-[10px] text-plum-950/45">{r.sampleCount} samples</span>}
                </td>
                <td className="px-3 py-2.5">
                  <ActionMenu items={[
                    { label: r.status === 'active' ? 'Deactivate beneficiary' : 'Reactivate beneficiary', icon: r.status === 'active' ? PowerOff : Power, tone: r.status === 'active' ? 'danger' : undefined, onClick: () => setAction({ type: r.status === 'active' ? 'deactivate-student' : 'reactivate-student', student: r }), hidden: !canDeactivate },
                    { label: 'Remove face enrollment', icon: PauseCircle, tone: 'danger', onClick: () => setAction({ type: 'remove-bio', student: r }), hidden: !canRemoveBio || r.enrollment !== 'enrolled' },
                    { label: 'Reactivate enrollment', icon: PlayCircle, onClick: () => setAction({ type: 'reactivate-bio', student: r }), hidden: !canManage || r.enrollment !== 'deactivated' },
                    { label: 'Delete template', icon: Trash2, tone: 'danger', onClick: () => setAction({ type: 'delete-bio', student: r }), hidden: !canManage || r.enrollment === 'not-enrolled' },
                  ]} />
                  {canManage && r.enrollment === 'not-enrolled' && (
                    <Link to={`/officer/attendance/enrollment?student=${r.id}`} className="ml-1 rounded-lg bg-plum-800 px-2.5 py-1.5 text-xs font-semibold text-white no-underline hover:bg-plum-700">Enroll face</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-plum-950/50">
        Deactivating a beneficiary or removing their face enrollment never deletes their historical attendance — those records are retained. Permanent template deletion removes the face data itself and is restricted.
      </p>

      {action?.type === 'remove-bio' && (
        <ConfirmActionModal title="Remove biometric enrollment?"
          description={`This will disable face recognition for ${action.student.name}. Historical attendance records will remain available.`}
          confirmLabel="Remove enrollment" loadingLabel="Removing…" onConfirm={run} onClose={() => setAction(null)} />
      )}
      {action?.type === 'reactivate-bio' && (
        <ConfirmActionModal title="Reactivate enrollment?"
          description={`Re-enable face recognition for ${action.student.name}?`}
          confirmLabel="Reactivate" loadingLabel="Reactivating…" onConfirm={run} onClose={() => setAction(null)} />
      )}
      {action?.type === 'delete-bio' && (
        <ConfirmActionModal title="Permanently delete biometric template?" tone="danger"
          warning="This deletes the face data itself and cannot be undone."
          description={`Delete the biometric template for ${action.student.name}? Their historical attendance stays intact. Recognition stops immediately.`}
          confirmLabel="Delete template" loadingLabel="Deleting…" onConfirm={run} onClose={() => setAction(null)} />
      )}
      {action?.type === 'deactivate-student' && (
        <ConfirmActionModal title="Deactivate beneficiary?"
          description={`Mark ${action.student.name} inactive? Historical attendance is preserved; they will not appear in active enrollment or live recognition.`}
          confirmLabel="Deactivate" loadingLabel="Deactivating…" onConfirm={run} onClose={() => setAction(null)} />
      )}
      {action?.type === 'reactivate-student' && (
        <ConfirmActionModal title="Reactivate beneficiary?"
          description={`Reactivate ${action.student.name}?`}
          confirmLabel="Reactivate" loadingLabel="Reactivating…" onConfirm={run} onClose={() => setAction(null)} />
      )}
    </div>
  )
}
