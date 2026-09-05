import { Bell, AlertTriangle, ClipboardCheck, Info } from 'lucide-react'

const NOTES = [
  { id: 'n1', icon: AlertTriangle, tone: 'warn', title: 'Attendance review needed', body: 'Class 11-A attendance is 76% today — please review the session.', time: '2h ago' },
  { id: 'n2', icon: ClipboardCheck, tone: 'info', title: 'Inspection scheduled', body: 'A departmental inspection (INSP-3004) is scheduled for your institution.', time: '1d ago' },
  { id: 'n3', icon: Info, tone: 'info', title: 'New student added', body: 'A student was added to Class 10-B and awaits face enrolment.', time: '2d ago' },
]

export default function InstitutionNotifications() {
  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Notifications</h1>
        <p className="text-sm text-plum-950/60">Alerts and updates for your institution.</p>
      </div>
      <ul className="space-y-2">
        {NOTES.map((n) => {
          const Icon = n.icon
          return (
            <li key={n.id} className="flex gap-3 rounded-2xl border border-plum-950/10 bg-white p-3.5 shadow-sm">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${n.tone === 'warn' ? 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' : 'border-plum-800/20 bg-plum-50 text-plum-800'}`}><Icon className="h-4.5 w-4.5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-plum-950">{n.title}</p>
                <p className="text-sm text-plum-950/70">{n.body}</p>
                <p className="mt-0.5 text-[11px] text-plum-950/45">{n.time}</p>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="flex items-center gap-1.5 text-[11px] text-plum-950/45"><Bell className="h-3.5 w-3.5" aria-hidden="true" /> Real-time notification delivery is shared with the Department’s notification system.</p>
    </div>
  )
}
