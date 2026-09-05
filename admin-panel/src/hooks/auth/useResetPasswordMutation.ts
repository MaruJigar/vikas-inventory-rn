import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
      return response.data;
    },
  });
};
