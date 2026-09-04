import { UserCog, Users, User } from 'lucide-react'
import { TYPE_LABEL } from '../../../data/videoCheckData.js'

const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'

const STYLES = {
  'project-incharge': 'bg-plum-50 text-plum-800 border-plum-800/25',
  staff: 'bg-blue-50 text-blue-700 border-blue-300',
  beneficiary: 'bg-green-50 text-[#16794f] border-[#138808]/25',
}
const ICONS = { 'project-incharge': UserCog, staff: Users, beneficiary: User }

export default function ParticipantTypeBadge({ type }) {
  const Icon = ICONS[type] ?? User
  return (
    <span className={`${base} ${STYLES[type] ?? STYLES.staff}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {TYPE_LABEL[type] ?? type}
    </span>
  )
}
