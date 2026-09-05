import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ScanFace, CheckCircle2, UserCheck, UserX, HelpCircle, Send, Loader2, ShieldCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import {
  getAttendanceSession, startAttendanceSession, runRecognition, correctResult, submitAttendanceSession, SESSION_TYPES,
} from '../../services/attendanceSessionsService.js'
import CameraCapture from '../../components/officer/attendance/CameraCapture.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'

const RESULT_STYLE = {
  present: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  absent: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
  unknown: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
}

export default function InstitutionAttendanceSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const toast = useToast()
  const canCorrect = hasPermission(PERMISSIONS.ATTENDANCE_CORRECT)
  const { data: session, loading, refetch } = useAsync(() => getAttendanceSession(id), [id])
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(null)
  const [correcting, setCorrecting] = useState(null) // { student, to }
  const [submitting, setSubmitting] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)

  if (loading) return <p className="py-12 text-center text-sm text-plum-950/50">Loading session…</p>
  if (!session) return <div className="rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center"><p className="text-sm font-semibold text-plum-950">Session not found.</p></div>

  const typeLabel = SESSION_TYPES.find((t) => t.id === session.sessionType)?.label ?? session.sessionType
  const captured = session.status === 'review' || session.status === 'submitted'
  const submitted = session.status === 'submitted'

  async function capture() {
    setBusy('recognize')
    try { await startAttendanceSession(id); await runRecognition(id); refetch() }
    finally { setBusy(null) }
  }

  async function runCorrection(reason) {
    await correctResult(id, correcting.student.studentId, correcting.to, reason)
    setCorrecting(null); refetch()
  }

  async function doSubmit(override) {
    setSubmitting(true)
    try {
      await submitAttendanceSession(id, { override })
      toast.success(`Attendance submitted for ${session.class}.`)
      setSubmitOpen(false)
      navigate('/institution/attendance')
    } catch (e) {
      toast.error(e.message ?? 'Could not submit attendance.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link to="/institution/attendance" className="inline-flex items-center gap-1 text-sm font-semibold text-plum-800 no-underline hover:underline"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Attendance</Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{session.class} · {typeLabel}</h1>
          <p className="text-sm text-plum-950/60">{session.date} · {session.startTime} · {session.total} students · Teacher {session.teacher}</p>
        </div>
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${submitted ? 'border-[#138808]/25 bg-green-50 text-[#16794f]' : 'border-plum-800/20 bg-plum-50 text-plum-800'}`}>{session.status}</span>
      </div>

      {/* Step 1: capture */}
      {!captured && (
        <div className="space-y-3">
          <CameraCapture onStatusChange={(s) => setReady(s === 'live')} onUseSimulation={() => setReady(true)} />
          <button type="button" onClick={capture} disabled={!ready || busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-plum-800 py-3 text-sm font-semibold text-white hover:bg-plum-700 disabled:opacity-50 sm:w-auto sm:px-6">
            {busy === 'recognize' ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Recognising faces…</> : <><ScanFace className="h-4 w-4" aria-hidden="true" /> Capture &amp; Recognise</>}
          </button>
          <p className="flex items-start gap-1.5 text-[11px] text-plum-950/55"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> Face recognition assists this session. Confidence is shown per student and every result can be reviewed — the teacher makes the final decision.</p>
        </div>
      )}

      {/* Step 2: review */}
      {captured && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Count label="Present" value={session.present} tone="green" icon={UserCheck} />
            <Count label="Absent" value={session.absent} tone="red" icon={UserX} />
            <Count label="Unknown / Unresolved" value={session.unknown} tone="amber" icon={HelpCircle} />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
                  <th className="px-3 py-2.5 font-semibold">Student</th><th className="px-3 py-2.5 font-semibold">AI Result</th><th className="px-3 py-2.5 font-semibold">Confidence</th><th className="px-3 py-2.5 font-semibold">Final</th>{!submitted && <th className="px-3 py-2.5 font-semibold">Review</th>}
                </tr>
              </thead>
              <tbody>
                {session.students.map((st) => (
                  <tr key={st.studentId} className={`border-b border-plum-950/5 last:border-0 ${st.result === 'unknown' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-3 py-2.5 font-semibold text-plum-950">{st.name}<span className="ml-1 font-mono text-[10px] text-plum-950/40">{st.studentId}</span></td>
                    <td className="px-3 py-2.5"><span className="capitalize text-plum-950/70">{st.original ?? st.result}</span></td>
                    <td className="px-3 py-2.5 font-mono text-xs">{st.confidence != null ? `${st.confidence}%` : '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${RESULT_STYLE[st.result] ?? ''}`}>{st.result}</span>
                      {st.corrected && <span className="ml-1 text-[10px] text-plum-950/45">· corrected</span>}
                    </td>
                    {!submitted && (
                      <td className="px-3 py-2.5">
                        {canCorrect ? (
                          <div className="flex gap-1">
                            {st.result !== 'present' && <button type="button" onClick={() => setCorrecting({ student: st, to: 'present' })} className="rounded-lg border border-[#138808]/30 px-2 py-1 text-xs font-semibold text-[#16794f] hover:bg-green-50">Present</button>}
                            {st.result !== 'absent' && <button type="button" onClick={() => setCorrecting({ student: st, to: 'absent' })} className="rounded-lg border border-[#D6262B]/25 px-2 py-1 text-xs font-semibold text-[#D6262B] hover:bg-red-50">Absent</button>}
                          </div>
                        ) : <span className="text-xs text-plum-950/40">—</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!submitted && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[11px] text-plum-950/55"><HelpCircle className="h-3.5 w-3.5 text-[#a15c00]" aria-hidden="true" /> Resolve unknown cases before submitting. Changing an AI result requires a reason.</p>
              <button type="button" onClick={() => setSubmitOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-[#138808] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f6b06]"><Send className="h-4 w-4" aria-hidden="true" /> Submit Attendance</button>
            </div>
          )}
          {submitted && (
            <div className="flex items-center gap-2 rounded-xl border border-[#138808]/25 bg-green-50 p-3 text-sm text-[#16794f]"><CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" /> Attendance submitted. The Department can now see the aggregated result for {session.class}.</div>
          )}
        </>
      )}

      {correcting && (
        <ConfirmActionModal
          title={`Mark ${correcting.student.name} ${correcting.to}?`}
          description={`Change the recognition result for ${correcting.student.name} to "${correcting.to}". The original AI result is preserved in the audit trail.`}
          reasonRequired reasonPlaceholder="e.g. Student not physically present during session"
          confirmLabel="Save" loadingLabel="Saving…" onConfirm={runCorrection} onClose={() => setCorrecting(null)} />
      )}

      {submitOpen && (
        <SubmitConfirm session={session} submitting={submitting} onSubmit={doSubmit} onClose={() => setSubmitOpen(false)} />
      )}
    </div>
  )
}

function Count({ label, value, tone, icon: Icon }) {
  const c = { green: 'text-[#16794f]', red: 'text-[#D6262B]', amber: 'text-[#a15c00]' }[tone]
  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 text-center shadow-sm">
      <Icon className={`mx-auto mb-1 h-5 w-5 ${c}`} aria-hidden="true" />
      <p className={`text-2xl font-extrabold ${c}`}>{value}</p>
      <p className="text-[11px] font-semibold tracking-wide text-plum-950/55 uppercase">{label}</p>
    </div>
  )
}

function SubmitConfirm({ session, submitting, onSubmit, onClose }) {
  const [override, setOverride] = useState(false)
  const unresolved = session.unknown
  return (
    <ConfirmActionModal
      title={`Submit attendance for ${session.class}?`}
      description={`${session.total} students · ${session.present} Present · ${session.absent} Absent${unresolved ? ` · ${unresolved} Unresolved` : ''}. Once submitted, the result is visible to the Department and feeds AI analytics.`}
      warning={unresolved ? `${unresolved} unresolved case(s) remain. Submitting requires an authorised override.` : undefined}
      confirmLabel="Submit Attendance" loadingLabel="Submitting…"
      onConfirm={() => onSubmit(override)}
      onClose={submitting ? () => {} : onClose}
    >
      {unresolved > 0 && (
        <label className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-[#a15c00]">
          <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} className="mt-0.5 h-4 w-4" />
          Authorised override — submit with {unresolved} unresolved case(s). This is recorded in the audit trail.
        </label>
      )}
    </ConfirmActionModal>
  )
}
