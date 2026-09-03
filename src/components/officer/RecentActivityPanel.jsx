import { UserPlus, FileCheck, VideoOff, AlertTriangle, Camera } from 'lucide-react'

const ICONS = { assignment: UserPlus, report: FileCheck, cctv: VideoOff, anomaly: AlertTriangle, evidence: Camera }
const ICON_STYLE = {
  assignment: 'text-plum-800 bg-plum-50',
  report: 'text-[#16794f] bg-green-50',
  cctv: 'text-[#D6262B] bg-red-50',
  anomaly: 'text-[#a15c00] bg-amber-50',
  evidence: 'text-plum-800 bg-plum-50',
}

export default function RecentActivityPanel({ activity }) {
  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-bold text-plum-950 sm:text-base">Recent Activity</h2>
      <ul className="space-y-2">
        {activity.map((item) => {
          const Icon = ICONS[item.type] ?? FileCheck
          return (
            <li key={item.id} className="flex items-start gap-2.5 text-sm">
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ICON_STYLE[item.type]}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-plum-950">
                  <span className="font-semibold">{item.actor}</span> {item.text}
                </span>
                <span className="block text-xs text-plum-950/45">{item.time}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
