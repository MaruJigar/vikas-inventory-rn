import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS } from '../../styles/colors';

// Ensure user is authenticated
export const AuthGuard = ({ children }) => {
  const { accessToken, isHydrating } = useAuthStore();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Navigation router handles the actual redirect if unauthenticated.
  // This wrapper just ensures we don't render children until ready.
  return <>{children}</>;
};

// Ensure user has specific role
export const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
  const role = useAuthStore((state) => state.role);

  if (!allowedRoles.includes(role)) {
    return fallback; // Return nothing or an Access Denied screen
  }

  return <>{children}</>;
};

// Ensure user is approved
export const ApprovalGuard = ({ children, fallback = null }) => {
  const approvalStatus = useAuthStore((state) => state.approvalStatus);

  if (approvalStatus !== 'APPROVED') {
    return fallback;
  }

  return <>{children}</>;
};
