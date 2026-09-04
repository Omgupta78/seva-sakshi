const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'

const STYLES = {
  online: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  offline: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
  warning: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
}
const LABEL = { online: 'Online', offline: 'Offline', warning: 'Warning' }
const PULSE = { online: 'bg-[#138808]', offline: 'bg-[#D6262B]', warning: 'bg-[#e2a610]' }

/** Camera health pill — online / offline / warning. */
export default function CameraStatusBadge({ status }) {
  return (
    <span className={`${base} ${STYLES[status] ?? STYLES.warning}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${PULSE[status] ?? PULSE.warning} ${status === 'online' ? 'animate-pulse' : ''}`} aria-hidden="true" />
      {LABEL[status] ?? status}
    </span>
  )
}
