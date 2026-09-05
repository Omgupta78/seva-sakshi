import { Link } from 'react-router-dom'
import { ClipboardCheck, CheckCircle2, Circle, CalendarClock } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { getInspectionReadiness } from '../../services/institutionService.js'

/** Inspection Readiness — a self-assessment checklist plus the next expected
 *  inspection window, so the institution can prepare before a visit. */
export default function InstitutionReadiness() {
  const { data, loading } = useAsync(() => getInspectionReadiness(), [])
  const items = data?.items ?? []
  const pct = data?.pct ?? 0
  const up = data?.upcoming

  const tone = pct >= 80 ? '#138808' : pct >= 50 ? '#e2a610' : '#D6262B'

  return (
    <div className="mx-auto max-w-[1000px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Inspection Readiness</h1>
        <p className="text-sm text-plum-950/60">Prepare for your next Department inspection.</p>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-plum-950/50">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-sm font-bold text-plum-950">Readiness score</h2>
              <div className="flex items-center gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eee" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={tone} strokeWidth="3" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-xl font-extrabold text-plum-950">{pct}%</span>
                </div>
                <div className="text-sm text-plum-950/70">
                  <p><span className="font-bold text-plum-950">{data.done}</span> of {data.total} checks complete.</p>
                  <p className="mt-1 text-xs text-plum-950/55">Resolve the open items below before the inspection window.</p>
                </div>
              </div>
            </div>

            {up && (
              <div className="rounded-2xl border border-plum-800/20 bg-plum-50/50 p-4 shadow-sm sm:p-5">
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-plum-950"><CalendarClock className="h-4 w-4 text-plum-800" aria-hidden="true" /> Upcoming Inspection</h2>
                <p className="text-base font-bold text-plum-950">{up.type}</p>
                <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Window</dt><dd className="mt-0.5 text-plum-950/85">{up.window}</dd></div>
                  <div><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Status</dt><dd className="mt-0.5 text-plum-950/85">{up.status}</dd></div>
                  <div className="col-span-2"><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Inspector</dt><dd className="mt-0.5 text-plum-950/75">{up.inspector}</dd></div>
                </dl>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><ClipboardCheck className="h-4 w-4 text-plum-800" aria-hidden="true" /> Readiness checklist</h2>
            <ul className="space-y-1.5">
              {items.map((c) => (
                <li key={c.id} className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm ${c.done ? 'border-[#138808]/20 bg-green-50/50' : 'border-plum-950/10 bg-white'}`}>
                  {c.done
                    ? <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#138808]" aria-hidden="true" />
                    : <Circle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-plum-950/30" aria-hidden="true" />}
                  <div className="min-w-0">
                    <p className={c.done ? 'text-plum-950/70' : 'font-semibold text-plum-950'}>{c.label}</p>
                    <p className="text-[11px] text-plum-950/45">{c.category}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-plum-950/50">Open document items can be resolved on the <Link to="/institution/documents" className="font-semibold text-plum-800 hover:underline">Documents</Link> page.</p>
          </div>
        </>
      )}
    </div>
  )
}
