import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Screen, Card, Button, Section, Input, LanguageToggle } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
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
import { RecentOrders } from '@/features/orders/components/RecentOrders';
import type { HomeStackParamList, MainTabParamList } from '@/navigation/types';

export function SalesmanDashboardScreen() {
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

  const workingDay = useVisitStore((s) => s.workingDay);
  const activeVisit = useVisitStore((s) => s.activeVisit);
  const setWorkingDay = useVisitStore((s) => s.setWorkingDay);
  const setActiveVisit = useVisitStore((s) => s.setActiveVisit);
  const reset = useVisitStore((s) => s.reset);

  const role = useAuthStore((s) => s.user?.role);
  const isSalesman = role === 'SALESMAN';
  // Restore real check-in/visit state from the backend (cache is cleared on logout).
  const session = useVisitSession(isSalesman);

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
    <Screen edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.greetingWrap}>
          <Text style={styles.hello}>{t('dashboard.hello')}</Text>
          <Text style={typography.h1} numberOfLines={1}>
            {user?.full_name ?? ''}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      {isSalesman ? (
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
        <View style={styles.actionRow}>
          <Button
            label={
              checkedIn
                ? t('dashboard.salesman.checkOut')
                : t('dashboard.salesman.checkIn')
            }
            variant={checkedIn ? 'danger' : 'primary'}
            loading={busy || session.isLoading}
            onPress={() => void (checkedIn ? runCheckOut() : runCheckIn())}
            style={styles.rowBtn}
          />
          <Button
            label={`${t('dashboard.salesman.startVisit')}  →`}
            variant="secondary"
            disabled={!checkedIn || !!activeVisit}
            onPress={() => navigation.navigate('SelectShop')}
            style={styles.rowBtn}
          />
        </View>
      </Card>
      ) : null}

      {isSalesman && activeVisit ? (
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
      ) : null}

      <Pressable onPress={() => navigation.navigate('Products')}>
        <Card style={styles.browseCard}>
          <View style={styles.browseLeft}>
            <View style={styles.browseIcon}>
              <Ionicons name="cube-outline" size={22} color={colors.primary} />
            </View>
            <Text style={typography.title}>
              {t('dashboard.salesman.browseProducts')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Card>
      </Pressable>

      <Section title={t('dashboard.salesman.recentOrders')}>
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
  checkInCard: { marginTop: spacing.lg, gap: spacing.md },
  checkInStatus: { ...typography.body, color: colors.textMuted },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  rowBtn: { flex: 1 },
  visitCard: { marginTop: spacing.lg, gap: spacing.sm },
  visitLabel: { ...typography.label, color: colors.success },
  visitAction: { marginTop: spacing.sm },
  endBox: { marginTop: spacing.sm, gap: spacing.sm },
  startVisit: { marginTop: spacing.lg },
  browseCard: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  browseLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  browseIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: { ...typography.body, color: colors.textMuted },
});
