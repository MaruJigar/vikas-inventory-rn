import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AccountStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { AccountScreen } from '@/features/profile/screens/AccountScreen';
import { EditProfileScreen } from '@/features/profile/screens/EditProfileScreen';
import { SalesmenListScreen } from '@/features/salesman/screens/SalesmenListScreen';
import { AddSalesmanScreen } from '@/features/salesman/screens/AddSalesmanScreen';
import { SalesmanDetailScreen } from '@/features/salesman/screens/SalesmanDetailScreen';
import { ApprovalsListScreen } from '@/features/approvals/screens/ApprovalsListScreen';
import { ApprovalDetailScreen } from '@/features/approvals/screens/ApprovalDetailScreen';
import { AttendanceScreen } from '@/features/attendance/screens/AttendanceScreen';
import { InventoryListScreen } from '@/features/inventory/screens/InventoryListScreen';
import { InventoryDetailScreen } from '@/features/inventory/screens/InventoryDetailScreen';
import { AdjustStockScreen } from '@/features/inventory/screens/AdjustStockScreen';
import { InventoryValuationScreen } from '@/features/inventory/screens/InventoryValuationScreen';

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountNavigator() {
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
      <Stack.Screen
        name="AccountHome"
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: t('account.profile.title') }}
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
      <Stack.Screen
        name="Approvals"
        component={ApprovalsListScreen}
        options={{ title: t('approvals.title') }}
      />
      <Stack.Screen
        name="ApprovalDetail"
        component={ApprovalDetailScreen}
        options={{ title: t('approvals.detail.title') }}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: t('attendance.title') }}
      />
      <Stack.Screen
        name="Inventory"
        component={InventoryListScreen}
        options={{ title: t('inventory.title') }}
      />
      <Stack.Screen
        name="InventoryDetail"
        component={InventoryDetailScreen}
        options={{ title: t('inventory.detail.title') }}
      />
      <Stack.Screen
        name="AdjustStock"
        component={AdjustStockScreen}
        options={{ title: t('inventory.adjust.title') }}
      />
      <Stack.Screen
        name="InventoryValuation"
        component={InventoryValuationScreen}
        options={{ title: t('inventory.valuation.title') }}
      />
    </Stack.Navigator>
  );
}
