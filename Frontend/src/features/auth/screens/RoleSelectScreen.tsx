import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Card, LanguageToggle } from '@/components';
import { colors, spacing, typography } from '@/theme';
import type { AuthScreenProps } from '@/navigation/types';

export function RoleSelectScreen({
  navigation,
}: AuthScreenProps<'RoleSelect'>) {
  const { t } = useTranslation();

  return (
    <Screen>
      <LanguageToggle />
      <View style={styles.header}>
        <Text style={typography.h1}>{t('auth.roleSelect.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.roleSelect.subtitle')}</Text>
      </View>

      <Pressable onPress={() => navigation.navigate('RegisterSalesman')}>
        <Card style={styles.card}>
          <Text style={typography.title}>{t('auth.roleSelect.salesman')}</Text>
          <Text style={styles.desc}>{t('auth.roleSelect.salesmanDesc')}</Text>
        </Card>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('RegisterDistributor')}>
        <Card style={styles.card}>
          <Text style={typography.title}>
            {t('auth.roleSelect.distributor')}
          </Text>
          <Text style={styles.desc}>{t('auth.roleSelect.distributorDesc')}</Text>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl, marginBottom: spacing.xl, gap: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted },
  card: { marginBottom: spacing.lg, gap: spacing.xs },
  desc: { ...typography.body, color: colors.textMuted },
});
