import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../modules/auth/screens/LoginScreen';
import { RegisterSalesmanScreen } from '../modules/auth/screens/RegisterSalesmanScreen';
import { RegisterDistributorScreen } from '../modules/auth/screens/RegisterDistributorScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterSalesman" component={RegisterSalesmanScreen} />
      <Stack.Screen name="RegisterDistributor" component={RegisterDistributorScreen} />
    </Stack.Navigator>
  );
};
