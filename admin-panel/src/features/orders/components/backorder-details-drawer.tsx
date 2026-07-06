import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useBackorderQuery } from '@/hooks/orders/useBackorderQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { Package, Store, ArrowRightLeft } from 'lucide-react';

interface BackorderDetailsDrawerProps {
  backorderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BackorderDetailsDrawer({ backorderId, isOpen, onClose }: BackorderDetailsDrawerProps) {
  const { data, isLoading, isError } = useBackorderQuery(backorderId);
  const backorder = data?.data;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Backorder Details</SheetTitle>
          <SheetDescription>
            Detailed view of product allocation backlog.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100">
            Failed to load backorder details.
          </div>
        ) : backorder ? (
          <div className="space-y-6">
            
            {/* Section 1: Backorder Summary */}
            <section className="bg-slate-50 border rounded-lg p-5">
              <h3 className="flex items-center text-sm font-semibold text-slate-800 mb-4">
                <ArrowRightLeft className="mr-2 h-4 w-4 text-blue-500" />
                Backorder Summary
              </h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Status</div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
                    ${backorder.status === 'RESOLVED' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    ${backorder.status === 'PARTIALLY_ALLOCATED' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                    ${backorder.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                    ${backorder.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                  `}>
                    {backorder.status}
                  </span>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Created Date</div>
                  <div className="font-medium text-slate-900">{formatDate(backorder.created_at)}</div>
                </div>
                {backorder.resolved_at && (
                  <div>
                    <div className="text-slate-500 mb-1">Resolved Date</div>
                    <div className="font-medium text-slate-900">{formatDate(backorder.resolved_at)}</div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: Product Information */}
            <section className="bg-white border rounded-lg p-5 shadow-sm">
              <h3 className="flex items-center text-sm font-semibold text-slate-800 mb-4 border-b pb-2">
                <Package className="mr-2 h-4 w-4 text-slate-500" />
                Product Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium text-slate-900 text-right">{backorder.product?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SKU</span>
                  <span className="font-medium text-slate-900 text-right">{backorder.product?.sku || 'N/A'}</span>
                </div>
              </div>
            </section>

            {/* Section 3: Sales Context */}
            <section className="bg-white border rounded-lg p-5 shadow-sm">
              <h3 className="flex items-center text-sm font-semibold text-slate-800 mb-4 border-b pb-2">
                <Store className="mr-2 h-4 w-4 text-slate-500" />
                Sales Context
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-medium text-slate-900 text-right">{backorder.order?.order_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distributor</span>
                  <span className="font-medium text-slate-900 text-right">{backorder.distributor?.business_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Salesman</span>
                  <span className="font-medium text-slate-900 text-right">{backorder.order?.salesman?.full_name || 'N/A'}</span>
                </div>
              </div>
            </section>

            {/* Section 4: Allocation Status */}
            <section className="bg-slate-50 border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Allocation Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Requested</span>
                  <span className="text-lg font-semibold text-slate-900">{backorder.quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Allocated / Resolved</span>
                  <span className="text-lg font-bold text-blue-600">{backorder.resolved_quantity}</span>
                </div>
                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">Remaining</span>
                  <span className="text-xl font-bold text-red-600">
                    {Number(backorder.quantity) - Number(backorder.resolved_quantity)}
                  </span>
                </div>
              </div>
            </section>

          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
