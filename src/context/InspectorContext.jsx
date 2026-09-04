import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { INSPECTORS } from '../data/inspectorsSeedData.js'

/**
 * Which inspector the mobile module is acting as.
 *
 * There's no separate inspector login in this build (none was specified,
 * and inventing a second auth flow would be guesswork) — the /inspector
 * routes sit behind the same demo session as the officer routes, and
 * this context just tracks *whose* worklist is being shown. The header's
 * switcher is a demo affordance: in a real deployment the inspector's
 * identity would come from their own credentials, and the switcher would
 * be removed.
 */
const STORAGE_KEY = 'seva-sakshi-active-inspector'

// Arjun Nair has both an assigned inspection (startable) and a completed
// one, so the demo lands on a worklist that shows something in each state.
const DEFAULT_INSPECTOR_ID = 'INSPR-05'

const InspectorContext = createContext(null)

function readStored() {
  try {
    const id = sessionStorage.getItem(STORAGE_KEY)
    return INSPECTORS.find((i) => i.id === id) ?? null
  } catch {
    return null
  }
}

export function InspectorProvider({ children }) {
  const [inspector, setInspectorState] = useState(
    () => readStored() ?? INSPECTORS.find((i) => i.id === DEFAULT_INSPECTOR_ID) ?? INSPECTORS[0]
  )

  const setInspector = useCallback((id) => {
    const next = INSPECTORS.find((i) => i.id === id)
    if (!next) return
    setInspectorState(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* sessionStorage unavailable — selection just won't survive a reload */
    }
  }, [])

  const value = useMemo(() => ({ inspector, setInspector, inspectors: INSPECTORS }), [inspector, setInspector])
  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>
}

export function useInspector() {
  const ctx = useContext(InspectorContext)
  if (!ctx) throw new Error('useInspector must be used within an InspectorProvider')
  return ctx
}
