import React, { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import {
  Screen,
  Card,
  Button,
  ControlledInput,
  Select,
  Spinner,
  EmptyState,
} from '@/components';
import { useCities, useStates } from '@/features/region/hooks';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { confirmAction, notify } from '@/lib/dialog';
import {
  editSalesmanSchema,
  type EditSalesmanForm,
} from '@/features/salesman/schemas';
import {
  useSalesman,
  useUpdateSalesman,
  useUpdateSalesmanStatus,
} from '@/features/salesman/hooks';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { Salesman } from '@/types/salesman';
import type {
  AccountScreenProps,
  MainTabParamList,
} from '@/navigation/types';

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
  const status = useUpdateSalesmanStatus(salesman.id);
  // The Switch only changes this locally; it's persisted on "Save changes".
  const [isActive, setIsActive] = useState(salesman.is_active);
  const saving = update.isPending || status.isPending;

  const { control, handleSubmit, watch, setValue } = useForm<EditSalesmanForm>({
    resolver: zodResolver(editSalesmanSchema),
    defaultValues: {
      full_name: salesman.full_name,
      email: salesman.email ?? '',
      phone: salesman.phone ?? '',
      state_id: salesman.state_id ?? '',
      city_id: salesman.city_id ?? '',
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

  const onSubmit = (values: EditSalesmanForm) => {
    const statusChanged = isActive !== salesman.is_active;
    const stateName = values.state_id
      ? stateOptions.find((o) => o.value === values.state_id)?.label
      : undefined;
    const cityName = values.city_id
      ? cityOptions.find((o) => o.value === values.city_id)?.label
      : undefined;
    const payload = {
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      ...(values.state_id
        ? { state_id: values.state_id, state: stateName }
        : {}),
      ...(values.city_id ? { city_id: values.city_id, city: cityName } : {}),
    };

    // Persist details (PUT) and, if it changed, the active/inactive status
    // (PATCH) together as a single save.
    const run = async () => {
      try {
        await update.mutateAsync(payload);
        if (statusChanged) await status.mutateAsync({ is_active: isActive });
        onSaved();
      } catch (err) {
        notify(
          getApiErrorMessage(err, t) || t('salesmen.detail.statusUpdateError'),
        );
      }
    };

    // Deactivating logs the salesman out — confirm that before saving.
    if (statusChanged && !isActive) {
      confirmAction({
        title: t('salesmen.detail.deactivateTitle'),
        message: t('salesmen.detail.deactivateMessage'),
        confirmLabel: t('salesmen.detail.deactivate'),
        cancelLabel: t('common.cancel'),
        destructive: true,
        onConfirm: () => void run(),
      });
      return;
    }
    void run();
  };

  return (
    <>
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t('salesmen.detail.status')}</Text>
          <View style={styles.statusToggle}>
            <Text style={styles.statusValue}>
              {isActive ? t('salesmen.active') : t('salesmen.inactive')}
            </Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={saving}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#FFFFFF"
            />
          </View>
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

      <Button
        label={t('salesmen.detail.save')}
        onPress={handleSubmit(onSubmit)}
        loading={saving}
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

  const viewOrders = () =>
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('Orders', {
        screen: 'OrdersList',
        params: { salesmanId: id, filterLabel: salesman.full_name },
      });

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>{salesman.full_name}</Text>
      <Button
        label={t('salesmen.viewOrders')}
        variant="secondary"
        icon="receipt-outline"
        onPress={viewOrders}
        style={styles.viewOrders}
      />
      <EditForm salesman={salesman} onSaved={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  viewOrders: { marginBottom: spacing.lg },
  statusCard: { gap: spacing.sm, marginBottom: spacing.lg },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusLabel: { ...typography.label },
  statusValue: { ...typography.body },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  save: { marginTop: spacing.lg },
  note: { ...typography.caption, marginTop: spacing.md, textAlign: 'center' },
});
