import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, LanguageToggle } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { confirmAction, notify } from '@/lib/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { useForgotPassword } from '@/features/auth/hooks';
import type { Role } from '@/types/auth';
import type { AccountScreenProps } from '@/navigation/types';

/**
 * Footer credit. Tapping a name dials it, so `phone` must be a real number in
 * dialable form (digits, optional leading +, no spaces). A name with an empty
 * phone renders as plain text rather than a tap that goes nowhere.
 */
const DEVELOPERS: { name: string; phone: string }[] = [
  { name: 'Param Buddh', phone: '+918141155884' },
  { name: 'Jigar Maru', phone: '+918141155884' },
];

const ROLE_LABELS: Record<Role, string> = {
  SALESMAN: 'Salesman',
  DISTRIBUTOR_ADMIN: 'Distributor',
  MANUFACTURER_ADMIN: 'Manufacturer',
  SUPER_ADMIN: 'Admin',
};

/** A rounded, tinted container for a row's leading icon. */
function IconChip({
  icon,
  tone = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'danger';
}) {
  return (
    <View style={[styles.chip, tone === 'danger' && styles.chipDanger]}>
      <Ionicons
        name={icon}
        size={18}
        color={tone === 'danger' ? colors.danger : colors.text}
      />
    </View>
  );
}

/** A single settings row. Renders as a button when `onPress` is given. */
function Row({
  icon,
  label,
  tone = 'default',
  value,
  trailing,
  chevron = true,
  divider = true,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: 'default' | 'danger';
  value?: string;
  trailing?: React.ReactNode;
  chevron?: boolean;
  divider?: boolean;
  onPress?: () => void;
}) {
  const body = (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <IconChip icon={icon} tone={tone} />
      <Text
        style={[styles.rowLabel, tone === 'danger' && styles.rowLabelDanger]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {chevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.rowPressed : undefined)}
      accessibilityRole="button"
    >
      {body}
    </Pressable>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function GroupLabel({ children }: { children: string }) {
  return <Text style={styles.groupLabel}>{children}</Text>;
}

/**
 * Account tab home — a modern grouped-settings layout. Surfaces the profile,
 * account actions (edit profile / reset password), distributor management,
 * language and logout.
 */
export function AccountScreen({
  navigation,
}: AccountScreenProps<'AccountHome'>) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const forgot = useForgotPassword();
  const isDistributor = user?.role === 'DISTRIBUTOR_ADMIN';
  const isSalesman = user?.role === 'SALESMAN';

  const name = user?.full_name ?? '';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : '';

  // No in-app change-password endpoint exists — the backend only supports an
  // emailed reset link, so "Reset password" triggers that flow.
  const onResetPassword = () => {
    const email = user?.email;
    if (!email) {
      notify(t('account.security.noEmail'));
      return;
    }
    confirmAction({
      title: t('account.security.resetTitle'),
      message: t('account.security.resetMessage', { email }),
      confirmLabel: t('account.security.resetConfirm'),
      cancelLabel: t('common.cancel'),
      onConfirm: () =>
        forgot.mutate(email, {
          onSuccess: () => notify(t('account.security.resetSent')),
          onError: () => notify(t('account.security.resetError')),
        }),
    });
  };

  const confirmLogout = () =>
    confirmAction({
      title: t('account.logoutConfirmTitle'),
      confirmLabel: t('account.logout'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      onConfirm: () => void logout(),
    });

  return (
    <Screen edges={['top']}>
      <Text style={[typography.h1, styles.title]}>{t('account.title')}</Text>

      {/* Profile header */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.heroName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{roleLabel}</Text>
            </View>
            <View style={[styles.pill, styles.pillOk]}>
              <View style={styles.pillDot} />
              <Text style={[styles.pillText, styles.pillOkText]}>
                {t('account.statusApproved')}
              </Text>
            </View>
          </View>
          {user?.email ? (
            <Text style={styles.heroMeta} numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}
          {user?.phone ? (
            <Text style={styles.heroMeta} numberOfLines={1}>
              {user.phone}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Account actions */}
      <GroupLabel>{t('account.account')}</GroupLabel>
      <Group>
        {isDistributor ? (
          <Row
            icon="person-outline"
            label={t('account.profile.edit')}
            onPress={() => navigation.navigate('EditProfile')}
          />
        ) : null}
        <Row
          icon="key-outline"
          label={t('account.security.resetPassword')}
          divider={false}
          onPress={onResetPassword}
        />
      </Group>

      {/* Distributor management */}
      {isDistributor ? (
        <>
          <GroupLabel>{t('account.management')}</GroupLabel>
          <Group>
            <Row
              icon="people-outline"
              label={t('salesmen.title')}
              onPress={() => navigation.navigate('Salesmen')}
            />
            <Row
              icon="checkmark-done-outline"
              label={t('approvals.title')}
              divider={false}
              onPress={() => navigation.navigate('Approvals')}
            />
          </Group>
        </>
      ) : null}

      {/* Activity — attendance history (both roles; backend scopes it) */}
      {isDistributor || isSalesman ? (
        <>
          <GroupLabel>{t('account.activity')}</GroupLabel>
          <Group>
            <Row
              icon="time-outline"
              label={t('attendance.title')}
              divider={false}
              onPress={() => navigation.navigate('Attendance')}
            />
          </Group>
        </>
      ) : null}

      {/* Preferences */}
      <GroupLabel>{t('common.language')}</GroupLabel>
      <Group>
        <Row
          icon="language-outline"
          label={t('common.language')}
          chevron={false}
          divider={false}
          trailing={<LanguageToggle />}
        />
      </Group>

      {/* Session */}
      <View style={styles.logoutWrap}>
        <Group>
          <Row
            icon="log-out-outline"
            label={t('account.logout')}
            tone="danger"
            chevron={false}
            divider={false}
            onPress={confirmLogout}
          />
        </Group>
      </View>

      <Credits />
    </Screen>
  );
}

/** "Powered by <name> · <name>", each name dialling its owner. */
function Credits() {
  const { t } = useTranslation();

  const call = (phone: string) => {
    void Linking.openURL(`tel:${phone}`).catch(() =>
      notify(t('account.callFailed')),
    );
  };

  return (
    <Text style={styles.credits}>
      {t('account.poweredBy')}{' '}
      {DEVELOPERS.map((dev, i) => (
        <Text key={dev.name}>
          {i > 0 ? ' · ' : ''}
          {dev.phone ? (
            <Text
              style={styles.creditLink}
              onPress={() => call(dev.phone)}
              suppressHighlighting
              accessibilityRole="link"
              accessibilityLabel={`${t('account.call')} ${dev.name}`}
            >
              {dev.name}
            </Text>
          ) : (
            dev.name
          )}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },

  /* Hero */
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  heroInfo: { flex: 1, gap: 6 },
  heroName: { fontSize: 20, fontWeight: '700', color: colors.text },
  heroMeta: { ...typography.caption },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.2,
  },
  pillOk: { backgroundColor: 'rgba(21,128,61,0.10)', borderColor: 'transparent' },
  pillOkText: { color: colors.success },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },

  /* Grouped list */
  groupLabel: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  group: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  rowPressed: { opacity: 0.6 },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, flex: 1 },
  rowLabelDanger: { color: colors.danger, fontWeight: '600' },
  rowValue: { ...typography.body, color: colors.textMuted },
  chip: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDanger: { backgroundColor: 'rgba(185,28,28,0.10)' },

  logoutWrap: { marginTop: spacing.sm },
  credits: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  creditLink: { color: colors.primary, fontWeight: '600' },
});
