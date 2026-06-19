import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../styles/colors';

export const AppHeader = ({ 
  title, 
  onBack, 
  rightAction, 
  rightActionIcon, 
  onRightAction,
  backgroundColor = COLORS.white,
  textColor = COLORS.gray900
}) => {
  const isDarkBg = backgroundColor === COLORS.primary || backgroundColor === COLORS.primaryDark;
  const backColor = isDarkBg ? COLORS.white : COLORS.gray900;
  const activeTextColor = isDarkBg ? COLORS.white : textColor;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconButton} activeOpacity={0.7}>
            <Feather name="chevron-left" size={24} color={backColor} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.center}>
        <Text style={[styles.title, { color: activeTextColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.right}>
        {rightAction ? (
          <TouchableOpacity onPress={onRightAction} style={styles.actionButton} activeOpacity={0.7}>
            {rightActionIcon ? (
              <Feather name={rightActionIcon} size={20} color={activeTextColor} />
            ) : (
              <Text style={[styles.actionText, { color: activeTextColor }]}>{rightAction}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} /> // Placeholder to maintain center alignment
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  }
});
