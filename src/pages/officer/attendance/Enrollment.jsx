import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UserPlus, Camera, Check, ScanFace, CircleCheck } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useAsync } from '../../../hooks/useAsync.js'
import { listProjects } from '../../../services/projectsService.js'
import {
  createStudent, getStudent, startEnrollment, captureEnrollmentSample, finalizeEnrollment, cancelEnrollment,
} from '../../../services/attendanceService.js'
import { DEPARTMENTS, STUDENT_STATUS, ATTENDANCE_CONFIG, statusTitle } from '../../../data/attendanceModels.js'
import CameraCapture from '../../../components/officer/attendance/CameraCapture.jsx'
import ConsentNotice from '../../../components/officer/attendance/ConsentNotice.jsx'
import DemoScenarioSelect from '../../../components/officer/attendance/DemoScenarioSelect.jsx'

export default function Enrollment() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const preStudentId = params.get('student')

  const [phase, setPhase] = useState('profile') // profile | consent | capture | done
  const [student, setStudent] = useState(null)
  const [consent, setConsent] = useState(false)

  const { data: projectData } = useAsync(() => listProjects({ pageSize: 100 }), [])
  const projects = projectData?.items ?? []

  // If arriving with ?student=ID, load that profile and skip creation.
  useEffect(() => {
    if (!preStudentId) return
    getStudent(preStudentId).then((s) => { setStudent(s); setPhase('consent') }).catch(() => {})
  }, [preStudentId])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Steps phase={phase} />

      {phase === 'profile' && <ProfileStep projects={projects} onCreated={(s) => { setStudent(s); setPhase('consent') }} />}

      {phase === 'consent' && student && (
        <div className="space-y-4">
          <ProfileCard student={student} />
          <ConsentNotice checked={consent} onChange={setConsent} retentionDays={ATTENDANCE_CONFIG.retentionDays} />
          <div className="flex gap-2">
            <button type="button" disabled={!consent} onClick={() => setPhase('capture')} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-50">
              <Camera className="h-4 w-4" aria-hidden="true" /> Proceed to face capture
            </button>
            <Link to="/officer/attendance/students" className="rounded-lg border border-plum-950/15 px-4 py-2.5 text-sm font-semibold text-plum-800 no-underline hover:bg-plum-50">Cancel</Link>
          </div>
        </div>
      )}

      {phase === 'capture' && student && (
        <CaptureStep student={student} onDone={() => setPhase('done')} onBack={() => setPhase('consent')} />
      )}

      {phase === 'done' && student && (
        <div className="rounded-2xl border border-[#138808]/25 bg-green-50/60 p-6 text-center">
          <CircleCheck className="mx-auto mb-2 h-10 w-10 text-[#138808]" aria-hidden="true" />
          <h2 className="text-lg font-bold text-plum-950">{student.name} enrolled</h2>
          <p className="mt-1 text-sm text-plum-950/65">The biometric template is stored securely. It is never shown or exported, and can be deleted anytime from the Students tab.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link to="/officer/attendance/students" className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-plum-700">Back to Students</Link>
            <Link to="/officer/attendance/live" className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-800 no-underline hover:bg-plum-50">
              <ScanFace className="h-4 w-4" aria-hidden="true" /> Go to Live
            </Link>
          </div>
        </div>
      )}

      {/* Officer context (who is enrolling) */}
      <p className="text-[11px] text-plum-950/45">Enrolling officer: {user?.name ?? 'Authorised officer'} ({user?.employeeId ?? '—'})</p>
    </div>
  )
}

function Steps({ phase }) {
  const order = ['profile', 'consent', 'capture', 'done']
  const labels = { profile: 'Profile', consent: 'Consent', capture: 'Face Capture', done: 'Done' }
  const idx = order.indexOf(phase)
  return (
    <ol className="flex items-center gap-2 text-xs">
      {order.map((k, i) => (
        <li key={k} className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${i < idx ? 'bg-[#138808] text-white' : i === idx ? 'bg-plum-800 text-white' : 'bg-plum-950/10 text-plum-950/40'}`}>
            {i < idx ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
          </span>
          <span className={i === idx ? 'font-semibold text-plum-950' : 'text-plum-950/50'}>{labels[k]}</span>
          {i < order.length - 1 && <span className="mx-1 h-px w-5 bg-plum-950/15" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  )
}

function ProfileStep({ projects, onCreated }) {
  const [form, setForm] = useState({ id: '', name: '', projectId: '', department: DEPARTMENTS[0], status: 'active' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const org = useMemo(() => projects.find((p) => p.id === form.projectId)?.organizationName ?? '—', [projects, form.projectId])

  async function submit(e) {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      const created = await createStudent({ ...form, organizationId: projects.find((p) => p.id === form.projectId)?.organizationId })
      onCreated(created)
    } catch (err) {
      setErrors(err.fieldErrors ?? { name: 'Could not create profile.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-plum-950/10 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-1.5 text-sm font-bold text-plum-950"><UserPlus className="h-4 w-4 text-plum-800" aria-hidden="true" /> Beneficiary / Student profile</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Beneficiary ID" hint="Leave blank to auto-generate" error={errors.id}>
          <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. BEN-5007" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
        </Field>
        <Field label="Full name" error={errors.name}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
        </Field>
        <Field label="Project" error={errors.projectId}>
          <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">
            <option value="" disabled>Select…</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Organization (auto)">
          <input value={org} readOnly className="w-full rounded-lg border border-plum-950/10 bg-plum-50/40 px-3 py-2 text-sm text-plum-950/70" />
        </Field>
        <Field label="Department" error={errors.department}>
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">
            {STUDENT_STATUS.map((s) => <option key={s} value={s}>{statusTitle(s)}</option>)}
          </select>
        </Field>
      </div>
      <button type="submit" disabled={saving} className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-60">
        {saving ? 'Saving…' : 'Save & continue'}
      </button>
    </form>
  )
}

function ProfileCard({ student }) {
  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span><span className="text-plum-950/50">Name:</span> <span className="font-semibold text-plum-950">{student.name}</span></span>
        <span><span className="text-plum-950/50">ID:</span> <span className="font-mono text-xs">{student.id}</span></span>
        <span><span className="text-plum-950/50">Project:</span> {student.projectName}</span>
        <span><span className="text-plum-950/50">Dept:</span> {student.department}</span>
      </div>
    </div>
  )
}

function CaptureStep({ student, onDone, onBack }) {
  const required = ATTENDANCE_CONFIG.samplesRequired
  const [collected, setCollected] = useState(0)
  const [ready, setReady] = useState(false) // camera live or sim
  const [simMode, setSimMode] = useState(false)
  const [scenario, setScenario] = useState({ scenario: 'one' })
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  useEffect(() => {
    startEnrollment(student.id)
    return () => { cancelEnrollment(student.id) }
  }, [student.id])

  async function capture() {
    setBusy(true)
    try {
      const res = await captureEnrollmentSample(student.id, scenario)
      setCollected(res.collected)
      setFeedback(res)
    } finally {
      setBusy(false)
    }
  }

  async function finish() {
    setFinalizing(true)
    try {
      await finalizeEnrollment(student.id)
      onDone()
    } catch {
      setFeedback({ ok: false, reason: 'Could not finalise — need enough good samples.' })
    } finally {
      setFinalizing(false)
    }
  }

  const canCapture = (ready || simMode) && collected < required && !busy
  const canFinish = collected >= required && !finalizing

  return (
    <div className="space-y-4">
      <CameraCapture
        onStatusChange={(s) => setReady(s === 'live')}
        onUseSimulation={() => setSimMode(true)}
      />

      {simMode && <p className="rounded-lg bg-plum-50 p-2 text-[11px] text-plum-950/60">Camera unavailable — running in demo simulation. No real image is captured.</p>}

      <DemoScenarioSelect mode="enroll" value={scenario} onChange={setScenario} />

      {/* Progress */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-plum-950">Samples captured</span>
          <span className="text-plum-950/60">{collected} / {required}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-plum-950/10">
          <div className="h-full rounded-full bg-[#138808]" style={{ width: `${Math.round((collected / required) * 100)}%` }} />
        </div>
      </div>

      {feedback && (
        <p className={`rounded-lg p-2.5 text-sm ${feedback.ok ? 'bg-green-50 text-[#16794f]' : 'bg-amber-50 text-[#a15c00]'}`}>
          {feedback.ok ? `Good sample captured (quality ${(feedback.quality ?? 0).toFixed(2)}).` : feedback.reason}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={capture} disabled={!canCapture} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-50">
          <Camera className="h-4 w-4" aria-hidden="true" /> Capture sample
        </button>
        <button type="button" onClick={finish} disabled={!canFinish} className="flex items-center gap-1.5 rounded-lg bg-[#138808] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f6b06] disabled:opacity-40">
          <Check className="h-4 w-4" aria-hidden="true" /> Complete enrollment
        </button>
        <button type="button" onClick={onBack} className="rounded-lg border border-plum-950/15 px-4 py-2.5 text-sm font-semibold text-plum-800 hover:bg-plum-50">Back</button>
      </div>
      <p className="text-[11px] text-plum-950/45">Capture {required} good samples of a single face. Multiple faces or low-quality frames are rejected. Embeddings are generated and stored securely — they are never shown here.</p>
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-plum-950/70">{label}{hint && <span className="ml-1 font-normal text-plum-950/40">— {hint}</span>}</label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-[#D6262B]">{error}</p>}
    </div>
  )
}
