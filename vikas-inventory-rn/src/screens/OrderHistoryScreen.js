import React, { useContext, useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Platform, StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Dispatched', 'Delivered'];

const statusConfig = {
  pending: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Pending', iconName: 'clock' },
  confirmed: { color: COLORS.info, bg: COLORS.infoLight, label: 'Confirmed', iconName: 'check-circle' },
  dispatched: { color: '#7C3AED', bg: '#EDE9FE', label: 'Dispatched', iconName: 'truck' },
  delivered: { color: COLORS.success, bg: COLORS.successLight, label: 'Delivered', iconName: 'check-square' },
  cancelled: { color: COLORS.danger, bg: COLORS.dangerLight, label: 'Cancelled', iconName: 'x-circle' },
};

const OrderCard = ({ order, onPress }) => {
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Feather name={status.iconName} size={11} color={status.color} style={{marginRight: 4, marginTop: Platform.OS === 'web' ? 1 : 0}} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.orderCustomerRow}>
          <Feather name="briefcase" size={13} color={COLORS.gray400} style={{marginRight:6, marginTop: 1}} />
          <Text style={styles.orderCustomer} numberOfLines={1}>{order.customerName}</Text>
        </View>
        {order.salesmanName && (
          <Text style={styles.orderSalesman}>by {order.salesmanName}</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderStat}>
          <Text style={styles.orderStatLabel}>{order.items.length} items</Text>
        </View>
        <Text style={styles.orderTotal}>₹{order.total.toLocaleString('en-IN')}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const OrderHistoryScreen = ({ navigation }) => {
  const { appState, handleLogout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('All');
  const isAdmin = appState.userRole === 'admin';

  const filteredOrders = useMemo(() => {
    let orders = appState.orders;
    if (!isAdmin) {
      orders = orders.filter(o => o.salesmanName === appState.currentUser?.name);
    }
    if (activeTab !== 'All') {
      orders = orders.filter(o => o.status === activeTab.toLowerCase());
    }
    return orders;
  }, [appState.orders, activeTab, isAdmin, appState.currentUser]);

  const tabCounts = useMemo(() => {
    const orders = isAdmin ? appState.orders : appState.orders.filter(o => o.salesmanName === appState.currentUser?.name);
    return {
      All: orders.length,
      Pending: orders.filter(o => o.status === 'pending').length,
      Confirmed: orders.filter(o => o.status === 'confirmed').length,
      Dispatched: orders.filter(o => o.status === 'dispatched').length,
      Delivered: orders.filter(o => o.status === 'delivered').length,
    };
  }, [appState.orders, isAdmin, appState.currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header (Acts as Home for Salesmen) */}
      <View style={styles.header}>
        {isAdmin ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={COLORS.gray900} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>{isAdmin ? 'All Orders' : 'My Order Dashboard'}</Text>
        {!isAdmin ? (
          <TouchableOpacity onPress={handleLogout} style={styles.rightLogout}>
            <Feather name="log-out" size={22} color={COLORS.danger} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          data={STATUS_TABS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item && styles.tabActive]}
              onPress={() => setActiveTab(item)}
            >
              <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]}>
                {item}
              </Text>
              {tabCounts[item] > 0 && (
                <View style={[styles.tabCount, activeTab === item && styles.tabCountActive]}>
                  <Text style={[styles.tabCountText, activeTab === item && styles.tabCountTextActive]}>
                    {tabCounts[item]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="clipboard" size={48} color={COLORS.gray300} style={{marginBottom: SPACING.md}} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders</Text>
          </View>
        }
      />

      {/* Floating New Order Button for Salesmen Hub Flow (Req #1) */}
      {!isAdmin && (
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CustomerSelect')}
        >
          <Feather name="plus" size={20} color={COLORS.white} style={{marginRight: SPACING.xs}} />
          <Text style={styles.fabText}>New Order</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.gray900, flex: 1, textAlign: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: COLORS.gray700 },
  rightLogout: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  placeholder: { width: 40 },

  tabsWrap: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabsList: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.backgroundAlt,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', color: COLORS.gray600 },
  tabTextActive: { color: COLORS.white },
  tabCount: { 
    backgroundColor: COLORS.gray200, 
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', 
    paddingHorizontal: 4 
  },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabCountText: { fontSize: 10, fontWeight: '700', color: COLORS.gray600, lineHeight: Platform.OS === 'web' ? 11 : undefined },
  tabCountTextActive: { color: COLORS.white },

  list: { padding: SPACING.lg, paddingBottom: 100 }, // Space for FAB

  orderCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.gray900 },
  orderDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 20, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderBody: { marginTop: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  orderCustomerRow: { flexDirection: 'row', alignItems: 'center' },
  orderCustomer: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray900, flex: 1 },
  orderSalesman: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400, marginTop: 2, marginLeft: 22 },

  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  orderStat: {},
  orderStatLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500 },
  orderTotal: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '800', color: COLORS.primary },

  emptyState: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray500, fontWeight: '500' },

  // FLOATING ACTION BUTTON (FAB)
  fab: {
    position: 'absolute', bottom: SPACING.xl, right: SPACING.xl,
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full, ...SHADOWS.colored(COLORS.primary),
  },
  fabIcon: { fontSize: 24, color: COLORS.white, fontWeight: '600', marginRight: SPACING.xs, marginTop: -2 },
  fabText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.white, fontWeight: '700' },
});
