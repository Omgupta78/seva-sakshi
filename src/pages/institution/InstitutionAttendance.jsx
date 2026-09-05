import { ScanFace, Info } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { getTodaysAttendance, getInstitutionSummary } from '../../services/institutionService.js'
import StatCard from '../../components/officer/StatCard.jsx'

export default function InstitutionAttendance() {
  const { data: today, loading } = useAsync(() => getTodaysAttendance(), [])
  const { data: summary } = useAsync(() => getInstitutionSummary(), [])
  const rows = today?.items ?? []

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Attendance</h1>
          <p className="text-sm text-plum-950/60">Run and review daily attendance sessions for your classes.</p>
        </div>
        <button type="button" className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700"><ScanFace className="h-4 w-4" aria-hidden="true" /> Start Attendance Session</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Present Today" value={summary?.presentToday ?? '—'} accent="#138808" />
        <StatCard label="Attendance %" value={summary ? `${summary.attendancePct}%` : '—'} accent="#006a61" />
        <StatCard label="Face-Enrolled" value={summary?.faceEnrolled ?? '—'} accent="#3a1d70" />
        <StatCard label="Sessions Today" value={rows.length} accent="#3a1d70" />
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 text-sm font-bold text-plum-950">Today’s Sessions</h2>
        {loading ? <p className="py-8 text-center text-sm text-plum-950/50">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
                  <th className="px-3 py-2.5 font-semibold">Class</th><th className="px-3 py-2.5 font-semibold">Present</th><th className="px-3 py-2.5 font-semibold">Attendance</th><th className="px-3 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.class} className="border-b border-plum-950/5 last:border-0">
                    <td className="px-3 py-2.5 font-semibold text-plum-950">{r.class}</td>
                    <td className="px-3 py-2.5 text-plum-950/70">{r.present}/{r.total}</td>
                    <td className="px-3 py-2.5 font-semibold">{r.pct}%</td>
                    <td className="px-3 py-2.5"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${r.status === 'Review' ? 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' : 'border-[#138808]/25 bg-green-50 text-[#16794f]'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        Live face-recognition attendance capture is the next implementation phase. These records already flow to the Department’s monitoring and AI analytics.
      </p>
    </div>
  )
}
