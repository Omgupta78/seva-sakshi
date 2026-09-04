import { useState, Fragment } from 'react'
import { ChevronDown, ScrollText, CircleSlash } from 'lucide-react'
import { getCallAudit } from '../../../services/videoCheckService.js'
import { AUDIT_EVENT_LABEL } from '../../../data/videoCheckData.js'
import CallStatusBadge from './CallStatusBadge.jsx'
import ParticipantTypeBadge from './ParticipantTypeBadge.jsx'

function fmt(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function duration(rec) {
  if (!rec.startedAt || !rec.endedAt) return '—'
  const s = Math.max(0, (new Date(rec.endedAt) - new Date(rec.startedAt)) / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`
}

/** Call history — metadata only — with a per-call expandable audit trail. */
export default function CallRecordsTable({ records, loading }) {
  const [expanded, setExpanded] = useState(null)
  const [auditById, setAuditById] = useState({})

  async function toggle(id) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!auditById[id]) {
      const events = await getCallAudit(id)
      setAuditById((m) => ({ ...m, [id]: events }))
    }
  }

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-plum-950">
          <ScrollText className="h-4 w-4 text-plum-800" aria-hidden="true" /> Call Records
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-plum-50 px-2 py-0.5 text-[11px] font-semibold text-plum-800">
          <CircleSlash className="h-3 w-3" aria-hidden="true" /> Metadata only — no recordings
        </span>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-plum-950/50">Loading…</p>
      ) : !records?.length ? (
        <p className="py-8 text-center text-sm text-plum-950/50">No video checks yet. Select a project and start one above.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-plum-950/10">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
                <th className="px-3 py-2.5 font-semibold">Call ID</th>
                <th className="px-3 py-2.5 font-semibold">Project</th>
                <th className="px-3 py-2.5 font-semibold">Participant</th>
                <th className="px-3 py-2.5 font-semibold">Officer</th>
                <th className="px-3 py-2.5 font-semibold">Start</th>
                <th className="px-3 py-2.5 font-semibold">Duration</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Audit</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-b border-plum-950/5 text-plum-950/85">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold text-plum-950">{r.id}</td>
                    <td className="px-3 py-2.5"><span className="block max-w-[180px] truncate">{r.projectName}</span></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <ParticipantTypeBadge type={r.participantType} />
                        <span>{r.participantName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">{r.officerName}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{fmt(r.startedAt)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{duration(r)}</td>
                    <td className="px-3 py-2.5"><CallStatusBadge status={r.status} /></td>
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => toggle(r.id)} className="flex items-center gap-1 text-xs font-semibold text-plum-800 hover:underline">
                        Trail <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr className="bg-plum-50/30">
                      <td colSpan={8} className="px-3 py-3">
                        <ol className="space-y-1.5">
                          {(auditById[r.id] ?? []).map((e) => (
                            <li key={e.id} className="flex items-center gap-2 text-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-plum-800" aria-hidden="true" />
                              <span className="font-semibold text-plum-950">{AUDIT_EVENT_LABEL[e.event] ?? e.event}</span>
                              <span className="font-mono text-plum-950/50">{fmt(e.at)}</span>
                              {e.note && <span className="text-plum-950/55">— {e.note}</span>}
                            </li>
                          ))}
                          {!(auditById[r.id] ?? []).length && <li className="text-xs text-plum-950/50">Loading trail…</li>}
                        </ol>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
