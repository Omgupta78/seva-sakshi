const SEVERITY_STYLES = {
  high: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
  medium: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  low: 'bg-green-50 text-[#16794f] border-[#138808]/25',
}

const SEVERITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

/** Small pill used for anomaly severity and similar status indicators. */
export default function SeverityChip({ severity }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.medium}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {SEVERITY_LABEL[severity] ?? severity}
    </span>
  )
}
