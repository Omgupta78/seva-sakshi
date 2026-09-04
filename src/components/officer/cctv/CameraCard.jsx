import { Link } from 'react-router-dom'
import { MapPin, Building2, Play, Activity } from 'lucide-react'
import CameraStatusBadge from './CameraStatusBadge.jsx'
import { formatDateTime, timeAgo } from './time.js'

const THUMB_TINT = {
  online: 'from-[#1e2537] to-[#0b0a14]',
  warning: 'from-[#2a2413] to-[#0b0a14]',
  offline: 'from-[#241417] to-[#0b0a14]',
}

/** One camera in the grid — a compact preview tile plus its vitals. */
export default function CameraCard({ camera }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-plum-950/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className={`relative aspect-video w-full bg-gradient-to-b ${THUMB_TINT[camera.status] ?? THUMB_TINT.online}`}>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.025),rgba(255,255,255,0.025)_1px,transparent_1px,transparent_3px)]" />
        <div className="absolute top-2 left-2">
          <CameraStatusBadge status={camera.status} />
        </div>
        <div className="absolute top-2 right-2 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[10px] text-white/85 backdrop-blur-sm">
          {camera.id}
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 font-mono text-[10px] text-white/70">
          {camera.status === 'online' && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />}
          <span className="rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-sm">{camera.status === 'offline' ? 'No signal' : 'Sample feed'}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <h3 className="text-sm font-bold text-plum-950">{camera.label}</h3>
          <p className="truncate text-xs text-plum-950/60">{camera.projectName}</p>
        </div>

        <dl className="space-y-1 text-xs text-plum-950/70">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-plum-950/40" aria-hidden="true" />
            <span className="truncate">{camera.organizationName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-plum-950/40" aria-hidden="true" />
            <span>{camera.district}, {camera.state}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 shrink-0 text-plum-950/40" aria-hidden="true" />
            <span>Heartbeat {timeAgo(camera.lastHeartbeat)}</span>
          </div>
        </dl>

        <p className="text-[11px] text-plum-950/45">Updated {formatDateTime(camera.lastUpdated)}</p>

        <Link
          to={`/officer/cctv/${camera.id}`}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-plum-800 px-3 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-plum-700"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          View Live
        </Link>
      </div>
    </div>
  )
}
