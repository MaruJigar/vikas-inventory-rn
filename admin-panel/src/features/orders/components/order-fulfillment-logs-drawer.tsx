import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useFulfillmentLogsQuery } from '@/hooks/orders/useFulfillmentLogsQuery';
import { OrderDto, FulfillmentLogDto } from '@/types/api/order.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Package, Truck, CheckCircle, PackageOpen } from 'lucide-react';
import { format } from 'date-fns';

interface OrderFulfillmentLogsDrawerProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderFulfillmentLogsDrawer({ order, isOpen, onClose }: OrderFulfillmentLogsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Fulfillment Logs</SheetTitle>
          <SheetDescription>
            Audit trail of fulfillment actions for order {order?.order_number}.
          </SheetDescription>
        </SheetHeader>

        {order && (
          <div className="space-y-6">
            <div className="bg-slate-50 border rounded-md p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-slate-500">Shop</div>
                <div className="font-medium">{order.shop?.name || 'N/A'}</div>
                
                <div className="text-slate-500">Salesman</div>
                <div className="font-medium">{order.salesman?.full_name || 'N/A'}</div>
                
                <div className="text-slate-500">Distributor</div>
                <div className="font-medium">{order.distributor?.business_name || 'N/A'}</div>
              </div>
            </div>

            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Timeline</h3>
            <FulfillmentLogsTimeline orderId={order.id} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function FulfillmentLogsTimeline({ orderId }: { orderId: string }) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useFulfillmentLogsQuery(orderId, { page, limit });

  if (isLoading) {
    return (
      <div className="space-y-6 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="w-px h-16 flex-1 my-2" />
            </div>
            <div className="flex-1 space-y-2 pb-6">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm mt-4">
        Error loading fulfillment logs: {error?.message || 'Unknown error'}
      </div>
    );
  }

  const logs = data?.data || [];
  const meta = data?.meta;

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 italic border rounded-md bg-slate-50 mt-4">
        No fulfillment logs found
      </div>
    );
  }

  const getIconForAction = (action: string) => {
    switch (action) {
      case 'PACKED':
        return <Package className="h-3 w-3 text-white" />;
      case 'DISPATCHED':
        return <Truck className="h-3 w-3 text-white" />;
      case 'DELIVERED':
        return <CheckCircle className="h-3 w-3 text-white" />;
      default:
        return <PackageOpen className="h-3 w-3 text-white" />;
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-3">
        {logs.map((log: FulfillmentLogDto) => (
          <div key={log.id} className="relative">
            <div className="absolute -left-[35px] top-1 h-6 w-6 flex items-center justify-center rounded-full bg-blue-500 border-2 border-white ring-4 ring-slate-50">
              {getIconForAction(log.action)}
            </div>
            <div className="bg-white border rounded-md p-4 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm text-slate-900">
                    {log.action}
                  </div>
                  {log.old_status && log.new_status && (
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="bg-slate-100 px-1 rounded">{log.old_status}</span>
                      <span>→</span>
                      <span className="bg-blue-50 text-blue-700 px-1 rounded">{log.new_status}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400 text-right">
                  {format(new Date(log.created_at), 'dd MMM yyyy')}
                  <br />
                  {format(new Date(log.created_at), 'hh:mm a')}
                </div>
              </div>
              
              <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md">
                <div className="flex justify-between">
                  <span>
                    <span className="font-medium text-slate-700">Performed By:</span>{' '}
                    {log.performed_by_user?.full_name || 'System'}
                  </span>
                  {log.quantity != null && (
                    <span>
                      <span className="font-medium text-slate-700">Qty:</span> {log.quantity}
                    </span>
                  )}
                </div>
                {log.distributor?.business_name && (
                  <div className="mt-1">
                    <span className="font-medium text-slate-700">Distributor:</span>{' '}
                    {log.distributor.business_name}
                  </div>
                )}
              </div>

              {log.notes && (
                <div className="text-xs text-slate-600 mt-2 bg-yellow-50/50 p-2 rounded border border-yellow-100">
                  <span className="font-medium text-slate-700 block mb-0.5">Notes:</span>
                  {log.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-6 border-t">
          <div className="text-xs text-slate-500">
            Page {meta.page} of {meta.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!meta.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!meta.hasNextPage}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
