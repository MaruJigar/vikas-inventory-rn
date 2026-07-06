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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { OrderDto } from '@/types/api/order.types';
import { useCancelOrderMutation } from '@/hooks/orders/useCancelOrderMutation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const cancelSchema = z.object({
  cancellationReason: z.string().min(5, 'Reason must be at least 5 characters').max(500, 'Reason cannot exceed 500 characters'),
});

type CancelFormValues = z.infer<typeof cancelSchema>;

interface CancelOrderDialogProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CancelOrderDialog({ order, isOpen, onClose }: CancelOrderDialogProps) {
  const { mutate: cancelOrder, isPending } = useCancelOrderMutation(order?.id || null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CancelFormValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { cancellationReason: '' },
  });

  const onOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      reset();
      onClose();
    }
  };

  const onSubmit = (data: CancelFormValues) => {
    if (!order) return;
    cancelOrder(
      { cancellationReason: data.cancellationReason },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  if (!order) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Order</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Reserved inventory will be released.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="cancel-order-form" onSubmit={handleSubmit(onSubmit)}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellationReason" className={errors.cancellationReason ? "text-red-500" : ""}>
                Cancellation Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancellationReason"
                placeholder="Enter reason for cancellation..."
                className={errors.cancellationReason ? "border-red-500 focus-visible:ring-red-500" : ""}
                {...register('cancellationReason')}
                disabled={isPending}
              />
              {errors.cancellationReason && (
                <p className="text-red-500 text-sm">{errors.cancellationReason.message}</p>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} type="button">
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? 'Cancelling...' : 'Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
