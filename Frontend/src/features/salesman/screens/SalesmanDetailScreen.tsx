import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, ControlledInput, Spinner, EmptyState } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import {
  editSalesmanSchema,
  type EditSalesmanForm,
} from '@/features/salesman/schemas';
import { useSalesman, useUpdateSalesman } from '@/features/salesman/hooks';
import type { Salesman } from '@/types/salesman';
import type { AccountScreenProps } from '@/navigation/types';

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

  const { control, handleSubmit } = useForm<EditSalesmanForm>({
    resolver: zodResolver(editSalesmanSchema),
    defaultValues: {
      full_name: salesman.full_name,
      email: salesman.email ?? '',
      phone: salesman.phone ?? '',
    },
  });

  const onSubmit = (values: EditSalesmanForm) =>
    update.mutate(values, {
      onSuccess: onSaved,
      onError: (err) => notify(getApiErrorMessage(err, t)),
    });

  return (
    <>
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t('salesmen.detail.status')}</Text>
          <Text style={styles.statusValue}>
            {salesman.is_active ? t('salesmen.active') : t('salesmen.inactive')}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t('salesmen.detail.approval')}</Text>
          <Text style={styles.statusValue}>{salesman.approval_status}</Text>
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
      <Text style={styles.note}>{t('salesmen.detail.statusNote')}</Text>
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
      <Screen edges={[]}>
        <EmptyState
          title={t('salesmen.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>{salesman.full_name}</Text>
      <EditForm salesman={salesman} onSaved={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  statusCard: { gap: spacing.sm, marginBottom: spacing.lg },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusLabel: { ...typography.label },
  statusValue: { ...typography.body },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  save: { marginTop: spacing.lg },
  note: { ...typography.caption, marginTop: spacing.md, textAlign: 'center' },
});
