/**
 * ---------------------------------------------------------------------
 * REPORTS SERVICE — aggregates real module data into report datasets
 * ---------------------------------------------------------------------
 * Nothing here is hardcoded: every KPI and row is derived from the same
 * service-layer stores the rest of the app uses (projects, inspections,
 * CCTV, attendance, anomaly alerts). Swap those underlying services for a
 * real API and the reports follow automatically.
 * ---------------------------------------------------------------------
 */
import { delay } from './apiClient.js'
import { listProjects } from './projectsService.js'
import { listInspections } from './inspectionsService.js'
import { listCameras } from './cctvService.js'
import { listAlerts } from './alertsService.js'
import { getAttendanceStats } from './attendanceService.js'
import { ORGANIZATIONS, LOCATIONS, SCHEMES } from '../data/projectsSeedData.js'
import { statusLabel } from '../data/inspectionModels.js'

export const REPORT_TYPES = [
  { id: 'project-monitoring', label: 'Project Monitoring' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'organization', label: 'Organization Performance' },
  { id: 'cctv', label: 'CCTV Availability' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'anomaly', label: 'AI Anomaly' },
]

const DEFAULT_FILTERS = {
  dateFrom: '', dateTo: '', state: 'all', district: 'all', schemeId: 'all',
  projectId: 'all', organizationId: 'all', inspectionStatus: 'all', riskLevel: 'all',
}

// --- filter predicates ----------------------------------------------------
function inDateRange(dateStr, f) {
  if (!dateStr) return true
  const d = dateStr.slice(0, 10)
  if (f.dateFrom && d < f.dateFrom) return false
  if (f.dateTo && d > f.dateTo) return false
  return true
}
function matchProject(p, f) {
  return (f.state === 'all' || p.state === f.state)
    && (f.district === 'all' || p.district === f.district)
    && (f.schemeId === 'all' || p.schemeId === f.schemeId)
    && (f.projectId === 'all' || p.id === f.projectId)
    && (f.organizationId === 'all' || p.organizationId === f.organizationId)
    && (f.riskLevel === 'all' || p.riskLevel === f.riskLevel)
}
function matchInspection(i, f) {
  return (f.state === 'all' || i.state === f.state)
    && (f.district === 'all' || i.district === f.district)
    && (f.projectId === 'all' || i.projectId === f.projectId)
    && (f.organizationId === 'all' || i.organizationId === f.organizationId)
    && (f.riskLevel === 'all' || i.riskLevel === f.riskLevel)
    && (f.inspectionStatus === 'all' || i.status === f.inspectionStatus)
    && inDateRange(i.scheduledDate, f)
}

// --- shared data load -----------------------------------------------------
async function loadAll(filters) {
  const f = { ...DEFAULT_FILTERS, ...filters }
  const [projRes, inspRes, camRes, alertRes] = await Promise.all([
    listProjects({ pageSize: 100 }),
    listInspections({ pageSize: 500 }),
    listCameras({}),
    listAlerts({}),
  ])
  const projects = projRes.items.filter((p) => matchProject(p, f))
  const inspections = inspRes.items.filter((i) => matchInspection(i, f))
  const cameras = camRes.items.filter((c) =>
    (f.state === 'all' || c.state === f.state)
    && (f.district === 'all' || c.district === f.district)
    && (f.projectId === 'all' || c.projectId === f.projectId)
    && (f.organizationId === 'all' || c.organizationId === f.organizationId))
  const alerts = alertRes.items.filter((a) => (f.projectId === 'all' || a.projectId === f.projectId) && (f.riskLevel === 'all' || a.riskLevel === f.riskLevel) && inDateRange(a.detectedDate, f))
  return { f, projects, inspections, cameras, alerts }
}

const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0)

// --- KPI summary ----------------------------------------------------------
export async function getReportSummary(filters = {}) {
  const { projects, inspections, cameras, alerts } = await loadAll(filters)
  await delay(60)
  const inspectedProjectIds = new Set(inspections.map((i) => i.projectId))
  const completed = inspections.filter((i) => i.status === 'completed').length
  const onlineCams = cameras.filter((c) => c.status === 'online').length
  const compliant = projects.filter((p) => p.complianceStatus === 'compliant').length
  const openAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'reviewing').length
  return {
    totalProjects: projects.length,
    projectsInspected: inspectedProjectIds.size,
    inspectionCompletionPct: inspections.length ? Math.round((completed / inspections.length) * 100) : 0,
    avgAttendance: avg(projects.map((p) => p.attendancePercentage)),
    cctvUptimePct: cameras.length ? Math.round((onlineCams / cameras.length) * 100) : 0,
    openAlerts,
    compliancePct: projects.length ? Math.round((compliant / projects.length) * 100) : 0,
  }
}

// --- charts ---------------------------------------------------------------
export async function getReportCharts(filters = {}) {
  const { projects, inspections, cameras } = await loadAll(filters)
  await delay(60)
  const count = (arr, key, val) => arr.filter((x) => x[key] === val).length
  return {
    projectsByRisk: [
      { label: 'Healthy', value: count(projects, 'riskLevel', 'healthy'), color: '#138808' },
      { label: 'Watch', value: count(projects, 'riskLevel', 'watch'), color: '#e2a610' },
      { label: 'High Risk', value: count(projects, 'riskLevel', 'high'), color: '#D6262B' },
    ],
    inspectionsByStatus: ['completed', 'in-progress', 'scheduled', 'assigned', 'pending', 'overdue']
      .map((s) => ({ label: statusLabel(s), value: count(inspections, 'status', s), color: s === 'overdue' ? '#D6262B' : s === 'completed' ? '#138808' : '#3a1d70' }))
      .filter((d) => d.value > 0),
    cctvByStatus: [
      { label: 'Online', value: count(cameras, 'status', 'online'), color: '#138808' },
      { label: 'Warning', value: count(cameras, 'status', 'warning'), color: '#e2a610' },
      { label: 'Offline', value: count(cameras, 'status', 'offline'), color: '#D6262B' },
    ],
  }
}

// --- report datasets ------------------------------------------------------
export async function getReport(type, filters = {}) {
  const { projects, inspections, cameras, alerts } = await loadAll(filters)
  await delay(120)

  switch (type) {
    case 'inspection':
      return {
        columns: [
          { key: 'id', label: 'Inspection ID' }, { key: 'projectName', label: 'Project' }, { key: 'organizationName', label: 'Organization' },
          { key: 'teamName', label: 'Inspector / Team' }, { key: 'scheduledDate', label: 'Date' }, { key: 'location', label: 'Location' },
          { key: 'statusLabel', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'riskLevel', label: 'Risk' },
        ],
        rows: inspections.map((i) => ({ ...i, location: `${i.district}, ${i.state}`, statusLabel: statusLabel(i.status) })),
      }
    case 'attendance':
      return {
        columns: [
          { key: 'name', label: 'Project' }, { key: 'organizationName', label: 'Organization' }, { key: 'district', label: 'District' },
          { key: 'attendancePercentage', label: 'Avg Attendance %' }, { key: 'beneficiaryCount', label: 'Beneficiaries' }, { key: 'staffCount', label: 'Staff' },
        ],
        rows: projects.map((p) => ({ ...p })),
      }
    case 'organization': {
      const rows = ORGANIZATIONS
        .filter((o) => (filters.organizationId ?? 'all') === 'all' || o.id === filters.organizationId)
        .map((o) => {
          const loc = LOCATIONS.find((l) => l.id === o.locationId)
          const orgProjects = projects.filter((p) => p.organizationId === o.id)
          return {
            id: o.id, name: o.name, type: o.type, district: loc?.district ?? '—',
            projectCount: o.projectIds?.length ?? orgProjects.length,
            complianceStatus: o.complianceStatus, status: o.status,
          }
        })
        .filter((o) => (filters.district ?? 'all') === 'all' || o.district === filters.district)
      return {
        columns: [
          { key: 'name', label: 'Organization' }, { key: 'type', label: 'Type' }, { key: 'district', label: 'District' },
          { key: 'projectCount', label: 'Projects' }, { key: 'complianceStatus', label: 'Compliance' }, { key: 'status', label: 'Status' },
        ],
        rows,
      }
    }
    case 'cctv':
      return {
        columns: [
          { key: 'id', label: 'Camera ID' }, { key: 'projectName', label: 'Project' }, { key: 'label', label: 'Placement' },
          { key: 'district', label: 'District' }, { key: 'status', label: 'Status' }, { key: 'resolution', label: 'Resolution' }, { key: 'lastHeartbeat', label: 'Last Heartbeat' },
        ],
        rows: cameras.map((c) => ({ ...c, lastHeartbeat: new Date(c.lastHeartbeat).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) })),
      }
    case 'compliance':
      return {
        columns: [
          { key: 'name', label: 'Project' }, { key: 'organizationName', label: 'Organization' }, { key: 'district', label: 'District' },
          { key: 'complianceStatus', label: 'Compliance' }, { key: 'riskLevel', label: 'Risk' }, { key: 'openIssues', label: 'Open Issues' },
        ],
        rows: projects.map((p) => ({ ...p, openIssues: (p.issues ?? []).filter((i) => i.status !== 'closed').length })),
      }
    case 'anomaly':
      return {
        columns: [
          { key: 'id', label: 'Alert ID' }, { key: 'projectName', label: 'Project' }, { key: 'metric', label: 'Metric' },
          { key: 'expectedValue', label: 'Expected' }, { key: 'observedValue', label: 'Observed' }, { key: 'riskLevel', label: 'Risk' },
          { key: 'score', label: 'Score' }, { key: 'status', label: 'Status' }, { key: 'detectedDate', label: 'Detected' },
        ],
        rows: alerts.map((a) => ({ ...a })),
      }
    case 'project-monitoring':
    default:
      return {
        columns: [
          { key: 'name', label: 'Project' }, { key: 'organizationName', label: 'Organization' }, { key: 'district', label: 'District' },
          { key: 'schemeName', label: 'Scheme' }, { key: 'status', label: 'Status' }, { key: 'riskLevel', label: 'Risk' },
          { key: 'attendancePercentage', label: 'Attendance %' }, { key: 'cctvStatus', label: 'CCTV' }, { key: 'complianceStatus', label: 'Compliance' }, { key: 'lastInspection', label: 'Last Inspection' },
        ],
        rows: projects.map((p) => ({ ...p })),
      }
  }
}

// --- filter option lists --------------------------------------------------
export async function getReportFilterOptions() {
  await delay(80)
  const uniq = (a) => [...new Set(a)].sort()
  return {
    states: uniq(LOCATIONS.map((l) => l.state)),
    districts: uniq(LOCATIONS.map((l) => l.district)),
    schemes: SCHEMES.map((s) => ({ id: s.id, name: s.name })),
    projects: (await listProjects({ pageSize: 100 })).items.map((p) => ({ id: p.id, name: p.name })),
    organizations: ORGANIZATIONS.map((o) => ({ id: o.id, name: o.name })),
    inspectionStatuses: ['pending', 'assigned', 'scheduled', 'in-progress', 'completed', 'overdue', 'cancelled'],
    riskLevels: ['healthy', 'watch', 'high'],
  }
}

/** Passthrough so the attendance KPI can be shown alongside (real data). */
export { getAttendanceStats }
