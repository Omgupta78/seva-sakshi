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
  // Institution portal
  INSTITUTION_ADMIN: 'INSTITUTION_ADMIN',
  INSTITUTION_STAFF: 'INSTITUTION_STAFF',
  // Inspector portal
  INSPECTOR: 'INSPECTOR',
}

/** The three portals of Seva Sakshi. Roles belong to exactly one portal
 *  (SUPER_ADMIN is portal-agnostic and may enter any). */
export const PORTALS = { DEPARTMENT: 'department', INSTITUTION: 'institution', INSPECTOR: 'inspector' }

export const ROLE_PORTAL = {
  SUPER_ADMIN: PORTALS.DEPARTMENT, // home portal; can still access all
  DOSJE_OFFICER: PORTALS.DEPARTMENT,
  PMU_OFFICER: PORTALS.DEPARTMENT,
  STATE_AUTHORITY: PORTALS.DEPARTMENT,
  DISTRICT_AUTHORITY: PORTALS.DEPARTMENT,
  NGO_INSTITUTE: PORTALS.DEPARTMENT,
  VIEW_ONLY: PORTALS.DEPARTMENT,
  INSTITUTION_ADMIN: PORTALS.INSTITUTION,
  INSTITUTION_STAFF: PORTALS.INSTITUTION,
  INSPECTOR: PORTALS.INSPECTOR,
  INSPECTION_TEAM: PORTALS.INSPECTOR,
}

export const PORTAL_HOME = {
  department: '/officer/dashboard',
  institution: '/institution/dashboard',
  inspector: '/inspector/dashboard',
}

export const PORTAL_LOGIN = {
  department: '/login',
  institution: '/institution/login',
  inspector: '/inspector/login',
}

/** Which portal a role belongs to; SUPER_ADMIN passes any portal check. */
export function portalForRole(role) {
  return ROLE_PORTAL[role] ?? PORTALS.DEPARTMENT
}
export function roleCanAccessPortal(role, portal) {
  return role === ROLES.SUPER_ADMIN || portalForRole(role) === portal
}
export function homeForRole(role) {
  return PORTAL_HOME[portalForRole(role)] ?? '/login'
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
  INSTITUTION_ADMIN: 'Institution Admin',
  INSTITUTION_STAFF: 'Teacher / Staff',
  INSPECTOR: 'Inspector',
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
  INSTITUTION_ADMIN: 'Operate the institution — students, daily attendance, enrolment and reviews.',
  INSTITUTION_STAFF: 'Teacher — run attendance sessions for assigned classes.',
  INSPECTOR: 'Field inspector — view assignments, conduct inspections, capture evidence, submit reports.',
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
  VIEW_ASSIGNED_CCTV: 'VIEW_ASSIGNED_CCTV',
  VIEW_OWN_CCTV: 'VIEW_OWN_CCTV',
  MANAGE_BIOMETRIC_ENROLLMENT: 'MANAGE_BIOMETRIC_ENROLLMENT',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  VIEW_VIDEO_CHECK: 'VIEW_VIDEO_CHECK',
  UPLOAD_DOCUMENTS: 'UPLOAD_DOCUMENTS',
  VIEW_NOTIFICATIONS: 'VIEW_NOTIFICATIONS',
  MANAGE_USERS: 'MANAGE_USERS',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  // Lifecycle / destructive actions (soft-delete-first)
  PROJECT_ARCHIVE: 'PROJECT_ARCHIVE',
  INSTITUTE_DEACTIVATE: 'INSTITUTE_DEACTIVATE',
  NGO_DEACTIVATE: 'NGO_DEACTIVATE',
  STUDENT_DEACTIVATE: 'STUDENT_DEACTIVATE',
  BIOMETRIC_REMOVE: 'BIOMETRIC_REMOVE',
  CAMERA_DECOMMISSION: 'CAMERA_DECOMMISSION',
  INSPECTION_CANCEL: 'INSPECTION_CANCEL',
  ATTENDANCE_CORRECT: 'ATTENDANCE_CORRECT',
  USER_DEACTIVATE: 'USER_DEACTIVATE',
  PERMANENT_DELETE: 'PERMANENT_DELETE',
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
  VIEW_ASSIGNED_CCTV: 'View CCTV for assigned institutions',
  VIEW_OWN_CCTV: "View own institution's CCTV",
  MANAGE_BIOMETRIC_ENROLLMENT: 'Manage biometric enrollment',
  VIEW_ANALYTICS: 'View analytics & alerts',
  VIEW_REPORTS: 'View reports',
  VIEW_VIDEO_CHECK: 'Video check',
  UPLOAD_DOCUMENTS: 'Upload documents',
  VIEW_NOTIFICATIONS: 'View notifications',
  MANAGE_USERS: 'Manage users',
  SYSTEM_CONFIG: 'System configuration',
  VIEW_AUDIT_LOGS: 'View audit logs',
  PROJECT_ARCHIVE: 'Archive / restore projects',
  INSTITUTE_DEACTIVATE: 'Deactivate institutes',
  NGO_DEACTIVATE: 'Deactivate NGOs',
  STUDENT_DEACTIVATE: 'Deactivate beneficiaries',
  BIOMETRIC_REMOVE: 'Remove biometric enrollment',
  CAMERA_DECOMMISSION: 'Disable / decommission cameras',
  INSPECTION_CANCEL: 'Cancel / archive inspections',
  ATTENDANCE_CORRECT: 'Correct attendance records',
  USER_DEACTIVATE: 'Deactivate users',
  PERMANENT_DELETE: 'Permanently delete records',
}

const P = PERMISSIONS

/** The authoritative role→permission matrix. */
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS), // everything

  DOSJE_OFFICER: [
    P.VIEW_PROJECTS, P.EDIT_PROJECTS, P.VIEW_CCTV, P.VIEW_INSPECTIONS, P.ASSIGN_INSPECTION,
    P.VIEW_ATTENDANCE, P.MANAGE_BIOMETRIC_ENROLLMENT, P.VIEW_ANALYTICS, P.VIEW_REPORTS,
    P.VIEW_VIDEO_CHECK, P.VIEW_NOTIFICATIONS,
    // Lifecycle actions an officer may perform (soft-delete only; no permanent delete)
    P.PROJECT_ARCHIVE, P.INSTITUTE_DEACTIVATE, P.NGO_DEACTIVATE, P.STUDENT_DEACTIVATE,
    P.BIOMETRIC_REMOVE, P.CAMERA_DECOMMISSION, P.INSPECTION_CANCEL, P.ATTENDANCE_CORRECT,
  ],

  PMU_OFFICER: [
    P.VIEW_PROJECTS, P.VIEW_CCTV, P.VIEW_INSPECTIONS, P.ASSIGN_INSPECTION, P.VIEW_ATTENDANCE,
    P.MANAGE_BIOMETRIC_ENROLLMENT, P.VIEW_ANALYTICS, P.VIEW_REPORTS, P.VIEW_VIDEO_CHECK, P.VIEW_NOTIFICATIONS,
    // PMU has limited lifecycle rights over the records it works with
    P.INSPECTION_CANCEL, P.ATTENDANCE_CORRECT, P.STUDENT_DEACTIVATE, P.BIOMETRIC_REMOVE,
  ],

  INSPECTION_TEAM: [
    P.VIEW_PROJECTS, P.VIEW_INSPECTIONS, P.START_INSPECTION, P.SUBMIT_INSPECTION,
    P.VIEW_ATTENDANCE, P.VIEW_ASSIGNED_CCTV, P.VIEW_NOTIFICATIONS,
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

  // --- Institution portal ---
  INSTITUTION_ADMIN: [
    P.VIEW_ATTENDANCE, P.MANAGE_BIOMETRIC_ENROLLMENT, P.BIOMETRIC_REMOVE, P.STUDENT_DEACTIVATE,
    P.ATTENDANCE_CORRECT, P.VIEW_OWN_CCTV, P.VIEW_INSPECTIONS, P.VIEW_VIDEO_CHECK, P.VIEW_NOTIFICATIONS,
  ],
  INSTITUTION_STAFF: [
    P.VIEW_ATTENDANCE, P.MANAGE_BIOMETRIC_ENROLLMENT, P.ATTENDANCE_CORRECT, P.VIEW_OWN_CCTV, P.VIEW_NOTIFICATIONS,
  ],

  // --- Inspector portal ---
  INSPECTOR: [
    P.VIEW_INSPECTIONS, P.START_INSPECTION, P.SUBMIT_INSPECTION, P.VIEW_ATTENDANCE, P.VIEW_ASSIGNED_CCTV, P.VIEW_NOTIFICATIONS,
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
