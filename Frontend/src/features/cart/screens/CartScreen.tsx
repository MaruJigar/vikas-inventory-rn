import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Input, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { confirmAction, notify } from '@/lib/dialog';
import { getApiErrorMessage } from '@/lib/apiError';
import { useCartStore } from '@/store/useCartStore';
import { useVisitStore } from '@/store/useVisitStore';
import { useCreateOrder } from '@/features/orders/hooks';
import { useEndVisit } from '@/features/visit/hooks';
import {
  computeCartTotals,
  formatINR,
  toNum,
} from '@/features/products/pricing';
import type { CartLine } from '@/features/products/pricing';
import type { HomeScreenProps } from '@/navigation/types';

/** Order-level extras: standard + special discount percentages and an optional
 * transport mode. Writes straight to the cart store. */
function OrderExtras() {
  const { t } = useTranslation();
  const standard = useCartStore((s) => s.standardDiscountPercent);
  const special = useCartStore((s) => s.specialDiscountPercent);
  const transportMode = useCartStore((s) => s.transportMode);
  const setStandard = useCartStore((s) => s.setStandardDiscount);
  const setSpecial = useCartStore((s) => s.setSpecialDiscount);
  const setTransport = useCartStore((s) => s.setTransportMode);

  return (
    <Card style={styles.discountCard}>
      <Text style={styles.discountTitle}>{t('cart.orderDiscount')}</Text>
      <View style={styles.discountRow}>
        <View style={styles.discountField}>
          <Text style={styles.fieldLabel}>{t('cart.standardDiscount')}</Text>
          <Input
            value={standard ? String(standard) : ''}
            onChangeText={(v) => setStandard(Number(v) || 0)}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </View>
        <View style={styles.discountField}>
          <Text style={styles.fieldLabel}>{t('cart.specialDiscount')}</Text>
          <Input
            value={special ? String(special) : ''}
            onChangeText={(v) => setSpecial(Number(v) || 0)}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        </View>
      </View>
      <Text style={styles.fieldLabel}>{t('cart.transportMode')}</Text>
      <Input
        value={transportMode}
        onChangeText={setTransport}
        placeholder={t('cart.transportModePlaceholder')}
      />
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  negative,
  strong,
}: {
  label: string;
  value: string;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong && styles.strong]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          strong && styles.strong,
          negative && styles.negative,
        ]}
      >
        {negative ? `- ${value}` : value}
      </Text>
    </View>
  );
}

export function CartScreen({ navigation }: HomeScreenProps<'Cart'>) {
  const { t } = useTranslation();
  const items = useCartStore((s) => s.items);
  const standardDiscountPercent = useCartStore((s) => s.standardDiscountPercent);
  const specialDiscountPercent = useCartStore((s) => s.specialDiscountPercent);
  const transportMode = useCartStore((s) => s.transportMode);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const activeVisit = useVisitStore((s) => s.activeVisit);
  const setActiveVisit = useVisitStore((s) => s.setActiveVisit);
  const createOrder = useCreateOrder();
  const endVisit = useEndVisit();

  const lines = useMemo(() => Object.values(items), [items]);
  const totals = useMemo(
    () =>
      computeCartTotals(lines, {
        standardPercent: standardDiscountPercent,
        specialPercent: specialDiscountPercent,
      }),
    [lines, standardDiscountPercent, specialDiscountPercent],
  );

  const placeOrder = () => {
    if (!activeVisit) {
      notify(t('cart.needVisit'));
      return;
    }
    const trimmedTransport = transportMode.trim();
    createOrder.mutate(
      {
        visitId: activeVisit.visitId,
        shopId: activeVisit.shopId,
        products: lines.map((l) => ({
          productId: l.product.id,
          quantity: l.qty,
        })),
        ...(standardDiscountPercent > 0
          ? { standardDiscountPercent }
          : {}),
        ...(specialDiscountPercent > 0 ? { specialDiscountPercent } : {}),
        ...(trimmedTransport ? { transportMode: trimmedTransport } : {}),
      },
      {
        onSuccess: (order) => {
          // Close the visit (best-effort) and reset local order state.
          endVisit.mutate({ visitId: activeVisit.visitId });
          clear();
          setActiveVisit(null);
          navigation.replace('OrderSuccess', {
            orderNumber: order.order_number,
          });
        },
        onError: (e) =>
          notify(getApiErrorMessage(e, t) || t('cart.placeError')),
      },
    );
  };

  if (lines.length === 0) {
    return (
      <Screen edges={[]}>
        <View style={styles.emptyWrap}>
          <EmptyState
            title={t('cart.empty')}
            message={t('cart.emptyHint')}
            actionLabel={t('cart.browse')}
            onAction={() => navigation.navigate('Products')}
          />
        </View>
      </Screen>
    );
  }

  const renderLine = (line: CartLine) => {
    const { product, qty } = line;
    const unit = toNum(product.mrp);
    return (
      <Card key={product.id} style={styles.line}>
        <View style={styles.lineTop}>
          <Text style={styles.lineName} numberOfLines={2}>
            {product.name}
          </Text>
          <Pressable
            onPress={() => remove(product.id)}
            hitSlop={8}
            accessibilityLabel={t('cart.remove')}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
        <View style={styles.lineBottom}>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => decrement(product.id)}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable
              style={styles.stepBtn}
              onPress={() => increment(product.id)}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </Pressable>
          </View>
          <Text style={styles.lineTotal}>{formatINR(unit * qty)}</Text>
        </View>
      </Card>
    );
  };

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>{t('cart.title')}</Text>

      {lines.map(renderLine)}

      <OrderExtras />

      <Card style={styles.summary}>
        <SummaryRow label={t('cart.subtotal')} value={formatINR(totals.subtotal)} />
        {totals.standardDiscount > 0 ? (
          <SummaryRow
            label={t('cart.standardDiscount')}
            value={formatINR(totals.standardDiscount)}
            negative
          />
        ) : null}
        {totals.specialDiscount > 0 ? (
          <SummaryRow
            label={t('cart.specialDiscount')}
            value={formatINR(totals.specialDiscount)}
            negative
          />
        ) : null}
        <View style={styles.divider} />
        <SummaryRow
          label={t('cart.finalPayable')}
          value={formatINR(totals.finalPayable)}
          strong
        />
      </Card>

      <Text style={styles.previewNote}>{t('cart.previewNote')}</Text>

      {activeVisit ? (
        <Text style={styles.visitNote}>
          {t('cart.placingFor', { shop: activeVisit.shopName })}
        </Text>
      ) : null}

      <Button
        label={t('cart.placeOrder')}
        loading={createOrder.isPending}
        onPress={placeOrder}
        style={styles.placeOrder}
      />
      <Button
        label={t('cart.clear')}
        variant="secondary"
        onPress={() =>
          confirmAction({
            title: t('cart.clearConfirm'),
            confirmLabel: t('cart.clear'),
            cancelLabel: t('common.cancel'),
            destructive: true,
            onConfirm: clear,
          })
        }
        style={styles.clear}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  line: { marginBottom: spacing.md, gap: spacing.md },
  lineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  lineName: { ...typography.title, flex: 1 },
  lineBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { ...typography.title, minWidth: 20, textAlign: 'center' },
  lineTotal: { ...typography.title },
  discountCard: { marginTop: spacing.sm, gap: spacing.sm },
  discountTitle: { ...typography.title },
  discountRow: { flexDirection: 'row', gap: spacing.md },
  discountField: { flex: 1, gap: spacing.xs },
  fieldLabel: { ...typography.label, color: colors.textMuted },
  summary: { marginTop: spacing.sm, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.body },
  negative: { color: colors.success },
  strong: { ...typography.title, color: colors.text },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  previewNote: {
    ...typography.caption,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  visitNote: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  placeOrder: { marginTop: spacing.lg },
  clear: { marginTop: spacing.md },
});
