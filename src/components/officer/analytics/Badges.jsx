const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'

const RISK_STYLES = {
  low: 'bg-gray-100 text-gray-600 border-gray-300',
  medium: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  high: 'bg-orange-50 text-[#c2410c] border-orange-300',
  critical: 'bg-red-50 text-[#D6262B] border-[#D6262B]/30',
}
const RISK_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }

export function RiskBadge({ level }) {
  return (
    <span className={`${base} ${RISK_STYLES[level] ?? RISK_STYLES.low}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {RISK_LABEL[level] ?? level}
    </span>
  )
}

const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700 border-blue-300',
  reviewing: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  resolved: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  dismissed: 'bg-gray-100 text-gray-500 border-gray-300',
}
const STATUS_LABEL = { open: 'Open', reviewing: 'Under Review', resolved: 'Resolved', dismissed: 'Dismissed' }

export function AlertStatusBadge({ status }) {
  return <span className={`${base} ${STATUS_STYLES[status] ?? STATUS_STYLES.open}`}>{STATUS_LABEL[status] ?? status}</span>
}
