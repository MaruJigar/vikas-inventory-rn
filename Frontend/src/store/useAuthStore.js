import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '../api/queryClient';
import { useCartStore } from '../modules/order/store/useCartStore';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  approvalStatus: null,
  isHydrating: true,

  hydrateAuth: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userStr = await AsyncStorage.getItem('userProfile');

      if (accessToken && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken,
          refreshToken,
          role: user.role,
          approvalStatus: user.approval_status,
          isHydrating: false,
        });
      } else {
        set({ isHydrating: false });
      }
    } catch (e) {
      console.warn('Failed to hydrate auth', e);
      set({ isHydrating: false });
    }
  },

  setAuthData: async ({ accessToken, refreshToken, user }) => {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));

      set({
        accessToken,
        refreshToken,
        user,
        role: user.role,
        approvalStatus: user.approval_status,
      });
    } catch (e) {
      console.error('Failed to save auth data', e);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userProfile');
      
      // Global Session Cleanup guarantees cart data and cached responses never leak 
      // across accounts, even if a 401 Unauthorized forced the logout.
      useCartStore.getState().clearCart();
      queryClient.clear();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        role: null,
        approvalStatus: null,
      });
    } catch (e) {
      console.error('Failed to clear auth data', e);
    }
  },
}));
