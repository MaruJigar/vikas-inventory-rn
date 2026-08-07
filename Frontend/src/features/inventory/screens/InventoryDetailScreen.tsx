import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { formatDateTime } from '@/lib/date';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { toNum } from '@/features/orders/constants';
import { useInventoryMovements } from '@/features/inventory/hooks';
import { AdjustStockForm } from '@/features/inventory/components/AdjustStockForm';
import {
  MOVEMENT_TYPES,
  formatDelta,
  movementColor,
  movementLabel,
} from '@/features/inventory/constants';
import type {
  InventoryItem,
  InventoryMovementRecord,
} from '@/types/inventory';
import type { AccountScreenProps } from '@/navigation/types';

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Qty({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.qty}>
      <Text style={styles.qtyValue}>{value}</Text>
      <Text style={styles.qtyLabel}>{label}</Text>
    </View>
  );
}

/**
 * One inventory row: current quantities, a manual adjustment, and the movement
 * ledger behind it.
 *
 * The backend has no `GET /inventory/:id`, so the row travels here from the list
 * as a nav param. An adjustment returns the updated row, which is held locally
 * so the numbers on screen stay correct without a refetch the API can't serve.
 */
export function InventoryDetailScreen({
  route,
}: AccountScreenProps<'InventoryDetail'>) {
  const { t } = useTranslation();
  const [item, setItem] = useState<InventoryItem>(route.params.item);
  const [adjusting, setAdjusting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInventoryMovements(item.id, typeFilter);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const movements = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const available = toNum(item.available_quantity);
  const productName = item.product?.name ?? t('inventory.unknownProduct');

  const renderItem = ({ item: m }: { item: InventoryMovementRecord }) => {
    const delta = toNum(m.quantity_change);
    return (
      <Card style={styles.movement}>
        <View style={styles.movementTop}>
          <Text style={styles.movementType} numberOfLines={1}>
            {movementLabel(t, m.movement_type)}
          </Text>
          <Text style={[styles.delta, { color: movementColor(delta) }]}>
            {formatDelta(delta)}
          </Text>
        </View>
        <Text style={styles.movementMeta}>
          {t('inventory.detail.balanceAfter', {
            value: toNum(m.new_available_quantity),
          })}
          {' · '}
          {formatDateTime(m.created_at)}
        </Text>
        {m.reason ? <Text style={styles.reason}>{m.reason}</Text> : null}
      </Card>
    );
  };

  return (
    <Screen scroll={false} edges={[]}>
      <FlatList
        data={movements}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={() => void onRefresh()}
        refreshing={refreshing}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={typography.h2} numberOfLines={3}>
              {productName}
            </Text>
            {item.product?.sku ? (
              <Text style={styles.sku}>{item.product.sku}</Text>
            ) : null}

            <Card style={styles.qtyCard}>
              <View style={styles.qtyRow}>
                <Qty label={t('inventory.available')} value={available} />
                <Qty
                  label={t('inventory.reserved')}
                  value={toNum(item.reserved_quantity)}
                />
                <Qty
                  label={t('inventory.backordered')}
                  value={toNum(item.backordered_quantity)}
                />
              </View>
              <Text style={styles.updated}>
                {t('inventory.detail.updated', {
                  when: formatDateTime(item.updated_at),
                })}
              </Text>
            </Card>

            {adjusting ? (
              <Card style={styles.adjustCard}>
                <AdjustStockForm
                  productId={item.product_id}
                  currentQty={available}
                  onSuccess={(updated) => {
                    setItem((prev) => ({
                      ...updated,
                      // The adjust response doesn't join the product back in.
                      product: updated.product ?? prev.product,
                    }));
                    setAdjusting(false);
                    void refetch();
                  }}
                  onCancel={() => setAdjusting(false)}
                />
              </Card>
            ) : (
              <Button
                label={t('inventory.adjust.action')}
                icon="cube-outline"
                onPress={() => setAdjusting(true)}
              />
            )}

            <Text style={styles.sectionTitle}>
              {t('inventory.detail.movements')}
            </Text>

            <View style={styles.chips}>
              <Chip
                label={t('inventory.filterAll')}
                active={typeFilter === null}
                onPress={() => setTypeFilter(null)}
              />
              {MOVEMENT_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={movementLabel(t, type)}
                  active={typeFilter === type}
                  onPress={() => setTypeFilter(type)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : isError ? (
            <EmptyState
              title={t('inventory.detail.movementsError')}
              actionLabel={t('common.retry')}
              onAction={() => void refetch()}
            />
          ) : (
            <EmptyState
              title={
                typeFilter
                  ? t('inventory.detail.noMovementsFiltered')
                  : t('inventory.detail.noMovements')
              }
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.sm, marginBottom: spacing.md },
  sku: { ...typography.caption },
  qtyCard: { gap: spacing.sm, marginTop: spacing.xs },
  qtyRow: { flexDirection: 'row' },
  qty: { flex: 1, gap: 2 },
  qtyValue: { ...typography.h2 },
  qtyLabel: { ...typography.caption },
  updated: {
    ...typography.caption,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  adjustCard: { marginTop: spacing.xs },

  sectionTitle: { ...typography.title, marginTop: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },

  movement: { marginBottom: spacing.sm, gap: spacing.xs },
  movementTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  movementType: { ...typography.title, flex: 1 },
  delta: { ...typography.title },
  movementMeta: { ...typography.caption },
  reason: { ...typography.body, color: colors.textMuted },

  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
