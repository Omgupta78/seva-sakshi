import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS, PERMISSION_LABELS } from '../data/rbac.js'

/**
 * Route-level guard: renders `children` only if the signed-in role holds
 * `permission`; otherwise shows an Access Denied panel. This is defence in
 * depth for UX — the services enforce the same permission independently, so
 * a blocked page can never reach privileged data even if this were bypassed.
 */
export default function RequirePermission({ permission, children }) {
  const { hasPermission, role } = useAuth()

  if (hasPermission(permission)) return children

  return (
    <div className="mx-auto max-w-md">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#D6262B]/20 bg-white px-6 py-12 text-center shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#D6262B]">
          <ShieldX className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-bold text-plum-950">Access denied</h1>
        <p className="text-sm text-plum-950/65">
          Your role (<span className="font-semibold">{ROLE_LABELS[role] ?? role}</span>) does not have the
          <span className="font-semibold"> {PERMISSION_LABELS[permission] ?? permission}</span> permission.
        </p>
        <p className="text-xs text-plum-950/50">If you believe this is an error, contact a Super Admin to review your access.</p>
        <Link to="/officer/dashboard" className="mt-1 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-plum-700">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
