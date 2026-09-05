'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePricingHistoryQuery } from '@/hooks/products/usePricingHistoryQuery';
import { ProductDto } from '@/types/api/product.types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

interface PricingHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDto | null;
}

export function PricingHistoryModal({ open, onOpenChange, product }: PricingHistoryModalProps) {
  const { data, isLoading, isError } = usePricingHistoryQuery(product?.id ?? '');
  const history = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Pricing History</DialogTitle>
          <DialogDescription>
            {product ? `Price change history for: ${product.name}` : 'Select a product to view history.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive py-6 text-center">
              Failed to load pricing history.
            </p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No pricing history available for this product.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border p-3 text-sm grid grid-cols-2 gap-x-4 gap-y-1"
                >
                  <div className="col-span-2 flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                      Changed by {entry.changed_by_user_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MRP:</span>{' '}
                    <span className="line-through text-muted-foreground">
                      ₹{Number(entry.old_mrp).toFixed(2)}
                    </span>{' '}
                    <span className="font-semibold text-foreground">
                      → ₹{Number(entry.new_mrp).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dist. Disc.:</span>{' '}
                    <span className="line-through text-muted-foreground">
                      {entry.old_distributor_discount_percent}%
                    </span>{' '}
                    <span className="font-semibold">
                      → {entry.new_distributor_discount_percent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Special Disc.:</span>{' '}
                    <span className="line-through text-muted-foreground">
                      {entry.old_special_discount_percent}%
                    </span>{' '}
                    <span className="font-semibold">
                      → {entry.new_special_discount_percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter showCloseButton>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
