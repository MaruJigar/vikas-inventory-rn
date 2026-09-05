'use client';

import { useState, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/data-table/DataTable';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useManufacturersQuery } from '@/hooks/manufacturers/useManufacturersQuery';
import { getManufacturersColumns } from '@/features/manufacturers/manufacturers-columns';
import { ManufacturerFilters } from '@/features/manufacturers/ManufacturerFilters';
import { ManufacturerDetailsDrawer } from '@/features/manufacturers/components/ManufacturerDetailsDrawer';
import { CreateManufacturerDrawer } from '@/features/manufacturers/components/CreateManufacturerDrawer';
import { EditManufacturerDrawer } from '@/features/manufacturers/components/EditManufacturerDrawer';
import { ManufacturerDto } from '@/types/api/manufacturer.types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDeleteManufacturerMutation } from '@/hooks/manufacturers/useDeleteManufacturerMutation';

function ManufacturersPageContent() {
  const { queryState, setPage, setLimit, setSearch } = useDataTable();
  
  const [selectedManufacturer, setSelectedManufacturer] = useState<ManufacturerDto | null>(null);
  const [editingManufacturerId, setEditingManufacturerId] = useState<string | null>(null);
  const [deletingManufacturer, setDeletingManufacturer] = useState<ManufacturerDto | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [status, setStatus] = useState<string>('all');

  // ── Queries ──────────────────────────────────────────────────
  const { data: response, isLoading, isError, error } = useManufacturersQuery({
    ...queryState,
    status: status !== 'all' ? status : undefined,
  });
  
  const { mutate: deleteManufacturer, isPending: isDeleting } = useDeleteManufacturerMutation();

  // ── Columns ──────────────────────────────────────────────────
  const columns = getManufacturersColumns({
    onViewDetails: (manufacturer) => setSelectedManufacturer(manufacturer),
    onEdit: (manufacturer) => setEditingManufacturerId(manufacturer.id),
    onDelete: (manufacturer) => setDeletingManufacturer(manufacturer),
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
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Manufacturer
          </Button>
        </div>

        {/* Toolbar: Search & Filter */}
        <ManufacturerFilters
          searchQuery={queryState.search || ''}
          onSearchChange={setSearch}
          statusFilter={status}
          onStatusChange={setStatus}
        />

        {/* DataTable */}
        <DataTable
          columns={columns ?? []}
          data={response}
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

        {/* Create Drawer */}
        <CreateManufacturerDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        {/* Edit Drawer */}
        <EditManufacturerDrawer
          manufacturerId={editingManufacturerId}
          isOpen={!!editingManufacturerId}
          onClose={() => setEditingManufacturerId(null)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingManufacturer}
          onOpenChange={(open) => !open && setDeletingManufacturer(null)}
          title="Delete Manufacturer"
          description="Are you sure you want to delete this manufacturer? This action will remove the manufacturer and associated user account from active records."
          confirmLabel="Delete"
          intent="destructive"
          isLoading={isDeleting}
          onConfirm={() => {
            if (!deletingManufacturer) return;
            deleteManufacturer(deletingManufacturer.id, {
              onSuccess: () => setDeletingManufacturer(null),
            });
          }}
        />
      </div>
    </AppLayout>
  );
}

export default function ManufacturersPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </AppLayout>
    }>
      <ManufacturersPageContent />
    </Suspense>
  );
}
