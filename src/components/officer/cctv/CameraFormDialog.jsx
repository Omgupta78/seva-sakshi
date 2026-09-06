import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Dialog from '../Dialog.jsx'
import { registerCamera, updateCamera } from '../../../services/cctvService.js'
import { PROJECTS } from '../../../data/projectsSeedData.js'

const PROTOCOLS = [
  { value: 'rtsp', label: 'RTSP (repackaged to HLS by the gateway)' },
  { value: 'webrtc', label: 'WebRTC (relayed by the gateway)' },
]
const STATUSES = ['online', 'offline', 'warning', 'disabled']

/**
 * Add / edit a camera — CONFIG only. No RTSP URL or credential is collected or
 * stored in the browser; those live on the server-side media gateway. `camera`
 * null = add mode, object = edit mode.
 */
export default function CameraFormDialog({ camera, onClose, onSaved }) {
  const editing = !!camera
  const [form, setForm] = useState({
    label: camera?.label ?? '',
    projectId: camera?.projectId ?? (PROJECTS[0]?.id ?? ''),
    placement: camera?.placement ?? '',
    sourceProtocol: camera?.sourceProtocol ?? 'rtsp',
    resolution: camera?.resolution ?? '1080p',
    status: camera?.status ?? 'online',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault(); setErrors({}); setSaving(true)
    try {
      if (editing) await updateCamera(camera.id, form)
      else await registerCamera(form)
      onSaved()
    } catch (err) { setErrors(err.fieldErrors ?? { label: err.message }); setSaving(false) }
  }

  return (
    <Dialog title={editing ? `Edit ${camera.id}` : 'Add Camera'} size="md" onClose={onClose} footer={
      <>
        <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">Cancel</button>
        <button type="submit" form="camera-form" disabled={saving} className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Register Camera'}</button>
      </>
    }>
      <form id="camera-form" onSubmit={submit} className="space-y-3">
        <Field label="Camera name *" error={errors.label}>
          <input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="e.g. Main Gate" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
        </Field>
        <Field label="Institution / Project *" error={errors.projectId}>
          <select value={form.projectId} onChange={(e) => set('projectId', e.target.value)} disabled={editing} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none disabled:opacity-60">
            {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Placement / area">
          <input value={form.placement} onChange={(e) => set('placement', e.target.value)} placeholder="e.g. Reception, Dining Hall" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source protocol" error={errors.sourceProtocol}>
            <select value={form.sourceProtocol} onChange={(e) => set('sourceProtocol', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">
              {PROTOCOLS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Resolution">
            <select value={form.resolution} onChange={(e) => set('resolution', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">
              {['1080p', '720p', '480p'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        </div>
        {editing && (
          <Field label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm capitalize focus:outline-none">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}
        <p className="flex items-start gap-1.5 rounded-lg bg-plum-50/70 p-2.5 text-[11px] text-plum-950/60">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" />
          RTSP URLs and camera credentials are configured on the server-side media gateway and are never entered or stored here. The browser only ever receives a brokered HLS/WebRTC stream.
        </p>
      </form>
    </Dialog>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-plum-950/70">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-[#D6262B]">{error}</p>}
    </div>
  )
}
