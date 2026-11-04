'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { isAdminRole } from '@/lib/auth/rbac';
import { Role } from '@/config/permissions';
import { hasRole } from '@/lib/auth/guards';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: readonly Role[];
  roles?: readonly Role[];
}

export function RoleGuard({ children, allowedRoles, roles }: RoleGuardProps) {
  const effectiveRoles = allowedRoles || roles;
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdminRole(user?.role)) {
        router.replace('/login');
      } else if (effectiveRoles && !hasRole(user?.role, effectiveRoles)) {
        router.replace('/dashboard');
      }
    }
  }, [isMounted, isAuthenticated, user, router, effectiveRoles]);

  // Prevent rendering anything during SSR/hydration or if unauthorized
  if (!isMounted || !isAuthenticated || !isAdminRole(user?.role)) {
    return null;
  }

  if (effectiveRoles && !hasRole(user?.role, effectiveRoles)) {
    return null;
  }

  return <>{children}</>;
}
