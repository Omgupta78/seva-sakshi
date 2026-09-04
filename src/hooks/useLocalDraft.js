import { useCallback, useEffect, useState } from 'react'

/**
 * Persists in-progress field notes to localStorage, keyed per
 * inspection. This is the practical half of "offline-friendly": an
 * inspector filling in observations in a basement with no signal
 * shouldn't lose them to a reload, a backgrounded tab, or a dropped
 * connection.
 *
 * (There's no service worker in this build, so the app shell itself
 * still needs a connection on first load — noted honestly rather than
 * claiming full offline support.)
 */
export function useLocalDraft(key, initialValue) {
  const storageKey = `seva-sakshi-draft:${key}`

  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? { ...initialValue, ...JSON.parse(raw) } : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      /* storage full or unavailable (private mode) — drafts just won't persist */
    }
  }, [storageKey, value])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
  }, [storageKey])

  return [value, setValue, clearDraft]
}
