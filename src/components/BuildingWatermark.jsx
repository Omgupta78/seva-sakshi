/**
 * Subtle government-building illustration used as a watermark behind the
 * hero-left copy — dome, columned facade, steps, flag and a couple of
 * trees, drawn as flat filled silhouette shapes in `currentColor` so a
 * single text-color + opacity utility controls its whole tone.
 */
export default function BuildingWatermark({ className }) {
  return (
    <svg
      viewBox="0 0 560 360"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {/* flagpole + flag */}
      <rect x="279" y="18" width="2" height="34" />
      <path d="M281 20 L305 27 L281 34 Z" />

      {/* dome */}
      <path d="M245 78 C245 42 315 42 315 78 Z" />
      <rect x="272" y="52" width="16" height="14" />

      {/* drum beneath dome */}
      <rect x="255" y="76" width="50" height="14" />

      {/* pediment (triangular roof) */}
      <path d="M170 122 L280 78 L390 122 Z" />
      <rect x="180" y="118" width="200" height="10" />

      {/* main facade block */}
      <rect x="190" y="128" width="180" height="130" />

      {/* columns */}
      {[205, 235, 265, 295, 325, 345].map((x) => (
        <rect key={x} x={x} y="140" width="10" height="105" fill="#ffffff" fillOpacity="0.55" />
      ))}

      {/* base / steps */}
      <rect x="150" y="258" width="260" height="14" />
      <rect x="130" y="272" width="300" height="14" />
      <rect x="110" y="286" width="340" height="14" />

      {/* side wings */}
      <rect x="70" y="190" width="100" height="96" />
      <rect x="390" y="190" width="100" height="96" />
      <path d="M70 190 L120 165 L170 190 Z" />
      <path d="M390 190 L440 165 L490 190 Z" />

      {/* trees */}
      <g>
        <rect x="42" y="255" width="6" height="35" />
        <circle cx="45" cy="245" r="22" />
      </g>
      <g>
        <rect x="512" y="255" width="6" height="35" />
        <circle cx="515" cy="245" r="22" />
      </g>
    </svg>
  )
}
