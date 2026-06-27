import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { OrdersStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { OrdersListScreen } from '@/features/orders/screens/OrdersListScreen';
import { OrderDetailScreen } from '@/features/orders/screens/OrderDetailScreen';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerBackTitle: t('common.back'),
      }}
    >
      {/* Title rendered in-content (left-aligned) — iOS native-stack centers
          header titles and ignores headerTitleAlign, so we don't use it here. */}
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}
