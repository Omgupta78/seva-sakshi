/**
 * Orchestration layer for the AI-Assisted Random Inspection Assignment
 * workflow — ties the pure scoring engine (assignmentEngine.js) to the
 * inspections store, the inspector roster, and the audit log. This is
 * the module the UI actually talks to.
 */
import { PROJECTS, ORGANIZATIONS, LOCATIONS } from '../data/projectsSeedData.js'
import { INSPECTORS } from '../data/inspectorsSeedData.js'
import { getInspection, getInspectionsSnapshot, getTeamsById, assignInspector } from './inspectionsService.js'
import { generateAssignment, makeSeed } from './assignmentEngine.js'
import { recordAuditEntry, listAuditEntries } from './assignmentAuditService.js'
import { validateManualAssignmentReason } from '../data/inspectorModels.js'

export { INSPECTORS }
export { listAuditEntries }

/**
 * Runs the scoring + weighted-random pipeline for one inspection and
 * records a "generate" audit entry. Does NOT assign anyone yet — the
 * officer still has to Accept (or Manually Assign instead).
 */
export async function generateRecommendation(inspectionId, { requiredExpertise = [] } = {}, generatedBy) {
  const inspection = await getInspection(inspectionId)
  const project = PROJECTS.find((p) => p.id === inspection.projectId)
  const orgRecord = ORGANIZATIONS.find((o) => o.id === inspection.organizationId)
  // ORGANIZATIONS stores locationId, not a district string directly — resolve it here
  // rather than in the (deliberately React/service-agnostic) scoring engine.
  const organization = { ...orgRecord, district: LOCATIONS.find((l) => l.id === orgRecord.locationId)?.district }
  const [inspections, teamsById] = await Promise.all([getInspectionsSnapshot(), Promise.resolve(getTeamsById())])

  const seed = makeSeed()
  const result = generateAssignment({ organization, project, requiredExpertise, inspectors: INSPECTORS, inspections, teamsById, seed })

  await recordAuditEntry({
    inspectionId,
    action: 'generate',
    generatedBy,
    eligibleInspectorIds: result.candidates.map((c) => c.inspectorId),
    candidateScores: result.candidates.map((c) => ({ inspectorId: c.inspectorId, score: c.score })),
    selectedInspectorId: result.selected?.inspectorId ?? null,
    seed,
    manualOverride: false,
  })

  return result
}

/** Officer accepts the engine's recommended inspector as-is. */
export async function acceptRecommendation(inspectionId, result, generatedBy) {
  if (!result.selected) throw new Error('No eligible inspector to accept.')
  const inspector = INSPECTORS.find((i) => i.id === result.selected.inspectorId)
  const updated = await assignInspector(inspectionId, inspector)

  await recordAuditEntry({
    inspectionId,
    action: 'accept',
    generatedBy,
    eligibleInspectorIds: result.candidates.map((c) => c.inspectorId),
    candidateScores: result.candidates.map((c) => ({ inspectorId: c.inspectorId, score: c.score })),
    selectedInspectorId: inspector.id,
    seed: result.seed,
    manualOverride: false,
  })

  return updated
}

/** Officer overrides the engine and picks someone else directly — always requires a reason. */
export async function manualAssign(inspectionId, inspectorId, reason, generatedBy, lastResult = null) {
  const validationError = validateManualAssignmentReason(reason)
  if (validationError) {
    const err = new Error(validationError)
    err.fieldErrors = { reason: validationError }
    throw err
  }

  const inspector = INSPECTORS.find((i) => i.id === inspectorId)
  if (!inspector) throw new Error('Select an inspector to assign.')

  const updated = await assignInspector(inspectionId, inspector)

  await recordAuditEntry({
    inspectionId,
    action: 'manual',
    generatedBy,
    eligibleInspectorIds: lastResult?.candidates.map((c) => c.inspectorId) ?? [],
    candidateScores: lastResult?.candidates.map((c) => ({ inspectorId: c.inspectorId, score: c.score })) ?? [],
    selectedInspectorId: inspector.id,
    seed: lastResult?.seed ?? null,
    manualOverride: true,
    reason: reason.trim(),
  })

  return updated
}
