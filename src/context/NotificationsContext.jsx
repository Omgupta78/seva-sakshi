import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as svc from '../services/notificationsService.js'

const NotificationsContext = createContext(null)

/** Polling cadence — with a backend this is replaced by an SSE/WebSocket
 *  subscription and the interval goes away. */
const POLL_MS = 20000

/**
 * Owns the notification feed so the top-bar badge and the notifications page
 * share one source of truth. Runs clean polling (one queued item per tick at
 * most) and applies the officer's category preferences to what is shown.
 */
export function NotificationsProvider({ children }) {
  const [items, setItems] = useState(() => svc.snapshot())
  const [prefs, setPrefs] = useState(() => svc.getPreferences())

  // Poll for new notifications (stands in for SSE/WebSocket).
  useEffect(() => {
    const t = setInterval(() => {
      const { items: next, added } = svc.poll()
      if (added) setItems(next)
    }, POLL_MS)
    return () => clearInterval(t)
  }, [])

  // Only surface categories the officer hasn't muted.
  const visible = useMemo(() => items.filter((n) => prefs[n.category] !== false), [items, prefs])
  const unreadCount = useMemo(() => visible.filter((n) => !n.read).length, [visible])

  const markRead = useCallback((id) => setItems(svc.markRead(id)), [])
  const markAllRead = useCallback(() => setItems(svc.markAllRead()), [])
  const archive = useCallback((id) => setItems(svc.archive(id)), [])
  const remove = useCallback((id) => setItems(svc.remove(id)), [])
  const setPreference = useCallback((category, enabled) => {
    setPrefs((prev) => {
      const next = { ...prev, [category]: enabled }
      svc.savePreferences(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({
    notifications: visible, unreadCount, prefs, markRead, markAllRead, archive, remove, setPreference,
  }), [visible, unreadCount, prefs, markRead, markAllRead, archive, remove, setPreference])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider')
  return ctx
}
