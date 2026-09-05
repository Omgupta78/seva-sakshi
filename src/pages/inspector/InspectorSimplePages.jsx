import { Link } from 'react-router-dom'
import { Bell, ClipboardCheck, AlertTriangle, MapPin, Camera, User, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useInspector } from '../../context/InspectorContext.jsx'
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
