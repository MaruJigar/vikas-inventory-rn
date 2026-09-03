'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateSalesmanSchema, UpdateSalesmanInput } from '@/lib/validation/salesmen/schema';
import { useUpdateSalesmanMutation } from '@/hooks/salesmen/useUpdateSalesmanMutation';
import { useSalesmanQuery } from '@/hooks/salesmen/useSalesmanQuery';
import { useStates } from '@/hooks/locations/useStates';
import { useCities } from '@/hooks/locations/useCities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller } from 'react-hook-form';

interface EditSalesmanDrawerProps {
  salesmanId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditSalesmanDrawer({ salesmanId, isOpen, onClose }: EditSalesmanDrawerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: response, isLoading: isFetching } = useSalesmanQuery(salesmanId || '');
  const salesman = (response?.data ?? response) as import('@/types/api/salesman.types').SalesmanDto | null | undefined;

  const updateSalesmanMutation = useUpdateSalesmanMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSalesmanInput>({
    resolver: zodResolver(updateSalesmanSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      state_id: '',
      city_id: '',
      is_active: true,
    },
  });

  const { data: states, isLoading: isLoadingStates } = useStates();

  const selectedStateId = watch('state_id');
  const isActive = watch('is_active') ?? true;
  const { data: cities, isLoading: isLoadingCities } = useCities(selectedStateId);

  // Clear messages only when drawer opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  // Pre-fill existing values
  useEffect(() => {
    if (isOpen) {
      if (salesman) {
        reset({
          full_name: salesman.full_name || '',
          email: salesman.email || '',
          phone: salesman.phone || '',
          state_id: salesman.state_id || '',
          city_id: salesman.city_id || '',
          is_active: salesman.is_active ?? true,
        });
      } else {
        reset();
      }
    }
  }, [salesman, isOpen, reset]);

  const onSubmit = async (data: UpdateSalesmanInput) => {
    if (!salesmanId) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: UpdateSalesmanInput & { city?: string | null; city_id?: string | null; state?: string; is_active?: boolean } = {
      full_name: data.full_name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      state_id: data.state_id || undefined,
      city_id: data.city_id === 'none' ? undefined : (data.city_id || undefined),
      is_active: data.is_active,
    };

    if (data.state_id) {
      payload.state = states?.find(s => s.id === data.state_id)?.name || '';
    }
    if (data.city_id && data.city_id !== 'none') {
      payload.city = cities?.find(c => c.id === data.city_id)?.name || '';
    } else if (data.city_id === 'none') {
      payload.city = undefined;
    }

    try {
      await updateSalesmanMutation.mutateAsync({
        id: salesmanId,
        data: payload,
      });
      setSuccessMsg('Salesman updated successfully.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosErr?.response?.data?.message || (err as Error).message || 'Salesman update failed';
      setErrorMsg(errorMessage);
    }
  };

  const formSubmit = handleSubmit(onSubmit);

  return (
    <EntityFormDrawer
      title="Edit Salesman"
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
      {(!salesman && isFetching && salesmanId) ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground text-sm">Loading salesman details...</p>
        </div>
      ) : (
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
              <Label htmlFor="edit_full_name">Full Name *</Label>
              <Input id="edit_full_name" {...register('full_name')} />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input id="edit_email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="edit_phone">Phone</Label>
              <Input id="phone" type="tel" {...register('phone')} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="state_id">State</Label>
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

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Account Status</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Active Account</Label>
                <p className="text-sm text-slate-500">
                  {isActive 
                    ? 'Salesman can log in and take orders.' 
                    : 'Salesman cannot log in. Their data remains in the system.'}
                </p>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })} 
              />
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </EntityFormDrawer>
  );
}
