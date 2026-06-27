import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, ControlledInput, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import {
  editSalesmanSchema,
  type EditSalesmanForm,
} from '@/features/salesman/schemas';
import { useSalesman, useUpdateSalesman } from '@/features/salesman/hooks';
import type { ApprovalStatus, Salesman } from '@/types/salesman';
import type { AccountScreenProps } from '@/navigation/types';

const APPROVAL_OPTIONS: ApprovalStatus[] = [
  'APPROVED',
  'PENDING_APPROVAL',
  'REJECTED',
];

/** Inner form — mounted only once the salesman has loaded (stable defaults). */
function EditForm({
  salesman,
  onSaved,
}: {
  salesman: Salesman;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const update = useUpdateSalesman(salesman.id);
  const [isActive, setIsActive] = useState(salesman.is_active);
  const [approval, setApproval] = useState<ApprovalStatus>(
    (salesman.approval_status as ApprovalStatus) ?? 'PENDING_APPROVAL',
  );

  const { control, handleSubmit } = useForm<EditSalesmanForm>({
    resolver: zodResolver(editSalesmanSchema),
    defaultValues: {
      full_name: salesman.full_name,
      email: salesman.email ?? '',
      phone: salesman.phone ?? '',
    },
  });

  const onSubmit = (values: EditSalesmanForm) =>
    update.mutate(
      { ...values, is_active: isActive, approval_status: approval },
      {
        onSuccess: onSaved,
        onError: (err) => notify(getApiErrorMessage(err, t)),
      },
    );

  const approvalLabel = (s: ApprovalStatus) =>
    s === 'APPROVED'
      ? t('salesmen.approval.approved')
      : s === 'REJECTED'
        ? t('salesmen.approval.rejected')
        : t('salesmen.approval.pending');

  return (
    <>
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={typography.title}>{t('salesmen.detail.status')}</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.approvalLabel}>{t('salesmen.detail.approval')}</Text>
        <View style={styles.pills}>
          {APPROVAL_OPTIONS.map((option) => {
            const selected = approval === option;
            return (
              <Pressable
                key={option}
                onPress={() => setApproval(option)}
                style={[styles.pill, selected && styles.pillSelected]}
              >
                <Text
                  style={[
                    styles.pillText,
                    selected && styles.pillTextSelected,
                  ]}
                >
                  {approvalLabel(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text style={styles.sectionLabel}>{t('salesmen.detail.editTitle')}</Text>
      <ControlledInput
        control={control}
        name="full_name"
        label={t('salesmen.form.fullName')}
      />
      <ControlledInput
        control={control}
        name="email"
        label={t('salesmen.form.email')}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ControlledInput
        control={control}
        name="phone"
        label={t('salesmen.form.phone')}
        keyboardType="phone-pad"
      />

      <Button
        label={t('salesmen.detail.save')}
        onPress={handleSubmit(onSubmit)}
        loading={update.isPending}
        style={styles.save}
      />
    </>
  );
}

export function SalesmanDetailScreen({
  route,
  navigation,
}: AccountScreenProps<'SalesmanDetail'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const { data: salesman, isLoading, isError, refetch } = useSalesman(id);

  if (isLoading) return <Spinner />;
  if (isError || !salesman) {
    return (
      <Screen>
        <EmptyState
          title={t('salesmen.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={[typography.h1, styles.title]}>{salesman.full_name}</Text>
      <EditForm salesman={salesman} onSaved={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  statusCard: { gap: spacing.md, marginBottom: spacing.lg },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  approvalLabel: { ...typography.label },
  pills: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: { ...typography.label, color: colors.text },
  pillTextSelected: { color: '#FFFFFF' },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  save: { marginTop: spacing.lg },
});
