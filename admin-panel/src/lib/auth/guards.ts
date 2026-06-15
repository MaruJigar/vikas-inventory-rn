import { Role } from '@/config/permissions';

/**
 * Validates if the user's role exists within the allowed roles array.
 */
export function hasRole(userRole: string | undefined, allowedRoles: readonly Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as Role);
}

/**
 * Utility to determine if a route can be accessed based on the user's role.
 */
export function canAccessRoute(userRole: string | undefined, routeRoles: readonly Role[]): boolean {
  return hasRole(userRole, routeRoles);
}

/**
 * Utility to determine if a menu item should be rendered based on the user's role.
 */
export function canAccessMenu(userRole: string | undefined, menuRoles: readonly Role[]): boolean {
  return hasRole(userRole, menuRoles);
}
