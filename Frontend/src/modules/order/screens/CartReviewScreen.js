import React from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../store/useCartStore';
import { useOrderMutations } from '../hooks/useOrderMutations';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../styles/colors';

import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';

export const CartReviewScreen = () => {
  const navigation = useNavigation();
  const { items, visitId, shopId, getTotals, clearCart, idempotencyKey } = useCartStore();
  const { createOrderMutation } = useOrderMutations();
  const totals = getTotals();

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before placing an order.');
      return;
    }
    if (!visitId || !shopId) {
      Alert.alert('Session Error', 'Missing visit or shop context.');
      return;
    }

    const payload = {
      visitId,
      shopId,
      products: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        itemDiscountType: i.itemDiscountType,
        itemDiscountValue: i.itemDiscountValue
      })),
      billDiscountType: totals.billDiscountType,
      billDiscountValue: totals.billDiscountValue,
      isOfflineCreated: false,
      idempotencyKey
    };

    createOrderMutation.mutate(payload, {
      onSuccess: (data) => {
        clearCart();
        // data contains { savedOrder, createdBackorders } per backend order.service.ts response
        const orderId = data.savedOrder ? data.savedOrder.id : data.id;
        navigation.replace('OrderDetailsScreen', { orderId });
      }
    });
  };

  const renderItem = ({ item }) => (
    <AppCard style={styles.itemCard} variant="elevated">
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{Number(item.mrp).toFixed(2)} x {item.quantity}</Text>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>₹{item.netLineAmount.toFixed(2)}</Text>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Review Order" onBack={() => navigation.goBack()} />

      <FlatList
        data={totals.processedItems}
        keyExtractor={item => item.productId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gross Amount</Text>
          <Text style={styles.summaryValue}>₹{totals.grossOrderAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Item Discounts</Text>
          <Text style={styles.summaryValueDiscount}>-₹{totals.totalProductDiscountAmount.toFixed(2)}</Text>
        </View>
        {totals.billDiscountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bill Discount</Text>
            <Text style={styles.summaryValueDiscount}>-₹{totals.billDiscountAmount.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.finalRow]}>
          <Text style={styles.finalLabel}>Final Amount</Text>
          <Text style={styles.finalValue}>₹{totals.finalOrderAmount.toFixed(2)}</Text>
        </View>

        <AppButton 
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={createOrderMutation.isPending}
          disabled={createOrderMutation.isPending || items.length === 0}
          size="lg"
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContainer: { padding: SPACING.lg, paddingBottom: SPACING['3xl'] },
  itemCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray900 },
  itemPrice: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500, marginTop: 4 },
  itemTotalText: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  summaryCard: {
    backgroundColor: COLORS.white, padding: SPACING.xl,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  summaryLabel: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray600 },
  summaryValue: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray900, fontWeight: '600' },
  summaryValueDiscount: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.success, fontWeight: '600' },
  finalRow: { borderTopWidth: 1, borderTopColor: COLORS.gray200, paddingTop: SPACING.md, marginTop: SPACING.xs },
  finalLabel: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.gray900, fontWeight: '800' },
  finalValue: { fontSize: TYPOGRAPHY.sizes.xl, color: COLORS.primary, fontWeight: '800' },
});
