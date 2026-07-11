'use client';

import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateShopSchema, updateShopBaseSchema, UpdateShopInput } from '@/lib/validations/shop.schema';
import { useUpdateShopMutation } from '@/hooks/shops/useUpdateShopMutation';
import { useQueryClient } from '@tanstack/react-query';
import { shopsKeys } from '@/lib/query-keys/shops';
import { ShopDto } from '@/types/api/shop.types';
import { useStates } from '@/hooks/locations/useStates';
import { useCities } from '@/hooks/locations/useCities';
import { useAuthStore } from '@/store/useAuthStore';
import { useDistributorsQuery } from '@/hooks/distributors/useDistributorsQuery';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller } from 'react-hook-form';
interface EditShopDrawerProps {
  shop: ShopDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditShopDrawer({ shop, isOpen, onClose }: EditShopDrawerProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const { data: distributorsRes, isLoading: isLoadingDistributors } = useDistributorsQuery({ limit: 100 });
  const distributors = distributorsRes?.data || [];

  const updateShopMutation = useUpdateShopMutation();

  const dynamicSchema = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let schema: any = updateShopBaseSchema;

    if (user?.role === 'SUPER_ADMIN') {
      schema = schema.extend({
        distributor_id: z.string().min(1, 'Distributor is required'),
      });
    }

    return schema.superRefine((data: Record<string, unknown>, ctx: z.RefinementCtx) => {
      if (data.state_id && !data.city_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'City is required',
          path: ['city_id'],
        });
      }
    });
  }, [user?.role]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateShopInput>({
    // ZodResolver type mismatch with coerced numbers
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: '',
      owner_name: '',
      phone: '',
      address: '',
      city_id: '',
      state_id: '',
      gst_number: '',
      distributor_id: '',
    },
  });

  const selectedStateId = watch('state_id');
  const { data: states, isLoading: isLoadingStates } = useStates({ enabled: isOpen });
  const { data: cities, isLoading: isLoadingCities } = useCities(selectedStateId, { enabled: isOpen });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        owner_name: shop.owner_name || '',
        phone: shop.phone,
        address: shop.address,
        city_id: shop.city_id || '',
        state_id: shop.state_id || '',
        gst_number: shop.gst_number || '',
        distributor_id: shop.distributor_id || '',
      });
    }
  }, [shop, reset]);

  const onSubmit = async (data: UpdateShopInput) => {
    if (!shop) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const stateName = states?.find(s => s.id === data.state_id)?.name;
      const cityName = cities?.find(c => c.id === data.city_id)?.name;

      const shopPayload = {
        name: data.name,
        owner_name: data.owner_name || undefined,
        phone: data.phone,
        address: data.address,
        city_id: data.city_id || undefined,
        state_id: data.state_id || undefined,
        city: cityName,
        state: stateName,
        gst_number: data.gst_number || undefined,
        distributor_id: data.distributor_id || undefined,
      };

      await updateShopMutation.mutateAsync({ id: shop.id, data: shopPayload });
      
      setSuccessMsg('Shop updated successfully.');
      queryClient.invalidateQueries({ queryKey: shopsKeys.all });
      setTimeout(() => {
        reset();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMsg = axiosErr?.response?.data?.message || (err as Error).message || 'Shop update failed';
      setErrorMsg(errorMsg);
    }
  };

    const formSubmit = handleSubmit(onSubmit);

  return (
    <EntityFormDrawer
      title="Edit Shop"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-shop-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form 
        id="edit-shop-form"
        onSubmit={formSubmit} 
        className="space-y-6 mt-4"
      >
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
          <div className="space-y-1.5">
            <Label htmlFor="name">Shop Name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="owner_name">Owner Name</Label>
            <Input id="owner_name" {...register('owner_name')} />
            {errors.owner_name && <p className="text-red-500 text-xs mt-1">{errors.owner_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="state_id">State *</Label>
              <Controller
                control={control}
                name="state_id"
                render={({ field }) => (
                  <Select
                    key={states ? 'loaded' : 'loading'}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      reset({ ...(watch() as any), state_id: value, city_id: '' });
                    }}
                    value={isLoadingStates ? '' : (field.value || '')}
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
              <Label htmlFor="city_id">City *</Label>
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
                          : (cities?.find((c) => c.id === field.value)?.name || "Select City")
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
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

          {user?.role === 'SUPER_ADMIN' && (
            <div className="space-y-1.5">
              <Label htmlFor="distributor_id">Distributor *</Label>
              <Controller
                control={control}
                name="distributor_id"
                rules={{ required: 'Distributor is required' }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={isLoadingDistributors}
                  >
                    <SelectTrigger className="w-full text-left">
                      <SelectValue>
                        {isLoadingDistributors
                          ? "Loading distributors..."
                          : field.value
                            ? distributors.find((d) => d.id === field.value)?.business_name || "Select Distributor"
                            : "Select Distributor"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {distributors.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="whitespace-normal break-words text-left">
                          {d.business_name} {d.owner_name ? `(${d.owner_name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.distributor_id && <p className="text-red-500 text-xs mt-1">{errors.distributor_id.message}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input id="gst_number" {...register('gst_number')} />
            {errors.gst_number && <p className="text-red-500 text-xs mt-1">{errors.gst_number.message}</p>}
          </div>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
