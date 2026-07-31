import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Button } from '@/components';
import { colors, spacing, typography } from '@/theme';
import type { HomeScreenProps } from '@/navigation/types';

export function OrderSuccessScreen({
  route,
  navigation,
}: HomeScreenProps<'OrderSuccess'>) {
  const { t } = useTranslation();
  const { orderNumber } = route.params;

  return (
    <Screen edges={['top']}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>
        <Text style={typography.h1}>{t('orderSuccess.title')}</Text>
        <Text style={styles.message}>{t('orderSuccess.message')}</Text>
        <Text style={styles.orderNumber}>{orderNumber}</Text>
      </View>

      <Button
        label={t('orderSuccess.goToDashboard')}
        onPress={() => navigation.popToTop()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  orderNumber: { ...typography.title },
});
