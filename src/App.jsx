import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import OfficerLayout from './pages/officer/OfficerLayout.jsx'
import OfficerDashboard from './pages/officer/OfficerDashboard.jsx'
import ProjectsList from './pages/officer/ProjectsList.jsx'
import ProjectDetails from './pages/officer/ProjectDetails.jsx'
import OrganizationsList from './pages/officer/OrganizationsList.jsx'
import InspectionsList from './pages/officer/InspectionsList.jsx'
import InspectionDetails from './pages/officer/InspectionDetails.jsx'
import CreateInspectionPage from './pages/officer/CreateInspectionPage.jsx'
import InspectionAssignmentPage from './pages/officer/InspectionAssignmentPage.jsx'
import CctvMonitoring from './pages/officer/CctvMonitoring.jsx'
import CctvCameraDetail from './pages/officer/CctvCameraDetail.jsx'
import VideoCheck from './pages/officer/VideoCheck.jsx'
import AttendanceLayout from './pages/officer/attendance/AttendanceLayout.jsx'
import AttendanceHub from './pages/officer/attendance/AttendanceHub.jsx'
import AttendanceLive from './pages/officer/attendance/AttendanceLive.jsx'
import StudentsList from './pages/officer/attendance/StudentsList.jsx'
import Enrollment from './pages/officer/attendance/Enrollment.jsx'
import AnalyticsDashboard from './pages/officer/analytics/AnalyticsDashboard.jsx'
import AlertsList from './pages/officer/analytics/AlertsList.jsx'
import AlertDetail from './pages/officer/analytics/AlertDetail.jsx'
import Reports from './pages/officer/Reports.jsx'
import PrintableInspectionReport from './pages/officer/PrintableInspectionReport.jsx'
import Notifications from './pages/officer/Notifications.jsx'
import Settings from './pages/officer/Settings.jsx'
import InspectorLayout from './pages/inspector/InspectorLayout.jsx'
import InspectorHome from './pages/inspector/InspectorHome.jsx'
import InspectorInspections from './pages/inspector/InspectorInspections.jsx'
import InspectorInspectionDetail from './pages/inspector/InspectorInspectionDetail.jsx'
import InspectorEvidence from './pages/inspector/InspectorEvidence.jsx'

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
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="institutes" element={<OrganizationsList category="institute" />} />
            <Route path="ngos" element={<OrganizationsList category="ngo" />} />
            <Route path="cctv" element={<CctvMonitoring />} />
            <Route path="cctv/:cameraId" element={<CctvCameraDetail />} />
            <Route path="video-check" element={<VideoCheck />} />
            <Route path="inspections" element={<InspectionsList />} />
            <Route path="inspections/create" element={<CreateInspectionPage />} />
            <Route path="inspections/:id" element={<InspectionDetails />} />
            <Route path="inspection-assignment" element={<InspectionAssignmentPage />} />
            <Route path="attendance" element={<AttendanceLayout />}>
              <Route index element={<AttendanceHub />} />
              <Route path="live" element={<AttendanceLive />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="enrollment" element={<Enrollment />} />
            </Route>
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="alerts" element={<AlertsList />} />
            <Route path="alerts/:id" element={<AlertDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/inspection/:id" element={<PrintableInspectionReport />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Field inspector workspace — mobile-first shell, same session gate. */}
          <Route
            path="/inspector"
            element={
              <ProtectedRoute>
                <InspectorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InspectorHome />} />
            <Route path="inspections" element={<InspectorInspections />} />
            <Route path="inspections/:id" element={<InspectorInspectionDetail />} />
            <Route path="inspections/:id/evidence" element={<InspectorEvidence />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
