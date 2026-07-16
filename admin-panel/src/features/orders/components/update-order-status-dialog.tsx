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
import { useCancelOrderMutation } from '@/hooks/orders/useCancelOrderMutation';
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
  status: z.enum(['PENDING', 'ORDERED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface UpdateOrderStatusDialogProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING'],
  PENDING: ['ORDERED'],
  ORDERED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  ORDERED: 'Ordered',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function UpdateOrderStatusDialog({ order, isOpen, onClose }: UpdateOrderStatusDialogProps) {
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatusMutation(order?.id || null);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrderMutation(order?.id || null);
  const isPending = isUpdating || isCancelling;

  const { register, handleSubmit, reset, control, formState: { errors, isValid } } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    mode: 'onChange',
  });

  const statusStr = order ? (typeof order.status === 'object' ? (order.status as any)?.name : order.status) : '';
  const canCancel = order && typeof order.status === 'object' && (order.status as any)?.can_cancel_order;
  
  const availableTransitions = [...(statusStr ? (ALLOWED_STATUS_TRANSITIONS[statusStr] || []) : [])];
  if (canCancel && !availableTransitions.includes('CANCELLED')) {
    availableTransitions.push('CANCELLED');
  }

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
    
    const onSuccess = () => {
      reset();
      onClose();
    };

    if (data.status === 'CANCELLED') {
      cancelOrder({ cancellationReason: data.notes || 'Cancelled via status update' }, { onSuccess });
    } else {
      updateStatus(data, { onSuccess });
    }
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
                Current Status: <span className="font-bold">{STATUS_LABELS[statusStr] || statusStr}</span>
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
                        value={field.value || ''}
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
