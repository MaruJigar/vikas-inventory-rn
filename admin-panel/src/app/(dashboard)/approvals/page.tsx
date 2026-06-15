'use client';

import { AppLayout } from "@/components/layout/AppLayout";
import { useApprovalsQuery } from "@/hooks/useApprovalsQuery";
import { ApprovalsTable } from "./components/ApprovalsTable";
import { ApprovalReviewDialog } from "./components/ApprovalReviewDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { ApprovalDto } from "@/types/api/approval.types";

export default function ApprovalsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [selectedApproval, setSelectedApproval] = useState<ApprovalDto | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'SALESMAN') {
      router.replace('/'); 
    }
  }, [isAuthenticated, user, router]);

  const { data, isLoading, isError, error } = useApprovalsQuery({});

  const rawApprovals: ApprovalDto[] = useMemo(() => Array.isArray(data) ? data : (data?.data || []), [data]);

  if (user?.role === 'SALESMAN') {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage ecosystem requests pending your approval.
          </p>
        </div>

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-medium text-red-800">
                Failed to load approvals
              </h3>
            </div>
            <p className="mt-2 text-sm text-red-700 ml-8">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
          </div>
        )}

        {!isError && (
          <ApprovalsTable 
            approvals={rawApprovals} 
            isLoading={isLoading} 
            onRowClick={(approval) => setSelectedApproval(approval)} 
          />
        )}

        <ApprovalReviewDialog 
          open={!!selectedApproval} 
          onOpenChange={(open) => !open && setSelectedApproval(null)}
          approval={selectedApproval}
        />
      </div>
    </AppLayout>
  );
}
