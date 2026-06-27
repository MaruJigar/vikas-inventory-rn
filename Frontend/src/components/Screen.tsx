import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Apply default horizontal padding (default true). */
  padded?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
  /** A node pinned over the content (e.g. a floating action button). */
  floatingAction?: React.ReactNode;
}

/** Standard safe-area screen wrapper used by every screen. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top', 'bottom'],
  style,
  floatingAction,
}: ScreenProps) {
  const inner = padded ? styles.padded : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, inner, style]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, inner, style]}>{children}</View>
        )}
      </KeyboardAvoidingView>
      {floatingAction}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  padded: { paddingHorizontal: spacing.lg },
});
