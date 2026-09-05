import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let idSeq = 0
const ICON = { success: CheckCircle2, error: XCircle, info: Info }
const STYLE = {
  success: 'border-[#138808]/25 bg-white text-plum-950',
  error: 'border-[#D6262B]/25 bg-white text-plum-950',
  info: 'border-plum-800/20 bg-white text-plum-950',
}
const ICON_COLOR = { success: 'text-[#138808]', error: 'text-[#D6262B]', info: 'text-plum-800' }

/** Lightweight global toasts for success/error feedback after actions. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback((type, message) => {
    const id = ++idSeq
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const toast = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }), [push])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 no-print">
        {toasts.map((t) => {
          const Icon = ICON[t.type] ?? Info
          return (
            <div key={t.id} className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-lg ${STYLE[t.type]}`} role="status">
              <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${ICON_COLOR[t.type]}`} aria-hidden="true" />
              <p className="flex-1 text-sm">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded p-0.5 text-plum-950/40 hover:bg-plum-50">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
