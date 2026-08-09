import React, { useMemo, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Input, EmptyState, QuantityStepper } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveFirstMediaUrl } from '@/lib/media';
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

/** Cart-line thumbnail edge. */
const THUMB_SIZE = 56;

/** Width an amount claims before it wraps onto its own line (see CartScreen). */
const AMOUNT_MIN_WIDTH = 140;
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
  const transportMode = usePOCartStore((s) => s.transportMode);
  const setTransport = usePOCartStore((s) => s.setTransportMode);
  const setQty = usePOCartStore((s) => s.setQty);
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
  // The backend stores a new PO at plain gross — no discounts, no GST (see
  // CreatePurchaseOrderPayload) — so the preview is the bare subtotal.
  const totals = useMemo(() => computeCartTotals(lines), [lines]);

  const submit = () => {
    const trimmedTransport = transportMode.trim();
    createPO.mutate(
      {
        products: lines.map((l) => ({
          productId: l.product.id,
          quantity: l.qty,
        })),
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
    const thumb = resolveFirstMediaUrl(product.product_image_url);
    return (
      <View key={product.id} style={styles.line}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty]}>
            <Ionicons name="cube-outline" size={22} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.lineBody}>
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
            <QuantityStepper
              size="sm"
              qty={qty}
              onChange={(next) => setQty(product, next)}
            />
            <Text style={styles.lineTotal}>
              {formatINR(toNum(product.mrp) * qty)}
            </Text>
          </View>
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

      <Card style={styles.transportCard}>
        <Text style={styles.fieldLabel}>{t('cart.transportMode')}</Text>
        <Input
          value={transportMode}
          onChangeText={setTransport}
          placeholder={t('cart.transportModePlaceholder')}
        />
      </Card>

      <Card style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.strong}>
            {t('purchaseOrders.cart.orderValue')}
          </Text>
          <Text style={styles.strongValue}>{formatINR(totals.subtotal)}</Text>
        </View>
        <Text style={styles.pricingNote}>
          {t('purchaseOrders.cart.pricingNote')}
        </Text>
      </Card>

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
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  lineBody: { flex: 1, gap: spacing.sm },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  lineTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  lineName: { ...typography.body, flex: 1 },
  // Wraps so a long amount drops under the stepper rather than being clipped.
  lineBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lineTotal: {
    ...typography.title,
    flexGrow: 1,
    minWidth: AMOUNT_MIN_WIDTH,
    textAlign: 'right',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  muted: { ...typography.body, color: colors.textMuted },
  transportCard: { marginTop: spacing.sm, gap: spacing.xs },
  fieldLabel: { ...typography.label, color: colors.textMuted },
  summary: { marginTop: spacing.sm, gap: spacing.sm },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  strong: { ...typography.title, color: colors.text },
  // Wraps onto its own line rather than being clipped (see AMOUNT_MIN_WIDTH).
  strongValue: {
    ...typography.title,
    color: colors.text,
    flexGrow: 1,
    minWidth: AMOUNT_MIN_WIDTH,
    textAlign: 'right',
  },
  pricingNote: { ...typography.caption, color: colors.textMuted },
  submit: { marginTop: spacing.lg },
  clear: { marginTop: spacing.md },
});
