import { MapPin, Crosshair, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { formatCoords, formatDistance, VERIFICATION_RADIUS_KM } from '../../data/geoData.js'

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 border-b border-plum-950/5 py-2 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-plum-950/40" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-plum-950/50 uppercase">{label}</p>
        <p className="font-mono text-sm break-all text-plum-950">{value}</p>
      </div>
    </div>
  )
}

/**
 * On-site location check: registered project coordinates vs the
 * device's current GPS fix, with the distance between them.
 *
 * Note the deliberately narrow claim in the footnote — being near the
 * site at one moment is evidence of attendance, nothing more. It must
 * not be presented as proof that the inspection was actually carried
 * out, and the UI says so.
 */
export default function GeoVerificationPanel({ projectCoords, currentCoords, distanceKm, status, error, onRequest, onSimulate, compact }) {
  const verified = distanceKm !== null && distanceKm !== undefined && distanceKm <= VERIFICATION_RADIUS_KM

  return (
    <section className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-bold text-plum-950">Location Verification</h2>

      <Row icon={MapPin} label="Project Location" value={formatCoords(projectCoords)} />
      <Row icon={Crosshair} label="Current Location" value={currentCoords ? formatCoords(currentCoords) : 'Not captured yet'} />
      <Row icon={Info} label="Distance" value={distanceKm === null || distanceKm === undefined ? '—' : formatDistance(distanceKm)} />

      {currentCoords && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-sm font-semibold ${
            verified ? 'bg-green-50 text-[#16794f]' : 'bg-amber-50 text-[#a15c00]'
          }`}
        >
          {verified ? (
            <>
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>Location Verified — within {VERIFICATION_RADIUS_KM} km of the registered site.</span>
            </>
          ) : (
            <>
              <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>Inspector appears to be away from the project location.</span>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-[#D6262B]">{error}</p>}

      {!compact && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onRequest}
            disabled={status === 'requesting'}
            className="min-h-12 w-full rounded-xl border-2 border-plum-800 px-4 text-sm font-bold text-plum-800 active:bg-plum-50 disabled:opacity-60"
          >
            {status === 'requesting' ? 'Getting location…' : currentCoords ? 'Refresh Location' : 'Capture Current Location'}
          </button>
          {onSimulate && (
            <button
              type="button"
              onClick={onSimulate}
              className="min-h-11 w-full rounded-xl border border-dashed border-plum-950/25 px-4 text-xs font-semibold text-plum-950/50 active:bg-plum-50"
            >
              Demo: simulate being on site
            </button>
          )}
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-plum-950/50">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        This records where the device was at the time of the check. It does not verify that every recorded
        activity was physically carried out — the checklist, evidence and report remain the inspector's
        attestation.
      </p>
    </section>
  )
}
