import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Button, ControlledInput, Card } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { forgotSchema, type ForgotForm } from '@/features/auth/schemas';
import { useForgotPassword } from '@/features/auth/hooks';
import type { AuthScreenProps } from '@/navigation/types';

/**
 * Requests a password-reset link by email. The backend
 * (`POST /auth/forgot-password`) emails a reset link and always returns the
 * same generic response (anti-enumeration), so on success we just show a
 * "check your email" confirmation — the reset itself happens via the link.
 */
export function ForgotPasswordScreen({
  navigation,
}: AuthScreenProps<'ForgotPassword'>) {
  const { t } = useTranslation();
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(({ email }) => {
    forgot.mutate(email, { onSuccess: () => setSentTo(email) });
  });

  if (sentTo) {
    return (
      <Screen>
        <View style={styles.confirm}>
          <Ionicons name="mail-outline" size={48} color={colors.primary} />
          <Text style={typography.h1}>{t('auth.forgot.sentTitle')}</Text>
          <Text style={styles.confirmText}>
            {t('auth.forgot.sentMessage', { email: sentTo })}
          </Text>
        </View>

        <Button
          label={t('auth.forgot.backToLogin')}
          onPress={() => navigation.navigate('Login')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>{t('auth.forgot.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>
      </View>

      <ControlledInput
        control={control}
        name="email"
        label={t('auth.forgot.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        onSubmitEditing={onSubmit}
        returnKeyType="send"
      />

      {forgot.isError ? (
        <Card style={styles.notice}>
          <Text style={styles.noticeText}>{t('errors.generic')}</Text>
        </Card>
      ) : null}

      <Button
        label={t('auth.forgot.send')}
        onPress={onSubmit}
        loading={forgot.isPending}
      />

      <Pressable
        onPress={() => navigation.navigate('Login')}
        style={styles.back}
      >
        <Text style={styles.link}>{t('auth.forgot.backToLogin')}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted },
  confirm: {
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  confirmText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  notice: { marginBottom: spacing.md, backgroundColor: colors.surface },
  noticeText: { ...typography.body, color: colors.danger },
  back: { alignSelf: 'center', marginTop: spacing.xl },
  link: { ...typography.body, color: colors.primary },
});
