import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS } from '../data/rbac.js'

/**
 * Professional "Access Denied" screen shown when a signed-in user tries to
 * reach a portal or route their role does not belong to (e.g. typing another
 * portal's URL). Offers a route back to the user's own portal.
 */
export default function AccessDenied({ reason }) {
  const { role, portalHome, isAuthenticated, logout } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D6262B]/20 bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#D6262B]">
          <ShieldX className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-extrabold text-plum-950">Access Denied</h1>
        <p className="mt-2 text-sm text-plum-950/70">
          {reason ?? 'You do not have permission to view this page.'}
        </p>
        {isAuthenticated && role && (
          <p className="mt-1 text-xs text-plum-950/50">Signed in as <span className="font-semibold">{ROLE_LABELS[role] ?? role}</span>.</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-2">
          {isAuthenticated ? (
            <Link to={portalHome} className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-plum-700">
              Go to my portal
            </Link>
          ) : (
            <Link to="/login" className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-plum-700">
              Go to login
            </Link>
          )}
          {isAuthenticated && (
            <button type="button" onClick={logout} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-800 hover:bg-plum-50">
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
