import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, ClipboardList, ShieldCheck, FileText, MoreHorizontal, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ToastProvider } from '../../context/ToastContext.jsx'
import { InspectorProvider, useInspector } from '../../context/InspectorContext.jsx'
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js'
import OfflineBanner from '../../components/inspector/OfflineBanner.jsx'
import EmblemMark from '../../components/EmblemMark.jsx'

const TABS = [
  { to: '/inspector/dashboard', label: 'Home', icon: Home, end: false },
  { to: '/inspector/assignments', label: 'Assignments', icon: ClipboardList, end: false },
  { to: '/inspector/attendance-verification', label: 'Verify', icon: ShieldCheck, end: false },
  { to: '/inspector/reports', label: 'Reports', icon: FileText, end: false },
  { to: '/inspector/more', label: 'More', icon: MoreHorizontal, end: false },
]

function isDevMode() {
  try { return localStorage.getItem('seva-dev-mode') === '1' } catch { return false }
}

function InspectorChrome() {
  const { inspector, setInspector, inspectors } = useInspector()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const devMode = isDevMode()

  function handleLogout() {
    logout()
    navigate('/inspector/login')
  }

  return (
    // max-w-lg keeps the phone layout honest on a desktop screen instead of
    // stretching touch targets across 1400px.
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-paper-50 shadow-sm">
      <header className="sticky top-0 z-30" style={{ background: 'linear-gradient(120deg, #161138 0%, #3a1d70 100%)' }}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-2.5">
            <EmblemMark className="h-8 w-auto shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold">Seva Sakshi Field</p>
              <p className="truncate text-[11px] text-white/70">Inspection Module</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Developer-only inspector switcher — hidden unless seva-dev-mode is set. */}
            {devMode ? (
              <div className="relative">
                <label htmlFor="inspector-switcher" className="sr-only">Acting as inspector (developer)</label>
                <select id="inspector-switcher" value={inspector.id} onChange={(e) => setInspector(e.target.value)} className="appearance-none rounded-full border border-white/30 bg-white/10 py-2 pr-7 pl-3 text-xs font-semibold text-white focus:outline-none">
                  {inspectors.map((i) => <option key={i.id} value={i.id} className="text-plum-950">{i.name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-white/70" aria-hidden="true" />
              </div>
            ) : (
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{inspector.name}</span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        {!online && <OfflineBanner />}
      </header>

      {/* pb-24 clears the fixed bottom tab bar */}
      <main className="flex-1 px-4 pt-4 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Inspector sections"
        className="fixed right-0 bottom-0 left-0 z-30 mx-auto flex w-full max-w-lg border-t border-plum-950/10 bg-white"
      >
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              // min-h-16 keeps every tab a comfortable thumb target
              `flex min-h-16 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-semibold no-underline ${
                isActive ? 'text-plum-800' : 'text-plum-950/50'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

/** Shared chrome for every /inspector/* route: mobile-first header, offline banner, bottom tab bar. */
export default function InspectorLayout() {
  return (
    <ToastProvider>
      <InspectorProvider>
        <InspectorChrome />
      </InspectorProvider>
    </ToastProvider>
  )
}
