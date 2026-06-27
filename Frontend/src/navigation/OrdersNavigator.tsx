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
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: t('orders.title') }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: t('orders.detail.title') }}
      />
    </Stack.Navigator>
  );
}
