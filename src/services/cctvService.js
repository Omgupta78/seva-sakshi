/**
 * ---------------------------------------------------------------------
 * CCTV SERVICE — reads camera configuration, health and system alerts
 * ---------------------------------------------------------------------
 * Same demo-service pattern as projectsService.js: async functions with the
 * shape a real API client would have, over an in-memory store seeded from
 * data/cctvSeedData.js. Swap each body for a fetch() to go live.
 *
 * Note the split of responsibilities:
 *   - THIS file answers "what cameras exist, are they healthy?" (config +
 *     status). It never touches video.
 *   - services/cctvStreamService.js brokers the actual video and is the only
 *     place aware of transports/tokens.
 * Components depend on both but for different things, which keeps camera
 * configuration, streaming, and the player cleanly separated.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { CAMERAS } from '../data/cctvSeedData.js'
import { PROJECTS, ORGANIZATIONS, LOCATIONS } from '../data/projectsSeedData.js'
import { requirePermission, getActor } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'
import { record as recordAudit } from './auditService.js'

const store = [...CAMERAS]

/** Join a camera to its project / organization / location for display. */
function resolveCamera(cam) {
  const project = PROJECTS.find((p) => p.id === cam.projectId)
  const org = project ? ORGANIZATIONS.find((o) => o.id === project.organizationId) : null
  const location = project ? LOCATIONS.find((l) => l.id === project.locationId) : null
  const base = project?.mapPosition ?? null
  const [dx, dy] = cam.mapOffset ?? [0, 0]
  return {
    ...cam,
    projectName: project?.name ?? 'Unknown project',
    organizationId: org?.id ?? null,
    organizationName: org?.name ?? 'Unknown organization',
    state: location?.state ?? '—',
    district: location?.district ?? '—',
    mapPosition: base ? { x: Math.max(3, Math.min(97, base.x + dx)), y: Math.max(3, Math.min(97, base.y + dy)) } : null,
  }
}

/**
 * @param {Object} params
 * @param {string} [params.search]
 * @param {string} [params.state] 'all' | state name
 * @param {string} [params.district] 'all' | district name
 * @param {string} [params.projectId] 'all' | project id
 * @param {string} [params.organizationId] 'all' | organization id
 * @param {string} [params.status] 'all' | 'online' | 'offline' | 'warning'
 */
export async function listCameras(params = {}) {
  requirePermission(PERMISSIONS.VIEW_CCTV)
  await delay()
  const { search = '', state = 'all', district = 'all', projectId = 'all', organizationId = 'all', status = 'all' } = params

  let rows = store.map(resolveCamera)

  const q = search.trim().toLowerCase()
  if (q) {
    rows = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.organizationName.toLowerCase().includes(q)
    )
  }
  if (state !== 'all') rows = rows.filter((r) => r.state === state)
  if (district !== 'all') rows = rows.filter((r) => r.district === district)
  if (projectId !== 'all') rows = rows.filter((r) => r.projectId === projectId)
  if (organizationId !== 'all') rows = rows.filter((r) => r.organizationId === organizationId)
  if (status !== 'all') rows = rows.filter((r) => r.status === status)

  // Unhealthy first (offline, then warning, then online), then by id.
  const rank = { offline: 0, warning: 1, online: 2 }
  rows.sort((a, b) => (rank[a.status] - rank[b.status]) || a.id.localeCompare(b.id))

  return { items: rows, total: rows.length }
}

export async function getCamera(id) {
  requirePermission(PERMISSIONS.VIEW_CCTV)
  await delay()
  const found = store.find((c) => c.id === id)
  if (!found) throw new NotFoundError(`Camera ${id} not found`)
  const cam = resolveCamera(found)
  return { ...cam, alerts: buildAlertsForCamera(cam) }
}

// --- camera lifecycle -----------------------------------------------------
function mutateCamera(id, patch) {
  const cam = store.find((c) => c.id === id)
  if (!cam) throw new NotFoundError(`Camera ${id} not found`)
  Object.assign(cam, patch)
  return resolveCamera(cam)
}

/** Temporarily disable a camera (reversible). Historical events are kept. */
export async function disableCamera(id, reason) {
  requirePermission(PERMISSIONS.CAMERA_DECOMMISSION)
  await delay(150)
  const cam = mutateCamera(id, { status: 'disabled', disabledAt: new Date().toISOString() })
  recordAudit('CAMERA_DISABLED', { entityId: id, projectId: cam.projectId, metadata: { reason: reason || undefined } })
  return cam
}

/** Re-enable a disabled camera. */
export async function enableCamera(id) {
  requirePermission(PERMISSIONS.CAMERA_DECOMMISSION)
  await delay(150)
  const cam = mutateCamera(id, { status: 'online', disabledAt: null })
  recordAudit('CAMERA_ENABLED', { entityId: id, projectId: cam.projectId })
  return cam
}

/** Permanently retire a camera (soft) — kept for its historical record. */
export async function decommissionCamera(id, reason) {
  requirePermission(PERMISSIONS.CAMERA_DECOMMISSION)
  await delay(150)
  const cam = mutateCamera(id, { status: 'decommissioned', decommissionedAt: new Date().toISOString(), decommissionedBy: getActor().name })
  recordAudit('CAMERA_DECOMMISSIONED', { entityId: id, projectId: cam.projectId, metadata: { reason: reason || undefined } })
  return cam
}

/**
 * Recorded-playback timeline for one camera (Department deepen feature).
 * Returns brokered, safe segment descriptors for the last `hours` — an offline
 * camera has a gap for its most recent block (no footage while it was down).
 * There is no real recorder here, so segments carry no URL; a real gateway
 * would return short-lived HLS clip URLs per segment.
 */
export async function getCameraPlaybackTimeline(id, { hours = 12, blockHours = 2 } = {}) {
  requirePermission(PERMISSIONS.VIEW_CCTV)
  await delay(180)
  const cam = store.find((c) => c.id === id)
  if (!cam) throw new NotFoundError(`Camera ${id} not found`)
  const now = Date.now()
  const blocks = Math.round(hours / blockHours)
  const segments = Array.from({ length: blocks }, (_, i) => {
    const end = new Date(now - i * blockHours * 3600000)
    const start = new Date(end.getTime() - blockHours * 3600000)
    // Most recent block is a gap when the camera is offline/warning-dropout.
    const gap = (i === 0 && cam.status === 'offline') || (i === 1 && cam.status === 'warning')
    return { start: start.toISOString(), end: end.toISOString(), available: !gap }
  }).reverse()
  return { cameraId: id, retentionDays: 30, segments, note: 'Prototype — no recorded footage is bundled; a live deployment serves brokered HLS clips per segment.' }
}

/** Status-change event history for one camera (audit-style, device health only). */
export async function getCameraEventHistory(id) {
  requirePermission(PERMISSIONS.VIEW_CCTV)
  await delay(140)
  const cam = store.find((c) => c.id === id)
  if (!cam) throw new NotFoundError(`Camera ${id} not found`)
  const now = Date.now()
  const base = [
    { at: new Date(now - 3600000).toISOString(), event: cam.status === 'online' ? 'Heartbeat OK' : cam.status === 'warning' ? 'Connection unstable' : 'Camera went offline', severity: cam.status === 'online' ? 'info' : cam.status === 'warning' ? 'warning' : 'critical' },
    { at: new Date(now - 6 * 3600000).toISOString(), event: 'Heartbeat OK', severity: 'info' },
    { at: new Date(now - 24 * 3600000).toISOString(), event: 'Firmware heartbeat verified', severity: 'info' },
    { at: `${cam.installedOn}T09:00:00`, event: 'Camera commissioned', severity: 'info' },
  ]
  return { items: base }
}

/** Fleet analytics for the monitoring dashboard (Department deepen feature). */
export async function getCctvAnalytics() {
  requirePermission(PERMISSIONS.VIEW_CCTV)
  await delay(150)
  const rows = store.map(resolveCamera)
  const total = rows.length
  const online = rows.filter((r) => r.status === 'online').length
  const byDistrict = {}
  for (const r of rows) {
    const d = byDistrict[r.district] ?? { district: r.district, total: 0, online: 0, offline: 0, warning: 0 }
    d.total++; d[r.status] = (d[r.status] ?? 0) + 1
    byDistrict[r.district] = d
  }
  const districts = Object.values(byDistrict)
    .map((d) => ({ ...d, uptimePct: d.total ? Math.round((d.online / d.total) * 100) : 0 }))
    .sort((a, b) => a.uptimePct - b.uptimePct)
  return { uptimePct: total ? Math.round((online / total) * 100) : 0, districts }
}

/** Rolled-up fleet health for the KPI row. */
export async function getCctvHealth() {
  await delay()
  const rows = store
  const count = (s) => rows.filter((c) => c.status === s).length
  return {
    total: rows.length,
    online: count('online'),
    offline: count('offline'),
    warning: count('warning'),
  }
}

/**
 * Build the current CCTV alerts. These are strictly connectivity / device
 * health alerts derived from camera status and heartbeat age. This module
 * does NOT analyse video content, so it never raises "suspicious activity"
 * or behavioural alerts — those would require a separate, explicitly-built
 * and human-reviewed detection system.
 */
function buildAlertsForCamera(cam) {
  const alerts = []
  const heartbeatAgeSec = (Date.now() - new Date(cam.lastHeartbeat).getTime()) / 1000

  if (cam.status === 'offline') {
    alerts.push({
      type: 'camera-offline',
      severity: 'critical',
      message: `${cam.label} is offline. Last heartbeat ${formatAge(heartbeatAgeSec)} ago.`,
    })
  }
  if (cam.status === 'warning') {
    // A stale heartbeat on a still-"up" camera reads as a missed heartbeat;
    // otherwise it's an unstable link.
    if (heartbeatAgeSec > 180) {
      alerts.push({
        type: 'no-heartbeat',
        severity: 'warning',
        message: `${cam.label} missed its heartbeat window. Last seen ${formatAge(heartbeatAgeSec)} ago.`,
      })
    } else {
      alerts.push({
        type: 'connection-unstable',
        severity: 'warning',
        message: `${cam.label} connection is unstable — intermittent packet loss.`,
      })
    }
  }

  return alerts.map((a, i) => ({
    id: `ALRT-${cam.id}-${i}`,
    cameraId: cam.id,
    cameraName: cam.label,
    projectName: cam.projectName,
    district: cam.district,
    raisedAt: cam.lastHeartbeat,
    acknowledged: false,
    ...a,
  }))
}

/**
 * @param {Object} params
 * @param {string} [params.severity] 'all' | 'critical' | 'warning'
 * @param {string} [params.type] 'all' | 'camera-offline' | 'no-heartbeat' | 'connection-unstable'
 */
export async function listCctvAlerts(params = {}) {
  await delay()
  const { severity = 'all', type = 'all' } = params
  let alerts = store.map(resolveCamera).flatMap(buildAlertsForCamera)
  if (severity !== 'all') alerts = alerts.filter((a) => a.severity === severity)
  if (type !== 'all') alerts = alerts.filter((a) => a.type === type)
  const rank = { critical: 0, warning: 1 }
  alerts.sort((a, b) => (rank[a.severity] - rank[b.severity]) || new Date(a.raisedAt) - new Date(b.raisedAt))
  return { items: alerts, total: alerts.length }
}

/** Distinct filter options, derived from the resolved fleet. */
export async function getCctvFilterOptions() {
  await delay(120)
  const rows = store.map(resolveCamera)
  const uniq = (arr) => [...new Set(arr)].sort()
  return {
    states: uniq(rows.map((r) => r.state)),
    districts: uniq(rows.map((r) => r.district)),
    projects: uniq(rows.map((r) => `${r.projectId}||${r.projectName}`)).map((s) => {
      const [id, name] = s.split('||')
      return { id, name }
    }),
    organizations: uniq(rows.map((r) => `${r.organizationId}||${r.organizationName}`)).map((s) => {
      const [id, name] = s.split('||')
      return { id, name }
    }),
  }
}

function formatAge(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`
  return `${Math.round(seconds / 86400)}d`
}

export { formatAge }
