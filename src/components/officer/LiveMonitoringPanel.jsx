import { Video, VideoOff, FolderKanban, Activity } from 'lucide-react'

const STATUS_STYLES = {
  operational: { label: 'Operational', dot: '#138808', text: 'text-[#16794f]' },
  degraded: { label: 'Degraded', dot: '#e2a610', text: 'text-[#a15c00]' },
  down: { label: 'Down', dot: '#D6262B', text: 'text-[#D6262B]' },
}

export default function LiveMonitoringPanel({ data }) {
  const status = STATUS_STYLES[data.status] ?? STATUS_STYLES.operational

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-plum-950 sm:text-base">Live Monitoring</h2>
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${status.text}`}>
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: status.dot }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
          </span>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-green-50 p-3">
          <Video className="h-4.5 w-4.5 text-[#16794f]" aria-hidden="true" />
          <p className="mt-1.5 text-xl font-extrabold text-[#16794f]">{data.camerasOnline}</p>
          <p className="text-[11px] font-medium text-[#16794f]/80">Cameras Online</p>
        </div>
        <div className="rounded-xl bg-red-50 p-3">
          <VideoOff className="h-4.5 w-4.5 text-[#D6262B]" aria-hidden="true" />
          <p className="mt-1.5 text-xl font-extrabold text-[#D6262B]">{data.camerasOffline}</p>
          <p className="text-[11px] font-medium text-[#D6262B]/80">Cameras Offline</p>
        </div>
        <div className="rounded-xl bg-plum-50 p-3">
          <FolderKanban className="h-4.5 w-4.5 text-plum-800" aria-hidden="true" />
          <p className="mt-1.5 text-xl font-extrabold text-plum-800">{data.activeProjects}</p>
          <p className="text-[11px] font-medium text-plum-800/80">Active Projects</p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-xs text-plum-950/60">
        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {data.statusNote}
      </p>
    </div>
  )
}
