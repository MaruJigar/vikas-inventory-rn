import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../../styles/colors';

export const AppCard = ({ children, style, onPress, variant = 'elevated' }) => {
  const Component = onPress ? TouchableOpacity : View;
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    style,
  ];

  return (
    <Component style={cardStyle} onPress={onPress} activeOpacity={0.7}>
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  elevated: {
    ...SHADOWS.sm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flat: {
    backgroundColor: COLORS.gray50,
  }
});
