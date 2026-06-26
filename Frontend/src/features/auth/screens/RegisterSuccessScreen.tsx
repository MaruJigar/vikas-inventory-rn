import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Button } from '@/components';
import { colors, spacing, typography } from '@/theme';
import type { AuthScreenProps } from '@/navigation/types';

export function RegisterSuccessScreen({
  navigation,
}: AuthScreenProps<'RegisterSuccess'>) {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={typography.h1}>{t('auth.register.successTitle')}</Text>
        <Text style={styles.message}>{t('auth.register.successMessage')}</Text>
      </View>
      <Button
        label={t('auth.register.goToLogin')}
        onPress={() => navigation.navigate('Login')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  message: { ...typography.body, color: colors.textMuted },
});
