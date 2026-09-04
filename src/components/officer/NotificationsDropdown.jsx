import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import NotificationIcon from './notifications/NotificationIcon.jsx'

function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

/** Top-bar bell: unread badge + a short recent list, backed by the shared
 *  NotificationsContext so it stays in sync with the notifications page. */
export default function NotificationsDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function onClick(e) { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false) }
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const recent = notifications.slice(0, 6)

  function open_(n) {
    setOpen(false)
    if (!n.read) markRead(n.id)
    if (n.relatedRoute) navigate(n.relatedRoute)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-plum-950/70 hover:bg-plum-50"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D6262B] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-plum-950/10 bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-xs font-bold tracking-wide text-plum-950/50 uppercase">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-semibold text-plum-800 hover:underline">
                <CheckCheck className="h-3 w-3" aria-hidden="true" /> Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 space-y-0.5 overflow-y-auto">
            {recent.length === 0 ? (
              <li className="px-2 py-6 text-center text-xs text-plum-950/50">You're all caught up.</li>
            ) : recent.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => open_(n)} className={`flex w-full gap-2.5 rounded-lg p-2 text-left hover:bg-plum-50 ${n.read ? '' : 'bg-plum-50/50'}`}>
                  <NotificationIcon category={n.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-plum-950">{n.title}</p>
                    <p className="truncate text-[11px] text-plum-950/55">{n.projectName ? `${n.projectName} · ` : ''}{timeAgo(n.timestamp)}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-plum-800" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
          <Link to="/officer/notifications" onClick={() => setOpen(false)} className="mt-1 block rounded-lg px-2 py-1.5 text-center text-sm font-semibold text-plum-800 no-underline hover:bg-plum-50">
            View all
          </Link>
        </div>
      )}
    </div>
  )
}
