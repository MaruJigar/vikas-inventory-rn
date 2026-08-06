'use client';

import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { CategoryDto } from '@/types/api/product.types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CategoryDetailsDrawerProps {
  category: CategoryDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryDetailsDrawer({
  category,
  isOpen,
  onClose,
}: CategoryDetailsDrawerProps) {
  if (!category) return null;

  return (
    <EntityFormDrawer
      title="Category Details"
      description="View detailed information about this product category."
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      width="md"
    >
      <div className="mt-4 space-y-6">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Category Name</span>
            <span className="col-span-2 font-semibold text-slate-900">{category.name}</span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Parent Category</span>
            <span className="col-span-2">
              {category.parent?.name ? (
                <Badge variant="secondary">{category.parent.name}</Badge>
              ) : (
                <span className="text-muted-foreground">None (Top Level)</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Created Date</span>
            <span className="col-span-2 text-slate-700">
              {formatDate(category.created_at)}
            </span>
          </div>

          <div className="grid grid-cols-3 border-b pb-3 gap-4">
            <span className="text-muted-foreground font-medium">Updated Date</span>
            <span className="col-span-2 text-slate-700">
              {formatDate(category.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </EntityFormDrawer>
  );
}
