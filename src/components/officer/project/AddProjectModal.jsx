import { useState } from 'react'
import Dialog from '../Dialog.jsx'
import TextField from '../TextField.jsx'
import SelectField from '../SelectField.jsx'
import { createProject } from '../../../services/projectsService.js'
import { validateProjectInput, PROJECT_TYPES, PROJECT_STATUSES } from '../../../data/models.js'
import { SCHEMES, LOCATIONS, ORGANIZATIONS } from '../../../data/projectsSeedData.js'

const initialState = {
  name: '',
  schemeId: '',
  organizationId: '',
  locationId: '',
  projectType: '',
  status: 'planned',
  beneficiaryCount: '',
  staffCount: '',
  contactPerson: '',
  contactPhone: '',
}

export default function AddProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateProjectInput(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const created = await createProject(form)
      onCreated(created)
    } catch (err) {
      setSubmitError(err.message || 'Failed to create project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title="Add Project"
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
            Cancel
          </button>
          <button
            type="submit"
            form="add-project-form"
            disabled={submitting}
            className="rounded-lg bg-[#D6262B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create Project'}
          </button>
        </>
      }
    >
      <form id="add-project-form" onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {submitError && <p className="rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{submitError}</p>}

        <TextField label="Project Name" placeholder="e.g. Post-Matric Scholarship Rollout" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <SelectField
            label="Scheme"
            placeholder="Select scheme"
            value={form.schemeId}
            onChange={(e) => update('schemeId', e.target.value)}
            error={errors.schemeId}
            options={SCHEMES.map((s) => ({ value: s.id, label: s.name }))}
          />
          <SelectField
            label="Implementing Organization"
            placeholder="Select organization"
            value={form.organizationId}
            onChange={(e) => update('organizationId', e.target.value)}
            error={errors.organizationId}
            options={ORGANIZATIONS.map((o) => ({ value: o.id, label: o.name }))}
          />
          <SelectField
            label="District"
            placeholder="Select district"
            value={form.locationId}
            onChange={(e) => update('locationId', e.target.value)}
            error={errors.locationId}
            options={LOCATIONS.map((l) => ({ value: l.id, label: `${l.district}, ${l.state}` }))}
          />
          <SelectField
            label="Project Type"
            placeholder="Select type"
            value={form.projectType}
            onChange={(e) => update('projectType', e.target.value)}
            error={errors.projectType}
            options={PROJECT_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            options={PROJECT_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
          />
          <TextField
            label="Beneficiary Count"
            type="number"
            min="0"
            placeholder="0"
            value={form.beneficiaryCount}
            onChange={(e) => update('beneficiaryCount', e.target.value)}
            error={errors.beneficiaryCount}
          />
          <TextField label="Contact Person" placeholder="Name" value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} />
          <TextField label="Contact Phone" placeholder="+91 …" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
        </div>
      </form>
    </Dialog>
  )
}
