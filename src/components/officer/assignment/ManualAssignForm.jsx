import { useState } from 'react'
import SelectField from '../SelectField.jsx'
import { validateManualAssignmentReason } from '../../../data/inspectorModels.js'

export default function ManualAssignForm({ inspectors, onConfirm, onCancel, submitting }) {
  const [inspectorId, setInspectorId] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})

  function handleConfirm() {
    const nextErrors = {}
    if (!inspectorId) nextErrors.inspectorId = 'Select an inspector to assign.'
    const reasonError = validateManualAssignmentReason(reason)
    if (reasonError) nextErrors.reason = reasonError
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onConfirm(inspectorId, reason)
  }

  return (
    <div className="space-y-3.5 rounded-xl border border-[#e2a610]/40 bg-amber-50/40 p-4">
      <p className="text-sm text-plum-950/70">
        Manual assignment bypasses the scoring engine entirely (including eligibility checks like conflicts of
        interest and workload limits) — use it when you know something the engine doesn't. A reason is required
        and is recorded in the audit log.
      </p>
      <SelectField
        label="Assign To"
        placeholder="Select inspector"
        value={inspectorId}
        onChange={(e) => {
          setInspectorId(e.target.value)
          setErrors((prev) => ({ ...prev, inspectorId: undefined }))
        }}
        error={errors.inspectorId}
        options={inspectors.map((i) => ({ value: i.id, label: `${i.name} (${i.homeDistrict})${i.availability === 'unavailable' ? ' — unavailable' : ''}` }))}
      />
      <div>
        <label htmlFor="manual-assign-reason" className="mb-1 block text-sm font-medium text-plum-950">
          Reason (required)
        </label>
        <textarea
          id="manual-assign-reason"
          rows={2}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setErrors((prev) => ({ ...prev, reason: undefined }))
          }}
          placeholder="e.g. Inspector has specific prior knowledge of this institute's records system."
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-plum-950 placeholder:text-plum-950/35 focus:outline-none ${
            errors.reason ? 'border-[#D6262B]' : 'border-plum-950/15'
          }`}
        />
        {errors.reason && <p className="mt-1 text-xs font-medium text-[#D6262B]">{errors.reason}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-white">
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="rounded-lg bg-[#D6262B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60"
        >
          {submitting ? 'Assigning…' : 'Confirm Manual Assignment'}
        </button>
      </div>
    </div>
  )
}
