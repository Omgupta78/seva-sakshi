/**
 * ---------------------------------------------------------------------
 * RBAC — roles, granular permissions, and the role→permission matrix
 * ---------------------------------------------------------------------
 * This is the single source of truth for authorization. In production the
 * SAME matrix lives on the server and is the authority; the browser copy
 * here only drives UX (hiding what a role can't use). Every sensitive
 * service call still checks permission in services/authz.js — the stand-in
 * for backend authorization middleware — so access is never granted by the
 * frontend merely failing to hide a button.
 * ---------------------------------------------------------------------
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  DOSJE_OFFICER: 'DOSJE_OFFICER',
  PMU_OFFICER: 'PMU_OFFICER',
  INSPECTION_TEAM: 'INSPECTION_TEAM',
  STATE_AUTHORITY: 'STATE_AUTHORITY',
  DISTRICT_AUTHORITY: 'DISTRICT_AUTHORITY',
  NGO_INSTITUTE: 'NGO_INSTITUTE',
  VIEW_ONLY: 'VIEW_ONLY',
}

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  DOSJE_OFFICER: 'DoSJE Officer',
  PMU_OFFICER: 'PMU Officer',
  INSPECTION_TEAM: 'Inspection Team',
  STATE_AUTHORITY: 'State Authority',
  DISTRICT_AUTHORITY: 'District Authority',
  NGO_INSTITUTE: 'NGO / Institute',
  VIEW_ONLY: 'View Only',
}

export const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: 'Full access — manage users, permissions and system configuration.',
  DOSJE_OFFICER: 'Monitor projects & CCTV, assign inspections, review reports and analytics.',
  PMU_OFFICER: 'Project management unit — monitor projects, assign inspections, view analytics.',
  INSPECTION_TEAM: 'Field team — view assigned inspections, capture evidence, submit reports.',
  STATE_AUTHORITY: 'State-level oversight — read access across projects, inspections and analytics.',
  DISTRICT_AUTHORITY: 'District-level oversight — read access scoped to the district.',
  NGO_INSTITUTE: 'View own project, upload documents, view own inspections and attendance.',
  VIEW_ONLY: 'Read-only access to projects and inspections.',
}

export const PERMISSIONS = {
  VIEW_PROJECTS: 'VIEW_PROJECTS',
  EDIT_PROJECTS: 'EDIT_PROJECTS',
  VIEW_CCTV: 'VIEW_CCTV',
  VIEW_INSPECTIONS: 'VIEW_INSPECTIONS',
  START_INSPECTION: 'START_INSPECTION',
  ASSIGN_INSPECTION: 'ASSIGN_INSPECTION',
  SUBMIT_INSPECTION: 'SUBMIT_INSPECTION',
  VIEW_ATTENDANCE: 'VIEW_ATTENDANCE',
  MANAGE_BIOMETRIC_ENROLLMENT: 'MANAGE_BIOMETRIC_ENROLLMENT',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  VIEW_VIDEO_CHECK: 'VIEW_VIDEO_CHECK',
  UPLOAD_DOCUMENTS: 'UPLOAD_DOCUMENTS',
  VIEW_NOTIFICATIONS: 'VIEW_NOTIFICATIONS',
  MANAGE_USERS: 'MANAGE_USERS',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
}

export const PERMISSION_LABELS = {
  VIEW_PROJECTS: 'View projects',
  EDIT_PROJECTS: 'Create / edit projects',
  VIEW_CCTV: 'View CCTV',
  VIEW_INSPECTIONS: 'View inspections',
  START_INSPECTION: 'Start inspection',
  ASSIGN_INSPECTION: 'Assign inspection',
  SUBMIT_INSPECTION: 'Submit inspection report',
  VIEW_ATTENDANCE: 'View attendance',
  MANAGE_BIOMETRIC_ENROLLMENT: 'Manage biometric enrollment',
  VIEW_ANALYTICS: 'View analytics & alerts',
  VIEW_REPORTS: 'View reports',
  VIEW_VIDEO_CHECK: 'Video check',
  UPLOAD_DOCUMENTS: 'Upload documents',
  VIEW_NOTIFICATIONS: 'View notifications',
  MANAGE_USERS: 'Manage users',
  SYSTEM_CONFIG: 'System configuration',
  VIEW_AUDIT_LOGS: 'View audit logs',
}

const P = PERMISSIONS

/** The authoritative role→permission matrix. */
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS), // everything

  DOSJE_OFFICER: [
    P.VIEW_PROJECTS, P.EDIT_PROJECTS, P.VIEW_CCTV, P.VIEW_INSPECTIONS, P.ASSIGN_INSPECTION,
    P.VIEW_ATTENDANCE, P.MANAGE_BIOMETRIC_ENROLLMENT, P.VIEW_ANALYTICS, P.VIEW_REPORTS,
    P.VIEW_VIDEO_CHECK, P.VIEW_NOTIFICATIONS,
  ],

  PMU_OFFICER: [
    P.VIEW_PROJECTS, P.VIEW_CCTV, P.VIEW_INSPECTIONS, P.ASSIGN_INSPECTION, P.VIEW_ATTENDANCE,
    P.MANAGE_BIOMETRIC_ENROLLMENT, P.VIEW_ANALYTICS, P.VIEW_REPORTS, P.VIEW_VIDEO_CHECK, P.VIEW_NOTIFICATIONS,
  ],

  INSPECTION_TEAM: [
    P.VIEW_PROJECTS, P.VIEW_INSPECTIONS, P.START_INSPECTION, P.SUBMIT_INSPECTION,
    P.VIEW_ATTENDANCE, P.VIEW_NOTIFICATIONS,
  ],

  STATE_AUTHORITY: [
    P.VIEW_PROJECTS, P.VIEW_CCTV, P.VIEW_INSPECTIONS, P.VIEW_ATTENDANCE, P.VIEW_ANALYTICS,
    P.VIEW_REPORTS, P.VIEW_NOTIFICATIONS,
  ],

  DISTRICT_AUTHORITY: [
    P.VIEW_PROJECTS, P.VIEW_CCTV, P.VIEW_INSPECTIONS, P.VIEW_ATTENDANCE, P.VIEW_REPORTS, P.VIEW_NOTIFICATIONS,
  ],

  NGO_INSTITUTE: [
    P.VIEW_PROJECTS, P.UPLOAD_DOCUMENTS, P.VIEW_INSPECTIONS, P.VIEW_ATTENDANCE, P.VIEW_NOTIFICATIONS,
  ],

  VIEW_ONLY: [
    P.VIEW_PROJECTS, P.VIEW_INSPECTIONS, P.VIEW_NOTIFICATIONS,
  ],
}

/** Does a role hold a permission? */
export function roleHasPermission(role, permission) {
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission)
}

/** All permissions for a role. */
export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] ?? []
}
