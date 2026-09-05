/**
 * ---------------------------------------------------------------------
 * INSTITUTION SITE CAMERAS — scoped, non-sensitive camera records
 * ---------------------------------------------------------------------
 * A light camera layer for the demo institution (INST-001, Government Ashram
 * Shala, Wada). It is separate from the Department's project-keyed fleet
 * (cctvSeedData.js) so scoping a camera to an institution — and to the classes
 * a camera covers — is explicit, and the Inspector/attendance links can read a
 * clean, institution-scoped source without touching the Department fleet.
 *
 * As with the Department fleet, this holds ONLY safe metadata: area, health,
 * heartbeat, source protocol. NEVER an RTSP URL, IP, credential or stream key —
 * those stay on the server-side gateway. No real camera is connected.
 * ---------------------------------------------------------------------
 */

const boot = Date.now()
const heartbeat = (ageSec) => new Date(boot - ageSec * 1000).toISOString()

/** `covers` lists the class labels a camera oversees, linking CCTV to attendance. */
const BASE = [
  { id: 'ICAM-01', area: 'Main Gate', covers: [], status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, ageSec: 7 },
  { id: 'ICAM-02', area: 'Reception', covers: [], status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, ageSec: 14 },
  { id: 'ICAM-03', area: 'Class 10-A Block', covers: ['Class 10-A'], status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, ageSec: 9 },
  { id: 'ICAM-04', area: 'Class 10-B / 11-A Block', covers: ['Class 10-B', 'Class 11-A'], status: 'warning', protocol: 'webrtc', resolution: '720p', fps: 20, ageSec: 190 },
  { id: 'ICAM-05', area: 'Class 12-A Block', covers: ['Class 12-A'], status: 'offline', protocol: 'rtsp', resolution: '1080p', fps: 25, ageSec: 3 * 3600 },
  { id: 'ICAM-06', area: 'Dining Hall', covers: [], status: 'online', protocol: 'rtsp', resolution: '1080p', fps: 25, ageSec: 20 },
  { id: 'ICAM-07', area: 'Playground', covers: [], status: 'online', protocol: 'rtsp', resolution: '720p', fps: 15, ageSec: 33 },
]

export const INSTITUTION_CAMERAS = BASE.map((c) => ({
  institutionId: 'INST-001',
  institutionName: 'Government Ashram Shala, Wada',
  id: c.id,
  area: c.area,
  label: c.area,
  covers: c.covers,
  status: c.status,
  sourceProtocol: c.protocol,
  resolution: c.resolution,
  fps: c.fps,
  lastHeartbeat: heartbeat(c.ageSec),
  installedOn: '2025-05-14',
}))
