import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/theme';

interface SectionProps {
  title: string;
  /** Optional right-aligned action (e.g. a "View all" link). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** A titled block used to group dashboard content. */
export function Section({ title, action, children }: SectionProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={typography.title}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
