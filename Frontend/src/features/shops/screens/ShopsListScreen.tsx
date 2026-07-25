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
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { shopStatusColor, shopStatusLabel } from '@/features/shops/constants';
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useShops(search);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const shops = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const renderItem = ({ item }: { item: Shop }) => (
    <Pressable onPress={() => navigation.navigate('ShopDetail', { id: item.id })}>
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={[typography.title, styles.name]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.verification_status ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: shopStatusColor(item.verification_status) },
              ]}
            >
              <Text style={styles.badgeText}>
                {shopStatusLabel(t, item.verification_status)}
              </Text>
            </View>
          ) : null}
        </View>
        {item.owner_name ? (
          <Text style={styles.muted}>{item.owner_name}</Text>
        ) : null}
        <Text style={styles.muted}>{item.phone}</Text>
        {item.city_name || item.state_name ? (
          <Text style={styles.location}>
            {[item.city_name, item.state_name].filter(Boolean).join(', ')}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={['top']}>
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
          onRefresh={() => void onRefresh()}
          refreshing={refreshing}
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: { flex: 1 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
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
