import { NavLink, Outlet } from 'react-router-dom'
import { LayoutGrid, ScanFace, Users, UserPlus, Info } from 'lucide-react'

const TABS = [
  { to: '/officer/attendance', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/officer/attendance/live', label: 'Live Attendance', icon: ScanFace },
  { to: '/officer/attendance/students', label: 'Students', icon: Users },
  { to: '/officer/attendance/enrollment', label: 'Enrollment', icon: UserPlus },
]

/** Shared shell for the attendance routes: heading, assistance disclaimer,
 *  sub-navigation, and the routed page. */
export default function AttendanceLayout() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">AI-Assisted Attendance</h1>
        <p className="text-sm text-plum-950/60">Face recognition to support attendance verification during authorised monitoring.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        <p>
          <span className="font-semibold text-plum-950">Assistance tool — not an authority.</span> Recognition is not perfectly accurate; every result carries a
          confidence score and can be Unknown. Final attendance decisions remain with the authorised officer. Biometric templates are kept secure and out of the browser.
        </p>
      </div>

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

      <Outlet />
    </div>
  )
}
