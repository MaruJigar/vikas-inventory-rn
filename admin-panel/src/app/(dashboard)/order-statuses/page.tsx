'use client';

import { Suspense, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  useGetOrderStatuses,
  useUpdateOrderStatusMutation,
} from '@/hooks/order-statuses/useOrderStatuses';
import { getOrderStatusColumns } from '@/features/order-statuses/order-status-columns';
import { OrderStatusFilters } from '@/features/order-statuses/OrderStatusFilters';
import { CreateOrderStatusDrawer } from '@/features/order-statuses/components/CreateOrderStatusDrawer';
import { EditOrderStatusDrawer } from '@/features/order-statuses/components/EditOrderStatusDrawer';
import { OrderStatusDetailsDrawer } from '@/features/order-statuses/components/OrderStatusDetailsDrawer';
import { OrderStatusDto } from '@/types/api/order-status.types';
import { useAuthStore } from '@/store/useAuthStore';

const ORDER_STATUS_WRITE_ROLES = ['SUPER_ADMIN', 'MANUFACTURER_ADMIN'];

function OrderStatusesContent() {
  const user = useAuthStore((s) => s.user);
  const canManage = Boolean(user?.role && ORDER_STATUS_WRITE_ROLES.includes(user.role));

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<OrderStatusDto | null>(null);
  const [viewingStatus, setViewingStatus] = useState<OrderStatusDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Queries & Mutations ─────────────────────────────────────────────
  const { data, isLoading, isError, error } = useGetOrderStatuses();
  const updateMutation = useUpdateOrderStatusMutation();

  const handleToggleActive = (status: OrderStatusDto) => {
    updateMutation.mutate({
      id: status.id,
      data: { isactive: !status.isactive },
    });
  };

  const filteredStatuses = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((s) => s.name.toLowerCase().includes(query));
  }, [data, searchQuery]);

  const columns = getOrderStatusColumns({
    onViewDetails: (status) => setViewingStatus(status),
    onEdit: (status) => setEditingStatus(status),
    onToggleActive: handleToggleActive,
    canManage,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Order Statuses
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure order lifecycle progression, sequence order, and flow attributes.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Order Status
            </Button>
          )}
        </div>

        {/* Filters */}
        <OrderStatusFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={{ data: filteredStatuses } as any}
          isLoading={isLoading}
          isError={isError}
          error={error as Error}
        />

        {/* Drawers */}
        <CreateOrderStatusDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        <EditOrderStatusDrawer
          status={editingStatus}
          isOpen={!!editingStatus}
          onClose={() => setEditingStatus(null)}
        />

        <OrderStatusDetailsDrawer
          status={viewingStatus}
          isOpen={!!viewingStatus}
          onClose={() => setViewingStatus(null)}
        />
      </div>
    </AppLayout>
  );
}

function OrderStatusesLoading() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    </AppLayout>
  );
}

export default function OrderStatusesPage() {
  return (
    <RoleGuard allowedRoles={PERMISSIONS.ORDER_STATUSES_VIEW}>
      <Suspense fallback={<OrderStatusesLoading />}>
        <OrderStatusesContent />
      </Suspense>
    </RoleGuard>
  );
}
