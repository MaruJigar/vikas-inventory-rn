import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Input, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { notify } from '@/lib/dialog';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  useOrder,
  useEditOrder,
  useStatusIndex,
} from '@/features/orders/hooks';
import { formatINR, isPreDispatch, toNum } from '@/features/orders/constants';
import type { OrdersScreenProps } from '@/navigation/types';

/** A line in the editor — seeded from an order item's snapshot fields. */
interface EditLine {
  productId: string;
  name: string;
  mrp: number;
  qty: number;
}

export function EditOrderScreen({
  route,
  navigation,
}: OrdersScreenProps<'EditOrder'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { all: statuses } = useStatusIndex();
  const editOrder = useEditOrder(id);

  // Seed the editable lines from the order's items once it has loaded.
  const [lines, setLines] = useState<Record<string, EditLine> | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (order && lines === null) {
      const seeded: Record<string, EditLine> = {};
      for (const it of order.items ?? []) {
        seeded[it.product_id] = {
          productId: it.product_id,
          name: it.product_name_snapshot,
          mrp: toNum(it.mrp),
          qty: toNum(it.quantity),
        };
      }
      setLines(seeded);
    }
  }, [order, lines]);

  if (isLoading || (order && lines === null)) return <Spinner />;
  if (isError || !order) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('orders.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  // Guard: only pre-dispatch orders are editable (mirrors the backend).
  if (!isPreDispatch(statuses, order.status_id)) {
    return (
      <Screen edges={[]}>
        <View style={styles.emptyWrap}>
          <EmptyState
            title={t('orders.edit.notEditable')}
            message={t('orders.edit.notEditableHint')}
            actionLabel={t('common.back')}
            onAction={() => navigation.goBack()}
          />
        </View>
      </Screen>
    );
  }

  const current = lines ?? {};
  const list = Object.values(current);
  const grossPreview = list.reduce((sum, l) => sum + l.mrp * l.qty, 0);

  const increment = (pid: string) =>
    setLines((s) => ({ ...s, [pid]: { ...s![pid], qty: s![pid].qty + 1 } }));
  const decrement = (pid: string) =>
    setLines((s) => {
      const line = s![pid];
      if (line.qty <= 1) return s;
      return { ...s, [pid]: { ...line, qty: line.qty - 1 } };
    });
  const removeLine = (pid: string) =>
    setLines((s) => {
      const next = { ...s };
      delete next[pid];
      return next;
    });

  const save = () => {
    const products = list
      .filter((l) => l.qty > 0)
      .map((l) => ({ productId: l.productId, quantity: l.qty }));
    if (products.length === 0) {
      notify(t('orders.edit.needItem'));
      return;
    }
    editOrder.mutate(
      { products, reason: reason.trim() || undefined },
      {
        onSuccess: () => navigation.goBack(),
        onError: (e) =>
          notify(getApiErrorMessage(e, t) || t('orders.edit.saveError')),
      },
    );
  };

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>
        {order.order_number}
      </Text>

      {list.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.muted}>{t('orders.edit.noItems')}</Text>
        </Card>
      ) : (
        list.map((l) => (
          <Card key={l.productId} style={styles.line}>
            <View style={styles.lineTop}>
              <Text style={styles.lineName} numberOfLines={2}>
                {l.name}
              </Text>
              <Pressable
                onPress={() => removeLine(l.productId)}
                hitSlop={8}
                accessibilityLabel={t('orders.edit.remove')}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
            <View style={styles.lineBottom}>
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => decrement(l.productId)}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={styles.qty}>{l.qty}</Text>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => increment(l.productId)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
              <Text style={styles.lineTotal}>{formatINR(l.mrp * l.qty)}</Text>
            </View>
          </Card>
        ))
      )}

      <Card style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('orders.detail.gross')}</Text>
          <Text style={styles.summaryValue}>{formatINR(grossPreview)}</Text>
        </View>
      </Card>
      <Text style={styles.previewNote}>{t('orders.edit.previewNote')}</Text>

      <Input
        label={t('orders.edit.reasonLabel')}
        value={reason}
        onChangeText={setReason}
        placeholder={t('orders.edit.reasonPlaceholder')}
        multiline
        maxLength={200}
        style={styles.reason}
      />

      <Button
        label={t('orders.edit.save')}
        loading={editOrder.isPending}
        onPress={save}
      />
      <Button
        label={t('common.back')}
        variant="secondary"
        onPress={() => navigation.goBack()}
        style={styles.cancel}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  emptyCard: { alignItems: 'center' },
  muted: { ...typography.caption, color: colors.textMuted },
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
  summary: { marginTop: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.title },
  previewNote: {
    ...typography.caption,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  reason: { marginTop: spacing.lg },
  cancel: { marginTop: spacing.md },
});
