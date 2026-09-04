const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap'

const ENROLL_STYLES = {
  enrolled: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  'not-enrolled': 'bg-gray-100 text-gray-600 border-gray-300',
  deactivated: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
}
const ENROLL_LABEL = { enrolled: 'Enrolled', 'not-enrolled': 'Not Enrolled', deactivated: 'Deactivated' }

export function EnrollmentStatusBadge({ status }) {
  return <span className={`${base} ${ENROLL_STYLES[status] ?? ENROLL_STYLES['not-enrolled']}`}>{ENROLL_LABEL[status] ?? status}</span>
}

const ATT_STYLES = {
  present: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  unknown: 'bg-gray-100 text-gray-600 border-gray-300',
  absent: 'bg-red-50 text-[#D6262B] border-[#D6262B]/25',
}
const ATT_LABEL = { present: 'Present', unknown: 'Unknown', absent: 'Absent' }

export function AttendanceStatusBadge({ status }) {
  return <span className={`${base} ${ATT_STYLES[status] ?? ATT_STYLES.unknown}`}>{ATT_LABEL[status] ?? status}</span>
}

const SESSION_STYLES = {
  active: 'bg-amber-50 text-[#a15c00] border-[#e2a610]/35',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-300',
  closed: 'bg-plum-50 text-plum-800 border-plum-800/20',
}

export function SessionStatusBadge({ status }) {
  return (
    <span className={`${base} ${SESSION_STYLES[status] ?? SESSION_STYLES.closed} capitalize`}>
      {status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />}
      {status}
    </span>
  )
}

const STU_STYLES = {
  active: 'bg-green-50 text-[#16794f] border-[#138808]/25',
  inactive: 'bg-gray-100 text-gray-600 border-gray-300',
}
export function StudentStatusBadge({ status }) {
  return <span className={`${base} ${STU_STYLES[status] ?? STU_STYLES.inactive} capitalize`}>{status}</span>
}
