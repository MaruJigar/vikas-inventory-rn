'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/useAuthStore';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSalesmanSchema, CreateSalesmanInput } from '@/lib/validation/salesmen/schema';
import { useCreateSalesmanMutation } from '@/hooks/salesmen/useCreateSalesmanMutation';
import { useDistributorsQuery } from '@/hooks/distributors/useDistributorsQuery';
import { useStates } from '@/hooks/locations/useStates';
import { useCities } from '@/hooks/locations/useCities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateSalesmanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSalesmanDrawer({ isOpen, onClose }: CreateSalesmanDrawerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuthStore();

  const createSalesmanMutation = useCreateSalesmanMutation();
  
  // Fetch distributors for the dropdown
  // Use a high limit to get all active distributors for assignment
  const { data: distributorsResponse, isLoading: isLoadingDistributors } = useDistributorsQuery({ limit: 100 });
  const distributors = distributorsResponse?.data || [];

  const { data: states, isLoading: isLoadingStates } = useStates();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateSalesmanInput>({
    resolver: zodResolver(createSalesmanSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      distributor_id: '',
      state_id: '',
      city_id: '',
    },
  });

  const selectedStateId = watch('state_id');
  const { data: cities, isLoading: isLoadingCities } = useCities(selectedStateId);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateSalesmanInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Map names before submission
      const stateName = states?.find(s => s.id === data.state_id)?.name;
      const cityName = cities?.find(c => c.id === data.city_id)?.name;
      
      const payload: CreateSalesmanInput & { city?: string | null; city_id?: string | null; state: string } = {
        ...data,
        state: stateName || '',
        city_id: data.city_id === 'none' ? null : (data.city_id || undefined),
        city: data.city_id === 'none' ? null : (cityName || undefined),
      };

      if (!payload.distributor_id) {
        delete payload.distributor_id;
      }

      await createSalesmanMutation.mutateAsync(payload);
      setSuccessMsg('Salesman registered successfully.');
      setTimeout(() => {
        onClose();
      }, 1000);
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

          {user?.role !== 'DISTRIBUTOR_ADMIN' && (
            <div>
              <Label htmlFor="distributor_id">Distributor *</Label>
              <Controller
                name="distributor_id"
                control={control}
                render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingDistributors}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {isLoadingDistributors 
                        ? 'Loading...' 
                        : (distributors.find(d => d.id === field.value)?.business_name || distributors.find(d => d.id === field.value)?.id || 'Select a distributor')
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {distributors.length === 0 && !isLoadingDistributors ? (
                      <SelectItem value="none" disabled>No distributors found</SelectItem>
                    ) : (
                      distributors.map((distributor) => (
                        <SelectItem key={distributor.id} value={distributor.id}>
                          {distributor.business_name || distributor.id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                )}
              />
              {errors.distributor_id && <p className="text-red-500 text-xs mt-1">{errors.distributor_id.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="state_id">State *</Label>
              <Controller
                control={control}
                name="state_id"
                render={({ field }) => (
                  <Select
                    key={states ? 'loaded' : 'loading'}
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("city_id", "");
                    }}
                    disabled={isLoadingStates}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {isLoadingStates 
                          ? "Loading states..." 
                          : (states?.find((s) => s.id === field.value)?.name || "Select State")
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {states?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state_id && <p className="text-red-500 text-xs mt-1">{errors.state_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city_id">City</Label>
              <Controller
                control={control}
                name="city_id"
                render={({ field }) => (
                  <Select
                    key={cities ? 'loaded' : 'loading'}
                    onValueChange={field.onChange}
                    value={isLoadingCities ? '' : (field.value || '')}
                    disabled={!selectedStateId || isLoadingCities}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {isLoadingCities
                          ? "Loading cities..."
                          : (field.value === 'none' ? "None" : cities?.find((c) => c.id === field.value)?.name || "Select City")
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Remove City)</SelectItem>
                      {cities?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.city_id && <p className="text-red-500 text-xs mt-1">{errors.city_id.message}</p>}
            </div>
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
