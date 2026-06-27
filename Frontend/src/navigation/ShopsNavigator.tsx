import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { ShopsStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { ShopsListScreen } from '@/features/shops/screens/ShopsListScreen';
import { ShopDetailScreen } from '@/features/shops/screens/ShopDetailScreen';
import { AddShopScreen } from '@/features/shops/screens/AddShopScreen';

const Stack = createNativeStackNavigator<ShopsStackParamList>();

export function ShopsNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ShopsList"
        component={ShopsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShopDetail"
        component={ShopDetailScreen}
        options={{ title: t('shops.title'), headerBackTitle: t('common.back') }}
      />
      <Stack.Screen
        name="AddShop"
        component={AddShopScreen}
        options={{ title: t('shops.add'), headerBackTitle: t('common.back') }}
      />
    </Stack.Navigator>
  );
}
