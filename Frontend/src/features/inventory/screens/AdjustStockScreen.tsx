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

import { Screen, Card, Input, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { notify } from '@/lib/dialog';
import { useProducts } from '@/features/products/hooks';
import { AdjustStockForm } from '@/features/inventory/components/AdjustStockForm';
import type { Product } from '@/types/product';
import type { AccountScreenProps } from '@/navigation/types';

interface Picked {
  id: string;
  name: string;
}

/**
 * Standalone stock adjustment — the entry point for stocking a product that has
 * no inventory row yet (the backend creates the row on first adjustment).
 *
 * The product list is fetched with `own_products_only`, because
 * `POST /inventory/adjust` rejects any product the distributor doesn't own:
 * manufacturer products are stocked through the order flow, not by hand.
 */
export function AdjustStockScreen({
  route,
  navigation,
}: AccountScreenProps<'AdjustStock'>) {
  const { t } = useTranslation();
  const preset = route.params?.productId
    ? { id: route.params.productId, name: route.params.productName ?? '' }
    : null;

  const [picked, setPicked] = useState<Picked | null>(preset);
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 350);

  // Own products, inactive ones KEPT: stock adjustment is management, not
  // selling. A deactivated product still holds stock, and the app can't
  // reactivate one, so hiding it here would strand that stock.
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(search, true, /* includeInactive */ true);

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  if (picked) {
    return (
      <Screen edges={[]}>
        <Card style={styles.pickedCard}>
          <View style={styles.pickedText}>
            <Text style={styles.pickedLabel}>{t('inventory.adjust.product')}</Text>
            <Text style={typography.title} numberOfLines={2}>
              {picked.name || t('inventory.unknownProduct')}
            </Text>
          </View>
          {/* Only offer a re-pick when the product wasn't fixed by the caller. */}
          {preset ? null : (
            <Pressable
              onPress={() => setPicked(null)}
              accessibilityRole="button"
              accessibilityLabel={t('inventory.adjust.change')}
              hitSlop={8}
            >
              <Text style={styles.change}>{t('inventory.adjust.change')}</Text>
            </Pressable>
          )}
        </Card>

        <View style={styles.formWrap}>
          <AdjustStockForm
            productId={picked.id}
            onSuccess={() => {
              notify(t('inventory.adjust.success'));
              navigation.goBack();
            }}
          />
        </View>

        <Text style={styles.note}>{t('inventory.adjust.ownProductsNote')}</Text>
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: Product }) => (
    <Pressable
      onPress={() => setPicked({ id: item.id, name: item.name })}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      <Card style={styles.productCard}>
        <View style={styles.productText}>
          <Text style={typography.title} numberOfLines={2}>
            {item.name}
          </Text>
          {item.sku ? <Text style={styles.sku}>{item.sku}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={[]}>
      <Text style={styles.pickTitle}>{t('inventory.adjust.pickProduct')}</Text>

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
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          ListEmptyComponent={
            <EmptyState
              title={
                search
                  ? t('products.noResults')
                  : t('inventory.adjust.noOwnProducts')
              }
              message={search ? undefined : t('inventory.adjust.ownProductsNote')}
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
  pickTitle: { ...typography.body, marginBottom: spacing.sm },
  pickedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  pickedText: { flex: 1, gap: 2 },
  pickedLabel: { ...typography.label },
  change: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  formWrap: { marginTop: spacing.lg },
  note: {
    ...typography.caption,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
  },
  productText: { flex: 1, gap: 2 },
  sku: { ...typography.caption },

  pressed: { opacity: 0.6 },
  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
