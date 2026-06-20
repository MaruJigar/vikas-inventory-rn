import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useGetMeQuery } from '../../auth/hooks/useAuthMutations';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';

export const PendingHomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const { refetch, isFetching, isError } = useGetMeQuery();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⏳</Text>
        </View>
        <Text style={styles.title}>Account Pending Approval</Text>
        <Text style={styles.subtitle}>
          Hi {user?.full_name || 'User'}, your {user?.role ? user.role.replace('_', ' ').toLowerCase() : 'account'} registration is currently under review.
        </Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            You have limited access to the platform until an administrator approves your account. 
            You can browse the product catalogue and view the list of manufacturers.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.refreshBtn} 
          onPress={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.refreshBtnText}>Check Status Again</Text>
          )}
        </TouchableOpacity>

        {isError && (
          <Text style={styles.errorText}>Failed to check status. Please check your connection.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  icon: { fontSize: 40 },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: 'bold', color: COLORS.gray900, marginBottom: SPACING.sm, textAlign: 'center' },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray600, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 22 },
  infoCard: {
    backgroundColor: COLORS.white, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg, ...SHADOWS.md,
    marginBottom: SPACING['2xl'], width: '100%'
  },
  infoText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray700, lineHeight: 20, textAlign: 'center' },
  refreshBtn: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md, ...SHADOWS.colored(COLORS.primary), width: '100%', alignItems: 'center'
  },
  refreshBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: 'bold' },
  errorText: { color: COLORS.danger, marginTop: SPACING.md, fontSize: TYPOGRAPHY.sizes.sm }
});
