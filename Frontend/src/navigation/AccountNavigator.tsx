import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AccountStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { AccountScreen } from '@/features/profile/screens/AccountScreen';
import { SalesmenListScreen } from '@/features/salesman/screens/SalesmenListScreen';
import { AddSalesmanScreen } from '@/features/salesman/screens/AddSalesmanScreen';
import { SalesmanDetailScreen } from '@/features/salesman/screens/SalesmanDetailScreen';

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen
        name="AccountHome"
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Salesmen"
        component={SalesmenListScreen}
        options={{ title: t('salesmen.title') }}
      />
      <Stack.Screen
        name="AddSalesman"
        component={AddSalesmanScreen}
        options={{ title: t('salesmen.add') }}
      />
      <Stack.Screen
        name="SalesmanDetail"
        component={SalesmanDetailScreen}
        options={{ title: t('salesmen.detail.title') }}
      />
    </Stack.Navigator>
  );
}
