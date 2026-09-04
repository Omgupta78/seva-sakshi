/**
 * ---------------------------------------------------------------------
 * GEO DATA — real coordinates for on-site location verification
 * ---------------------------------------------------------------------
 * The officer-side StateMap uses schematic x/y percentages (deliberately
 * "not to scale"). Those are useless for measuring how far an inspector
 * actually is from a site, so this file adds approximate real lat/lng
 * for each district, plus a small deterministic per-project offset so
 * two projects in the same district aren't at literally the same point.
 *
 * In a real deployment each Project row would carry its own surveyed
 * latitude/longitude and this derivation would be deleted.
 * ---------------------------------------------------------------------
 */

/** Approximate district centres (degrees). Good enough for a "are you roughly at the site?" check. */
export const DISTRICT_COORDS = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Thane: { lat: 19.2183, lng: 72.9781 },
  Solapur: { lat: 17.6599, lng: 75.9064 },
  Kolhapur: { lat: 16.705, lng: 74.2433 },
  Amravati: { lat: 20.9374, lng: 77.7796 },
}

/** An inspector within this many km of the registered site counts as "on site". */
export const VERIFICATION_RADIUS_KM = 1

/** Stable pseudo-offset (roughly ±1.5 km) derived from the project id, so co-district projects differ. */
function offsetFor(projectId) {
  let hash = 0
  for (let i = 0; i < projectId.length; i++) hash = (hash * 31 + projectId.charCodeAt(i)) | 0
  const latOffset = ((hash % 27) - 13) / 1000
  const lngOffset = (((hash >> 5) % 27) - 13) / 1000
  return { latOffset, lngOffset }
}

/** The project's registered location — what the inspector's GPS gets compared against. */
export function projectCoordinates(project, district) {
  const base = DISTRICT_COORDS[district]
  if (!base) return null
  const { latOffset, lngOffset } = offsetFor(project?.id ?? 'PRJ')
  return { lat: +(base.lat + latOffset).toFixed(5), lng: +(base.lng + lngOffset).toFixed(5) }
}

/** Great-circle distance in km. */
export function haversineKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(km) {
  if (km === null || km === undefined) return '—'
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export function formatCoords(coords) {
  if (!coords) return '—'
  return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
}
