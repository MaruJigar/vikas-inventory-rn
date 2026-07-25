import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, EmptyState, Spinner } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { formatDateTime } from '@/lib/date';
import { useApprovals } from '@/features/approvals/hooks';
import {
  APPROVAL_STATUSES,
  approvalStatusColor,
  approvalStatusLabel,
  approvalSubject,
  approvalTypeIcon,
  approvalTypeLabel,
} from '@/features/approvals/constants';
import type { ApprovalRequest, ApprovalStatus } from '@/features/approvals/types';
import type { AccountScreenProps } from '@/navigation/types';

export function ApprovalsListScreen({
  navigation,
}: AccountScreenProps<'Approvals'>) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ApprovalStatus>('PENDING_APPROVAL');

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useApprovals(status);
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const approvals = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const renderItem = ({ item }: { item: ApprovalRequest }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('ApprovalDetail', {
          id: item.id,
          subject: approvalSubject(item),
        })
      }
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.titleRow}>
            <Ionicons
              name={approvalTypeIcon(item.request_type)}
              size={18}
              color={colors.primary}
            />
            <Text style={typography.title} numberOfLines={1}>
              {approvalSubject(item) ?? approvalTypeLabel(t, item.request_type)}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: approvalStatusColor(item.status) },
            ]}
          >
            <Text style={styles.badgeText}>
              {approvalStatusLabel(t, item.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.muted} numberOfLines={1}>
          {approvalTypeLabel(t, item.request_type)}
          {item.requester_name
            ? ` · ${t('approvals.byRequester', { name: item.requester_name })}`
            : ''}
        </Text>
        <Text style={styles.date}>
          {formatDateTime(item.created_at)}
        </Text>
      </Card>
    </Pressable>
  );

  return (
    <Screen scroll={false} edges={[]}>
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {APPROVAL_STATUSES.map((s) => (
            <Chip
              key={s}
              label={approvalStatusLabel(t, s)}
              active={status === s}
              onPress={() => setStatus(s)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <EmptyState
          title={t('approvals.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={approvals}
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
              title={
                status === 'PENDING_APPROVAL'
                  ? t('approvals.empty')
                  : t('approvals.noResults')
              }
              message={
                status === 'PENDING_APPROVAL'
                  ? t('approvals.emptyHint')
                  : undefined
              }
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

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: { marginTop: spacing.sm, marginBottom: spacing.sm },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.text },
  chipTextActive: { color: '#FFFFFF' },
  card: { marginBottom: spacing.md, gap: spacing.xs },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  muted: { ...typography.body, color: colors.textMuted },
  date: { ...typography.caption, color: colors.textMuted },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
  listContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
});
