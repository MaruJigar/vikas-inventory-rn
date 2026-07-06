import { UserRole } from '@/store/useAuthStore';

export const ADMIN_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'MANUFACTURER_ADMIN',
  'DISTRIBUTOR_ADMIN',
] as const;

export const isAdminRole = (role?: UserRole | string | null): boolean => {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as UserRole);
};

export const getRoleLabel = (role?: UserRole | string | null): string => {
  if (!role) return '';
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'MANUFACTURER_ADMIN':
      return 'Manufacturer Admin';
    case 'DISTRIBUTOR_ADMIN':
      return 'Distributor Admin';
    case 'SALESMAN':
      return 'Salesman';
    default:
      return role;
  }
};
