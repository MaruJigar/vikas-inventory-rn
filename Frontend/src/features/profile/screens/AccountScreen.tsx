import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Section, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Account tab shell. Phase 2 surfaces identity, language and logout; full
 * profile editing, change-password and the sidebar menu land in the
 * account/profile phase.
 */
export function AccountScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>{t('account.title')}</Text>
      </View>

      <Card style={styles.identity}>
        <Text style={typography.title}>{user?.full_name ?? ''}</Text>
        {user?.email ? <Text style={styles.muted}>{user.email}</Text> : null}
        <Text style={styles.muted}>{user?.phone ?? ''}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('account.role')}</Text>
          <Text style={styles.metaValue}>{user?.role ?? ''}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('account.status')}</Text>
          <Text style={styles.metaValue}>{t('account.statusApproved')}</Text>
        </View>
      </Card>

      <Section title={t('common.language')}>
        <Card style={styles.languageCard}>
          <LanguageToggle />
        </Card>
      </Section>

      <Text style={styles.hint}>{t('account.profileHint')}</Text>

      <View style={styles.spacer} />
      <Button
        label={t('account.logout')}
        variant="danger"
        onPress={() => void logout()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm },
  identity: { marginTop: spacing.lg, gap: spacing.xs },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metaLabel: { ...typography.label },
  metaValue: { ...typography.body },
  languageCard: { alignItems: 'flex-start' },
  hint: { ...typography.caption, marginTop: spacing.lg },
  muted: { ...typography.body, color: colors.textMuted },
  spacer: { flex: 1, minHeight: spacing.xl },
});
