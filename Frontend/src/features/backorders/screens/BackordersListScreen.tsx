import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Card, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { useBackorders } from '@/features/backorders/hooks';
import {
  BACKORDER_STATUSES,
  backorderStatusColor,
  backorderStatusLabel,
  unfulfilledQty,
} from '@/features/backorders/constants';
import { toNum } from '@/features/orders/constants';
import type { Backorder, BackorderStatus } from '@/features/backorders/types';
import type { OrdersScreenProps } from '@/navigation/types';

export function BackordersListScreen({
  navigation,
}: OrdersScreenProps<'Backorders'>) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<BackorderStatus | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBackorders(status);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const backorders = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const renderItem = ({ item }: { item: Backorder }) => (
    <Pressable
      onPress={() => navigation.navigate('BackorderDetail', { id: item.id })}
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={typography.title} numberOfLines={1}>
            {item.product?.name ?? t('backorders.unknownProduct')}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: backorderStatusColor(item.status) },
            ]}
          >
            <Text style={styles.badgeText}>
              {backorderStatusLabel(t, item.status)}
            </Text>
          </View>
        </View>
        {item.order ? (
          <Text style={styles.muted}>
            {item.order.order_number}
            {item.order.shop ? ` · ${item.order.shop.name}` : ''}
          </Text>
        ) : null}
        <View style={styles.cardBottom}>
          <Text style={styles.qty}>
            {t('backorders.owed', { qty: unfulfilledQty(item) })}
          </Text>
          <Text style={styles.muted}>
            {t('backorders.ofTotal', { total: toNum(item.quantity) })}
          </Text>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={[]}>
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip
            label={t('backorders.filterAll')}
            active={status === null}
            onPress={() => setStatus(null)}
          />
          {BACKORDER_STATUSES.map((s) => (
            <Chip
              key={s}
              label={backorderStatusLabel(t, s)}
              active={status === s}
              onPress={() => setStatus(s)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('backorders.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={backorders}
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
          ListEmptyComponent={
            <EmptyState
              title={status ? t('backorders.noResults') : t('backorders.empty')}
              message={status ? undefined : t('backorders.emptyHint')}
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
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: { marginTop: spacing.sm, marginBottom: spacing.sm },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.text },
  chipTextActive: { color: '#FFFFFF' },
  card: { marginBottom: spacing.md, gap: spacing.xs },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  muted: { ...typography.body, color: colors.textMuted },
  qty: { ...typography.title },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
