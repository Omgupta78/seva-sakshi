/**
 * ---------------------------------------------------------------------
 * DEMO ACCOUNTS — one auth system, role-based redirect
 * ---------------------------------------------------------------------
 * All three portals share ONE authentication context (AuthContext). These
 * are the demo identities each portal's login validates against. In
 * production the login endpoint returns the same shape (role + profile) and
 * these client-side checks are deleted.
 *
 * The `role` drives which portal the user lands in (see rbac PORTAL_HOME).
 * ---------------------------------------------------------------------
 */
import { ROLES } from './rbac.js'

/** Department portal uses the existing employee login (EMP1001 / Passw0rd!). */
export const DEPARTMENT_DEMO = { employeeId: 'EMP1001', password: 'Passw0rd!' }

/** Institution portal accounts, keyed by Institution ID + username.
 *  The Institution ID here is ALSO the device's video-call code: the institute
 *  goes online under it and the Department rings the same id. Keep them in sync
 *  with the department's institution registry (listCallableInstitutions). */
const INSTITUTION_ACCOUNTS = {
  'INST-001': {
    institutionName: 'Government Ashram Shala, Wada',
    organizationId: 'ORG-001',
    district: 'Thane',
    users: {
      admin: { role: ROLES.INSTITUTION_ADMIN, name: 'Ravi Deshpande', initials: 'RD', title: 'Institution Administrator' },
      teacher: { role: ROLES.INSTITUTION_STAFF, name: 'Kavita More', initials: 'KM', title: 'Class Teacher' },
    },
  },
  'INST-002': {
    institutionName: 'SC/ST Boys Hostel, Solapur',
    organizationId: 'ORG-002',
    district: 'Solapur',
    users: {
      admin: { role: ROLES.INSTITUTION_ADMIN, name: 'Baban Kadam', initials: 'BK', title: 'Institution Administrator' },
      teacher: { role: ROLES.INSTITUTION_STAFF, name: 'Suresh Jadhav', initials: 'SJ', title: 'Warden' },
    },
  },
  'INST-003': {
    institutionName: 'Adarsh Vidyalaya, Nagpur',
    organizationId: 'ORG-003',
    district: 'Nagpur',
    users: {
      admin: { role: ROLES.INSTITUTION_ADMIN, name: 'Vikram Patil', initials: 'VP', title: 'Institution Administrator' },
      teacher: { role: ROLES.INSTITUTION_STAFF, name: 'Meena Joshi', initials: 'MJ', title: 'Class Teacher' },
    },
  },
}

const DEMO_PASSWORD = 'Passw0rd!'

/**
 * The department's callable institution registry — every institution that has
 * a portal account and can therefore go online to receive a video call. The
 * `institutionId` is the exact video-call code both sides use, so the
 * Department never has to type a code by hand (no typos, no mismatch).
 */
export function listCallableInstitutions() {
  return Object.entries(INSTITUTION_ACCOUNTS).map(([institutionId, inst]) => ({
    institutionId,
    name: inst.institutionName,
    organizationId: inst.organizationId,
    district: inst.district ?? '—',
  }))
}

/** Validate an institution login. Returns a user profile or null. */
export function resolveInstitutionLogin(institutionId, username, password) {
  const inst = INSTITUTION_ACCOUNTS[String(institutionId).trim().toUpperCase()]
  if (!inst) return null
  const acct = inst.users[String(username).trim().toLowerCase()]
  if (!acct || password !== DEMO_PASSWORD) return null
  return {
    ...acct,
    rbacRole: acct.role,
    employeeId: `${institutionId}-${username}`,
    institutionId: String(institutionId).trim().toUpperCase(),
    institutionName: inst.institutionName,
    organizationId: inst.organizationId,
    district: 'Thane',
  }
}

/** Inspector portal accounts, keyed by username. */
const INSPECTOR_ACCOUNTS = {
  inspector: { role: ROLES.INSPECTOR, name: 'Arjun Nair', initials: 'AN', inspectorId: 'INSPR-05' },
  ananya: { role: ROLES.INSPECTOR, name: 'Ananya Iyer', initials: 'AI', inspectorId: 'INSPR-03' },
}

export function resolveInspectorLogin(username, password) {
  const acct = INSPECTOR_ACCOUNTS[String(username).trim().toLowerCase()]
  if (!acct || password !== DEMO_PASSWORD) return null
  return {
    ...acct,
    rbacRole: acct.role,
    employeeId: acct.inspectorId,
    district: 'Nashik',
  }
}

/** For the docs / login-page hints. */
export const DEMO_CREDENTIAL_HINTS = {
  department: 'EMP1001 / Passw0rd!',
  institutionAdmin: 'INST-001 · admin / Passw0rd!',
  institutionTeacher: 'INST-001 · teacher / Passw0rd!',
  inspector: 'inspector / Passw0rd!',
}
