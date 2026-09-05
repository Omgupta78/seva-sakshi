import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Settings, LogOut, UserCog, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLES, ROLE_LABELS } from '../../data/rbac.js'

/** Developer-only role switcher — hidden from the normal interface. Enable in
 *  the browser console with: localStorage.setItem('seva-dev-mode', '1'). */
function isDevMode() {
  try { return localStorage.getItem('seva-dev-mode') === '1' } catch { return false }
}

export default function ProfileMenu({ user, onLogout }) {
  const { role, switchRole } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const devMode = isDevMode()

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

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-plum-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-800 text-xs font-bold text-white">{user.initials}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-plum-950">{user.name}</span>
          <span className="block text-xs text-plum-950/55">{ROLE_LABELS[role] ?? user.role}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-plum-950/50" aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-plum-950/10 bg-white p-2 shadow-xl">
          <div className="border-b border-plum-950/10 px-2 pb-2">
            <p className="text-sm font-semibold text-plum-950">{user.name}</p>
            <p className="text-xs text-plum-950/55">{ROLE_LABELS[role] ?? user.role}{user.district ? ` · ${user.district}` : ''}</p>
          </div>

          {/* Developer-only role switcher — hidden unless seva-dev-mode is set. */}
          {devMode && (
            <div className="border-b border-plum-950/10 px-2 py-2">
              <p className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wide text-[#a15c00] uppercase"><UserCog className="h-3 w-3" aria-hidden="true" /> Developer · view as role</p>
              <select value={role} onChange={(e) => switchRole(e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-2 py-1.5 text-xs text-plum-950 focus:outline-none">
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          )}

          <Link to="/officer/settings" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-plum-950 no-underline hover:bg-plum-50">
            <User className="h-4 w-4" aria-hidden="true" /> Profile
          </Link>
          <Link to="/officer/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-plum-950 no-underline hover:bg-plum-50">
            <Settings className="h-4 w-4" aria-hidden="true" /> Settings
          </Link>
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#D6262B] hover:bg-red-50">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
          </button>
        </div>
      )}
    </div>
  )
}
