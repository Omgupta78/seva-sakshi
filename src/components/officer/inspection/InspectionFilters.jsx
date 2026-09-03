import { Link } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { INSPECTION_STATUSES, INSPECTION_TYPES, PRIORITIES, statusLabel, typeLabel } from '../../../data/inspectionModels.js'
import { RISK_LEVELS } from '../../../data/models.js'

export default function InspectionFilters({ filters, onChange }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value, page: 1 })
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
        <label htmlFor="inspection-search" className="sr-only">
          Search inspections
        </label>
        <input
          id="inspection-search"
          type="search"
          placeholder="Search by ID, project, organization, team…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm text-plum-950 placeholder:text-plum-950/40 focus:outline-none"
        />
      </div>

      <select value={filters.status} onChange={(e) => set('status', e.target.value)} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
        <option value="all">All Statuses</option>
        {INSPECTION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel(s)}
          </option>
        ))}
      </select>

      <select value={filters.priority} onChange={(e) => set('priority', e.target.value)} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
        <option value="all">All Priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p[0].toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      <select value={filters.riskLevel} onChange={(e) => set('riskLevel', e.target.value)} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
        <option value="all">All Risk Levels</option>
        {RISK_LEVELS.map((r) => (
          <option key={r} value={r}>
            {r[0].toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>

      <select value={filters.type} onChange={(e) => set('type', e.target.value)} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
        <option value="all">All Types</option>
        {INSPECTION_TYPES.map((t) => (
          <option key={t} value={t}>
            {typeLabel(t)}
          </option>
        ))}
      </select>

      <Link
        to="/officer/inspections/create"
        className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-3.5 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a91f24]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create Inspection
      </Link>
    </div>
  )
}
