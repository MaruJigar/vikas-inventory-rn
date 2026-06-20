import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton } from './AppButton';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/colors';

export const AppEmptyState = ({ 
  icon = 'inbox', 
  title, 
  description, 
  actionLabel, 
  onAction,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={48} color={COLORS.gray400} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <AppButton 
          title={actionLabel} 
          onPress={onAction} 
          variant="outline" 
          style={styles.actionButton} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.gray100,
    borderRadius: 100,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  actionButton: {
    minWidth: 150,
  }
});
