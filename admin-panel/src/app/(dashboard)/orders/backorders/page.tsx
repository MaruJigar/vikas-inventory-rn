'use client';

import { Suspense, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useBackordersQuery } from '@/hooks/orders/useBackordersQuery';
import { getBackordersColumns } from '@/features/orders/backorders-columns';
import { useAuthStore } from '@/store/useAuthStore';
import { BackorderDetailsDrawer } from '@/features/orders/components/backorder-details-drawer';
import { ResolveBackorderDialog } from '@/features/orders/components/resolve-backorder-dialog';
import { BackorderDto } from '@/types/api/order.types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function BackordersPageContent() {
  const user = useAuthStore(state => state.user);
  const [selectedBackorder, setSelectedBackorder] = useState<BackorderDto | null>(null);
  const [resolvingBackorder, setResolvingBackorder] = useState<BackorderDto | null>(null);

  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useDataTable();

  const { data, isLoading, isError, error } = useBackordersQuery(queryState);

  const columns = getBackordersColumns({
    userRole: user?.role,
    onViewDetails: (backorder) => setSelectedBackorder(backorder),
    onResolve: (backorder) => setResolvingBackorder(backorder),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Backorders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage product allocation shortages and fulfillments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product, distributor, salesman..."
              className="pl-8"
              value={queryState.search || ''}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={(queryState.status as string) || 'all'}
            onValueChange={(val) => setFilter('status', val === 'all' || !val ? undefined : String(val))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="PARTIALLY_ALLOCATED">Partially Allocated</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns ?? []}
          data={data ?? undefined}
          isLoading={isLoading || isPending}
          isError={isError}
          error={error as Error | null}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        <BackorderDetailsDrawer
          backorderId={selectedBackorder?.id || null}
          isOpen={!!selectedBackorder}
          onClose={() => setSelectedBackorder(null)}
        />

        <ResolveBackorderDialog
          backorder={resolvingBackorder}
          isOpen={!!resolvingBackorder}
          onClose={() => setResolvingBackorder(null)}
        />
      </div>
    </AppLayout>
  );
}

export default function BackordersPage() {
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
        <BackordersPageContent />
      </Suspense>
    </RoleGuard>
  );
}
