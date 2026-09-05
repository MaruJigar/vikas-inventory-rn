'use client';

import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createShopSchema, createShopBaseSchema, CreateShopInput } from '@/lib/validations/shop.schema';
import { useCreateShopMutation } from '@/hooks/shops/useCreateShopMutation';
import { useUploadShopImageMutation } from '@/hooks/shops/useUploadShopImageMutation';
import { useCheckDuplicateMutation } from '@/hooks/shops/useCheckDuplicateMutation';
import { useQueryClient } from '@tanstack/react-query';
import { shopsKeys } from '@/lib/query-keys/shops';
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

interface CreateShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateShopDrawer({ isOpen, onClose }: CreateShopDrawerProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const { data: distributorsRes, isLoading: isLoadingDistributors } = useDistributorsQuery({ limit: 100 });
  const distributors = distributorsRes?.data || [];

  const createShopMutation = useCreateShopMutation();
  const uploadImageMutation = useUploadShopImageMutation();
  const checkDuplicateMutation = useCheckDuplicateMutation();

  const dynamicSchema = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let schema: any = createShopBaseSchema;

    if (user?.role === 'SUPER_ADMIN') {
      // @ts-ignore
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
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateShopInput>({
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
      maps_link: '',
      distributor_id: '',
    },
  });


  const selectedStateId = watch('state_id');
  const { data: states, isLoading: isLoadingStates } = useStates({ enabled: isOpen });
  const { data: cities, isLoading: isLoadingCities } = useCities(selectedStateId, { enabled: isOpen });

  const [verificationImage, setVerificationImage] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        owner_name: '',
        phone: '',
        address: '',
        city_id: '',
        state_id: '',
        gst_number: '',
        maps_link: '',
        distributor_id: '',
      });
      setErrorMsg(null);
      setSuccessMsg(null);
      setVerificationImage(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateShopInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Duplicate Check
      const isDuplicate = await checkDuplicateMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
        city_id: data.city_id,
        state_id: data.state_id,
      });

      if (Array.isArray(isDuplicate) && isDuplicate.length > 0) {
        setErrorMsg('Warning: A shop with similar details already exists.');
        return; // Stop workflow
      }

      const stateName = states?.find(s => s.id === data.state_id)?.name;
      const cityName = cities?.find(c => c.id === data.city_id)?.name;

      // 2. Create Shop
      const shopPayload = {
        name: data.name,
        owner_name: data.owner_name || undefined,
        phone: data.phone,
        address: data.address,
        city_id: data.city_id,
        state_id: data.state_id,
        city: cityName,
        state: stateName,
        gst_number: data.gst_number || undefined,
        maps_link: data.maps_link || undefined,
        distributor_id: data.distributor_id || undefined,
        verification_photo_url: undefined,
      };

      const createdShop = await createShopMutation.mutateAsync(shopPayload);

      // 3. Upload Image
      if (verificationImage && createdShop.id) {
        try {
          const formData = new FormData();
          formData.append('file', verificationImage);

          await uploadImageMutation.mutateAsync({
            shopId: createdShop.id,
            formData,
          });

          setSuccessMsg('Shop created successfully. Verification image uploaded.');
          queryClient.invalidateQueries({ queryKey: shopsKeys.all });
          setTimeout(() => {
            reset();
            setVerificationImage(null);
            onClose();
          }, 1500);
        } catch {
          setErrorMsg('Failed to upload verification image. Please retry.');
          // Shop already created, don't block. Let user know they can retry later.
          queryClient.invalidateQueries({ queryKey: shopsKeys.all });
        }
      } else {
        setSuccessMsg('Shop created successfully.');
        queryClient.invalidateQueries({ queryKey: shopsKeys.all });
        setTimeout(() => {
          reset();
          setVerificationImage(null);
          onClose();
        }, 1500);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMsg = axiosErr?.response?.data?.message || (err as Error).message || 'Shop creation failed';
      setErrorMsg(errorMsg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerificationImage(file);
    }
  };

  // type mismatch
  const formSubmit = handleSubmit(onSubmit);

  return (
    <EntityFormDrawer
      title="Create New Shop"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-shop-form" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Shop'}
          </Button>
        </div>
      }
    >
      <form
        id="create-shop-form"
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
                render={({ field }) => {
                  return (
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
                  );
                }}
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

          <div className="space-y-1.5">
            <Label htmlFor="maps_link">Maps Link (URL)</Label>
            <Input id="maps_link" {...register('maps_link')} />
            {errors.maps_link && <p className="text-red-500 text-xs mt-1">{errors.maps_link.message}</p>}
          </div>


          <div className="space-y-1.5">
            <Label htmlFor="verification_image">Verification Image</Label>
            <Input
              id="verification_image"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
            />
            {verificationImage && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {verificationImage.name}
              </p>
            )}
          </div>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
