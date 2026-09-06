/**
 * ---------------------------------------------------------------------
 * INSTITUTION CCTV SERVICE — scoped camera reads for Inspector + attendance
 * ---------------------------------------------------------------------
 * Reads the institution-scoped camera layer (institutionCctvData.js) for two
 * consumers that must NOT see the whole Department fleet:
 *   - the Inspector, who may view cameras ONLY for an assigned institution;
 *   - the attendance link, which flags a class whose covering camera is down.
 *
 * As everywhere in CCTV: only safe metadata is returned — never an RTSP URL,
 * IP, credential or stream key. No real camera is connected; live tiles render
 * a clearly-labelled placeholder.
 * ---------------------------------------------------------------------
 */
import { delay, NotFoundError } from './apiClient.js'
import { requireAnyPermission, getActor } from './authz.js'
import { PERMISSIONS } from '../data/rbac.js'
import { record as recordAudit } from './auditService.js'
import { loadStore, saveStore } from './persist.js'
import { INSTITUTION_CAMERAS } from '../data/institutionCctvData.js'

const CCTV_READ = [PERMISSIONS.VIEW_CCTV, PERMISSIONS.VIEW_ASSIGNED_CCTV, PERMISSIONS.VIEW_OWN_CCTV]
const HEALTH_READ = [PERMISSIONS.VIEW_ATTENDANCE, PERMISSIONS.VIEW_CCTV, PERMISSIONS.VIEW_ASSIGNED_CCTV, PERMISSIONS.VIEW_OWN_CCTV]

const scope = (institutionId) => INSTITUTION_CAMERAS.filter((c) => c.institutionId === institutionId)

/** Cameras for one institution (Inspector: only an assigned institution). */
export async function listInstitutionCameras(institutionId = 'INST-001') {
  requireAnyPermission(CCTV_READ)
  await delay()
  const rank = { offline: 0, warning: 1, online: 2 }
  const items = scope(institutionId).map((c) => ({ ...c })).sort((a, b) => (rank[a.status] - rank[b.status]) || a.id.localeCompare(b.id))
  return { items, total: items.length, institutionName: items[0]?.institutionName ?? null }
}

/** Rolled-up health + per-class coverage, used by the attendance↔CCTV link. */
export async function getInstitutionCctvHealth(institutionId = 'INST-001') {
  requireAnyPermission(HEALTH_READ)
  await delay(120)
  const cams = scope(institutionId)
  const count = (s) => cams.filter((c) => c.status === s).length
  // For every class a camera covers, report the worst covering-camera status.
  const byClass = {}
  const worst = (a, b) => ({ offline: 0, warning: 1, online: 2 }[a] <= { offline: 0, warning: 1, online: 2 }[b] ? a : b)
  for (const c of cams) for (const cls of c.covers) {
    byClass[cls] = byClass[cls] ? { ...byClass[cls], status: worst(byClass[cls].status, c.status), cameras: [...byClass[cls].cameras, c.id] }
      : { class: cls, status: c.status, cameras: [c.id] }
  }
  return {
    total: cams.length, online: count('online'), offline: count('offline'), warning: count('warning'),
    byClass, // { 'Class 12-A': { status:'offline', cameras:['ICAM-05'] }, ... }
  }
}

/**
 * Safe playback descriptor for one institution camera. Same honest contract as
 * the Department stream broker: no URL/credential, offline → unavailable, and
 * (no real gateway) a placeholder feed.
 */
export async function requestInstitutionPlayback(cameraId) {
  requireAnyPermission(CCTV_READ)
  await delay(200)
  const cam = INSTITUTION_CAMERAS.find((c) => c.id === cameraId)
  if (!cam) throw new NotFoundError(`Camera ${cameraId} not found`)
  if (cam.status === 'offline') {
    return { cameraId, available: false, transport: null, mode: 'placeholder', reason: 'Camera is offline — no active source to stream.' }
  }
  return {
    cameraId, available: true,
    transport: cam.sourceProtocol === 'webrtc' ? 'webrtc' : 'hls',
    mode: 'placeholder', playbackUrl: null,
    token: `demo_${cameraId}_${Date.now().toString(36)}`,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    reason: cam.status === 'warning' ? 'Connection is unstable — feed may drop or lag.' : null,
  }
}

// --- inspector snapshot evidence -----------------------------------------
const CAMERA_EVIDENCE_KEY = 'camera-evidence'
let cameraEvidence = loadStore(CAMERA_EVIDENCE_KEY, () => [])

/**
 * Inspector attaches a camera snapshot as evidence during an inspection. The
 * "snapshot" is a placeholder frame (no real feed); this records the metadata
 * — which camera, when, by whom, with a note — for the inspection record.
 */
export async function attachCameraEvidence({ inspectionId, cameraId, area, note }) {
  requireAnyPermission([PERMISSIONS.VIEW_ASSIGNED_CCTV])
  await delay(200)
  const cam = INSTITUTION_CAMERAS.find((c) => c.id === cameraId)
  if (!cam) throw new NotFoundError(`Camera ${cameraId} not found`)
  const item = {
    id: `CEV-${cameraEvidence.length + 1}`,
    inspectionId: inspectionId ?? null,
    cameraId, area: area ?? cam.area,
    note: note?.trim() || `Camera snapshot captured at ${cam.area}.`,
    capturedBy: getActor().name, role: getActor().role, at: new Date().toISOString(),
    kind: 'camera-snapshot',
  }
  cameraEvidence.unshift(item)
  saveStore(CAMERA_EVIDENCE_KEY, cameraEvidence)
  recordAudit('CAMERA_EVIDENCE_CAPTURED', { entityId: inspectionId ?? item.id, metadata: { camera: cameraId, area: item.area } })
  return item
}

export async function listCameraEvidence(inspectionId) {
  requireAnyPermission([PERMISSIONS.VIEW_ASSIGNED_CCTV, PERMISSIONS.VIEW_CCTV])
  await delay(100)
  const items = inspectionId ? cameraEvidence.filter((e) => e.inspectionId === inspectionId) : [...cameraEvidence]
  return { items }
}
