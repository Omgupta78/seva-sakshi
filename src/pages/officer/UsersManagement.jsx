import { useState } from 'react'
import { Users2, ShieldCheck, Check, PowerOff, Power, KeyRound, Trash2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { listUsers, updateUserRole, deactivateUser, activateUser, resetUserAccess, deleteUser } from '../../services/usersService.js'
import { ROLES, ROLE_LABELS, PERMISSIONS, PERMISSION_LABELS, roleHasPermission } from '../../data/rbac.js'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'

const ROLE_LIST = Object.values(ROLES)
const PERM_LIST = Object.values(PERMISSIONS)

const STATUS_STYLES = {
  active: 'border-[#138808]/25 bg-green-50 text-[#16794f]',
  deactivated: 'border-gray-300 bg-gray-100 text-gray-600',
  suspended: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]',
}

export default function UsersManagement() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [filters, setFilters] = useState({ search: '', role: 'all' })
  const { data, loading, refetch } = useAsync(() => listUsers(filters), [JSON.stringify(filters)])
  const [busy, setBusy] = useState(null)
  const [action, setAction] = useState(null) // { type, user }
  const rows = data?.items ?? []
  const canDeactivate = hasPermission(PERMISSIONS.USER_DEACTIVATE)
  const canDelete = hasPermission(PERMISSIONS.PERMANENT_DELETE)

  async function changeRole(id, role) {
    setBusy(id)
    try { await updateUserRole(id, role); toast.success('User role updated.'); refetch() } catch (e) { toast.error(e.message ?? 'Could not update role.') } finally { setBusy(null) }
  }

  async function run() {
    const { type, user: u } = action
    if (type === 'deactivate') { await deactivateUser(u.id); toast.success(`${u.name} deactivated.`) }
    else if (type === 'activate') { await activateUser(u.id); toast.success(`${u.name} activated.`) }
    else if (type === 'reset') { await resetUserAccess(u.id); toast.success(`Access reset for ${u.name}.`) }
    else if (type === 'delete') { await deleteUser(u.id); toast.success(`${u.name} permanently deleted.`) }
    setAction(null)
    refetch()
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
              <th className="px-3 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-plum-950/50">Loading…</td></tr>
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
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[u.status] ?? STATUS_STYLES.deactivated}`}>{u.status}</span>
                </td>
                <td className="px-3 py-2.5">
                  <ActionMenu items={[
                    { label: 'Deactivate', icon: PowerOff, tone: 'danger', onClick: () => setAction({ type: 'deactivate', user: u }), hidden: !canDeactivate || u.status !== 'active' },
                    { label: 'Activate', icon: Power, onClick: () => setAction({ type: 'activate', user: u }), hidden: !canDeactivate || u.status === 'active' },
                    { label: 'Reset access', icon: KeyRound, onClick: () => setAction({ type: 'reset', user: u }) },
                    { label: 'Delete permanently', icon: Trash2, tone: 'danger', onClick: () => setAction({ type: 'delete', user: u }), hidden: !canDelete },
                  ]} />
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

      {action?.type === 'deactivate' && (
        <ConfirmActionModal title="Deactivate user?"
          description={`${action.user.name} will no longer be able to log in. Their historical actions, audit logs and inspection history all remain. This can be reversed.`}
          confirmLabel="Deactivate" loadingLabel="Deactivating…" onConfirm={run} onClose={() => setAction(null)} />
      )}
      {action?.type === 'activate' && (
        <ConfirmActionModal title="Activate user?" description={`Restore login access for ${action.user.name}?`}
          confirmLabel="Activate" loadingLabel="Activating…" onConfirm={run} onClose={() => setAction(null)} />
      )}
      {action?.type === 'reset' && (
        <ConfirmActionModal title="Reset access?" description={`Force ${action.user.name} to re-authenticate with new credentials? Existing sessions are invalidated.`}
          confirmLabel="Reset access" loadingLabel="Resetting…" onConfirm={run} onClose={() => setAction(null)} />
      )}
      {action?.type === 'delete' && (
        <ConfirmActionModal title="Permanently delete user?" tone="danger"
          warning="Permanent deletion cannot be undone. Prefer deactivation unless legally required."
          description={`This permanently removes the account for ${action.user.name}. Their audit history is retained. Type the user ID to confirm.`}
          requireConfirmText={action.user.id}
          confirmLabel="Delete permanently" loadingLabel="Deleting…" onConfirm={run} onClose={() => setAction(null)} />
      )}
    </div>
  )
}
