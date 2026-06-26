import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { Screen, Button, Spinner, LanguageToggle } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { useMe } from '@/features/auth/hooks';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { WaitingApprovalScreen } from '@/features/auth/screens/WaitingApprovalScreen';

/** Temporary post-approval landing — replaced by role dashboards in Phase 2. */
function ApprovedPlaceholder() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <Screen>
      <LanguageToggle />
      <View style={styles.center}>
        <Text style={typography.h1}>{user?.full_name ?? 'Qera'}</Text>
        <Text style={styles.muted}>Role: {user?.role}</Text>
        <Text style={styles.muted}>Approved ✓ — dashboards land in Phase 2.</Text>
      </View>
      <Button label="Log out" variant="danger" onPress={() => void logout()} />
    </Screen>
  );
}

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
    <ApprovedPlaceholder />
  ) : (
    <WaitingApprovalScreen />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  muted: { ...typography.body, color: colors.textMuted },
});
