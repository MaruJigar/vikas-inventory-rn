import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Button, Card, ControlledInput, Spinner, EmptyState } from '@/components';
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
  const [isActive, setIsActive] = useState(true);

  const { control, handleSubmit } = useForm<AddSalesmanForm>({
    resolver: zodResolver(addSalesmanSchema),
    defaultValues: { full_name: '', email: '', phone: '', password: '' },
  });

  if (isLoading) return <Spinner />;
  if (isError || !distributor) {
    return (
      <Screen>
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
      { ...values, distributor_id: distributor.id, is_active: isActive },
      {
        onSuccess: () => navigation.goBack(),
        onError: (err) =>
          notify(getApiErrorMessage(err, t) || t('salesmen.form.createError')),
      },
    );
  };

  return (
    <Screen>
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

      <Card style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={typography.title}>{t('salesmen.form.active')}</Text>
          <Text style={styles.toggleHint}>
            {t('salesmen.form.activeHint')}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFFFFF"
        />
      </Card>

      <Text style={styles.approvedNote}>{t('salesmen.form.approvedNote')}</Text>

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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  toggleText: { flex: 1, gap: spacing.xs },
  toggleHint: { ...typography.caption },
  approvedNote: { ...typography.caption, marginTop: spacing.md },
  submit: { marginTop: spacing.xl },
});
