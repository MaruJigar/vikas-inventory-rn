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

import { Screen, Button, Card, Input, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { getApiErrorMessage } from '@/lib/apiError';
import { toast } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCategoryList, useCreateCategory } from '@/features/products/hooks';
import { iconForCategory } from '@/features/products/categoryIcons';
import type { Category } from '@/types/product';
import type { HomeScreenProps } from '@/navigation/types';

/**
 * Full list of product categories — searchable + paginated. Tapping a category
 * opens Products scoped to it (client-side filter; the backend `/products` has
 * no category param yet).
 *
 * This is also the ONE place categories are created: the product form only
 * picks from the catalogue, it doesn't edit it.
 */
export function CategoriesScreen({ navigation }: HomeScreenProps<'Categories'>) {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 350);

  // Mirrors the backend @Roles on POST /product-categories — a salesman would
  // get a 403, so don't offer them the button.
  const canCreate =
    role === 'DISTRIBUTOR_ADMIN' ||
    role === 'MANUFACTURER_ADMIN' ||
    role === 'SUPER_ADMIN';

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const createCategory = useCreateCategory();

  const closeAdd = () => {
    setAdding(false);
    setNewName('');
  };

  const submitNewCategory = () => {
    const name = newName.trim();
    if (!name) return;
    createCategory.mutate(name, {
      onSuccess: () => {
        toast.success(t('categories.added'));
        closeAdd();
      },
      onError: (e) =>
        toast.error(getApiErrorMessage(e, t) || t('categories.addError')),
    });
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryList(search);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

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
    <Screen
      scroll={false}
      edges={['bottom']}
      floatingAction={
        canCreate && !adding ? (
          <Pressable
            style={styles.fab}
            onPress={() => setAdding(true)}
            accessibilityRole="button"
            accessibilityLabel={t('categories.add')}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </Pressable>
        ) : null
      }
    >
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('categories.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {adding ? (
        <Card style={styles.addCard}>
          <Text style={styles.addLabel}>{t('categories.add')}</Text>
          <Input
            value={newName}
            onChangeText={setNewName}
            placeholder={t('categories.namePlaceholder')}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submitNewCategory}
          />
          <View style={styles.addActions}>
            <Button
              label={t('common.cancel')}
              variant="secondary"
              style={styles.flex1}
              onPress={closeAdd}
            />
            <Button
              label={t('categories.addSubmit')}
              style={styles.flex1}
              loading={createCategory.isPending}
              disabled={!newName.trim()}
              onPress={submitNewCategory}
            />
          </View>
        </Card>
      ) : null}

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
          onRefresh={() => void onRefresh()}
          refreshing={refreshing}
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
  addCard: { gap: spacing.sm, marginBottom: spacing.sm },
  addLabel: { ...typography.label, color: colors.text },
  addActions: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
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
