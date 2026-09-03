import StatCard from '../../components/officer/StatCard.jsx'
import LiveMonitoringPanel from '../../components/officer/LiveMonitoringPanel.jsx'
import InspectionOverviewPanel from '../../components/officer/InspectionOverviewPanel.jsx'
import AiAlertsPanel from '../../components/officer/AiAlertsPanel.jsx'
import RecentActivityPanel from '../../components/officer/RecentActivityPanel.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { OFFICER_KPIS, LIVE_MONITORING, INSPECTION_OVERVIEW, AI_ALERTS, RECENT_ACTIVITY } from '../../data/officerDashboardData.js'

const KPI_CARDS = [
  { key: 'totalProjects', label: 'Total Projects', accent: '#3a1d70' },
  { key: 'activeProjects', label: 'Active Projects', accent: '#006a61' },
  { key: 'totalInstitutes', label: 'Total Institutes / NGOs', accent: '#3a1d70' },
  { key: 'pendingInspections', label: 'Pending Inspections', accent: '#e2a610' },
  { key: 'completedInspections', label: 'Completed Inspections', accent: '#138808' },
  { key: 'activeAlerts', label: 'Active Alerts', emphasize: true },
]

/**
 * Landed on after Department Officer Login: /officer/dashboard.
 * Content only — chrome (sidebar/top bar) lives in OfficerLayout.
 */
export default function OfficerDashboard() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Department Officer Dashboard</h1>
        <p className="text-sm text-plum-950/60">
          Welcome back, {user?.name ?? 'Officer'} — {user?.role}, {user?.district}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {KPI_CARDS.map(({ key, label, accent, emphasize }) => (
          <StatCard key={key} label={label} value={OFFICER_KPIS[key].value} trend={OFFICER_KPIS[key].trend} accent={accent} emphasize={emphasize} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LiveMonitoringPanel data={LIVE_MONITORING} />
        <InspectionOverviewPanel data={INSPECTION_OVERVIEW} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AiAlertsPanel alerts={AI_ALERTS} />
        <RecentActivityPanel activity={RECENT_ACTIVITY} />
      </div>
    </div>
  )
}
