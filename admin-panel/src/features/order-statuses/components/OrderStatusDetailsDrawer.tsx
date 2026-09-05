'use client';

import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { OrderStatusDto } from '@/types/api/order-status.types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface OrderStatusDetailsDrawerProps {
  status: OrderStatusDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderStatusDetailsDrawer({
  status,
  isOpen,
  onClose,
}: OrderStatusDetailsDrawerProps) {
  if (!status) return null;

  return (
    <EntityFormDrawer
      title="Order Status Details"
      description="View configured properties and flow attributes of this order status."
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      <div className="mt-4 space-y-6">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Status Name</span>
            <span className="col-span-2 font-semibold text-slate-900">{status.name}</span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Sequence</span>
            <span className="col-span-2">
              <Badge variant="outline" className="font-mono font-medium">
                #{status.sequence}
              </Badge>
            </span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">State</span>
            <span className="col-span-2">
              {status.isactive ? (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Can Cancel</span>
            <span className="col-span-2">
              {status.can_cancel_order ? (
                <Badge variant="outline" className="text-sky-700 border-sky-300 bg-sky-50">
                  Yes
                </Badge>
              ) : (
                <span className="text-muted-foreground">No</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Special Type</span>
            <span className="col-span-2">
              {status.is_cancel_status ? (
                <Badge variant="destructive">Cancellation</Badge>
              ) : status.is_dispatch_status ? (
                <Badge className="bg-amber-600 hover:bg-amber-700 text-white">Dispatch</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Created Date</span>
            <span className="col-span-2 text-slate-700">
              {formatDate(status.created_at)}
            </span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Updated Date</span>
            <span className="col-span-2 text-slate-700">
              {formatDate(status.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </EntityFormDrawer>
  );
}
