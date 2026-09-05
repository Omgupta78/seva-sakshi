import { PencilLine } from 'lucide-react'
import { AttendanceStatusBadge } from './Badges.jsx'

/** Attendance records for a session (metadata; no biometric data).
 *  Attendance is never deleted — pass `onCorrect` to allow authorised
 *  correction (with reason), which preserves the original value. */
export default function AttendanceRecordsTable({ records, loading, onCorrect }) {
  const cols = onCorrect ? 7 : 6
  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            <th className="px-3 py-2.5 font-semibold">Record</th>
            <th className="px-3 py-2.5 font-semibold">Student</th>
            <th className="px-3 py-2.5 font-semibold">ID</th>
            <th className="px-3 py-2.5 font-semibold">Time</th>
            <th className="px-3 py-2.5 font-semibold">Match</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            {onCorrect && <th className="px-3 py-2.5 font-semibold" />}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={cols} className="px-3 py-6 text-center text-plum-950/50">Loading…</td></tr>
          ) : !records?.length ? (
            <tr><td colSpan={cols} className="px-3 py-8 text-center text-plum-950/50">No one marked present yet.</td></tr>
          ) : (
            records.map((r) => (
              <tr key={r.id} className="border-b border-plum-950/5 text-plum-950/85 last:border-0">
                <td className="px-3 py-2.5 font-mono text-xs">{r.id}</td>
                <td className="px-3 py-2.5 font-semibold text-plum-950">{r.studentName}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{r.studentId}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{r.time}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{r.matchScore != null ? r.matchScore.toFixed(3) : '—'}</td>
                <td className="px-3 py-2.5">
                  <AttendanceStatusBadge status={r.status} />
                  {r.correction && <span className="ml-1 text-[10px] text-plum-950/45" title={`Was ${r.correction.previousValue}: ${r.correction.reason}`}>· corrected</span>}
                </td>
                {onCorrect && (
                  <td className="px-3 py-2.5">
                    <button type="button" onClick={() => onCorrect(r)} className="flex items-center gap-1 rounded-lg border border-plum-950/15 px-2 py-1 text-xs font-semibold text-plum-800 hover:bg-plum-50">
                      <PencilLine className="h-3 w-3" aria-hidden="true" /> Correct
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
