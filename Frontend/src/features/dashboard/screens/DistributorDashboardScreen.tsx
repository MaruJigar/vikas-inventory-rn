import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Screen, Card, Section, LanguageToggle } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { RecentOrders } from '@/features/orders/components/RecentOrders';
import type { HomeStackParamList, MainTabParamList } from '@/navigation/types';

/** A single labelled count in the orders-summary row. */
function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

/**
 * Post-approval distributor home (PRD §6.2). Phase 2 builds the layout shell;
 * order counts, product categories and recent orders are wired to the backend
 * in their respective later phases (counts shown as 0 placeholders).
 */
export function DistributorDashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
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

  return (
    <Screen
      edges={['top']}
      floatingAction={
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate('Products')}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.distributor.newOrder')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.fabText}>
            {t('dashboard.distributor.newOrder')}
          </Text>
        </Pressable>
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
          <SummaryStat label={t('dashboard.distributor.pending')} value={0} />
          <SummaryStat label={t('dashboard.distributor.approved')} value={0} />
          <SummaryStat label={t('dashboard.distributor.dispatched')} value={0} />
        </View>
      </Section>

      <Section title={t('dashboard.distributor.productCategories')}>
        <Card>
          <Text style={styles.muted}>
            {t('dashboard.distributor.noCategories')}
          </Text>
        </Card>
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
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, textAlign: 'center' },
  muted: { ...typography.body, color: colors.textMuted },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { ...typography.label, color: '#FFFFFF' },
});
