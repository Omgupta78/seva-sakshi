import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/officer/Sidebar.jsx'
import TopBar from '../../components/officer/TopBar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { NotificationsProvider } from '../../context/NotificationsContext.jsx'

/**
 * Shared chrome for every /officer/* route: persistent sidebar (an
 * off-canvas drawer on small screens) + top bar. Each route's own page
 * renders into <Outlet/>.
 */
export default function OfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <NotificationsProvider>
      <div className="flex min-h-screen bg-paper-50">
        <a
          href="#officer-main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-plum-950 focus:shadow-lg"
        >
          Skip to main content
        </a>

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenSidebar={() => setSidebarOpen(true)} user={user} onLogout={handleLogout} />
          <main id="officer-main" className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  )
}
