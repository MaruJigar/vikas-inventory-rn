'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable } from '@/components/shared/DataTable';
import { useDataTable } from '@/hooks/useDataTable';
import { useManufacturersQuery } from '@/hooks/manufacturers/useManufacturersQuery';
import { usePendingApprovalsQuery } from '@/hooks/approvals/usePendingApprovalsQuery';
import { getManufacturersColumns } from '@/features/manufacturers/manufacturers-columns';
import { ManufacturerFilters } from '@/features/manufacturers/ManufacturerFilters';
import { ManufacturerDetailsDrawer } from '@/features/manufacturers/components/ManufacturerDetailsDrawer';
import { ManufacturerDto } from '@/types/api/manufacturer.types';

export default function ManufacturersPage() {
  const { queryState, setPage, setLimit, setSearch } = useDataTable();
  
  const [selectedManufacturer, setSelectedManufacturer] = useState<ManufacturerDto | null>(null);

  // ── Queries ──────────────────────────────────────────────────
  const { data: response, isLoading, isError, error } = useManufacturersQuery(queryState);
  
  // Fetch pending approvals for mapping status
  const { data: pendingApprovalsResponse } = usePendingApprovalsQuery();

  const data = response?.data;
  const pendingApprovals = pendingApprovalsResponse?.data || [];

  // Compute pending manufacturer IDs for quick lookup in columns
  const pendingManufacturerIds = new Set(
    pendingApprovals
      .filter((req) => req.status === 'PENDING_APPROVAL' && req.manufacturer_id)
      .map((req) => req.manufacturer_id as string)
  );

  // ── Columns ──────────────────────────────────────────────────
  const columns = getManufacturersColumns({
    onViewDetails: (manufacturer) => setSelectedManufacturer(manufacturer),
    pendingManufacturerIds,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manufacturers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view registered manufacturers.
            </p>
          </div>
          {/* Create button will go here in Phase 2 */}
        </div>

        {/* Toolbar: Search */}
        <ManufacturerFilters
          searchQuery={queryState.search || ''}
          onSearchChange={setSearch}
        />

        {/* DataTable */}
        <DataTable
          columns={columns ?? []}
          data={data ?? undefined}
          isLoading={isLoading}
          isError={isError}
          error={error as Error | null}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        {/* Details Drawer */}
        <ManufacturerDetailsDrawer
          manufacturerId={selectedManufacturer?.id}
          isOpen={!!selectedManufacturer}
          onClose={() => setSelectedManufacturer(null)}
        />
      </div>
    </AppLayout>
  );
}
