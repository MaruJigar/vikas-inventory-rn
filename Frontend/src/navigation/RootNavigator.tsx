import React from 'react';

import { Spinner } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { useMe } from '@/features/auth/hooks';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { WaitingApprovalScreen } from '@/features/auth/screens/WaitingApprovalScreen';

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  // On cold start the token is restored but the user isn't — fetch it once.
  const needsUser = status === 'authenticated' && !user;
  useMe(needsUser);

  if (status === 'loading') return <Spinner />;
  if (status === 'unauthenticated') return <AuthNavigator />;
  if (needsUser) return <Spinner />;

  return user?.approval_status === 'APPROVED' ? (
    <MainNavigator />
  ) : (
    <WaitingApprovalScreen />
  );
}
