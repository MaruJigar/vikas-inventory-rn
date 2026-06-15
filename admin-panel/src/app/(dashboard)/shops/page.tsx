'use client';

import { Suspense, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useShopsQuery } from '@/hooks/shops/useShopsQuery';
import { getShopsColumns } from '@/features/shops/shops-columns';
import { ShopFilters } from '@/features/shops/ShopFilters';
import { ShopDetailsDrawer } from '@/features/shops/components/shop-details-drawer';
import { ShopDto } from '@/types/api/shop.types';

function ShopsPageContent() {
  const [selectedShop, setSelectedShop] = useState<ShopDto | null>(null);

  // ── URL-driven table state (canonical hook) ────────────────────────
  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
  } = useDataTable();

  // ── API query ──────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useShopsQuery(queryState);

  const columns = getShopsColumns({
    onViewDetails: (shop) => setSelectedShop(shop),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view registered shops.
            </p>
          </div>
        </div>

        {/* Toolbar: Search Filter */}
        <ShopFilters
          searchQuery={queryState.search || ''}
          onSearchChange={setSearch}
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

        {/* Details Drawer */}
        <ShopDetailsDrawer
          shop={selectedShop}
          isOpen={!!selectedShop}
          onClose={() => setSelectedShop(null)}
        />
      </div>
    </AppLayout>
  );
}

export default function ShopsPage() {
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
        <ShopsPageContent />
      </Suspense>
    </RoleGuard>
  );
}
