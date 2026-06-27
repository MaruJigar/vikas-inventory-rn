import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Section, LanguageToggle } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import type { Role } from '@/types/auth';
import type { AccountScreenProps } from '@/navigation/types';

const ROLE_LABELS: Record<Role, string> = {
  SALESMAN: 'Salesman',
  DISTRIBUTOR_ADMIN: 'Distributor',
  MANUFACTURER_ADMIN: 'Manufacturer',
  SUPER_ADMIN: 'Admin',
};

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

  const name = user?.full_name ?? '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : '';

  return (
    <Screen edges={['top']}>
      <Text style={[typography.h1, styles.title]}>{t('account.title')}</Text>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={typography.h2}>{name}</Text>
        {user?.email ? <Text style={styles.muted}>{user.email}</Text> : null}
        <Text style={styles.muted}>{user?.phone ?? ''}</Text>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('account.role')}</Text>
          <Text style={styles.metaValue}>{roleLabel}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('account.status')}</Text>
          <Text style={[styles.metaValue, styles.approved]}>
            {t('account.statusApproved')}
          </Text>
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

      <View style={styles.spacer} />
      <Text style={styles.hint}>{t('account.profileHint')}</Text>
      <Button
        label={t('account.logout')}
        variant="danger"
        onPress={() => void logout()}
        style={styles.logout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  profile: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 30, fontWeight: '700', color: '#FFFFFF' },
  infoCard: { gap: spacing.sm },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: { ...typography.label },
  metaValue: { ...typography.body },
  approved: { color: colors.success },
  divider: { height: 1, backgroundColor: colors.border },
  languageCard: { alignItems: 'flex-start' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  muted: { ...typography.body, color: colors.textMuted },
  spacer: { flex: 1, minHeight: spacing.lg },
  hint: { ...typography.caption, marginBottom: spacing.md, textAlign: 'center' },
  logout: {},
});
