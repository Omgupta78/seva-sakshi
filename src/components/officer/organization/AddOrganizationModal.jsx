import { useState } from 'react'
import Dialog from '../Dialog.jsx'
import TextField from '../TextField.jsx'
import SelectField from '../SelectField.jsx'
import { createOrganization } from '../../../services/organizationsService.js'
import { validateOrganizationInput, ORG_TYPES } from '../../../data/models.js'
import { LOCATIONS } from '../../../data/projectsSeedData.js'

const initialState = {
  name: '',
  type: '',
  registrationNumber: '',
  registrationDate: '',
  locationId: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
}

/** `defaultType`: pre-selects 'NGO' when opened from the NGOs page, otherwise left blank on the Institutes page. */
export default function AddOrganizationModal({ onClose, onCreated, defaultType }) {
  const [form, setForm] = useState({ ...initialState, type: defaultType ?? '' })
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
      const created = await createOrganization(form)
      onCreated(created)
    } catch (err) {
      setSubmitError(err.message || 'Failed to add organization. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title={defaultType === 'NGO' ? 'Add NGO' : 'Add Organization'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
            Cancel
          </button>
          <button
            type="submit"
            form="add-org-form"
            disabled={submitting}
            className="rounded-lg bg-[#D6262B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add Organization'}
          </button>
        </>
      }
    >
      <form id="add-org-form" onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {submitError && <p className="rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{submitError}</p>}

        <TextField label="Organization Name" placeholder="e.g. Pragati Mahila Mandal" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <SelectField
            label="Type"
            placeholder="Select type"
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            error={errors.type}
            options={ORG_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <SelectField
            label="District"
            placeholder="Select district"
            value={form.locationId}
            onChange={(e) => update('locationId', e.target.value)}
            error={errors.locationId}
            options={LOCATIONS.map((l) => ({ value: l.id, label: `${l.district}, ${l.state}` }))}
          />
          <TextField
            label="Registration Number"
            placeholder="e.g. NGO/MH/2024/0001"
            value={form.registrationNumber}
            onChange={(e) => update('registrationNumber', e.target.value)}
            error={errors.registrationNumber}
          />
          <TextField
            label="Registration Date"
            type="date"
            value={form.registrationDate}
            onChange={(e) => update('registrationDate', e.target.value)}
          />
          <TextField label="Contact Person" placeholder="Name" value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} error={errors.contactPerson} />
          <TextField label="Contact Phone" placeholder="+91 …" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} error={errors.contactPhone} />
          <TextField
            label="Contact Email (optional)"
            type="email"
            placeholder="name@organization.org"
            value={form.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)}
            error={errors.contactEmail}
          />
        </div>
      </form>
    </Dialog>
  )
}
