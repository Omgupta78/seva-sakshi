import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RequirePermission from './components/RequirePermission.jsx'
import PortalRoute from './components/PortalRoute.jsx'
import { PERMISSIONS, PORTALS } from './data/rbac.js'
import UsersManagement from './pages/officer/UsersManagement.jsx'
import AuditLogs from './pages/officer/AuditLogs.jsx'
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
import InspectorLogin from './pages/inspector/InspectorLogin.jsx'
import InspectorHome from './pages/inspector/InspectorHome.jsx'
import InspectorInspections from './pages/inspector/InspectorInspections.jsx'
import InspectorInspectionDetail from './pages/inspector/InspectorInspectionDetail.jsx'
import InspectorEvidence from './pages/inspector/InspectorEvidence.jsx'
import InspectorReports from './pages/inspector/InspectorReports.jsx'
import InspectorAttendanceVerification from './pages/inspector/InspectorAttendanceVerification.jsx'
import { InspectorNotifications, InspectorSettings, InspectorEvidenceHub, InspectorScheduled, InspectorChecklist, InspectorHistory, InspectorMore } from './pages/inspector/InspectorSimplePages.jsx'
// Institution portal
import InstitutionLogin from './pages/institution/InstitutionLogin.jsx'
import InstitutionLayout from './pages/institution/InstitutionLayout.jsx'
import InstitutionDashboard from './pages/institution/InstitutionDashboard.jsx'
import InstitutionProfile from './pages/institution/InstitutionProfile.jsx'
import InstitutionStaff from './pages/institution/InstitutionStaff.jsx'
import InstitutionDocuments from './pages/institution/InstitutionDocuments.jsx'
import InstitutionReadiness from './pages/institution/InstitutionReadiness.jsx'
import InstitutionStudents from './pages/institution/InstitutionStudents.jsx'
import InstitutionAttendance from './pages/institution/InstitutionAttendance.jsx'
import InstitutionAttendanceSession from './pages/institution/InstitutionAttendanceSession.jsx'
import InstitutionVideoCheck from './pages/institution/InstitutionVideoCheck.jsx'
import InstitutionInspections from './pages/institution/InstitutionInspections.jsx'
import InstitutionNotifications from './pages/institution/InstitutionNotifications.jsx'
import InstitutionSettings from './pages/institution/InstitutionSettings.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/* Portal-specific login entry points (one auth system, role-based redirect). */}
          <Route path="/officer/login" element={<Login />} />
          <Route path="/department/login" element={<Login />} />
          <Route path="/institution/login" element={<InstitutionLogin />} />
          <Route path="/institute/login" element={<InstitutionLogin />} />
          <Route path="/inspector/login" element={<InspectorLogin />} />

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
                <PortalRoute portal={PORTALS.DEPARTMENT}>
                  <OfficerLayout />
                </PortalRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="projects" element={<RequirePermission permission={PERMISSIONS.VIEW_PROJECTS}><ProjectsList /></RequirePermission>} />
            <Route path="projects/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_PROJECTS}><ProjectDetails /></RequirePermission>} />
            <Route path="institutes" element={<RequirePermission permission={PERMISSIONS.VIEW_PROJECTS}><OrganizationsList category="institute" /></RequirePermission>} />
            <Route path="ngos" element={<RequirePermission permission={PERMISSIONS.VIEW_PROJECTS}><OrganizationsList category="ngo" /></RequirePermission>} />
            <Route path="cctv" element={<RequirePermission permission={PERMISSIONS.VIEW_CCTV}><CctvMonitoring /></RequirePermission>} />
            <Route path="cctv/:cameraId" element={<RequirePermission permission={PERMISSIONS.VIEW_CCTV}><CctvCameraDetail /></RequirePermission>} />
            <Route path="video-check" element={<RequirePermission permission={PERMISSIONS.VIEW_VIDEO_CHECK}><VideoCheck /></RequirePermission>} />
            <Route path="inspections" element={<RequirePermission permission={PERMISSIONS.VIEW_INSPECTIONS}><InspectionsList /></RequirePermission>} />
            <Route path="inspections/create" element={<RequirePermission permission={PERMISSIONS.ASSIGN_INSPECTION}><CreateInspectionPage /></RequirePermission>} />
            <Route path="inspections/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_INSPECTIONS}><InspectionDetails /></RequirePermission>} />
            <Route path="inspection-assignment" element={<RequirePermission permission={PERMISSIONS.ASSIGN_INSPECTION}><InspectionAssignmentPage /></RequirePermission>} />
            <Route path="attendance" element={<RequirePermission permission={PERMISSIONS.VIEW_ATTENDANCE}><AttendanceLayout /></RequirePermission>}>
              <Route index element={<AttendanceHub />} />
              <Route path="live" element={<AttendanceLive />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="enrollment" element={<RequirePermission permission={PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT}><Enrollment /></RequirePermission>} />
            </Route>
            <Route path="analytics" element={<RequirePermission permission={PERMISSIONS.VIEW_ANALYTICS}><AnalyticsDashboard /></RequirePermission>} />
            <Route path="alerts" element={<RequirePermission permission={PERMISSIONS.VIEW_ANALYTICS}><AlertsList /></RequirePermission>} />
            <Route path="alerts/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_ANALYTICS}><AlertDetail /></RequirePermission>} />
            <Route path="reports" element={<RequirePermission permission={PERMISSIONS.VIEW_REPORTS}><Reports /></RequirePermission>} />
            <Route path="reports/inspection/:id" element={<RequirePermission permission={PERMISSIONS.VIEW_REPORTS}><PrintableInspectionReport /></RequirePermission>} />
            <Route path="users" element={<RequirePermission permission={PERMISSIONS.MANAGE_USERS}><UsersManagement /></RequirePermission>} />
            <Route path="audit-logs" element={<RequirePermission permission={PERMISSIONS.VIEW_AUDIT_LOGS}><AuditLogs /></RequirePermission>} />
            <Route path="notifications" element={<RequirePermission permission={PERMISSIONS.VIEW_NOTIFICATIONS}><Notifications /></RequirePermission>} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Institution / NGO portal — operate, record, review. */}
          <Route
            path="/institution"
            element={
              <ProtectedRoute>
                <PortalRoute portal={PORTALS.INSTITUTION}>
                  <InstitutionLayout />
                </PortalRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InstitutionDashboard />} />
            <Route path="my-institute" element={<InstitutionProfile />} />
            <Route path="students" element={<InstitutionStudents />} />
            <Route path="staff" element={<InstitutionStaff />} />
            <Route path="documents" element={<InstitutionDocuments />} />
            <Route path="inspection-readiness" element={<InstitutionReadiness />} />
            <Route path="attendance" element={<InstitutionAttendance />} />
            <Route path="attendance/sessions" element={<InstitutionAttendance />} />
            <Route path="attendance/session/:id" element={<InstitutionAttendanceSession />} />
            <Route path="video-check" element={<InstitutionVideoCheck />} />
            <Route path="inspections" element={<InstitutionInspections />} />
            <Route path="notifications" element={<InstitutionNotifications />} />
            <Route path="settings" element={<InstitutionSettings />} />
          </Route>

          {/* Field inspector workspace — mobile-first shell, portal-gated. */}
          <Route
            path="/inspector"
            element={
              <ProtectedRoute>
                <PortalRoute portal={PORTALS.INSPECTOR}>
                  <InspectorLayout />
                </PortalRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InspectorHome />} />
            <Route path="assignments" element={<InspectorInspections />} />
            <Route path="inspections" element={<InspectorInspections />} />
            <Route path="inspections/:id" element={<InspectorInspectionDetail />} />
            <Route path="inspections/:id/evidence" element={<InspectorEvidence />} />
            <Route path="scheduled" element={<InspectorScheduled />} />
            <Route path="checklist" element={<InspectorChecklist />} />
            <Route path="attendance-verification" element={<InspectorAttendanceVerification />} />
            <Route path="evidence" element={<InspectorEvidenceHub />} />
            <Route path="reports" element={<InspectorReports />} />
            <Route path="history" element={<InspectorHistory />} />
            <Route path="more" element={<InspectorMore />} />
            <Route path="notifications" element={<InspectorNotifications />} />
            <Route path="settings" element={<InspectorSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
