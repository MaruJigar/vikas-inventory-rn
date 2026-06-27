import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/navigation/types';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { RegisterDistributorScreen } from '@/features/auth/screens/RegisterDistributorScreen';
import { RegisterSuccessScreen } from '@/features/auth/screens/RegisterSuccessScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="RegisterDistributor"
        component={RegisterDistributorScreen}
      />
      <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
