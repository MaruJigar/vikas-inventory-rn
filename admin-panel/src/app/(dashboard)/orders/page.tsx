'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useOrdersQuery } from '@/hooks/orders/useOrdersQuery';
import { getOrdersColumns } from '@/features/orders/orders-columns';
import { OrderFilters } from '@/features/orders/OrderFilters';
import { useAuthStore } from '@/store/useAuthStore';
import { OrderDetailsDrawer } from '@/features/orders/components/order-details-drawer';
import { EditOrderDrawer } from '@/features/orders/components/edit-order-drawer';
import { CancelOrderDialog } from '@/features/orders/components/cancel-order-dialog';
import { UpdateOrderStatusDialog } from '@/features/orders/components/update-order-status-dialog';
import { OrderHistoryDrawer } from '@/features/orders/components/order-history-drawer';
import { OrderFulfillmentLogsDrawer } from '@/features/orders/components/order-fulfillment-logs-drawer';

import { CreatePurchaseOrderDrawer } from '@/features/orders/components/create-purchase-order-drawer';
import { useState, useEffect } from 'react';
import { OrderDto } from '@/types/api/order.types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useGetActiveOrderStatusesQuery } from '@/hooks/orders/useGetActiveOrderStatusesQuery';

function OrdersPageContent() {
  const user = useAuthStore(state => state.user);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderDto | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderDto | null>(null);
  const [statusUpdatingOrder, setStatusUpdatingOrder] = useState<{order: OrderDto; preSelectedStatus?: string} | null>(null);
  const [discountPromptOrder, setDiscountPromptOrder] = useState<{order: OrderDto; preSelectedStatus?: string} | null>(null);
  const [historyOrder, setHistoryOrder] = useState<OrderDto | null>(null);
  const [fulfillmentOrder, setFulfillmentOrder] = useState<OrderDto | null>(null);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);

  const { data: activeStatuses, isLoading: isLoadingStatuses } = useGetActiveOrderStatusesQuery();

  // ── URL-driven table state (canonical hook) ────────────────────────
  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useDataTable();

  // ── API query ──────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useOrdersQuery(queryState);

  useEffect(() => {
    if (activeStatuses?.length && !queryState.status) {
      setFilter('status', activeStatuses[0].id);
    }
  }, [activeStatuses, queryState.status, setFilter]);


  const columns = getOrdersColumns({
    userRole: user?.role,
    activeStatuses: activeStatuses || [],
    onViewDetails: (order) => setSelectedOrder(order),
    onEdit: (order) => setEditingOrder(order),
    onCancel: (order) => setCancellingOrder(order),
    onUpdateStatus: (order, preSelectedStatus) => {
      const statusStr = typeof order.status === 'object' ? (order.status as any)?.name : order.status;
      const currentStatusIndex = activeStatuses?.findIndex(s => s.name === statusStr);
      
      if (user?.role === 'MANUFACTURER_ADMIN' && currentStatusIndex === 0) {
        setDiscountPromptOrder({ order, preSelectedStatus });
      } else {
        setStatusUpdatingOrder({ order, preSelectedStatus });
      }
    },
    onViewHistory: (order) => setHistoryOrder(order),
    onViewFulfillmentLogs: (order) => setFulfillmentOrder(order),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view your B2B orders.
            </p>
          </div>
          
          {user?.role === 'DISTRIBUTOR_ADMIN' && (
            <Button 
              onClick={() => setIsCreatePOOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          )}
        </div>

        {/* Status Tabs */}
        {isLoadingStatuses ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Tabs 
            value={(queryState.status as string) || (activeStatuses?.[0]?.id ?? '')}
            onValueChange={(val) => setFilter('status', val)}
            className="w-full"
          >
            <TabsList className="w-full justify-start h-auto flex-wrap">
              {activeStatuses?.map((status) => (
                <TabsTrigger key={status.id} value={status.id} className="flex-1 min-w-[120px]">
                  {status.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Toolbar: Search Filter */}
        <OrderFilters
          searchQuery={queryState.search || ''}
          startDate={queryState.startDate as string | undefined}
          endDate={queryState.endDate as string | undefined}
          onSearchChange={setSearch}
          onStartDateChange={(val) => setFilter('startDate', val)}
          onEndDateChange={(val) => setFilter('endDate', val)}
        />

        {/* DataTable */}
        <DataTable
          columns={columns ?? []}
          data={data ?? undefined}
          isLoading={isLoading || isPending}
          isError={isError}
          error={error as Error | null}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        <AlertDialog open={!!discountPromptOrder} onOpenChange={(open) => !open && setDiscountPromptOrder(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Discounts?</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to add discounts to this order before processing it?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                const payload = discountPromptOrder;
                setDiscountPromptOrder(null);
                if (payload) setStatusUpdatingOrder(payload);
              }}>
                No, just update status
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                const payload = discountPromptOrder;
                setDiscountPromptOrder(null);
                if (payload) setEditingOrder(payload.order);
              }}>
                Yes, add discounts
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Order Details Drawer */}
        <OrderDetailsDrawer
          orderId={selectedOrder?.id || null}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />

        {/* Edit Order Drawer */}
        <EditOrderDrawer
          orderId={editingOrder?.id || null}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
        />

        {/* Cancel Order Dialog */}
        <CancelOrderDialog
          order={cancellingOrder}
          isOpen={!!cancellingOrder}
          onClose={() => setCancellingOrder(null)}
        />

        {/* Update Status Dialog */}
        <UpdateOrderStatusDialog
          order={statusUpdatingOrder?.order || null}
          preSelectedStatus={statusUpdatingOrder?.preSelectedStatus}
          isOpen={!!statusUpdatingOrder}
          onClose={() => setStatusUpdatingOrder(null)}
        />

        {/* Order History Drawer */}
        <OrderHistoryDrawer
          order={historyOrder}
          isOpen={!!historyOrder}
          onClose={() => setHistoryOrder(null)}
        />

        {/* Fulfillment Logs Drawer */}
        <OrderFulfillmentLogsDrawer
          order={fulfillmentOrder}
          isOpen={!!fulfillmentOrder}
          onClose={() => setFulfillmentOrder(null)}
        />

        {/* Create Purchase Request Cart Drawer */}
        <CreatePurchaseOrderDrawer
          isOpen={isCreatePOOpen}
          initialItems={[]}
          onClose={() => setIsCreatePOOpen(false)}
        />
      </div>
    </AppLayout>
  );
}

export default function OrdersPage() {
  return (
    <RoleGuard>
      <Suspense fallback={
        <AppLayout>
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </AppLayout>
      }>
        <OrdersPageContent />
      </Suspense>
    </RoleGuard>
  );
}
