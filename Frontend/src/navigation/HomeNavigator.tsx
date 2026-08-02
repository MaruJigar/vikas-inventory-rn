import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { HomeStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { SalesmanDashboardScreen } from '@/features/dashboard/screens/SalesmanDashboardScreen';
import { DistributorDashboardScreen } from '@/features/dashboard/screens/DistributorDashboardScreen';
import { ProductsScreen } from '@/features/products/screens/ProductsScreen';
import { CategoriesScreen } from '@/features/products/screens/CategoriesScreen';
import { ProductDetailScreen } from '@/features/products/screens/ProductDetailScreen';
import { AddProductScreen } from '@/features/products/screens/AddProductScreen';
import { CartScreen } from '@/features/cart/screens/CartScreen';
import { SelectShopScreen } from '@/features/visit/screens/SelectShopScreen';
import { OrderSuccessScreen } from '@/features/orders/screens/OrderSuccessScreen';
import { POProductsScreen } from '@/features/purchaseOrders/screens/POProductsScreen';
import { POCartScreen } from '@/features/purchaseOrders/screens/POCartScreen';
import { POSuccessScreen } from '@/features/purchaseOrders/screens/POSuccessScreen';

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
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: t('dashboard.distributor.allCategories'),
          headerBackTitle: t('common.back'),
        }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: t('products.title'), headerBackTitle: t('common.back') }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: t('products.details.title'),
          headerBackTitle: t('common.back'),
        }}
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
      <Stack.Screen
        name="PurchaseOrderProducts"
        component={POProductsScreen}
        options={{
          title: t('purchaseOrders.title'),
          headerBackTitle: t('common.back'),
        }}
      />
      <Stack.Screen
        name="PurchaseOrderCart"
        component={POCartScreen}
        options={{
          title: t('purchaseOrders.cart.title'),
          headerBackTitle: t('common.back'),
        }}
      />
      <Stack.Screen
        name="PurchaseOrderSuccess"
        component={POSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
