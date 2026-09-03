import BarChart from './BarChart.jsx'

export default function InspectionOverviewPanel({ data }) {
  const chartData = [
    { label: 'Scheduled', value: data.scheduled, color: '#3a1d70' },
    { label: 'In Progress', value: data.inProgress, color: '#e2a610' },
    { label: 'Completed', value: data.completed, color: '#138808' },
    { label: 'Overdue', value: data.overdue, color: '#D6262B' },
  ]

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-bold text-plum-950 sm:text-base">Inspection Overview</h2>
      <BarChart data={chartData} />
    </div>
  )
}
