import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen, Card, Button, Section, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import type { HomeStackParamList } from '@/navigation/types';

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

  return (
    <Screen>
      <View style={styles.topBar}>
        <Text style={typography.h1}>
          {t('dashboard.greeting', { name: user?.full_name ?? '' })}
        </Text>
        <LanguageToggle />
      </View>

      <Button
        label={`+  ${t('dashboard.distributor.newOrder')}`}
        style={styles.newOrder}
        onPress={() => navigation.navigate('Products')}
      />

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
        <Card>
          <Text style={styles.muted}>
            {t('dashboard.distributor.noRecentOrders')}
          </Text>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  newOrder: { marginTop: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, textAlign: 'center' },
  muted: { ...typography.body, color: colors.textMuted },
});
