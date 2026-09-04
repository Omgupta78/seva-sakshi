/**
 * Seed data for the attendance module — beneficiary/student PROFILES only
 * (no biometric data lives here). Which of them arrive pre-enrolled is flagged
 * with `preEnrolled`; the service turns that into vault templates at startup
 * via the recognition provider, so no embedding is ever written to a file.
 * All demo data; no real people.
 */

export const STUDENT_SEED = [
  { id: 'BEN-5001', name: 'Aarav Shinde', projectId: 'PRJ-2201', department: 'Education & Scholarships', status: 'active', preEnrolled: true },
  { id: 'BEN-5002', name: 'Isha Pawar', projectId: 'PRJ-2201', department: 'Education & Scholarships', status: 'active', preEnrolled: true },
  { id: 'BEN-5003', name: 'Kabir Jadhav', projectId: 'PRJ-2202', department: 'Backward Class Welfare', status: 'active', preEnrolled: true },
  { id: 'BEN-5004', name: 'Neha Mane', projectId: 'PRJ-2202', department: 'Backward Class Welfare', status: 'active', preEnrolled: true },
  { id: 'BEN-5005', name: 'Rohan Chavan', projectId: 'PRJ-2204', department: 'Social Welfare', status: 'active', preEnrolled: false },
  { id: 'BEN-5006', name: 'Sanya Bhosale', projectId: 'PRJ-2204', department: 'Social Welfare', status: 'inactive', preEnrolled: false },
]

/** One pre-existing session so the hub isn't empty on first load. */
export const SESSION_SEED = [
  {
    id: 'SES-9001',
    subject: 'Morning Roll Call',
    projectId: 'PRJ-2201',
    date: new Date().toISOString().slice(0, 10),
    startTime: '08:00',
    endTime: '',
    officerId: 'EMP1001',
    officerName: 'Priya Sharma',
    status: 'active',
  },
]
