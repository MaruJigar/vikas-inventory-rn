import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { useCartStore } from '../../order/store/useCartStore';

export const useLoginMutation = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      // Temporarily set tokens so the next request succeeds
      await setAuthData({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: {} // mock user until getMe resolves
      });
      
      // Fetch the full profile to get role and approvalStatus
      try {
        const userProfile = await authService.getMe();
        await setAuthData({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: userProfile,
        });
      } catch (error) {
        console.error('Failed to fetch user profile after login', error);
      }
    },
  });
};

export const useRegisterDistributorMutation = () => {
  return useMutation({
    mutationFn: authService.registerDistributor,
  });
};

export const useRegisterSalesmanMutation = () => {
  return useMutation({
    mutationFn: authService.registerSalesman,
  });
};

export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logout();
    },
  });
};

export const useGetMeQuery = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    enabled: !!accessToken,
    onSuccess: (data) => {
      // Update store with fresh profile data
      setAuthData({ accessToken, refreshToken, user: data });
    }
  });
};
