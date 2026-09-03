/**
 * Inspector roster for the assignment engine. Demo data only. Reuses
 * the same inspector names already seeded across inspectionsSeedData.js
 * (TEAMS) and projectsSeedData.js (several appear there as an
 * organization's own contactPerson — that overlap is intentional and
 * is exactly what the engine's conflict-of-interest check is built to
 * catch: see services/assignmentEngine.js's `hasConflictOfInterest`.
 *
 * Priya Sharma (the logged-in officer / CURRENT_USER) is deliberately
 * not in this roster — she assigns inspections, she isn't assigned one.
 */
export const INSPECTORS = [
  { id: 'INSPR-01', name: 'Rohan Deshmukh', homeDistrict: 'Thane', expertise: ['Infrastructure & Safety', 'Child & Beneficiary Welfare'], maxWorkload: 4, availability: 'available' },
  { id: 'INSPR-02', name: 'Ananya Iyer', homeDistrict: 'Pune', expertise: ['Attendance & Biometric Systems', 'Financial/Document Compliance'], maxWorkload: 4, availability: 'available' },
  { id: 'INSPR-03', name: 'Vikram Patil', homeDistrict: 'Nagpur', expertise: ['NGO Governance', 'Skill Development Programs'], maxWorkload: 3, availability: 'available' },
  { id: 'INSPR-04', name: 'Sneha Kulkarni', homeDistrict: 'Kolhapur', expertise: ['Child & Beneficiary Welfare', 'CCTV & Technical Systems'], maxWorkload: 4, availability: 'available' },
  { id: 'INSPR-05', name: 'Arjun Nair', homeDistrict: 'Nashik', expertise: ['Skill Development Programs', 'Financial/Document Compliance'], maxWorkload: 3, availability: 'available' },
  { id: 'INSPR-06', name: 'Meera Joshi', homeDistrict: 'Thane', expertise: ['NGO Governance', 'Attendance & Biometric Systems'], maxWorkload: 4, availability: 'unavailable', unavailableReason: 'On approved leave until 2026-09-10' },
  { id: 'INSPR-07', name: 'Rajesh Gaikwad', homeDistrict: 'Amravati', expertise: ['Infrastructure & Safety', 'NGO Governance'], maxWorkload: 3, availability: 'available' },
  { id: 'INSPR-08', name: 'Nikhil Wagh', homeDistrict: 'Solapur', expertise: ['CCTV & Technical Systems', 'Infrastructure & Safety'], maxWorkload: 4, availability: 'available' },
  { id: 'INSPR-09', name: 'Pallavi Shinde', homeDistrict: 'Pune', expertise: ['Financial/Document Compliance', 'Child & Beneficiary Welfare'], maxWorkload: 4, availability: 'available' },
]
