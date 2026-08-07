import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Card, EmptyState, Spinner } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { formatINR } from '@/features/orders/constants';
import { useInventoryValuation } from '@/features/inventory/hooks';
import type { InventoryValuationRow } from '@/types/inventory';

/**
 * Stock valuation (`GET /analytics/inventory/reports/inventory-valuation`).
 *
 * The report is a plain, unpaginated array valued at MRP — it takes no date or
 * category params, so there is nothing to filter on yet.
 */
export function InventoryValuationScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useInventoryValuation();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const rows = data ?? [];
  const totalValue = useMemo(
    () => rows.reduce((sum, r) => sum + (r.stockValue || 0), 0),
    [rows],
  );

  if (isLoading) return <Spinner />;
  if (isError) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('inventory.valuation.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: InventoryValuationRow }) => (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={[typography.title, styles.name]} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.value}>{formatINR(item.stockValue)}</Text>
      </View>
      {item.sku || item.categoryName ? (
        <Text style={styles.meta}>
          {[item.sku, item.categoryName].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {t('inventory.valuation.breakdown', {
          qty: item.availableQuantity,
          mrp: formatINR(item.mrp),
        })}
      </Text>
    </Card>
  );

  return (
    <Screen scroll={false} edges={[]}>
      <FlatList
        data={rows}
        keyExtractor={(item, index) => `${item.sku ?? item.productName}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={() => void onRefresh()}
        refreshing={refreshing}
        ListHeaderComponent={
          rows.length ? (
            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>
                {t('inventory.valuation.totalLabel')}
              </Text>
              <Text style={styles.totalValue}>{formatINR(totalValue)}</Text>
              <Text style={styles.totalHint}>
                {t('inventory.valuation.atMrp')}
              </Text>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title={t('inventory.valuation.empty')}
            message={t('inventory.valuation.emptyHint')}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  totalLabel: { ...typography.label },
  totalValue: { ...typography.h1 },
  totalHint: { ...typography.caption },

  card: { marginBottom: spacing.md, gap: spacing.xs },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: { flex: 1 },
  value: { ...typography.title },
  meta: { ...typography.caption },

  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
});
