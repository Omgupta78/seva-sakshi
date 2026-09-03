import { Search, Plus } from 'lucide-react'
import { PROJECT_STATUSES, RISK_LEVELS } from '../../../data/models.js'
import { SCHEMES, LOCATIONS } from '../../../data/projectsSeedData.js'

export default function ProjectFilters({ filters, onChange, onAddProject }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value, page: 1 })
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <input
          id="project-search"
          type="search"
          placeholder="Search by name, ID, organization, district…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm text-plum-950 placeholder:text-plum-950/40 focus:outline-none"
        />
      </div>

      <select value={filters.status} onChange={(e) => set('status', e.target.value)} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
        <option value="all">All Statuses</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s[0].toUpperCase() + s.slice(1)}
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

      <select value={filters.district} onChange={(e) => set('district', e.target.value)} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
        <option value="all">All Districts</option>
        {LOCATIONS.map((l) => (
          <option key={l.id} value={l.district}>
            {l.district}
          </option>
        ))}
      </select>

      <select value={filters.schemeId} onChange={(e) => set('schemeId', e.target.value)} className="max-w-[180px] rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none">
        <option value="all">All Schemes</option>
        {SCHEMES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onAddProject}
        className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a91f24]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Project
      </button>
    </div>
  )
}
