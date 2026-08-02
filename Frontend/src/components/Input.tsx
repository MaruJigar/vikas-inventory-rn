import React, { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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
    multiline,
    secureTextEntry,
    rightIcon,
    onRightIconPress,
    rightIconLoading,
    rightIconLabel,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !visible}
          // Remove the browser's default focus outline on web — focus is shown
          // on the rounded field border instead (which respects borderRadius).
          multiline={multiline}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            style,
            Platform.OS === 'web' && webNoOutline,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
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

/** Web-only: strip the native focus ring (react-native-web renders the field as
 * an <input>). Typed loosely because `outlineStyle` isn't in RN's style types. */
const webNoOutline = { outlineStyle: 'none' } as unknown as TextInputProps['style'];

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
  // Multiline needs room to grow and text pinned to the top — the single-line
  // field is a fixed-height, vertically-centred row.
  fieldMultiline: {
    height: undefined,
    minHeight: 96,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 15,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 80,
    alignSelf: 'stretch',
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  eye: { paddingLeft: spacing.sm },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
