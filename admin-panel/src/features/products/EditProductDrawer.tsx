'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateProductSchema, UpdateProductFormValues } from '@/lib/validation/products/schema';
import { useUpdateProductMutation } from '@/hooks/products/useUpdateProductMutation';
import { useCategoriesQuery } from '@/hooks/products/useCategoriesQuery';
import { ProductDto } from '@/types/api/product.types';
import { z } from 'zod';

interface EditProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDto | null;
}

export function EditProductDrawer({ open, onOpenChange, product }: EditProductDrawerProps) {
  const updateMutation = useUpdateProductMutation(product?.id ?? '');
  const { data: categoriesResponse } = useCategoriesQuery();
  const categories = categoriesResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof UpdateProductSchema>, unknown, UpdateProductFormValues>({
    resolver: zodResolver(UpdateProductSchema),
  });

  // Prefill form when product changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku ?? '',
        unit: product.unit ?? '',
        description: product.description ?? '',
        product_image_url: product.product_image_url ?? '',
        mrp: product.mrp,
        gst_percent: product.gst_percent ?? 0,
        distributor_discount_percent: product.distributor_discount_percent ?? 0,
        special_discount_percent: product.special_discount_percent ?? 0,
        category_id: product.category_id ?? '',
      });
    }
  }, [product, reset]);

  // Reset on close
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Auto-close on success
  useEffect(() => {
    if (updateMutation.isSuccess) {
      onOpenChange(false);
    }
  }, [updateMutation.isSuccess, onOpenChange]);

  const onSubmit = (values: UpdateProductFormValues) => {
    updateMutation.mutate(values);
  };

  const isPending = isSubmitting || updateMutation.isPending;

  return (
    <EntityFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Product"
      description={product ? `Updating: ${product.name}` : ''}
      width="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button form="edit-product-form" type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category */}
        <div className="space-y-1">
          <Label htmlFor="edit-category_id">Category</Label>
          <select
            id="edit-category_id"
            {...register('category_id')}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Select Category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="edit-name">Product Name</Label>
          <Input id="edit-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="edit-sku">SKU</Label>
            <Input id="edit-sku" {...register('sku')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-unit">Unit</Label>
            <Input id="edit-unit" {...register('unit')} />
          </div>
        </div>

        {/* MRP */}
        <div className="space-y-1">
          <Label htmlFor="edit-mrp">MRP (₹)</Label>
          <Input
            id="edit-mrp"
            type="number"
            step="0.01"
            min="0"
            {...register('mrp')}
          />
          {errors.mrp && <p className="text-xs text-destructive">{errors.mrp.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="edit-gst">GST %</Label>
            <Input id="edit-gst" type="number" step="0.01" {...register('gst_percent')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-dist-disc">Dist. Disc. %</Label>
            <Input id="edit-dist-disc" type="number" step="0.01" {...register('distributor_discount_percent')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-sp-disc">Special Disc. %</Label>
            <Input id="edit-sp-disc" type="number" step="0.01" {...register('special_discount_percent')} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="edit-description">Description</Label>
          <textarea
            id="edit-description"
            {...register('description')}
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {updateMutation.isError && (
          <p className="text-xs text-destructive">Failed to update product. Please try again.</p>
        )}
      </form>
    </EntityFormDrawer>
  );
}
