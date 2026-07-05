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

import { Screen, Card, Input, EmptyState, Spinner } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getCurrentCoords } from '@/lib/location';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { useShops } from '@/features/shops/hooks';
import { useStartVisit } from '@/features/visit/hooks';
import { useVisitStore } from '@/store/useVisitStore';
import type { Shop } from '@/types/shop';
import type { HomeScreenProps } from '@/navigation/types';

export function SelectShopScreen({ navigation }: HomeScreenProps<'SelectShop'>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 350);
  const [startingId, setStartingId] = useState<string | null>(null);

  const startVisit = useStartVisit();
  const setActiveVisit = useVisitStore((s) => s.setActiveVisit);

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

  const onSelect = async (shop: Shop) => {
    setStartingId(shop.id);
    // GPS is optional for start-visit — proceed even if it can't be read.
    const res = await getCurrentCoords();
    const coords = res.ok ? res.coords : undefined;
    startVisit.mutate(
      { shopId: shop.id, latitude: coords?.latitude, longitude: coords?.longitude },
      {
        onSuccess: (visit) => {
          setActiveVisit({
            visitId: visit.id,
            shopId: shop.id,
            shopName: shop.name,
          });
          navigation.replace('Products');
        },
        onError: (e) => notify(getApiErrorMessage(e, t)),
        onSettled: () => setStartingId(null),
      },
    );
  };

  const renderItem = ({ item }: { item: Shop }) => (
    <Pressable onPress={() => void onSelect(item)} disabled={!!startingId}>
      <Card style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={typography.title}>{item.name}</Text>
          {item.city_name || item.state_name ? (
            <Text style={styles.muted}>
              {[item.city_name, item.state_name].filter(Boolean).join(', ')}
            </Text>
          ) : null}
        </View>
        {startingId === item.id ? (
          <ActivityIndicator color={colors.primary} />
        ) : null}
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={[]}>
      <Text style={[typography.h2, styles.title]}>{t('visit.selectShop')}</Text>
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
  title: { marginTop: spacing.sm, marginBottom: spacing.md },
  card: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: { gap: spacing.xs, flex: 1 },
  muted: { ...typography.caption, color: colors.textMuted },
  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
