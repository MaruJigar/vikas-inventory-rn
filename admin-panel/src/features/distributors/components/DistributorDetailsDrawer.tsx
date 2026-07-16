import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
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
    <EntityFormDrawer
      title="Distributor Details"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      <div className="space-y-8 pb-10 pt-2">
        {/* Header Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">
              {distributor.business_name}
            </h2>
            <div className="shrink-0 mt-0.5">
              <DistributorStatusBadge isActive={distributor.is_active} />
            </div>
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
    </EntityFormDrawer>
  );
}
