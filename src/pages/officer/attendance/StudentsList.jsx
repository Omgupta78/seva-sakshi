import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Trash2, PauseCircle, PlayCircle } from 'lucide-react'
import { useAsync } from '../../../hooks/useAsync.js'
import { listStudents, deactivateEnrollment, reactivateEnrollment, deleteEnrollment } from '../../../services/attendanceService.js'
import { EnrollmentStatusBadge, StudentStatusBadge } from '../../../components/officer/attendance/Badges.jsx'

export default function StudentsList() {
  const [filters, setFilters] = useState({ search: '', enrollment: 'all' })
  const { data, loading, refetch } = useAsync(() => listStudents(filters), [JSON.stringify(filters)])
  const [busyId, setBusyId] = useState(null)
  const rows = data?.items ?? []

  async function act(fn, id, confirmMsg) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusyId(id)
    try { await fn(id); refetch() } finally { setBusyId(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
          <label htmlFor="stu-search" className="sr-only">Search students</label>
          <input id="stu-search" type="search" placeholder="Search by name or ID…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm text-plum-950 focus:outline-none" />
        </div>
        <select value={filters.enrollment} onChange={(e) => setFilters({ ...filters, enrollment: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
          <option value="all">All Enrollment</option>
          <option value="enrolled">Enrolled</option>
          <option value="not-enrolled">Not Enrolled</option>
          <option value="deactivated">Deactivated</option>
        </select>
        <Link to="/officer/attendance/enrollment" className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-3.5 py-2 text-sm font-semibold text-white no-underline hover:bg-[#a91f24]">
          <UserPlus className="h-4 w-4" aria-hidden="true" /> Enroll New
        </Link>
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
                  <div className="flex items-center gap-1.5">
                    {r.enrollment === 'not-enrolled' && (
                      <Link to={`/officer/attendance/enrollment?student=${r.id}`} className="rounded-lg bg-plum-800 px-2.5 py-1.5 text-xs font-semibold text-white no-underline hover:bg-plum-700">Enroll face</Link>
                    )}
                    {r.enrollment === 'enrolled' && (
                      <button type="button" disabled={busyId === r.id} onClick={() => act(deactivateEnrollment, r.id)} className="flex items-center gap-1 rounded-lg border border-plum-950/15 px-2.5 py-1.5 text-xs font-semibold text-[#a15c00] hover:bg-amber-50 disabled:opacity-50">
                        <PauseCircle className="h-3.5 w-3.5" aria-hidden="true" /> Deactivate
                      </button>
                    )}
                    {r.enrollment === 'deactivated' && (
                      <button type="button" disabled={busyId === r.id} onClick={() => act(reactivateEnrollment, r.id)} className="flex items-center gap-1 rounded-lg border border-plum-950/15 px-2.5 py-1.5 text-xs font-semibold text-[#16794f] hover:bg-green-50 disabled:opacity-50">
                        <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" /> Reactivate
                      </button>
                    )}
                    {r.enrollment !== 'not-enrolled' && (
                      <button type="button" disabled={busyId === r.id} onClick={() => act(deleteEnrollment, r.id, `Permanently delete the biometric template for ${r.name}? This cannot be undone.`)} className="flex items-center gap-1 rounded-lg border border-[#D6262B]/25 px-2.5 py-1.5 text-xs font-semibold text-[#D6262B] hover:bg-red-50 disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-plum-950/50">
        Deleting a biometric template removes the face data permanently and immediately stops recognition for that person. Deactivating keeps the record but excludes them from matching until reactivated.
      </p>
    </div>
  )
}
