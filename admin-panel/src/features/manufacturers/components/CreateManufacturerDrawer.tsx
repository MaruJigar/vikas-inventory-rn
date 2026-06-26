import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createManufacturerSchema, CreateManufacturerValues } from '@/lib/validation/manufacturers/schema';
import { useCreateManufacturerMutation } from '@/hooks/manufacturers/useCreateManufacturerMutation';
import { Textarea } from '@/components/ui/textarea';

interface CreateManufacturerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateManufacturerDrawer({ isOpen, onClose }: CreateManufacturerDrawerProps) {
  const { mutate: createManufacturer, isPending } = useCreateManufacturerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateManufacturerValues>({
    resolver: zodResolver(createManufacturerSchema),
    defaultValues: {
      company_name: '',
      password: '',
      contact_person: '',
      phone: '',
      email: '',
      gst_number: '',
      address: '',
      city: '',
      state: '',
      country: '',
    },
  });

  const onSubmit = (data: CreateManufacturerValues) => {
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
      country: data.country || undefined,
    };

    createManufacturer(sanitizedData, {
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
      title="Create Manufacturer"
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      width="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6 pb-20">
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Required Information</h3>
          
          <div className="grid gap-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" {...register('company_name')} placeholder="e.g. Acme Corp" />
            {errors.company_name && <p className="text-sm text-red-500">{errors.company_name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" {...register('password')} placeholder="Minimum 8 characters" />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information (Optional)</h3>
          
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
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Address (Optional)</h3>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Street Address</Label>
            <Textarea id="address" {...register('address')} placeholder="e.g. 123 Main St" />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} placeholder="e.g. Mumbai" />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} placeholder="e.g. Maharashtra" />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register('country')} placeholder="e.g. India" />
            {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Manufacturer'}
          </Button>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
