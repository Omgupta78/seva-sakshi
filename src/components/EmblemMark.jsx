/**
 * Self-contained inline-SVG emblem badge used in the header, evoking an
 * official state emblem (chakra + capital + plinth) without reproducing
 * the exact protected State Emblem of India artwork — swap for the real
 * emblem asset if this is used for an actual government deployment.
 */
export default function EmblemMark({ className = 'h-14 w-14' }) {
  const gold = '#E8C989'
  return (
    <svg viewBox="0 0 64 56" className={className} role="img" aria-label="State Emblem of India (placeholder)">
      {/* three-peak capital, evoking the lion silhouettes */}
      <path d="M14 14 L23 3 L32 14 L41 3 L50 14 Z" fill={gold} />
      {/* abacus / chakra medallion */}
      <circle cx="32" cy="24" r="15" fill="none" stroke={gold} strokeWidth="1.6" />
      <g stroke={gold} strokeWidth="0.9" opacity="0.85">
        <line x1="32" y1="10" x2="32" y2="38" />
        <line x1="18" y1="24" x2="46" y2="24" />
        <line x1="21.4" y1="13.4" x2="42.6" y2="34.6" />
        <line x1="42.6" y1="13.4" x2="21.4" y2="34.6" />
      </g>
      <circle cx="32" cy="24" r="2.6" fill={gold} />
      {/* plinth */}
      <rect x="20" y="41" width="24" height="3.4" rx="1" fill={gold} />
      <rect x="15" y="46" width="34" height="2.8" rx="1" fill={gold} opacity="0.85" />
    </svg>
  )
}
