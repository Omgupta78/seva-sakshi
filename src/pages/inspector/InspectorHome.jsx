import { Link } from 'react-router-dom'
import { ClipboardList, CalendarClock, FileClock, CheckCircle2, ChevronRight, Activity, Flame, FileText } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useInspector } from '../../context/InspectorContext.jsx'
import { listInspectionsForInspector } from '../../services/inspectionsService.js'
import InspectionCardMobile from '../../components/inspector/InspectionCardMobile.jsx'

const ACTIVE = ['assigned', 'scheduled', 'in-progress', 'overdue']

function Tile({ icon: Icon, label, value, tone, to }) {
  const body = (
    <>
      <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
      <p className={`mt-1.5 text-2xl font-extrabold ${tone}`}>{value}</p>
      <p className="text-xs leading-snug font-medium text-plum-950/60">{label}</p>
    </>
  )
  const className = 'flex min-h-24 flex-col justify-center rounded-2xl border border-plum-950/10 bg-white p-3.5 no-underline shadow-sm'
  return to ? (
    <Link to={to} className={`${className} active:bg-plum-50`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

export default function InspectorHome() {
  const { inspector } = useInspector()
  const { data, loading } = useAsync(() => listInspectionsForInspector(inspector.name), [inspector.name])

  const inspections = data ?? []
  const today = new Date().toISOString().slice(0, 10)

  const assigned = inspections.filter((i) => ACTIVE.includes(i.status))
  const todays = inspections.filter((i) => i.scheduledDate === today && i.status !== 'cancelled')
  const pending = inspections.filter((i) => ['assigned', 'scheduled', 'overdue'].includes(i.status))
  const inProgress = inspections.filter((i) => i.status === 'in-progress')
  const completed = inspections.filter((i) => i.status === 'completed')
  const highPriority = inspections.filter((i) => i.priority === 'high' && ACTIVE.includes(i.status))
  const recentReports = completed
    .filter((i) => i.report)
    .sort((a, b) => (b.report?.submittedAt ?? '').localeCompare(a.report?.submittedAt ?? ''))
    .slice(0, 3)

  const upNext = [...todays, ...assigned.filter((i) => !todays.some((t) => t.id === i.id))].slice(0, 3)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-plum-950/60">Signed in as</p>
        <h1 className="text-xl font-extrabold text-plum-950">{inspector.name}</h1>
        <p className="text-sm text-plum-950/60">
          {inspector.homeDistrict} · {inspector.expertise.join(', ')}
        </p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-plum-950/50">Loading your worklist…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Tile icon={ClipboardList} label="Assigned Inspections" value={assigned.length} tone="text-plum-800" to="/inspector/inspections" />
            <Tile icon={CalendarClock} label="Today's Inspections" value={todays.length} tone="text-[#a15c00]" to="/inspector/inspections" />
            <Tile icon={FileClock} label="Pending" value={pending.length} tone="text-[#a15c00]" to="/inspector/inspections" />
            <Tile icon={Activity} label="In Progress" value={inProgress.length} tone="text-[#D6262B]" to="/inspector/inspections" />
            <Tile icon={CheckCircle2} label="Completed" value={completed.length} tone="text-[#16794f]" to="/inspector/inspections" />
            <Tile icon={Flame} label="High Priority" value={highPriority.length} tone="text-[#D6262B]" to="/inspector/inspections" />
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-plum-950">Up next</h2>
              <Link to="/inspector/inspections" className="flex items-center gap-0.5 text-sm font-semibold text-plum-800 no-underline">
                View all
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {upNext.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">
                Nothing outstanding — no active inspections assigned to you.
              </p>
            ) : (
              <div className="space-y-3">
                {upNext.map((inspection) => (
                  <InspectionCardMobile key={inspection.id} inspection={inspection} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-plum-950">Recent Inspection Reports</h2>
            {recentReports.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">No submitted reports yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentReports.map((i) => (
                  <li key={i.id}>
                    <Link to={`/inspector/inspections/${i.id}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-plum-950/10 bg-white p-3 no-underline shadow-sm active:bg-plum-50">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#16794f]"><FileText className="h-4.5 w-4.5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-plum-950">{i.projectName}</span>
                        <span className="block text-xs text-plum-950/55">{i.report?.status === 'reviewed' ? 'Reviewed' : i.report?.status === 'correction-requested' ? 'Correction requested' : 'Pending review'} · {i.district}</span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-plum-950/30" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
