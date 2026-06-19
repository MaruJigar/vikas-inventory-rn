'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateSalesmanSchema, UpdateSalesmanInput } from '@/lib/validation/salesmen/schema';
import { useUpdateSalesmanMutation } from '@/hooks/salesmen/useUpdateSalesmanMutation';
import { useSalesmanQuery } from '@/hooks/salesmen/useSalesmanQuery';

interface EditSalesmanDrawerProps {
  salesmanId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditSalesmanDrawer({ salesmanId, isOpen, onClose }: EditSalesmanDrawerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: response, isLoading: isFetching } = useSalesmanQuery(salesmanId || '');
  const salesman = response?.data;

  const updateSalesmanMutation = useUpdateSalesmanMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSalesmanInput>({
    resolver: zodResolver(updateSalesmanSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
    },
  });

  // Pre-fill existing values
  useEffect(() => {
    if (salesman && isOpen) {
      reset({
        full_name: salesman.full_name || '',
        email: salesman.email || '',
        phone: salesman.phone || '',
      });
    }
  }, [salesman, isOpen, reset]);

  const onSubmit = async (data: UpdateSalesmanInput) => {
    if (!salesmanId) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Clean up empty strings to undefined if backend treats them differently, 
    // but DTO supports strings and we defined optional().or(z.literal(''))
    // Actually, we can just pass the data as is.
    
    // Only include properties that were actually changed to be clean, 
    // or just pass the whole valid payload.
    const payload = {
      full_name: data.full_name || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };

    try {
      await updateSalesmanMutation.mutateAsync({ id: salesmanId, data: payload });
      setSuccessMsg('Salesman updated successfully.');
      setTimeout(() => {
        reset();
        onClose();
      }, 1500);
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
      {isFetching ? (
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
              <Input id="edit_phone" type="tel" {...register('phone')} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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
