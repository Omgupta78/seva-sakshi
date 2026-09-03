/**
 * Sample data for the Department Officer Dashboard (/officer/dashboard).
 * Illustrative demo data only — no real projects, institutes, or people.
 *
 * Structured so it's a drop-in swap for real API responses later: every
 * export here is the exact shape a `fetch('/api/officer/...')` call
 * would be expected to return, so a component only ever needs its
 * data-fetching hook changed, not its rendering.
 */
import { CURRENT_USER } from './dashboardSampleData.js'

export const OFFICER = CURRENT_USER

/** Top KPI row. */
export const OFFICER_KPIS = {
  totalProjects: { value: 58, trend: [49, 51, 52, 54, 55, 57, 58] },
  activeProjects: { value: 42, trend: [35, 37, 38, 39, 40, 41, 42] },
  totalInstitutes: { value: 216, trend: [198, 202, 205, 208, 211, 214, 216] },
  pendingInspections: { value: 27, trend: [31, 29, 30, 28, 29, 27, 27] },
  completedInspections: { value: 164, trend: [140, 146, 151, 155, 159, 162, 164] },
  activeAlerts: { value: 9, trend: [6, 7, 9, 8, 10, 9, 9] },
}

/** LIVE MONITORING panel. */
export const LIVE_MONITORING = {
  camerasOnline: 137,
  camerasOffline: 11,
  activeProjects: 42,
  status: 'operational', // 'operational' | 'degraded' | 'down'
  statusNote: 'All monitoring feeds nominal across 7 districts.',
}

/** INSPECTION OVERVIEW panel (feeds the bar chart). */
export const INSPECTION_OVERVIEW = {
  scheduled: 34,
  inProgress: 12,
  completed: 164,
  overdue: 6,
}

/**
 * AI ALERTS — each is a system-generated flag for human review, never a
 * finding of fact. `explanation` and the panel-level disclaimer both make
 * that explicit; UI copy must not say an alert "proves" or "confirms"
 * anything.
 */
export const AI_ALERTS = [
  {
    id: 'ALT-5510',
    severity: 'high',
    title: 'Attendance anomaly detected',
    project: 'Post-Matric Scholarship — SC/ST Boys Hostel, Solapur',
    detectedAt: '2026-09-03 11:14 AM',
    explanation:
      'Biometric attendance logs show a sharp drop in recorded check-ins over the last 3 days versus the institute\'s 30-day baseline. This pattern warrants a human review — it does not by itself confirm absenteeism or fraud.',
  },
  {
    id: 'ALT-5511',
    severity: 'high',
    title: 'CCTV offline',
    project: 'Yashwantrao Chavan NGO Trust, Thane',
    detectedAt: '2026-09-03 10:47 AM',
    explanation:
      'The institute\'s live feed has been unreachable for over 4 hours. This may indicate a connectivity or equipment fault, or could warrant further inquiry — an inspector follow-up is recommended.',
  },
  {
    id: 'ALT-5512',
    severity: 'medium',
    title: 'Inspection overdue',
    project: 'Divyang Kalyan Kendra, Kolhapur',
    detectedAt: '2026-09-02 09:52 AM',
    explanation:
      'The scheduled inspection for this institute is 6 days past its due date. Flagged for reassignment or scheduling follow-up.',
  },
  {
    id: 'ALT-5513',
    severity: 'medium',
    title: 'Unusual attendance pattern',
    project: 'Adarsh Vidyalaya, Nagpur',
    detectedAt: '2026-09-02 08:30 AM',
    explanation:
      'Attendance timestamps cluster unusually close together each morning, which can occur naturally (e.g. batch check-in) or merit a closer look. Not conclusive on its own — human review requested.',
  },
  {
    id: 'ALT-5514',
    severity: 'low',
    title: 'Compliance issue',
    project: 'Samata Foundation, Nagpur',
    detectedAt: '2026-09-01 04:10 PM',
    explanation:
      'Submitted utilization certificate is missing one required annexure. Administrative follow-up needed; not indicative of misconduct.',
  },
]

/** RECENT ACTIVITY feed. */
export const RECENT_ACTIVITY = [
  { id: 'ract-1', type: 'assignment', actor: 'Priya Sharma', text: 'assigned an inspection to Ananya Iyer at SC/ST Boys Hostel, Solapur', time: '11:20 AM' },
  { id: 'ract-2', type: 'report', actor: 'Rohan Deshmukh', text: 'submitted an inspection report for Government Ashram Shala, Wada', time: '10:58 AM' },
  { id: 'ract-3', type: 'cctv', actor: 'System', text: 'detected CCTV offline at Yashwantrao Chavan NGO Trust, Thane', time: '10:47 AM' },
  { id: 'ract-4', type: 'anomaly', actor: 'System', text: 'flagged an attendance anomaly at SC/ST Boys Hostel, Solapur', time: '10:40 AM' },
  { id: 'ract-5', type: 'evidence', actor: 'Vikram Patil', text: 'uploaded geo-tagged evidence for Adarsh Vidyalaya, Nagpur', time: '10:12 AM' },
  { id: 'ract-6', type: 'report', actor: 'Arjun Nair', text: 'submitted an inspection report for BARTI Skill Development Center, Nashik', time: '09:35 AM' },
  { id: 'ract-7', type: 'assignment', actor: 'Priya Sharma', text: 'assigned a surprise VC to Meera Joshi at Divyang Kalyan Kendra, Kolhapur', time: '09:10 AM' },
]

/** Projects table (for the Projects sidebar section — currently a placeholder page, data kept ready). */
export const PROJECTS = [
  { id: 'PRJ-201', name: 'Post-Matric Scholarship Rollout', district: 'Pune', scheme: 'Post-Matric Scholarship for SC Students', status: 'active', institutes: 34 },
  { id: 'PRJ-202', name: 'Ashram Shala Modernisation', district: 'Thane', scheme: 'Residential Schools for SC Students (Ashram Shala)', status: 'active', institutes: 18 },
  { id: 'PRJ-203', name: 'PM-AJAY District Rollout', district: 'Nagpur', scheme: 'PM-AJAY (Adarsh Gram Yojana)', status: 'active', institutes: 27 },
  { id: 'PRJ-204', name: 'Safai Karamchari Skilling', district: 'Nashik', scheme: 'Skill Development for Safai Karamcharis', status: 'completed', institutes: 12 },
]
