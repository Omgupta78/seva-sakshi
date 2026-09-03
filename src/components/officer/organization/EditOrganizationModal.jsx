import { useState } from 'react'
import Dialog from '../Dialog.jsx'
import TextField from '../TextField.jsx'
import SelectField from '../SelectField.jsx'
import { updateOrganization } from '../../../services/organizationsService.js'
import { COMPLIANCE_STATUSES, validateOrganizationInput } from '../../../data/models.js'

export default function EditOrganizationModal({ organization, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: organization.name,
    registrationNumber: organization.registrationNumber,
    contactPerson: organization.contactPerson,
    contactPhone: organization.contactPhone,
    contactEmail: organization.contactEmail || '',
    complianceStatus: organization.complianceStatus,
    locationId: organization.locationId,
    type: organization.type,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateOrganizationInput(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const updated = await updateOrganization(organization.id, form)
      onUpdated(updated)
    } catch (err) {
      setSubmitError(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title={`Edit — ${organization.name}`}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
            Cancel
          </button>
          <button
            type="submit"
            form="edit-org-form"
            disabled={submitting}
            className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form id="edit-org-form" onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {submitError && <p className="rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{submitError}</p>}
        <TextField label="Organization Name" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <TextField label="Registration Number" value={form.registrationNumber} onChange={(e) => update('registrationNumber', e.target.value)} error={errors.registrationNumber} />
          <SelectField
            label="Compliance Status"
            value={form.complianceStatus}
            onChange={(e) => update('complianceStatus', e.target.value)}
            options={COMPLIANCE_STATUSES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))}
          />
          <TextField label="Contact Person" value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} error={errors.contactPerson} />
          <TextField label="Contact Phone" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} error={errors.contactPhone} />
          <TextField label="Contact Email" type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} error={errors.contactEmail} />
        </div>
      </form>
    </Dialog>
  )
}
