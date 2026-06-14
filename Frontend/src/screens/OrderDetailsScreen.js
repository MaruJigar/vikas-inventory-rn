import React, { useContext, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, Platform, StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const STATUS_FLOW = ['pending', 'confirmed', 'dispatched', 'delivered'];
const statusConfig = {
  pending: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Pending', icon: 'clock' },
  confirmed: { color: COLORS.info, bg: COLORS.infoLight, label: 'Confirmed', icon: 'check-circle' },
  dispatched: { color: '#7C3AED', bg: '#EDE9FE', label: 'Dispatched', icon: 'truck' },
  delivered: { color: COLORS.success, bg: COLORS.successLight, label: 'Delivered', icon: 'check-square' },
  cancelled: { color: COLORS.danger, bg: COLORS.dangerLight, label: 'Cancelled', icon: 'x-circle' },
};

export const OrderDetailsScreen = ({ navigation, route }) => {
  const { appState, updateOrderStatus } = useContext(AppContext);
  const orderId = route?.params?.orderId;
  const isAdmin = appState.userRole === 'admin';

  const order = useMemo(() => appState.orders.find(o => o.id === orderId), [appState.orders, orderId]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={COLORS.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyState}>
          <Feather name="search" size={48} color={COLORS.gray300} style={{marginBottom: SPACING.md}} />
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

  const handleUpdateStatus = () => {
    if (!nextStatus) return;
    const nextLabel = statusConfig[nextStatus].label;
    Alert.alert(
      'Update Status',
      `Mark this order as "${nextLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: `Mark ${nextLabel}`, onPress: () => updateOrderStatus(order.id, nextStatus) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={COLORS.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order ID + Status */}
        <View style={styles.idCard}>
          <View>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderDate}>{order.date} · by {order.salesmanName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Feather name={status.icon} size={12} color={status.color} style={{marginRight: 4, marginTop: Platform.OS === 'web' ? 1 : 0}} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            {STATUS_FLOW.map((s, i) => {
              const sc = statusConfig[s];
              const isActive = i <= currentIndex;
              const isCurrent = s === order.status;
              return (
                <View key={s} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, isActive && { backgroundColor: sc.color }]}>
                      {isActive && <Text style={styles.timelineDotText}>✓</Text>}
                    </View>
                    {i < STATUS_FLOW.length - 1 && (
                      <View style={[styles.timelineLine, isActive && { backgroundColor: sc.color }]} />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineLabel, isCurrent && styles.timelineLabelActive]}>{sc.label}</Text>
                    {isCurrent && <Text style={styles.timelineCurrent}>Current</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Customer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.infoCard}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Feather name="briefcase" size={14} color={COLORS.gray500} style={{marginRight:8}} />
              <Text style={styles.customerName}>{order.customerName}</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, i) => {
            const unitPrice = item.appliedPrice || item.price;
            const lineTotal = unitPrice * item.quantity;
            const hasDiscount = item.discount && parseFloat(item.discount) > 0;
            return (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} × ₹{unitPrice}{hasDiscount ? ` (-${item.discount}%)` : ''}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>₹{lineTotal.toLocaleString('en-IN')}</Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{order.subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST</Text>
            <Text style={styles.summaryValue}>₹{order.taxAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{order.total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Admin Actions */}
        {isAdmin && (
          <View style={styles.adminActions}>
            {nextStatus && order.status !== 'cancelled' && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleUpdateStatus} activeOpacity={0.8}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <Text style={styles.actionBtnText}>Mark as {statusConfig[nextStatus].label}</Text>
                  <Feather name="chevron-right" size={16} color="#FFF" style={{marginLeft:4}} />
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.invoiceBtn}
              onPress={() => navigation.navigate('Invoice', { orderId: order.id })}
              activeOpacity={0.8}
            >
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Feather name="file-text" size={16} color={COLORS.primary} style={{marginRight:8}} />
                <Text style={styles.invoiceBtnText}>Generate Invoice</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
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
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, flex: 1, textAlign: 'center' },

  content: { flex: 1, padding: SPACING.lg },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.gray500, marginTop: SPACING.md },

  // ID Card
  idCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  orderId: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '800', color: COLORS.gray900 },
  orderDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  // Timeline
  timelineCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  timeline: {},
  timelineStep: { flexDirection: 'row', minHeight: 48 },
  timelineLeft: { width: 28, alignItems: 'center' },
  timelineDot: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.gray300,
    justifyContent: 'center', alignItems: 'center',
  },
  timelineDotText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.gray200, marginVertical: 2 },
  timelineRight: { flex: 1, marginLeft: SPACING.md, paddingBottom: SPACING.md },
  timelineLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', color: COLORS.gray500 },
  timelineLabelActive: { fontWeight: '700', color: COLORS.gray900 },
  timelineCurrent: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.primary, fontWeight: '600', marginTop: 2 },

  // Section
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
  infoCard: { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, ...SHADOWS.sm },
  customerName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray800 },

  // Items
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs, ...SHADOWS.sm,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600', color: COLORS.gray900 },
  itemMeta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  itemTotal: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.primary },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  summaryLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600 },
  summaryValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600', color: COLORS.gray900 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: SPACING.md, marginTop: SPACING.sm,
  },
  totalLabel: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  totalValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: COLORS.primary },

  // Admin Actions
  adminActions: { gap: SPACING.sm },
  actionBtn: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, alignItems: 'center', ...SHADOWS.colored(COLORS.primary),
  },
  actionBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700' },
  invoiceBtn: {
    backgroundColor: COLORS.white, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  invoiceBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600' },
});
