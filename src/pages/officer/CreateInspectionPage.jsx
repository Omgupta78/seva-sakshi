import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import TextField from '../../components/officer/TextField.jsx'
import SelectField from '../../components/officer/SelectField.jsx'
import { createInspection } from '../../services/inspectionsService.js'
import { validateInspectionInput, INSPECTION_TYPES, PRIORITIES, CHECKLIST_CATEGORIES, typeLabel } from '../../data/inspectionModels.js'
import { PROJECTS, ORGANIZATIONS } from '../../data/projectsSeedData.js'
import { TEAMS } from '../../data/inspectionsSeedData.js'

const initialState = {
  projectId: '',
  organizationId: '',
  type: '',
  scheduledDate: '',
  priority: 'medium',
  reason: '',
  requiredAreas: [],
  assignedTeamId: '',
}

export default function CreateInspectionPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  function handleProjectChange(projectId) {
    const project = PROJECTS.find((p) => p.id === projectId)
    setForm((prev) => ({ ...prev, projectId, organizationId: project?.organizationId ?? '' }))
    setErrors((prev) => ({ ...prev, projectId: undefined, organizationId: undefined }))
  }

  function toggleArea(category) {
    setForm((prev) => ({
      ...prev,
      requiredAreas: prev.requiredAreas.includes(category) ? prev.requiredAreas.filter((a) => a !== category) : [...prev.requiredAreas, category],
    }))
    setErrors((prev) => (prev.requiredAreas ? { ...prev, requiredAreas: undefined } : prev))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateInspectionInput(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const created = await createInspection(form)
      navigate(`/officer/inspections/${created.id}`)
    } catch (err) {
      setSubmitError(err.message || 'Failed to create inspection. Please try again.')
      setSubmitting(false)
    }
  }

  const organizationName = ORGANIZATIONS.find((o) => o.id === form.organizationId)?.name

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/officer/inspections" className="inline-flex items-center gap-1 text-sm font-medium text-plum-800 no-underline hover:underline">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to Inspections
      </Link>

      <div>
        <h1 className="text-lg font-extrabold text-plum-950 sm:text-xl">Create Inspection</h1>
        <p className="text-sm text-plum-950/60">Schedule a new inspection and optionally assign a team right away.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-plum-950/10 bg-white p-5 shadow-sm sm:p-6">
        {submitError && <p className="rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{submitError}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Project"
            placeholder="Select project"
            value={form.projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            error={errors.projectId}
            options={PROJECTS.map((p) => ({ value: p.id, label: p.name }))}
          />
          <div>
            <span className="mb-1 block text-sm font-medium text-plum-950">Organization</span>
            <p className="rounded-lg border border-plum-950/15 bg-plum-50/50 px-3 py-2 text-sm text-plum-950/80">
              {organizationName || 'Select a project to auto-fill'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            label="Inspection Type"
            placeholder="Select type"
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            error={errors.type}
            options={INSPECTION_TYPES.map((t) => ({ value: t, label: typeLabel(t) }))}
          />
          <TextField label="Inspection Date" type="date" value={form.scheduledDate} onChange={(e) => update('scheduledDate', e.target.value)} error={errors.scheduledDate} />
          <SelectField
            label="Priority"
            value={form.priority}
            onChange={(e) => update('priority', e.target.value)}
            options={PRIORITIES.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))}
          />
        </div>

        <div>
          <label htmlFor="reason" className="mb-1 block text-sm font-medium text-plum-950">
            Reason
          </label>
          <textarea
            id="reason"
            rows={3}
            placeholder="Why is this inspection being scheduled?"
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none ${
              errors.reason ? 'border-[#D6262B]' : 'border-plum-950/15'
            }`}
          />
          {errors.reason && <p className="mt-1 text-xs font-medium text-[#D6262B]">{errors.reason}</p>}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-plum-950">Required Inspection Areas</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHECKLIST_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm text-plum-950/80">
                <input
                  type="checkbox"
                  checked={form.requiredAreas.includes(category)}
                  onChange={() => toggleArea(category)}
                  className="h-4 w-4 rounded border-plum-950/30 text-plum-800"
                />
                {category}
              </label>
            ))}
          </div>
          {errors.requiredAreas && <p className="mt-1 text-xs font-medium text-[#D6262B]">{errors.requiredAreas}</p>}
        </fieldset>

        <SelectField
          label="Assigned Team (optional — leave blank to assign later)"
          placeholder="Unassigned"
          value={form.assignedTeamId}
          onChange={(e) => update('assignedTeamId', e.target.value)}
          options={TEAMS.map((t) => ({ value: t.id, label: `${t.name} (${t.members.join(', ')})` }))}
        />

        <div className="flex justify-end gap-2 border-t border-plum-950/10 pt-4">
          <Link to="/officer/inspections" className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 no-underline hover:bg-plum-50">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="rounded-lg bg-[#D6262B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60">
            {submitting ? 'Creating…' : 'Create Inspection'}
          </button>
        </div>
      </form>
    </div>
  )
}
