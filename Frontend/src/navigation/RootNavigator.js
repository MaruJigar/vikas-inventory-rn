import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { PendingNavigator } from './PendingNavigator';

// Legacy Screens
import { CustomerSelectScreen } from '../screens/CustomerSelectScreen';
import { ProductListingScreen } from '../screens/ProductListingScreen';
import { OrderConfirmationScreen } from '../screens/OrderConfirmationScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { InventoryManagementScreen } from '../screens/InventoryManagementScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { InvoiceScreen } from '../screens/InvoiceScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SalesmenManagementScreen } from '../screens/SalesmenManagementScreen';

// Modern Modular Screens
import { SalesmanHomeScreen } from '../modules/salesman/screens/SalesmanHomeScreen';
import { StartVisitScreen } from '../modules/visit/screens/StartVisitScreen';
import { ActiveVisitScreen } from '../modules/visit/screens/ActiveVisitScreen';
import { ProductCatalogueScreen } from '../modules/order/screens/ProductCatalogueScreen';
import { CartReviewScreen } from '../modules/order/screens/CartReviewScreen';
import { OrderDetailsScreen } from '../modules/order/screens/OrderDetailsScreen';
import { OrderRevisionsScreen } from '../modules/order/screens/OrderRevisionsScreen';

import ShopDuplicateCheckScreen from '../modules/shop/screens/ShopDuplicateCheckScreen';
import ShopRegistrationScreen from '../modules/shop/screens/ShopRegistrationScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

// Refactored Salesman Navigator
const SalesmanNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="SalesmanHome">
    <Stack.Screen name="SalesmanHome" component={SalesmanHomeScreen} />
    <Stack.Screen name="StartVisitScreen" component={StartVisitScreen} />
    <Stack.Screen name="ActiveVisitScreen" component={ActiveVisitScreen} />
    
    {/* Orders Module */}
    <Stack.Screen name="ProductCatalogueScreen" component={ProductCatalogueScreen} />
    <Stack.Screen name="CartReviewScreen" component={CartReviewScreen} />
    <Stack.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} />
    <Stack.Screen name="OrderRevisionsScreen" component={OrderRevisionsScreen} />

    {/* Shops Module */}
    <Stack.Screen name="ShopDuplicateCheckScreen" component={ShopDuplicateCheckScreen} />
    <Stack.Screen name="ShopRegistrationScreen" component={ShopRegistrationScreen} />

    {/* Legacy placeholders */}
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="CustomerSelect" component={CustomerSelectScreen} />
    <Stack.Screen name="ProductListing" component={ProductListingScreen} />
    <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
  </Stack.Navigator>
);

// Legacy Admin Navigator
const AdminNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="AdminOrders" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="Invoice" component={InvoiceScreen} />
    <Stack.Screen name="InventoryManagement" component={InventoryManagementScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    <Stack.Screen name="SalesmenManagement" component={SalesmenManagementScreen} />
  </Stack.Navigator>
);

export const RootNavigator = () => {
  const { accessToken, role, approvalStatus } = useAuthStore();

  if (!accessToken) {
    return <AuthNavigator />;
  }

  // Fallback for unknown/invalid approval statuses
  if (!approvalStatus || (approvalStatus !== 'APPROVED' && approvalStatus !== 'PENDING_APPROVAL')) {
    // If the status is unknown (e.g. SUSPENDED), fallback to AuthNavigator to force login/contact support
    return <AuthNavigator />;
  }

  // Strict Routing Based on SKILL.md rules
  if (approvalStatus === 'PENDING_APPROVAL') {
    return <PendingNavigator />; 
  }

  // If Approved, route by role
  if (role === 'SALESMAN') {
    return <SalesmanNavigator />;
  }
  
  if (role === 'DISTRIBUTOR_ADMIN' || role === 'MANUFACTURER') {
    return <AdminNavigator />;
  }

  // Final Fallback for unmapped roles
  return <AuthNavigator />;
};
