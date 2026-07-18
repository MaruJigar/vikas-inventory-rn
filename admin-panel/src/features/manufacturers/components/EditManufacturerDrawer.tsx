import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateManufacturerSchema, UpdateManufacturerValues } from '@/lib/validation/manufacturers/schema';
import { useUpdateManufacturerMutation } from '@/hooks/manufacturers/useUpdateManufacturerMutation';
import { Textarea } from '@/components/ui/textarea';
import { useManufacturerQuery } from '@/hooks/manufacturers/useManufacturerQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { LocationSelector } from '@/components/shared/LocationSelector';
import { Controller } from 'react-hook-form';

interface EditManufacturerDrawerProps {
  manufacturerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditManufacturerDrawer({ manufacturerId, isOpen, onClose }: EditManufacturerDrawerProps) {
  const { data: manufacturer, isLoading: isLoadingManufacturer } = useManufacturerQuery(manufacturerId || undefined);
  
  const { mutate: updateManufacturer, isPending } = useUpdateManufacturerMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<UpdateManufacturerValues>({
    resolver: zodResolver(updateManufacturerSchema),
    defaultValues: {
      company_name: '',
      contact_person: '',
      phone: '',
      email: '',
      gst_number: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (manufacturer) {
      reset({
        company_name: manufacturer.company_name,
        contact_person: manufacturer.contact_person || '',
        phone: manufacturer.phone || '',
        email: manufacturer.email || '',
        gst_number: manufacturer.gst_number || '',
        address: manufacturer.address || '',
        city: manufacturer.city || '',
        state: manufacturer.state || '',
        country: manufacturer.country || 'India',
        pincode: manufacturer.pincode || '',
        is_active: manufacturer.is_active,
      });
    }
  }, [manufacturer, reset]);

  const onSubmit = (data: UpdateManufacturerValues) => {
    if (!manufacturerId) return;
    
    // Sanitize optional fields
    const sanitizedData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      contact_person: data.contact_person || undefined,
      gst_number: data.gst_number || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || 'India',
      pincode: data.pincode || undefined,
    };

    updateManufacturer({ id: manufacturerId, data: sanitizedData }, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (manufacturer) {
      reset({
        company_name: manufacturer.company_name,
        contact_person: manufacturer.contact_person || '',
        phone: manufacturer.phone || '',
        email: manufacturer.email || '',
        gst_number: manufacturer.gst_number || '',
        address: manufacturer.address || '',
        city: manufacturer.city || '',
        state: manufacturer.state || '',
        country: manufacturer.country || 'India',
        pincode: manufacturer.pincode || '',
        is_active: manufacturer.is_active,
      });
    }
    onClose();
  };

  return (
    <EntityFormDrawer
      title="Edit Manufacturer"
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      width="md"
    >
      {isLoadingManufacturer && manufacturerId ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6 pb-20">
          <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50">
            <div className="space-y-0.5">
              <Label className="text-base">Status</Label>
              <p className="text-sm text-muted-foreground">
                Activate or deactivate this manufacturer
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked, { shouldValidate: true, shouldDirty: true })}
                disabled={isPending}
              />
              <span className="text-sm font-medium w-12">{isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Required Information</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input id="company_name" {...register('company_name')} placeholder="e.g. Acme Corp" />
              {errors.company_name && <p className="text-sm text-red-500">{errors.company_name.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input id="contact_person" {...register('contact_person')} placeholder="e.g. John Doe" />
                {errors.contact_person && <p className="text-sm text-red-500">{errors.contact_person.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} placeholder="e.g. +91 9876543210" />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="e.g. hello@acme.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <Input id="gst_number" {...register('gst_number')} placeholder="e.g. 27AADCB2230M1Z2" />
              {errors.gst_number && <p className="text-sm text-red-500">{errors.gst_number.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Address</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Street Address</Label>
              <Textarea id="address" {...register('address')} placeholder="e.g. 123 Main St" />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <Controller
              name="state"
              control={control}
              render={({ field: stateField }) => (
                <Controller
                  name="city"
                  control={control}
                  render={({ field: cityField }) => (
                    <LocationSelector
                      stateValue={stateField.value || ''}
                      cityValue={cityField.value || ''}
                      onStateChange={stateField.onChange}
                      onCityChange={cityField.onChange}
                      disabled={isPending}
                    />
                  )}
                />
              )}
            />

            <div className="grid gap-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register('pincode')} placeholder="e.g. 400001" maxLength={10} />
              {errors.pincode && <p className="text-sm text-red-500">{errors.pincode.message}</p>}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </EntityFormDrawer>
  );
}
