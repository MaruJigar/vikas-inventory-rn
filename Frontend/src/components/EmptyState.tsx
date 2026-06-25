import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/theme';
import { Button } from '@/components/Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={typography.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  action: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
