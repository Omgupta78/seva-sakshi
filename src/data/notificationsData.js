/**
 * ---------------------------------------------------------------------
 * NOTIFICATIONS — categories, priorities & seed feed
 * ---------------------------------------------------------------------
 * A single, centralized feed for the officer. Seeds are curated from real
 * module references (a genuinely overdue inspection, an offline camera, the
 * top anomaly alert, …) rather than noise — the goal is a useful feed, not a
 * firehose. Category metadata carries no React/icon imports so the service
 * can use it freely; icons are mapped in the UI layer.
 * ---------------------------------------------------------------------
 */
import { PROJECTS } from './projectsSeedData.js'

export const NOTIFICATION_CATEGORIES = [
  'inspection-assigned',
  'inspection-due',
  'inspection-overdue',
  'cctv-offline',
  'ai-anomaly',
  'compliance-issue',
  'report-submitted',
  'video-call-request',
  'system',
]

export const CATEGORY_META = {
  'inspection-assigned': { label: 'Inspection Assigned', tone: 'info' },
  'inspection-due': { label: 'Inspection Due', tone: 'warn' },
  'inspection-overdue': { label: 'Inspection Overdue', tone: 'critical' },
  'cctv-offline': { label: 'CCTV Offline', tone: 'critical' },
  'ai-anomaly': { label: 'AI Anomaly', tone: 'critical' },
  'compliance-issue': { label: 'Compliance Issue', tone: 'warn' },
  'report-submitted': { label: 'Report Submitted', tone: 'success' },
  'video-call-request': { label: 'Video Call Request', tone: 'info' },
  system: { label: 'System Notification', tone: 'neutral' },
}

export const PRIORITIES = ['low', 'medium', 'high', 'critical']

const nameOf = (id) => PROJECTS.find((p) => p.id === id)?.name ?? null
const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString()

/** Curated initial feed — one meaningful item per category. */
export function buildSeedNotifications() {
  const seed = [
    {
      category: 'ai-anomaly', priority: 'critical', projectId: 'PRJ-2202', relatedRoute: '/officer/alerts/ALT-4100',
      title: 'Critical anomaly needs review',
      message: 'Attendance at SC/ST Hostel Support Program is 43% below its 30-day baseline. Requires officer review.',
      read: false, minutes: 12,
    },
    {
      category: 'inspection-overdue', priority: 'high', projectId: 'PRJ-2207', relatedRoute: '/officer/inspections/INSP-3007',
      title: 'Inspection INSP-3007 is overdue',
      message: 'The surprise inspection for NGO Trust Community Outreach is past its scheduled date.',
      read: false, minutes: 35,
    },
    {
      category: 'cctv-offline', priority: 'high', projectId: 'PRJ-2202', relatedRoute: '/officer/cctv/CAM-0003',
      title: 'Camera CAM-0003 is offline',
      message: 'Main Gate camera at SC/ST Boys Hostel, Solapur has not sent a heartbeat for ~4 hours.',
      read: false, minutes: 58,
    },
    {
      category: 'inspection-assigned', priority: 'medium', projectId: 'PRJ-2205', relatedRoute: '/officer/inspections/INSP-3005',
      title: 'Inspection assigned to Arjun Nair',
      message: 'A special inspection (INSP-3005) for Divyang Welfare Assistance has been assigned.',
      read: false, minutes: 90,
    },
    {
      category: 'video-call-request', priority: 'medium', projectId: 'PRJ-2201', relatedRoute: '/officer/video-check',
      title: 'Video check requested',
      message: 'A random video check was initiated for Post-Matric Scholarship Rollout.',
      read: false, minutes: 130,
    },
    {
      category: 'inspection-due', priority: 'medium', projectId: 'PRJ-2202', relatedRoute: '/officer/inspections/INSP-3002',
      title: 'Inspection due today',
      message: 'In-progress inspection INSP-3002 for SC/ST Hostel Support Program is scheduled to complete today.',
      read: true, minutes: 240,
    },
    {
      category: 'compliance-issue', priority: 'high', projectId: 'PRJ-2210', relatedRoute: '/officer/projects/PRJ-2210',
      title: 'Repeated compliance failures',
      message: 'Samata Foundation Outreach has failed 3 of its last 6 compliance checks.',
      read: true, minutes: 400,
    },
    {
      category: 'report-submitted', priority: 'low', projectId: 'PRJ-2201', relatedRoute: '/officer/reports/inspection/INSP-3001',
      title: 'Inspection report submitted',
      message: 'The report for INSP-3001 (Post-Matric Scholarship Rollout) is ready for review.',
      read: true, minutes: 720,
    },
    {
      category: 'system', priority: 'low', projectId: null, relatedRoute: null,
      title: 'Scheduled maintenance on Sunday',
      message: 'The platform will be briefly unavailable on Sunday 02:00–02:30 IST for maintenance.',
      read: true, minutes: 1440,
    },
  ]

  return seed.map((s, i) => ({
    id: `NTF-${5000 + i}`,
    category: s.category,
    title: s.title,
    message: s.message,
    priority: s.priority,
    projectId: s.projectId,
    projectName: nameOf(s.projectId),
    relatedRoute: s.relatedRoute,
    timestamp: minsAgo(s.minutes),
    read: s.read,
    archived: false,
  }))
}

/** A small queue of "live" notifications the poller releases one at a time,
 *  then stops — enough to demonstrate real-time arrival without being noisy. */
export function buildIncomingQueue() {
  return [
    {
      category: 'cctv-offline', priority: 'high', projectId: 'PRJ-2205', relatedRoute: '/officer/cctv/CAM-0009',
      title: 'Camera CAM-0009 went offline',
      message: 'Store Room camera at Divyang Kalyan Kendra, Kolhapur just stopped responding.',
    },
    {
      category: 'ai-anomaly', priority: 'medium', projectId: 'PRJ-2210', relatedRoute: '/officer/alerts',
      title: 'New anomaly flagged for review',
      message: 'Unusual reporting frequency detected for Samata Foundation Outreach.',
    },
  ]
}
