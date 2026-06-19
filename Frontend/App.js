import React, { useContext, useEffect } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';

// Legacy Context
import { AppProvider } from './src/context/AppContext';
import { COLORS } from './src/styles/colors';

// New Architecture
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { ErrorBoundary } from './src/components/ErrorBoundary';

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

const MainApp = () => {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <WebResponsiveWrapper>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </WebResponsiveWrapper>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <StatusBar style="light" backgroundColor={COLORS.primary} />
          <MainApp />
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

