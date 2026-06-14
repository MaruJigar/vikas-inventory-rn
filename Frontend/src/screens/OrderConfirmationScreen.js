import React, { useContext, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Alert, Platform, StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const unitPrice = item.appliedPrice || item.price;
  const lineTotal = unitPrice * item.quantity;
  const hasDiscount = unitPrice < item.price;
  const discountPct = hasDiscount ? ((item.price - unitPrice) / item.price * 100).toFixed(1) : 0;

  return (
    <View style={styles.cartItem}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemSku}>{item.sku} · HSN {item.hsnCode}</Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemMetrics}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Rate</Text>
          <Text style={styles.metricValue}>₹{unitPrice}</Text>
          {hasDiscount && <Text style={styles.metricDiscount}>-{discountPct}%</Text>}
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Qty</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => onQuantityChange(item.id, item.quantity - 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => onQuantityChange(item.id, item.quantity + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.metricDivider} />
        <View style={[styles.metricCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.metricLabel}>Total</Text>
          <Text style={styles.metricTotal}>₹{lineTotal.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    </View>
  );
};

export const OrderConfirmationScreen = ({ navigation }) => {
  const { appState, removeFromCart, updateCartQuantity, submitOrder } = useContext(AppContext);

  const customer = appState.selectedCustomer;
  const isInterState = customer
    ? customer.stateCode !== appState.businessConfig?.stateCode
    : false;

  const orderSummary = useMemo(() => {
    const items = appState.cart.map(item => {
      const unitPrice = item.appliedPrice || item.price;
      const taxableValue = unitPrice * item.quantity;
      const gstRate = item.gstRate || 18;
      const taxAmount = taxableValue * (gstRate / 100);
      return { ...item, unitPrice, taxableValue, gstRate, taxAmount };
    });

    const subtotal = items.reduce((sum, i) => sum + i.taxableValue, 0);
    const totalTax = items.reduce((sum, i) => sum + i.taxAmount, 0);
    const grandTotal = subtotal + totalTax;
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

    return { items, subtotal, totalTax, grandTotal, totalQty, itemCount: items.length };
  }, [appState.cart]);

  const handleSubmit = () => {
    if (appState.cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart');
      return;
    }
    Alert.alert(
      'Confirm Order',
      `Customer: ${customer?.name}\nItems: ${orderSummary.itemCount}\nTotal: ₹${orderSummary.grandTotal.toLocaleString('en-IN')}\n\nSubmit this order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Order',
          onPress: () => {
            const order = submitOrder();
            Alert.alert(
              '✅ Order Submitted',
              `Order ID: ${order.id}\n\nAdmin has been notified.`,
              [{ text: 'View Orders', onPress: () => navigation.navigate('OrderHistory') }]
            );
          },
        },
      ]
    );
  };

  // Empty state
  if (appState.cart.length === 0 && !customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Review</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Cart is empty</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CustomerSelect')}>
            <Text style={styles.emptyBtnText}>Start New Order</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Card */}
        {customer && (
          <View style={styles.customerCard}>
            <View style={styles.customerRow}>
              <View style={styles.customerAvatar}><Text style={styles.avatarText}>🏢</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerDetail}>📍 {customer.city} · {customer.phone}</Text>
              </View>
            </View>
            <View style={styles.taxTypeBadge}>
              <Text style={styles.taxTypeText}>
                {isInterState ? '🔄 Inter-State (IGST)' : '🏠 Intra-State (CGST + SGST)'}
              </Text>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items ({orderSummary.itemCount})</Text>
            <Text style={styles.sectionMeta}>{orderSummary.totalQty} units</Text>
          </View>
          {appState.cart.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={removeFromCart}
              onQuantityChange={updateCartQuantity}
            />
          ))}
        </View>

        {/* GST Breakdown */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal (Taxable Value)</Text>
            <Text style={styles.summaryValue}>₹{orderSummary.subtotal.toLocaleString('en-IN')}</Text>
          </View>

          {isInterState ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IGST</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.totalTax.toLocaleString('en-IN')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST</Text>
                <Text style={styles.summaryValue}>₹{(orderSummary.totalTax / 2).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST</Text>
                <Text style={styles.summaryValue}>₹{(orderSummary.totalTax / 2).toLocaleString('en-IN')}</Text>
              </View>
            </>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{orderSummary.grandTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Location Notice */}
        <View style={styles.locationNotice}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            Your GPS location will be captured when you submit this order for verification.
          </Text>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.editBtnText}>← Edit Items</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>Submit Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backButton: { paddingHorizontal: SPACING.sm },
  backText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600' },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },

  content: { flex: 1, padding: SPACING.lg },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: SPACING.lg },
  emptyText: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '600', color: COLORS.gray600, marginBottom: SPACING.lg },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md },
  emptyBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600' },

  // Customer
  customerCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderLeftWidth: 4, borderLeftColor: COLORS.primary, ...SHADOWS.sm,
  },
  customerRow: { flexDirection: 'row', alignItems: 'center' },
  customerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { fontSize: 20 },
  customerName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  customerDetail: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500, marginTop: 2 },
  taxTypeBadge: {
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  taxTypeText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray600, fontWeight: '500' },

  // Section
  section: { marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.sm },
  sectionMeta: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500 },

  // Cart Item
  cartItem: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray900 },
  itemSku: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400, marginTop: 2 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.dangerLight, justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: COLORS.danger, fontSize: 12, fontWeight: '700' },

  itemMetrics: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt, borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
  },
  metricCol: { flex: 1 },
  metricDivider: { width: 1, height: 36, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  metricLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.3 },
  metricValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  metricDiscount: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.success, fontWeight: '600', marginTop: 1 },
  metricTotal: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '800', color: COLORS.primary },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  qtyBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  qtyValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900, minWidth: 20, textAlign: 'center' },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  summaryLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600 },
  summaryValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600', color: COLORS.gray900 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.md, paddingTop: SPACING.md,
    backgroundColor: COLORS.backgroundAlt, marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg,
    marginBottom: -SPACING.lg, paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg, borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  totalLabel: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  totalValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: COLORS.primary },

  // Location
  locationNotice: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.warningLight, borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
  },
  locationIcon: { fontSize: 18, marginRight: SPACING.sm },
  locationText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.warningDark, lineHeight: 20 },

  // Footer
  footer: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md, paddingBottom: SPACING.xl,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    flexDirection: 'row', gap: SPACING.md,
  },
  editBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.gray300,
    paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center',
  },
  editBtnText: { color: COLORS.gray600, fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600' },
  submitBtn: {
    flex: 1.5, backgroundColor: COLORS.success, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, alignItems: 'center', ...SHADOWS.colored(COLORS.success),
  },
  submitBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700' },
});
