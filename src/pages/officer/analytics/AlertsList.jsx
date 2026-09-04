import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Info } from 'lucide-react'
import { useAsync } from '../../../hooks/useAsync.js'
import { listAlerts } from '../../../services/alertsService.js'
import { RISK_LEVELS } from '../../../services/anomalyEngine.js'
import { RiskBadge, AlertStatusBadge } from '../../../components/officer/analytics/Badges.jsx'
import AnalyticsNav from './AnalyticsNav.jsx'

const selectCls = 'rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none'

export default function AlertsList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: '', risk: 'all', status: 'all' })
  const { data, loading } = useAsync(() => listAlerts(filters), [JSON.stringify(filters)])
  const rows = data?.items ?? []

  function set(field, value) { setFilters((f) => ({ ...f, [field]: value })) }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Anomaly Alerts</h1>
        <p className="text-sm text-plum-950/60">Every flag with the evidence behind it — for officer review, not automated judgement.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        <p>Each alert is an <span className="font-semibold text-plum-950">indicator requiring review</span>, not proof of wrongdoing.</p>
      </div>

      <AnalyticsNav />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
          <label htmlFor="alert-search" className="sr-only">Search alerts</label>
          <input id="alert-search" type="search" placeholder="Search by project, metric, reason…" value={filters.search} onChange={(e) => set('search', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm text-plum-950 focus:outline-none" />
        </div>
        <select value={filters.risk} onChange={(e) => set('risk', e.target.value)} className={selectCls}>
          <option value="all">All Risk</option>
          {RISK_LEVELS.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => set('status', e.target.value)} className={selectCls}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="reviewing">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">Risk</th>
              <th className="px-3 py-2.5 font-semibold">Project</th>
              <th className="px-3 py-2.5 font-semibold">Metric</th>
              <th className="px-3 py-2.5 font-semibold">Expected</th>
              <th className="px-3 py-2.5 font-semibold">Observed</th>
              <th className="px-3 py-2.5 font-semibold">Detected</th>
              <th className="px-3 py-2.5 font-semibold">Score</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-plum-950/50">Analysing…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-plum-950/50">No alerts match these filters.</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id} onClick={() => navigate(`/officer/alerts/${a.id}`)} className="cursor-pointer border-b border-plum-950/5 text-plum-950/85 last:border-0 hover:bg-plum-50/50">
                <td className="px-3 py-2.5"><RiskBadge level={a.riskLevel} /></td>
                <td className="px-3 py-2.5"><span className="block max-w-[200px] truncate font-semibold text-plum-950">{a.projectName}</span><span className="text-[10px] text-plum-950/45">{a.district}</span></td>
                <td className="px-3 py-2.5">{a.metric}</td>
                <td className="px-3 py-2.5 text-plum-950/70">{a.expectedValue}</td>
                <td className="px-3 py-2.5 font-semibold text-plum-950">{a.observedValue}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs">{a.detectedDate}</td>
                <td className="px-3 py-2.5 font-mono text-xs font-bold">{a.score}</td>
                <td className="px-3 py-2.5"><AlertStatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
