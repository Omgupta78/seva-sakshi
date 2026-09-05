import { Link } from 'react-router-dom'
import { ScanFace, UserPlus, CalendarCheck, Bell, AlertTriangle, Info, Upload, ClipboardCheck, CalendarClock } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getInstitutionSummary, getTodaysAttendance, getAttentionItems } from '../../services/institutionService.js'
import StatCard from '../../components/officer/StatCard.jsx'

const QUICK = [
  { to: '/institution/attendance', label: 'Start Attendance', icon: ScanFace, primary: true },
  { to: '/institution/students', label: 'Add Student', icon: UserPlus },
  { to: '/institution/documents', label: 'Upload Document', icon: Upload },
  { to: '/institution/inspection-readiness', label: 'View Inspection', icon: ClipboardCheck },
  { to: '/institution/attendance', label: 'View Attendance', icon: CalendarCheck },
  { to: '/institution/notifications', label: 'Review Alerts', icon: Bell },
]

export default function InstitutionDashboard() {
  const { user } = useAuth()
  const { data: summary } = useAsync(() => getInstitutionSummary(), [])
  const { data: today, loading: todayLoading } = useAsync(() => getTodaysAttendance(), [])
  const { data: attention } = useAsync(() => getAttentionItems(), [])

  const rows = today?.items ?? []
  const items = attention?.items ?? []

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Good day, {user?.name?.split(' ')[0] ?? 'there'}</h1>
        <p className="text-sm text-plum-950/60">{user?.institutionName ?? 'Your institution'} · operational overview for today.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Students" value={summary?.totalStudents ?? '—'} accent="#3a1d70" />
        <StatCard label="Present Today" value={summary?.presentToday ?? '—'} accent="#138808" />
        <StatCard label="Absent Today" value={summary?.absentToday ?? '—'} accent="#b23b3b" />
        <StatCard label="Attendance %" value={summary ? `${summary.attendancePct}%` : '—'} accent="#006a61" />
        <StatCard label="Pending Reviews" value={summary?.pendingReviews ?? '—'} emphasize />
        <StatCard label="Pending Documents" value={summary?.pendingDocuments ?? '—'} accent="#a15c00" />
        <StatCard label="Institution Alerts" value={summary?.alerts ?? '—'} accent="#c2410c" />
        <Link to="/institution/inspection-readiness" className="flex flex-col justify-between rounded-2xl border border-plum-950/12 bg-white p-3.5 no-underline shadow-sm transition-colors hover:bg-plum-50">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-plum-950/55 uppercase"><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> Upcoming Inspection</span>
          <span className="mt-1 block text-sm font-bold text-plum-950">{summary?.upcomingInspection?.window ?? '—'}</span>
          <span className="text-[11px] text-plum-950/55">{summary?.upcomingInspection?.type ?? 'None scheduled'}</span>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK.map((q) => {
          const Icon = q.icon
          return (
            <Link key={q.label} to={q.to} className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold no-underline transition-colors ${q.primary ? 'border-plum-800 bg-plum-800 text-white hover:bg-plum-700' : 'border-plum-950/12 bg-white text-plum-950 hover:bg-plum-50'}`}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {q.label}
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Today's attendance */}
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-plum-950">Today’s Attendance</h2>
            <Link to="/institution/attendance" className="text-xs font-semibold text-plum-800 hover:underline">Open sessions</Link>
          </div>
          {todayLoading ? (
            <p className="py-8 text-center text-sm text-plum-950/50">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-plum-950/10 text-xs text-plum-950/60 uppercase">
                    <th className="py-2 pr-2 font-semibold">Class</th>
                    <th className="py-2 pr-2 font-semibold">Present</th>
                    <th className="py-2 pr-2 font-semibold">Attendance</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.class} className="border-b border-plum-950/5 last:border-0">
                      <td className="py-2.5 pr-2 font-semibold text-plum-950">{r.class}</td>
                      <td className="py-2.5 pr-2 text-plum-950/70">{r.present}/{r.total}</td>
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-plum-950/10"><div className={`h-full rounded-full ${r.pct < 80 ? 'bg-[#e2a610]' : 'bg-[#138808]'}`} style={{ width: `${r.pct}%` }} /></div>
                          <span className="text-xs font-semibold text-plum-950">{r.pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${r.status === 'Review' ? 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' : 'border-[#138808]/25 bg-green-50 text-[#16794f]'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attention required */}
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-sm font-bold text-plum-950">Attention Required</h2>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs ${it.severity === 'warn' ? 'border-[#e2a610]/30 bg-amber-50/60 text-[#a15c00]' : 'border-plum-950/10 bg-plum-50/40 text-plum-950/75'}`}>
                {it.severity === 'warn' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                <span>{it.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-plum-950/45">These signals also feed the Department’s AI analytics and may trigger an inspection.</p>
        </div>
      </div>
    </div>
  )
}
