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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Input, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { useOrders, useStatusIndex } from '@/features/orders/hooks';
import { useManufacturerNames } from '@/features/manufacturers/hooks';
import {
  formatINR,
  statusColor,
  statusLabel,
  toNum,
} from '@/features/orders/constants';
import type { Order } from '@/types/order';
import type { OrdersScreenProps } from '@/navigation/types';

/** Rows a client-side type filter aims to have before it stops pre-fetching —
 * enough to overflow a phone screen so normal scroll-paging can take over. */
const MIN_FILTERED_ROWS = 15;

/** Page size while a type filter is on. Purchase orders are a small slice of a
 * busy distributor's list, so the default 20 would mean a lot of round trips to
 * surface a handful of rows. */
const TYPE_FILTER_PAGE_SIZE = 100;

export function OrdersListScreen({
  navigation,
  route,
}: OrdersScreenProps<'OrdersList'>) {
  const { t } = useTranslation();
  const {
    index: statusIndex,
    activeStatuses,
    notConfigured: statusesNotConfigured,
  } = useStatusIndex();
  const [query, setQuery] = useState('');
  // Seed the filter from a navigation param (a dashboard tile passes status_id).
  const [status, setStatus] = useState<string | null>(
    route.params?.initialStatus ?? null,
  );
  const search = useDebouncedValue(query.trim(), 350);

  // Scope the list to a salesman/shop (server-side) or to an order type
  // (client-side). One banner clears them together.
  const { salesmanId, shopId, orderType, filterLabel } = route.params ?? {};
  const [scopeCleared, setScopeCleared] = useState(false);
  const scoped = !scopeCleared && !!(salesmanId || shopId || orderType);
  const scope = scoped && (salesmanId || shopId) ? { salesmanId, shopId } : undefined;
  const typeFilter = scoped ? orderType : undefined;

  // The Orders screen is the tab's initial route, so a second tile tap merges
  // new params without remounting — keep the filter in sync when that happens.
  const paramStatus = route.params?.initialStatus;
  React.useEffect(() => {
    if (paramStatus) setStatus(paramStatus);
    // The PO tile arrives with a type but no status. Drop whatever a previous
    // tile left selected — the two filters AND together, which would hide most
    // of the orders the tile just counted.
    else if (orderType) setStatus(null);
  }, [paramStatus, orderType]);
  // A fresh scope param (new salesman/shop/type) re-activates the banner.
  React.useEffect(() => {
    if (salesmanId || shopId || orderType) setScopeCleared(false);
  }, [salesmanId, shopId, orderType]);

  // A type filter is applied client-side, so a page can yield almost no rows —
  // pull bigger pages there to keep the round trips down.
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders(
    search,
    status,
    scope,
    typeFilter ? TYPE_FILTER_PAGE_SIZE : undefined,
  );
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const mfrNames = useManufacturerNames();

  // A caller may name the scope itself (a salesman/shop); an order type names
  // itself.
  const scopeLabel =
    filterLabel ??
    (typeFilter
      ? t(typeFilter === 'PURCHASE' ? 'orders.purchaseOrder' : 'orders.salesOrder')
      : t('orders.filterScope'));

  const orders = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.data) ?? [];
    if (!typeFilter) return all;
    // A purchase order is the distributor→manufacturer one: no salesman.
    return all.filter((o) =>
      typeFilter === 'PURCHASE' ? !o.salesman_id : !!o.salesman_id,
    );
  }, [data, typeFilter]);

  // The backend has no order-type filter, so the type is applied to whatever
  // pages we've fetched. A page can contribute few rows — or none — leaving the
  // list too short to scroll, so `onEndReached` never fires and paging stalls.
  // Keep pulling until there's enough to fill a screen or the pages run out.
  React.useEffect(() => {
    if (!typeFilter || !hasNextPage || isFetchingNextPage) return;
    if (orders.length < MIN_FILTERED_ROWS) void fetchNextPage();
  }, [
    typeFilter,
    hasNextPage,
    isFetchingNextPage,
    orders.length,
    fetchNextPage,
  ]);

  // Mid-auto-page there may be no rows yet — that's "still loading", not "no
  // results", so hold the empty state back until the pages are exhausted.
  const autoPaging =
    !!typeFilter && hasNextPage && orders.length < MIN_FILTERED_ROWS;

  const renderItem = ({ item }: { item: Order }) => (
    <Pressable
      onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={typography.title}>{item.order_number}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: statusColor(statusIndex, item.status_id) },
            ]}
          >
            <Text style={styles.badgeText}>
              {statusLabel(t, statusIndex, item.status_id)}
            </Text>
          </View>
        </View>
        {!item.salesman_id ? (
          <View style={styles.typeTag}>
            <Ionicons name="business-outline" size={13} color={colors.primary} />
            <Text style={styles.typeTagText} numberOfLines={1}>
              {item.manufacturer_id && mfrNames.get(item.manufacturer_id)
                ? t('orders.toManufacturerNamed', {
                    name: mfrNames.get(item.manufacturer_id),
                  })
                : t('orders.toManufacturer')}
            </Text>
          </View>
        ) : item.shop ? (
          <Text style={styles.muted}>{item.shop.name}</Text>
        ) : null}
        <View style={styles.cardBottom}>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text style={typography.title}>
            {formatINR(toNum(item.final_order_amount))}
          </Text>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.h1}>{t('orders.title')}</Text>
      </View>

      {scoped ? (
        <Pressable
          style={styles.scopeBanner}
          onPress={() => setScopeCleared(true)}
          accessibilityRole="button"
          accessibilityLabel={t('orders.clearFilter')}
        >
          <Text style={styles.scopeText} numberOfLines={1}>
            {t('orders.filteredBy', { label: scopeLabel })}
          </Text>
          <Ionicons name="close-circle" size={18} color={colors.primary} />
        </Pressable>
      ) : null}

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('orders.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {statusesNotConfigured ? (
        <Card style={styles.noticeCard}>
          <Ionicons
            name="warning-outline"
            size={18}
            color={colors.warning}
          />
          <Text style={styles.noticeText}>
            {t('orders.statusesNotConfigured')}
          </Text>
        </Card>
      ) : (
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Chip
              label={t('orders.filterAll')}
              active={status === null}
              onPress={() => setStatus(null)}
            />
            {activeStatuses.map((s) => (
              <Chip
                key={s.id}
                label={statusLabel(t, statusIndex, s.id)}
                active={status === s.id}
                onPress={() => setStatus(s.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('orders.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={orders}
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
            autoPaging ? null : (
              <EmptyState
                title={
                  search || status || scoped
                    ? t('orders.noResults')
                    : t('orders.empty')
                }
                message={
                  search || status || scoped ? undefined : t('orders.emptyHint')
                }
              />
            )
          }
          ListFooterComponent={
            isFetchingNextPage || autoPaging ? (
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
  header: { marginTop: spacing.sm, marginBottom: spacing.md },
  scopeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  scopeText: { ...typography.label, color: colors.primary, flex: 1 },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  noticeText: { ...typography.caption, color: colors.textMuted, flex: 1 },
  filterRow: { marginBottom: spacing.sm },
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
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  muted: { ...typography.body, color: colors.textMuted },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  typeTagText: { ...typography.caption, color: colors.primary },
  date: { ...typography.caption },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
