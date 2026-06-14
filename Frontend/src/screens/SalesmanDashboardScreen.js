import React, { useContext, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Platform, StatusBar,
} from 'react-native';
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

const RecentOrderItem = ({ order, onPress }) => {
  const statusConfig = {
    pending: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Pending' },
    confirmed: { color: COLORS.info, bg: COLORS.infoLight, label: 'Confirmed' },
    dispatched: { color: COLORS.secondary, bg: '#EDE9FE', label: 'Dispatched' },
    delivered: { color: COLORS.success, bg: COLORS.successLight, label: 'Delivered' },
    cancelled: { color: COLORS.danger, bg: COLORS.dangerLight, label: 'Cancelled' },
  };
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <TouchableOpacity style={styles.orderItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.orderLeft}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.orderCustomer}>{order.customerName}</Text>
        <Text style={styles.orderDate}>{order.date}</Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderAmount}>₹{order.total.toLocaleString('en-IN')}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const SalesmanDashboardScreen = ({ navigation }) => {
  const { appState, handleLogout } = useContext(AppContext);

  const stats = useMemo(() => {
    const myOrders = appState.orders.filter(o => o.salesmanName === appState.currentUser?.name);
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = myOrders.filter(o => o.date === today);
    const totalRevenue = myOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = myOrders.filter(o => o.status === 'pending').length;

    return {
      totalOrders: myOrders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      pendingOrders,
    };
  }, [appState.orders, appState.currentUser]);

  const recentOrders = useMemo(() => {
    return appState.orders
      .filter(o => o.salesmanName === appState.currentUser?.name)
      .slice(0, 4);
  }, [appState.orders, appState.currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Header moved inside to prevent overlap stacking issues */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},</Text>
              <Text style={styles.userName}>{appState.currentUser?.name} 👋</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats Cards float perfectly over content now */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statPrimary]}>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={[styles.statCard, styles.statSuccess]}>
              <Text style={styles.statValue}>₹{(stats.totalRevenue / 1000).toFixed(0)}K</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={[styles.statCard, styles.statWarning]}>
              <Text style={styles.statValue}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickActionCard
              icon="🛒"
              title="New Order"
              subtitle="Start taking order"
              color={COLORS.primary}
              onPress={() => navigation.navigate('CustomerSelect')}
            />
            <QuickActionCard
              icon="📋"
              title="My Orders"
              subtitle="View order history"
              color={COLORS.success}
              onPress={() => navigation.navigate('OrderHistory')}
            />
            <QuickActionCard
              icon="📍"
              title="Check-in"
              subtitle="Customer visit"
              color={COLORS.warning}
              onPress={() => navigation.navigate('CustomerSelect', { mode: 'checkin' })}
            />
            <QuickActionCard
              icon="👥"
              title="Customers"
              subtitle="View all customers"
              color={COLORS.secondary}
              onPress={() => navigation.navigate('CustomerSelect', { mode: 'view' })}
            />
          </View>

          {/* Recent Orders */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
                <Text style={styles.viewAllText}>View All →</Text>
              </TouchableOpacity>
            </View>

            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <RecentOrderItem
                  key={order.id}
                  order={order}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Start by placing your first order</Text>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.lg : SPACING['3xl'],
    paddingBottom: SPACING['3xl'] + SPACING.lg, // Extra padding for float space
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '400' },
  userName: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: '700', color: COLORS.white, marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  logoutText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: SPACING.lg },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: SPACING.sm,
    marginTop: -SPACING['3xl'], // Shift cards up over the header
    marginBottom: SPACING.xl,
    zIndex: 10, // Safety guarantee
  },
  statCard: {
    flex: 1, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center', backgroundColor: COLORS.white,
    ...SHADOWS.md, elevation: 5,
  },
  statPrimary: { backgroundColor: '#EEF2FF' },
  statSuccess: { backgroundColor: '#ECFDF5' },
  statWarning: { backgroundColor: '#FFFBEB' },
  statValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: COLORS.gray900 },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '500', color: COLORS.gray500, marginTop: 2 },

  // Section
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900,
    marginBottom: SPACING.md,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    width: '47%', backgroundColor: COLORS.white, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg, ...SHADOWS.sm,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  actionIconText: { fontSize: 22 },
  actionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  actionSubtitle: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },

  // Recent Orders
  recentSection: { marginBottom: SPACING.xl },
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600' },

  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  orderLeft: { flex: 1 },
  orderId: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.gray900 },
  orderCustomer: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, marginTop: 2 },
  orderDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400, marginTop: 4 },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.primary },
  statusBadge: {
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full, marginTop: SPACING.xs,
  },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '600' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: SPACING['2xl'] },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray600 },
  emptySubtext: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray400, marginTop: 4 },
});
