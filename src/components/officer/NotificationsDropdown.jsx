import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import SeverityChip from '../dashboard/SeverityChip.jsx'

export default function NotificationsDropdown({ alerts }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-plum-950/70 hover:bg-plum-50"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D6262B] px-1 text-[10px] font-bold text-white">
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-plum-950/10 bg-white p-2 shadow-xl"
        >
          <p className="px-2 py-1.5 text-xs font-bold tracking-wide text-plum-950/50 uppercase">Notifications</p>
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-lg p-2 hover:bg-plum-50">
                <div className="flex items-center gap-2">
                  <SeverityChip severity={alert.severity} />
                  <span className="truncate text-sm font-semibold text-plum-950">{alert.title}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-plum-950/60">{alert.project}</p>
                <p className="text-[11px] text-plum-950/40">{alert.detectedAt}</p>
              </li>
            ))}
          </ul>
          <Link
            to="/officer/notifications"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-2 py-1.5 text-center text-sm font-semibold text-plum-800 no-underline hover:bg-plum-50"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  )
}
