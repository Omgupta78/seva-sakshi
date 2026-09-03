import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * ---------------------------------------------------------------------
 * DEMO AUTH SESSION — mirrors the disclaimer in LoginForm.jsx
 * ---------------------------------------------------------------------
 * There is still no real backend. This context just holds "who is
 * logged in" for the duration of the browser tab (sessionStorage), so
 * the dashboard has a real user object to read a name/role/district
 * from, and so /dashboard can be gated behind an actual login.
 *
 * To wire this to a real backend: replace `login()`'s body with
 * whatever your auth endpoint returns (e.g. a JWT + user profile),
 * and store only a session token client-side — never persist
 * anything you wouldn't want readable via devtools.
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const login = useCallback((userProfile) => {
    setUser(userProfile)
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userProfile))
    } catch {
      /* sessionStorage unavailable (private mode etc.) — session just won't survive a refresh */
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => ({ user, isAuthenticated: !!user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
