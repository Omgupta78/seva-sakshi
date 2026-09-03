/**
 * ---------------------------------------------------------------------
 * AI-ASSISTED RANDOM INSPECTION ASSIGNMENT — scoring engine
 * ---------------------------------------------------------------------
 * Pure, dependency-free functions (no React, no async) so the scoring
 * math is easy to read, test, and audit in isolation from the UI and
 * the service layer's simulated-latency wrapper (assignmentService.js).
 *
 * What "AI-assisted" means here, precisely: a transparent, documented
 * weighted-scoring formula (SCORE_WEIGHTS in inspectorModels.js) decides
 * how *suitable* each eligible inspector is; a seeded pseudo-random draw
 * — weighted toward, but not limited to, the highest scorers — decides
 * who actually gets picked. That randomization step exists specifically
 * so two equally-suitable inspectors don't always resolve to the same
 * person. The score is always deterministic and inspectable; only the
 * final pick has a controlled random element, and that element is
 * seeded so a past generation can be replayed exactly from its audit
 * record (see assignmentAuditService.js).
 *
 * This does NOT guarantee an unbiased or optimal assignment — it's a
 * structured decision aid, not a proof of fairness. Officers can always
 * override it via Manual Assignment (with a required reason).
 * ---------------------------------------------------------------------
 */
import { DISTRICT_DISTANCES_KM, SCORE_WEIGHTS } from '../data/inspectorModels.js'

const ACTIVE_INSPECTION_STATUSES = ['assigned', 'scheduled', 'in-progress', 'overdue']

export function distanceKm(districtA, districtB) {
  if (districtA === districtB) return 0
  const key1 = `${districtA}|${districtB}`
  const key2 = `${districtB}|${districtA}`
  return DISTRICT_DISTANCES_KM[key1] ?? DISTRICT_DISTANCES_KM[key2] ?? 500 // conservative fallback for any unmapped pair
}

/** 0 (best, local) - 100 (worst, far). Then converted to a 0-100 *score* by scoreFromDistance. */
function scoreFromDistance(km) {
  if (km === 0) return 100
  if (km <= 200) return 82
  if (km <= 400) return 62
  if (km <= 600) return 42
  return 22
}

function distanceLabel(km) {
  if (km === 0) return 'Same district'
  if (km <= 200) return 'Nearby'
  if (km <= 400) return 'Moderate'
  return 'Far'
}

/** An inspector has a conflict of interest with any organization where they're the listed contact person — they'd be inspecting their own institute. */
export function hasConflictOfInterest(inspector, organization) {
  return organization?.contactPerson === inspector.name
}

/** Every currently-active (not completed/cancelled) inspection assigned to this inspector, by name — covers both legacy team assignment and direct inspector assignment. */
export function getActiveAssignments(inspectorName, inspections, teamsById) {
  return inspections.filter((insp) => {
    if (!ACTIVE_INSPECTION_STATUSES.includes(insp.status)) return false
    if (insp.assignedInspectorName === inspectorName) return true
    const team = insp.assignedTeamId ? teamsById[insp.assignedTeamId] : null
    return team?.members.includes(inspectorName) ?? false
  })
}

/** How many times (any status, including completed) this inspector has already been assigned to this specific project — used to encourage rotation. */
export function countPriorAssignmentsToProject(inspectorName, projectId, inspections, teamsById) {
  return inspections.filter((insp) => {
    if (insp.projectId !== projectId) return false
    if (insp.assignedInspectorName === inspectorName) return true
    const team = insp.assignedTeamId ? teamsById[insp.assignedTeamId] : null
    return team?.members.includes(inspectorName) ?? false
  }).length
}

function expertiseMatch(inspectorExpertise, requiredExpertise) {
  if (requiredExpertise.length === 0) return { pct: 100, matched: [] }
  const matched = requiredExpertise.filter((e) => inspectorExpertise.includes(e))
  return { pct: Math.round((matched.length / requiredExpertise.length) * 100), matched }
}

function scoreLabel(score) {
  if (score >= 75) return 'High'
  if (score >= 45) return 'Medium'
  return 'Low'
}

/**
 * Filters the full roster down to inspectors who could conceivably do
 * this inspection — everyone removed here is removed for a stated,
 * inspectable reason (surfaced in the UI), not silently dropped.
 */
export function getEligibleInspectors({ inspectors, organization, requiredExpertise, inspections, teamsById }) {
  const eligible = []
  const rejected = []

  for (const inspector of inspectors) {
    if (inspector.availability !== 'available') {
      rejected.push({ inspector, reason: `Unavailable${inspector.unavailableReason ? ` — ${inspector.unavailableReason}` : ''}` })
      continue
    }
    if (hasConflictOfInterest(inspector, organization)) {
      rejected.push({ inspector, reason: `Conflict of interest — listed contact person for ${organization.name}` })
      continue
    }
    const workload = getActiveAssignments(inspector.name, inspections, teamsById).length
    if (workload >= inspector.maxWorkload) {
      rejected.push({ inspector, reason: `At workload limit (${workload}/${inspector.maxWorkload} active inspections)` })
      continue
    }
    if (requiredExpertise.length > 0 && !requiredExpertise.some((e) => inspector.expertise.includes(e))) {
      rejected.push({ inspector, reason: `Lacks required expertise (${requiredExpertise.join(', ')})` })
      continue
    }
    eligible.push(inspector)
  }

  return { eligible, rejected }
}

/** Deterministic, transparent 0-100 suitability score for one eligible inspector, plus the human-readable breakdown shown in the UI. */
export function scoreCandidate(inspector, { organization, requiredExpertise, inspections, teamsById, projectId }) {
  const km = distanceKm(inspector.homeDistrict, organization.district)
  const locationScore = scoreFromDistance(km)

  const workload = getActiveAssignments(inspector.name, inspections, teamsById).length
  const workloadScore = Math.round(Math.max(0, 100 - (workload / inspector.maxWorkload) * 100))

  const { pct: expertisePct, matched } = expertiseMatch(inspector.expertise, requiredExpertise)

  const priorAssignments = countPriorAssignmentsToProject(inspector.name, projectId, inspections, teamsById)
  const rotationScore = Math.max(0, 100 - priorAssignments * 25)

  const score = Math.round(
    expertisePct * SCORE_WEIGHTS.expertise +
      workloadScore * SCORE_WEIGHTS.workload +
      locationScore * SCORE_WEIGHTS.location +
      rotationScore * SCORE_WEIGHTS.rotation
  )

  return {
    inspectorId: inspector.id,
    inspectorName: inspector.name,
    homeDistrict: inspector.homeDistrict,
    distanceKm: km,
    distanceLabel: distanceLabel(km),
    workload,
    maxWorkload: inspector.maxWorkload,
    expertiseMatchPct: expertisePct,
    matchedExpertise: matched,
    priorAssignments,
    score,
    breakdown: {
      location: { score: locationScore, label: scoreLabel(locationScore) },
      workload: { score: workloadScore, label: scoreLabel(workloadScore) },
      expertise: { score: expertisePct, label: scoreLabel(expertisePct) },
      rotation: { score: rotationScore, label: scoreLabel(rotationScore) },
    },
  }
}

// --- Seeded PRNG (mulberry32) so a selection can be replayed exactly from a recorded seed. ---
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeSeed() {
  return Math.floor(Math.random() * 2 ** 31)
}

/**
 * Weighted-random pick among scored candidates: higher scores are more
 * likely but not guaranteed, so two similarly-scored inspectors don't
 * deterministically resolve to the same one every time. Weight = score²
 * so the effect is meaningfully score-sensitive without being a pure
 * top-score-always-wins rule. Deterministic given the same seed — that's
 * what makes it auditable/reproducible rather than "we can't explain why."
 */
export function pickWeightedRandom(scoredCandidates, seed) {
  const rand = mulberry32(seed)
  const weights = scoredCandidates.map((c) => Math.max(1, c.score) ** 2)
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = rand() * total
  for (let i = 0; i < scoredCandidates.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return scoredCandidates[i]
  }
  return scoredCandidates[scoredCandidates.length - 1]
}

/**
 * Runs the full pipeline: eligibility filter -> score every eligible
 * candidate -> seeded weighted-random pick. Returns everything the UI
 * needs to show the ranked shortlist, the rejection reasons, and the
 * "why was this inspector selected" explanation.
 */
export function generateAssignment({ organization, project, requiredExpertise, inspectors, inspections, teamsById, seed = makeSeed() }) {
  const { eligible, rejected } = getEligibleInspectors({ inspectors, organization, requiredExpertise, inspections, teamsById })

  const scored = eligible
    .map((inspector) => scoreCandidate(inspector, { organization, requiredExpertise, inspections, teamsById, projectId: project.id }))
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    return { candidates: [], rejected, selected: null, seed, requiredExpertise }
  }

  const selected = pickWeightedRandom(scored, seed)
  return { candidates: scored, rejected, selected, seed, requiredExpertise }
}
