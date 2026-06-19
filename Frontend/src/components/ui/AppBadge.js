import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../styles/colors';

export const AppBadge = ({ 
  label, 
  status = 'default', // default | success | warning | danger | info
  icon,
  style 
}) => {
  const getColors = () => {
    switch (status) {
      case 'success': return { bg: COLORS.successLight, text: COLORS.successDark, icon: COLORS.success };
      case 'warning': return { bg: COLORS.warningLight, text: COLORS.warningDark, icon: COLORS.warning };
      case 'danger': return { bg: COLORS.dangerLight, text: COLORS.dangerDark, icon: COLORS.danger };
      case 'info': return { bg: COLORS.infoLight, text: COLORS.info, icon: COLORS.info };
      case 'default':
      default: return { bg: COLORS.gray100, text: COLORS.gray700, icon: COLORS.gray500 };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      {icon && <Feather name={icon} size={12} color={colors.icon} style={styles.icon} />}
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  }
});
