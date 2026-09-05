import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Video,
  MonitorPlay,
  ClipboardList,
  UserCheck,
  CalendarCheck,
  BrainCircuit,
  Siren,
  FileBarChart,
  Bell,
  Settings,
  Users2,
  LogOut,
  X,
} from 'lucide-react'
import EmblemMark from '../EmblemMark.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'

const NAV_ITEMS = [
  { to: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/officer/projects', label: 'Projects', icon: FolderKanban, permission: PERMISSIONS.VIEW_PROJECTS },
  { to: '/officer/institutes', label: 'Institutes / NGOs', icon: Building2, permission: PERMISSIONS.VIEW_PROJECTS },
  { to: '/officer/cctv', label: 'Live CCTV', icon: Video, permission: PERMISSIONS.VIEW_CCTV },
  { to: '/officer/video-check', label: 'Video Check', icon: MonitorPlay, permission: PERMISSIONS.VIEW_VIDEO_CHECK },
  { to: '/officer/inspections', label: 'Inspections', icon: ClipboardList, permission: PERMISSIONS.VIEW_INSPECTIONS },
  { to: '/officer/inspection-assignment', label: 'Inspection Assignment', icon: UserCheck, permission: PERMISSIONS.ASSIGN_INSPECTION },
  { to: '/officer/attendance', label: 'Attendance', icon: CalendarCheck, permission: PERMISSIONS.VIEW_ATTENDANCE },
  { to: '/officer/analytics', label: 'AI Analytics', icon: BrainCircuit, permission: PERMISSIONS.VIEW_ANALYTICS },
  { to: '/officer/alerts', label: 'Anomaly Alerts', icon: Siren, permission: PERMISSIONS.VIEW_ANALYTICS },
  { to: '/officer/reports', label: 'Reports', icon: FileBarChart, permission: PERMISSIONS.VIEW_REPORTS },
  { to: '/officer/users', label: 'User Management', icon: Users2, permission: PERMISSIONS.MANAGE_USERS },
  { to: '/officer/notifications', label: 'Notifications', icon: Bell, permission: PERMISSIONS.VIEW_NOTIFICATIONS },
  { to: '/officer/settings', label: 'Settings', icon: Settings },
]

/**
 * Persistent left sidebar. Renders inline on desktop (lg+); on smaller
 * screens it's an off-canvas drawer controlled by `open`/`onClose`
 * (toggled from TopBar's hamburger button).
 */
export default function Sidebar({ open, onClose, onLogout }) {
  const { hasPermission } = useAuth()
  const navItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission))
  return (
    <>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-plum-950/50 lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'} transition-opacity`}
      />

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-plum-950 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <EmblemMark className="h-8 w-auto" />
            <div className="leading-tight">
              <p className="text-sm font-bold">Seva Sakshi</p>
              <p className="text-[10px] text-white/60">DoSJE Monitoring Platform</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                  isActive ? 'bg-plum-800 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-2.5">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
