import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
// v19 moved to a File/Paths API; downloadAsync + documentDirectory live here now.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { Screen, Card, Spinner, EmptyState, Section, Button, Input } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { confirmAction, notify } from '@/lib/dialog';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/date';
import { resolveFirstMediaUrl } from '@/lib/media';
import { useManufacturerNames } from '@/features/manufacturers/hooks';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useOrder,
  useOrderStatusHistory,
  useOrderRevisions,
  useOrderFulfillmentLogs,
  useStatusIndex,
  useUpdateOrderStatus,
  useCancelOrder,
  useInvoicePdfMutation,
} from '@/features/orders/hooks';
import {
  advanceActionLabel,
  formatINR,
  formatPercent,
  isPreDispatch,
  nextStatus,
  orderDiscountRows,
  statusColor,
  statusLabel,
  statusNameLabel,
  toNum,
  type StatusMeta,
} from '@/features/orders/constants';
import type { Order } from '@/types/order';
import type { OrdersScreenProps } from '@/navigation/types';

/**
 * Line-item thumbnail. `GET /orders/:id` joins `items.product`, so the live
 * product image is available here — the name/price on the row are snapshots,
 * but there is no image snapshot to fall back on.
 */
function ItemThumb({ url }: { url?: string | null }) {
  const thumb = resolveFirstMediaUrl(url);
  if (thumb) return <Image source={{ uri: thumb }} style={styles.itemThumb} />;
  return (
    <View style={[styles.itemThumb, styles.itemThumbEmpty]}>
      <Ionicons name="cube-outline" size={18} color={colors.textMuted} />
    </View>
  );
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
  navigation,
}: OrdersScreenProps<'OrderDetail'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const {
    index: statusIndex,
    all: statuses,
    notConfigured: statusesNotConfigured,
  } = useStatusIndex();
  const role = useAuthStore((s) => s.user?.role);
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { data: history } = useOrderStatusHistory(id);
  const { data: revisions } = useOrderRevisions(id);
  const { data: fulfillment } = useOrderFulfillmentLogs(id);
  const advance = useUpdateOrderStatus(id);
  const cancelOrder = useCancelOrder(id);
  const mfrNames = useManufacturerNames();
  const invoicePdfMutation = useInvoicePdfMutation();
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
    if (invoicePdfMutation.isPending) return;
    try {
      const { downloadUrl, fileName } = await invoicePdfMutation.mutateAsync(id);
      if (!downloadUrl) throw new Error('No download URL returned');

      const target = `${FileSystem.documentDirectory}${fileName || `${order.order_number}.pdf`}`;
      const { uri } = await FileSystem.downloadAsync(downloadUrl, target);

      if (!(await Sharing.isAvailableAsync())) {
        notify(t('orders.detail.shareUnavailable'));
        return;
      }
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch {
      notify(t('orders.detail.shareError'));
    }
  };

  const items = order.items ?? [];
  const discountRows = orderDiscountRows(order);
  const gstAmount = toNum(order.total_gst_amount);
  const isCancelled = order.status_id
    ? (statusIndex.get(order.status_id)?.isCancel ?? false)
    : false;

  // Lifecycle actions. An order that still has a forward status is in-flight →
  // the distributor can advance it and (per backend) either party can cancel;
  // terminal orders (delivered / cancelled) show no actions.
  const next = nextStatus(statuses, order.status_id);
  const isDistributor = role === 'DISTRIBUTOR_ADMIN' || role === 'SUPER_ADMIN';
  const inFlight = !isCancelled && !!next;
  // Backend rule: the order's creator cannot drive its status. A distributor is
  // the creator of a distributor→manufacturer order (no salesman) → they can't
  // advance it (the manufacturer does). Salesmen never get the advance action.
  const isCreatorDistributor =
    role === 'DISTRIBUTOR_ADMIN' && !order.salesman_id;
  // A distributor→manufacturer purchase order has no salesman. The distributor
  // is the buyer here — it's the manufacturer who acts on it.
  const isPurchaseOrder = !order.salesman_id;
  const mfrName = order.manufacturer_id
    ? mfrNames.get(order.manufacturer_id)
    : undefined;
  const showAdvance = isDistributor && inFlight && !isCreatorDistributor;
  const showCancel = inFlight && (isDistributor || role === 'SALESMAN');
  // Salesman may edit an order's items while it's still pre-dispatch.
  const showEdit = role === 'SALESMAN' && isPreDispatch(statuses, order.status_id);

  const onAdvance = () => {
    if (!next) return;
    const targetLabel = statusNameLabel(t, next.name);
    confirmAction({
      title: t('orders.actions.confirmTitle'),
      message: t('orders.actions.confirmMessage', { status: targetLabel }),
      confirmLabel: t('common.continue'),
      cancelLabel: t('common.cancel'),
      onConfirm: () =>
        advance.mutate(
          { status_id: next.id },
          {
            // Surface the backend's specific reason (e.g. "Insufficient
            // inventory for X. Required N, Available M.") instead of a generic one.
            onError: (e) =>
              notify(getApiErrorMessage(e, t) || t('orders.actions.updateError')),
          },
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
        onError: (e) =>
          notify(getApiErrorMessage(e, t) || t('orders.actions.cancelError')),
      },
    );
  };

  const hasActions = showAdvance || showEdit || showCancel;
  const showActionRow = showEdit || showCancel;

  // Order management lives in a pinned bottom bar. Hidden while entering a
  // cancellation reason (that flow renders inline so the keyboard doesn't cover
  // it), and absent entirely for terminal orders / when statuses aren't set up.
  const actionBar =
    hasActions && !cancelling ? (
      <View style={styles.actionBar}>
        {showAdvance && next ? (
          <Button
            label={advanceActionLabel(t, next.name)}
            icon="arrow-forward"
            loading={advance.isPending}
            onPress={onAdvance}
          />
        ) : null}
        {showActionRow ? (
          <View style={styles.actionBarRow}>
            {showEdit ? (
              <Button
                label={t('orders.edit.editOrder')}
                variant="secondary"
                icon="create-outline"
                style={styles.flex1}
                onPress={() => navigation.navigate('EditOrder', { id })}
              />
            ) : null}
            {showCancel ? (
              <Button
                label={t('orders.actions.cancel')}
                variant="secondary"
                style={styles.flex1}
                onPress={() => setCancelling(true)}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    ) : null;

  return (
    <Screen edges={['bottom']} floatingAction={actionBar}>
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
          {invoicePdfMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="share-outline" size={24} color={colors.primary} />
          )}
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
          {formatDateTime(order.created_at)}
        </Text>
      </View>

      <View style={styles.typeRow}>
        <Ionicons
          name={isPurchaseOrder ? 'business-outline' : 'storefront-outline'}
          size={14}
          color={colors.textMuted}
        />
        <Text style={styles.typeText}>
          {isPurchaseOrder
            ? mfrName
              ? t('orders.toManufacturerNamed', { name: mfrName })
              : t('orders.purchaseOrder')
            : t('orders.salesOrder')}
        </Text>
      </View>

      {/* A distributor's own purchase order is waiting on the manufacturer —
          make that explicit since the distributor can't advance it. */}
      {isPurchaseOrder && isDistributor && inFlight ? (
        <Card style={styles.noticeCard}>
          <Ionicons name="time-outline" size={18} color={colors.warning} />
          <Text style={styles.noticeText}>
            {t('orders.awaitingManufacturer')}
          </Text>
        </Card>
      ) : null}

      {statusesNotConfigured ? (
        <Card style={styles.noticeCard}>
          <Ionicons name="warning-outline" size={18} color={colors.warning} />
          <Text style={styles.noticeText}>
            {t('orders.statusesNotConfigured')}
          </Text>
        </Card>
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
              <ItemThumb url={it.product?.product_image_url} />
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
        {/* Cascading — each percentage applies to what the line above left. */}
        {discountRows.map((d) => (
          <Row
            key={d.key}
            label={`${t(`orders.detail.${d.key}`)} (${formatPercent(d.percent)})`}
            value={formatINR(d.amount)}
            negative
          />
        ))}
        {gstAmount > 0 ? (
          <Row label={t('orders.detail.gst')} value={formatINR(gstAmount)} />
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
                    {formatDateTime(h.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}

      {fulfillment && fulfillment.length > 0 ? (
        <Section title={t('orders.detail.fulfillment')}>
          <Card style={styles.timeline}>
            {fulfillment.map((f) => (
              <View key={f.id} style={styles.logRow}>
                <View style={styles.logInfo}>
                  <Text style={typography.body}>
                    {t(`orders.fulfillmentAction.${f.action}`, {
                      defaultValue: f.action,
                    })}
                    {f.quantity != null ? ` · ${toNum(f.quantity)}` : ''}
                  </Text>
                  {f.notes ? (
                    <Text style={styles.muted}>{f.notes}</Text>
                  ) : null}
                  <Text style={styles.muted}>
                    {[f.performed_by_user?.full_name, formatDateTime(f.created_at)]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}

      {revisions && revisions.length > 0 ? (
        <Section title={t('orders.detail.revisions')}>
          <Card style={styles.timeline}>
            {revisions.map((r) => (
              <View key={r.id} style={styles.logRow}>
                <View style={styles.logInfo}>
                  <Text style={typography.body}>
                    {t('orders.detail.revisionN', { n: r.revision_number })}
                  </Text>
                  {r.reason ? (
                    <Text style={styles.muted}>{r.reason}</Text>
                  ) : null}
                  <Text style={styles.muted}>
                    {[r.changed_by_user?.full_name, formatDateTime(r.created_at)]
                      .filter(Boolean)
                      .join(' · ')}
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  typeText: { ...typography.caption, color: colors.textMuted },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  noticeText: { ...typography.caption, color: colors.textMuted, flex: 1 },
  actionBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  actionBarRow: { flexDirection: 'row', gap: spacing.sm },
  cancelBox: { gap: spacing.sm, marginTop: spacing.md },
  cancelBoxLabel: { ...typography.label, color: colors.danger },
  cancelRow: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  shopCard: { marginTop: spacing.lg, gap: spacing.xs },
  muted: { ...typography.caption, color: colors.textMuted },
  itemsCard: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  itemThumbEmpty: { alignItems: 'center', justifyContent: 'center' },
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
  logRow: { flexDirection: 'row', alignItems: 'flex-start' },
  logInfo: { flex: 1, gap: 2 },
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
