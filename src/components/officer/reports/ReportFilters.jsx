import { RotateCcw } from 'lucide-react'
import { statusLabel } from '../../../data/inspectionModels.js'

const selectCls = 'rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none'
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/** Full filter bar for reports. `options` comes from getReportFilterOptions(). */
export default function ReportFilters({ filters, onChange, options, defaults }) {
  const o = options ?? { states: [], districts: [], schemes: [], projects: [], organizations: [], inspectionStatuses: [], riskLevels: [] }
  const set = (k, v) => onChange({ ...filters, [k]: v })

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">Date from
          <input type="date" value={filters.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} className={selectCls} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">Date to
          <input type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} className={selectCls} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">State
          <select value={filters.state} onChange={(e) => set('state', e.target.value)} className={selectCls}>
            <option value="all">All</option>{o.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">District
          <select value={filters.district} onChange={(e) => set('district', e.target.value)} className={selectCls}>
            <option value="all">All</option>{o.districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">Scheme
          <select value={filters.schemeId} onChange={(e) => set('schemeId', e.target.value)} className={selectCls}>
            <option value="all">All</option>{o.schemes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">Project
          <select value={filters.projectId} onChange={(e) => set('projectId', e.target.value)} className={selectCls}>
            <option value="all">All</option>{o.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">Organization
          <select value={filters.organizationId} onChange={(e) => set('organizationId', e.target.value)} className={selectCls}>
            <option value="all">All</option>{o.organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">Inspection status
          <select value={filters.inspectionStatus} onChange={(e) => set('inspectionStatus', e.target.value)} className={selectCls}>
            <option value="all">All</option>{o.inspectionStatuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-semibold text-plum-950/60">Risk level
          <select value={filters.riskLevel} onChange={(e) => set('riskLevel', e.target.value)} className={selectCls}>
            <option value="all">All</option>{o.riskLevels.map((r) => <option key={r} value={r}>{title(r)}</option>)}
          </select>
        </label>
        <div className="flex items-end">
          <button type="button" onClick={() => onChange({ ...defaults })} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-800 hover:bg-plum-50">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
          </button>
        </div>
      </div>
    </div>
  )
}
