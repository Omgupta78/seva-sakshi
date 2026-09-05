import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ScanFace, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import { listProjects } from '../../../services/projectsService.js'
import { getAttendanceStats, listSessions, createSession, closeSession, getAttendanceConfig } from '../../../services/attendanceService.js'
import { getAttendanceMonitoring } from '../../../services/attendanceSessionsService.js'
import { SESSION_SUBJECTS } from '../../../data/attendanceModels.js'
import StatCard from '../../../components/officer/StatCard.jsx'
import { SessionStatusBadge } from '../../../components/officer/attendance/Badges.jsx'

const MON_STATUS = {
  Normal: 'border-[#138808]/25 bg-green-50 text-[#16794f]',
  Watch: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]',
  'Requires Review': 'border-[#D6262B]/25 bg-red-50 text-[#D6262B]',
}

export default function AttendanceHub() {
  const { user } = useAuth()
  const [form, setForm] = useState({ subject: SESSION_SUBJECTS[0], projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const { data: stats, refetch: refetchStats } = useAsync(() => getAttendanceStats(), [])
  const { data: sessionData, refetch: refetchSessions } = useAsync(() => listSessions(), [])
  const { data: config } = useAsync(() => getAttendanceConfig(), [])
  const { data: projectData } = useAsync(() => listProjects({ pageSize: 100 }), [])
  const { data: monitoring } = useAsync(() => getAttendanceMonitoring(), [])

  const sessions = sessionData?.items ?? []
  const projects = projectData?.items ?? []

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      await createSession(form, { id: user?.employeeId, name: user?.name })
      setForm((f) => ({ ...f, startTime: '' }))
      refetchSessions()
      refetchStats()
    } catch (err) {
      setError(err.fieldErrors ? Object.values(err.fieldErrors)[0] : 'Could not create session.')
    } finally {
      setCreating(false)
    }
  }

  async function handleClose(id) {
    await closeSession(id)
    refetchSessions()
    refetchStats()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Beneficiaries" value={stats?.students ?? '—'} accent="#3a1d70" />
        <StatCard label="Face-Enrolled" value={stats?.enrolled ?? '—'} accent="#138808" />
        <StatCard label="Active Sessions" value={stats?.activeSessions ?? '—'} accent="#e2a610" />
        <StatCard label="Present Today" value={stats?.presentToday ?? '—'} accent="#3a1d70" />
      </div>

      {/* Institution attendance monitoring — Department monitors; institutions operate. */}
      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-plum-950">Institution Attendance Monitoring</h2>
          {monitoring && <span className="text-xs text-plum-950/55">{monitoring.pendingSubmissions} pending submission(s) · overall {monitoring.overallPct}%</span>}
        </div>
        <div className="overflow-x-auto rounded-xl border border-plum-950/10">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
                <th className="px-3 py-2.5 font-semibold">Institution · Class</th><th className="px-3 py-2.5 font-semibold">Students</th><th className="px-3 py-2.5 font-semibold">Attendance</th><th className="px-3 py-2.5 font-semibold">Today</th><th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {!monitoring ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-plum-950/50">Loading…</td></tr>
              ) : monitoring.byClass.map((c) => (
                <tr key={c.class} className="border-b border-plum-950/5 last:border-0 text-plum-950/85">
                  <td className="px-3 py-2.5 font-semibold text-plum-950">Govt Ashram Shala, Wada · {c.class}</td>
                  <td className="px-3 py-2.5">{c.students}</td>
                  <td className="px-3 py-2.5 font-semibold">{c.attendancePct}%</td>
                  <td className="px-3 py-2.5">{c.pendingSubmission ? <span className="text-xs font-semibold text-[#a15c00]">Pending</span> : <span className="text-xs text-[#16794f]">Submitted</span>}</td>
                  <td className="px-3 py-2.5"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${MON_STATUS[c.status] ?? ''}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-plum-950/50">The Department monitors and audits institution attendance — it does not run routine daily sessions. Unusual patterns surface in <Link to="/officer/analytics" className="text-plum-800 hover:underline">AI Analytics</Link>.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Create session */}
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-bold text-plum-950">New Attendance Session</h2>
          <div>
            <label htmlFor="ses-subject" className="mb-1 block text-xs font-semibold text-plum-950/70">Subject</label>
            <select id="ses-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none">
              {SESSION_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ses-project" className="mb-1 block text-xs font-semibold text-plum-950/70">Project</label>
            <select id="ses-project" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none">
              <option value="" disabled>Select a project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ses-date" className="mb-1 block text-xs font-semibold text-plum-950/70">Date</label>
              <input id="ses-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="ses-start" className="mb-1 block text-xs font-semibold text-plum-950/70">Start time</label>
              <input id="ses-start" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none" />
            </div>
          </div>
          {error && <p className="text-xs font-medium text-[#D6262B]">{error}</p>}
          <button type="submit" disabled={creating} className="flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60">
            <Plus className="h-4 w-4" aria-hidden="true" /> {creating ? 'Creating…' : 'Create Session'}
          </button>

          {config && (
            <div className="mt-2 rounded-lg bg-plum-50/70 p-2.5 text-[11px] text-plum-950/60">
              <p className="flex items-center gap-1 font-semibold text-plum-950/75"><SlidersHorizontal className="h-3 w-3" aria-hidden="true" /> Recognition config</p>
              <p>Match threshold {config.matchThreshold} · {config.samplesRequired} samples/enrolment · processes every {config.frameIntervalMs} ms · retention {config.retentionDays} days</p>
            </div>
          )}
        </form>

        {/* Sessions list */}
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-sm font-bold text-plum-950">Sessions</h2>
          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-plum-950/50">No sessions yet. Create one to begin.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-plum-950/10 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-plum-950">{s.subject}</span>
                      <SessionStatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-plum-950/60">{s.projectName} · {s.date} · {s.startTime}{s.endTime ? `–${s.endTime}` : ''} · {s.presentCount} present</p>
                    <p className="font-mono text-[10px] text-plum-950/40">{s.id} · Officer {s.officerName}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.status === 'active' && (
                      <>
                        <Link to={`/officer/attendance/live?session=${s.id}`} className="flex items-center gap-1 rounded-lg bg-plum-800 px-2.5 py-1.5 text-xs font-semibold text-white no-underline hover:bg-plum-700">
                          <ScanFace className="h-3.5 w-3.5" aria-hidden="true" /> Live
                        </Link>
                        <button type="button" onClick={() => handleClose(s.id)} className="rounded-lg border border-plum-950/15 px-2.5 py-1.5 text-xs font-semibold text-plum-800 hover:bg-plum-50">Close</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="flex items-center gap-1.5 rounded-xl bg-plum-50/60 p-3 text-[11px] text-plum-950/55">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
        Biometric templates are stored securely server-side (never in the browser or localStorage), are never returned by normal APIs, and can be deactivated or deleted per beneficiary from the Students tab.
      </p>
    </div>
  )
}
