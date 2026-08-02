import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typography } from '@/theme';
import { MAX_SAFE_QUANTITY } from '@/features/products/pricing';

interface Props {
  qty: number;
  onChange: (qty: number) => void;
  /** Upper bound (e.g. available stock). Undefined = no business limit. */
  max?: number;
  /** Called instead of clamping silently, so the screen can explain the cap. */
  onExceedMax?: (max: number) => void;
  size?: 'md' | 'sm';
  /** Stretch across the parent, pushing −/+ to the edges (mobile bottom bar). */
  fullWidth?: boolean;
}

/**
 * −/quantity/+ control where the quantity is also typable, so large orders
 * ("500") don't need 500 taps.
 *
 * The field keeps its own draft string while focused: committing on every
 * keystroke would make clearing it snap back to the previous number, and an
 * intermediate empty string is not a valid quantity.
 */
export function QuantityStepper({
  qty,
  onChange,
  max: maxProp,
  onExceedMax,
  size = 'md',
  fullWidth = false,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(String(qty));
  const [editing, setEditing] = useState(false);

  // Only a caller-supplied cap (stock) limits the quantity. MAX_SAFE_QUANTITY
  // is not a business rule — it just keeps the arithmetic exact.
  const max = Math.max(1, Math.min(maxProp ?? MAX_SAFE_QUANTITY, MAX_SAFE_QUANTITY));
  const reportExceed = () => onExceedMax?.(max);

  // Track external changes (+/− taps, cart cleared) unless the user is typing.
  useEffect(() => {
    if (!editing) setDraft(String(qty));
  }, [qty, editing]);

  const atMax = qty >= max;
  const small = size === 'sm';

  // Grow with the digit count: a fixed width either wastes room on "1" or clips
  // a long quantity. The upper clamp keeps it from crowding the price on a
  // phone; past it the field scrolls rather than pushing the row out of shape.
  const digits = Math.max(draft.length, 1);
  const inputWidth = small
    ? Math.min(112, Math.max(32, 16 + digits * 9))
    : Math.min(168, Math.max(44, 20 + digits * 10));

  const commit = () => {
    setEditing(false);
    const parsed = parseInt(draft.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(qty)); // empty / junk → keep what we had
      return;
    }
    if (parsed > max) {
      reportExceed();
      setDraft(String(max));
      onChange(max);
      return;
    }
    setDraft(String(parsed));
    onChange(parsed);
  };

  const bump = (delta: number) => {
    const next = qty + delta;
    if (delta > 0 && next > max) {
      reportExceed();
      return;
    }
    onChange(Math.max(0, next));
  };

  return (
    <View style={[styles.wrap, fullWidth && styles.wrapFull]}>
      <Pressable
        style={[styles.btn, small && styles.btnSm]}
        onPress={() => bump(-1)}
        accessibilityLabel={t('products.decrease')}
      >
        <Ionicons name="remove" size={small ? 16 : 20} color={colors.text} />
      </Pressable>

      <TextInput
        value={draft}
        onChangeText={(v) => setDraft(v.replace(/[^0-9]/g, ''))}
        onFocus={() => setEditing(true)}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={String(max).length}
        selectTextOnFocus
        style={[styles.input, small && styles.inputSm, { width: inputWidth }]}
        accessibilityLabel={t('products.quantity')}
      />

      <Pressable
        style={[styles.btn, small && styles.btnSm, atMax && styles.btnDisabled]}
        onPress={() => bump(1)}
        accessibilityLabel={t('products.increase')}
      >
        <Ionicons name="add" size={small ? 16 : 20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // flexShrink/Grow 0: the row must never stretch the control.
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexGrow: 0,
    flexShrink: 0,
  },
  wrapFull: { flexGrow: 1, alignSelf: 'stretch', justifyContent: 'space-between' },
  // Matches the 40pt "Add" pill it replaces, so the row doesn't jump height
  // when a product goes from not-added to added.
  btn: {
    width: 36,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSm: { width: 28, height: 32 },
  btnDisabled: { opacity: 0.4 },
  input: {
    // Width is computed per-render from the digit count and applied inline.
    // It must be an explicit width, never minWidth: on react-native-web a bare
    // <input> keeps its default ~20-character intrinsic width and would
    // stretch across the card.
    flexGrow: 0,
    flexShrink: 0,
    height: 40,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: 'center',
    color: colors.text,
    ...typography.body,
    fontWeight: '600',
  },
  inputSm: { height: 32 },
});
