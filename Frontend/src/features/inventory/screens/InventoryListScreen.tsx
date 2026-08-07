import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Input, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { toNum } from '@/features/orders/constants';
import { useInventory } from '@/features/inventory/hooks';
import type { InventorySortBy } from '@/features/inventory/api';
import {
  matchesInventorySearch,
  stockTone,
  stockToneColor,
} from '@/features/inventory/constants';
import type { InventoryItem } from '@/types/inventory';
import type { AccountScreenProps } from '@/navigation/types';

/** The two sorts worth exposing, given the backend's whitelist. */
type SortKey = 'recent' | 'lowest';

const SORTS: Record<SortKey, { sortBy: InventorySortBy; sortOrder: 'ASC' | 'DESC' }> = {
  recent: { sortBy: 'updated_at', sortOrder: 'DESC' },
  lowest: { sortBy: 'available_quantity', sortOrder: 'ASC' },
};

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

/** One quantity in the row's stats strip. */
function Qty({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.qty}>
      <Text style={styles.qtyValue}>{value}</Text>
      <Text style={styles.qtyLabel}>{label}</Text>
    </View>
  );
}

/**
 * Distributor stock list (Account → Inventory). Reached only from the Account
 * tab's distributor management group, so no extra role gate is needed here.
 */
export function InventoryListScreen({
  navigation,
}: AccountScreenProps<'Inventory'>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 350);
  const [sort, setSort] = useState<SortKey>('recent');

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInventory(SORTS[sort].sortBy, SORTS[sort].sortOrder);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const all = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const items = useMemo(
    () => (search ? all.filter((i) => matchesInventorySearch(i, search)) : all),
    [all, search],
  );

  // `GET /inventory` accepts no search param (see api.ts), so matching happens
  // over the pages already loaded. While a search is active, keep pulling the
  // remaining pages so the results aren't limited to the first screenful.
  useEffect(() => {
    if (search && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [search, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const total = data?.pages[0]?.meta.total ?? 0;
  const outOfStock = all.filter((i) => stockTone(i) === 'out').length;

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const available = toNum(item.available_quantity);
    const tone = stockTone(item);

    return (
      <Pressable
        onPress={() => navigation.navigate('InventoryDetail', { item })}
        style={({ pressed }) => (pressed ? styles.pressed : undefined)}
      >
        <Card style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={[typography.title, styles.name]} numberOfLines={2}>
              {item.product?.name ?? t('inventory.unknownProduct')}
            </Text>
            <View
              style={[styles.stockBadge, { backgroundColor: stockToneColor(tone) }]}
            >
              <Text style={styles.stockBadgeText}>{available}</Text>
            </View>
          </View>

          {item.product?.sku ? (
            <Text style={styles.sku}>{item.product.sku}</Text>
          ) : null}

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
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen
      scroll={false}
      edges={[]}
      floatingAction={
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate('AdjustStock')}
          accessibilityRole="button"
          accessibilityLabel={t('inventory.adjust.action')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      }
    >
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('inventory.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={styles.chips}>
        <Chip
          label={t('inventory.sort.recent')}
          active={sort === 'recent'}
          onPress={() => setSort('recent')}
        />
        <Chip
          label={t('inventory.sort.lowest')}
          active={sort === 'lowest'}
          onPress={() => setSort('lowest')}
        />
      </View>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('inventory.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
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
            <View style={styles.headerBlock}>
              <View style={styles.summaryRow}>
                <Card style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{total}</Text>
                  <Text style={styles.summaryLabel}>
                    {t('inventory.summary.products')}
                  </Text>
                </Card>
                <Card style={styles.summaryCard}>
                  <Text
                    style={[
                      styles.summaryValue,
                      outOfStock > 0 && styles.summaryValueAlert,
                    ]}
                  >
                    {outOfStock}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    {t('inventory.summary.outOfStock')}
                  </Text>
                </Card>
              </View>

              <Pressable
                onPress={() => navigation.navigate('InventoryValuation')}
                accessibilityRole="button"
                accessibilityLabel={t('inventory.valuation.title')}
                style={({ pressed }) => (pressed ? styles.pressed : undefined)}
              >
                <Card style={styles.valuationCard}>
                  <Ionicons
                    name="stats-chart-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <View style={styles.valuationText}>
                    <Text style={typography.title}>
                      {t('inventory.valuation.title')}
                    </Text>
                    <Text style={styles.muted}>
                      {t('inventory.valuation.hint')}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textMuted}
                  />
                </Card>
              </Pressable>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title={search ? t('inventory.noResults') : t('inventory.empty')}
              message={search ? undefined : t('inventory.emptyHint')}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={colors.primary} />
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
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

  headerBlock: { gap: spacing.md, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', gap: spacing.md },
  summaryCard: { flex: 1, alignItems: 'center', gap: spacing.xs },
  summaryValue: { ...typography.h2 },
  summaryValueAlert: { color: colors.danger },
  summaryLabel: { ...typography.caption, textAlign: 'center' },

  valuationCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  valuationText: { flex: 1, gap: 2 },
  muted: { ...typography.caption },

  card: { marginBottom: spacing.md, gap: spacing.xs },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: { flex: 1 },
  sku: { ...typography.caption },
  stockBadge: {
    minWidth: 44,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  stockBadgeText: { ...typography.caption, color: '#FFFFFF', fontWeight: '700' },
  qtyRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  qty: { flex: 1, gap: 2 },
  qtyValue: { ...typography.title },
  qtyLabel: { ...typography.caption },

  pressed: { opacity: 0.6 },
  listContent: { paddingBottom: spacing.xxl * 2, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
