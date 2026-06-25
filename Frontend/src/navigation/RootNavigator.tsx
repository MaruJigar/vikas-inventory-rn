import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@/theme/colors';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Temporary landing screen — replaced by the auth flow in Phase 1. */
function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qera</Text>
      <Text style={styles.subtitle}>Fresh TypeScript foundation ready.</Text>
    </View>
  );
}

export function RootNavigator() {
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
  title: { fontSize: 32, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: 14, color: colors.textMuted },
});
