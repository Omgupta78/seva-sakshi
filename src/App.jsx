import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  FolderKanban,
  Building2,
  Video,
  ClipboardList,
  UserCheck,
  CalendarCheck,
  BrainCircuit,
  FileBarChart,
  Bell,
  Settings,
} from 'lucide-react'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import OfficerLayout from './pages/officer/OfficerLayout.jsx'
import OfficerDashboard from './pages/officer/OfficerDashboard.jsx'
import ComingSoon from './components/officer/ComingSoon.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Earlier institute-monitoring dashboard — kept available at its original URL. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Department Officer workspace — persistent sidebar + top bar shell, one route per section. */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute>
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="projects" element={<ComingSoon title="Projects" icon={FolderKanban} />} />
            <Route path="institutes" element={<ComingSoon title="Institutes / NGOs" icon={Building2} />} />
            <Route path="cctv" element={<ComingSoon title="Live CCTV" icon={Video} />} />
            <Route path="inspections" element={<ComingSoon title="Inspections" icon={ClipboardList} />} />
            <Route path="inspection-assignment" element={<ComingSoon title="Inspection Assignment" icon={UserCheck} />} />
            <Route path="attendance" element={<ComingSoon title="Attendance" icon={CalendarCheck} />} />
            <Route path="ai-analytics" element={<ComingSoon title="AI Analytics" icon={BrainCircuit} />} />
            <Route path="reports" element={<ComingSoon title="Reports" icon={FileBarChart} />} />
            <Route path="notifications" element={<ComingSoon title="Notifications" icon={Bell} />} />
            <Route path="settings" element={<ComingSoon title="Settings" icon={Settings} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
