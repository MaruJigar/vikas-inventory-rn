'use client';

import { useForm, Controller } from 'react-hook-form';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateOrderStatusMutation } from '@/hooks/order-statuses/useOrderStatuses';
import { CreateOrderStatusDto } from '@/types/api/order-status.types';

interface CreateOrderStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrderStatusDrawer({ isOpen, onClose }: CreateOrderStatusDrawerProps) {
  const { mutate: createStatus, isPending } = useCreateOrderStatusMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateOrderStatusDto>({
    defaultValues: {
      name: '',
      sequence: 1,
      isactive: true,
      can_cancel_order: false,
      is_cancel_status: false,
      is_dispatch_status: false,
    },
  });

  const onSubmit = (data: CreateOrderStatusDto) => {
    createStatus(
      {
        ...data,
        sequence: Number(data.sequence),
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <EntityFormDrawer
      title="Create Order Status"
      description="Add a new stage to the order lifecycle flow."
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      width="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Status Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Processing, Shipped, Delivered"
              {...register('name', { required: 'Status name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sequence">
              Sequence Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sequence"
              type="number"
              min={1}
              placeholder="1"
              {...register('sequence', {
                required: 'Sequence is required',
                min: { value: 1, message: 'Sequence must be 1 or greater' },
                valueAsNumber: true,
              })}
            />
            {errors.sequence && (
              <p className="text-sm text-destructive">{errors.sequence.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Determines the ordering progression of orders through the pipeline.
            </p>
          </div>

          <div className="rounded-lg border p-4 space-y-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isactive" className="cursor-pointer">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Allow orders to transition into this status.
                </p>
              </div>
              <Controller
                name="isactive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isactive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="can_cancel_order" className="cursor-pointer">Can Cancel Order</Label>
                <p className="text-xs text-muted-foreground">
                  Allow users to cancel orders while in this status.
                </p>
              </div>
              <Controller
                name="can_cancel_order"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="can_cancel_order"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_cancel_status" className="cursor-pointer">Cancellation Status</Label>
                <p className="text-xs text-muted-foreground">
                  Designate this as the final terminal cancelled state.
                </p>
              </div>
              <Controller
                name="is_cancel_status"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_cancel_status"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_dispatch_status" className="cursor-pointer">Dispatch Status</Label>
                <p className="text-xs text-muted-foreground">
                  Mark that items are dispatched / out for delivery.
                </p>
              </div>
              <Controller
                name="is_dispatch_status"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_dispatch_status"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Status'}
          </Button>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
