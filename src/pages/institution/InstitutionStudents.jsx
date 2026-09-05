import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, PowerOff, Power, Eye, Pencil, ScanFace } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { PERMISSIONS } from '../../data/rbac.js'
import { listInstitutionStudents, addInstitutionStudent, setInstitutionStudentStatus, CLASSES } from '../../services/institutionService.js'
import { sectionOf } from '../../data/institutionData.js'
import Dialog from '../../components/officer/Dialog.jsx'
import ActionMenu from '../../components/officer/ActionMenu.jsx'
import ConfirmActionModal from '../../components/officer/ConfirmActionModal.jsx'
import EditStudentDialog from '../../components/institution/EditStudentDialog.jsx'
import { faceMeta, statusMeta } from '../../components/institution/studentMeta.js'

export default function InstitutionStudents() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const toast = useToast()
  const canManage = hasPermission(PERMISSIONS.MANAGE_BIOMETRIC_ENROLLMENT)
  const canDeactivate = hasPermission(PERMISSIONS.STUDENT_DEACTIVATE)
  const [filters, setFilters] = useState({ search: '', cls: 'all', status: 'all' })
  const { data, loading, refetch } = useAsync(() => listInstitutionStudents(filters), [JSON.stringify(filters)])
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
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
        <select value={filters.cls} onChange={(e) => setFilters({ ...filters, cls: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none" aria-label="Filter by class">
          <option value="all">All Classes</option>{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-plum-950/15 bg-white px-2.5 py-2 text-sm focus:outline-none" aria-label="Filter by status">
          <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending_verification">Pending Verification</option>
        </select>
        {canManage && <button type="button" onClick={() => setAdding(true)} className="ml-auto flex items-center gap-1.5 rounded-lg bg-plum-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-plum-700"><UserPlus className="h-4 w-4" aria-hidden="true" /> Add Student</button>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-plum-950/10 bg-white shadow-sm">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-plum-950/10 bg-plum-50/60 text-xs text-plum-950/60 uppercase">
              <th className="px-3 py-2.5 font-semibold">ID</th><th className="px-3 py-2.5 font-semibold">Name</th><th className="px-3 py-2.5 font-semibold">Class</th><th className="px-3 py-2.5 font-semibold">Section</th>
              <th className="px-3 py-2.5 font-semibold">Status</th><th className="px-3 py-2.5 font-semibold">Face Enrolment</th><th className="px-3 py-2.5 font-semibold">Attendance</th><th className="px-3 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-plum-950/50">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-plum-950/50">No students match these filters.</td></tr>
            ) : rows.map((r) => {
              const fm = faceMeta(r.faceStatus)
              const sm = statusMeta(r.status)
              return (
                <tr key={r.id} className="border-b border-plum-950/5 text-plum-950/85 last:border-0 hover:bg-plum-50/40">
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-plum-950">{r.id}</td>
                  <td className="px-3 py-2.5"><button type="button" onClick={() => navigate(`/institution/students/${r.id}`)} className="font-semibold text-plum-950 hover:text-plum-800 hover:underline">{r.name}</button></td>
                  <td className="px-3 py-2.5">{r.class}</td>
                  <td className="px-3 py-2.5">{r.section ?? sectionOf(r.class)}</td>
                  <td className="px-3 py-2.5"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${sm.cls}`}>{sm.label}</span></td>
                  <td className="px-3 py-2.5"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${fm.cls}`}>{fm.label}</span></td>
                  <td className="px-3 py-2.5"><span className={`font-semibold ${r.attendancePct < 75 ? 'text-[#a15c00]' : 'text-plum-950'}`}>{r.attendancePct}%</span></td>
                  <td className="px-3 py-2.5">
                    <ActionMenu items={[
                      { label: 'View profile', icon: Eye, onClick: () => navigate(`/institution/students/${r.id}`) },
                      { label: 'Edit', icon: Pencil, onClick: () => setEditing(r), hidden: !canManage },
                      { label: 'Enrol face', icon: ScanFace, onClick: () => navigate(`/institution/students/${r.id}`), hidden: !canManage || r.faceStatus === 'enrolled' },
                      { label: 'Deactivate', icon: PowerOff, tone: 'danger', onClick: () => setStatusAction({ student: r, to: 'inactive' }), hidden: !canDeactivate || r.status !== 'active' },
                      { label: 'Reactivate', icon: Power, onClick: () => setStatusAction({ student: r, to: 'active' }), hidden: !canDeactivate || r.status === 'active' },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-plum-950/50">Face enrolment status is shown as a flag only — biometric templates are never exposed here.</p>

      {adding && <AddStudentDialog onClose={() => setAdding(false)} onAdded={() => { setAdding(false); toast.success('Student added.'); refetch() }} />}
      {editing && <EditStudentDialog student={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); toast.success('Student updated.'); refetch() }} />}
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

function AddStudentDialog({ onClose, onAdded }) {
  const [form, setForm] = useState({ id: '', name: '', class: CLASSES[0], section: sectionOf(CLASSES[0]), rollNo: '', dob: '', gender: '', guardianName: '', contact: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(k, v) {
    setForm((f) => (k === 'class' ? { ...f, class: v, section: sectionOf(v) } : { ...f, [k]: v }))
  }

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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Student ID" error={errors.id} hint="Leave blank to auto-generate">
            <input value={form.id} onChange={(e) => set('id', e.target.value)} placeholder="e.g. STU-1050" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
          <Field label="Roll No *" error={errors.rollNo}>
            <input value={form.rollNo} onChange={(e) => set('rollNo', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
        </div>
        <Field label="Full name *" error={errors.name}>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Class *" error={errors.class}>
            <select value={form.class} onChange={(e) => set('class', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </Field>
          <Field label="Section *" error={errors.section}>
            <input value={form.section} onChange={(e) => set('section', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of birth">
            <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">
              <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Guardian name">
            <input value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
          <Field label="Contact" error={errors.contact}>
            <input value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="+91 …" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
        </div>
        <p className="text-[11px] text-plum-950/50">Face enrolment is done from the student profile — no biometric data is entered here.</p>
      </form>
    </Dialog>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-plum-950/70">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-[10px] text-plum-950/45">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-[#D6262B]">{error}</p>}
    </div>
  )
}
