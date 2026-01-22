export type UserRoleType = string | null;

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRoleType, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(roles: string[] | null): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.includes('ADMIN');
}

/**
 * Get roles that can access a program
 */
export function getRolesForProgram(program: 'DSPD' | 'HRSS' | 'EPAS'): string[] {
  switch (program) {
    case 'DSPD':
      return ['ADMIN', 'DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER', 'TRAINER'];
    case 'HRSS':
      return ['ADMIN', 'HRSS_STAFF', 'TRAINER'];
    case 'EPAS':
      return ['ADMIN', 'EPAS_STAFF', 'TRAINER'];
    default:
      return ['ADMIN'];
  }
}

/**
 * Check if user can access program
 */
export function canAccessProgram(userRoles: string[] | null, program: 'DSPD' | 'HRSS' | 'EPAS'): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  if (isAdmin(userRoles)) return true;
  const allowedRoles = getRolesForProgram(program);
  return userRoles.some(role => allowedRoles.includes(role));
}

/**
 * Check if user can manage content
 */
export function canManageContent(roles: string[] | null): boolean {
  if (!roles || roles.length === 0) return false;
  return isAdmin(roles) || roles.includes('TRAINER');
}

/**
 * Check if user can manage users
 */
export function canManageUsers(roles: string[] | null): boolean {
  return isAdmin(roles);
}
