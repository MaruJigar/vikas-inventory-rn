'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { isAdminRole } from '@/lib/auth/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
}

export function RoleGuard({ children }: RoleGuardProps) {
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
      }
    }
  }, [isMounted, isAuthenticated, user, router]);

  // Prevent rendering anything during SSR/hydration or if unauthorized
  if (!isMounted || !isAuthenticated || !isAdminRole(user?.role)) {
    return null;
  }

  return <>{children}</>;
}
