import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Button, ControlledInput, Card } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { forgotSchema, type ForgotForm } from '@/features/auth/schemas';
import type { AuthScreenProps } from '@/navigation/types';

/**
 * UI-complete, but intentionally inert: the backend has no OTP / reset
 * endpoint yet. Submitting surfaces the "unavailable" notice. Wire the
 * mutation once the backend exposes forgot-password/OTP.
 */
export function ForgotPasswordScreen({
  navigation,
}: AuthScreenProps<'ForgotPassword'>) {
  const { t } = useTranslation();
  const [showNotice, setShowNotice] = React.useState(false);

  const { control, handleSubmit } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email_or_phone: '' },
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>{t('auth.forgot.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>
      </View>

      <ControlledInput
        control={control}
        name="email_or_phone"
        label={t('auth.forgot.emailOrPhone')}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {showNotice ? (
        <Card style={styles.notice}>
          <Text style={styles.noticeText}>{t('auth.forgot.unavailable')}</Text>
        </Card>
      ) : null}

      <Button
        label={t('auth.forgot.sendOtp')}
        onPress={handleSubmit(() => setShowNotice(true))}
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
  notice: { marginBottom: spacing.md, backgroundColor: colors.surface },
  noticeText: { ...typography.body, color: colors.warning },
  back: { alignSelf: 'center', marginTop: spacing.xl },
  link: { ...typography.body, color: colors.primary },
});
