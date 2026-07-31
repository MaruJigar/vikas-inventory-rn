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
import { getApiErrorMessage } from '@/lib/apiError';
import { confirmAction, notify } from '@/lib/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { useVisitStore } from '@/store/useVisitStore';
import { useProducts, useDeleteProduct } from '@/features/products/hooks';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { computeCartTotals, formatINR } from '@/features/products/pricing';
import type { Product } from '@/types/product';
import type { HomeScreenProps } from '@/navigation/types';

export function ProductsScreen({
  navigation,
  route,
}: HomeScreenProps<'Products'>) {
  const { t } = useTranslation();
  const isDistributor = useAuthStore((s) => s.user?.role) === 'DISTRIBUTOR_ADMIN';
  const activeVisit = useVisitStore((s) => s.activeVisit);
  const canAdd = !!activeVisit; // add-to-cart only during an active shop visit
  const [query, setQuery] = useState('');
  const [ownOnly, setOwnOnly] = useState(false);
  const search = useDebouncedValue(query.trim(), 350);

  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  // Show the category name in the header when scoped to one.
  React.useEffect(() => {
    if (categoryName) navigation.setOptions({ title: categoryName });
  }, [categoryName, navigation]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(search, isDistributor && ownOnly);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  // The backend has no category filter param, so we filter client-side. To make
  // that reliable across pagination, eagerly load all pages while a category is
  // active (distributor catalogs are modest), then filter by category id.
  React.useEffect(() => {
    if (categoryId && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [categoryId, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.data) ?? [];
    return categoryId ? all.filter((p) => p.category?.id === categoryId) : all;
  }, [data, categoryId]);

  const deleteProduct = useDeleteProduct();

  const items = useCartStore((s) => s.items);
  const totals = useMemo(
    () => computeCartTotals(Object.values(items)),
    [items],
  );

  const renderItem = ({ item }: { item: Product }) => {
    const ownProduct =
      isDistributor && item.product_source === 'DISTRIBUTOR_CREATED';
    return (
      <ProductCard
        product={item}
        addable={canAdd}
        enforceStock={isDistributor}
        onEdit={
          ownProduct
            ? () => navigation.navigate('AddProduct', { product: item })
            : undefined
        }
        onDelete={
          ownProduct
            ? () =>
                confirmAction({
                  title: t('products.deleteConfirm'),
                  confirmLabel: t('products.delete'),
                  cancelLabel: t('common.cancel'),
                  destructive: true,
                  onConfirm: () =>
                    deleteProduct.mutate(item.id, {
                      onError: (e) =>
                        notify(
                          getApiErrorMessage(e, t) ||
                            t('products.deleteError'),
                        ),
                    }),
                })
            : undefined
        }
      />
    );
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

      {isDistributor ? (
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setOwnOnly((v) => !v)}
            style={[styles.filterChip, ownOnly && styles.filterChipActive]}
            accessibilityRole="button"
          >
            <Ionicons
              name={ownOnly ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={ownOnly ? '#FFFFFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.filterChipText,
                ownOnly && styles.filterChipTextActive,
              ]}
            >
              {t('products.myProducts')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!canAdd ? (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={styles.hintText}>{t('products.visitToAdd')}</Text>
        </View>
      ) : null}

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
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={colors.primary} />
            ) : (
              <EmptyState
                title={search ? t('products.noResults') : t('products.empty')}
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
          onPress={() => navigation.navigate('Cart')}
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

      {isDistributor ? (
        <Pressable
          style={[styles.fab, totals.itemCount > 0 && styles.fabRaised]}
          onPress={() => navigation.navigate('AddProduct')}
          accessibilityRole="button"
          accessibilityLabel={t('products.form.title')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: spacing.xxl * 2.5, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
  filterRow: { flexDirection: 'row', marginBottom: spacing.sm },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: { ...typography.label, color: colors.textMuted },
  filterChipTextActive: { color: '#FFFFFF' },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  hintText: { ...typography.caption, color: colors.textMuted, flex: 1 },
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
  fabRaised: { bottom: 92 },
});
