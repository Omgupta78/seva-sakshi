import { ClipboardCheck, CalendarClock, CalendarX, VideoOff, TriangleAlert, ShieldAlert, FileCheck, Video, Info } from 'lucide-react'
import { CATEGORY_META } from '../../../data/notificationsData.js'

const ICONS = {
  'inspection-assigned': ClipboardCheck,
  'inspection-due': CalendarClock,
  'inspection-overdue': CalendarX,
  'cctv-offline': VideoOff,
  'ai-anomaly': TriangleAlert,
  'compliance-issue': ShieldAlert,
  'report-submitted': FileCheck,
  'video-call-request': Video,
  system: Info,
}

const TONE_CLASSES = {
  critical: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
  warn: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  info: 'bg-plum-50 text-plum-800 border-plum-800/20',
  success: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  neutral: 'bg-gray-100 text-gray-600 border-gray-300',
}

export default function NotificationIcon({ category, size = 'md' }) {
  const Icon = ICONS[category] ?? Info
  const tone = CATEGORY_META[category]?.tone ?? 'neutral'
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  return (
    <span className={`flex ${dim} shrink-0 items-center justify-center rounded-lg border ${TONE_CLASSES[tone]}`}>
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'} aria-hidden="true" />
    </span>
  )
}
