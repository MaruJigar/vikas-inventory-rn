import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { formatTime } from '@/lib/date';
import { useAuthStore } from '@/store/useAuthStore';
import { useAttendance } from '@/features/attendance/hooks';
import type { WorkingDay } from '@/features/attendance/types';
import type { AccountScreenProps } from '@/navigation/types';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
const fmtTime = formatTime;

export function AttendanceScreen({}: AccountScreenProps<'Attendance'>) {
  const { t } = useTranslation();
  const isDistributor =
    useAuthStore((s) => s.user?.role) === 'DISTRIBUTOR_ADMIN';

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAttendance();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const rows = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const renderItem = ({ item }: { item: WorkingDay }) => {
    const active = item.status === 'ACTIVE' || !item.check_out_at;
    return (
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={typography.title}>{fmtDate(item.check_in_at)}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: active ? colors.warning : colors.success },
            ]}
          >
            <Text style={styles.badgeText}>
              {active
                ? t('attendance.active')
                : t('attendance.completed')}
            </Text>
          </View>
        </View>

        {isDistributor && item.salesman ? (
          <Text style={styles.muted}>{item.salesman.full_name}</Text>
        ) : null}

        <View style={styles.times}>
          <View style={styles.timeCol}>
            <Ionicons name="log-in-outline" size={16} color={colors.textMuted} />
            <Text style={styles.timeText}>{fmtTime(item.check_in_at)}</Text>
          </View>
          <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
          <View style={styles.timeCol}>
            <Ionicons
              name="log-out-outline"
              size={16}
              color={colors.textMuted}
            />
            <Text style={styles.timeText}>
              {item.check_out_at ? fmtTime(item.check_out_at) : '—'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <Screen scroll={false} edges={[]}>
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('attendance.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={rows}
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
              title={t('attendance.empty')}
              message={t('attendance.emptyHint')}
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
  listContent: { paddingTop: spacing.sm, paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
  card: { marginBottom: spacing.md, gap: spacing.xs },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muted: { ...typography.body, color: colors.textMuted },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  timeCol: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  timeText: { ...typography.body },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
});
