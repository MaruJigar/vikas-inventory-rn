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

import { Screen, Card, Input, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useCategoryList } from '@/features/products/hooks';
import { iconForCategory } from '@/features/products/categoryIcons';
import type { Category } from '@/types/product';
import type { HomeScreenProps } from '@/navigation/types';

/**
 * Full list of product categories — searchable + paginated. Tapping a category
 * opens Products scoped to it (client-side filter; the backend `/products` has
 * no category param yet).
 */
export function CategoriesScreen({ navigation }: HomeScreenProps<'Categories'>) {
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
  } = useCategoryList(search);

  const categories = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const renderItem = ({ item }: { item: Category }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('Products', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
      <Card style={styles.row}>
        <View style={styles.icon}>
          <Ionicons
            name={iconForCategory(item.name)}
            size={22}
            color={colors.primary}
          />
        </View>
        <Text style={[typography.title, styles.name]} numberOfLines={1}>
          {item.name}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={['bottom']}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('categories.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('errors.generic')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
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
              title={
                search
                  ? t('categories.noResults')
                  : t('dashboard.distributor.noCategories')
              }
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
  listContent: { paddingVertical: spacing.md, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1 },
});
