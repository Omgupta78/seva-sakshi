import { useState } from 'react'
import { Users2, ShieldCheck, Check } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listUsers, updateUserRole, setUserStatus } from '../../services/usersService.js'
import { ROLES, ROLE_LABELS, PERMISSIONS, PERMISSION_LABELS, roleHasPermission } from '../../data/rbac.js'

const ROLE_LIST = Object.values(ROLES)
const PERM_LIST = Object.values(PERMISSIONS)

export default function UsersManagement() {
  const [filters, setFilters] = useState({ search: '', role: 'all' })
  const { data, loading, refetch } = useAsync(() => listUsers(filters), [JSON.stringify(filters)])
  const [busy, setBusy] = useState(null)
  const rows = data?.items ?? []

  async function changeRole(id, role) {
    setBusy(id)
    try { await updateUserRole(id, role); refetch() } finally { setBusy(null) }
  }
  async function toggleStatus(u) {
    setBusy(u.id)
    try { await setUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active'); refetch() } finally { setBusy(null) }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">User &amp; Access Management</h1>
        <p className="text-sm text-plum-950/60">Assign roles and review what each role can do. Restricted to Super Admins.</p>
      </div>

      {/* Users */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm">
        <input type="search" placeholder="Search users…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} className="min-w-[200px] flex-1 rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none" />
        <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none">
          <option value="all">All roles</option>
          {ROLE_LIST.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">Name</th>
              <th className="px-3 py-2.5 font-semibold">Email</th>
              <th className="px-3 py-2.5 font-semibold">District</th>
              <th className="px-3 py-2.5 font-semibold">Role</th>
              <th className="px-3 py-2.5 font-semibold">Permissions</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-plum-950/50">Loading…</td></tr>
            ) : rows.map((u) => (
              <tr key={u.id} className="border-b border-plum-950/5 text-plum-950/85 last:border-0">
                <td className="px-3 py-2.5 font-semibold text-plum-950">{u.name}</td>
                <td className="px-3 py-2.5 text-xs">{u.email}</td>
                <td className="px-3 py-2.5">{u.district}</td>
                <td className="px-3 py-2.5">
                  <select value={u.role} disabled={busy === u.id} onChange={(e) => changeRole(u.id, e.target.value)} className="rounded-lg border border-plum-950/15 bg-white px-2 py-1.5 text-xs focus:outline-none">
                    {ROLE_LIST.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5 text-xs text-plum-950/60">{u.permissionCount} granted</td>
                <td className="px-3 py-2.5">
                  <button type="button" disabled={busy === u.id} onClick={() => toggleStatus(u)} className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${u.status === 'active' ? 'border-[#138808]/25 bg-green-50 text-[#16794f]' : 'border-gray-300 bg-gray-100 text-gray-600'}`}>
                    {u.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role–permission matrix */}
      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><ShieldCheck className="h-4 w-4 text-plum-800" aria-hidden="true" /> Role · Permission matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-plum-950/10 text-plum-950/60">
                <th className="sticky left-0 bg-white px-2 py-2 font-semibold">Permission</th>
                {ROLE_LIST.map((r) => <th key={r} className="px-2 py-2 text-center font-semibold" title={ROLE_LABELS[r]}>{ROLE_LABELS[r].split(' ').map((w) => w[0]).join('')}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERM_LIST.map((p) => (
                <tr key={p} className="border-b border-plum-950/5">
                  <td className="sticky left-0 bg-white px-2 py-1.5 font-medium text-plum-950">{PERMISSION_LABELS[p]}</td>
                  {ROLE_LIST.map((r) => (
                    <td key={r} className="px-2 py-1.5 text-center">
                      {roleHasPermission(r, p) ? <Check className="mx-auto h-3.5 w-3.5 text-[#138808]" aria-label="granted" /> : <span className="text-plum-950/20" aria-label="not granted">·</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-plum-950/50"><Users2 className="h-3.5 w-3.5" aria-hidden="true" /> Column initials are role names. These permissions are enforced in the service layer, not just in the UI.</p>
      </div>
    </div>
  )
}
