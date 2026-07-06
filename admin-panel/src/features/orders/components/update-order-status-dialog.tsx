import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { OrderDto, UpdateOrderStatusDto } from '@/types/api/order.types';
import { useUpdateOrderStatusMutation } from '@/hooks/orders/useUpdateOrderStatusMutation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface UpdateOrderStatusDialogProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['CONFIRMED'],
  CONFIRMED: ['PROCESSING'],
  PROCESSING: ['PACKED'],
  PACKED: ['DISPATCHED'],
  DISPATCHED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Created',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function UpdateOrderStatusDialog({ order, isOpen, onClose }: UpdateOrderStatusDialogProps) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatusMutation(order?.id || null);

  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    mode: 'onChange',
  });

  const availableTransitions = order ? (ALLOWED_STATUS_TRANSITIONS[order.status] || []) : [];

  useEffect(() => {
    if (isOpen) {
      reset({ status: undefined, notes: '' });
    }
  }, [isOpen, reset]);

  const onOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      reset();
      onClose();
    }
  };

  const onSubmit = (data: StatusFormValues) => {
    if (!order) return;
    updateStatus(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  if (!order) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Order Status</AlertDialogTitle>
          <AlertDialogDescription>
            Advance the order fulfillment lifecycle.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="update-status-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-md text-sm border space-y-1">
              <div className="font-medium text-slate-900">
                Order: {order.order_number}
              </div>
              <div className="text-slate-600">
                Shop: <span className="font-medium">{order.shop?.name || 'N/A'}</span>
              </div>
              <div className="text-slate-600">
                Salesman: <span className="font-medium">{order.salesman?.full_name || 'N/A'}</span>
              </div>
              <div className="text-slate-600">
                Distributor: <span className="font-medium">{order.distributor?.business_name || 'N/A'}</span>
              </div>
              <div className="mt-2 pt-2 border-t text-slate-700">
                Current Status: <span className="font-bold">{STATUS_LABELS[order.status] || order.status}</span>
              </div>
            </div>

            {availableTransitions.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="status" className={errors.status ? "text-red-500" : ""}>
                    New Status <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select next status..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTransitions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status] || status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="notes" className={errors.notes ? "text-red-500" : ""}>
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes..."
                    className={errors.notes ? "border-red-500 focus-visible:ring-red-500" : ""}
                    {...register('notes')}
                    disabled={isPending}
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-sm">{errors.notes.message}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 italic border rounded-md bg-slate-50">
                No further status transitions are available for this order.
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} type="button">
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={isPending || availableTransitions.length === 0 || !isValid}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? 'Updating...' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
