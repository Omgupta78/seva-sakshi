import { Link } from 'react-router-dom'
import { useAsync } from '../../../hooks/useAsync.js'
import { listAuditEntries, INSPECTORS } from '../../../services/inspectionAssignmentService.js'

const ACTION_LABEL = { generate: 'Generated', accept: 'Accepted', manual: 'Manual Override' }
const ACTION_STYLE = {
  generate: 'bg-plum-50 text-plum-800 border-plum-800/20',
  accept: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  manual: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
}

function inspectorName(id) {
  return INSPECTORS.find((i) => i.id === id)?.name ?? '—'
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/**
 * Read-only view of the assignment audit trail — who generated or
 * accepted or manually overrode an assignment, when, and (for
 * overrides) why. Directly demonstrates the brief's AUDIT requirement
 * rather than leaving it as an unverifiable backend claim.
 */
export default function AssignmentAuditLog() {
  const { data: entries, loading } = useAsync(() => listAuditEntries(), [])

  if (loading) return <p className="text-sm text-plum-950/50">Loading audit log…</p>
  if (!entries || entries.length === 0) {
    return <p className="rounded-xl border border-dashed border-plum-950/15 p-6 text-center text-sm text-plum-950/50">No assignment activity recorded yet this session.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-plum-950/10">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
            <th className="px-3 py-2.5 font-semibold">Inspection</th>
            <th className="px-3 py-2.5 font-semibold">Action</th>
            <th className="px-3 py-2.5 font-semibold">By</th>
            <th className="px-3 py-2.5 font-semibold">When</th>
            <th className="px-3 py-2.5 font-semibold">Eligible</th>
            <th className="px-3 py-2.5 font-semibold">Selected</th>
            <th className="px-3 py-2.5 font-semibold">Reason</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-plum-950/5 last:border-0">
              <td className="px-3 py-2.5">
                <Link to={`/officer/inspections/${e.inspectionId}`} className="font-medium text-plum-800 no-underline hover:underline">
                  {e.inspectionId}
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${ACTION_STYLE[e.action]}`}>{ACTION_LABEL[e.action]}</span>
              </td>
              <td className="px-3 py-2.5 text-plum-950/80">{e.generatedBy}</td>
              <td className="px-3 py-2.5 text-plum-950/60">{formatTimestamp(e.timestamp)}</td>
              <td className="px-3 py-2.5 text-plum-950/60">{e.eligibleInspectorIds.length}</td>
              <td className="px-3 py-2.5 font-medium text-plum-950">{e.selectedInspectorId ? inspectorName(e.selectedInspectorId) : '—'}</td>
              <td className="px-3 py-2.5 text-plum-950/60">{e.reason ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
