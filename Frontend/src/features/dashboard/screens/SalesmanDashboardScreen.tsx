import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen, Card, Button, Section, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import type { HomeStackParamList } from '@/navigation/types';

/**
 * Post-approval salesman home (PRD §6.1). Phase 2 builds the layout shell;
 * GPS check-in, visit area, nearby shops and recent orders are wired to the
 * backend in their respective later phases. The check-in toggle is local
 * state for now so the Start Visit affordance can be demonstrated.
 */
export function SalesmanDashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Text style={typography.h1}>
          {t('dashboard.greeting', { name: user?.full_name ?? '' })}
        </Text>
        <LanguageToggle />
      </View>

      <Card style={styles.checkInCard}>
        <View style={styles.checkInRow}>
          <Text style={styles.checkInStatus}>
            {checkedIn
              ? t('dashboard.salesman.checkedInAt', {
                  time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                })
              : t('dashboard.salesman.todaysVisitArea')}
          </Text>
        </View>
        <Button
          label={
            checkedIn
              ? t('dashboard.salesman.checkOut')
              : t('dashboard.salesman.checkIn')
          }
          variant={checkedIn ? 'danger' : 'primary'}
          onPress={() => setCheckedIn((v) => !v)}
        />
      </Card>

      <Section title={t('dashboard.salesman.todaysVisitArea')}>
        <Card>
          <Text style={styles.muted}>{t('dashboard.salesman.noVisitArea')}</Text>
        </Card>
      </Section>

      <Button
        label={t('dashboard.salesman.startVisit')}
        variant="secondary"
        disabled={!checkedIn}
        style={styles.startVisit}
      />

      <Button
        label={t('dashboard.salesman.browseProducts')}
        variant="secondary"
        onPress={() => navigation.navigate('Products')}
        style={styles.browse}
      />

      <Section title={t('dashboard.salesman.nearbyShops')}>
        <Card>
          <Text style={styles.muted}>
            {t('dashboard.salesman.noNearbyShops')}
          </Text>
        </Card>
      </Section>

      <Section title={t('dashboard.salesman.recentOrders')}>
        <Card>
          <Text style={styles.muted}>
            {t('dashboard.salesman.noRecentOrders')}
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
  checkInCard: { marginTop: spacing.lg, gap: spacing.md },
  checkInRow: { flexDirection: 'row', alignItems: 'center' },
  checkInStatus: { ...typography.body, color: colors.textMuted },
  startVisit: { marginTop: spacing.lg },
  browse: { marginTop: spacing.md },
  muted: { ...typography.body, color: colors.textMuted },
});
