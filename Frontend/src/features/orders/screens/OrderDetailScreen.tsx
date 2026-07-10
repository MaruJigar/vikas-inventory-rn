import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { Screen, Card, Spinner, EmptyState, Section, Button, Input } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { confirmAction, notify } from '@/lib/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useOrder,
  useOrderStatusHistory,
  useStatusIndex,
  useUpdateOrderStatus,
  useCancelOrder,
} from '@/features/orders/hooks';
import {
  advanceActionLabel,
  formatINR,
  nextStatus,
  statusColor,
  statusLabel,
  toNum,
  type StatusMeta,
} from '@/features/orders/constants';
import type { Order } from '@/types/order';
import type { OrdersScreenProps } from '@/navigation/types';

function buildShareText(
  order: Order,
  t: TFunction,
  statusIndex: Map<string, StatusMeta>,
): string {
  const lines = [
    `${t('orders.detail.order')} ${order.order_number}`,
    `${t('orders.detail.status')}: ${statusLabel(t, statusIndex, order.status_id)}`,
    order.shop ? `${t('orders.detail.shop')}: ${order.shop.name}` : '',
    new Date(order.created_at).toLocaleString(),
    '',
    ...(order.items ?? []).map(
      (it) =>
        `${it.product_name_snapshot} x ${toNum(it.quantity)}  ${formatINR(
          toNum(it.net_line_amount),
        )}`,
    ),
    '',
    `${t('orders.detail.total')}: ${formatINR(toNum(order.final_order_amount))}`,
  ];
  return lines.filter((l) => l !== '').join('\n');
}

function Row({
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
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strong]}>{label}</Text>
      <Text
        style={[styles.rowValue, strong && styles.strong, negative && styles.neg]}
      >
        {negative ? `- ${value}` : value}
      </Text>
    </View>
  );
}

export function OrderDetailScreen({
  route,
}: OrdersScreenProps<'OrderDetail'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const { index: statusIndex, all: statuses } = useStatusIndex();
  const role = useAuthStore((s) => s.user?.role);
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { data: history } = useOrderStatusHistory(id);
  const advance = useUpdateOrderStatus(id);
  const cancelOrder = useCancelOrder(id);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');

  if (isLoading) return <Spinner />;
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

  const onShare = async () => {
    try {
      await Share.share({ message: buildShareText(order, t, statusIndex) });
    } catch {
      notify(t('orders.detail.shareError'));
    }
  };

  const items = order.items ?? [];
  const productDiscount = toNum(order.total_product_discount_amount);
  const billDiscount = toNum(order.bill_discount_amount);
  const isCancelled = order.status_id
    ? (statusIndex.get(order.status_id)?.isCancel ?? false)
    : false;

  // Lifecycle actions. An order that still has a forward status is in-flight →
  // the distributor can advance it and (per backend) either party can cancel;
  // terminal orders (delivered / cancelled) show no actions.
  const next = nextStatus(statuses, order.status_id);
  const isDistributor = role === 'DISTRIBUTOR_ADMIN' || role === 'SUPER_ADMIN';
  const inFlight = !isCancelled && !!next;
  const showAdvance = isDistributor && inFlight;
  const showCancel = inFlight && (isDistributor || role === 'SALESMAN');

  const onAdvance = () => {
    if (!next) return;
    const targetLabel = t(`orders.status.${next.name}`, {
      defaultValue: next.name,
    });
    confirmAction({
      title: t('orders.actions.confirmTitle'),
      message: t('orders.actions.confirmMessage', { status: targetLabel }),
      confirmLabel: t('common.continue'),
      cancelLabel: t('common.cancel'),
      onConfirm: () =>
        advance.mutate(
          { status_id: next.id },
          { onError: () => notify(t('orders.actions.updateError')) },
        ),
    });
  };

  const onSubmitCancel = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    cancelOrder.mutate(
      { cancellationReason: trimmed },
      {
        onSuccess: () => {
          setCancelling(false);
          setReason('');
        },
        onError: () => notify(t('orders.actions.cancelError')),
      },
    );
  };

  return (
    <Screen edges={[]}>
      <View style={styles.header}>
        <Text style={[typography.h1, styles.orderNumber]} numberOfLines={1}>
          {order.order_number}
        </Text>
        <Pressable
          onPress={onShare}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('orders.detail.share')}
        >
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColor(statusIndex, order.status_id) },
          ]}
        >
          <Text style={styles.badgeText}>
            {statusLabel(t, statusIndex, order.status_id)}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(order.created_at).toLocaleString()}
        </Text>
      </View>

      {showAdvance || showCancel ? (
        <View style={styles.actions}>
          {showAdvance && next ? (
            <Button
              label={advanceActionLabel(t, next.name)}
              icon="arrow-forward"
              loading={advance.isPending}
              onPress={onAdvance}
            />
          ) : null}

          {showCancel && !cancelling ? (
            <Button
              label={t('orders.actions.cancel')}
              variant="secondary"
              onPress={() => setCancelling(true)}
            />
          ) : null}

          {showCancel && cancelling ? (
            <Card style={styles.cancelBox}>
              <Text style={styles.cancelBoxLabel}>
                {t('orders.actions.cancelReasonLabel')}
              </Text>
              <Input
                value={reason}
                onChangeText={setReason}
                placeholder={t('orders.actions.cancelReasonPlaceholder')}
                multiline
                maxLength={200}
                autoFocus
              />
              <View style={styles.cancelRow}>
                <Button
                  label={t('common.back')}
                  variant="secondary"
                  style={styles.flex1}
                  onPress={() => {
                    setCancelling(false);
                    setReason('');
                  }}
                />
                <Button
                  label={t('orders.actions.confirmCancel')}
                  variant="danger"
                  style={styles.flex1}
                  loading={cancelOrder.isPending}
                  disabled={!reason.trim()}
                  onPress={onSubmitCancel}
                />
              </View>
            </Card>
          ) : null}
        </View>
      ) : null}

      {order.shop ? (
        <Card style={styles.shopCard}>
          <Text style={typography.title}>{order.shop.name}</Text>
          <Text style={styles.muted}>{order.shop.phone}</Text>
          <Text style={styles.muted}>{order.shop.address}</Text>
        </Card>
      ) : null}

      <Section title={t('orders.detail.items')}>
        <Card style={styles.itemsCard}>
          {items.map((it, idx) => (
            <View
              key={it.id}
              style={[styles.item, idx > 0 && styles.itemDivider]}
            >
              <View style={styles.itemInfo}>
                <Text style={typography.body} numberOfLines={2}>
                  {it.product_name_snapshot}
                </Text>
                <Text style={styles.muted}>
                  {toNum(it.quantity)} × {formatINR(toNum(it.mrp))}
                </Text>
              </View>
              <Text style={typography.body}>
                {formatINR(toNum(it.net_line_amount))}
              </Text>
            </View>
          ))}
          {items.length === 0 ? (
            <Text style={styles.muted}>{t('orders.detail.noItems')}</Text>
          ) : null}
        </Card>
      </Section>

      <Card style={styles.summary}>
        <Row
          label={t('orders.detail.gross')}
          value={formatINR(toNum(order.gross_order_amount))}
        />
        {productDiscount > 0 ? (
          <Row
            label={t('orders.detail.productDiscount')}
            value={formatINR(productDiscount)}
            negative
          />
        ) : null}
        {billDiscount > 0 ? (
          <Row
            label={t('orders.detail.billDiscount')}
            value={formatINR(billDiscount)}
            negative
          />
        ) : null}
        <View style={styles.divider} />
        <Row
          label={t('orders.detail.total')}
          value={formatINR(toNum(order.final_order_amount))}
          strong
        />
      </Card>

      {isCancelled && order.cancellation_reason ? (
        <Card style={styles.cancelCard}>
          <Text style={styles.cancelLabel}>
            {t('orders.detail.cancellationReason')}
          </Text>
          <Text style={typography.body}>{order.cancellation_reason}</Text>
        </Card>
      ) : null}

      {history && history.length > 0 ? (
        <Section title={t('orders.detail.timeline')}>
          <Card style={styles.timeline}>
            {history.map((h) => (
              <View key={h.id} style={styles.timelineRow}>
                <View style={styles.dot} />
                <View style={styles.timelineInfo}>
                  <Text style={typography.body}>
                    {statusLabel(t, statusIndex, h.new_status_id)}
                  </Text>
                  <Text style={styles.muted}>
                    {new Date(h.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  orderNumber: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  date: { ...typography.caption },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  cancelBox: { gap: spacing.sm },
  cancelBoxLabel: { ...typography.label, color: colors.danger },
  cancelRow: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  shopCard: { marginTop: spacing.lg, gap: spacing.xs },
  muted: { ...typography.caption, color: colors.textMuted },
  itemsCard: { gap: spacing.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  itemInfo: { flex: 1, gap: 2 },
  summary: { marginTop: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.body },
  neg: { color: colors.success },
  strong: { ...typography.title, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  cancelCard: { marginTop: spacing.lg, gap: spacing.xs },
  cancelLabel: { ...typography.label, color: colors.danger },
  timeline: { gap: spacing.md },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: 5,
  },
  timelineInfo: { flex: 1, gap: 2 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
});
