import { CALL_STATUS_LABEL } from '../../../data/videoCheckData.js'

const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'

const STYLES = {
  requested: 'bg-plum-50 text-plum-800 border-plum-800/20',
  accepted: 'bg-blue-50 text-blue-700 border-blue-300',
  ongoing: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  ended: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  rejected: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
  missed: 'bg-gray-100 text-gray-600 border-gray-300',
}

export default function CallStatusBadge({ status }) {
  return (
    <span className={`${base} ${STYLES[status] ?? STYLES.missed}`}>
      {status === 'ongoing' && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />}
      {CALL_STATUS_LABEL[status] ?? status}
    </span>
  )
}
