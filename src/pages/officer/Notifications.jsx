import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCheck, Settings, Archive, Trash2, ArrowUpRight, BellOff, Circle } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import { NOTIFICATION_CATEGORIES, CATEGORY_META } from '../../data/notificationsData.js'
import NotificationIcon from '../../components/officer/notifications/NotificationIcon.jsx'

const selectCls = 'rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm text-plum-950 focus:outline-none'

const PRIORITY_STYLES = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-50 text-[#a15c00]',
  high: 'bg-orange-50 text-[#c2410c]',
  critical: 'bg-red-50 text-[#D6262B]',
}

function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead, archive, remove } = useNotifications()
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  const rows = notifications.filter((n) =>
    (category === 'all' || n.category === category) && (status === 'all' || (status === 'unread' ? !n.read : n.read)))

  function open(n) {
    if (!n.read) markRead(n.id)
    if (n.relatedRoute) navigate(n.relatedRoute)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Notifications</h1>
          <p className="text-sm text-plum-950/60">{unreadCount} unread · {notifications.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={markAllRead} disabled={unreadCount === 0} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-800 hover:bg-plum-50 disabled:opacity-40">
            <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all read
          </button>
          <Link to="/officer/settings" className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-800 no-underline hover:bg-plum-50">
            <Settings className="h-4 w-4" aria-hidden="true" /> Preferences
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="all">All categories</option>
          {NOTIFICATION_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <span className="ml-auto text-xs text-plum-950/50">{rows.length} shown</span>
      </div>

      {/* List */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-plum-950/15 bg-white/60 px-6 py-16 text-center">
          <BellOff className="h-8 w-8 text-plum-950/25" aria-hidden="true" />
          <p className="text-sm font-semibold text-plum-950">Nothing here</p>
          <p className="text-xs text-plum-950/55">No notifications match these filters.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => (
            <li key={n.id} className={`rounded-2xl border p-3.5 shadow-sm transition-colors sm:p-4 ${n.read ? 'border-plum-950/10 bg-white' : 'border-plum-800/25 bg-plum-50/40'}`}>
              <div className="flex gap-3">
                <NotificationIcon category={n.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!n.read && <Circle className="h-2 w-2 shrink-0 fill-plum-800 text-plum-800" aria-label="Unread" />}
                    <span className="text-sm font-bold text-plum-950">{n.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${PRIORITY_STYLES[n.priority]}`}>{n.priority}</span>
                    <span className="text-[10px] font-semibold tracking-wide text-plum-950/45 uppercase">{CATEGORY_META[n.category].label}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-plum-950/75">{n.message}</p>
                  <p className="mt-1 text-[11px] text-plum-950/45">{n.projectName ? `${n.projectName} · ` : ''}{timeAgo(n.timestamp)}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {n.relatedRoute && (
                      <button type="button" onClick={() => open(n)} className="flex items-center gap-1 rounded-lg bg-plum-800 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-plum-700">
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> Open
                      </button>
                    )}
                    {!n.read && (
                      <button type="button" onClick={() => markRead(n.id)} className="rounded-lg border border-plum-950/15 px-2.5 py-1.5 text-xs font-semibold text-plum-800 hover:bg-plum-50">Mark read</button>
                    )}
                    <button type="button" onClick={() => archive(n.id)} className="flex items-center gap-1 rounded-lg border border-plum-950/15 px-2.5 py-1.5 text-xs font-semibold text-plum-800 hover:bg-plum-50">
                      <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive
                    </button>
                    <button type="button" onClick={() => remove(n.id)} aria-label="Delete notification" className="flex items-center gap-1 rounded-lg border border-[#D6262B]/25 px-2.5 py-1.5 text-xs font-semibold text-[#D6262B] hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
