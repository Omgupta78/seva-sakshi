/**
 * ---------------------------------------------------------------------
 * AUTHZ — service-layer authorization (stands in for backend middleware)
 * ---------------------------------------------------------------------
 * In a real system every request carries a session/JWT, the server derives
 * the caller's role from it, and middleware checks the required permission
 * BEFORE the handler runs — the browser is never trusted. This module is the
 * demo equivalent: the active role is set from the auth session, and each
 * sensitive service function calls `requirePermission(...)`, which throws
 * ForbiddenError when the role lacks it. So access is enforced in the
 * service tier, not merely by hiding a button.
 *
 * To go live: delete `setActiveRole` and read the role from the verified
 * request context on the server instead; `requirePermission` becomes real
 * middleware. The call sites in the services stay exactly the same.
 * ---------------------------------------------------------------------
 */
import { ROLES, roleHasPermission, permissionsForRole } from '../data/rbac.js'

export class ForbiddenError extends Error {
  constructor(permission) {
    super(`Access denied — this action requires the "${permission}" permission.`)
    this.name = 'ForbiddenError'
    this.permission = permission
    this.status = 403
  }
}

// The active role for the "current request". Defaults to the least-privileged
// role so an unset context can never accidentally grant access.
let activeRole = ROLES.VIEW_ONLY
let activeUser = { id: null, name: 'Unknown' }

/** Called by the auth layer whenever the signed-in user (role) changes. */
export function setActiveRole(role) {
  activeRole = role ?? ROLES.VIEW_ONLY
}

/** Identity of the signed-in user — used for audit attribution. */
export function setActiveUser(user) {
  activeUser = user ?? { id: null, name: 'Unknown' }
}

export function getActiveRole() {
  return activeRole
}

/** The current actor for audit records: who + what role. */
export function getActor() {
  return { id: activeUser.id, name: activeUser.name, role: activeRole }
}

export function can(permission) {
  return roleHasPermission(activeRole, permission)
}

/** Throw unless the active role holds `permission`. Use inside services. */
export function requirePermission(permission) {
  if (!roleHasPermission(activeRole, permission)) {
    throw new ForbiddenError(permission)
  }
}

export function activePermissions() {
  return permissionsForRole(activeRole)
}
