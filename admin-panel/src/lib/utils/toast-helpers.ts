import { toast } from 'react-hot-toast';

export const handleSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

export const handlePermissionToast = () => {
  toast.error('You do not have permission to perform this action.', {
    duration: 4000,
    position: 'top-right',
  });
};

export const handleValidationToast = (errors: string[] | string) => {
  const message = Array.isArray(errors) ? errors[0] : errors;
  toast.error(`Validation Error: ${message}`, {
    duration: 4000,
    position: 'top-right',
  });
};

export const handleNetworkToast = () => {
  toast.error('Network error. Please check your connection and try again.', {
    duration: 5000,
    position: 'top-right',
  });
};

export const handleUnexpectedToast = (error?: unknown) => {
  const err = error as Record<string, unknown>;
  const response = err?.response as Record<string, unknown> | undefined;
  const data = response?.data as Record<string, unknown> | undefined;
  
  const message =
    (data?.message as string) ||
    (err?.message as string) ||
    'An unexpected error occurred.';
  
  if (response?.status === 403) {
    return handlePermissionToast();
  }
  
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });
};
