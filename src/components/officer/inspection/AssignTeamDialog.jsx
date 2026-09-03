import { useState } from 'react'
import Dialog from '../Dialog.jsx'
import SelectField from '../SelectField.jsx'
import { assignTeam } from '../../../services/inspectionsService.js'
import { TEAMS } from '../../../data/inspectionsSeedData.js'

export default function AssignTeamDialog({ inspection, onClose, onAssigned }) {
  const [teamId, setTeamId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!teamId) {
      setError('Please select a team.')
      return
    }
    setSubmitting(true)
    try {
      const updated = await assignTeam(inspection.id, teamId)
      onAssigned(updated)
    } catch (err) {
      setError(err.message || 'Failed to assign team. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title={`Assign Team — ${inspection.id}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
            Cancel
          </button>
          <button
            type="submit"
            form="assign-team-form"
            disabled={submitting}
            className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60"
          >
            {submitting ? 'Assigning…' : 'Assign'}
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm text-plum-950/70">
        {inspection.projectName} · {inspection.organizationName}
      </p>
      <form id="assign-team-form" onSubmit={handleSubmit}>
        {error && <p className="mb-3 rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{error}</p>}
        <SelectField
          label="Inspection Team"
          placeholder="Select a team"
          value={teamId}
          onChange={(e) => {
            setTeamId(e.target.value)
            setError('')
          }}
          options={TEAMS.map((t) => ({ value: t.id, label: `${t.name} (${t.members.join(', ')})` }))}
        />
      </form>
    </Dialog>
  )
}
