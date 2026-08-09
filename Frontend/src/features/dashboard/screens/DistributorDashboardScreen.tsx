import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Screen, Card, Section, LanguageToggle } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useDistributorOrderSummary,
  usePurchaseOrderCount,
} from '@/features/dashboard/hooks';
import { useCategories } from '@/features/products/hooks';
import { iconForCategory } from '@/features/products/categoryIcons';
import type { Category } from '@/types/product';
import { RecentOrders } from '@/features/orders/components/RecentOrders';
import type { HomeStackParamList, MainTabParamList } from '@/navigation/types';

/** A single labelled, tappable count in the orders-summary row. */
function SummaryStat({
  label,
  value,
  loading,
  onPress,
}: {
  label: string;
  value: number;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.statPressable}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Card style={styles.stat}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.statSpinner} />
        ) : (
          <Text style={styles.statValue}>{value}</Text>
        )}
        <Text style={styles.statLabel}>{label}</Text>
      </Card>
    </Pressable>
  );
}

/**
 * Wrapping grid of product-category tiles. Uses a wrapping View (not a
 * horizontal ScrollView) so it never nests a scroller inside the screen's
 * vertical ScrollView — nesting one stole vertical-scroll gestures and froze
 * the dashboard. Category tiles open Products (no backend category filter param
 * yet); the trailing "All Categories" tile opens the full Categories screen.
 */
function CategoryRail({
  onOpenCategory,
  onShowAll,
}: {
  onOpenCategory: (category: Category) => void;
  onShowAll: () => void;
}) {
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useCategories();

  if (isLoading) {
    return (
      <Card style={styles.chipsState}>
        <ActivityIndicator color={colors.primary} />
      </Card>
    );
  }

  if (isError || !categories || categories.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons
          name="pricetags-outline"
          size={20}
          color={colors.textMuted}
        />
        <Text style={styles.muted}>
          {t('dashboard.distributor.noCategories')}
        </Text>
      </Card>
    );
  }

  // Keep the dashboard compact: show the top 3 categories, then an
  // "All Categories" tile that opens the full Categories screen.
  const MAX_TILES = 3;

  return (
    <View style={styles.rail}>
      {categories.slice(0, MAX_TILES).map((c) => (
        <Pressable
          key={c.id}
          onPress={() => onOpenCategory(c)}
          accessibilityRole="button"
          accessibilityLabel={c.name}
          style={({ pressed }) => [styles.tilePressable, pressed && styles.tilePressed]}
        >
          <Card style={styles.tileCard}>
            <Ionicons
              name={iconForCategory(c.name)}
              size={26}
              color={colors.primary}
            />
            <Text
              style={styles.tileLabel}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {c.name}
            </Text>
          </Card>
        </Pressable>
      ))}

      <Pressable
        key="all"
        onPress={onShowAll}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.distributor.allCategories')}
        style={({ pressed }) => [styles.tilePressable, pressed && styles.tilePressed]}
      >
        <Card style={styles.tileCard}>
          <Ionicons name="grid-outline" size={26} color={colors.primary} />
          <Text
            style={styles.tileLabel}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {t('dashboard.distributor.allCategories')}
          </Text>
        </Card>
      </Pressable>
    </View>
  );
}

/**
 * Post-approval distributor home (PRD §6.2). Orders-summary counts come from
 * `GET /analytics/dashboard` (role-scoped); product categories and recent
 * orders are wired in their respective phases.
 */
export function DistributorDashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: summary, isLoading: summaryLoading } =
    useDistributorOrderSummary();
  const { data: poCount, isLoading: poLoading } = usePurchaseOrderCount();
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const goToOrder = (id: string) =>
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('Orders', {
        screen: 'OrderDetail',
        params: { id },
        // Keep the Orders list beneath so the detail has a back button.
        initial: false,
      });
  const goToOrders = (initialStatus?: string) =>
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('Orders', { screen: 'OrdersList', params: { initialStatus } });
  /** The purchase-order tile opens the list narrowed to POs, not everything. */
  const goToPurchaseOrders = () =>
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('Orders', {
        screen: 'OrdersList',
        params: { orderType: 'PURCHASE' },
      });
  // Backorders entry hidden: the backend no longer creates backorders (inventory
  // is auto-provisioned and only deducted at the final status), so the list is
  // always empty. The feature code + nav routes remain (dormant) so re-adding
  // this card is all that's needed if the backend revives backorder creation.
  const goToApprovals = () =>
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('Account', { screen: 'Approvals' });

  const [fabOpen, setFabOpen] = React.useState(false);

  return (
    <Screen
      edges={['top']}
      floatingAction={
        <View style={styles.speedDial}>
          {fabOpen ? (
            <>
              <Pressable
                style={styles.dialAction}
                onPress={() => {
                  setFabOpen(false);
                  navigation.navigate('PurchaseOrderProducts');
                }}
                accessibilityRole="button"
                accessibilityLabel={t('purchaseOrders.newOrder')}
              >
                <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                <Text style={styles.fabText}>{t('purchaseOrders.newOrder')}</Text>
              </Pressable>
              <Pressable
                style={styles.dialAction}
                onPress={() => {
                  setFabOpen(false);
                  navigation.navigate('AddProduct');
                }}
                accessibilityRole="button"
                accessibilityLabel={t('dashboard.distributor.addProduct')}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.fabText}>
                  {t('dashboard.distributor.addProduct')}
                </Text>
              </Pressable>
            </>
          ) : null}
          <Pressable
            style={styles.fab}
            onPress={() => setFabOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={t('common.actions')}
          >
            <Ionicons name={fabOpen ? 'close' : 'add'} size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      }
    >
      <View style={styles.topBar}>
        <View style={styles.greetingWrap}>
          <Text style={styles.hello}>{t('dashboard.hello')}</Text>
          <Text style={typography.h1} numberOfLines={1}>
            {user?.full_name ?? ''}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <Section title={t('dashboard.distributor.ordersSummary')}>
        <View style={styles.statsRow}>
          <SummaryStat
            label={t('dashboard.distributor.pending')}
            value={summary?.pending.count ?? 0}
            loading={summaryLoading}
            onPress={() => goToOrders(summary?.pending.statusId)}
          />
          <SummaryStat
            label={t('dashboard.distributor.approved')}
            value={summary?.approved.count ?? 0}
            loading={summaryLoading}
            onPress={() => goToOrders(summary?.approved.statusId)}
          />
          <SummaryStat
            label={t('dashboard.distributor.dispatched')}
            value={summary?.dispatched.count ?? 0}
            loading={summaryLoading}
            onPress={() => goToOrders(summary?.dispatched.statusId)}
          />
          <SummaryStat
            label={t('dashboard.distributor.purchaseOrders')}
            value={poCount?.count ?? 0}
            loading={poLoading}
            onPress={goToPurchaseOrders}
          />
        </View>
      </Section>

      <Pressable
        onPress={goToApprovals}
        accessibilityRole="button"
        accessibilityLabel={t('approvals.title')}
        style={({ pressed }) => (pressed ? styles.tilePressed : undefined)}
      >
        <Card style={styles.backorderCard}>
          <Ionicons name="checkmark-done-outline" size={24} color={colors.primary} />
          <View style={styles.backorderText}>
            <Text style={typography.title}>{t('approvals.title')}</Text>
            <Text style={styles.muted}>{t('approvals.dashboardHint')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Card>
      </Pressable>

      <Section title={t('dashboard.distributor.productCategories')}>
        <CategoryRail
          onOpenCategory={(c) =>
            navigation.navigate('Products', {
              categoryId: c.id,
              categoryName: c.name,
            })
          }
          onShowAll={() => navigation.navigate('Categories')}
        />
      </Section>

      <Section title={t('dashboard.distributor.recentOrders')}>
        <RecentOrders onOpenOrder={goToOrder} />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  greetingWrap: { flex: 1 },
  hello: { ...typography.body, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statPressable: { flex: 1 },
  stat: { alignItems: 'center', gap: spacing.xs },
  statValue: { ...typography.h2 },
  // Match the rendered height of statValue so the row doesn't jump on load.
  statSpinner: { height: typography.h2.lineHeight ?? 28 },
  statLabel: { ...typography.caption, textAlign: 'center' },
  muted: { ...typography.body, color: colors.textMuted },
  backorderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backorderText: { flex: 1, gap: 2 },
  chipsState: { alignItems: 'center' },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Row of equal-width Card tiles (max 4: up to 3 categories + All Categories),
  // matching the Orders Summary row — flex:1 divides the device width evenly.
  // Row stretches all pressables to the tallest; tileCard flex:1 makes every
  // card fill that height so they stay equal even when a label wraps to 2 lines.
  rail: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  tilePressable: { flex: 1 },
  tilePressed: { opacity: 0.6 },
  tileCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tileLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  speedDial: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  dialAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { ...typography.label, color: '#FFFFFF' },
});
