import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen, Input, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { useProducts } from '@/features/products/hooks';
import { usePurchaseRequestSuggestion } from '@/features/purchaseOrders/hooks';
import { POProductCard } from '@/features/purchaseOrders/components/POProductCard';
import { usePOCartStore } from '@/store/usePOCartStore';
import { computeCartTotals, formatINR, toNum } from '@/features/products/pricing';
import type { PurchaseRequestItem } from '@/features/purchaseOrders/types';
import type { Product } from '@/types/product';
import type { HomeScreenProps } from '@/navigation/types';

/** Build a minimal Product from a reorder-suggestion line so it can seed the PO
 * cart (the cart only needs id/name/mrp/manufacturer for display + submit). */
function suggestionToProduct(item: PurchaseRequestItem): Product {
  return {
    id: item.product_id,
    product_source: 'MANUFACTURER_CREATED',
    name: item.product_name_snapshot,
    sku: item.sku_snapshot,
    unit: null,
    description: null,
    product_image_url: null,
    mrp: item.mrp,
    gst_percent: 0,
    distributor_discount_percent: 0,
    special_discount_percent: 0,
    external_manufacturer_name: item.manufacturer_name_snapshot,
    is_active: true,
    category: null,
    manufacturer: item.manufacturer_name_snapshot
      ? { id: '', company_name: item.manufacturer_name_snapshot }
      : null,
  };
}

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
  const setQty = usePOCartStore((s) => s.setQty);
  const totals = useMemo(() => computeCartTotals(Object.values(items)), [items]);

  const suggest = usePurchaseRequestSuggestion();
  const onSuggest = () => {
    suggest.mutate(undefined, {
      onSuccess: (s) => {
        const list = s.items ?? [];
        if (list.length === 0) {
          notify(t('purchaseOrders.suggest.none'));
          return;
        }
        for (const it of list) {
          setQty(suggestionToProduct(it), toNum(it.quantity));
        }
        navigation.navigate('PurchaseOrderCart');
      },
      onError: (e) =>
        notify(getApiErrorMessage(e, t) || t('purchaseOrders.suggest.error')),
    });
  };

  return (
    <Screen scroll={false} edges={[]}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('products.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <Pressable
        style={styles.suggestBtn}
        onPress={onSuggest}
        disabled={suggest.isPending}
        accessibilityRole="button"
      >
        {suggest.isPending ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
        )}
        <Text style={styles.suggestText}>{t('purchaseOrders.suggest.action')}</Text>
      </Pressable>

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
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  suggestText: { ...typography.label, color: colors.primary },
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
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cartBarText: { ...typography.title, color: '#FFFFFF' },
  cartBarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cartBarTotal: { ...typography.title, color: '#FFFFFF' },
  cartBarCta: { ...typography.label, color: '#FFFFFF' },
});
