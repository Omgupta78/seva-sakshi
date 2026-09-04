import { Search } from 'lucide-react'
import { CAMERA_STATUSES } from '../../../data/cctvSeedData.js'

const STATUS_LABEL = { online: 'Online', offline: 'Offline', warning: 'Warning' }
const selectCls = 'rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none'

/**
 * Filter bar for the CCTV dashboard. Options (states / districts / projects /
 * organizations) are passed in from the resolved fleet so they always match
 * what actually exists.
 */
export default function CctvFilters({ filters, onChange, options }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
        <label htmlFor="cctv-search" className="sr-only">Search cameras</label>
        <input
          id="cctv-search"
          type="search"
          placeholder="Search by camera ID, project, organization…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm text-plum-950 placeholder:text-plum-950/40 focus:outline-none"
        />
      </div>

      <label htmlFor="cctv-state" className="sr-only">State</label>
      <select id="cctv-state" value={filters.state} onChange={(e) => set('state', e.target.value)} className={selectCls}>
        <option value="all">All States</option>
        {options.states.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label htmlFor="cctv-district" className="sr-only">District</label>
      <select id="cctv-district" value={filters.district} onChange={(e) => set('district', e.target.value)} className={selectCls}>
        <option value="all">All Districts</option>
        {options.districts.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      <label htmlFor="cctv-project" className="sr-only">Project</label>
      <select id="cctv-project" value={filters.projectId} onChange={(e) => set('projectId', e.target.value)} className={selectCls}>
        <option value="all">All Projects</option>
        {options.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <label htmlFor="cctv-org" className="sr-only">Organization</label>
      <select id="cctv-org" value={filters.organizationId} onChange={(e) => set('organizationId', e.target.value)} className={selectCls}>
        <option value="all">All Organizations</option>
        {options.organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>

      <label htmlFor="cctv-status" className="sr-only">Status</label>
      <select id="cctv-status" value={filters.status} onChange={(e) => set('status', e.target.value)} className={selectCls}>
        <option value="all">All Statuses</option>
        {CAMERA_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
      </select>
    </div>
  )
}
