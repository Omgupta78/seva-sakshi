import { useState } from 'react'
import { Search, ShieldCheck, Lock } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listAuditLogs, getAuditFilterOptions, getAuditStats, ACTION_META } from '../../services/auditService.js'
import { ROLE_LABELS } from '../../data/rbac.js'
import StatCard from '../../components/officer/StatCard.jsx'
import Pagination from '../../components/officer/table/Pagination.jsx'

const selectCls = 'rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none'

const DEFAULTS = { user: 'all', role: 'all', action: 'all', entity: 'all', projectId: 'all', dateFrom: '', dateTo: '', search: '', page: 1, pageSize: 12 }

const RESULT_STYLES = {
  success: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  denied: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
  error: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
}

function fmt(ts) {
  return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function AuditLogs() {
  const [filters, setFilters] = useState(DEFAULTS)
  const key = JSON.stringify(filters)
  const { data, loading } = useAsync(() => listAuditLogs(filters), [key])
  const { data: options } = useAsync(() => getAuditFilterOptions(), [])
  const { data: stats } = useAsync(() => getAuditStats(), [])

  const o = options ?? { users: [], roles: [], actions: [], entities: [], projects: [] }
  const rows = data?.items ?? []
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }))

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Audit Logs</h1>
        <p className="text-sm text-plum-950/60">A complete, append-only record of administrative actions. Restricted to authorised administrators.</p>
      </div>

      <div className="flex flex-wrap items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        <p><span className="font-semibold text-plum-950">Append-only.</span> Records cannot be edited or deleted from the application. No passwords or biometric data are ever stored — biometric actions are referenced by ID only.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Events" value={stats?.total ?? '—'} accent="#3a1d70" />
        <StatCard label="Today" value={stats?.today ?? '—'} accent="#006a61" />
        <StatCard label="Distinct Users" value={stats?.users ?? '—'} accent="#3a1d70" />
        <StatCard label="Denied Attempts" value={stats?.denied ?? '—'} emphasize />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <div className="relative col-span-2 md:col-span-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
            <label htmlFor="audit-search" className="sr-only">Search audit logs</label>
            <input id="audit-search" type="search" placeholder="Search action, user, entity, metadata…" value={filters.search} onChange={(e) => set('search', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm focus:outline-none" />
          </div>
          <select value={filters.user} onChange={(e) => set('user', e.target.value)} className={selectCls}>
            <option value="all">All users</option>
            {o.users.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={filters.role} onChange={(e) => set('role', e.target.value)} className={selectCls}>
            <option value="all">All roles</option>
            {o.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={filters.action} onChange={(e) => set('action', e.target.value)} className={selectCls}>
            <option value="all">All actions</option>
            {o.actions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <select value={filters.entity} onChange={(e) => set('entity', e.target.value)} className={selectCls}>
            <option value="all">All entities</option>
            {o.entities.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={filters.projectId} onChange={(e) => set('projectId', e.target.value)} className={selectCls}>
            <option value="all">All projects</option>
            {o.projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="date" value={filters.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} className={selectCls} aria-label="Date from" />
          <input type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} className={selectCls} aria-label="Date to" />
          <button type="button" onClick={() => setFilters(DEFAULTS)} className="rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-800 hover:bg-plum-50">Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">Timestamp</th>
              <th className="px-3 py-2.5 font-semibold">User / Role</th>
              <th className="px-3 py-2.5 font-semibold">Action</th>
              <th className="px-3 py-2.5 font-semibold">Entity</th>
              <th className="px-3 py-2.5 font-semibold">Entity ID</th>
              <th className="px-3 py-2.5 font-semibold">Project</th>
              <th className="px-3 py-2.5 font-semibold">Result</th>
              <th className="px-3 py-2.5 font-semibold">Device</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-plum-950/50">Loading audit trail…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-12 text-center text-plum-950/50">No audit records match these filters.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-plum-950/5 align-top text-plum-950/85 last:border-0">
                <td className="px-3 py-2.5 whitespace-nowrap text-xs">{fmt(r.timestamp)}</td>
                <td className="px-3 py-2.5">
                  <span className="block font-semibold text-plum-950">{r.userName}</span>
                  <span className="text-[10px] text-plum-950/45">{ROLE_LABELS[r.role] ?? r.role}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="block font-medium text-plum-950">{ACTION_META[r.action]?.label ?? r.actionLabel}</span>
                  {r.metadata && Object.keys(r.metadata).length > 0 && (
                    <span className="text-[10px] text-plum-950/50">{Object.entries(r.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')}</span>
                  )}
                </td>
                <td className="px-3 py-2.5">{r.entity}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{r.entityId}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{r.projectId ?? '—'}</td>
                <td className="px-3 py-2.5"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${RESULT_STYLES[r.result] ?? RESULT_STYLES.success}`}>{r.result}</span></td>
                <td className="px-3 py-2.5 text-xs text-plum-950/60">{r.device}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />}

      <p className="flex items-center gap-1.5 text-[11px] text-plum-950/45">
        <ShieldCheck className="h-3.5 w-3.5 text-plum-800" aria-hidden="true" />
        IP address is recorded server-side in production (not available in this client-only demo). Device is derived from the browser user-agent.
      </p>
    </div>
  )
}
