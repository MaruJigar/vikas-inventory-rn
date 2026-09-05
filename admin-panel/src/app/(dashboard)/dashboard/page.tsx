'use client';

import { AppLayout } from "@/components/layout/AppLayout";
import { useDashboardQuery } from "@/hooks/useDashboardQuery";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { AlertCircle } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardQuery();

  return (
    <RoleGuard>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of your inventory ecosystem metrics.
            </p>
          </div>

          {isLoading && <DashboardSkeleton />}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-medium text-red-800">
                  Failed to load dashboard metrics
                </h3>
              </div>
              <p className="mt-2 text-sm text-red-700 ml-8">
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
            </div>
          )}

          {data && !isLoading && !isError && (
            <DashboardMetrics data={data.data} />
          )}
        </div>
      </AppLayout>
    </RoleGuard>
  );
}

