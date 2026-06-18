import { ShopDto } from '@/types/api/shop.types';
import { formatDate } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils/image';
import { ShopStatusBadge } from './shop-status-badge';
import Image from 'next/image';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';

interface ShopDetailsDrawerProps {
  shop: ShopDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShopDetailsDrawer({ shop, isOpen, onClose }: ShopDetailsDrawerProps) {
  if (!shop) return null;

  return (
    <EntityFormDrawer
      title="Shop Details"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      <div className="space-y-8 mt-4">
        {/* Verification Status */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Verification</h3>
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-slate-100 flex-shrink-0">
              {shop.verification_photo_url ? (
                <Image
                  src={getImageUrl(shop.verification_photo_url)}
                  alt={shop.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">No Image</div>
              )}
            </div>
            <div className="space-y-2 pt-2">
              <div>
                <div className="text-sm font-medium text-slate-500">Status</div>
                <ShopStatusBadge status={shop.verification_status} className="mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Shop Name</div>
              <div className="text-sm text-slate-900 font-medium">{shop.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Owner Name</div>
              <div className="text-sm text-slate-900">{shop.owner_name || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Mobile</div>
              <div className="text-sm text-slate-900">{shop.phone}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">GST Number</div>
              <div className="text-sm text-slate-900">{shop.gst_number || '-'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm font-medium text-slate-500 mb-1">Address</div>
              <div className="text-sm text-slate-900">
                {[shop.address, shop.city, shop.state].filter(Boolean).join(', ') || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Location</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Latitude</div>
              <div className="text-sm text-slate-900">{shop.latitude ?? '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Longitude</div>
              <div className="text-sm text-slate-900">{shop.longitude ?? '-'}</div>
            </div>
          </div>
        </div>

        {/* Ownership */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Ownership</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Distributor ID</div>
              <div className="text-sm text-slate-900 break-all">{shop.distributor_id || '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Salesman ID</div>
              <div className="text-sm text-slate-900 break-all">{shop.created_by_salesman_id || '-'}</div>
            </div>
          </div>
        </div>

        {/* Audit */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">Audit</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Created At</div>
              <div className="text-sm text-slate-900">{shop.created_at ? formatDate(shop.created_at) : '-'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Updated At</div>
              <div className="text-sm text-slate-900">{shop.updated_at ? formatDate(shop.updated_at) : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </EntityFormDrawer>
  );
}
