/**
 * ---------------------------------------------------------------------
 * INSTITUTION OPERATIONAL DATA (demo)
 * ---------------------------------------------------------------------
 * The institution's own daily records — classes, students and today's
 * attendance. In the shared architecture these are the SAME underlying
 * attendance records the Department portal monitors and the AI analytics
 * run over; here they are seeded per institution so the operational portal
 * has realistic data. Swap for the real attendance API keyed by
 * institution/organization id when a backend exists.
 *
 * No biometric templates live here — only an enrolment flag.
 * ---------------------------------------------------------------------
 */

export const CLASSES = ['Class 10-A', 'Class 10-B', 'Class 11-A', 'Class 12-A']

const FIRST = ['Aarav', 'Isha', 'Kabir', 'Neha', 'Rohan', 'Sanya', 'Yash', 'Pooja', 'Aditya', 'Riya', 'Om', 'Diya', 'Karan', 'Simran', 'Aryan', 'Meera', 'Vivaan', 'Anaya', 'Reyansh', 'Kiara', 'Advait', 'Myra', 'Kabir', 'Tara']
const LAST = ['Shinde', 'Pawar', 'Jadhav', 'Mane', 'Chavan', 'Bhosale', 'More', 'Kale', 'Salunkhe', 'Gaikwad', 'Kadam', 'Nikam']

function seeded(n, i) { return (n * 37 + i * 101) % 1000 }

/** Roster for the demo institution INST-001 (Government Ashram Shala, Wada). */
export const INSTITUTION_STUDENTS = Array.from({ length: 24 }, (_, i) => {
  const cls = CLASSES[i % CLASSES.length]
  const s = seeded(7, i)
  const attendancePct = 68 + (s % 30)
  return {
    id: `STU-${1001 + i}`,
    name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
    class: cls,
    rollNo: `${(i % 6) + 1}`.padStart(2, '0'),
    status: s % 11 === 0 ? 'inactive' : 'active',
    faceEnrolled: s % 3 !== 0,
    attendancePct,
    guardianPhone: `+91 9${(s * 137) % 900000000 + 100000000}`.slice(0, 13),
  }
})

/** Today's per-class attendance summary. A class under 80% needs review. */
export const TODAYS_ATTENDANCE = CLASSES.map((cls, i) => {
  const roster = INSTITUTION_STUDENTS.filter((s) => s.class === cls && s.status === 'active')
  const pct = [92, 88, 76, 95][i] ?? 85
  const present = Math.round((roster.length * pct) / 100)
  return { class: cls, present, total: roster.length, pct, status: pct < 80 ? 'Review' : 'Normal' }
})

/** Items surfaced under "Attention Required". */
export const ATTENTION_ITEMS = [
  { id: 'AT-1', type: 'low-attendance', label: 'Class 11-A attendance is 76% — below the 80% threshold.', severity: 'warn' },
  { id: 'AT-2', type: 'unknown-face', label: '2 unknown face matches during this morning’s Class 10-B session.', severity: 'warn' },
  { id: 'AT-3', type: 'low-confidence', label: '3 low-confidence recognitions need manual review.', severity: 'info' },
  { id: 'AT-4', type: 'pending-session', label: 'Class 12-A afternoon attendance session not yet started.', severity: 'info' },
]
