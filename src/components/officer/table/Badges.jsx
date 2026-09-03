const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'

const RISK_STYLES = {
  healthy: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  watch: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  high: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
}
const RISK_LABEL = { healthy: 'Healthy', watch: 'Watch', high: 'High Risk' }

export function RiskBadge({ level }) {
  return (
    <span className={`${base} ${RISK_STYLES[level] ?? RISK_STYLES.watch}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {RISK_LABEL[level] ?? level}
    </span>
  )
}

const PROJECT_STATUS_STYLES = {
  active: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  completed: 'bg-plum-50 text-plum-800 border-plum-800/20',
  paused: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  planned: 'bg-gray-100 text-gray-600 border-gray-300',
}

export function ProjectStatusBadge({ status }) {
  return (
    <span className={`${base} ${PROJECT_STATUS_STYLES[status] ?? PROJECT_STATUS_STYLES.planned} capitalize`}>{status}</span>
  )
}

const COMPLIANCE_STYLES = {
  compliant: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  watch: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  'non-compliant': 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
}
const COMPLIANCE_LABEL = { compliant: 'Compliant', watch: 'Watch', 'non-compliant': 'Non-Compliant' }

export function ComplianceBadge({ status }) {
  return <span className={`${base} ${COMPLIANCE_STYLES[status] ?? COMPLIANCE_STYLES.watch}`}>{COMPLIANCE_LABEL[status] ?? status}</span>
}

export function OrgStatusBadge({ status }) {
  return (
    <span className={`${base} ${status === 'active' ? 'bg-green-50 text-[#16794f] border-[#138808]/25' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  )
}

const CCTV_STYLES = {
  online: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  offline: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
  partial: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
}
const CCTV_LABEL = { online: 'Online', offline: 'Offline', partial: 'Partial' }

export function CctvStatusBadge({ status }) {
  return <span className={`${base} ${CCTV_STYLES[status] ?? CCTV_STYLES.partial}`}>{CCTV_LABEL[status] ?? status}</span>
}
