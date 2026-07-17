import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { useManufacturerQuery } from '@/hooks/manufacturers/useManufacturerQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { ManufacturerStatusBadge } from './ManufacturerStatusBadge';

interface ManufacturerDetailsDrawerProps {
  manufacturerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ManufacturerDetailsDrawer({ manufacturerId, isOpen, onClose }: ManufacturerDetailsDrawerProps) {
  const { data: manufacturer, isLoading, isError } = useManufacturerQuery(manufacturerId);

  return (
    <EntityFormDrawer
      title="Manufacturer Details"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isError || !manufacturer ? (
          <div className="text-center text-red-500 py-8">
            Failed to load manufacturer details.
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">Company Name</span>
              <span className="col-span-2">{manufacturer.company_name}</span>
            </div>
            
            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">Contact Person</span>
              <span className="col-span-2">{manufacturer.contact_person || '-'}</span>
            </div>
            
            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">Email</span>
              <span className="col-span-2">{manufacturer.email || '-'}</span>
            </div>
            
            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">Phone</span>
              <span className="col-span-2">{manufacturer.phone || '-'}</span>
            </div>
            
            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">GST Number</span>
              <span className="col-span-2">{manufacturer.gst_number || '-'}</span>
            </div>
            
            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">Address</span>
              <span className="col-span-2">
                {[manufacturer.address, manufacturer.city, manufacturer.state, manufacturer.country].filter(Boolean).join(', ') || '-'}
              </span>
            </div>

            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">Status</span>
              <span className="col-span-2">
                <ManufacturerStatusBadge isActive={manufacturer.is_active} />
              </span>
            </div>

            <div className="grid grid-cols-3 border-b pb-3 gap-4">
              <span className="text-muted-foreground font-medium">Joined Date</span>
              <span className="col-span-2">{formatDate(manufacturer.created_at)}</span>
            </div>
          </div>
        )}
      </div>
    </EntityFormDrawer>
  );
}
