import { NavLink } from 'react-router-dom'
import { BarChart3, Siren } from 'lucide-react'

const TABS = [
  { to: '/officer/analytics', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/officer/alerts', label: 'Alerts', icon: Siren },
]

/** Shared sub-navigation between the analytics dashboard and the alerts list. */
export default function AnalyticsNav() {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-plum-950/10 bg-white p-1.5 shadow-sm">
      {TABS.map((t) => {
        const Icon = t.icon
        return (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors ${
                isActive ? 'bg-plum-800 text-white' : 'text-plum-950/70 hover:bg-plum-50'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </NavLink>
        )
      })}
    </div>
  )
}
