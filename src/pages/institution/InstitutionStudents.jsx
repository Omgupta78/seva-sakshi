import { useState } from 'react'
import { Search, UserPlus, PowerOff, Power, Eye } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { listInstitutionStudents, getInstitutionStudent, addInstitutionStudent, setInstitutionStudentStatus, CLASSES } from '../../services/institutionService.js'
import Dialog from '../../components/officer/Dialog.jsx'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'

function Badge({ ok, on, off }) {
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${ok ? 'border-[#138808]/25 bg-green-50 text-[#16794f]' : 'border-gray-300 bg-gray-100 text-gray-600'}`}>{ok ? on : off}</span>
}

export default function InstitutionStudents() {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const canManage = hasPermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  const canDeactivate = hasPermission(PERMISSIONS.STUDENT_DEACTIVATE)
  const [filters, setFilters] = useState({ search: '', cls: 'all', status: 'all' })
  const { data, loading, refetch } = useAsync(() => listInstitutionStudents(filters), [JSON.stringify(filters)])
  const [viewing, setViewing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [statusAction, setStatusAction] = useState(null)
  const rows = data?.items ?? []

  async function runStatus() {
    const { student, to } = statusAction
    await setInstitutionStudentStatus(student.id, to)
    toast.success(`${student.name} ${to === 'active' ? 'reactivated' : 'deactivated'}.`)
    setStatusAction(null)
    refetch()
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Students</h1>
        <p className="text-sm text-plum-950/60">Your institution’s roster, enrolment and attendance status.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-plum-950/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-plum-950/40" aria-hidden="true" />
          <input type="search" placeholder="Search by name or ID…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white py-2 pr-3 pl-9 text-sm focus:outline-none" />
        </div>
        <select value={filters.cls} onChange={(e) => setFilters({ ...filters, cls: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none">
          <option value="all">All Classes</option>{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none">
          <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        {canManage && <button type="button" onClick={() => setAdding(true)} className="ml-auto flex items-center gap-1.5 rounded-lg bg-plum-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-plum-700"><UserPlus className="h-4 w-4" aria-hidden="true" /> Add Student</button>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">ID</th><th className="px-3 py-2.5 font-semibold">Name</th><th className="px-3 py-2.5 font-semibold">Class</th>
              <th className="px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Face Enrolment</th><th className="px-3 py-2.5 font-semibold">Attendance</th><th className="px-3 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-plum-950/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-plum-950/50">No students match these filters.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-plum-950/5 text-plum-950/85 last:border-0">
                <td className="px-3 py-2.5 font-mono text-xs font-semibold text-plum-950">{r.id}</td>
                <td className="px-3 py-2.5 font-semibold text-plum-950">{r.name}</td>
                <td className="px-3 py-2.5">{r.class}</td>
                <td className="px-3 py-2.5"><Badge ok={r.status === 'active'} on="Active" off="Inactive" /></td>
                <td className="px-3 py-2.5"><Badge ok={r.faceEnrolled} on="Enrolled" off="Not enrolled" /></td>
                <td className="px-3 py-2.5"><span className={`font-semibold ${r.attendancePct < 75 ? 'text-[#a15c00]' : 'text-plum-950'}`}>{r.attendancePct}%</span></td>
                <td className="px-3 py-2.5">
                  <ActionMenu items={[
                    { label: 'View', icon: Eye, onClick: () => setViewing(r) },
                    { label: 'Deactivate', icon: PowerOff, tone: 'danger', onClick: () => setStatusAction({ student: r, to: 'inactive' }), hidden: !canDeactivate || r.status !== 'active' },
                    { label: 'Reactivate', icon: Power, onClick: () => setStatusAction({ student: r, to: 'active' }), hidden: !canDeactivate || r.status === 'active' },
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-plum-950/50">Face enrolment status is shown as a flag only — biometric templates are never exposed here.</p>

      {viewing && <StudentDialog id={viewing.id} onClose={() => setViewing(null)} />}
      {adding && <AddStudentDialog onClose={() => setAdding(false)} onAdded={() => { setAdding(false); toast.success('Student added.'); refetch() }} />}
      {statusAction && (
        <ConfirmActionModal
          title={statusAction.to === 'active' ? 'Reactivate student?' : 'Deactivate student?'}
          description={statusAction.to === 'active' ? `Reactivate ${statusAction.student.name}?` : `Mark ${statusAction.student.name} inactive? Their historical attendance is preserved.`}
          confirmLabel={statusAction.to === 'active' ? 'Reactivate' : 'Deactivate'} loadingLabel="Working…"
          onConfirm={runStatus} onClose={() => setStatusAction(null)} />
      )}
    </div>
  )
}

function StudentDialog({ id, onClose }) {
  const { data: s } = useAsync(() => getInstitutionStudent(id), [id])
  return (
    <Dialog title={s ? s.name : 'Student'} size="md" onClose={onClose}>
      {!s ? <p className="text-sm text-plum-950/50">Loading…</p> : (
        <div className="space-y-3">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[['Student ID', s.id], ['Class', s.class], ['Roll No', s.rollNo], ['Status', s.status], ['Face enrolment', s.faceEnrolled ? 'Enrolled' : 'Not enrolled'], ['Attendance', `${s.attendancePct}%`]].map(([k, v]) => (
              <div key={k}><dt className="text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">{k}</dt><dd className="mt-0.5 capitalize text-plum-950/85">{v}</dd></div>
            ))}
          </dl>
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-plum-950/50 uppercase">Attendance history (last 7 days)</p>
            <div className="flex gap-1.5">
              {s.history.map((h) => <span key={h.date} title={`${h.date}: ${h.present ? 'Present' : 'Absent'}`} className={`h-6 flex-1 rounded ${h.present ? 'bg-[#138808]' : 'bg-[#D6262B]/70'}`} />)}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}

function AddStudentDialog({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', class: CLASSES[0], rollNo: '', guardianPhone: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  async function submit(e) {
    e.preventDefault(); setErrors({}); setSaving(true)
    try { await addInstitutionStudent(form); onAdded() }
    catch (err) { setErrors(err.fieldErrors ?? { name: err.message }); setSaving(false) }
  }
  return (
    <Dialog title="Add Student" size="md" onClose={onClose} footer={
      <>
        <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">Cancel</button>
        <button type="submit" form="add-student-form" disabled={saving} className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60">{saving ? 'Saving…' : 'Add Student'}</button>
      </>
    }>
      <form id="add-student-form" onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-950/70">Full name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          {errors.name && <p className="mt-1 text-xs font-medium text-[#D6262B]">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-plum-950/70">Class</label>
            <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-plum-950/70">Roll No</label>
            <input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>
        <p className="text-[11px] text-plum-950/50">Face enrolment is done separately during an attendance session — no biometric data is entered here.</p>
      </form>
    </Dialog>
  )
}
