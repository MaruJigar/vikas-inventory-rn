import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Spinner, EmptyState, Section, Button, Input } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { confirmAction, notify } from '@/lib/dialog';
import { formatDateTime } from '@/lib/date';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useBackorder,
  useResolveBackorder,
} from '@/features/backorders/hooks';
import {
  backorderStatusColor,
  backorderStatusLabel,
  isResolvable,
  unfulfilledQty,
} from '@/features/backorders/constants';
import { toNum } from '@/features/orders/constants';
import type { OrdersScreenProps } from '@/navigation/types';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function BackorderDetailScreen({
  route,
}: OrdersScreenProps<'BackorderDetail'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const role = useAuthStore((s) => s.user?.role);
  const { data: bo, isLoading, isError, refetch } = useBackorder(id);
  const allocate = useResolveBackorder(id);
  const [allocating, setAllocating] = useState(false);
  const [qty, setQty] = useState('');

  if (isLoading) return <Spinner />;
  if (isError || !bo) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('backorders.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const owed = unfulfilledQty(bo);
  const isDistributor = role === 'DISTRIBUTOR_ADMIN' || role === 'SUPER_ADMIN';
  const canAllocate = isDistributor && isResolvable(bo);

  const onSubmit = () => {
    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n < 1) {
      notify(t('backorders.allocate.invalidQty'));
      return;
    }
    if (n > owed) {
      notify(t('backorders.allocate.tooMany', { max: owed }));
      return;
    }
    confirmAction({
      title: t('backorders.allocate.confirmTitle'),
      message: t('backorders.allocate.confirmMessage', { qty: n }),
      confirmLabel: t('common.continue'),
      cancelLabel: t('common.cancel'),
      onConfirm: () =>
        allocate.mutate(
          { resolved_quantity: n },
          {
            onSuccess: () => {
              setAllocating(false);
              setQty('');
            },
            onError: () => notify(t('backorders.allocate.error')),
          },
        ),
    });
  };

  return (
    <Screen edges={[]}>
      <View style={styles.header}>
        <Text style={typography.h1} numberOfLines={2}>
          {bo.product?.name ?? t('backorders.unknownProduct')}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: backorderStatusColor(bo.status) },
          ]}
        >
          <Text style={styles.badgeText}>
            {backorderStatusLabel(t, bo.status)}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDateTime(bo.created_at)}
        </Text>
      </View>

      <Card style={styles.summary}>
        <Row
          label={t('backorders.detail.ordered')}
          value={String(toNum(bo.quantity))}
        />
        <Row
          label={t('backorders.detail.allocated')}
          value={String(toNum(bo.resolved_quantity))}
        />
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.strong}>{t('backorders.detail.owed')}</Text>
          <Text style={styles.strong}>{String(owed)}</Text>
        </View>
      </Card>

      {canAllocate ? (
        <View style={styles.actions}>
          {!allocating ? (
            <Button
              label={t('backorders.allocate.action')}
              icon="cube-outline"
              onPress={() => {
                setQty(String(owed));
                setAllocating(true);
              }}
            />
          ) : (
            <Card style={styles.allocateBox}>
              <Text style={styles.allocateLabel}>
                {t('backorders.allocate.qtyLabel', { max: owed })}
              </Text>
              <Input
                value={qty}
                onChangeText={setQty}
                keyboardType="number-pad"
                placeholder={String(owed)}
                autoFocus
              />
              <View style={styles.allocateRow}>
                <Button
                  label={t('common.back')}
                  variant="secondary"
                  style={styles.flex1}
                  onPress={() => {
                    setAllocating(false);
                    setQty('');
                  }}
                />
                <Button
                  label={t('backorders.allocate.confirm')}
                  style={styles.flex1}
                  loading={allocate.isPending}
                  disabled={!qty.trim()}
                  onPress={onSubmit}
                />
              </View>
            </Card>
          )}
        </View>
      ) : null}

      {bo.order ? (
        <Section title={t('backorders.detail.order')}>
          <Card style={styles.orderCard}>
            <Row
              label={t('backorders.detail.orderNumber')}
              value={bo.order.order_number}
            />
            {bo.order.shop ? (
              <Row
                label={t('backorders.detail.shop')}
                value={bo.order.shop.name}
              />
            ) : null}
            {bo.order.salesman ? (
              <Row
                label={t('backorders.detail.salesman')}
                value={bo.order.salesman.full_name}
              />
            ) : null}
          </Card>
        </Section>
      ) : null}

      {bo.resolved_at ? (
        <Text style={styles.resolvedAt}>
          {t('backorders.detail.resolvedAt', {
            when: formatDateTime(bo.resolved_at),
          })}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  date: { ...typography.caption },
  summary: { marginTop: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.body },
  strong: { ...typography.title, color: colors.text },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  allocateBox: { gap: spacing.sm },
  allocateLabel: { ...typography.label, color: colors.text },
  allocateRow: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  orderCard: { gap: spacing.sm },
  resolvedAt: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: '#FFFFFF' },
});
