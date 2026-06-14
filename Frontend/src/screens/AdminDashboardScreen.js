import React, { useContext, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Platform, StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

import { Feather } from '@expo/vector-icons';

const MetricCard = ({ title, value, iconName, color, bgColor }) => (
  <View style={[styles.metricCard, { backgroundColor: bgColor }]}>
    <View style={styles.metricTop}>
      <Feather name={iconName} size={22} color={color} style={{ opacity: 0.8 }} />
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
    <Text style={styles.metricTitle}>{title}</Text>
  </View>
);

const MenuCard = ({ title, iconName, color, onPress, subtitle }) => (
  <TouchableOpacity style={styles.mgmtCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.mgmtIcon, { backgroundColor: `${color}15` }]}>
      <Feather name={iconName} size={24} color={color} />
    </View>
    <View style={styles.mgmtInfo}>
      <Text style={styles.mgmtTitle}>{title}</Text>
      <Text style={styles.mgmtSubtitle}>{subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={20} color={COLORS.gray400} />
  </TouchableOpacity>
);

const LiveOrderCard = ({ order, onPress }) => {
  const statusConfig = {
    pending: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Pending', iconName: 'clock' },
    confirmed: { color: COLORS.info, bg: COLORS.infoLight, label: 'Confirmed', iconName: 'check-circle' },
    dispatched: { color: COLORS.secondary, bg: '#EDE9FE', label: 'Dispatched', iconName: 'truck' },
    delivered: { color: COLORS.success, bg: COLORS.successLight, label: 'Delivered', iconName: 'check' },
  };
  const status = statusConfig[order.status] || statusConfig.pending;
  const isNew = order.status === 'pending';

  return (
    <TouchableOpacity
      style={[styles.liveOrderCard, isNew && styles.liveOrderNew]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isNew && <View style={styles.newPulse}><Text style={styles.newPulseText}>NEW</Text></View>}
      <View style={styles.liveOrderHeader}>
        <View>
          <Text style={styles.liveOrderId}>{order.id}</Text>
          <Text style={styles.liveOrderSalesman}>by {order.salesmanName}</Text>
        </View>
        <View style={[styles.liveOrderBadge, { backgroundColor: status.bg }]}>
          <Feather name={status.iconName} size={12} color={status.color} style={{marginRight:4, marginTop:Platform.OS === 'web' ? 1 : 0}} />
          <Text style={[styles.liveOrderBadgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <View style={styles.liveOrderBody}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Feather name="briefcase" size={13} color={COLORS.gray400} style={{marginRight:6, marginTop:1}} />
          <Text style={styles.liveOrderCustomer}>{order.customerName}</Text>
        </View>
        <Text style={styles.liveOrderAmount}>₹{order.total.toLocaleString('en-IN')}</Text>
      </View>
      <View style={styles.liveOrderFooter}>
        <Text style={styles.liveOrderDate}>{order.date}</Text>
        <Text style={styles.liveOrderItems}>{order.items.length} items</Text>
      </View>
    </TouchableOpacity>
  );
};

export const AdminDashboardScreen = ({ navigation }) => {
  const { appState, handleLogout } = useContext(AppContext);

  const metrics = useMemo(() => {
    const totalOrders = appState.orders.length;
    const totalRevenue = appState.orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = appState.orders.filter(o => o.status === 'pending').length;
    const lowStockProducts = appState.products.filter(p => p.stock < 50).length;

    return [
      { title: 'Total Orders', value: totalOrders, iconName: 'package', color: COLORS.primary, bgColor: '#EEF2FF' },
      { title: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, iconName: 'trending-up', color: COLORS.success, bgColor: '#ECFDF5' },
      { title: 'Pending', value: pendingOrders, iconName: 'clock', color: COLORS.warning, bgColor: '#FFFBEB' },
      { title: 'Low Stock', value: lowStockProducts, iconName: 'alert-circle', color: COLORS.danger, bgColor: '#FEF2F2' },
    ];
  }, [appState.orders, appState.products]);

  const unreadNotifications = appState.notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Admin Panel</Text>
              <Text style={styles.userName}>{appState.currentUser?.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Feather name="bell" size={20} color={COLORS.white} />
                {unreadNotifications > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unreadNotifications}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Feather name="log-out" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.metricsRow}>
            {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
          </View>

          <View style={styles.feedSection}>
            <View style={styles.feedHeader}>
              <View style={styles.feedTitleRow}>
                <View style={styles.liveDot} />
                <Text style={styles.feedTitle}>Live Order Feed</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')} style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.viewAllText}>View All </Text>
                <Feather name="chevron-right" size={14} color={COLORS.primary} style={{marginTop:1}} />
              </TouchableOpacity>
            </View>

            {appState.orders.slice(0, 5).map(order => (
              <LiveOrderCard
                key={order.id}
                order={order}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Management</Text>

          <TouchableOpacity
            style={styles.mgmtCard}
            onPress={() => navigation.navigate('InventoryManagement')}
            activeOpacity={0.7}
          >
            <View style={[styles.mgmtIcon, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="package" size={20} color="#4F46E5" />
            </View>
            <View style={styles.mgmtInfo}>
              <Text style={styles.mgmtTitle}>Inventory Management</Text>
              <Text style={styles.mgmtSubtitle}>Manage products, stock & prices</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mgmtCard}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.7}
          >
            <View style={[styles.mgmtIcon, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="bar-chart-2" size={20} color="#10B981" />
            </View>
            <View style={styles.mgmtInfo}>
              <Text style={styles.mgmtTitle}>Analytics & Reports</Text>
              <Text style={styles.mgmtSubtitle}>Product sales & individual totals</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mgmtCard}
            onPress={() => navigation.navigate('SalesmenManagement')}
            activeOpacity={0.7}
          >
            <View style={[styles.mgmtIcon, { backgroundColor: '#F5F3FF' }]}>
              <Feather name="users" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.mgmtInfo}>
              <Text style={styles.mgmtTitle}>Team Management</Text>
              <Text style={styles.mgmtSubtitle}>Add or remove salesmen access</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mgmtCard}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.mgmtIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="bell" size={20} color="#F59E0B" />
            </View>
            <View style={styles.mgmtInfo}>
              <Text style={styles.mgmtTitle}>Notifications</Text>
              <Text style={styles.mgmtSubtitle}>{unreadNotifications} unread alerts</Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.gray400} />
          </TouchableOpacity>

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
    paddingBottom: SPACING['3xl'] + SPACING.lg, // Extra depth for cleaner overlap float
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.7)' },
  userName: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: '700', color: COLORS.white, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  notifBtn: { position: 'relative', padding: SPACING.sm },
  notifIcon: { fontSize: 22 },
  notifBadge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: COLORS.danger, width: 16, height: 16,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary, // Blend with background header color
  },
  notifBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  logoutText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: SPACING.lg },

  // Metrics
  metricsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm,
    marginTop: -SPACING['3xl'], marginBottom: SPACING.xl,
    zIndex: 10,
  },
  metricCard: {
    width: '48%', padding: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md, elevation: 5,
  },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xs },
  metricIcon: { fontSize: 20 },
  metricValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800' },
  metricTitle: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '500', color: COLORS.gray500 },

  // Feed
  feedSection: { marginBottom: SPACING.xl },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  feedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  feedTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  viewAllText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600' },

  liveOrderCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.sm,
    borderLeftWidth: 3, borderLeftColor: COLORS.border,
    ...SHADOWS.sm,
  },
  liveOrderNew: { borderLeftColor: COLORS.primary, backgroundColor: '#FAFAFE' },
  newPulse: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  newPulseText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  liveOrderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveOrderId: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.gray900 },
  liveOrderSalesman: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  liveOrderBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, height: 22, borderRadius: BORDER_RADIUS.full },
  liveOrderBadgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700', lineHeight: Platform.OS === 'web' ? 14 : undefined },

  liveOrderBody: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  liveOrderCustomer: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray700, fontWeight: '500' },
  liveOrderAmount: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '800', color: COLORS.primary },

  liveOrderFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  liveOrderDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400 },
  liveOrderItems: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400 },

  // Section
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },

  // Management
  mgmtCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  mgmtIcon: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  mgmtIconText: { fontSize: 22 },
  mgmtInfo: { flex: 1, marginLeft: SPACING.md },
  mgmtTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray900 },
  mgmtSubtitle: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  mgmtArrow: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.gray400 },
});
