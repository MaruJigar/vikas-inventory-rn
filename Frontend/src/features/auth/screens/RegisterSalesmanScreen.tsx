import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Button, ControlledInput, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  registerSalesmanSchema,
  type RegisterSalesmanForm,
} from '@/features/auth/schemas';
import { useRegisterSalesman } from '@/features/auth/hooks';
import type { AuthScreenProps } from '@/navigation/types';

export function RegisterSalesmanScreen({
  navigation,
}: AuthScreenProps<'RegisterSalesman'>) {
  const { t } = useTranslation();
  const register = useRegisterSalesman();

  const { control, handleSubmit } = useForm<RegisterSalesmanForm>({
    resolver: zodResolver(registerSalesmanSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      distributor_id: '',
    },
  });

  const onSubmit = (values: RegisterSalesmanForm) =>
    register.mutate(values, {
      onSuccess: () => navigation.replace('RegisterSuccess'),
    });

  return (
    <Screen>
      <LanguageToggle />
      <View style={styles.header}>
        <Text style={typography.h1}>{t('auth.register.salesmanTitle')}</Text>
      </View>

      <ControlledInput control={control} name="full_name" label={t('auth.register.fullName')} />
      <ControlledInput
        control={control}
        name="email"
        label={t('auth.register.email')}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ControlledInput
        control={control}
        name="phone"
        label={t('auth.register.phone')}
        keyboardType="phone-pad"
      />
      <ControlledInput
        control={control}
        name="distributor_id"
        label={t('auth.register.distributorId')}
        autoCapitalize="none"
      />
      <ControlledInput
        control={control}
        name="password"
        label={t('auth.register.password')}
        secureTextEntry
      />

      {register.isError ? (
        <Text style={styles.error}>{getApiErrorMessage(register.error, t)}</Text>
      ) : null}

      <Button
        label={t('auth.register.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={register.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.lg, marginBottom: spacing.lg },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
