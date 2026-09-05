'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordFormValues, forgotPasswordSchema } from '@/lib/validation/auth/forgot-password.schema';
import { useForgotPasswordMutation } from '@/hooks/auth/useForgotPasswordMutation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: forgotPassword, isPending } = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(data);
      setIsSuccess(true);
    } catch {
      // Even on failure, we show success state to prevent enumeration as requested
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded text-sm">
          If an account exists with that email, a password reset link has been sent.
        </div>
        <div>
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1"
            {...register("email")}
            disabled={isPending}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending request...' : 'Request password reset'}
        </Button>
        
        <div className="text-center text-sm">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </div>
      </div>
    </form>
  );
}
