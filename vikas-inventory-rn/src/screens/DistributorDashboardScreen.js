import React, { useContext, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Platform, StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const QuickActionCard = ({ icon, title, subtitle, onPress, color }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
      <Text style={styles.actionIconText}>{icon}</Text>
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

export const DistributorDashboardScreen = ({ navigation }) => {
  const { appState, handleLogout } = useContext(AppContext);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  const stats = useMemo(() => {
    // Mock calculations
    return {
      pendingOrders: 12,
      todayRevenue: 45000,
      activeSalesmen: 5,
      lowStockItems: 3
    };
  }, [appState]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{t('dashboard.welcome')} Distributor,</Text>
              <Text style={styles.userName}>{appState.currentUser?.name} 👋</Text>
            </View>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity style={styles.logoutBtn} onPress={toggleLanguage}>
                <Text style={styles.logoutText}>{i18n.language === 'en' ? 'HI' : 'EN'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statPrimary]}>
              <Text style={styles.statValue}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending Orders</Text>
            </View>
            <View style={[styles.statCard, styles.statSuccess]}>
              <Text style={styles.statValue}>₹{(stats.todayRevenue / 1000).toFixed(0)}K</Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Operations</Text>
          <View style={styles.actionsGrid}>
            <QuickActionCard
              icon="📦"
              title="Fulfillment"
              subtitle="Pack & Dispatch"
              color={COLORS.primary}
              onPress={() => navigation.navigate('OrderHistory')}
            />
            <QuickActionCard
              icon="📊"
              title="Inventory"
              subtitle="Stock Management"
              color={COLORS.warning}
              onPress={() => navigation.navigate('InventoryManagement')}
            />
            <QuickActionCard
              icon="👥"
              title="My Team"
              subtitle="Salesmen tracking"
              color={COLORS.secondary}
              onPress={() => navigation.navigate('SalesmenManagement')}
            />
            <QuickActionCard
              icon="📈"
              title="Analytics"
              subtitle="Performance reports"
              color={COLORS.success}
              onPress={() => navigation.navigate('Analytics')}
            />
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.lg : SPACING['3xl'],
    paddingBottom: SPACING['3xl'] + SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '400' },
  userName: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: '700', color: COLORS.white, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full },
  logoutText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: SPACING.lg },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: -SPACING['3xl'], marginBottom: SPACING.xl, zIndex: 10 },
  statCard: { flex: 1, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', backgroundColor: COLORS.white, ...SHADOWS.md, elevation: 5 },
  statPrimary: { backgroundColor: '#EEF2FF' },
  statSuccess: { backgroundColor: '#ECFDF5' },
  statValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: COLORS.gray900 },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '500', color: COLORS.gray500, marginTop: 2 },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  actionCard: { width: '47%', backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.sm },
  actionIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  actionIconText: { fontSize: 22 },
  actionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  actionSubtitle: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
});
