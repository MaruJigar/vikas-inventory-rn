import React, { useContext } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, AppContext } from './src/context/AppContext';
import { COLORS } from './src/styles/colors';

// Import Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { SalesmanDashboardScreen } from './src/screens/SalesmanDashboardScreen';
import { CustomerSelectScreen } from './src/screens/CustomerSelectScreen';
import { ProductListingScreen } from './src/screens/ProductListingScreen';
import { OrderConfirmationScreen } from './src/screens/OrderConfirmationScreen';
import { OrderHistoryScreen } from './src/screens/OrderHistoryScreen';
import { OrderDetailsScreen } from './src/screens/OrderDetailsScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { InventoryManagementScreen } from './src/screens/InventoryManagementScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { InvoiceScreen } from './src/screens/InvoiceScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SalesmenManagementScreen } from './src/screens/SalesmenManagementScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

// Salesman: DIRECT LANDING in Order History (Req #1)
const SalesmanNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="OrderHistory">
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="CustomerSelect" component={CustomerSelectScreen} />
    <Stack.Screen name="ProductListing" component={ProductListingScreen} />
    <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
  </Stack.Navigator>
);

// Admin: Full access — orders, inventory, invoices, notifications
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

// Web responsive wrapper — constrains to mobile width on desktop browsers
const WebResponsiveWrapper = ({ children }) => {
  const { width } = useWindowDimensions();

  if (Platform.OS === 'web' && width > 500) {
    return (
      <View style={webStyles.outer}>
        <View style={webStyles.inner}>
          {children}
        </View>
      </View>
    );
  }
  return <>{children}</>;
};

const webStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#0F172A', // Ultra-sleek premium deep slate
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backgroundImage: 'radial-gradient(circle at 50% 30%, #1E293B 0%, #0F172A 100%)',
      }
    })
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 680, // Enhanced modern wide-tablet layout prevents stretching while feeling generous
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 100px rgba(0,0,0,0.2)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
      }
    })
  },
});

const AppNavigator = () => {
  const { appState } = useContext(AppContext);

  return (
    <WebResponsiveWrapper>
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          {!appState.currentUser ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : appState.userRole === 'salesman' ? (
            <Stack.Screen name="SalesmanStack" component={SalesmanNavigator} />
          ) : (
            <Stack.Screen name="AdminStack" component={AdminNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </WebResponsiveWrapper>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <AppNavigator />
    </AppProvider>
  );
}
