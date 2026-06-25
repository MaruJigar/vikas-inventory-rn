import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors, typography } from '@/theme';
import { Spinner } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Temporary landing screen — replaced by the auth/role flow in Phase 1–2. */
function PlaceholderScreen() {
  const status = useAuthStore((s) => s.status);
  return (
    <View style={styles.container}>
      <Text style={typography.h1}>Qera</Text>
      <Text style={styles.subtitle}>Foundation ready · auth status: {status}</Text>
    </View>
  );
}

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);

  // Block on initial token hydration so we don't flash the wrong screen.
  if (status === 'loading') return <Spinner />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 8,
  },
  subtitle: { ...typography.caption, color: colors.textMuted },
});
