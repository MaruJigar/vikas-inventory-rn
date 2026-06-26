import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateDistributorSchema, UpdateDistributorFormValues } from '@/lib/validation/distributors/schema';
import { useUpdateDistributorMutation } from '@/hooks/distributors/useUpdateDistributorMutation';
import { useDistributorQuery } from '@/hooks/distributors/useDistributorQuery';
import { Textarea } from '@/components/ui/textarea';

interface EditDistributorDrawerProps {
  distributorId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditDistributorDrawer({ distributorId, isOpen, onClose }: EditDistributorDrawerProps) {
  const { data: distributor, isLoading } = useDistributorQuery(distributorId || undefined);
  const { mutate: updateDistributor, isPending } = useUpdateDistributorMutation(distributorId || '');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateDistributorFormValues>({
    resolver: zodResolver(updateDistributorSchema),
    defaultValues: {
      business_name: '',
      owner_name: '',
      phone: '',
      email: '',
      gst_number: '',
      address: '',
      city: '',
      state: '',
      country: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (distributor) {
      reset({
        business_name: distributor.business_name || '',
        owner_name: distributor.owner_name || '',
        phone: distributor.phone || '',
        email: distributor.email || '',
        gst_number: distributor.gst_number || '',
        address: distributor.address || '',
        city: distributor.city || '',
        state: distributor.state || '',
        country: distributor.country || '',
        is_active: distributor.is_active,
      });
    }
  }, [distributor, reset]);

  const onSubmit = (data: UpdateDistributorFormValues) => {
    const sanitizedData = {
      ...data,
      owner_name: data.owner_name || undefined,
      gst_number: data.gst_number || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
    };

    updateDistributor(sanitizedData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <EntityFormDrawer
      title="Edit Distributor"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6 pb-20">
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Required Information</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="edit_business_name">Business Name *</Label>
              <Input id="edit_business_name" {...register('business_name')} placeholder="e.g. Acme Corp" />
              {errors.business_name && <p className="text-sm text-red-500">{errors.business_name.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_owner_name">Owner Name *</Label>
                <Input id="edit_owner_name" {...register('owner_name')} placeholder="e.g. John Doe" />
                {errors.owner_name && <p className="text-sm text-red-500">{errors.owner_name.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_phone">Phone *</Label>
                <Input id="edit_phone" {...register('phone')} placeholder="e.g. +91 9876543210" />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_email">Email *</Label>
              <Input id="edit_email" type="email" {...register('email')} placeholder="e.g. hello@acme.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit_gst_number">GST Number</Label>
              <Input id="edit_gst_number" {...register('gst_number')} placeholder="e.g. 27AADCB2230M1Z2" />
              {errors.gst_number && <p className="text-sm text-red-500">{errors.gst_number.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Address (Optional)</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="edit_address">Street Address</Label>
              <Textarea id="edit_address" {...register('address')} placeholder="e.g. 123 Main St" />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_city">City</Label>
                <Input id="edit_city" {...register('city')} placeholder="e.g. Mumbai" />
                {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_state">State</Label>
                <Input id="edit_state" {...register('state')} placeholder="e.g. Maharashtra" />
                {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_country">Country</Label>
              <Input id="edit_country" {...register('country')} placeholder="e.g. India" />
              {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Account Status</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Active Account</Label>
                <p className="text-sm text-slate-500">
                  {isActive 
                    ? 'Distributor can log in and manage their account.' 
                    : 'Distributor cannot log in. Their data remains in the system.'}
                </p>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })} 
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
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
