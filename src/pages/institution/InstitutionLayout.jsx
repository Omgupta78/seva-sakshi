import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, CalendarCheck, UserCog, FileText, ClipboardCheck, MonitorPlay, Video, Bell, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ToastProvider } from '../../context/ToastContext.jsx'
import { ROLE_LABELS } from '../../data/rbac.js'
import EmblemMark from '../../components/EmblemMark.jsx'

const NAV = [
  { to: '/institution/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/institution/my-institute', label: 'My Institute', icon: Building2 },
  { to: '/institution/students', label: 'Students', icon: Users },
  { to: '/institution/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/institution/staff', label: 'Staff', icon: UserCog },
  { to: '/institution/documents', label: 'Documents', icon: FileText },
  { to: '/institution/inspection-readiness', label: 'Inspection Readiness', icon: ClipboardCheck },
  { to: '/institution/cctv', label: 'CCTV', icon: Video },
  { to: '/institution/video-check', label: 'Video Check', icon: MonitorPlay },
  { to: '/institution/notifications', label: 'Notifications', icon: Bell },
  { to: '/institution/settings', label: 'Settings', icon: Settings },
]

export default function InstitutionLayout() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() { logout(); navigate('/institution/login') }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-paper-50">
        {open && <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-plum-950/50 lg:hidden" />}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-plum-950 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Institution navigation">
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <div className="flex items-center gap-2.5">
              <EmblemMark className="h-8 w-auto" />
              <div className="leading-tight">
                <p className="text-sm font-bold">Seva Sakshi</p>
                <p className="text-[10px] text-white/60">Institution Portal</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 lg:hidden"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>

          <div className="mx-2.5 mb-2 rounded-lg bg-white/5 px-3 py-2">
            <p className="truncate text-xs font-semibold text-white/90">{user?.institutionName ?? 'Institution'}</p>
            <p className="text-[10px] text-white/50">{user?.institutionId ?? '—'}</p>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-4">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${isActive ? 'bg-plum-800 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/10 p-2.5">
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"><LogOut className="h-4.5 w-4.5" aria-hidden="true" /> Logout</button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-plum-950/10 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-9 w-9 items-center justify-center rounded-lg text-plum-950/70 hover:bg-plum-50 lg:hidden"><Menu className="h-5 w-5" aria-hidden="true" /></button>
                <h1 className="truncate text-sm font-bold text-plum-950 sm:text-base">{user?.institutionName ?? 'Institution Portal'}</h1>
              </div>
              <div className="relative">
                <button type="button" onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-plum-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-800 text-xs font-bold text-white">{user?.initials ?? 'IN'}</span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold text-plum-950">{user?.name ?? 'User'}</span>
                    <span className="block text-xs text-plum-950/55">{ROLE_LABELS[role] ?? role}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-plum-950/50" aria-hidden="true" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-plum-950/10 bg-white p-2 shadow-xl">
                    <NavLink to="/institution/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-plum-950 no-underline hover:bg-plum-50"><Settings className="h-4 w-4" aria-hidden="true" /> Settings</NavLink>
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#D6262B] hover:bg-red-50"><LogOut className="h-4 w-4" aria-hidden="true" /> Logout</button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6"><Outlet /></main>
        </div>
      </div>
    </ToastProvider>
  )
}
