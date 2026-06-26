import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Button, ControlledInput, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  registerDistributorSchema,
  type RegisterDistributorForm,
} from '@/features/auth/schemas';
import { useRegisterDistributor } from '@/features/auth/hooks';
import type { AuthScreenProps } from '@/navigation/types';

export function RegisterDistributorScreen({
  navigation,
}: AuthScreenProps<'RegisterDistributor'>) {
  const { t } = useTranslation();
  const register = useRegisterDistributor();

  const { control, handleSubmit } = useForm<RegisterDistributorForm>({
    resolver: zodResolver(registerDistributorSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      business_name: '',
      gst_number: '',
    },
  });

  const onSubmit = (values: RegisterDistributorForm) =>
    register.mutate(values, {
      onSuccess: () => navigation.replace('RegisterSuccess'),
    });

  return (
    <Screen>
      <LanguageToggle />
      <View style={styles.header}>
        <Text style={typography.h1}>{t('auth.register.distributorTitle')}</Text>
      </View>

      <ControlledInput control={control} name="full_name" label={t('auth.register.fullName')} />
      <ControlledInput
        control={control}
        name="business_name"
        label={t('auth.register.businessName')}
      />
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
        name="gst_number"
        label={t('auth.register.gstNumber')}
        autoCapitalize="characters"
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
