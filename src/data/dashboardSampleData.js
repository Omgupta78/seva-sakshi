/**
 * Realistic sample data for the Real-Time Monitoring Dashboard.
 * Everything here is illustrative demo data (no real institutes, people,
 * or incidents) — swap for real API responses when a backend exists.
 * Map coordinates are percentages (0-100) against the schematic state
 * outline in StateMap.jsx, not real geographic coordinates.
 */

export const DISTRICTS = ['Pune', 'Nagpur', 'Nashik', 'Thane', 'Solapur', 'Kolhapur', 'Amravati']

export const SCHEMES = [
  'Post-Matric Scholarship for SC Students',
  'Pre-Matric Scholarship for OBC Students',
  'PM-AJAY (Adarsh Gram Yojana)',
  'Assistance to Voluntary Organisations (SC Welfare)',
  'Residential Schools for SC Students (Ashram Shala)',
  'Skill Development for Safai Karamcharis',
]

export const CURRENT_USER = {
  name: 'Priya Sharma',
  role: 'District Officer',
  district: 'Pune',
  initials: 'PS',
}

export const RISK = {
  healthy: { label: 'Healthy', color: '#138808' },
  watch: { label: 'Watch', color: '#e2a610' },
  high: { label: 'High Risk', color: '#D6262B' },
}

/** x/y are percentages over StateMap's schematic outline (0-100). */
export const INSTITUTES = [
  {
    id: 'INST-1042',
    name: 'Government Ashram Shala, Wada',
    type: 'Ashram Shala',
    district: 'Thane',
    scheme: 'Residential Schools for SC Students (Ashram Shala)',
    risk: 'healthy',
    complianceScore: 94,
    lastInspection: '2026-08-28',
    liveFeed: 'online',
    inspector: 'Rohan Deshmukh',
    x: 28,
    y: 34,
  },
  {
    id: 'INST-1088',
    name: 'SC/ST Boys Hostel, Solapur',
    type: 'Hostel',
    district: 'Solapur',
    scheme: 'Post-Matric Scholarship for SC Students',
    risk: 'high',
    complianceScore: 58,
    lastInspection: '2026-08-19',
    liveFeed: 'offline',
    inspector: 'Ananya Iyer',
    x: 58,
    y: 62,
  },
  {
    id: 'INST-1103',
    name: 'Adarsh Vidyalaya, Nagpur',
    type: 'School',
    district: 'Nagpur',
    scheme: 'PM-AJAY (Adarsh Gram Yojana)',
    risk: 'watch',
    complianceScore: 76,
    lastInspection: '2026-08-30',
    liveFeed: 'online',
    inspector: 'Vikram Patil',
    x: 82,
    y: 22,
  },
  {
    id: 'INST-1117',
    name: 'Savitribai Phule Girls Hostel, Pune',
    type: 'Hostel',
    district: 'Pune',
    scheme: 'Post-Matric Scholarship for SC Students',
    risk: 'healthy',
    complianceScore: 91,
    lastInspection: '2026-09-01',
    liveFeed: 'online',
    inspector: 'Priya Sharma',
    x: 40,
    y: 52,
  },
  {
    id: 'INST-1129',
    name: 'Divyang Kalyan Kendra, Kolhapur',
    type: 'NGO',
    district: 'Kolhapur',
    scheme: 'Assistance to Voluntary Organisations (SC Welfare)',
    risk: 'watch',
    complianceScore: 71,
    lastInspection: '2026-08-25',
    liveFeed: 'no-feed',
    inspector: 'Sneha Kulkarni',
    x: 33,
    y: 78,
  },
  {
    id: 'INST-1136',
    name: 'BARTI Skill Development Center, Nashik',
    type: 'Skill Center',
    district: 'Nashik',
    scheme: 'Skill Development for Safai Karamcharis',
    risk: 'healthy',
    complianceScore: 88,
    lastInspection: '2026-08-29',
    liveFeed: 'online',
    inspector: 'Arjun Nair',
    x: 30,
    y: 20,
  },
  {
    id: 'INST-1151',
    name: 'Yashwantrao Chavan NGO Trust, Thane',
    type: 'NGO',
    district: 'Thane',
    scheme: 'Assistance to Voluntary Organisations (SC Welfare)',
    risk: 'high',
    complianceScore: 49,
    lastInspection: '2026-08-14',
    liveFeed: 'offline',
    inspector: 'Meera Joshi',
    x: 22,
    y: 42,
  },
  {
    id: 'INST-1164',
    name: 'Dr. Ambedkar Residential School, Amravati',
    type: 'School',
    district: 'Amravati',
    scheme: 'Residential Schools for SC Students (Ashram Shala)',
    risk: 'watch',
    complianceScore: 79,
    lastInspection: '2026-08-31',
    liveFeed: 'online',
    inspector: 'Rajesh Gaikwad',
    x: 68,
    y: 30,
  },
  {
    id: 'INST-1177',
    name: 'Pragati Mahila Mandal, Pune',
    type: 'NGO',
    district: 'Pune',
    scheme: 'Pre-Matric Scholarship for OBC Students',
    risk: 'healthy',
    complianceScore: 96,
    lastInspection: '2026-09-02',
    liveFeed: 'online',
    inspector: 'Priya Sharma',
    x: 46,
    y: 58,
  },
  {
    id: 'INST-1190',
    name: 'Samata Foundation, Nagpur',
    type: 'NGO',
    district: 'Nagpur',
    scheme: 'PM-AJAY (Adarsh Gram Yojana)',
    risk: 'high',
    complianceScore: 55,
    lastInspection: '2026-08-21',
    liveFeed: 'offline',
    inspector: 'Vikram Patil',
    x: 86,
    y: 26,
  },
]

export const ONGOING_INSPECTIONS = [
  {
    id: 'INS-7734',
    institute: 'Savitribai Phule Girls Hostel, Pune',
    inspector: 'Priya Sharma',
    status: 'On Site',
    liveLocation: true,
    startedAt: '10:12 AM',
  },
  {
    id: 'INS-7735',
    institute: 'SC/ST Boys Hostel, Solapur',
    inspector: 'Ananya Iyer',
    status: 'En Route',
    liveLocation: true,
    startedAt: '10:40 AM',
  },
  {
    id: 'INS-7736',
    institute: 'BARTI Skill Development Center, Nashik',
    inspector: 'Arjun Nair',
    status: 'Report Pending',
    liveLocation: false,
    startedAt: '09:05 AM',
  },
  {
    id: 'INS-7737',
    institute: 'Adarsh Vidyalaya, Nagpur',
    inspector: 'Vikram Patil',
    status: 'On Site',
    liveLocation: true,
    startedAt: '11:02 AM',
  },
]

export const ANOMALY_ALERTS = [
  {
    id: 'ANM-2291',
    institute: 'SC/ST Boys Hostel, Solapur',
    type: 'Attendance Mismatch',
    severity: 'high',
    detectedAt: '11:14 AM',
  },
  {
    id: 'ANM-2292',
    institute: 'Yashwantrao Chavan NGO Trust, Thane',
    type: 'Geo-fence Violation',
    severity: 'high',
    detectedAt: '10:47 AM',
  },
  {
    id: 'ANM-2293',
    institute: 'Divyang Kalyan Kendra, Kolhapur',
    type: 'No Activity During Hours',
    severity: 'medium',
    detectedAt: '09:52 AM',
  },
  {
    id: 'ANM-2294',
    institute: 'Samata Foundation, Nagpur',
    type: 'CCTV Feed Offline',
    severity: 'medium',
    detectedAt: '08:30 AM',
  },
]

/** Recent history feeding the KPI sparklines (oldest -> newest). */
export const KPI_TRENDS = {
  institutesMonitored: [612, 614, 615, 617, 618, 618, 620],
  inspectionsToday: [3, 5, 6, 8, 9, 10, 12],
  openAnomalies: [9, 11, 10, 13, 12, 14, 11],
  avgCompliance: [81, 82, 80, 79, 81, 83, 82],
}

/** Seed items for the Activity Feed; more are generated on an interval. */
export const ACTIVITY_FEED_SEED = [
  { id: 'act-1', time: '11:16 AM', type: 'anomaly', text: 'Attendance mismatch flagged at SC/ST Boys Hostel, Solapur' },
  { id: 'act-2', time: '11:05 AM', type: 'inspection', text: 'Inspection report submitted for Pragati Mahila Mandal, Pune' },
  { id: 'act-3', time: '10:51 AM', type: 'vc', text: 'Surprise VC completed at Adarsh Vidyalaya, Nagpur' },
  { id: 'act-4', time: '10:40 AM', type: 'inspection', text: 'Ananya Iyer started inspection at SC/ST Boys Hostel, Solapur' },
]

/** Event templates the live feed simulator cycles through. */
export const ACTIVITY_FEED_TEMPLATES = [
  { type: 'anomaly', text: (i) => `Geo-fence violation detected at ${i.name}` },
  { type: 'inspection', text: (i) => `Inspection report submitted for ${i.name}` },
  { type: 'vc', text: (i) => `Surprise VC completed at ${i.name}` },
  { type: 'inspection', text: (i) => `${i.inspector} started inspection at ${i.name}` },
  { type: 'anomaly', text: (i) => `No-activity anomaly flagged at ${i.name}` },
]
