/** Small circular Seva Sakshi brand mark (self-contained inline SVG placeholder). */
export default function BrandMark({ className = 'h-8 w-8', color = '#00236f' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" role="img" aria-label="Seva Sakshi logo">
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="3" />
      <g stroke={color} strokeWidth="1.4" opacity="0.85">
        <line x1="50" y1="14" x2="50" y2="86" />
        <line x1="14" y1="50" x2="86" y2="50" />
        <line x1="23" y1="23" x2="77" y2="77" />
        <line x1="77" y1="23" x2="23" y2="77" />
      </g>
      <circle cx="50" cy="50" r="9" fill={color} />
    </svg>
  )
}
