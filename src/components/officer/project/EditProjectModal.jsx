import { useState } from 'react'
import Dialog from '../Dialog.jsx'
import TextField from '../TextField.jsx'
import SelectField from '../SelectField.jsx'
import { updateProject } from '../../../services/projectsService.js'
import { PROJECT_STATUSES, RISK_LEVELS } from '../../../data/models.js'

/** Focused edit: status, risk, next inspection date, and contact details — not a full re-create. */
export default function EditProjectModal({ project, onClose, onUpdated }) {
  const [form, setForm] = useState({
    status: project.status,
    riskLevel: project.riskLevel,
    nextInspection: project.nextInspection === '—' ? '' : project.nextInspection,
    contactPerson: project.contactPerson || '',
    contactPhone: project.contactPhone || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const updated = await updateProject(project.id, { ...form, nextInspection: form.nextInspection || '—' })
      onUpdated(updated)
    } catch (err) {
      setSubmitError(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title={`Edit — ${project.name}`}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
            Cancel
          </button>
          <button
            type="submit"
            form="edit-project-form"
            disabled={submitting}
            className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form id="edit-project-form" onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {submitError && <p className="rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{submitError}</p>}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            options={PROJECT_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
          />
          <SelectField
            label="Risk Level"
            value={form.riskLevel}
            onChange={(e) => update('riskLevel', e.target.value)}
            options={RISK_LEVELS.map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) }))}
          />
          <TextField label="Next Inspection" type="date" value={form.nextInspection} onChange={(e) => update('nextInspection', e.target.value)} />
          <TextField label="Contact Person" value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
          <TextField label="Contact Phone" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
        </div>
      </form>
    </Dialog>
  )
}
