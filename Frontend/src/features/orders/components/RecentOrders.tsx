import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useRecentOrders, useStatusIndex } from '@/features/orders/hooks';
import { useManufacturerNames } from '@/features/manufacturers/hooks';
import { formatINR, statusColor, statusLabel, toNum } from '@/features/orders/constants';

export function RecentOrders({
  onOpenOrder,
}: {
  onOpenOrder: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { index: statusIndex } = useStatusIndex();
  const mfrNames = useManufacturerNames();
  const { data, isLoading, isError } = useRecentOrders(5);
  const orders = data ?? [];

  if (isLoading) {
    return (
      <Card style={styles.stateCard}>
        <ActivityIndicator color={colors.primary} />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card style={styles.stateCard}>
        <Text style={styles.muted}>{t('orders.loadError')}</Text>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card style={styles.stateCard}>
        <Text style={styles.muted}>{t('orders.empty')}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.listCard}>
      {orders.map((order, idx) => (
        <Pressable
          key={order.id}
          onPress={() => onOpenOrder(order.id)}
          style={[styles.row, idx > 0 && styles.rowDivider]}
        >
          <View style={styles.rowLeft}>
            <Text style={typography.body} numberOfLines={1}>
              {order.order_number}
            </Text>
            {!order.salesman_id ? (
              <View style={styles.poTag}>
                <Ionicons
                  name="business-outline"
                  size={12}
                  color={colors.primary}
                />
                <Text style={styles.poTagText} numberOfLines={1}>
                  {order.manufacturer_id && mfrNames.get(order.manufacturer_id)
                    ? t('orders.toManufacturerNamed', {
                        name: mfrNames.get(order.manufacturer_id),
                      })
                    : t('orders.toManufacturer')}
                </Text>
              </View>
            ) : order.shop ? (
              <Text style={styles.muted} numberOfLines={1}>
                {order.shop.name}
              </Text>
            ) : null}
          </View>
          <View style={styles.rowRight}>
            <Text style={typography.body}>
              {formatINR(toNum(order.final_order_amount))}
            </Text>
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
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  stateCard: { alignItems: 'center' },
  listCard: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  rowLeft: { flex: 1, gap: 2 },
  rowRight: { alignItems: 'flex-end', gap: spacing.xs },
  muted: { ...typography.caption, color: colors.textMuted },
  poTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  poTagText: { ...typography.caption, color: colors.primary, flexShrink: 1 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
});
