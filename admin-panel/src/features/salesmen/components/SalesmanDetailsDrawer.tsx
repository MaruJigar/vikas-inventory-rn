import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { SalesmanStatusBadge } from './SalesmanStatusBadge';
import { useSalesmanQuery } from '@/hooks/salesmen/useSalesmanQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { User, Phone, Mail, Building2, Calendar, FileText, CheckCircle, MapPin } from 'lucide-react';
import { SalesmanDto } from '@/types/api/salesman.types';

type SalesmanWithRelations = SalesmanDto & {
  distributor?: { business_name: string };
};

interface SalesmanDetailsDrawerProps {
  salesmanId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SalesmanDetailsDrawer({ salesmanId, isOpen, onClose }: SalesmanDetailsDrawerProps) {
  // Use the query to fetch full details if we want, or just display what's passed if we passed the full object.
  // The requirements say "fetch full details via useSalesmanQuery".
  const { data: response, isLoading, isError } = useSalesmanQuery(salesmanId || '');
  const salesman = response?.data || response; // Handle both nested {data: ...} and flat object structures

  return (
    <EntityFormDrawer
      title="Salesman Details"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      <div className="mt-6 space-y-6">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {isError && (
          <div className="text-red-500 p-4 bg-red-50 rounded-md">
            Failed to load salesman details.
          </div>
        )}

        {!isLoading && !isError && salesman && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-semibold">{salesman.full_name}</h3>
              </div>
              <SalesmanStatusBadge status={salesman.approval_status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{salesman.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Status</p>
                  <p className="text-sm font-medium">{salesman.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">State</p>
                  <p className="text-sm font-medium">{salesman.state_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="text-sm font-medium">{salesman.city_name || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium break-all">{salesman.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Distributor</p>
                  <p className="text-sm font-medium break-all">{(salesman as SalesmanWithRelations).distributor?.business_name || salesman.distributor_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm font-medium">{formatDate(salesman.created_at)}</p>
                </div>
              </div>

              {salesman.approved_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Approved At</p>
                    <p className="text-sm font-medium">{formatDate(salesman.approved_at)}</p>
                  </div>
                </div>
              )}
            </div>

            {salesman.rejected_reason && (
              <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-800">Rejection Reason</p>
                </div>
                <p className="text-sm text-red-700 whitespace-pre-wrap">{salesman.rejected_reason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </EntityFormDrawer>
  );
}
