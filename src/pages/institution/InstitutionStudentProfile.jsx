import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ScanFace, Pencil, ShieldCheck, CalendarDays } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { getInstitutionStudent } from '../../services/institutionService.js'
import { getStudentAttendanceProfile } from '../../services/attendanceSessionsService.js'
import { faceMeta, statusMeta } from '../../components/institution/studentMeta.js'
import FaceEnrollmentDialog from '../../components/institution/FaceEnrollmentDialog.jsx'
import EditStudentDialog from '../../components/institution/EditStudentDialog.jsx'

const RESULT_DOT = { present: 'bg-[#138808]', absent: 'bg-[#D6262B]/70', unknown: 'bg-[#e2a610]', '—': 'bg-plum-950/15' }

export default function InstitutionStudentProfile() {
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const toast = useToast()
  const canManage = hasPermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  const { data: s, loading, refetch } = useAsync(() => getInstitutionStudent(id), [id])
  const { data: att } = useAsync(() => getStudentAttendanceProfile(id).catch(() => null), [id])
  const [enrolling, setEnrolling] = useState(false)
  const [editing, setEditing] = useState(false)

  if (loading) return <p className="py-12 text-center text-sm text-plum-950/50">Loading student…</p>
  if (!s) return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-plum-950/15 bg-white p-10 text-center">
      <p className="text-sm font-semibold text-plum-950">Student not found.</p>
      <Link to="/institution/students" className="mt-2 inline-block text-sm font-semibold text-plum-800 hover:underline">Back to Students</Link>
    </div>
  )

  const fm = faceMeta(s.faceStatus)
  const sm = statusMeta(s.status)
  const initials = s.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="mx-auto max-w-[1000px] space-y-4">
      <Link to="/institution/students" className="inline-flex items-center gap-1 text-sm font-semibold text-plum-800 no-underline hover:underline"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Students</Link>

      <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-plum-800 text-lg font-bold text-white">{initials}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">{s.name}</h1>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${sm.cls}`}>{sm.label}</span>
            </div>
            <p className="text-sm text-plum-950/60">{s.class} · Section {s.section} · Roll {s.rollNo} · <span className="font-mono text-xs">{s.id}</span></p>
          </div>
          {canManage && (
            <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-3 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</button>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {[
            ['Date of birth', s.dob || '—'],
            ['Gender', s.gender || '—'],
            ['Guardian', s.guardianName || '—'],
            ['Contact', s.contact || '—'],
            ['Attendance', `${s.attendancePct}%`],
          ].map(([k, v]) => (
            <div key={k}><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{k}</dt><dd className="mt-0.5 text-plum-950/85">{v}</dd></div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Face enrolment */}
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><ScanFace className="h-4 w-4 text-plum-800" aria-hidden="true" /> Face Enrolment</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-plum-950/55">Status</p>
              <span className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${fm.cls}`}>{fm.label}</span>
            </div>
            {canManage && (
              <button type="button" onClick={() => setEnrolling(true)} className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-plum-700">
                <ScanFace className="h-4 w-4" aria-hidden="true" /> {s.faceStatus === 'enrolled' ? 'Re-enrol Face' : 'Enrol Face'}
              </button>
            )}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] text-plum-950/50"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum-800" aria-hidden="true" /> Prototype enrolment — the biometric template is never displayed or stored in the browser. Recognition is an assist, not the final authority.</p>
        </div>

        {/* Attendance history */}
        <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-plum-950"><CalendarDays className="h-4 w-4 text-plum-800" aria-hidden="true" /> Attendance History</h2>
          {!att ? (
            <p className="py-4 text-center text-sm text-plum-950/50">No attendance records yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['This week', att.weekPct], ['This month', att.monthPct], ['Overall', att.overallPct]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-plum-50/60 py-2.5"><p className="text-lg font-extrabold text-plum-900">{v}%</p><p className="text-[10px] text-plum-950/55">{k}</p></div>
                ))}
              </div>
              <p className="mt-3 mb-1 text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Recent sessions</p>
              <div className="flex flex-wrap gap-1.5">
                {att.history.slice(0, 14).map((h) => (
                  <span key={h.sessionId} title={`${h.date}: ${h.result}`} className={`h-6 w-6 rounded ${RESULT_DOT[h.result] ?? 'bg-plum-950/15'}`} />
                ))}
                {att.history.length === 0 && <span className="text-sm text-plum-950/50">No sessions recorded.</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {enrolling && <FaceEnrollmentDialog student={s} onClose={() => setEnrolling(false)} onEnrolled={() => { refetch(); toast.success(`${s.name} face-enrolled.`) }} />}
      {editing && <EditStudentDialog student={s} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); refetch(); toast.success('Student updated.') }} />}
    </div>
  )
}
