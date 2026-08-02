import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme';
import {
  useToastStore,
  type ToastItem,
  type ToastTone,
} from '@/store/useToastStore';

const VISIBLE_MS = 3500;

const TONE: Record<ToastTone, { bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: colors.success, icon: 'checkmark-circle' },
  error: { bg: colors.danger, icon: 'alert-circle' },
  info: { bg: colors.text, icon: 'information-circle' },
};

function Toast({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const anim = useRef(new Animated.Value(0)).current;
  const tone = TONE[item.tone];

  useEffect(() => {
    let cancelled = false;
    Animated.timing(anim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    const hide = () =>
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        if (!cancelled) dismiss(item.id);
      });

    const timer = setTimeout(hide, VISIBLE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [anim, dismiss, item.id]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: tone.bg },
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
    >
      <Ionicons name={tone.icon} size={20} color="#FFFFFF" />
      <Text style={styles.text} numberOfLines={3}>
        {item.message}
      </Text>
      <Pressable onPress={() => dismiss(item.id)} hitSlop={10}>
        <Ionicons name="close" size={18} color="rgba(255,255,255,0.85)" />
      </Pressable>
    </Animated.View>
  );
}

/**
 * Renders queued toasts above everything else. Mounted once at the app root,
 * outside the navigator so toasts survive screen transitions.
 */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    // `box-none` so the empty area stays tappable — the host covers the screen.
    <View
      style={[styles.host, { paddingBottom: insets.bottom + spacing.lg }]}
      pointerEvents="box-none"
    >
      {toasts.map((item) => (
        <Toast key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    // Keep it legible over light surfaces on both platforms.
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: { ...typography.body, color: '#FFFFFF', flex: 1 },
});
