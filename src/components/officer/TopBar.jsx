import { Menu } from 'lucide-react'
import NotificationsDropdown from './NotificationsDropdown.jsx'
import ProfileMenu from './ProfileMenu.jsx'

export default function TopBar({ onOpenSidebar, user, alerts, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-plum-950/10 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-plum-950/70 hover:bg-plum-50 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <h1 className="truncate text-sm font-bold text-plum-950 sm:text-base">DoSJE Monitoring Platform</h1>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NotificationsDropdown alerts={alerts} />
          <div className="h-6 w-px bg-plum-950/10" aria-hidden="true" />
          <ProfileMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
