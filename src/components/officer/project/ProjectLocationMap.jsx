const RISK_COLOR = { healthy: '#138808', watch: '#e2a610', high: '#D6262B' }

/**
 * Small schematic-map location indicator for a single project. Not every
 * project record has `mapPosition` (matches the brief: "if the current
 * project supports maps") — when absent, this renders a clear notice
 * instead of a misleading blank map.
 */
export default function ProjectLocationMap({ project }) {
  if (!project.mapPosition) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-plum-950/15 bg-plum-50/40 text-center text-sm text-plum-950/50">
        Map location is not available for this project.
      </div>
    )
  }

  const { x, y } = project.mapPosition
  const color = RISK_COLOR[project.riskLevel] ?? RISK_COLOR.watch

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#eef0fb]">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`Schematic map showing ${project.name} in ${project.district}`}>
          <path
            d="M10,15 L35,5 L60,10 L85,20 L95,40 L88,60 L92,85 L65,95 L40,90 L15,80 L5,55 L12,35 Z"
            fill="#dfe3f7"
            stroke="#c3c9ec"
            strokeWidth="0.6"
          />
          <g transform={`translate(${x}, ${y})`}>
            <circle r="4.5" fill={color} opacity="0.25" />
            <circle r="2.6" fill={color} stroke="#fff" strokeWidth="0.7" />
          </g>
        </svg>
      </div>
      <p className="mt-2 text-xs text-plum-950/50 italic">
        {project.district}, {project.state} — schematic map, not to scale.
      </p>
    </div>
  )
}
