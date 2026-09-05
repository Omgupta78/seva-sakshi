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

/** Institution profile shown on the "My Institute" page. */
export const INSTITUTION_PROFILE = {
  name: 'Government Ashram Shala',
  institutionId: 'INST-001',
  type: 'Residential Ashram School (Aided)',
  scheme: 'Pre-Matric Ashram Schools for STs',
  district: 'Palghar',
  block: 'Wada',
  address: 'Post Wada, Taluka Wada, District Palghar, Maharashtra 421303',
  head: 'Smt. Vaishali Deshmukh',
  headPhone: '+91 98220 41100',
  email: 'ashramshala.wada@dosje.gov.in',
  established: '2004',
  capacity: 240,
  sanctionedStaff: 18,
}

/** Teaching & non-teaching staff (demo). No sensitive personal data. */
export const INSTITUTION_STAFF = [
  { id: 'STF-01', name: 'Smt. Vaishali Deshmukh', role: 'Head of Institution', dept: 'Administration', status: 'active', phone: '+91 98220 41100' },
  { id: 'STF-02', name: 'Shri Anil Kale', role: 'Assistant Teacher', dept: 'Science', status: 'active', phone: '+91 98220 41112' },
  { id: 'STF-03', name: 'Smt. Rekha Pawar', role: 'Assistant Teacher', dept: 'Mathematics', status: 'active', phone: '+91 98220 41113' },
  { id: 'STF-04', name: 'Shri Sunil Jadhav', role: 'Warden', dept: 'Hostel', status: 'active', phone: '+91 98220 41114' },
  { id: 'STF-05', name: 'Smt. Manisha More', role: 'Assistant Teacher', dept: 'Languages', status: 'active', phone: '+91 98220 41115' },
  { id: 'STF-06', name: 'Shri Prakash Kadam', role: 'Accountant', dept: 'Administration', status: 'active', phone: '+91 98220 41116' },
  { id: 'STF-07', name: 'Smt. Sunita Nikam', role: 'Cook / Mess In-charge', dept: 'Mess', status: 'active', phone: '+91 98220 41117' },
  { id: 'STF-08', name: 'Shri Ganesh Bhosale', role: 'Assistant Teacher', dept: 'Social Studies', status: 'inactive', phone: '+91 98220 41118' },
]

/** Compliance documents the institution maintains for inspections. */
export const INSTITUTION_DOCUMENTS = [
  { id: 'DOC-01', name: 'Institution Registration Certificate', category: 'Registration', status: 'verified', updated: '2025-06-12', required: true },
  { id: 'DOC-02', name: 'Fire Safety NOC', category: 'Safety', status: 'expiring', updated: '2024-11-02', required: true },
  { id: 'DOC-03', name: 'Sanctioned Staff List (current year)', category: 'Staffing', status: 'verified', updated: '2025-07-01', required: true },
  { id: 'DOC-04', name: 'Mess & Ration Register (monthly)', category: 'Records', status: 'pending', updated: '2025-08-15', required: true },
  { id: 'DOC-05', name: 'Student Enrolment Register', category: 'Records', status: 'verified', updated: '2025-08-20', required: true },
  { id: 'DOC-06', name: 'Building Fitness Certificate', category: 'Safety', status: 'missing', updated: null, required: true },
  { id: 'DOC-07', name: 'Bank Reconciliation Statement (Q1)', category: 'Finance', status: 'verified', updated: '2025-07-10', required: false },
]

/** The next scheduled/expected inspection for this institution. */
export const UPCOMING_INSPECTION = {
  id: 'INS-2041',
  type: 'Routine Compliance Inspection',
  window: '2025-09-18 to 2025-09-20',
  status: 'Scheduled',
  inspector: 'Assigned by Department (name withheld until visit)',
}

/** Inspection-readiness checklist the institution can self-assess before a visit. */
export const READINESS_CHECKLIST = [
  { id: 'RC-1', label: 'Attendance registers reconciled for the last 30 days', done: true, category: 'Attendance' },
  { id: 'RC-2', label: 'Biometric enrolment complete for all active students', done: false, category: 'Attendance' },
  { id: 'RC-3', label: 'All mandatory documents verified and current', done: false, category: 'Documents' },
  { id: 'RC-4', label: 'Fire Safety NOC valid (not expiring within 30 days)', done: false, category: 'Safety' },
  { id: 'RC-5', label: 'Mess and ration registers updated for the current month', done: true, category: 'Records' },
  { id: 'RC-6', label: 'Staff attendance and sanctioned list reconciled', done: true, category: 'Staffing' },
  { id: 'RC-7', label: 'Hostel occupancy register matches enrolment', done: true, category: 'Hostel' },
  { id: 'RC-8', label: 'Building fitness certificate on file', done: false, category: 'Safety' },
]
