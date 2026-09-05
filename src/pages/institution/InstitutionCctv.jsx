import { useState } from 'react'
import { Video, Radio, ShieldCheck, MapPin, Clock } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { listInstitutionCameras } from '../../services/institutionCctvService.js'
import { STREAM_MODE_LABEL } from '../../services/streamProvider.js'
import VideoPlayer from '../../components/officer/cctv/VideoPlayer.jsx'

const STATUS = {
  online: { label: 'Online', cls: 'border-[#138808]/25 bg-green-50 text-[#16794f]' },
  warning: { label: 'Unstable', cls: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' },
  offline: { label: 'Offline', cls: 'border-[#D6262B]/25 bg-red-50 text-[#b23b3b]' },
}

function lastSeen(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const h = Math.round(mins / 60)
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}

/**
 * Institute CCTV — the institution sees ONLY its own cameras (spec §10). Reuses
 * the shared VideoPlayer (which routes through the StreamProvider facade), so
 * no streaming logic lives here and no RTSP URL/credential ever reaches it.
 * Responsive: player on top, camera list beside/below.
 */
export default function InstitutionCctv() {
  const { data, loading } = useAsync(() => listInstitutionCameras('INST-001'), [])
  const cams = data?.items ?? []
  const [selectedId, setSelectedId] = useState(null)
  const selected = cams.find((c) => c.id === selectedId) ?? cams[0] ?? null

  return (
    <div className="mx-auto max-w-[1200px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">CCTV</h1>
          <p className="text-sm text-plum-950/60">Live view of your institution’s registered cameras.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#e2a610]/35 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-[#a15c00]"><Radio className="h-3 w-3" aria-hidden="true" /> {STREAM_MODE_LABEL} mode</span>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-plum-800/15 bg-plum-50/70 p-3 text-xs text-plum-950/70">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-plum-800" aria-hidden="true" />
        <p>You see only cameras belonging to your institution. Feeds are demo streams — no live government camera or RTSP credential reaches this browser. A camera that is offline is shown as offline, never as a frozen live frame.</p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-plum-950/50">Loading cameras…</p>
      ) : cams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center text-sm text-plum-950/50">No cameras are registered for your institution yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* Selected camera player */}
          <div className="space-y-3">
            {selected && (
              <>
                <VideoPlayer camera={selected} />
                <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-plum-950">{selected.area}</h2>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${(STATUS[selected.status] ?? STATUS.offline).cls}`}>{(STATUS[selected.status] ?? STATUS.offline).label}</span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Camera ID</dt><dd className="mt-0.5 font-mono text-xs text-plum-950/85">{selected.id}</dd></div>
                    <div><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Stream</dt><dd className="mt-0.5 text-plum-950/85 uppercase">{selected.sourceProtocol}</dd></div>
                    <div><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Last seen</dt><dd className="mt-0.5 flex items-center gap-1 text-plum-950/85"><Clock className="h-3.5 w-3.5 text-plum-950/40" aria-hidden="true" />{lastSeen(selected.lastHeartbeat)}</dd></div>
                  </dl>
                </div>
              </>
            )}
          </div>

          {/* Camera list */}
          <div className="space-y-2">
            {cams.map((cam) => {
              const st = STATUS[cam.status] ?? STATUS.offline
              const active = selected?.id === cam.id
              return (
                <button key={cam.id} type="button" onClick={() => setSelectedId(cam.id)} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${active ? 'border-plum-800 bg-plum-50' : 'border-plum-950/10 bg-white hover:bg-plum-50/60'}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-plum-800/10 text-plum-800"><Video className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-plum-950">{cam.area}</span>
                    <span className="flex items-center gap-1 text-[11px] text-plum-950/50"><MapPin className="h-3 w-3" aria-hidden="true" /> {cam.institutionName} · {lastSeen(cam.lastHeartbeat)}</span>
                  </span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
