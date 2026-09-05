import { useState } from 'react'
import Dialog from '../officer/Dialog.jsx'
import { updateInstitutionStudent, CLASSES } from '../../services/institutionService.js'
import { sectionOf } from '../../data/institutionData.js'

/** Edit a student's roster/profile fields. Persists through the service layer
 *  (institutionService keeps a mutable store, so changes survive navigation). */
export default function EditStudentDialog({ student, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: student.name ?? '', class: student.class ?? CLASSES[0], section: student.section ?? sectionOf(student.class),
    rollNo: student.rollNo ?? '', dob: student.dob ?? '', gender: student.gender ?? '',
    guardianName: student.guardianName ?? '', contact: student.contact ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault(); setErrors({}); setSaving(true)
    try { await updateInstitutionStudent(student.id, form); onSaved() }
    catch (err) { setErrors(err.fieldErrors ?? { name: err.message }); setSaving(false) }
  }

  return (
    <Dialog title={`Edit ${student.name}`} size="md" onClose={onClose} footer={
      <>
        <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">Cancel</button>
        <button type="submit" form="edit-student-form" disabled={saving} className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
      </>
    }>
      <form id="edit-student-form" onSubmit={submit} className="space-y-3">
        <Field label="Full name" error={errors.name}>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Class">
            <select value={form.class} onChange={(e) => set('class', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">{CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </Field>
          <Field label="Section" error={errors.section}>
            <input value={form.section} onChange={(e) => set('section', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Roll No" error={errors.rollNo}>
            <input value={form.rollNo} onChange={(e) => set('rollNo', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
          <Field label="Date of birth">
            <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm focus:outline-none">
              <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </Field>
          <Field label="Contact" error={errors.contact}>
            <input value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="+91 …" className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
          </Field>
        </div>
        <Field label="Guardian name">
          <input value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} className="w-full rounded-lg border border-plum-950/15 px-3 py-2 text-sm focus:outline-none" />
        </Field>
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
