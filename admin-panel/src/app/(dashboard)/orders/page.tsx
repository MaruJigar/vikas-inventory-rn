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
import { useGeneratePurchaseRequestMutation } from '@/hooks/orders/useGeneratePurchaseRequestMutation';
import { useState } from 'react';
import { OrderDto } from '@/types/api/order.types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';

function OrdersPageContent() {
  const user = useAuthStore(state => state.user);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderDto | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderDto | null>(null);
  const [statusUpdatingOrder, setStatusUpdatingOrder] = useState<OrderDto | null>(null);
  const [historyOrder, setHistoryOrder] = useState<OrderDto | null>(null);
  const [fulfillmentOrder, setFulfillmentOrder] = useState<OrderDto | null>(null);

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

  const generatePRMutation = useGeneratePurchaseRequestMutation();

  const handleGeneratePR = () => {
    generatePRMutation.mutate(undefined, {
      onSuccess: (newDraft) => {
        setEditingOrder((newDraft as any).data as OrderDto); // Open editor immediately
      }
    });
  };

  const columns = getOrdersColumns({
    userRole: user?.role,
    onViewDetails: (order) => setSelectedOrder(order),
    onEdit: (order) => setEditingOrder(order),
    onCancel: (order) => setCancellingOrder(order),
    onUpdateStatus: (order) => setStatusUpdatingOrder(order),
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
              onClick={handleGeneratePR}
              disabled={generatePRMutation.isPending}
            >
              {generatePRMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Generate Purchase Request
            </Button>
          )}
        </div>

        {/* Toolbar: Search Filter */}
        <OrderFilters
          searchQuery={queryState.search || ''}
          status={queryState.status as string | undefined}
          startDate={queryState.startDate as string | undefined}
          endDate={queryState.endDate as string | undefined}
          onSearchChange={setSearch}
          onStatusChange={(val) => setFilter('status', val)}
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
          order={statusUpdatingOrder}
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
