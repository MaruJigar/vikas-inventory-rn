import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useLogoutMutation } from '../../auth/hooks/useAuthMutations';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name || 'User Name'}</Text>
          <Text style={styles.role}>{user?.role?.replace('_', ' ') || 'Unknown Role'}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{user?.approval_status || 'UNKNOWN'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <Text style={styles.logoutBtnText}>
            {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: 'bold', color: COLORS.gray900 },
  content: { padding: SPACING.xl },
  profileCard: {
    backgroundColor: COLORS.white, padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl, ...SHADOWS.md,
    alignItems: 'center', marginBottom: SPACING.xl
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primaryDark },
  name: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: 'bold', color: COLORS.gray900, marginBottom: 4 },
  role: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500, marginBottom: SPACING.xl },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
    paddingVertical: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border
  },
  infoLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600 },
  infoValue: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray900, fontWeight: '500' },
  statusBadge: { backgroundColor: COLORS.warningLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { color: COLORS.warningDark, fontSize: 10, fontWeight: 'bold' },
  logoutBtn: {
    backgroundColor: COLORS.white, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.danger,
    alignItems: 'center'
  },
  logoutBtnText: { color: COLORS.danger, fontSize: TYPOGRAPHY.sizes.base, fontWeight: 'bold' }
});
