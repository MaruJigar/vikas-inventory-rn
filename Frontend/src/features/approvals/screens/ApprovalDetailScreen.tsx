import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Spinner, EmptyState, Section, Button, Input } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { confirmAction, notify } from '@/lib/dialog';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/date';
import { useApproval, useReviewApproval } from '@/features/approvals/hooks';
import {
  approvalStatusColor,
  approvalStatusLabel,
  approvalTypeIcon,
  approvalTypeLabel,
} from '@/features/approvals/constants';
import type { AccountScreenProps } from '@/navigation/types';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function ApprovalDetailScreen({
  route,
  navigation,
}: AccountScreenProps<'ApprovalDetail'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const { data, isLoading, isError, refetch } = useApproval(id);
  const review = useReviewApproval(id);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (isLoading) return <Spinner />;
  if (isError || !data) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('approvals.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const { request, logs, entity, requester } = data;
  const entityName =
    (entity?.name as string | undefined) ??
    (entity?.full_name as string | undefined) ??
    route.params.subject ??
    undefined;
  const isPending = request.status === 'PENDING_APPROVAL';

  const onApprove = () =>
    confirmAction({
      title: t('approvals.approveTitle'),
      message: t('approvals.approveMessage'),
      confirmLabel: t('approvals.approve'),
      cancelLabel: t('common.cancel'),
      onConfirm: () =>
        review.mutate(
          { status: 'APPROVED' },
          {
            onSuccess: () => navigation.goBack(),
            onError: (e) =>
              notify(getApiErrorMessage(e, t) || t('approvals.reviewError')),
          },
        ),
    });

  const onReject = () => {
    if (!reason.trim()) {
      notify(t('approvals.reasonRequired'));
      return;
    }
    review.mutate(
      { status: 'REJECTED', rejection_reason: reason.trim() },
      {
        onSuccess: () => navigation.goBack(),
        onError: (e) =>
          notify(getApiErrorMessage(e, t) || t('approvals.reviewError')),
      },
    );
  };

  return (
    <Screen edges={[]}>
      <View style={styles.header}>
        <Ionicons
          name={approvalTypeIcon(request.request_type)}
          size={22}
          color={colors.primary}
        />
        <Text style={[typography.h1, styles.headerText]} numberOfLines={2}>
          {entityName ?? approvalTypeLabel(t, request.request_type)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: approvalStatusColor(request.status) },
          ]}
        >
          <Text style={styles.badgeText}>
            {approvalStatusLabel(t, request.status)}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDateTime(request.created_at)}
        </Text>
      </View>

      <Card style={styles.summary}>
        <Row
          label={t('approvals.detail.type')}
          value={approvalTypeLabel(t, request.request_type)}
        />
        {entityName ? (
          <Row label={t('approvals.detail.subject')} value={entityName} />
        ) : null}
        {request.rejection_reason ? (
          <Row
            label={t('approvals.detail.rejectionReason')}
            value={request.rejection_reason}
          />
        ) : null}
      </Card>

      {requester ? (
        <Section title={t('approvals.detail.requestedBy')}>
          <Card style={styles.summary}>
            <Row label={t('approvals.detail.name')} value={requester.full_name} />
            {requester.email ? (
              <Row label={t('approvals.detail.email')} value={requester.email} />
            ) : null}
            {requester.phone ? (
              <Row label={t('approvals.detail.phone')} value={requester.phone} />
            ) : null}
          </Card>
        </Section>
      ) : null}

      {isPending ? (
        <View style={styles.actions}>
          {!rejecting ? (
            <>
              <Button
                label={t('approvals.approve')}
                icon="checkmark-circle-outline"
                loading={review.isPending}
                onPress={onApprove}
              />
              <Button
                label={t('approvals.reject')}
                variant="secondary"
                onPress={() => setRejecting(true)}
                style={styles.rejectBtn}
              />
            </>
          ) : (
            <Card style={styles.rejectBox}>
              <Text style={styles.rejectLabel}>
                {t('approvals.reasonLabel')}
              </Text>
              <Input
                value={reason}
                onChangeText={setReason}
                placeholder={t('approvals.reasonPlaceholder')}
                multiline
                maxLength={200}
                autoFocus
              />
              <View style={styles.rejectRow}>
                <Button
                  label={t('common.back')}
                  variant="secondary"
                  style={styles.flex1}
                  onPress={() => {
                    setRejecting(false);
                    setReason('');
                  }}
                />
                <Button
                  label={t('approvals.reject')}
                  style={styles.flex1}
                  loading={review.isPending}
                  onPress={onReject}
                />
              </View>
            </Card>
          )}
        </View>
      ) : null}

      {logs.length > 0 ? (
        <Section title={t('approvals.detail.history')}>
          <Card style={styles.summary}>
            {logs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logAction}>
                  {log.new_status
                    ? approvalStatusLabel(t, log.new_status)
                    : log.action}
                </Text>
                <Text style={styles.muted}>
                  {log.acted_by_user_name ?? t('approvals.system')} ·{' '}
                  {formatDateTime(log.created_at)}
                </Text>
                {log.reason ? (
                  <Text style={styles.logReason}>{log.reason}</Text>
                ) : null}
              </View>
            ))}
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  headerText: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  date: { ...typography.caption, color: colors.textMuted },
  summary: { marginTop: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.body, flex: 1, textAlign: 'right' },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  rejectBtn: { marginTop: spacing.sm },
  rejectBox: { gap: spacing.sm },
  rejectLabel: { ...typography.label, color: colors.text },
  rejectRow: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  muted: { ...typography.caption, color: colors.textMuted },
  logRow: { gap: 2 },
  logAction: { ...typography.title },
  logReason: { ...typography.body, color: colors.textMuted },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
});
