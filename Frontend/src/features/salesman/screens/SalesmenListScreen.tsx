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
import { useSalesmen } from '@/features/salesman/hooks';
import type { Salesman } from '@/types/salesman';
import type { AccountScreenProps } from '@/navigation/types';

export function SalesmenListScreen({
  navigation,
}: AccountScreenProps<'Salesmen'>) {
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
  } = useSalesmen(search);

  const salesmen = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const renderItem = ({ item }: { item: Salesman }) => (
    <Pressable
      onPress={() => navigation.navigate('SalesmanDetail', { id: item.id })}
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={typography.title}>{item.full_name}</Text>
          <View
            style={[
              styles.badge,
              item.is_active ? styles.badgeActive : styles.badgeInactive,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.is_active
                ? t('salesmen.active')
                : t('salesmen.inactive')}
            </Text>
          </View>
        </View>
        {item.phone ? <Text style={styles.muted}>{item.phone}</Text> : null}
        {item.email ? <Text style={styles.muted}>{item.email}</Text> : null}
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={[]}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('salesmen.searchPlaceholder')}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('salesmen.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={salesmen}
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
              title={search ? t('salesmen.noResults') : t('salesmen.empty')}
              message={search ? undefined : t('salesmen.emptyHint')}
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
        onPress={() => navigation.navigate('AddSalesman')}
        accessibilityRole="button"
        accessibilityLabel={t('salesmen.add')}
      >
        <Ionicons name="person-add" size={24} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, gap: spacing.xs },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muted: { ...typography.body, color: colors.textMuted },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeInactive: { backgroundColor: colors.surface },
  badgeText: { ...typography.caption, color: colors.text },
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
