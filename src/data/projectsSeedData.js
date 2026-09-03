/**
 * Seed data for the Projects / Institutes / NGOs module. All demo data —
 * no real people, organizations, or incidents. Shaped to match the
 * entities documented in models.js so it's a like-for-like swap for real
 * records once a backend exists (see services/*.js for where that swap
 * happens).
 */

export const SCHEMES = [
  { id: 'SCH-01', name: 'Post-Matric Scholarship for SC Students' },
  { id: 'SCH-02', name: 'Pre-Matric Scholarship for OBC Students' },
  { id: 'SCH-03', name: 'PM-AJAY (Adarsh Gram Yojana)' },
  { id: 'SCH-04', name: 'Assistance to Voluntary Organisations (SC Welfare)' },
  { id: 'SCH-05', name: 'Residential Schools for SC Students (Ashram Shala)' },
  { id: 'SCH-06', name: 'Skill Development for Safai Karamcharis' },
]

const DISTRICTS = ['Pune', 'Nagpur', 'Nashik', 'Thane', 'Solapur', 'Kolhapur', 'Amravati']

export const LOCATIONS = DISTRICTS.map((district, i) => ({
  id: `LOC-0${i + 1}`,
  state: 'Maharashtra',
  district,
}))

const locId = (district) => LOCATIONS.find((l) => l.district === district).id

export const ORGANIZATIONS = [
  {
    id: 'ORG-001',
    name: 'Government Ashram Shala, Wada',
    type: 'Ashram Shala',
    category: 'institute',
    registrationNumber: 'MH/ASH/1998/00214',
    registrationDate: '1998-06-12',
    locationId: locId('Thane'),
    contactPerson: 'Sunita Rane',
    contactPhone: '+91 98230 11245',
    contactEmail: 'ashramshala.wada@dosje.gov.in',
    status: 'active',
    complianceStatus: 'compliant',
    projectIds: ['PRJ-2204'],
  },
  {
    id: 'ORG-002',
    name: 'SC/ST Boys Hostel, Solapur',
    type: 'Hostel',
    category: 'institute',
    registrationNumber: 'MH/HOS/2003/00871',
    registrationDate: '2003-03-04',
    locationId: locId('Solapur'),
    contactPerson: 'Baban Kadam',
    contactPhone: '+91 98221 66590',
    contactEmail: 'hostel.solapur@dosje.gov.in',
    status: 'active',
    complianceStatus: 'non-compliant',
    projectIds: ['PRJ-2202'],
  },
  {
    id: 'ORG-003',
    name: 'Adarsh Vidyalaya, Nagpur',
    type: 'School',
    category: 'institute',
    registrationNumber: 'MH/SCH/1991/00432',
    registrationDate: '1991-07-19',
    locationId: locId('Nagpur'),
    contactPerson: 'Vikram Patil',
    contactPhone: '+91 94221 30987',
    contactEmail: 'adarsh.nagpur@dosje.gov.in',
    status: 'active',
    complianceStatus: 'watch',
    projectIds: ['PRJ-2203'],
  },
  {
    id: 'ORG-004',
    name: 'Savitribai Phule Girls Hostel, Pune',
    type: 'Hostel',
    category: 'institute',
    registrationNumber: 'MH/HOS/2007/01120',
    registrationDate: '2007-01-22',
    locationId: locId('Pune'),
    contactPerson: 'Priya Sharma',
    contactPhone: '+91 98500 44231',
    contactEmail: 'sph.hostel.pune@dosje.gov.in',
    status: 'active',
    complianceStatus: 'compliant',
    projectIds: ['PRJ-2201'],
  },
  {
    id: 'ORG-005',
    name: 'Divyang Kalyan Kendra, Kolhapur',
    type: 'NGO',
    category: 'ngo',
    registrationNumber: 'NGO/MH/2011/3390',
    registrationDate: '2011-09-08',
    locationId: locId('Kolhapur'),
    contactPerson: 'Sneha Kulkarni',
    contactPhone: '+91 90210 88123',
    contactEmail: 'contact@divyangkalyan.org',
    status: 'active',
    complianceStatus: 'watch',
    projectIds: ['PRJ-2205'],
  },
  {
    id: 'ORG-006',
    name: 'BARTI Skill Development Center, Nashik',
    type: 'Skill Center',
    category: 'institute',
    registrationNumber: 'MH/SKL/2015/00567',
    registrationDate: '2015-11-30',
    locationId: locId('Nashik'),
    contactPerson: 'Arjun Nair',
    contactPhone: '+91 98220 71456',
    contactEmail: 'barti.nashik@dosje.gov.in',
    status: 'active',
    complianceStatus: 'compliant',
    projectIds: ['PRJ-2206'],
  },
  {
    id: 'ORG-007',
    name: 'Yashwantrao Chavan NGO Trust, Thane',
    type: 'NGO',
    category: 'ngo',
    registrationNumber: 'NGO/MH/2005/1187',
    registrationDate: '2005-04-17',
    locationId: locId('Thane'),
    contactPerson: 'Meera Joshi',
    contactPhone: '+91 98192 34567',
    contactEmail: 'trust@ycngo.org',
    status: 'active',
    complianceStatus: 'non-compliant',
    projectIds: ['PRJ-2207'],
  },
  {
    id: 'ORG-008',
    name: 'Dr. Ambedkar Residential School, Amravati',
    type: 'School',
    category: 'institute',
    registrationNumber: 'MH/SCH/1985/00098',
    registrationDate: '1985-02-14',
    locationId: locId('Amravati'),
    contactPerson: 'Rajesh Gaikwad',
    contactPhone: '+91 94222 90341',
    contactEmail: 'ambedkar.amravati@dosje.gov.in',
    status: 'active',
    complianceStatus: 'watch',
    projectIds: ['PRJ-2208'],
  },
  {
    id: 'ORG-009',
    name: 'Pragati Mahila Mandal, Pune',
    type: 'NGO',
    category: 'ngo',
    registrationNumber: 'NGO/MH/2009/2245',
    registrationDate: '2009-12-01',
    locationId: locId('Pune'),
    contactPerson: 'Anjali Deshpande',
    contactPhone: '+91 98600 55210',
    contactEmail: 'info@pragatimahila.org',
    status: 'active',
    complianceStatus: 'compliant',
    projectIds: ['PRJ-2209'],
  },
  {
    id: 'ORG-010',
    name: 'Samata Foundation, Nagpur',
    type: 'NGO',
    category: 'ngo',
    registrationNumber: 'NGO/MH/2013/2984',
    registrationDate: '2013-05-26',
    locationId: locId('Nagpur'),
    contactPerson: 'Suresh Bhagat',
    contactPhone: '+91 94230 61789',
    contactEmail: 'admin@samatafoundation.org',
    status: 'inactive',
    complianceStatus: 'non-compliant',
    projectIds: ['PRJ-2210'],
  },
]

const PROJECT_BASE = [
  { id: 'PRJ-2201', name: 'Post-Matric Scholarship Rollout', orgId: 'ORG-004', schemeId: 'SCH-01', district: 'Pune', type: 'Scholarship Disbursement', status: 'active', risk: 'healthy', x: 40, y: 52 },
  { id: 'PRJ-2202', name: 'SC/ST Hostel Support Program', orgId: 'ORG-002', schemeId: 'SCH-01', district: 'Solapur', type: 'Residential Care', status: 'active', risk: 'high', x: 58, y: 62 },
  { id: 'PRJ-2203', name: 'PM-AJAY District Rollout', orgId: 'ORG-003', schemeId: 'SCH-03', district: 'Nagpur', type: 'Infrastructure', status: 'active', risk: 'watch', x: 82, y: 22 },
  { id: 'PRJ-2204', name: 'Ashram Shala Modernisation', orgId: 'ORG-001', schemeId: 'SCH-05', district: 'Thane', type: 'Residential Care', status: 'active', risk: 'healthy', x: 22, y: 42 },
  { id: 'PRJ-2205', name: 'Divyang Welfare Assistance', orgId: 'ORG-005', schemeId: 'SCH-04', district: 'Kolhapur', type: 'Community Outreach', status: 'active', risk: 'watch', x: 33, y: 78 },
  { id: 'PRJ-2206', name: 'Safai Karamchari Skilling', orgId: 'ORG-006', schemeId: 'SCH-06', district: 'Nashik', type: 'Skill Training', status: 'completed', risk: 'healthy', x: 30, y: 20 },
  { id: 'PRJ-2207', name: 'NGO Trust Community Outreach', orgId: 'ORG-007', schemeId: 'SCH-04', district: 'Thane', type: 'Community Outreach', status: 'active', risk: 'high', x: 25, y: 46 },
  { id: 'PRJ-2208', name: 'Ambedkar Residential School Support', orgId: 'ORG-008', schemeId: 'SCH-05', district: 'Amravati', type: 'Residential Care', status: 'active', risk: 'watch', x: 68, y: 30 },
  { id: 'PRJ-2209', name: 'Mahila Mandal Empowerment Program', orgId: 'ORG-009', schemeId: 'SCH-02', district: 'Pune', type: 'Community Outreach', status: 'active', risk: 'healthy', x: 46, y: 58 },
  { id: 'PRJ-2210', name: 'Samata Foundation Outreach', orgId: 'ORG-010', schemeId: 'SCH-03', district: 'Nagpur', type: 'Community Outreach', status: 'paused', risk: 'high', x: 86, y: 26, unmapped: false },
]

const FIRST_NAMES = ['Aarav', 'Isha', 'Kabir', 'Neha', 'Rohan', 'Sanya', 'Yash', 'Pooja', 'Aditya', 'Riya', 'Om', 'Diya', 'Karan', 'Simran', 'Aryan']
const LAST_NAMES = ['Shinde', 'Pawar', 'Jadhav', 'Mane', 'Chavan', 'Bhosale', 'More', 'Kale', 'Salunkhe', 'Gaikwad', 'Kadam', 'Nikam']
const ROLES = ['Warden', 'Teacher', 'Cook', 'Caretaker', 'Field Coordinator', 'Accountant', 'Security Guard']
const DOC_TYPES = ['Utilization Certificate', 'Attendance Register (Q2)', 'Fire Safety NOC', 'Audited Accounts FY25-26', 'Beneficiary List']
const ISSUE_TYPES = ['Attendance shortfall', 'Delayed fund utilization', 'Infrastructure maintenance pending', 'Staff vacancy', 'Grievance from beneficiary']

function seededPick(list, seed) {
  return list[seed % list.length]
}

function buildPeopleList(count, seedBase) {
  return Array.from({ length: count }, (_, i) => {
    const seed = seedBase * 31 + i
    return {
      id: `P-${seedBase}${i}`,
      name: `${seededPick(FIRST_NAMES, seed)} ${seededPick(LAST_NAMES, seed + 7)}`,
      age: 12 + (seed % 10),
    }
  })
}

function buildStaffList(count, seedBase) {
  return Array.from({ length: count }, (_, i) => {
    const seed = seedBase * 17 + i
    return {
      id: `S-${seedBase}${i}`,
      name: `${seededPick(FIRST_NAMES, seed + 3)} ${seededPick(LAST_NAMES, seed + 11)}`,
      role: seededPick(ROLES, seed),
      phone: `+91 9${(seed * 137) % 900000000 + 1000000000}`.slice(0, 14),
    }
  })
}

function buildAttendanceWeek(basePct, seedBase) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days.map((day, i) => ({
    day,
    percentage: Math.max(40, Math.min(100, basePct + (((seedBase + i) * 13) % 15) - 7)),
  }))
}

function buildDocuments(seedBase) {
  return DOC_TYPES.slice(0, 3 + (seedBase % 3)).map((docName, i) => ({
    id: `DOC-${seedBase}${i}`,
    name: docName,
    uploadedOn: `2026-0${((seedBase + i) % 8) + 1}-1${(seedBase + i) % 9}`,
    status: (seedBase + i) % 4 === 0 ? 'pending review' : 'verified',
  }))
}

function buildIssues(seedBase, risk) {
  const count = risk === 'high' ? 2 : risk === 'watch' ? 1 : 0
  return Array.from({ length: count }, (_, i) => ({
    id: `ISS-${seedBase}${i}`,
    title: seededPick(ISSUE_TYPES, seedBase + i),
    severity: risk === 'high' ? 'high' : 'medium',
    raisedOn: `2026-08-${10 + ((seedBase + i) % 18)}`,
    status: i === 0 ? 'open' : 'in review',
  }))
}

function buildInspectionHistory(seedBase, lastInspection) {
  const inspectors = ['Priya Sharma', 'Rohan Deshmukh', 'Ananya Iyer', 'Vikram Patil', 'Sneha Kulkarni', 'Arjun Nair']
  return Array.from({ length: 3 }, (_, i) => {
    const monthsAgo = i * 2 + 1
    const d = new Date(lastInspection)
    d.setMonth(d.getMonth() - monthsAgo)
    return {
      id: `INSP-${seedBase}${i}`,
      date: d.toISOString().slice(0, 10),
      inspector: seededPick(inspectors, seedBase + i),
      outcome: i === 0 ? 'Compliant' : seededPick(['Compliant', 'Minor issues noted', 'Follow-up required'], seedBase + i),
    }
  })
}

export const PROJECTS = PROJECT_BASE.map((p, idx) => {
  const seedBase = idx + 1
  const beneficiaryCount = 40 + seedBase * 11
  const staffCount = 4 + (seedBase % 6)
  const attendancePercentage = p.risk === 'high' ? 58 + (seedBase % 10) : p.risk === 'watch' ? 74 + (seedBase % 10) : 88 + (seedBase % 10)
  const lastInspection = `2026-08-${10 + (seedBase % 18)}`
  const nextInspection = `2026-09-${10 + (seedBase % 18)}`

  return {
    id: p.id,
    name: p.name,
    schemeId: p.schemeId,
    organizationId: p.orgId,
    locationId: locId(p.district),
    projectType: p.type,
    status: p.status,
    riskLevel: p.risk,
    lastInspection,
    nextInspection,
    beneficiaryCount,
    staffCount,
    attendancePercentage,
    cctvStatus: p.risk === 'high' ? 'offline' : p.risk === 'watch' ? 'partial' : 'online',
    complianceStatus: p.risk === 'high' ? 'non-compliant' : p.risk === 'watch' ? 'watch' : 'compliant',
    contactPerson: ORGANIZATIONS.find((o) => o.id === p.orgId).contactPerson,
    contactPhone: ORGANIZATIONS.find((o) => o.id === p.orgId).contactPhone,
    mapPosition: p.unmapped ? null : { x: p.x, y: p.y },

    beneficiaries: buildPeopleList(Math.min(6, Math.round(beneficiaryCount / 12)), seedBase),
    staff: buildStaffList(staffCount, seedBase),
    attendanceWeek: buildAttendanceWeek(attendancePercentage, seedBase),
    documents: buildDocuments(seedBase),
    issues: buildIssues(seedBase, p.risk),
    inspectionHistory: buildInspectionHistory(seedBase, lastInspection),
  }
})
