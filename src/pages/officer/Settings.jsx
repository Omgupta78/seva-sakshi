import { Bell, Radio } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import { NOTIFICATION_CATEGORIES, CATEGORY_META } from '../../data/notificationsData.js'
import NotificationIcon from '../../components/officer/notifications/NotificationIcon.jsx'

export default function Settings() {
  const { prefs, setPreference } = useNotifications()

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Settings</h1>
        <p className="text-sm text-plum-950/60">Manage how the platform notifies you.</p>
      </div>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-plum-950"><Bell className="h-4 w-4 text-plum-800" aria-hidden="true" /> Notification preferences</h2>
        <p className="mt-1 text-xs text-plum-950/55">Choose which categories you want to be notified about. Muting a category hides its items from your feed and the badge, and stops new ones arriving. Nothing is deleted — re-enable any time.</p>

        <ul className="mt-4 divide-y divide-plum-950/8">
          {NOTIFICATION_CATEGORIES.map((c) => {
            const enabled = prefs[c] !== false
            return (
              <li key={c} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <NotificationIcon category={c} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-plum-950">{CATEGORY_META[c].label}</p>
                    <p className="text-[11px] text-plum-950/50 capitalize">{CATEGORY_META[c].tone === 'critical' ? 'High-importance' : CATEGORY_META[c].tone} alerts</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${CATEGORY_META[c].label} notifications`}
                  onClick={() => setPreference(c, !enabled)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-plum-800' : 'bg-plum-950/20'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'left-0.5 translate-x-5' : 'left-0.5'}`} />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <Radio className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        <p><span className="font-semibold text-plum-950">Delivery:</span> notifications refresh in-app via polling. When a real-time backend is connected, this upgrades to a live SSE/WebSocket stream with no change to these preferences.</p>
      </div>
    </div>
  )
}
