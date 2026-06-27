import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { HomeStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { SalesmanDashboardScreen } from '@/features/dashboard/screens/SalesmanDashboardScreen';
import { DistributorDashboardScreen } from '@/features/dashboard/screens/DistributorDashboardScreen';
import { ProductsScreen } from '@/features/products/screens/ProductsScreen';
import { AddProductScreen } from '@/features/products/screens/AddProductScreen';
import { CartScreen } from '@/features/cart/screens/CartScreen';
import { SelectShopScreen } from '@/features/visit/screens/SelectShopScreen';
import { OrderSuccessScreen } from '@/features/orders/screens/OrderSuccessScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeNavigator() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const Dashboard =
    role === 'DISTRIBUTOR_ADMIN'
      ? DistributorDashboardScreen
      : SalesmanDashboardScreen;

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
      }}
    >
      <Stack.Screen
        name="HomeDashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectShop"
        component={SelectShopScreen}
        options={{ title: t('visit.selectShop'), headerBackTitle: t('common.back') }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: t('products.title'), headerBackTitle: t('common.back') }}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: t('products.form.title'), headerBackTitle: t('common.back') }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: t('cart.title'), headerBackTitle: t('common.back') }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
