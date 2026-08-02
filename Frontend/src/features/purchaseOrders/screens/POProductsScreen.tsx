import React, { useMemo, useState } from 'react';
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

import { Screen, Input, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { useProducts } from '@/features/products/hooks';
import { POProductCard } from '@/features/purchaseOrders/components/POProductCard';
import { usePOCartStore } from '@/store/usePOCartStore';
import { computeCartTotals, formatINR } from '@/features/products/pricing';
import type { HomeScreenProps } from '@/navigation/types';

export function POProductsScreen({
  navigation,
}: HomeScreenProps<'PurchaseOrderProducts'>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 350);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(search);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  // POs go to manufacturers — only products that belong to a manufacturer are
  // orderable (the distributor's own products have no manufacturer and would
  // create a nonsensical "self" order). We key off the manufacturer relation
  // rather than `product_source`, whose value is inconsistent (INTERNAL vs
  // MANUFACTURER_CREATED) across the backend/seed.
  const products = useMemo(
    () =>
      (data?.pages.flatMap((p) => p.data) ?? []).filter(
        (p) => p.manufacturer != null,
      ),
    [data],
  );

  const items = usePOCartStore((s) => s.items);
  const totals = useMemo(
    // Same GST rule as the PO cart, so the bottom bar matches the cart total.
    () =>
      computeCartTotals(Object.values(items), {
        standardPercent: 0,
        specialPercent: 0,
        includeGst: true,
      }),
    [items],
  );

  return (
    <Screen scroll={false} edges={[]}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('products.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('products.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <POProductCard product={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void onRefresh()}
          refreshing={refreshing}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          ListEmptyComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={colors.primary} />
            ) : (
              <EmptyState
                title={
                  search
                    ? t('products.noResults')
                    : t('purchaseOrders.noProducts')
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
      )}

      {totals.itemCount > 0 ? (
        <Pressable
          style={styles.cartBar}
          onPress={() => navigation.navigate('PurchaseOrderCart')}
          accessibilityRole="button"
        >
          <Text style={styles.cartBarText}>
            {t('products.cartItems', { count: totals.itemCount })}
          </Text>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarTotal}>
              {formatINR(totals.finalPayable)}
            </Text>
            <Text style={styles.cartBarCta}>{t('products.viewCart')}</Text>
          </View>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: spacing.xxl * 2.5, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
  cartBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    // Wraps to a second line for large orders rather than clipping the total.
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    rowGap: spacing.xs,
    columnGap: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  // Count and total sit side by side while they fit; a large order pushes the
  // total + CTA onto a second line instead of clipping them off the pill.
  cartBarText: { ...typography.title, color: '#FFFFFF', flexShrink: 1 },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    flexGrow: 1,
    minWidth: 176,
  },
  cartBarTotal: { ...typography.title, color: '#FFFFFF', flexShrink: 1 },
  cartBarCta: { ...typography.label, color: '#FFFFFF', flexShrink: 0 },
});
