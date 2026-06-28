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

import { Screen, Input, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useProducts } from '@/features/products/hooks';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { computeCartTotals, formatINR } from '@/features/products/pricing';
import type { Product } from '@/types/product';
import type { HomeScreenProps } from '@/navigation/types';

export function ProductsScreen({ navigation }: HomeScreenProps<'Products'>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 350);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(search);

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const items = useCartStore((s) => s.items);
  const totals = useMemo(
    () => computeCartTotals(Object.values(items)),
    [items],
  );

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  return (
    <Screen scroll={false}>
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
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void refetch()}
          refreshing={isRefetching}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          ListEmptyComponent={
            <EmptyState
              title={search ? t('products.noResults') : t('products.empty')}
            />
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
