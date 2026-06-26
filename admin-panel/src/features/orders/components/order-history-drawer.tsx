import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrderRevisionsQuery } from '@/hooks/orders/useOrderRevisionsQuery';
import { useOrderStatusHistoryQuery } from '@/hooks/orders/useOrderStatusHistoryQuery';
import { OrderDto, OrderRevisionDto, OrderStatusHistoryDto } from '@/types/api/order.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface OrderHistoryDrawerProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderHistoryDrawer({ order, isOpen, onClose }: OrderHistoryDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Order History</SheetTitle>
          <SheetDescription>
            View revisions and lifecycle progression for {order?.order_number}.
          </SheetDescription>
        </SheetHeader>

        {order ? (
          <Tabs defaultValue="revisions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="revisions">Revision History</TabsTrigger>
              <TabsTrigger value="timeline">Status Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="revisions" className="mt-0">
              <RevisionHistoryTab orderId={order.id} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-0">
              <StatusTimelineTab orderId={order.id} />
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function RevisionHistoryTab({ orderId }: { orderId: string }) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useOrderRevisionsQuery(orderId, { page, limit });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
        Error loading revisions: {error?.message || 'Unknown error'}
      </div>
    );
  }

  const revisions = data?.data || [];
  const meta = data?.meta;

  if (revisions.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 italic border rounded-md bg-slate-50">
        No revisions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {revisions.map((rev: OrderRevisionDto) => (
          <div key={rev.id} className="border rounded-md p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-sm">Revision #{rev.revision_number}</span>
                <div className="text-xs text-slate-500 mt-1">
                  Changed By: <span className="font-medium text-slate-700">{rev.changed_by_user?.full_name || 'System'}</span> ({rev.changed_by_role})
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {format(new Date(rev.created_at), 'dd MMM yyyy, hh:mm a')}
              </div>
            </div>
            
            {rev.reason && (
              <div className="text-sm bg-slate-50 p-2 rounded border">
                <span className="font-medium text-slate-700 text-xs uppercase tracking-wider block mb-1">Reason</span>
                {rev.reason}
              </div>
            )}

            {rev.changed_fields && Object.keys(rev.changed_fields).length > 0 && (
              <div className="text-sm mt-2">
                <span className="font-medium text-slate-700 text-xs uppercase tracking-wider block mb-1">Changes</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                  {Object.entries(rev.changed_fields).map(([field, new_val]) => {
                    const old_val = rev.old_data[field];
                    return (
                      <li key={field}>
                        <span className="capitalize">{field.replace(/_/g, ' ')}</span> changed from <span className="font-mono bg-slate-100 px-1 rounded">{String(old_val)}</span> to <span className="font-mono bg-slate-100 px-1 rounded">{String(new_val)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
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

function StatusTimelineTab({ orderId }: { orderId: string }) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useOrderStatusHistoryQuery(orderId, { page, limit });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Skeleton className="h-4 w-4 rounded-full" />
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
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
        Error loading timeline: {error?.message || 'Unknown error'}
      </div>
    );
  }

  const history = data?.data || [];
  const meta = data?.meta;

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 italic border rounded-md bg-slate-50">
        No status history found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-3">
        {history.map((event: OrderStatusHistoryDto) => (
          <div key={event.id} className="relative">
            <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white ring-4 ring-slate-50" />
            <div className="bg-white border rounded-md p-4 shadow-sm space-y-1">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-sm text-slate-900">
                  {event.new_status}
                </div>
                <div className="text-xs text-slate-400">
                  {format(new Date(event.created_at), 'dd MMM yyyy, hh:mm a')}
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Performed By: <span className="font-medium text-slate-700">{event.changed_by_user?.full_name || 'System'}</span>
              </div>
              {event.reason && (
                <div className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded">
                  {event.reason}
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
