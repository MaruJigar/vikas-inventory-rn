import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import {
  Screen,
  Button,
  ControlledInput,
  Select,
  Spinner,
  EmptyState,
} from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { useDistributorProfile } from '@/features/distributor/hooks';
import { useCities, useStates } from '@/features/region/hooks';
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

  const { control, handleSubmit, watch, setValue } = useForm<AddSalesmanForm>({
    resolver: zodResolver(addSalesmanSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      state_id: '',
      city_id: '',
    },
  });

  const stateId = watch('state_id');
  const statesQuery = useStates();
  const citiesQuery = useCities(stateId || undefined);
  const stateOptions = useMemo(
    () => (statesQuery.data ?? []).map((s) => ({ label: s.name, value: s.id })),
    [statesQuery.data],
  );
  const cityOptions = useMemo(
    () => (citiesQuery.data ?? []).map((c) => ({ label: c.name, value: c.id })),
    [citiesQuery.data],
  );

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
    const stateName =
      stateOptions.find((o) => o.value === values.state_id)?.label ?? '';
    const cityName = values.city_id
      ? cityOptions.find((o) => o.value === values.city_id)?.label
      : undefined;
    createSalesman.mutate(
      {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        distributor_id: distributor.id,
        state_id: values.state_id,
        state: stateName,
        ...(values.city_id ? { city_id: values.city_id, city: cityName } : {}),
      },
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

      <Controller
        control={control}
        name="state_id"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <Select
            label={t('salesmen.form.state')}
            placeholder={t('salesmen.form.selectState')}
            value={value}
            options={stateOptions}
            loading={statesQuery.isLoading}
            searchable
            searchPlaceholder={t('salesmen.form.searchState')}
            emptyText={t('salesmen.form.noStates')}
            onChange={(v) => {
              onChange(v);
              setValue('city_id', '', { shouldValidate: false });
            }}
            error={error?.message ? t(error.message) : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="city_id"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <Select
            label={t('salesmen.form.city')}
            placeholder={t('salesmen.form.selectCity')}
            value={value}
            options={cityOptions}
            loading={citiesQuery.isLoading}
            disabled={!stateId}
            searchable
            searchPlaceholder={t('salesmen.form.searchCity')}
            emptyText={t('salesmen.form.noCities')}
            onChange={onChange}
            error={error?.message ? t(error.message) : undefined}
          />
        )}
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
