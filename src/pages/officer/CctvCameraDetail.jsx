import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, MapPin, Building2, FolderKanban, Radio, ShieldCheck, HeartPulse, Clock } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { getCamera } from '../../services/cctvService.js'
import VideoPlayer from '../../components/officer/cctv/VideoPlayer.jsx'
import CameraStatusBadge from '../../components/officer/cctv/CameraStatusBadge.jsx'
import { ALERT_META } from '../../components/officer/cctv/alertMeta.js'
import { formatDateTime, timeAgo } from '../../components/officer/cctv/time.js'

const SOURCE_LABEL = { rtsp: 'RTSP', webrtc: 'WebRTC' }
const DELIVERY_LABEL = { rtsp: 'HLS (repackaged by gateway)', webrtc: 'WebRTC (relayed by gateway)' }

export default function CctvCameraDetail() {
  const { cameraId } = useParams()
  const { data: camera, loading, error } = useAsync(() => getCamera(cameraId), [cameraId])

  if (loading) return <p className="py-12 text-center text-sm text-plum-950/50">Loading camera…</p>
  if (error || !camera) {
    return (
      <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-plum-950">Camera not found.</p>
        <Link to="/officer/cctv" className="mt-2 inline-block text-sm text-plum-800">Back to CCTV monitoring</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Link to="/officer/cctv" className="inline-flex items-center gap-1 text-sm font-semibold text-plum-800 no-underline hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> CCTV Monitoring
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{camera.label}</h1>
          <p className="font-mono text-xs text-plum-950/55">{camera.id} · {camera.projectName}</p>
        </div>
        <CameraStatusBadge status={camera.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Player + connection */}
        <div className="space-y-4">
          <VideoPlayer camera={camera} />

          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950">
              <Radio className="h-4 w-4 text-plum-800" aria-hidden="true" /> Connection Status
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Field label="Live status"><CameraStatusBadge status={camera.status} /></Field>
              <Field label="Source protocol">{SOURCE_LABEL[camera.sourceProtocol] ?? camera.sourceProtocol}</Field>
              <Field label="Delivered to browser as">{DELIVERY_LABEL[camera.sourceProtocol] ?? 'HLS'}</Field>
              <Field label="Resolution / FPS">{camera.resolution} · {camera.fps} fps</Field>
            </dl>
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-plum-50/70 p-2.5 text-[11px] text-plum-950/60">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
              The raw {SOURCE_LABEL[camera.sourceProtocol] ?? 'source'} URL and camera credentials stay on the server-side gateway
              and are never sent to the browser. The player receives only a short-lived, per-session playback token.
            </p>
          </div>
        </div>

        {/* Side info */}
        <div className="space-y-4">
          <InfoCard icon={FolderKanban} title="Project Information">
            <Field label="Project">
              <Link to={`/officer/projects/${camera.projectId}`} className="text-plum-800 hover:underline">{camera.projectName}</Link>
            </Field>
            <Field label="Project ID"><span className="font-mono text-xs">{camera.projectId}</span></Field>
          </InfoCard>

          <InfoCard icon={Building2} title="Organization & Location">
            <Field label="Organization">{camera.organizationName}</Field>
            <Field label="Location">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-plum-950/40" aria-hidden="true" />{camera.district}, {camera.state}</span>
            </Field>
          </InfoCard>

          <InfoCard icon={Radio} title="Camera Information">
            <Field label="Camera ID"><span className="font-mono text-xs">{camera.id}</span></Field>
            <Field label="Placement">{camera.placement}</Field>
            <Field label="Installed on">{camera.installedOn}</Field>
            <Field label="Last heartbeat">
              <span className="inline-flex items-center gap-1"><HeartPulse className="h-3.5 w-3.5 text-plum-950/40" aria-hidden="true" />{timeAgo(camera.lastHeartbeat)}</span>
            </Field>
            <Field label="Last updated">
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-plum-950/40" aria-hidden="true" />{formatDateTime(camera.lastUpdated)}</span>
            </Field>
          </InfoCard>

          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-sm font-bold text-plum-950">Recent Alerts</h2>
            {camera.alerts.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2.5 text-xs text-[#16794f]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> No connectivity alerts — camera is healthy.
              </div>
            ) : (
              <ul className="space-y-2">
                {camera.alerts.map((a) => {
                  const meta = ALERT_META[a.type] ?? ALERT_META['connection-unstable']
                  const Icon = meta.icon
                  return (
                    <li key={a.id} className={`flex items-start gap-2 rounded-lg border p-2.5 ${a.severity === 'critical' ? 'border-[#D6262B]/20 bg-red-50' : 'border-[#e2a610]/25 bg-amber-50'}`}>
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${a.severity === 'critical' ? 'text-[#D6262B]' : 'text-[#a15c00]'}`} aria-hidden="true" />
                      <div>
                        <p className="text-xs font-bold text-plum-950">{meta.label}</p>
                        <p className="text-xs text-plum-950/70">{a.message}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-plum-950/45">Connectivity and device-health alerts only — no video-content analysis.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950">
        <Icon className="h-4 w-4 text-plum-800" aria-hidden="true" />
        {title}
      </h2>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-plum-950/85">{children}</dd>
    </div>
  )
}
