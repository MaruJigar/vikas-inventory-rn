import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { useAuthStore } from '../../../store/useAuthStore';
import { withLocationRecovery } from '../../../utils/locationUtils';
import { useDashboardQuery } from '../../analytics/hooks/useAnalyticsQueries';
import { useOrdersList } from '../../order/hooks/useOrderQueries';
import { useWorkingDayHistory } from '../../working-day/hooks/useWorkingDayQueries';
import { useWorkingDayMutations } from '../../working-day/hooks/useWorkingDayMutations';
import { useVisitHistory } from '../../visit/hooks/useVisitQueries';
import { useLogoutMutation } from '../../auth/hooks/useAuthMutations';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../styles/colors';
import { Feather } from '@expo/vector-icons';

import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppBadge } from '../../../components/ui/AppBadge';
import { AppLoadingSkeleton } from '../../../components/ui/AppLoadingSkeleton';
import { AppEmptyState } from '../../../components/ui/AppEmptyState';
import { AppMetricCard } from '../../../components/ui/AppMetricCard';
import { AppSectionHeader } from '../../../components/ui/AppSectionHeader';

const QuickActionCard = ({ icon, title, subtitle, onPress, color, disabled }) => (
  <AppCard 
    style={[styles.actionCard, disabled && { opacity: 0.5 }]} 
    onPress={onPress} 
    variant="elevated"
  >
    <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={22} color={color} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </AppCard>
);

const RecentOrderItem = ({ order, onPress }) => {
  const statusConfig = {
    CREATED: { status: 'warning', label: 'Pending' },
    CONFIRMED: { status: 'info', label: 'Confirmed' },
    PROCESSING: { status: 'default', label: 'Processing' },
    PACKED: { status: 'default', label: 'Packed' },
    DISPATCHED: { status: 'default', label: 'Dispatched' },
    DELIVERED: { status: 'success', label: 'Delivered' },
    CANCELLED: { status: 'danger', label: 'Cancelled' },
  };
  const config = statusConfig[order.status] || statusConfig.CREATED;

  return (
    <AppCard onPress={onPress} style={styles.orderItem} variant="elevated">
      <View style={styles.orderLeft}>
        <Text style={styles.orderId}>{order.order_number || order.id}</Text>
        <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderAmount}>₹{Number(order.final_order_amount).toLocaleString('en-IN')}</Text>
        <AppBadge label={config.label} status={config.status} style={{ marginTop: SPACING.xs }} />
      </View>
    </AppCard>
  );
};

export const SalesmanHomeScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  
  const { data: dashboard, isLoading: isDashboardLoading } = useDashboardQuery();
  const { data: ordersList, isLoading: isOrdersLoading } = useOrdersList();
  const { data: historyList, isLoading: isHistoryLoading } = useWorkingDayHistory();
  const { data: visitHistory, isLoading: isVisitLoading } = useVisitHistory();
  
  const { checkInMutation, checkOutMutation } = useWorkingDayMutations();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handlePlaceholderAction = (actionName) => {
    Alert.alert(
      actionName,
      "Feature available in upcoming update."
    );
  };

  const activeWorkingDay = useMemo(() => {
    if (!historyList || historyList.length === 0) return null;
    const latest = historyList[0];
    return latest.status === 'ACTIVE' ? latest : null;
  }, [historyList]);

  const activeVisit = useMemo(() => {
    if (!visitHistory || visitHistory.length === 0) return null;
    return visitHistory.find(v => v.status === 'ACTIVE');
  }, [visitHistory]);

  const isCheckedIn = !!activeWorkingDay;
  const hasActiveVisit = !!activeVisit;
  const isWorkingDayLoading = checkInMutation.isPending || checkOutMutation.isPending;

  const requestLocationAndExecute = async (mutation, prefix) => {
    await withLocationRecovery(async (location) => {
      let uuid = '';
      if (Crypto && Crypto.randomUUID) {
        uuid = Crypto.randomUUID();
      } else {
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = (Date.now() + Math.random()*16)%16 | 0;
          return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
        });
      }

      mutation.mutate({
        latitude: location.latitude,
        longitude: location.longitude,
        idempotencyKey: `${prefix}_${uuid}`,
      });
    });
  };

  const handleCheckIn = () => requestLocationAndExecute(checkInMutation, 'checkin');
  const handleCheckOut = () => requestLocationAndExecute(checkOutMutation, 'checkout');

  const stats = useMemo(() => {
    const totalOrders = dashboard?.orders?.ordersThisMonth || 0;
    const totalRevenue = dashboard?.orders?.orderValueThisMonth || 0;
    const pendingOrders = dashboard?.fulfillment?.ordersPendingDispatch || 0;
    return { totalOrders, totalRevenue, pendingOrders };
  }, [dashboard]);

  const recentOrders = useMemo(() => {
    if (!ordersList || !Array.isArray(ordersList)) return [];
    return ordersList.slice(0, 4);
  }, [ordersList]);

  if (isDashboardLoading || isHistoryLoading || isVisitLoading) {
    return (
      <View style={styles.center}>
        <AppLoadingSkeleton type="card" count={4} style={{ padding: SPACING.lg }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.headerArea}>
          <AppHeader 
            title={`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.full_name || 'Salesman'}`} 
            backgroundColor={COLORS.primary}
            textColor={COLORS.white}
            rightAction="Logout"
            onRightAction={handleLogout}
          />
          <View style={styles.statusContainer}>
            <AppBadge 
              label={isCheckedIn ? 'Checked In • Tracking Active' : 'Not Checked In'} 
              status={isCheckedIn ? 'success' : 'warning'} 
              icon={isCheckedIn ? 'check-circle' : 'pause-circle'}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <AppMetricCard title="Total Orders" value={stats.totalOrders} icon="shopping-bag" color={COLORS.primary} />
            <AppMetricCard title="Revenue" value={`₹${(stats.totalRevenue / 1000).toFixed(0)}K`} icon="trending-up" color={COLORS.success} />
            <AppMetricCard title="Pending" value={stats.pendingOrders} icon="clock" color={COLORS.warning} />
          </View>

          <AppSectionHeader title="Working Day" />
          <View style={styles.actionsGrid}>
            {!isCheckedIn ? (
              <QuickActionCard
                icon="map-pin"
                title="Check In"
                subtitle="Start your working day"
                color={COLORS.warning}
                onPress={handleCheckIn}
                disabled={isWorkingDayLoading}
              />
            ) : (
              <>
                <QuickActionCard
                  icon="x-circle"
                  title="Check Out"
                  subtitle="End your working day"
                  color={COLORS.danger}
                  onPress={handleCheckOut}
                  disabled={isWorkingDayLoading}
                />
                <QuickActionCard
                  icon={hasActiveVisit ? "navigation" : "store"}
                  title={hasActiveVisit ? "Resume Visit" : "Start Visit"}
                  subtitle={hasActiveVisit ? "Return to active visit" : "Visit a customer shop"}
                  color={hasActiveVisit ? COLORS.warning : COLORS.primary}
                  onPress={() => navigation.navigate(hasActiveVisit ? 'ActiveVisitScreen' : 'StartVisitScreen')}
                />
                <QuickActionCard
                  icon="shopping-cart"
                  title="Create Order"
                  subtitle="Take a new order"
                  color={COLORS.success}
                  onPress={() => handlePlaceholderAction('Create Order')}
                />
                <QuickActionCard
                  icon="plus"
                  title="Add Shop"
                  subtitle="Onboard a new shop"
                  color={COLORS.secondary}
                  onPress={() => navigation.navigate('ShopDuplicateCheckScreen')}
                />
              </>
            )}
          </View>

          <View style={styles.recentSection}>
            <AppSectionHeader 
              title="Recent Orders" 
              actionLabel="View All" 
              onAction={() => handlePlaceholderAction('View All Orders')} 
            />

            {isOrdersLoading ? (
               <AppLoadingSkeleton type="list" count={3} />
            ) : recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <RecentOrderItem
                  key={order.id}
                  order={order}
                  onPress={() => navigation.navigate('OrderDetailsScreen', { orderId: order.id })}
                />
              ))
            ) : (
              <AppEmptyState 
                icon="package" 
                title="No orders yet" 
                description="Start by placing your first order" 
              />
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
  center: { flex: 1, justifyContent: 'center' },
  headerArea: {
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING['3xl'] + SPACING.md,
  },
  statusContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  content: { flex: 1, paddingHorizontal: SPACING.lg },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: -SPACING['3xl'],
    marginBottom: SPACING.lg,
    zIndex: 10,
  },
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionCard: {
    width: '47%',
    marginBottom: 0,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  actionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  actionSubtitle: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  recentSection: { marginBottom: SPACING.xl },
  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderLeft: { flex: 1 },
  orderId: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.gray900 },
  orderDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400, marginTop: 4 },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.primary },
});
