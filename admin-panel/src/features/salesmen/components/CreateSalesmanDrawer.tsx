'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSalesmanSchema, CreateSalesmanInput } from '@/lib/validation/salesmen/schema';
import { useCreateSalesmanMutation } from '@/hooks/salesmen/useCreateSalesmanMutation';
import { useDistributorsQuery } from '@/hooks/distributors/useDistributorsQuery';

interface CreateSalesmanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSalesmanDrawer({ isOpen, onClose }: CreateSalesmanDrawerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const createSalesmanMutation = useCreateSalesmanMutation();
  
  // Fetch distributors for the dropdown
  // Use a high limit to get all active distributors for assignment
  const { data: distributorsResponse, isLoading: isLoadingDistributors } = useDistributorsQuery({ limit: 100 });
  const distributors = distributorsResponse?.data || [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSalesmanInput>({
    resolver: zodResolver(createSalesmanSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      distributor_id: '',
    },
  });

  const onSubmit = async (data: CreateSalesmanInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await createSalesmanMutation.mutateAsync(data);
      setSuccessMsg('Salesman registered successfully.');
      setTimeout(() => {
        reset();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosErr?.response?.data?.message || (err as Error).message || 'Salesman registration failed';
      setErrorMsg(errorMessage);
    }
  };

  const formSubmit = handleSubmit(onSubmit);

  return (
    <EntityFormDrawer
      title="Register Salesman"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          setErrorMsg(null);
          setSuccessMsg(null);
          onClose();
        }
      }}
      width="md"
    >
      <form onSubmit={formSubmit} className="space-y-6 mt-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" type="tel" {...register('phone')} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <Label htmlFor="distributor_id">Distributor *</Label>
            <Controller
              name="distributor_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isLoadingDistributors}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    {isLoadingDistributors ? 'Loading...' : 'Select a distributor'}
                  </option>
                  {distributors.map((distributor) => (
                    <option key={distributor.id} value={distributor.id}>
                      {distributor.name || distributor.id}
                    </option>
                  ))}
                  {!isLoadingDistributors && distributors.length === 0 && (
                    <option value="none" disabled>No distributors found</option>
                  )}
                </select>
              )}
            />
            {errors.distributor_id && <p className="text-red-500 text-xs mt-1">{errors.distributor_id.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              reset();
              setErrorMsg(null);
              setSuccessMsg(null);
              onClose();
            }} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Salesman'}
          </Button>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
