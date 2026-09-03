import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import SeverityChip from '../dashboard/SeverityChip.jsx'
import Modal from '../Modal.jsx'

const SEVERITIES = ['all', 'high', 'medium', 'low']

export default function AiAlertsPanel({ alerts }) {
  const [selected, setSelected] = useState(null)
  const [severityFilter, setSeverityFilter] = useState('all')

  const visible = severityFilter === 'all' ? alerts : alerts.filter((a) => a.severity === severityFilter)

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-plum-950 sm:text-base">AI Alerts</h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="ai-alert-severity-filter">
            Filter by severity
          </label>
          <select
            id="ai-alert-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-plum-950/15 bg-white px-2 py-1 text-xs font-medium text-plum-950 focus:outline-none"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All severities' : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <span className="text-xs font-semibold text-[#D6262B]">{alerts.length} active</span>
        </div>
      </div>
      <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-plum-50 p-2 text-[11px] leading-snug text-plum-950/70">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
        AI alerts flag patterns for human review — they do not confirm fraud or wrongdoing on their own.
      </p>

      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-plum-950/15 p-4 text-center text-xs text-plum-950/50">
          No alerts at this severity.
        </p>
      )}

      <ul className="space-y-2.5">
        {visible.map((alert) => (
          <li key={alert.id} className="rounded-xl border border-plum-950/10 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityChip severity={alert.severity} />
                  <span className="text-sm font-semibold text-plum-950">{alert.title}</span>
                </div>
                <p className="mt-1 truncate text-xs text-plum-950/60">{alert.project}</p>
                <p className="mt-0.5 text-[11px] text-plum-950/40">{alert.detectedAt}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(alert)}
              className="mt-2 text-xs font-semibold text-plum-800 hover:text-plum-950 hover:underline"
            >
              View Details
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SeverityChip severity={selected.severity} />
            <span className="text-xs text-plum-950/50">{selected.detectedAt}</span>
          </div>
          <p className="mb-2 text-sm font-medium text-plum-950">{selected.project}</p>
          <p>{selected.explanation}</p>
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-plum-50 p-2 text-xs leading-snug text-plum-950/70">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
            This is a system-generated flag for human review. It does not, on its own, establish fraud or
            wrongdoing — please verify with the inspection team before acting on it.
          </p>
        </Modal>
      )}
    </div>
  )
}
