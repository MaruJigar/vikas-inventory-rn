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

import { Screen, Card, Input, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useShops } from '@/features/shops/hooks';
import type { Shop } from '@/types/shop';
import type { ShopsScreenProps } from '@/navigation/types';

export function ShopsListScreen({ navigation }: ShopsScreenProps<'ShopsList'>) {
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
  } = useShops(search);

  const shops = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const renderItem = ({ item }: { item: Shop }) => (
    <Pressable onPress={() => navigation.navigate('ShopDetail', { id: item.id })}>
      <Card style={styles.card}>
        <Text style={typography.title}>{item.name}</Text>
        {item.owner_name ? (
          <Text style={styles.muted}>{item.owner_name}</Text>
        ) : null}
        <Text style={styles.muted}>{item.phone}</Text>
        {item.city || item.state ? (
          <Text style={styles.location}>
            {[item.city, item.state].filter(Boolean).join(', ')}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={typography.h1}>{t('shops.title')}</Text>
      </View>

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('shops.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('shops.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={shops}
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
              title={search ? t('shops.noResults') : t('shops.empty')}
              message={search ? undefined : t('shops.emptyHint')}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={colors.primary} />
            ) : null
          }
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddShop')}
        accessibilityRole="button"
        accessibilityLabel={t('shops.add')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.md },
  card: { marginBottom: spacing.md, gap: spacing.xs },
  muted: { ...typography.body, color: colors.textMuted },
  location: { ...typography.caption, marginTop: spacing.xs },
  listContent: { paddingBottom: spacing.xxl * 2, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
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
});
