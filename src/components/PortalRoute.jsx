import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { roleCanAccessPortal, PORTAL_LOGIN } from '../data/rbac.js'
import AccessDenied from './AccessDenied.jsx'

/**
 * Portal-level guard. Every portal's route tree is wrapped in this so a user
 * can never reach another portal by typing its URL:
 *   - not signed in            → redirect to that portal's login
 *   - signed in, wrong portal  → Access Denied (with a link to their portal)
 *   - signed in, right portal  → render the portal
 * SUPER_ADMIN passes every portal check (see rbac.roleCanAccessPortal).
 */
export default function PortalRoute({ portal, children }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={PORTAL_LOGIN[portal] ?? '/login'} replace state={{ from: location.pathname }} />
  }
  if (!roleCanAccessPortal(role, portal)) {
    return <AccessDenied reason="This portal is not available for your role. You have been redirected to a safe page." />
  }
  return children
}
