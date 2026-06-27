import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, EmptyState } from '@/components';
import { spacing, typography } from '@/theme';

/** Orders tab shell — listing, filters and details land in the orders phase. */
export function OrdersScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>{t('orders.title')}</Text>
      </View>
      <View style={styles.body}>
        <EmptyState title={t('orders.empty')} message={t('orders.emptyHint')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm },
  body: { flex: 1, justifyContent: 'center' },
});
