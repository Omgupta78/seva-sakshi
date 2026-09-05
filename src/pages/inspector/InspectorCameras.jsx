import { useState } from 'react'
import { Video, VideoOff, Radio, Camera, ShieldCheck, Loader2, CheckCircle2, MapPin } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useToast } from '../../context/ToastContext.jsx'
import { listInstitutionCameras, attachCameraEvidence, listCameraEvidence } from '../../services/institutionCctvService.js'

const STATUS = {
  online: { label: 'Online', cls: 'border-[#138808]/25 bg-green-50 text-[#16794f]' },
  warning: { label: 'Unstable', cls: 'border-[#e2a610]/35 bg-amber-50 text-[#a15c00]' },
  offline: { label: 'Offline', cls: 'border-[#D6262B]/25 bg-red-50 text-[#b23b3b]' },
}
const INSPECTION_ID = 'INSP-3005'

/**
 * Inspector site-camera view (mobile-first). Shows cameras ONLY for the
 * assigned institution and lets the inspector attach a camera snapshot as
 * evidence. No real feed is connected — online tiles show a labelled prototype
 * placeholder, offline tiles say so honestly.
 */
export default function InspectorCameras() {
  const toast = useToast()
  const { data, loading } = useAsync(() => listInstitutionCameras('INST-001'), [])
  const { data: ev, refetch: refetchEv } = useAsync(() => listCameraEvidence(INSPECTION_ID), [])
  const [capturing, setCapturing] = useState(null)

  const cams = data?.items ?? []
  const evidence = ev?.items ?? []

  async function capture(cam) {
    setCapturing(cam.id)
    try {
      await attachCameraEvidence({ inspectionId: INSPECTION_ID, cameraId: cam.id, area: cam.area, note: `Snapshot at ${cam.area}.` })
      toast.success(`Snapshot from ${cam.area} attached as evidence.`)
      refetchEv()
    } catch (e) { toast.error(e.message ?? 'Could not attach evidence.') }
    finally { setCapturing(null) }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-plum-950">Site Cameras</h1>
        <p className="text-sm text-plum-950/60">{data?.institutionName ?? 'Assigned institution'} · assigned inspection only.</p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-plum-800/20 bg-plum-50/60 p-2.5 text-[11px] text-plum-950/70">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> You can view cameras only for institutions assigned to your inspection.
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-plum-950/50">Loading cameras…</p>
      ) : cams.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-6 text-center text-sm text-plum-950/50">No cameras registered for this institution.</p>
      ) : (
        <div className="space-y-3">
          {cams.map((cam) => {
            const st = STATUS[cam.status] ?? STATUS.offline
            return (
              <div key={cam.id} className="overflow-hidden rounded-2xl border border-plum-950/10 bg-white shadow-sm">
                {/* Live placeholder surface */}
                <div className="relative flex aspect-video w-full items-center justify-center bg-[#0b0a14]">
                  {cam.status === 'offline' ? (
                    <div className="flex flex-col items-center gap-1.5 text-white/60"><VideoOff className="h-8 w-8" aria-hidden="true" /><p className="text-xs">Camera offline — no live source</p></div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center gap-1.5 text-white/70"><Video className="h-8 w-8" aria-hidden="true" /><p className="text-xs">Prototype view — no gateway connected</p></div>
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-[#D6262B] px-2 py-0.5 text-[10px] font-bold text-white"><Radio className="h-3 w-3" aria-hidden="true" /> LIVE (demo)</span>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-plum-950">{cam.area}</p>
                    <p className="font-mono text-[10px] text-plum-950/45">{cam.id} · {cam.resolution} · {cam.fps} fps{cam.covers.length ? ` · covers ${cam.covers.join(', ')}` : ''}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                </div>
                <div className="border-t border-plum-950/8 p-2.5">
                  <button type="button" onClick={() => capture(cam)} disabled={capturing === cam.id || cam.status === 'offline'} className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-plum-800 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-50">
                    {capturing === cam.id ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Attaching…</> : <><Camera className="h-4 w-4" aria-hidden="true" /> Capture snapshot as evidence</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {evidence.length > 0 && (
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-plum-950">Captured evidence ({evidence.length})</h2>
          <ul className="space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-start gap-2 rounded-lg border border-plum-950/10 p-2.5 text-xs">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#138808]" aria-hidden="true" />
                <div><p className="font-semibold text-plum-950">{e.area} · {e.cameraId}</p><p className="text-plum-950/60">{e.note}</p><p className="text-[10px] text-plum-950/40">{new Date(e.at).toLocaleString()}</p></div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[11px] text-plum-950/45"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> Prototype — no camera feed or RTSP credential reaches this device. A snapshot supports a finding; it does not by itself prove an activity occurred.</p>
    </div>
  )
}
