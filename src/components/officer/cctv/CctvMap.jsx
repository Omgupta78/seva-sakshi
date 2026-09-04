import { useNavigate } from 'react-router-dom'

const STATUS_COLOR = { online: '#138808', warning: '#e2a610', offline: '#D6262B' }

/**
 * Schematic fleet map — plots every camera on the same "not to scale"
 * outline the project maps use, coloured by status. Clicking a marker opens
 * that camera. Cameras without a mapped project position are listed below so
 * they aren't silently dropped.
 */
export default function CctvMap({ cameras }) {
  const navigate = useNavigate()
  const mapped = cameras.filter((c) => c.mapPosition)
  const unmapped = cameras.filter((c) => !c.mapPosition)

  return (
    <div className="rounded-2xl border border-plum-950/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-plum-950">Camera Locations</h2>
        <div className="flex items-center gap-3 text-xs text-plum-950/70">
          {Object.entries(STATUS_COLOR).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1 capitalize">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden="true" />
              {status}
            </span>
          ))}
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#eef0fb]">
        <svg viewBox="0 0 100 62" className="h-full w-full" role="img" aria-label="Schematic map of camera locations across Maharashtra districts">
          <path
            d="M10,12 L35,5 L60,8 L85,16 L95,30 L88,46 L92,58 L65,60 L40,57 L15,52 L5,34 L12,22 Z"
            fill="#dfe3f7"
            stroke="#c3c9ec"
            strokeWidth="0.5"
          />
          {mapped.map((cam) => {
            const color = STATUS_COLOR[cam.status] ?? STATUS_COLOR.warning
            // project x/y are on a 0–100 grid; map height here is 62.
            const cx = cam.mapPosition.x
            const cy = (cam.mapPosition.y / 100) * 62
            return (
              <g
                key={cam.id}
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer"
                onClick={() => navigate(`/officer/cctv/${cam.id}`)}
                role="button"
                aria-label={`${cam.id} ${cam.label}, ${cam.district} — ${cam.status}`}
              >
                <circle r="2.6" fill={color} opacity="0.22" />
                <circle r="1.5" fill={color} stroke="#fff" strokeWidth="0.4" />
              </g>
            )
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-plum-950/50 italic">Maharashtra districts — schematic map, not to scale. Select a marker to open the camera.</p>

      {unmapped.length > 0 && (
        <p className="mt-2 text-xs text-plum-950/55">
          {unmapped.length} camera{unmapped.length > 1 ? 's' : ''} without a mapped location: {unmapped.map((c) => c.id).join(', ')}
        </p>
      )}
    </div>
  )
}
