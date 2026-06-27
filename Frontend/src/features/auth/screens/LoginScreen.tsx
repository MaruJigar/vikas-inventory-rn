import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Button, ControlledInput, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { loginSchema, type LoginForm } from '@/features/auth/schemas';
import { useLogin } from '@/features/auth/hooks';
import type { AuthScreenProps } from '@/navigation/types';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { t } = useTranslation();
  const login = useLogin();

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email_or_phone: 'admin@vikassales.local', password: 'Password@123' },
    // distributor@vikassales.local
    // admin@vikassales.local
    // salesman@vikassales.local
  });

  const onSubmit = (values: LoginForm) => login.mutate(values);

  return (
    <Screen>
      <LanguageToggle />
      <View style={styles.header}>
        <Text style={typography.h1}>{t('auth.login.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
      </View>

      <ControlledInput
        control={control}
        name="email_or_phone"
        label={t('auth.login.emailOrPhone')}
        placeholder={t('auth.login.emailOrPhonePlaceholder')}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ControlledInput
        control={control}
        name="password"
        label={t('auth.login.password')}
        placeholder={t('auth.login.passwordPlaceholder')}
        secureTextEntry
      />

      <Pressable
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgot}
      >
        <Text style={styles.link}>{t('auth.login.forgot')}</Text>
      </Pressable>

      {login.isError ? (
        <Text style={styles.error}>{getApiErrorMessage(login.error, t)}</Text>
      ) : null}

      <Button
        label={t('auth.login.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={login.isPending}
      />

      <View style={styles.footer}>
        <Text style={typography.body}>{t('auth.login.noAccount')} </Text>
        <Pressable onPress={() => navigation.navigate('RoleSelect')}>
          <Text style={[styles.link, styles.linkStrong]}>
            {t('auth.login.register')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  link: { ...typography.body, color: colors.primary },
  linkStrong: { fontWeight: '700' },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
