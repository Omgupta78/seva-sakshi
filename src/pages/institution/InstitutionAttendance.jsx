import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanFace, Play, Eye, Info, Search, FlaskConical } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useToast } from '../../context/ToastContext.jsx'
import { listAttendanceSessions, createAttendanceSession, getAttendanceMonitoring, SESSION_TYPES, CLASSES } from '../../services/attendanceSessionsService.js'
import StatCard from '../../components/officer/StatCard.jsx'
import Dialog from '../../components/officer/Dialog.jsx'

const STATUS_STYLE = {
  submitted: 'border-[#138808]/25 bg-green-50 text-[#16794f]',
  review: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]',
  'in-progress': 'border-blue-300 bg-blue-50 text-blue-700',
  draft: 'border-gray-300 bg-gray-100 text-gray-600',
}

export default function InstitutionAttendance() {
  const navigate = useNavigate()
  const toast = useToast()
  const [filters, setFilters] = useState({ date: 'all', cls: 'all', status: 'all' })
  const [search, setSearch] = useState('')
  const { data, loading, refetch } = useAsync(() => listAttendanceSessions(filters), [JSON.stringify(filters)])
  const { data: mon } = useAsync(() => getAttendanceMonitoring(), [])
  const [starting, setStarting] = useState(false)
  const q = search.trim().toLowerCase()
  const rows = (data?.items ?? []).filter((r) => !q || r.class.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || (r.teacher ?? '').toLowerCase().includes(q))

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Attendance</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#e2a610]/35 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#a15c00] uppercase" title="Sample sessions for demonstration"><FlaskConical className="h-3 w-3" aria-hidden="true" /> Demo Data</span>
          </div>
          <p className="text-sm text-plum-950/60">Run daily attendance sessions and review your class history.</p>
        </div>
        <button type="button" onClick={() => setStarting(true)} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700"><ScanFace className="h-4 w-4" aria-hidden="true" /> Start Attendance Session</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Overall Attendance" value={mon ? `${mon.overallPct}%` : '—'} accent="#006a61" />
        <StatCard label="Pending Today" value={mon?.pendingSubmissions ?? '—'} emphasize />
        <StatCard label="Classes to Review" value={mon?.lowAttendanceClasses ?? '—'} accent="#e2a610" />
        <StatCard label="Classes" value={CLASSES.length} accent="#3a1d70" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
          <input type="search" placeholder="Search class, session ID or teacher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm focus:outline-none" />
        </div>
        <input type="date" value={filters.date === 'all' ? '' : filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value || 'all' })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none" aria-label="Date" />
        <select value={filters.cls} onChange={(e) => setFilters({ ...filters, cls: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none">
          <option value="all">All Classes</option>{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none">
          <option value="all">All Status</option><option value="draft">Draft</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="submitted">Submitted</option>
        </select>
        <span className="ml-auto text-xs text-plum-950/50">{rows.length} sessions</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">Date</th><th className="px-3 py-2.5 font-semibold">Class</th><th className="px-3 py-2.5 font-semibold">Session</th>
              <th className="px-3 py-2.5 font-semibold">Present</th><th className="px-3 py-2.5 font-semibold">Attendance</th><th className="px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-plum-950/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-plum-950/50">No sessions match these filters.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-plum-950/5 text-plum-950/85 last:border-0">
                <td className="px-3 py-2.5 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2.5 font-semibold text-plum-950">{r.class}</td>
                <td className="px-3 py-2.5 capitalize">{r.sessionType}</td>
                <td className="px-3 py-2.5">{r.present}/{r.total}</td>
                <td className="px-3 py-2.5 font-semibold">{r.attendancePct}%</td>
                <td className="px-3 py-2.5"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[r.status] ?? ''}`}>{r.status}</span></td>
                <td className="px-3 py-2.5">
                  <button type="button" onClick={() => navigate(`/institution/attendance/session/${r.id}`)} className="flex items-center gap-1 rounded-lg border border-plum-950/15 px-2.5 py-1.5 text-xs font-semibold text-plum-800 hover:bg-plum-50">
                    {r.status === 'submitted' ? <><Eye className="h-3.5 w-3.5" aria-hidden="true" /> View</> : <><Play className="h-3.5 w-3.5" aria-hidden="true" /> Open</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" /> Submitted attendance flows to the Department’s monitoring and AI analytics. Corrections are recorded in the audit trail with a reason.
      </p>

      {starting && <StartSessionDialog onClose={() => setStarting(false)} onStarted={(id) => { refetch(); navigate(`/institution/attendance/session/${id}`) }} onError={(m) => toast.error(m)} />}
    </div>
  )
}

function StartSessionDialog({ onClose, onStarted, onError }) {
  const [cls, setCls] = useState(CLASSES[0])
  const [sessionType, setSessionType] = useState('morning')
  const [saving, setSaving] = useState(false)
  async function start() {
    setSaving(true)
    try { const s = await createAttendanceSession({ cls, sessionType }); onStarted(s.id) }
    catch (e) { onError(e.message ?? 'Could not start session.'); setSaving(false) }
  }
  return (
    <Dialog title="Start Attendance Session" size="sm" onClose={onClose} footer={
      <>
        <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">Cancel</button>
        <button type="button" onClick={start} disabled={saving} className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60">{saving ? 'Starting…' : 'Start Session'}</button>
      </>
    }>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-950/70">Class</label>
          <select value={cls} onChange={(e) => setCls(e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-950/70">Session</label>
          <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">{SESSION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label} · {t.time}</option>)}</select>
        </div>
        <p className="text-[11px] text-plum-950/50">The default demonstration workflow uses one daily morning session per class.</p>
      </div>
    </Dialog>
  )
}
