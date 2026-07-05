import React, { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typography } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Optional tappable icon at the right edge (e.g. a "use my location" button). */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  rightIconLoading?: boolean;
  rightIconLabel?: string;
}

/** Presentational text field — pair with react-hook-form's Controller. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    style,
    secureTextEntry,
    rightIcon,
    onRightIconPress,
    rightIconLoading,
    rightIconLabel,
    ...rest
  },
  ref,
) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, !!error && styles.fieldError]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !visible}
          style={[styles.input, style]}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={styles.eye}
            accessibilityRole="button"
            accessibilityLabel={
              visible ? t('common.hidePassword') : t('common.showPassword')
            }
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
        {rightIcon && !isPassword ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={8}
            style={styles.eye}
            accessibilityRole="button"
            accessibilityLabel={rightIconLabel}
          >
            {rightIconLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name={rightIcon} size={20} color={colors.primary} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  fieldError: { borderColor: colors.danger },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 15,
  },
  eye: { paddingLeft: spacing.sm },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
