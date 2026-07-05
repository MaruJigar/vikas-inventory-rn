import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import type { MainTabParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { HomeNavigator } from '@/navigation/HomeNavigator';
import { ShopsNavigator } from '@/navigation/ShopsNavigator';
import { OrdersNavigator } from '@/navigation/OrdersNavigator';
import { AccountNavigator } from '@/navigation/AccountNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabName = keyof MainTabParamList;

const ICONS: Record<TabName, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Shops: 'storefront-outline',
  Orders: 'receipt-outline',
  Account: 'settings-outline',
};

/**
 * Bottom-tab shell shown to approved users. The Home and Shops tabs host their
 * own stacks; Orders and Account are single shared screens.
 */
export function MainNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={ICONS[route.name as TabName]}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{ tabBarLabel: t('nav.home') }}
      />
      <Tab.Screen
        name="Shops"
        component={ShopsNavigator}
        options={{ tabBarLabel: t('nav.shops') }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{ tabBarLabel: t('nav.orders') }}
      />
      <Tab.Screen
        name="Account"
        component={AccountNavigator}
        options={{ tabBarLabel: t('nav.account') }}
      />
    </Tab.Navigator>
  );
}
