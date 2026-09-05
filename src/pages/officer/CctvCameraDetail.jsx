import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, MapPin, Building2, FolderKanban, Radio, ShieldCheck, HeartPulse, Clock, PowerOff, Power, ArchiveX, Film, History } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { getCamera, disableCamera, enableCamera, decommissionCamera, getCameraPlaybackTimeline, getCameraEventHistory } from '../../services/cctvService.js'
import VideoPlayer from '../../components/officer/cctv/VideoPlayer.jsx'
import CameraStatusBadge from '../../components/officer/cctv/CameraStatusBadge.jsx'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'
import { ALERT_META } from '../../components/officer/cctv/alertMeta.js'
import { formatDateTime, timeAgo } from '../../components/officer/cctv/time.js'

const SOURCE_LABEL = { rtsp: 'RTSP', webrtc: 'WebRTC' }
const DELIVERY_LABEL = { rtsp: 'HLS (repackaged by gateway)', webrtc: 'WebRTC (relayed by gateway)' }

export default function CctvCameraDetail() {
  const { cameraId } = useParams()
  const { hasPermission } = useAuth()
  const toast = useToast()
  const { data: camera, loading, error, refetch } = useAsync(() => getCamera(cameraId), [cameraId])
  const { data: timeline } = useAsync(() => getCameraPlaybackTimeline(cameraId), [cameraId])
  const { data: history } = useAsync(() => getCameraEventHistory(cameraId), [cameraId])
  const [action, setAction] = useState(null)
  const canManage = hasPermission(PERMISSIONS.CAMERA_DECOMMISSION)

  async function runAction(reason) {
    if (action === 'disable') { await disableCamera(cameraId, reason); toast.success('Camera disabled.') }
    else if (action === 'enable') { await enableCamera(cameraId); toast.success('Camera enabled.') }
    else if (action === 'decommission') { await decommissionCamera(cameraId, reason); toast.success('Camera decommissioned.') }
    setAction(null)
    refetch()
  }

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
        <div className="flex items-center gap-2">
          <CameraStatusBadge status={camera.status} />
          {canManage && camera.status !== 'decommissioned' && (
            <ActionMenu items={[
              { label: 'Disable camera', icon: PowerOff, tone: 'danger', onClick: () => setAction('disable'), hidden: camera.status === 'disabled' },
              { label: 'Enable camera', icon: Power, onClick: () => setAction('enable'), hidden: camera.status !== 'disabled' },
              { label: 'Decommission camera', icon: ArchiveX, tone: 'danger', onClick: () => setAction('decommission') },
            ]} />
          )}
        </div>
      </div>

      {action === 'disable' && (
        <ConfirmActionModal title="Disable camera?" reasonRequired reasonPlaceholder="e.g. under maintenance"
          description={`Temporarily disable ${camera.id}? It stops streaming but historical monitoring events are kept. You can re-enable it later.`}
          confirmLabel="Disable camera" loadingLabel="Disabling…" onConfirm={runAction} onClose={() => setAction(null)} />
      )}
      {action === 'enable' && (
        <ConfirmActionModal title="Enable camera?" description={`Bring ${camera.id} back online?`}
          confirmLabel="Enable" loadingLabel="Enabling…" onConfirm={runAction} onClose={() => setAction(null)} />
      )}
      {action === 'decommission' && (
        <ConfirmActionModal title="Decommission camera?" tone="danger" reasonRequired reasonPlaceholder="e.g. hardware removed from site"
          warning="A decommissioned camera is permanently retired from monitoring."
          description={`Decommission ${camera.id}? Its historical events remain available for audit, but it will no longer be monitored.`}
          confirmLabel="Decommission" loadingLabel="Decommissioning…" onConfirm={runAction} onClose={() => setAction(null)} />
      )}

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

          {/* Recorded playback timeline (deepened Department CCTV) */}
          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950">
              <Film className="h-4 w-4 text-plum-800" aria-hidden="true" /> Recorded Playback
              {timeline && <span className="ml-auto text-[11px] font-normal text-plum-950/45">last 12 h · {timeline.retentionDays}-day retention</span>}
            </h2>
            {!timeline ? (
              <p className="py-4 text-center text-sm text-plum-950/50">Loading timeline…</p>
            ) : (
              <>
                <div className="flex gap-1" role="list" aria-label="Recorded segments">
                  {timeline.segments.map((seg) => {
                    const t = new Date(seg.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    return (
                      <button key={seg.start} type="button" role="listitem" disabled={!seg.available}
                        title={seg.available ? `Play ${t}` : `No footage — gap at ${t}`}
                        onClick={() => seg.available && toast.info(`Prototype: brokered clip for ${t} would play here.`)}
                        className={`h-9 flex-1 rounded ${seg.available ? 'bg-plum-800/80 hover:bg-plum-800' : 'bg-plum-950/10 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(214,38,43,0.25)_4px,rgba(214,38,43,0.25)_8px)]'} disabled:cursor-not-allowed`} />
                    )
                  })}
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-plum-950/45"><span>12h ago</span><span>now</span></div>
                <p className="mt-2 text-[11px] text-plum-950/50">{timeline.note} Red-hatched blocks are gaps (camera offline / unstable).</p>
              </>
            )}
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

          {/* Event history (deepened Department CCTV) */}
          <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><History className="h-4 w-4 text-plum-800" aria-hidden="true" /> Event History</h2>
            {!history ? (
              <p className="py-3 text-center text-sm text-plum-950/50">Loading…</p>
            ) : (
              <ol className="space-y-2.5">
                {history.items.map((e, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${e.severity === 'critical' ? 'bg-[#D6262B]' : e.severity === 'warning' ? 'bg-[#e2a610]' : 'bg-[#138808]'}`} />
                    <div><p className="text-xs font-semibold text-plum-950">{e.event}</p><p className="text-[11px] text-plum-950/50">{formatDateTime(e.at)}</p></div>
                  </li>
                ))}
              </ol>
            )}
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
