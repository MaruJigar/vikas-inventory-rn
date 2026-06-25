import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Button, Card, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useMe } from '@/features/auth/hooks';

/**
 * Shown to authenticated users whose approval_status is not APPROVED.
 * "Refresh status" re-fetches /auth/me; once APPROVED the RootNavigator
 * routes them into the app automatically.
 */
export function WaitingApprovalScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { refetch, isFetching } = useMe(false);

  const rejected = user?.approval_status === 'REJECTED';

  return (
    <Screen>
      <LanguageToggle />
      <View style={styles.body}>
        <Text style={typography.h1}>
          {rejected ? t('auth.waiting.rejectedTitle') : t('auth.waiting.title')}
        </Text>
        <Text style={styles.message}>
          {rejected
            ? t('auth.waiting.rejectedMessage')
            : t('auth.waiting.message')}
        </Text>

        {!rejected ? (
          <Card style={styles.hint}>
            <Text style={styles.hintText}>{t('auth.waiting.catalogHint')}</Text>
          </Card>
        ) : null}
      </View>

      {!rejected ? (
        <Button
          label={t('auth.waiting.refresh')}
          variant="secondary"
          loading={isFetching}
          onPress={() => void refetch()}
          style={styles.refresh}
        />
      ) : null}

      <Button
        label={t('auth.waiting.logout')}
        variant="danger"
        onPress={() => void logout()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  message: { ...typography.body, color: colors.textMuted },
  hint: { backgroundColor: colors.surface, marginTop: spacing.sm },
  hintText: { ...typography.body, color: colors.text },
  refresh: { marginBottom: spacing.md },
});
