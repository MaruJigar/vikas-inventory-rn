import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';

interface ForgotPasswordData {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
      return response.data;
    },
  });
};
