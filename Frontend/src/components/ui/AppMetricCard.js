import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../styles/colors';

export const AppMetricCard = ({ 
  title, 
  value, 
  icon, 
  color = COLORS.primary,
  style 
}) => {
  return (
    <AppCard style={[styles.container, style]} variant="elevated">
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.value} numberOfLines={1}>{value}</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'column',
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray500,
  }
});
