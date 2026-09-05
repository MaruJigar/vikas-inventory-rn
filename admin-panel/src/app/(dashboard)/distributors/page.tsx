'use client';

import { Suspense, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/data-table/DataTable';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useDistributorsQuery } from '@/hooks/distributors/useDistributorsQuery';
import { getDistributorsColumns } from '@/features/distributors/distributors-columns';
import { DistributorFilters } from '@/features/distributors/DistributorFilters';
import { DistributorDetailsDrawer } from '@/features/distributors/components/DistributorDetailsDrawer';
import { CreateDistributorDrawer } from '@/features/distributors/components/CreateDistributorDrawer';
import { EditDistributorDrawer } from '@/features/distributors/components/EditDistributorDrawer';
import { DistributorDto } from '@/types/api/distributor.types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDeleteDistributorMutation } from '@/hooks/distributors/useDeleteDistributorMutation';

function DistributorsPageContent() {
  const { queryState, setPage, setLimit, setSearch } = useDataTable();
  
  const [selectedDistributor, setSelectedDistributor] = useState<DistributorDto | null>(null);
  const [editingDistributorId, setEditingDistributorId] = useState<string | null>(null);
  const [deletingDistributor, setDeletingDistributor] = useState<DistributorDto | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [status, setStatus] = useState<string>('all');

  // ── Queries ──────────────────────────────────────────────────
  const { data: response, isLoading } = useDistributorsQuery({
    ...queryState,
    status: status !== 'all' ? status : undefined,
  });
  
  const { mutate: deleteDistributor, isPending: isDeleting } = useDeleteDistributorMutation();

  // ── Columns ──────────────────────────────────────────────────
  const columns = getDistributorsColumns({
    onViewDetails: (distributor) => setSelectedDistributor(distributor),
    onEdit: (distributor) => setEditingDistributorId(distributor.id),
    onDelete: (distributor) => setDeletingDistributor(distributor),
  });

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Distributors</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your distributor network</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Distributor
          </Button>
        </div>

        <DistributorFilters
          search={queryState.search || ''}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />

        <div className="bg-white rounded-lg shadow-sm border">
          <DataTable
            columns={columns}
            data={response}
            isLoading={isLoading}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>

        {/* View Details Drawer */}
        <DistributorDetailsDrawer
          distributor={selectedDistributor}
          isOpen={!!selectedDistributor}
          onClose={() => setSelectedDistributor(null)}
        />

        {/* Create Drawer */}
        <CreateDistributorDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        {/* Edit Drawer */}
        <EditDistributorDrawer
          distributorId={editingDistributorId}
          isOpen={!!editingDistributorId}
          onClose={() => setEditingDistributorId(null)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingDistributor}
          onOpenChange={(open) => !open && setDeletingDistributor(null)}
          title="Delete Distributor"
          description="Are you sure you want to delete this distributor? This action will remove the distributor and associated user account from active records."
          confirmLabel="Delete"
          intent="destructive"
          isLoading={isDeleting}
          onConfirm={() => {
            if (!deletingDistributor) return;
            deleteDistributor(deletingDistributor.id, {
              onSuccess: () => setDeletingDistributor(null),
            });
          }}
        />
      </div>
    </AppLayout>
  );
}

export default function DistributorsPage() {
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
      <DistributorsPageContent />
    </Suspense>
  );
}
