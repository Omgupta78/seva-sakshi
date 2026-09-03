import { useState } from 'react'
import { Sparkles, RotateCcw, CheckCircle2, UserCog } from 'lucide-react'
import Dialog from '../Dialog.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { EXPERTISE_AREAS, CATEGORY_TO_EXPERTISE } from '../../../data/inspectorModels.js'
import { generateRecommendation, acceptRecommendation, manualAssign, INSPECTORS } from '../../../services/inspectionAssignmentService.js'
import CandidateScoreTable from './CandidateScoreTable.jsx'
import SelectionExplanation from './SelectionExplanation.jsx'
import RejectedInspectorsList from './RejectedInspectorsList.jsx'
import ManualAssignForm from './ManualAssignForm.jsx'

function suggestedExpertise(inspection) {
  const suggested = new Set(inspection.requiredAreas.map((c) => CATEGORY_TO_EXPERTISE[c]).filter(Boolean))
  return [...suggested]
}

/**
 * The full "AI-Assisted Random Inspection Assignment" workflow: pick
 * required expertise + preferred date -> Generate -> review the ranked
 * shortlist and the "why" explanation -> Accept, Regenerate, or fall
 * back to a reason-required Manual Assignment.
 */
export default function AiAssignmentDialog({ inspection, onClose, onAssigned }) {
  const { user } = useAuth()
  const [requiredExpertise, setRequiredExpertise] = useState(() => suggestedExpertise(inspection))
  const [preferredDate, setPreferredDate] = useState(inspection.scheduledDate)
  const [result, setResult] = useState(null)
  const [mode, setMode] = useState('criteria') // 'criteria' | 'manual'
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function toggleExpertise(area) {
    setRequiredExpertise((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const next = await generateRecommendation(inspection.id, { requiredExpertise }, user.name)
      setResult(next)
    } catch (err) {
      setError(err.message || 'Failed to generate an assignment. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleAccept() {
    setSubmitting(true)
    setError('')
    try {
      const updated = await acceptRecommendation(inspection.id, result, user.name)
      onAssigned(updated)
    } catch (err) {
      setError(err.message || 'Failed to confirm the assignment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleManualConfirm(inspectorId, reason) {
    setSubmitting(true)
    setError('')
    try {
      const updated = await manualAssign(inspection.id, inspectorId, reason, user.name, result)
      onAssigned(updated)
    } catch (err) {
      setError(err.message || 'Failed to save the manual assignment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog title="AI-Assisted Random Inspection Assignment" onClose={onClose} size="lg">
      <p className="mb-4 text-sm text-plum-950/60">
        {inspection.projectName} · {inspection.organizationName} · {inspection.district}, {inspection.state}
      </p>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-2.5 text-sm font-medium text-[#D6262B]">{error}</p>}

      {mode === 'criteria' && (
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-plum-950">Required Expertise</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EXPERTISE_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2 text-sm text-plum-950/80">
                  <input type="checkbox" checked={requiredExpertise.includes(area)} onChange={() => toggleExpertise(area)} className="h-4 w-4 rounded border-plum-950/30 text-plum-800" />
                  {area}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="max-w-xs">
            <label htmlFor="preferred-date" className="mb-1 block text-sm font-medium text-plum-950">
              Preferred Date
            </label>
            <input
              id="preferred-date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full rounded-lg border border-plum-950/15 bg-white px-3 py-2 text-sm text-plum-950 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-plum-950/10 pt-4">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg bg-[#D6262B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a91f24] disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {generating ? 'Generating…' : result ? 'Regenerate' : 'Generate Assignment'}
            </button>
            <button type="button" onClick={() => setMode('manual')} className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50">
              <UserCog className="h-4 w-4" aria-hidden="true" />
              Manually Assign
            </button>
            <button type="button" onClick={onClose} className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-plum-950/60 hover:bg-plum-50">
              Cancel
            </button>
          </div>

          {result && (
            <div className="space-y-4 border-t border-plum-950/10 pt-4">
              <div>
                <h3 className="mb-2 text-sm font-bold text-plum-950">Recommended Inspection Team</h3>
                {result.candidates.length === 0 ? (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-[#D6262B]">
                    No eligible inspectors found for this inspection's requirements. See the excluded list below, adjust the
                    required expertise, or use Manual Assignment.
                  </p>
                ) : (
                  <CandidateScoreTable candidates={result.candidates} selectedInspectorId={result.selected?.inspectorId} />
                )}
              </div>

              {result.selected && <SelectionExplanation selected={result.selected} seed={result.seed} />}

              <RejectedInspectorsList rejected={result.rejected} />

              {result.selected && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={submitting}
                    className="flex items-center gap-1.5 rounded-lg bg-plum-800 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-900 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {submitting ? 'Confirming…' : 'Accept Assignment'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-1.5 rounded-lg border border-plum-950/15 px-4 py-2 text-sm font-semibold text-plum-950 hover:bg-plum-50"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Regenerate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <ManualAssignForm inspectors={INSPECTORS} onConfirm={handleManualConfirm} onCancel={() => setMode('criteria')} submitting={submitting} />
      )}
    </Dialog>
  )
}
