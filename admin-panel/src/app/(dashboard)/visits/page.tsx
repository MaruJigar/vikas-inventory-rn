import { VisitsTable } from '@/features/visits/visits-table';
import { MapPin } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function VisitsPage() {
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
        <AppLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Shop Visits</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitor salesman visits, locations, and order status.
                </p>
              </div>
            </div>
            <VisitsTable />
          </div>
        </AppLayout>
      </Suspense>
    </RoleGuard>
  );
}
