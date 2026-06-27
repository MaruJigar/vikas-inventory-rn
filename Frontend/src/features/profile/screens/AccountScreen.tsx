import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Section, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import type { AccountScreenProps } from '@/navigation/types';

/**
 * Account tab home. Surfaces identity, language and logout, plus a
 * distributor-only entry into salesman management.
 */
export function AccountScreen({
  navigation,
}: AccountScreenProps<'AccountHome'>) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isDistributor = user?.role === 'DISTRIBUTOR_ADMIN';

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

      {isDistributor ? (
        <Section title={t('account.management')}>
          <Pressable onPress={() => navigation.navigate('Salesmen')}>
            <Card style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <Ionicons name="people-outline" size={22} color={colors.text} />
                <Text style={typography.body}>{t('salesmen.title')}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </Card>
          </Pressable>
        </Section>
      ) : null}

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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  spacer: { flex: 1, minHeight: spacing.xl },
});
