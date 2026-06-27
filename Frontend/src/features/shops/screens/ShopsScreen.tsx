import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, EmptyState } from '@/components';
import { spacing, typography } from '@/theme';

/** Shops tab shell — listing, search and add-shop land in the shops phase. */
export function ShopsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>{t('shops.title')}</Text>
      </View>
      <View style={styles.body}>
        <EmptyState title={t('shops.empty')} message={t('shops.emptyHint')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm },
  body: { flex: 1, justifyContent: 'center' },
});
