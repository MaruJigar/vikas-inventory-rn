import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import type { MainTabParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { SalesmanDashboardScreen } from '@/features/dashboard/screens/SalesmanDashboardScreen';
import { DistributorDashboardScreen } from '@/features/dashboard/screens/DistributorDashboardScreen';
import { ShopsNavigator } from '@/navigation/ShopsNavigator';
import { OrdersScreen } from '@/features/orders/screens/OrdersScreen';
import { AccountScreen } from '@/features/profile/screens/AccountScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabName = keyof MainTabParamList;

const ICONS: Record<TabName, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Shops: 'storefront-outline',
  Orders: 'receipt-outline',
  Account: 'person-outline',
};

/**
 * Bottom-tab shell shown to approved users. The Home tab renders the
 * dashboard for the signed-in user's role; the remaining tabs are shared.
 */
export function MainNavigator() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const HomeScreen =
    role === 'DISTRIBUTOR'
      ? DistributorDashboardScreen
      : SalesmanDashboardScreen;

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
        component={HomeScreen}
        options={{ tabBarLabel: t('nav.home') }}
      />
      <Tab.Screen
        name="Shops"
        component={ShopsNavigator}
        options={{ tabBarLabel: t('nav.shops') }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarLabel: t('nav.orders') }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarLabel: t('nav.account') }}
      />
    </Tab.Navigator>
  );
}
