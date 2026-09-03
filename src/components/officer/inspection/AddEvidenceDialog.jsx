import { useState } from 'react'
import Dialog from '../Dialog.jsx'
import TextField from '../TextField.jsx'
import SelectField from '../SelectField.jsx'
import { addEvidence } from '../../../services/inspectionsService.js'
import { EVIDENCE_TYPES } from '../../../data/inspectionModels.js'

const TYPE_LABEL = { photo: 'Photo', video: 'Video', document: 'Document', text: 'Text Observation' }

export default function AddEvidenceDialog({ inspectionId, onClose, onAdded }) {
  const [type, setType] = useState('text')
  const [description, setDescription] = useState('')
  const [fileRef, setFileRef] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      setError(type === 'text' ? 'Please enter the observation.' : 'Please add a short caption.')
      return
    }
    setSubmitting(true)
    try {
      const updated = await addEvidence(inspectionId, { type, description, fileRef })
      onAdded(updated)
    } catch (err) {
      setError(err.message || 'Failed to add evidence. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      title="Add Evidence"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
            Cancel
          </button>
          <button
            type="submit"
            form="add-evidence-form"
            disabled={submitting}
            className="rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add Evidence'}
          </button>
        </>
      }
    >
      <form id="add-evidence-form" onSubmit={handleSubmit} className="space-y-3.5">
        {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{error}</p>}
        <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value)} options={EVIDENCE_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))} />
        {type !== 'text' && (
          <TextField
            label="File Name / Reference"
            placeholder="e.g. IMG_0231.jpg (demo only — no real upload)"
            value={fileRef}
            onChange={(e) => setFileRef(e.target.value)}
          />
        )}
        <div>
          <label htmlFor="evidence-description" className="mb-1 block text-sm font-medium text-plum-950">
            {type === 'text' ? 'Observation' : 'Caption'}
          </label>
          <textarea
            id="evidence-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none"
          />
        </div>
      </form>
    </Dialog>
  )
}
