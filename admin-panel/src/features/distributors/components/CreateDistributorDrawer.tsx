import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { MultiSelect } from '@/components/ui/multi-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createDistributorSchema, CreateDistributorFormValues } from '@/lib/validation/distributors/schema';
import { useCreateDistributorMutation } from '@/hooks/distributors/useCreateDistributorMutation';
import { Textarea } from '@/components/ui/textarea';
import { LocationSelector } from '@/components/shared/LocationSelector';

interface CreateDistributorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDistributorDrawer({ isOpen, onClose }: CreateDistributorDrawerProps) {
  const { mutate: createDistributor, isPending } = useCreateDistributorMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateDistributorFormValues>({
    resolver: zodResolver(createDistributorSchema),
    defaultValues: {
      business_name: '',
      password: '',
      owner_name: '',
      phone: '',
      email: '',
      gst_number: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      manufacturer_ids: [],
    },
  });

  const { data: manufacturersRes, isLoading: isManufacturersLoading } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => manufacturerService.getManufacturers({ limit: 1000 }),
  });
  
  const manufacturerOptions = manufacturersRes?.data?.map((m: any) => ({
    label: m.company_name || m.business_name || m.owner_name || m.id,
    value: m.id,
  })) || [];

  const onSubmit = (data: CreateDistributorFormValues) => {
    const sanitizedData = {
      ...data,
      owner_name: data.owner_name || undefined,
      gst_number: data.gst_number || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || 'India',
      pincode: data.pincode || undefined,
    };

    createDistributor(sanitizedData, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <EntityFormDrawer
      title="Create Distributor"
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      width="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6 pb-20">
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Required Information</h3>
          
          <div className="grid gap-2">
            <Label htmlFor="business_name">Business Name *</Label>
            <Input id="business_name" {...register('business_name')} placeholder="e.g. Acme Corp" />
            {errors.business_name && <p className="text-sm text-red-500">{errors.business_name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" {...register('password')} placeholder="Minimum 6 characters" />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Manufacturer Assignment</h3>
          
          <div className="grid gap-2">
            <Label htmlFor="manufacturer_ids">Manufacturers *</Label>
            <Controller
              name="manufacturer_ids"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={manufacturerOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder={isManufacturersLoading ? "Loading..." : "Select manufacturers"}
                />
              )}
            />
            {errors.manufacturer_ids && <p className="text-sm text-red-500">{errors.manufacturer_ids.message}</p>}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="owner_name">Owner Name *</Label>
              <Input id="owner_name" {...register('owner_name')} placeholder="e.g. John Doe" />
              {errors.owner_name && <p className="text-sm text-red-500">{errors.owner_name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...register('phone')} placeholder="e.g. +91 9876543210" />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
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
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Address (Optional)</h3>
          
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
            {isPending ? 'Creating...' : 'Create Distributor'}
          </Button>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
