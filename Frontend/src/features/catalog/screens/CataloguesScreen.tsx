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

import { Screen, Input, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import {
  usePublicCatalogues,
  useAccessibleCatalogues,
} from '@/features/catalog/hooks';
import { CatalogueCard } from '@/features/catalog/components/CatalogueCard';
import type { CatalogueItem } from '@/types/catalogue';

type TabFilter = 'all' | 'accessible';

export function CataloguesScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = status === 'authenticated' && !!user;

  const canHavePersonalized =
    isAuthenticated &&
    (user?.role === 'DISTRIBUTOR_ADMIN' ||
      user?.role === 'DISTRIBUTOR' ||
      user?.role === 'SALESMAN' ||
      user?.role === 'SUPER_ADMIN');

  // Queries
  const publicQuery = usePublicCatalogues(debouncedSearch);
  const accessibleQuery = useAccessibleCatalogues(debouncedSearch);

  // Flatten infinite query pages
  const publicItems = useMemo(() => {
    return publicQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [publicQuery.data]);

  const accessibleItems = useMemo(() => {
    return accessibleQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [accessibleQuery.data]);

  // Set of manufacturer IDs linked to user for badge rendering
  const accessibleManufacturerIds = useMemo(() => {
    return new Set(accessibleItems.map((item) => item.manufacturerId));
  }, [accessibleItems]);

  const currentQuery = activeTab === 'accessible' ? accessibleQuery : publicQuery;
  const currentItems = activeTab === 'accessible' ? accessibleItems : publicItems;

  const onRefresh = () => {
    if (activeTab === 'accessible') {
      void accessibleQuery.refetch();
    } else {
      void publicQuery.refetch();
      if (canHavePersonalized) {
        void accessibleQuery.refetch();
      }
    }
  };

  const isRefreshing = currentQuery.isRefetching && !currentQuery.isFetchingNextPage;

  const renderFooter = () => {
    if (currentQuery.isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      );
    }
    return null;
  };

  return (
    <Screen edges={['top']}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('catalogue.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          rightIcon={search ? 'close-circle-outline' : undefined}
          onRightIconPress={() => setSearch('')}
          rightIconLabel={t('common.cancel')}
        />
      </View>

      {/* Tabs if user has personalized catalogues */}
      {canHavePersonalized ? (
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
            onPress={() => setActiveTab('all')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'all' }}
          >
            <Text
              style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}
            >
              {t('catalogue.tabAll')}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabButton,
              activeTab === 'accessible' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('accessible')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'accessible' }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'accessible' && styles.tabTextActive,
              ]}
            >
              {t('catalogue.tabLinked')}
              {accessibleItems.length > 0 ? ` (${accessibleItems.length})` : ''}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* List */}
      <FlatList
        data={currentItems}
        keyExtractor={(item) => item.manufacturerId}
        renderItem={({ item }) => (
          <CatalogueCard
            item={item}
            isPersonalized={accessibleManufacturerIds.has(item.manufacturerId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (currentQuery.hasNextPage && !currentQuery.isFetchingNextPage) {
            void currentQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          currentQuery.isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : currentQuery.isError ? (
            <EmptyState
              title={t('catalogue.loadError')}
              actionLabel={t('common.retry')}
              onAction={onRefresh}
            />
          ) : (
            <EmptyState
              title={
                debouncedSearch
                  ? t('catalogue.noSearchResults')
                  : activeTab === 'accessible'
                  ? t('catalogue.noLinkedCatalogues')
                  : t('catalogue.noCatalogues')
              }
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centerContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
