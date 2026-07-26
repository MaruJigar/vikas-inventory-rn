'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DataTable } from '@/components/data-table/DataTable';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useWorkingDaysQuery } from '@/hooks/working-days/useWorkingDaysQuery';
import { getAttendanceColumns } from '@/features/attendance/attendance-columns';
import { AttendanceFilters } from '@/features/attendance/AttendanceFilters';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';

function AttendancePageContent() {
  const user = useAuthStore(state => state.user);

  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useDataTable();

  const { data, isLoading, isError, error } = useWorkingDaysQuery(queryState);

  const columns = getAttendanceColumns({
    userRole: user?.role,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View salesman check-in and check-out logs.
            </p>
          </div>
        </div>

        <AttendanceFilters
          searchQuery={queryState.search || ''}
          startDate={queryState.startDate as string | undefined}
          endDate={queryState.endDate as string | undefined}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
        />

        <div className="bg-white rounded-md border shadow-sm">
          <DataTable
            columns={columns}
            data={data ?? undefined}
            isLoading={isLoading || isPending}
            isError={isError}
            error={error as Error | null}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default function AttendancePage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'MANUFACTURER_ADMIN']}>
      <Suspense fallback={<div className="p-8"><Skeleton className="h-[400px] w-full" /></div>}>
        <AttendancePageContent />
      </Suspense>
    </RoleGuard>
  );
}
