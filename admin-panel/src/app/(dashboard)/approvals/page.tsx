'use client';

import { Suspense, useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/data-table/DataTable';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useApprovalsQuery } from '@/hooks/approvals/useApprovalsQuery';
import { getApprovalColumns } from '@/features/approvals/components/approvals-columns';
import { ApprovalFilters } from '@/features/approvals/components/ApprovalFilters';
import { ApprovalDetailsDrawer } from '@/features/approvals/components/approval-details-drawer';

function ApprovalsPageContent() {
  const { queryState, setPage, setLimit } = useDataTable();
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);

  const { data, isLoading } = useApprovalsQuery({
    page: queryState.page,
    limit: queryState.limit,
    search: queryState.search,
    status: statusFilter,
  });

  const handleReview = (id: string) => {
    setSelectedApprovalId(id);
    setReviewDialogOpen(true);
  };

  const columns = useMemo(() => getApprovalColumns({ onReview: handleReview }), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Manage and review system approval requests.
        </p>
      </div>

      <ApprovalFilters
        status={statusFilter || 'ALL'}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
      />

      <div className="rounded-md border bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      <ApprovalDetailsDrawer
        isOpen={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        approvalId={selectedApprovalId}
      />
    </div>
  );
}

export default function ApprovalsPage() {
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
      <AppLayout>
        <div className="p-6">
          <ApprovalsPageContent />
        </div>
      </AppLayout>
    </Suspense>
  );
}
