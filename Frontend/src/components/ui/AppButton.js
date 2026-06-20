import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/colors';

export const AppButton = ({ 
  title, 
  onPress, 
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'md', // sm | md | lg
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.gray300;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.gray500;
    switch (variant) {
      case 'primary': return COLORS.white;
      case 'secondary': return COLORS.white;
      case 'outline': return COLORS.primary;
      case 'ghost': return COLORS.gray700;
      default: return COLORS.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return COLORS.gray300;
    if (variant === 'outline') return COLORS.primary;
    return 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'lg': return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl };
      case 'md':
      default: return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return TYPOGRAPHY.sizes.sm;
      case 'lg': return TYPOGRAPHY.sizes.lg;
      case 'md':
      default: return TYPOGRAPHY.sizes.base;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor(), borderWidth: variant === 'outline' ? 1 : 0 },
        getPadding(),
        variant === 'primary' && !disabled && SHADOWS.sm,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Feather name={icon} size={getFontSize()} color={getTextColor()} style={styles.iconLeft} />
          )}
          <Text style={[
            styles.text, 
            { color: getTextColor(), fontSize: getFontSize() },
            textStyle
          ]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Feather name={icon} size={getFontSize()} color={getTextColor()} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  }
});
