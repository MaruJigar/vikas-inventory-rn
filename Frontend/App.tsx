import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

import '@/i18n'; // initialise i18next (side effect)
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary, ToastHost } from '@/components';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useVisitStore } from '@/store/useVisitStore';

export default function App() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateLanguage = useLanguageStore((s) => s.hydrate);
  const hydrateVisit = useVisitStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateLanguage();
    void hydrateAuth();
    void hydrateVisit();
  }, [hydrateAuth, hydrateLanguage, hydrateVisit]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
            {/* Outside the navigator so toasts survive screen transitions. */}
            <ToastHost />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
