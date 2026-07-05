import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Button, ControlledInput, Spinner, EmptyState } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { useDistributorProfile } from '@/features/distributor/hooks';
import { addSalesmanSchema, type AddSalesmanForm } from '@/features/salesman/schemas';
import { useCreateSalesman } from '@/features/salesman/hooks';
import type { AccountScreenProps } from '@/navigation/types';

export function AddSalesmanScreen({
  navigation,
}: AccountScreenProps<'AddSalesman'>) {
  const { t } = useTranslation();
  const { data: distributor, isLoading, isError, refetch } =
    useDistributorProfile();
  const createSalesman = useCreateSalesman();

  const { control, handleSubmit } = useForm<AddSalesmanForm>({
    resolver: zodResolver(addSalesmanSchema),
    defaultValues: { full_name: '', email: '', phone: '', password: '' },
  });

  if (isLoading) return <Spinner />;
  if (isError || !distributor) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('salesmen.profileError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const onSubmit = (values: AddSalesmanForm) => {
    createSalesman.mutate(
      { ...values, distributor_id: distributor.id },
      {
        onSuccess: () => navigation.goBack(),
        onError: (err) =>
          notify(getApiErrorMessage(err, t) || t('salesmen.form.createError')),
      },
    );
  };

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>{t('salesmen.form.title')}</Text>
      <Text style={styles.subtitle}>{t('salesmen.form.subtitle')}</Text>

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
      <ControlledInput
        control={control}
        name="password"
        label={t('salesmen.form.password')}
        secureTextEntry
      />

      <Button
        label={t('salesmen.form.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={createSalesman.isPending}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  submit: { marginTop: spacing.xl },
});
