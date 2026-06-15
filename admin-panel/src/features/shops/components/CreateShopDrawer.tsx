'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createShopSchema, CreateShopFormValues } from '@/lib/validation/shops/schema';
import { useCreateShopMutation } from '@/hooks/shops/useCreateShopMutation';
import { useUploadShopImageMutation } from '@/hooks/shops/useUploadShopImageMutation';
import { useCheckDuplicateMutation } from '@/hooks/shops/useCheckDuplicateMutation';
import { useQueryClient } from '@tanstack/react-query';
import { shopsKeys } from '@/lib/query-keys/shops';

interface CreateShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateShopDrawer({ isOpen, onClose }: CreateShopDrawerProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const createShopMutation = useCreateShopMutation();
  const uploadImageMutation = useUploadShopImageMutation();
  const checkDuplicateMutation = useCheckDuplicateMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateShopFormValues>({
    // @ts-expect-error ZodResolver type mismatch with coerced numbers
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      shop_name: '',
      owner_name: '',
      mobile_number: '',
      address: '',
    },
  });

  const verificationImage = watch('verification_image');

  const onSubmit = async (data: CreateShopFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Duplicate Check
      const isDuplicate = await checkDuplicateMutation.mutateAsync({
        name: data.shop_name,
        phone: data.mobile_number,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      if (isDuplicate) {
        setErrorMsg('Warning: A shop with similar details already exists.');
        return; // Stop workflow
      }

      // 2. Create Shop
      const shopPayload = {
        name: data.shop_name,
        owner_name: data.owner_name,
        phone: data.mobile_number,
        address: data.address,
        city: '',
        state: '',
        gst_number: '',
        latitude: data.latitude,
        longitude: data.longitude,
        verification_photo_url: undefined, 
      };

      const createdShop = await createShopMutation.mutateAsync(shopPayload);

      // 3. Upload Image
      if (data.verification_image && createdShop.data.id) {
        try {
          const formData = new FormData();
          formData.append('file', data.verification_image);
          
          await uploadImageMutation.mutateAsync({
            shopId: createdShop.data.id,
            formData,
          });

          setSuccessMsg('Shop created successfully. Verification image uploaded.');
            queryClient.invalidateQueries({ queryKey: shopsKeys.all });
          setTimeout(() => {
            reset();
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
      setValue('verification_image', file, { shouldValidate: true });
    }
  };

    // @ts-expect-error type mismatch
    const formSubmit = handleSubmit(onSubmit);

  return (
    <EntityFormDrawer
      title="Create New Shop"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      <form 
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
          <div>
            <Label htmlFor="shop_name">Shop Name *</Label>
            <Input id="shop_name" {...register('shop_name')} />
            {errors.shop_name && <p className="text-red-500 text-xs mt-1">{errors.shop_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="owner_name">Owner Name</Label>
            <Input id="owner_name" {...register('owner_name')} />
            {errors.owner_name && <p className="text-red-500 text-xs mt-1">{errors.owner_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="mobile_number">Mobile Number *</Label>
            <Input id="mobile_number" {...register('mobile_number')} />
            {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number.message}</p>}
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude *</Label>
              <Input id="latitude" type="number" step="any" {...register('latitude')} />
              {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <Label htmlFor="longitude">Longitude *</Label>
              <Input id="longitude" type="number" step="any" {...register('longitude')} />
              {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="verification_image">Verification Image *</Label>
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
            {errors.verification_image && (
              <p className="text-red-500 text-xs mt-1">{errors.verification_image?.message as string}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Shop'}
          </Button>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
