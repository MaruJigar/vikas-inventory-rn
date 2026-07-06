'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordFormValues, resetPasswordSchema } from '@/lib/validation/auth/forgot-password.schema';
import { useResetPasswordMutation } from '@/hooks/auth/useResetPasswordMutation';
import { useValidateResetTokenQuery } from '@/hooks/auth/useValidateResetTokenQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { data: validationResult, isLoading: isVerifying } = useValidateResetTokenQuery(token);
  const { mutateAsync: resetPassword, isPending } = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;
    
    try {
      setServerError(null);
      await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      setServerError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'An error occurred while resetting your password');
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded text-sm">
          Missing reset token. Please request a new password reset link.
        </div>
        <div>
          <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Verifying your link...</p>
      </div>
    );
  }

  if (!validationResult?.valid) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded text-sm">
          This password reset link is invalid or has expired.
        </div>
        <div>
          <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded text-sm">
          Your password has been reset successfully.
        </div>
        <div>
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-block px-6 py-2 bg-blue-600 text-white rounded-md">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
          {serverError}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1"
            {...register("password")}
            disabled={isPending}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1"
            {...register("confirmPassword")}
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Resetting password...' : 'Reset Password'}
      </Button>
    </form>
  );
}
