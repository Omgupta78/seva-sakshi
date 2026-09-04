/**
 * ---------------------------------------------------------------------
 * CAMERA CONFIGURATION — non-sensitive camera records only
 * ---------------------------------------------------------------------
 * This file is the "camera configuration" layer. It holds only metadata
 * that is safe to send to a browser: which project a camera belongs to,
 * where it is placed, its current health status and heartbeat, and the
 * *source* protocol it speaks (rtsp / webrtc). It deliberately does NOT
 * contain any RTSP URL, IP address, username, password or stream key —
 * those are camera credentials and live server-side only (see
 * services/cctvStreamService.js for where the real broker would hold
 * them). Everything here is demo data; no real government camera is
 * connected.
 *
 * When a backend exists this is a like-for-like swap for GET /api/cameras.
 * ---------------------------------------------------------------------
 */

/** Source protocols a camera/gateway can speak. Never played directly in a browser. */
export const SOURCE_PROTOCOLS = ['rtsp', 'webrtc']

export const CAMERA_STATUSES = ['online', 'offline', 'warning']

/** Where in the premises a camera looks — never a person, only a public/common area. */
const PLACEMENTS = {
  gate: 'Main Gate',
  reception: 'Reception',
  dining: 'Dining Hall',
  corridor: 'Dormitory Corridor',
  classroom: 'Classroom Block',
  store: 'Store Room',
  hall: 'Training Hall',
  ground: 'Playground',
}

/**
 * Camera-intrinsic config. `projectId` links each camera to a project in
 * projectsSeedData.js; the service resolves project / organization /
 * location so we never duplicate that here. `mapOffset` nudges co-sited
 * cameras apart on the schematic map. `heartbeatAgeSec` is turned into a
 * concrete timestamp at load time so "last heartbeat" reads realistically.
 */
const CAMERA_BASE = [
  { projectId: 'PRJ-2201', placement: PLACEMENTS.gate, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 6, mapOffset: [-2, -2] },
  { projectId: 'PRJ-2201', placement: PLACEMENTS.dining, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 12, mapOffset: [2, 3] },
  { projectId: 'PRJ-2202', placement: PLACEMENTS.gate, status: 'offline', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 4 * 3600, mapOffset: [-2, 2] },
  { projectId: 'PRJ-2202', placement: PLACEMENTS.corridor, status: 'warning', protocol: 'rtsp', resolution: '720p', fps: 15, heartbeatAgeSec: 220, mapOffset: [3, -1] },
  { projectId: 'PRJ-2203', placement: PLACEMENTS.reception, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 9, mapOffset: [-3, 1] },
  { projectId: 'PRJ-2203', placement: PLACEMENTS.classroom, status: 'warning', protocol: 'webrtc', resolution: '720p', fps: 20, heartbeatAgeSec: 140, mapOffset: [2, 2] },
  { projectId: 'PRJ-2204', placement: PLACEMENTS.gate, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 15, mapOffset: [0, 0] },
  { projectId: 'PRJ-2205', placement: PLACEMENTS.reception, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 22, mapOffset: [-2, -2] },
  { projectId: 'PRJ-2205', placement: PLACEMENTS.store, status: 'offline', protocol: 'rtsp', resolution: '720p', fps: 15, heartbeatAgeSec: 11 * 3600, mapOffset: [2, 2] },
  { projectId: 'PRJ-2206', placement: PLACEMENTS.hall, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 30, mapOffset: [0, 0] },
  { projectId: 'PRJ-2207', placement: PLACEMENTS.gate, status: 'offline', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 2 * 3600, mapOffset: [0, 0] },
  { projectId: 'PRJ-2208', placement: PLACEMENTS.gate, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 18, mapOffset: [-2, 2] },
  { projectId: 'PRJ-2208', placement: PLACEMENTS.ground, status: 'warning', protocol: 'rtsp', resolution: '720p', fps: 15, heartbeatAgeSec: 300, mapOffset: [3, -2] },
  { projectId: 'PRJ-2209', placement: PLACEMENTS.reception, status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, heartbeatAgeSec: 8, mapOffset: [0, 0] },
  { projectId: 'PRJ-2210', placement: PLACEMENTS.gate, status: 'offline', protocol: 'rtsp', resolution: '720p', fps: 15, heartbeatAgeSec: 8 * 3600, mapOffset: [0, 0] },
]

const bootTime = Date.now()

/** Zero-padded sequential camera ids, e.g. CAM-0001. */
function camId(i) {
  return `CAM-${String(i + 1).padStart(4, '0')}`
}

export const CAMERAS = CAMERA_BASE.map((c, i) => {
  const heartbeat = new Date(bootTime - c.heartbeatAgeSec * 1000)
  // Online cameras "updated" at their last heartbeat; a stale/offline camera's
  // record was last touched when it was last reachable.
  return {
    id: camId(i),
    projectId: c.projectId,
    placement: c.placement,
    label: `${c.placement}`,
    status: c.status,
    sourceProtocol: c.protocol,
    resolution: c.resolution,
    fps: c.fps,
    lastHeartbeat: heartbeat.toISOString(),
    lastUpdated: heartbeat.toISOString(),
    mapOffset: c.mapOffset,
    installedOn: `2025-${String(((i * 3) % 12) + 1).padStart(2, '0')}-${String(((i * 7) % 27) + 1).padStart(2, '0')}`,
  }
})
