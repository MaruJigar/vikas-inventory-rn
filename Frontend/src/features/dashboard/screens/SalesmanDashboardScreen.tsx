import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen, Card, Button, Section, Input, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useVisitStore } from '@/store/useVisitStore';
import { getCurrentCoords, type CoordsResult } from '@/lib/location';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import {
  useCheckIn,
  useCheckOut,
  useNoOrderVisit,
  useVisitSession,
} from '@/features/visit/hooks';
import type { HomeStackParamList } from '@/navigation/types';

export function SalesmanDashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const workingDay = useVisitStore((s) => s.workingDay);
  const activeVisit = useVisitStore((s) => s.activeVisit);
  const setWorkingDay = useVisitStore((s) => s.setWorkingDay);
  const setActiveVisit = useVisitStore((s) => s.setActiveVisit);
  const reset = useVisitStore((s) => s.reset);

  const role = useAuthStore((s) => s.user?.role);
  // Restore real check-in/visit state from the backend (cache is cleared on logout).
  const session = useVisitSession(role === 'SALESMAN');

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const noOrder = useNoOrderVisit();

  const [locating, setLocating] = useState(false);
  const [ending, setEnding] = useState(false);
  const [reason, setReason] = useState('');

  const checkedIn = !!workingDay;
  const busy = locating || checkIn.isPending || checkOut.isPending;

  const gpsMessage = (reason: Exclude<CoordsResult, { ok: true }>['reason']) =>
    reason === 'insecure'
      ? t('visit.gps.insecure')
      : reason === 'permission'
        ? t('visit.gps.permission')
        : t('visit.gps.error');

  const runCheckIn = async () => {
    setLocating(true);
    const res = await getCurrentCoords();
    setLocating(false);
    if (!res.ok) return notify(gpsMessage(res.reason));
    checkIn.mutate(res.coords, {
      onSuccess: (wd) =>
        setWorkingDay({ id: wd.id, checkedInAt: wd.check_in_at }),
      onError: (e) => notify(getApiErrorMessage(e, t)),
    });
  };

  const runCheckOut = async () => {
    setLocating(true);
    const res = await getCurrentCoords();
    setLocating(false);
    if (!res.ok) return notify(gpsMessage(res.reason));
    checkOut.mutate(res.coords, {
      onSuccess: () => reset(),
      onError: (e) => notify(getApiErrorMessage(e, t)),
    });
  };

  const confirmNoOrder = () => {
    if (!activeVisit || !reason.trim()) return;
    noOrder.mutate(
      { visitId: activeVisit.visitId, reason: reason.trim() },
      {
        onSuccess: () => {
          setActiveVisit(null);
          setEnding(false);
          setReason('');
        },
        onError: (e) => notify(getApiErrorMessage(e, t)),
      },
    );
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <Text style={typography.h1}>
          {t('dashboard.greeting', { name: user?.full_name ?? '' })}
        </Text>
        <LanguageToggle />
      </View>

      <Card style={styles.checkInCard}>
        <Text style={styles.checkInStatus}>
          {session.isLoading
            ? t('common.loading')
            : checkedIn
              ? t('dashboard.salesman.checkedInAt', {
                  time: new Date(workingDay.checkedInAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                })
              : t('dashboard.salesman.notCheckedIn')}
        </Text>
        <Button
          label={
            checkedIn
              ? t('dashboard.salesman.checkOut')
              : t('dashboard.salesman.checkIn')
          }
          variant={checkedIn ? 'danger' : 'primary'}
          loading={busy || session.isLoading}
          onPress={() => void (checkedIn ? runCheckOut() : runCheckIn())}
        />
      </Card>

      {activeVisit ? (
        <Card style={styles.visitCard}>
          <Text style={styles.visitLabel}>{t('visit.activeVisit')}</Text>
          <Text style={typography.title}>{activeVisit.shopName}</Text>
          <Button
            label={t('visit.addProducts')}
            onPress={() => navigation.navigate('Products')}
            style={styles.visitAction}
          />
          {ending ? (
            <View style={styles.endBox}>
              <Input
                value={reason}
                onChangeText={setReason}
                placeholder={t('visit.noOrderReason')}
                maxLength={20}
              />
              <Button
                label={t('visit.confirmNoOrder')}
                variant="danger"
                loading={noOrder.isPending}
                disabled={!reason.trim()}
                onPress={confirmNoOrder}
              />
            </View>
          ) : (
            <Button
              label={t('visit.endNoOrder')}
              variant="secondary"
              onPress={() => setEnding(true)}
              style={styles.visitAction}
            />
          )}
        </Card>
      ) : (
        <Button
          label={t('dashboard.salesman.startVisit')}
          variant="secondary"
          disabled={!checkedIn}
          onPress={() => navigation.navigate('SelectShop')}
          style={styles.startVisit}
        />
      )}

      <Button
        label={t('dashboard.salesman.browseProducts')}
        variant="secondary"
        onPress={() => navigation.navigate('Products')}
        style={styles.browse}
      />

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
  checkInStatus: { ...typography.body, color: colors.textMuted },
  visitCard: { marginTop: spacing.lg, gap: spacing.sm },
  visitLabel: { ...typography.label, color: colors.success },
  visitAction: { marginTop: spacing.sm },
  endBox: { marginTop: spacing.sm, gap: spacing.sm },
  startVisit: { marginTop: spacing.lg },
  browse: { marginTop: spacing.md },
  muted: { ...typography.body, color: colors.textMuted },
});
