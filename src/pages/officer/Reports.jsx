import { useState } from 'react'
import { FileBarChart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import {
  REPORT_TYPES, getReportSummary, getReportCharts, getReport, getReportFilterOptions,
} from '../../services/reportsService.js'
import StatCard from '../../components/officer/StatCard.jsx'
import BarChart from '../../components/officer/BarChart.jsx'
import ReportFilters from '../../components/officer/reports/ReportFilters.jsx'
import ReportTable from '../../components/officer/reports/ReportTable.jsx'
import ExportBar from '../../components/officer/reports/ExportBar.jsx'

const DEFAULTS = {
  dateFrom: '', dateTo: '', state: 'all', district: 'all', schemeId: 'all',
  projectId: 'all', organizationId: 'all', inspectionStatus: 'all', riskLevel: 'all',
}

export default function Reports() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(DEFAULTS)
  const [type, setType] = useState('project-monitoring')
  const key = JSON.stringify(filters)

  const { data: options } = useAsync(() => getReportFilterOptions(), [])
  const { data: summary } = useAsync(() => getReportSummary(filters), [key])
  const { data: charts } = useAsync(() => getReportCharts(filters), [key])
  const { data: report, loading, error } = useAsync(() => getReport(type, filters), [type, key])

  const activeType = REPORT_TYPES.find((t) => t.id === type)
  const rows = report?.rows ?? []
  const columns = report?.columns ?? []

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Reports &amp; Analytics</h1>
          <p className="text-sm text-plum-950/60">Generated from live monitoring data · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} · {user?.name ?? 'Officer'}</p>
        </div>
      </div>

      <div className="no-print">
        <ReportFilters filters={filters} onChange={setFilters} options={options} defaults={DEFAULTS} />
      </div>

      {/* KPIs — all computed from filtered data, never hardcoded */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <StatCard label="Total Projects" value={summary?.totalProjects ?? '—'} accent="#3a1d70" />
        <StatCard label="Projects Inspected" value={summary?.projectsInspected ?? '—'} accent="#3a1d70" />
        <StatCard label="Inspection Completion" value={summary ? `${summary.inspectionCompletionPct}%` : '—'} accent="#138808" />
        <StatCard label="Avg Attendance" value={summary ? `${summary.avgAttendance}%` : '—'} accent="#3a1d70" />
        <StatCard label="CCTV Uptime" value={summary ? `${summary.cctvUptimePct}%` : '—'} accent="#006a61" />
        <StatCard label="Open Alerts" value={summary?.openAlerts ?? '—'} emphasize />
        <StatCard label="Compliance" value={summary ? `${summary.compliancePct}%` : '—'} accent="#138808" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Projects by risk">{charts && <BarChart data={charts.projectsByRisk} />}</ChartCard>
        <ChartCard title="Inspections by status">{charts && (charts.inspectionsByStatus.length ? <BarChart data={charts.inspectionsByStatus} /> : <Empty />)}</ChartCard>
        <ChartCard title="CCTV availability">{charts && <BarChart data={charts.cctvByStatus} />}</ChartCard>
      </div>

      {/* Report type selector */}
      <div className="no-print flex gap-1.5 overflow-x-auto rounded-xl border border-plum-950/10 bg-white p-1.5 shadow-sm">
        {REPORT_TYPES.map((t) => (
          <button key={t.id} type="button" onClick={() => setType(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${type === t.id ? 'bg-plum-800 text-white' : 'text-plum-950/70 hover:bg-plum-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Report header + export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-plum-950">
          <FileBarChart className="h-4 w-4 text-plum-800" aria-hidden="true" /> {activeType?.label} Report
          <span className="rounded-full bg-plum-50 px-2 py-0.5 text-xs font-semibold text-plum-800">{rows.length}</span>
        </h2>
        <div className="no-print">
          <ExportBar columns={columns} rows={rows} baseName={type} title={`${activeType?.label} Report`} disabled={loading} />
        </div>
      </div>

      <ReportTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        rowLinkBase={type === 'inspection' ? '/officer/reports/inspection' : undefined}
      />

      {type === 'inspection' && <p className="no-print text-[11px] text-plum-950/50">Select an inspection row to open its printable report.</p>}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-plum-950">{title}</h3>
      {children}
    </div>
  )
}
function Empty() {
  return <p className="py-6 text-center text-xs text-plum-950/40">No data for this filter.</p>
}
