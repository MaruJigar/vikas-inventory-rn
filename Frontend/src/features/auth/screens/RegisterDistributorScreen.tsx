import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import {
  Screen,
  Button,
  Card,
  ControlledInput,
  LanguageToggle,
  MultiSelect,
} from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { useManufacturerOptions } from '@/features/manufacturers/hooks';
import {
  registerDistributorSchema,
  type RegisterDistributorForm,
} from '@/features/auth/schemas';
import { useRegisterDistributor } from '@/features/auth/hooks';
import type { AuthScreenProps } from '@/navigation/types';

/**
 * Distributor self-signup. On success the account exists as PENDING_APPROVAL
 * and the hook signs the user in, so RootNavigator swaps to the waiting screen
 * on its own — nothing to navigate to here. Only if that follow-up sign-in
 * failed do we send them back to Login.
 */
export function RegisterDistributorScreen({
  navigation,
}: AuthScreenProps<'RegisterDistributor'>) {
  const { t } = useTranslation();
  const register = useRegisterDistributor();
  const manufacturers = useManufacturerOptions();

  const { control, handleSubmit } = useForm<RegisterDistributorForm>({
    resolver: zodResolver(registerDistributorSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      business_name: '',
      manufacturer_ids: [],
      gst_number: '',
      city: '',
    },
  });

  const onSubmit = (values: RegisterDistributorForm) =>
    register.mutate(values, {
      onSuccess: (result) => {
        if (!result.signedIn) navigation.navigate('Login');
      },
    });

  return (
    <Screen>
      <LanguageToggle />
      <View style={styles.header}>
        <Text style={typography.h1}>{t('auth.register.distributorTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
      </View>

      <ControlledInput
        control={control}
        name="full_name"
        label={t('auth.register.fullName')}
      />
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
        name="password"
        label={t('auth.register.password')}
        secureTextEntry
      />
      <Controller
        control={control}
        name="manufacturer_ids"
        render={({ field, fieldState }) => (
          <MultiSelect
            label={t('auth.register.manufacturers')}
            placeholder={t('auth.register.selectManufacturers')}
            values={field.value}
            options={manufacturers.options}
            onChange={field.onChange}
            error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
            loading={manufacturers.isLoading}
            searchable
            searchPlaceholder={t('auth.register.searchManufacturers')}
            emptyText={
              manufacturers.isError
                ? t('auth.register.manufacturersError')
                : t('auth.register.noManufacturers')
            }
          />
        )}
      />

      <ControlledInput
        control={control}
        name="city"
        label={t('auth.register.city')}
      />
      <ControlledInput
        control={control}
        name="gst_number"
        label={t('auth.register.gstNumber')}
        autoCapitalize="characters"
      />

      {/* Every submission needs a manufacturer, so a failed list is fatal for
          this form — say so rather than letting them fill it in and get a 400. */}
      {manufacturers.isError ? (
        <Card style={styles.warning}>
          <Text style={styles.warningText}>
            {t('auth.register.manufacturersError')}
          </Text>
        </Card>
      ) : null}

      {register.isError ? (
        <Text style={styles.error}>{getApiErrorMessage(register.error, t)}</Text>
      ) : null}

      <Button
        label={t('auth.register.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={register.isPending}
        disabled={manufacturers.isError}
      />

      <View style={styles.footer}>
        <Text style={typography.body}>{t('auth.register.haveAccount')} </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, styles.linkStrong]}>
            {t('auth.register.signIn')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.lg, marginBottom: spacing.lg, gap: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted },
  link: { ...typography.body, color: colors.primary },
  linkStrong: { fontWeight: '700' },
  warning: { marginBottom: spacing.md },
  warningText: { ...typography.caption, color: colors.danger },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});
