import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ROLES, roleHasPermission, permissionsForRole } from '../data/rbac.js'
import { setActiveRole, setActiveUser } from '../services/authz.js'

/**
 * ---------------------------------------------------------------------
 * DEMO AUTH SESSION + RBAC
 * ---------------------------------------------------------------------
 * Holds "who is logged in" for the browser tab (sessionStorage), including
 * the user's RBAC role. The role drives `hasPermission()` for UX gating, and
 * is pushed into services/authz.js so the service layer (the backend
 * stand-in) can enforce permissions on every sensitive call.
 *
 * To wire to a real backend: `login()` stores a session token; the role and
 * permissions come from the verified session on the server, not from here.
 * ---------------------------------------------------------------------
 */
const SESSION_KEY = 'seva-sakshi-demo-session'

const AuthContext = createContext(null)

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persist(user) {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage unavailable — session just won't survive a refresh */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  // Every user carries an RBAC role; default older sessions to DoSJE Officer.
  const rbacRole = user?.rbacRole ?? (user ? ROLES.DOSJE_OFFICER : null)

  // Keep the service-layer authorization + audit context in sync with who is
  // signed in. Done during render (not just an effect) so it is set before any
  // child renders or calls a guarded service.
  setActiveRole(rbacRole)
  setActiveUser({ id: user?.employeeId ?? user?.id ?? null, name: user?.name ?? 'Unknown' })

  const login = useCallback((userProfile) => {
    const withRole = { rbacRole: ROLES.DOSJE_OFFICER, ...userProfile }
    setUser(withRole)
    persist(withRole)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    persist(null)
    setActiveRole(null)
  }, [])

  /** Demo affordance: switch the active role without re-logging-in. */
  const switchRole = useCallback((role) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), rbacRole: role }
      persist(next)
      return next
    })
  }, [])

  const hasPermission = useCallback((permission) => roleHasPermission(rbacRole, permission), [rbacRole])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    role: rbacRole,
    permissions: rbacRole ? permissionsForRole(rbacRole) : [],
    hasPermission,
    login,
    logout,
    switchRole,
  }), [user, rbacRole, hasPermission, login, logout, switchRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
