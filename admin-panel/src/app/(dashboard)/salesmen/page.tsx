'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useSalesmenQuery } from '@/hooks/salesmen/useSalesmenQuery';
import { getSalesmenColumns } from '@/features/salesmen/salesmen-columns';
import { SalesmanFilters } from '@/features/salesmen/SalesmanFilters';
import { SalesmanDetailsDrawer } from '@/features/salesmen/components/SalesmanDetailsDrawer';
import { CreateSalesmanDrawer } from '@/features/salesmen/components/CreateSalesmanDrawer';
import { EditSalesmanDrawer } from '@/features/salesmen/components/EditSalesmanDrawer';
import { ReviewSalesmanApprovalDialog } from '@/features/salesmen/components/ReviewSalesmanApprovalDialog';
import { SalesmanDto } from '@/types/api/salesman.types';

function SalesmenPageContent() {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [selectedSalesman, setSelectedSalesman] = useState<SalesmanDto | null>(null);
  const [editingSalesmanId, setEditingSalesmanId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reviewSalesman, setReviewSalesman] = useState<{ salesman: SalesmanDto; action: 'APPROVE' | 'REJECT' } | null>(null);

  // ── URL-driven table state (canonical hook) ────────────────────────
  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
  } = useDataTable();

  const [status, setStatus] = useState<string>('');

  // ── API query ──────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useSalesmenQuery({ ...queryState, status });

  const columns = getSalesmenColumns({
    onViewDetails: (salesman) => setSelectedSalesman(salesman),
    onEdit: (salesman) => setEditingSalesmanId(salesman.id),
    onReview: (salesman, action) => setReviewSalesman({ salesman, action }),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Salesmen</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view registered salesmen.
            </p>
          </div>
          {(isMounted && user?.role !== 'MANUFACTURER_ADMIN') && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Salesman
            </Button>
          )}
        </div>

        {/* Toolbar: Search & Filter */}
        <SalesmanFilters
          searchQuery={queryState.search || ''}
          onSearchChange={setSearch}
          statusFilter={status}
          onStatusChange={setStatus}
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
        <SalesmanDetailsDrawer
          salesmanId={selectedSalesman?.id}
          isOpen={!!selectedSalesman}
          onClose={() => setSelectedSalesman(null)}
        />

        {/* Create Drawer */}
        <CreateSalesmanDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        {/* Edit Drawer */}
        <EditSalesmanDrawer
          salesmanId={editingSalesmanId}
          isOpen={!!editingSalesmanId}
          onClose={() => setEditingSalesmanId(null)}
        />

        {/* Review Approval Dialog */}
        <ReviewSalesmanApprovalDialog
          salesman={reviewSalesman?.salesman || null}
          action={reviewSalesman?.action || null}
          isOpen={!!reviewSalesman}
          onClose={() => setReviewSalesman(null)}
        />
      </div>
    </AppLayout>
  );
}

export default function SalesmenPage() {
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
        <SalesmenPageContent />
      </Suspense>
    </RoleGuard>
  );
}
