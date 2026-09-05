import { Link, useNavigate } from 'react-router-dom'
import { Bell, ClipboardCheck, AlertTriangle, MapPin, Camera, User, ChevronRight, ShieldCheck, CalendarClock, History, ListChecks, Settings, LogOut, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useInspector } from '../../context/InspectorContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { listInspectionsForInspector } from '../../services/inspectionsService.js'
import InspectionCardMobile from '../../components/inspector/InspectionCardMobile.jsx'
import { ROLE_LABELS } from '../../data/rbac.js'

/** Field alerts for the inspector (foundation). */
export function InspectorNotifications() {
  const notes = [
    { id: 1, icon: AlertTriangle, tone: 'warn', title: 'High-risk assignment', body: 'INSP-3007 (NGO Trust Community Outreach) is overdue and high risk.' },
    { id: 2, icon: ClipboardCheck, tone: 'info', title: 'New assignment', body: 'You have been assigned INSP-3005 — Divyang Welfare Assistance.' },
  ]
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">Alerts</h1>
      <ul className="space-y-2">
        {notes.map((n) => {
          const Icon = n.icon
          return (
            <li key={n.id} className="flex gap-3 rounded-2xl border border-plum-950/10 bg-white p-3.5 shadow-sm">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${n.tone === 'warn' ? 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' : 'border-plum-800/20 bg-plum-50 text-plum-800'}`}><Icon className="h-4.5 w-4.5" aria-hidden="true" /></span>
              <div><p className="text-sm font-bold text-plum-950">{n.title}</p><p className="text-sm text-plum-950/70">{n.body}</p></div>
            </li>
          )
        })}
      </ul>
      <p className="flex items-center gap-1.5 text-[11px] text-plum-950/45"><Bell className="h-3.5 w-3.5" aria-hidden="true" /> Shared with the platform notification system.</p>
    </div>
  )
}

/** Inspector profile + account. */
export function InspectorSettings() {
  const { user, role, logout } = useAuth()
  const { inspector } = useInspector()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">Settings</h1>
      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><User className="h-4 w-4 text-plum-800" aria-hidden="true" /> Inspector</h2>
        <dl className="space-y-2.5 text-sm">
          {[['Name', user?.name ?? inspector?.name ?? '—'], ['Inspector ID', user?.employeeId ?? inspector?.id ?? '—'], ['Role', ROLE_LABELS[role] ?? role], ['District', user?.district ?? '—']].map(([k, v]) => (
            <div key={k}><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{k}</dt><dd className="mt-0.5 text-plum-950/85">{v}</dd></div>
          ))}
        </dl>
      </div>
      <button type="button" onClick={logout} className="w-full rounded-xl border border-[#D6262B]/25 py-3 text-sm font-semibold text-[#D6262B] hover:bg-red-50">Sign out</button>
    </div>
  )
}

/** Attendance verification hub — the action itself happens inside an active
 *  inspection's flow, so this guides the inspector there. */
export function InspectorAttendanceVerification() {
  return <InspectorHub icon={MapPin} title="Attendance Verification" body="During an active inspection you verify staff and beneficiary presence on site — counts and roles only, never personal identifiers." cta="Open my assignments" />
}

/** Evidence hub — capture happens within an inspection. */
export function InspectorEvidenceHub() {
  return <InspectorHub icon={Camera} title="Evidence" body="Capture geo-tagged photos and notes from inside an active inspection. Every item is stamped with time, location and your inspector ID." cta="Open my assignments" />
}

/** Scheduled Inspections — upcoming/assigned visits with a date, soonest first. */
export function InspectorScheduled() {
  const { inspector } = useInspector()
  const { data, loading } = useAsync(() => listInspectionsForInspector(inspector.name), [inspector.name])
  const rows = (data ?? [])
    .filter((i) => ['assigned', 'scheduled'].includes(i.status))
    .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">Scheduled Inspections</h1>
      <p className="-mt-2 text-sm text-plum-950/60">Visits assigned to you with a planned date.</p>
      {loading ? (
        <p className="py-8 text-center text-sm text-plum-950/50">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">No scheduled inspections right now.</p>
      ) : (
        <div className="space-y-3">{rows.map((i) => <InspectionCardMobile key={i.id} inspection={i} />)}</div>
      )}
    </div>
  )
}

/** Inspection History — completed visits, most recent first. */
export function InspectorHistory() {
  const { inspector } = useInspector()
  const { data, loading } = useAsync(() => listInspectionsForInspector(inspector.name), [inspector.name])
  const rows = (data ?? [])
    .filter((i) => i.status === 'completed')
    .sort((a, b) => (b.completedDate ?? b.scheduledDate ?? '').localeCompare(a.completedDate ?? a.scheduledDate ?? ''))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">Inspection History</h1>
      <p className="-mt-2 text-sm text-plum-950/60">Your completed inspections and submitted reports.</p>
      {loading ? (
        <p className="py-8 text-center text-sm text-plum-950/50">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">No completed inspections yet.</p>
      ) : (
        <div className="space-y-3">{rows.map((i) => <InspectionCardMobile key={i.id} inspection={i} />)}</div>
      )}
    </div>
  )
}

const CHECKLIST_SECTIONS = [
  { title: 'Attendance & Presence', items: ['Verify staff on-site count against the sanctioned list', 'Verify beneficiary presence against the day’s attendance record', 'Note any discrepancy between the recorded and observed counts'] },
  { title: 'Documents & Records', items: ['Registration and safety certificates present and current', 'Mess / ration registers updated for the current period', 'Enrolment register reconciled with attendance'] },
  { title: 'Infrastructure & Safety', items: ['Building condition and fire-safety provisions', 'Drinking water, sanitation and hostel facilities', 'Accessibility provisions for beneficiaries'] },
  { title: 'Evidence', items: ['Capture geo-tagged photos for each finding', 'Record short notes describing what was observed', 'Confirm each item is time and location stamped'] },
]

/** Inspection Checklist — the standard reference checklist inspectors follow.
 *  The live, per-inspection checklist is completed inside an active visit. */
export function InspectorChecklist() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">Inspection Checklist</h1>
      <p className="-mt-2 text-sm text-plum-950/60">The standard checklist to work through during a visit.</p>
      {CHECKLIST_SECTIONS.map((sec) => (
        <div key={sec.title} className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
          <h2 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-plum-950"><ListChecks className="h-4 w-4 text-plum-800" aria-hidden="true" /> {sec.title}</h2>
          <ul className="space-y-2">
            {sec.items.map((it) => (
              <li key={it} className="flex items-start gap-2.5 text-sm text-plum-950/75">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-plum-950/25" aria-hidden="true" /> {it}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-plum-950/15 bg-white p-5 text-center">
        <p className="max-w-xs text-sm text-plum-950/70">Complete these against a specific assignment to record findings.</p>
        <Link to="/inspector/assignments" className="flex min-h-12 items-center gap-1.5 rounded-xl bg-plum-800 px-5 text-sm font-semibold text-white no-underline hover:bg-plum-700">Open my assignments <ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-plum-950/45"><ShieldCheck className="h-3.5 w-3.5 text-plum-800" aria-hidden="true" /> GPS and photos support a finding; they do not by themselves prove an activity was completed.</p>
    </div>
  )
}

const MORE_LINKS = [
  { to: '/inspector/scheduled', label: 'Scheduled Inspections', icon: CalendarClock },
  { to: '/inspector/checklist', label: 'Inspection Checklist', icon: ListChecks },
  { to: '/inspector/attendance-verification', label: 'Attendance Verification', icon: MapPin },
  { to: '/inspector/evidence', label: 'Evidence', icon: Camera },
  { to: '/inspector/history', label: 'Inspection History', icon: History },
  { to: '/inspector/notifications', label: 'Notifications', icon: Bell },
  { to: '/inspector/settings', label: 'Settings', icon: Settings },
]

/** "More" — the overflow menu holding the inspector's secondary sections,
 *  keeping the bottom tab bar to a thumb-friendly five items. */
export function InspectorMore() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">More</h1>
      <nav className="overflow-hidden rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        {MORE_LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex min-h-14 items-center gap-3 border-b border-plum-950/8 px-4 text-sm font-semibold text-plum-950 no-underline last:border-0 hover:bg-plum-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-plum-50 text-plum-800"><Icon className="h-4.5 w-4.5" aria-hidden="true" /></span>
            {label}
            <ChevronRight className="ml-auto h-4 w-4 text-plum-950/30" aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <button type="button" onClick={() => { logout(); navigate('/inspector/login') }} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#D6262B]/25 text-sm font-semibold text-[#D6262B] hover:bg-red-50">
        <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
      </button>
    </div>
  )
}

function InspectorHub({ icon: Icon, title, body, cta }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-plum-950">{title}</h1>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-50 text-plum-800"><Icon className="h-6 w-6" aria-hidden="true" /></span>
        <p className="max-w-xs text-sm text-plum-950/70">{body}</p>
        <Link to="/inspector/assignments" className="flex min-h-12 items-center gap-1.5 rounded-xl bg-plum-800 px-5 text-sm font-semibold text-white no-underline hover:bg-plum-700">
          {cta} <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-plum-950/45"><ShieldCheck className="h-3.5 w-3.5 text-plum-800" aria-hidden="true" /> Steps are part of the guided inspection workflow.</p>
    </div>
  )
}
