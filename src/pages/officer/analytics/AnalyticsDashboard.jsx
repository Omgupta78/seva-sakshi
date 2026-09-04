import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowRight, Info } from 'lucide-react'
import { useAsync } from '../../../hooks/useAsync.js'
import { getAlertStats, getChartData, listAlerts } from '../../../services/alertsService.js'
import StatCard from '../../../components/officer/StatCard.jsx'
import BarChart from '../../../components/officer/BarChart.jsx'
import TrendChart from '../../../components/officer/analytics/TrendChart.jsx'
import { RiskBadge } from '../../../components/officer/analytics/Badges.jsx'
import AnalyticsNav from './AnalyticsNav.jsx'

const mean = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0)

export default function AnalyticsDashboard() {
  const { data: stats } = useAsync(() => getAlertStats(), [])
  const { data: charts } = useAsync(() => getChartData(), [])
  const { data: topAlerts } = useAsync(() => listAlerts({ status: 'open' }), [])

  const top = (topAlerts?.items ?? []).slice(0, 5)

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Monitoring &amp; Anomaly Analytics</h1>
        <p className="text-sm text-plum-950/60">Baseline analysis of project monitoring data — surfacing unusual patterns for human review.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        <p><span className="font-semibold text-plum-950">An anomaly is an indicator, not proof.</span> Flags mean a metric deviates from its own history and warrants a look — never that fraud, misconduct, or non-compliance has occurred. Every flag shows the numbers behind it, and the final decision rests with the officer.</p>
      </div>

      <AnalyticsNav />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total Alerts" value={stats?.total ?? '—'} accent="#3a1d70" />
        <StatCard label="Critical" value={stats?.critical ?? '—'} emphasize />
        <StatCard label="High" value={stats?.high ?? '—'} accent="#c2410c" />
        <StatCard label="Medium" value={stats?.medium ?? '—'} accent="#e2a610" />
        <StatCard label="Resolved" value={stats?.resolved ?? '—'} accent="#138808" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Attendance trend" subtitle="30-day average across projects" current={charts ? `${charts.attendance.at(-1)}%` : '—'}>
          {charts && <TrendChart data={charts.attendance} labels={charts.days} color="#3a1d70" baseline={mean(charts.attendance)} suffix="%" />}
        </ChartCard>

        <ChartCard title="CCTV uptime" subtitle="30-day average across projects" current={charts ? `${charts.cctvUptime.at(-1)}%` : '—'}>
          {charts && <TrendChart data={charts.cctvUptime} labels={charts.days} color="#006a61" baseline={mean(charts.cctvUptime)} suffix="%" />}
        </ChartCard>

        <ChartCard title="Inspection trends" subtitle="Current inspections by status">
          {charts && (
            <BarChart data={(charts.inspectionsByStatus ?? []).map((d) => ({
              label: d.label[0].toUpperCase() + d.label.slice(1),
              value: d.value,
              color: d.label === 'overdue' ? '#D6262B' : d.label === 'completed' ? '#138808' : '#3a1d70',
            }))} />
          )}
        </ChartCard>

        <ChartCard title="Compliance trends" subtitle="Compliant vs non-compliant per check">
          {charts && (
            <div className="flex items-end gap-2 pt-2" style={{ height: 120 }}>
              {charts.compliance.map((c, i) => {
                const total = c.compliant + c.nonCompliant || 1
                return (
                  <div key={i} className="flex flex-1 flex-col justify-end" title={`${c.compliant} compliant / ${c.nonCompliant} non-compliant`}>
                    <div className="w-full rounded-t bg-[#D6262B]" style={{ height: `${(c.nonCompliant / total) * 90}px` }} />
                    <div className="w-full rounded-b bg-[#138808]" style={{ height: `${(c.compliant / total) * 90}px` }} />
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-2 flex gap-3 text-[10px] text-plum-950/55">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#138808]" /> Compliant</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#D6262B]" /> Non-compliant</span>
          </div>
        </ChartCard>
      </div>

      {/* Top alerts */}
      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-plum-950"><ShieldAlert className="h-4 w-4 text-[#D6262B]" aria-hidden="true" /> Top open alerts</h2>
          <Link to="/officer/alerts" className="flex items-center gap-1 text-xs font-semibold text-plum-800 no-underline hover:underline">All alerts <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        </div>
        {top.length === 0 ? (
          <p className="py-6 text-center text-sm text-plum-950/50">No open alerts.</p>
        ) : (
          <ul className="space-y-2">
            {top.map((a) => (
              <li key={a.id}>
                <Link to={`/officer/alerts/${a.id}`} className="flex items-center gap-3 rounded-xl border border-plum-950/10 p-3 no-underline transition-colors hover:bg-plum-50/50">
                  <RiskBadge level={a.riskLevel} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-plum-950">{a.projectName} · <span className="font-normal text-plum-950/70">{a.metric}</span></p>
                    <p className="truncate text-xs text-plum-950/60">{a.reason}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-plum-950/70">{a.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, current, children }) {
  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold text-plum-950">{title}</h2>
          <p className="text-[11px] text-plum-950/55">{subtitle}</p>
        </div>
        {current && <span className="text-lg font-extrabold text-plum-950">{current}</span>}
      </div>
      {children}
    </div>
  )
}
