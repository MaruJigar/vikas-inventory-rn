import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { OrdersStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { OrdersListScreen } from '@/features/orders/screens/OrdersListScreen';
import { OrderDetailScreen } from '@/features/orders/screens/OrderDetailScreen';
import { EditOrderScreen } from '@/features/orders/screens/EditOrderScreen';
import { BackordersListScreen } from '@/features/backorders/screens/BackordersListScreen';
import { BackorderDetailScreen } from '@/features/backorders/screens/BackorderDetailScreen';

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
      <Stack.Screen
        name="EditOrder"
        component={EditOrderScreen}
        options={{ title: t('orders.edit.title') }}
      />
      <Stack.Screen
        name="Backorders"
        component={BackordersListScreen}
        options={{ title: t('backorders.title') }}
      />
      <Stack.Screen
        name="BackorderDetail"
        component={BackorderDetailScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}
