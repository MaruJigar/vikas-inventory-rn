import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { Screen, Card, Spinner, EmptyState, Section } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { notify } from '@/lib/dialog';
import { useOrder, useOrderStatusHistory, useInvoicePdfMutation } from '@/features/orders/hooks';
import {
  formatINR,
  statusColor,
  statusLabel,
  toNum,
} from '@/features/orders/constants';
import type { Order } from '@/types/order';
import type { OrdersScreenProps } from '@/navigation/types';

// Old text sharing removed in favor of PDF sharing

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
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { data: history } = useOrderStatusHistory(id);
  const invoicePdfMutation = useInvoicePdfMutation();

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
      notify('Generating PDF...');
      const response = await invoicePdfMutation.mutateAsync(id);
      const downloadUrl = response?.downloadUrl;
      const fileName = response?.fileName ?? `${order.order_number || id}.pdf`;

      if (!downloadUrl) {
        throw new Error('No download URL returned');
      }

      const fileUri = (FileSystem.documentDirectory || '') + fileName;
      const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        notify('Sharing is not available on this device');
      }
    } catch (e) {
      console.error(e);
      notify(t('orders.detail.shareError'));
    }
  };

  const items = order.items ?? [];
  const productDiscount = toNum(order.total_product_discount_amount);
  const billDiscount = toNum(order.bill_discount_amount);

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
          {invoicePdfMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="share-outline" size={24} color={colors.primary} />
          )}
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View
          style={[styles.badge, { backgroundColor: statusColor(order.status) }]}
        >
          <Text style={styles.badgeText}>{statusLabel(t, order.status)}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(order.created_at).toLocaleString()}
        </Text>
      </View>

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

      {order.status === 'CANCELLED' && order.cancellation_reason ? (
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
                    {statusLabel(t, h.new_status)}
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
