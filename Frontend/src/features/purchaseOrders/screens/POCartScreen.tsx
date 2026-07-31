import React, { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Input, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { confirmAction, notify } from '@/lib/dialog';
import { getApiErrorMessage } from '@/lib/apiError';
import { usePOCartStore } from '@/store/usePOCartStore';
import { useCreatePurchaseOrder } from '@/features/purchaseOrders/hooks';
import {
  computeCartTotals,
  formatINR,
  manufacturerName,
  toNum,
} from '@/features/products/pricing';
import type { CartLine } from '@/features/products/pricing';
import type { HomeScreenProps } from '@/navigation/types';

/** Lines grouped by manufacturer — mirrors how the backend splits the payload
 * into one order per manufacturer. */
interface Group {
  key: string;
  name: string;
  lines: CartLine[];
  gross: number;
}

function groupByManufacturer(lines: CartLine[], unknown: string): Group[] {
  const map = new Map<string, Group>();
  for (const line of lines) {
    const m = line.product.manufacturer;
    const name = manufacturerName(line.product) ?? unknown;
    const key = m?.id || name || 'self';
    const g = map.get(key) ?? { key, name, lines: [], gross: 0 };
    g.lines.push(line);
    g.gross += toNum(line.product.mrp) * line.qty;
    map.set(key, g);
  }
  return [...map.values()];
}

export function POCartScreen({
  navigation,
}: HomeScreenProps<'PurchaseOrderCart'>) {
  const { t } = useTranslation();
  const items = usePOCartStore((s) => s.items);
  const standardDiscountPercent = usePOCartStore((s) => s.standardDiscountPercent);
  const specialDiscountPercent = usePOCartStore((s) => s.specialDiscountPercent);
  const transportMode = usePOCartStore((s) => s.transportMode);
  const setStandard = usePOCartStore((s) => s.setStandardDiscount);
  const setSpecial = usePOCartStore((s) => s.setSpecialDiscount);
  const setTransport = usePOCartStore((s) => s.setTransportMode);
  const increment = usePOCartStore((s) => s.increment);
  const decrement = usePOCartStore((s) => s.decrement);
  const remove = usePOCartStore((s) => s.remove);
  const clear = usePOCartStore((s) => s.clear);

  const createPO = useCreatePurchaseOrder();
  // Stable per-mount key so a retried submit dedupes server-side.
  const idempotencyKey = useRef(
    `po-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  ).current;

  const lines = useMemo(() => Object.values(items), [items]);
  const groups = useMemo(
    () => groupByManufacturer(lines, t('purchaseOrders.unknownManufacturer')),
    [lines, t],
  );
  const totals = useMemo(
    () =>
      computeCartTotals(lines, {
        standardPercent: standardDiscountPercent,
        specialPercent: specialDiscountPercent,
      }),
    [lines, standardDiscountPercent, specialDiscountPercent],
  );

  const submit = () => {
    const trimmedTransport = transportMode.trim();
    createPO.mutate(
      {
        products: lines.map((l) => ({
          productId: l.product.id,
          quantity: l.qty,
        })),
        ...(standardDiscountPercent > 0 ? { standardDiscountPercent } : {}),
        ...(specialDiscountPercent > 0 ? { specialDiscountPercent } : {}),
        ...(trimmedTransport ? { transportMode: trimmedTransport } : {}),
        idempotencyKey,
      },
      {
        onSuccess: (orders) => {
          clear();
          navigation.replace('PurchaseOrderSuccess', {
            count: orders.length,
          });
        },
        onError: (e) =>
          notify(getApiErrorMessage(e, t) || t('purchaseOrders.submitError')),
      },
    );
  };

  if (lines.length === 0) {
    return (
      <Screen edges={[]}>
        <View style={styles.emptyWrap}>
          <EmptyState
            title={t('purchaseOrders.cart.empty')}
            message={t('purchaseOrders.cart.emptyHint')}
            actionLabel={t('purchaseOrders.cart.browse')}
            onAction={() => navigation.navigate('PurchaseOrderProducts')}
          />
        </View>
      </Screen>
    );
  }

  const renderLine = (line: CartLine) => {
    const { product, qty } = line;
    return (
      <View key={product.id} style={styles.line}>
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
            <Pressable style={styles.stepBtn} onPress={() => decrement(product.id)}>
              <Ionicons name="remove" size={16} color={colors.text} />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable style={styles.stepBtn} onPress={() => increment(product.id)}>
              <Ionicons name="add" size={16} color={colors.text} />
            </Pressable>
          </View>
          <Text style={styles.lineTotal}>
            {formatINR(toNum(product.mrp) * qty)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>
        {t('purchaseOrders.cart.title')}
      </Text>

      {groups.length > 1 ? (
        <Text style={styles.splitNote}>
          {t('purchaseOrders.cart.splitNote', { count: groups.length })}
        </Text>
      ) : null}

      {groups.map((g) => (
        <Card key={g.key} style={styles.group}>
          <View style={styles.groupHeader}>
            <Ionicons name="business-outline" size={16} color={colors.primary} />
            <Text style={styles.groupName} numberOfLines={1}>
              {g.name}
            </Text>
          </View>
          {g.lines.map(renderLine)}
          <View style={styles.groupFooter}>
            <Text style={styles.muted}>{t('purchaseOrders.cart.subtotal')}</Text>
            <Text style={styles.muted}>{formatINR(g.gross)}</Text>
          </View>
        </Card>
      ))}

      <Card style={styles.discountCard}>
        <Text style={styles.discountTitle}>{t('cart.orderDiscount')}</Text>
        <View style={styles.discountRow}>
          <View style={styles.discountField}>
            <Text style={styles.fieldLabel}>{t('cart.standardDiscount')}</Text>
            <Input
              value={standardDiscountPercent ? String(standardDiscountPercent) : ''}
              onChangeText={(v) => setStandard(Number(v) || 0)}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          </View>
          <View style={styles.discountField}>
            <Text style={styles.fieldLabel}>{t('cart.specialDiscount')}</Text>
            <Input
              value={specialDiscountPercent ? String(specialDiscountPercent) : ''}
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

      <Card style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
          <Text style={styles.summaryValue}>{formatINR(totals.subtotal)}</Text>
        </View>
        {totals.standardDiscount > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.standardDiscount')}</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              - {formatINR(totals.standardDiscount)}
            </Text>
          </View>
        ) : null}
        {totals.specialDiscount > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.specialDiscount')}</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              - {formatINR(totals.specialDiscount)}
            </Text>
          </View>
        ) : null}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.strong}>{t('cart.finalPayable')}</Text>
          <Text style={styles.strong}>{formatINR(totals.finalPayable)}</Text>
        </View>
      </Card>

      <Text style={styles.previewNote}>{t('purchaseOrders.cart.previewNote')}</Text>

      <Button
        label={t('purchaseOrders.cart.submit')}
        loading={createPO.isPending}
        onPress={() =>
          confirmAction({
            title: t('purchaseOrders.cart.confirmTitle'),
            message: t('purchaseOrders.cart.confirmMessage', {
              count: groups.length,
            }),
            confirmLabel: t('purchaseOrders.cart.submit'),
            cancelLabel: t('common.cancel'),
            onConfirm: submit,
          })
        }
        style={styles.submit}
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
  title: { marginTop: spacing.sm, marginBottom: spacing.sm },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  splitNote: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  group: { marginBottom: spacing.md, gap: spacing.md },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  groupName: { ...typography.title, flex: 1 },
  line: { gap: spacing.sm },
  lineTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  lineName: { ...typography.body, flex: 1 },
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
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  muted: { ...typography.body, color: colors.textMuted },
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
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  previewNote: { ...typography.caption, marginTop: spacing.md, textAlign: 'center' },
  submit: { marginTop: spacing.lg },
  clear: { marginTop: spacing.md },
});
