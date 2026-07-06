import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';

interface ValidateTokenResponse {
  valid: boolean;
}

export const useValidateResetTokenQuery = (token: string | null) => {
  return useQuery({
    queryKey: ['validateResetToken', token],
    queryFn: async () => {
      if (!token) return { valid: false };
      const response = await api.get<ValidateTokenResponse>(`/auth/reset-password/validate?token=${token}`);
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });
};
