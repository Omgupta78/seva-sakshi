/**
 * ---------------------------------------------------------------------
 * ALERTS SERVICE — persists anomalies as reviewable alerts + audit
 * ---------------------------------------------------------------------
 * The anomaly engine produces indicators; this service turns them into
 * trackable alerts an officer can Review / Assign / Note / Resolve / Dismiss,
 * and records who did what (audit). Alerts are never framed as proven
 * wrongdoing — status flows through review, not judgement.
 *
 * In-memory demo store; swap bodies for fetch() to persist server-side.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { runAnalysis, buildChartSeries } from './anomalyEngine.js'
import { INSPECTIONS } from '../data/inspectionsSeedData.js'
import { requirePermission } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'

let seq = 4100
function seed() {
  return runAnalysis().map((an) => {
    const id = `ALT-${seq++}`
    return {
      id,
      ...an,
      status: 'open', // open | reviewing | resolved | dismissed
      createdAt: new Date().toISOString(),
      audit: [{ id: `${id}-0`, at: new Date().toISOString(), officer: 'System', action: 'detected', detail: `Flagged by baseline engine (score ${an.score}).` }],
    }
  })
}
let alerts = seed()

function push(alert, officer, action, detail) {
  alert.audit.push({ id: `${alert.id}-${alert.audit.length}`, at: new Date().toISOString(), officer: officer?.name ?? 'Officer', officerId: officer?.id ?? '—', action, detail })
}

export async function listAlerts(params = {}) {
  requirePermission(PERMISSIONS.VIEW_ANALYTICS)
  await delay()
  const { search = '', risk = 'all', status = 'all', category = 'all', projectId = 'all' } = params
  let rows = [...alerts]
  const q = search.trim().toLowerCase()
  if (q) rows = rows.filter((a) => a.projectName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.metric.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q))
  if (risk !== 'all') rows = rows.filter((a) => a.riskLevel === risk)
  if (status !== 'all') rows = rows.filter((a) => a.status === status)
  if (category !== 'all') rows = rows.filter((a) => a.category === category)
  if (projectId !== 'all') rows = rows.filter((a) => a.projectId === projectId)
  const rank = { critical: 0, high: 1, medium: 2, low: 3 }
  rows.sort((a, b) => (rank[a.riskLevel] - rank[b.riskLevel]) || b.score - a.score)
  return { items: rows, total: rows.length }
}

export async function getAlert(id) {
  requirePermission(PERMISSIONS.VIEW_ANALYTICS)
  await delay()
  const a = alerts.find((x) => x.id === id)
  if (!a) throw new NotFoundError(`Alert ${id} not found`)
  return a
}

export async function getAlertStats() {
  requirePermission(PERMISSIONS.VIEW_ANALYTICS)
  await delay(120)
  const open = alerts.filter((a) => a.status !== 'resolved' && a.status !== 'dismissed')
  return {
    total: alerts.length,
    critical: open.filter((a) => a.riskLevel === 'critical').length,
    high: open.filter((a) => a.riskLevel === 'high').length,
    medium: open.filter((a) => a.riskLevel === 'medium').length,
    low: open.filter((a) => a.riskLevel === 'low').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    dismissed: alerts.filter((a) => a.status === 'dismissed').length,
  }
}

// --- officer actions ------------------------------------------------------
function mutate(id, fn) {
  const a = alerts.find((x) => x.id === id)
  if (!a) throw new NotFoundError(`Alert ${id} not found`)
  fn(a)
  return a
}

export async function reviewAlert(id, officer) {
  await delay(150)
  return mutate(id, (a) => { if (a.status === 'open') a.status = 'reviewing'; push(a, officer, 'reviewed', 'Marked as under review.') })
}

export async function assignInspection(id, officer) {
  await delay(150)
  return mutate(id, (a) => { if (a.status === 'open') a.status = 'reviewing'; push(a, officer, 'assigned-inspection', 'Flagged for a follow-up inspection.') })
}

export async function addNote(id, note, officer) {
  await delay(150)
  if (!note?.trim()) throw new Error('Note cannot be empty.')
  return mutate(id, (a) => push(a, officer, 'note', note.trim()))
}

export async function resolveAlert(id, officer, note) {
  await delay(150)
  return mutate(id, (a) => { a.status = 'resolved'; a.resolvedAt = new Date().toISOString(); push(a, officer, 'resolved', note?.trim() || 'Reviewed and resolved.') })
}

export async function dismissAlert(id, reason, officer) {
  await delay(150)
  if (!reason?.trim()) throw new Error('A dismissal reason is required.')
  return mutate(id, (a) => { a.status = 'dismissed'; a.dismissedAt = new Date().toISOString(); push(a, officer, 'dismissed', `Dismissed: ${reason.trim()}`) })
}

// --- charts ---------------------------------------------------------------
export async function getChartData() {
  requirePermission(PERMISSIONS.VIEW_ANALYTICS)
  await delay(150)
  const s = buildChartSeries()
  // Inspection trend: current status distribution (from inspection records).
  const statusOrder = ['completed', 'in-progress', 'scheduled', 'assigned', 'pending', 'overdue']
  const byStatus = statusOrder
    .map((st) => ({ label: st, value: INSPECTIONS.filter((i) => i.status === st).length }))
    .filter((d) => d.value > 0)
  return { ...s, inspectionsByStatus: byStatus }
}
