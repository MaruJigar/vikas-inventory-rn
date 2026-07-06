import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DistributorDto } from '@/types/api/distributor.types';
import { formatDate } from '@/lib/utils';
import { MapPin, Phone, Mail, FileText, User } from 'lucide-react';
import { DistributorStatusBadge } from './DistributorStatusBadge';

interface DistributorDetailsDrawerProps {
  distributor: DistributorDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DistributorDetailsDrawer({ distributor, isOpen, onClose }: DistributorDetailsDrawerProps) {
  if (!distributor) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Distributor Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-8 pb-10">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-slate-900">{distributor.business_name}</h2>
              <DistributorStatusBadge isActive={distributor.is_active} />
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <span>Added {formatDate(distributor.created_at)}</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">
              Contact Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Owner Name</p>
                  <p className="text-sm text-slate-600">{distributor.owner_name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Phone</p>
                  <p className="text-sm text-slate-600">{distributor.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <p className="text-sm text-slate-600">{distributor.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">
              Business Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">GST Number</p>
                  <p className="text-sm text-slate-600">{distributor.gst_number || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Address</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {[
                      distributor.address,
                      distributor.city,
                      distributor.state,
                      distributor.country
                    ].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
