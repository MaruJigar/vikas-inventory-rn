'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateProductSchema, CreateProductFormValues } from '@/lib/validation/products/schema';
import { useCreateProductMutation } from '@/hooks/products/useCreateProductMutation';
import { useCategoriesQuery } from '@/hooks/products/useCategoriesQuery';
import { useAuthStore } from '@/store/useAuthStore';
import { z } from 'zod';



interface CreateProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDrawer({ open, onOpenChange }: CreateProductDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateProductMutation();
  const { data: categoriesResponse } = useCategoriesQuery();
  const categories = categoriesResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof CreateProductSchema>, unknown, CreateProductFormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      product_source: user?.role === 'MANUFACTURER_ADMIN' ? 'MANUFACTURER_CREATED' : 'DISTRIBUTOR_CREATED',
      mrp: 0,
    },
  });

  const productSource = watch('product_source');

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Auto-close on success
  useEffect(() => {
    if (createMutation.isSuccess) {
      reset();
      onOpenChange(false);
    }
  }, [createMutation.isSuccess, onOpenChange, reset]);

  const onSubmit = (values: CreateProductFormValues) => {
    createMutation.mutate(values);
  };

  const isPending = isSubmitting || createMutation.isPending;

  return (
    <EntityFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create Product"
      description="Add a new product to the catalog."
      width="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button form="create-product-form" type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      }
    >
      <form id="create-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Product Source */}
        <div className="space-y-1">
          <Label htmlFor="product_source">Product Source *</Label>
          <select
            id="product_source"
            {...register('product_source')}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="MANUFACTURER_CREATED">Manufacturer Created</option>
            <option value="DISTRIBUTOR_CREATED">Distributor Created</option>
          </select>
          {errors.product_source && (
            <p className="text-xs text-destructive">{errors.product_source.message}</p>
          )}
        </div>

        {/* External Manufacturer Name (only for DISTRIBUTOR_CREATED) */}
        {productSource === 'DISTRIBUTOR_CREATED' && (
          <div className="space-y-1">
            <Label htmlFor="external_manufacturer_name">External Manufacturer Name *</Label>
            <Input
              id="external_manufacturer_name"
              {...register('external_manufacturer_name')}
              placeholder="e.g. Hindustan Unilever"
            />
            {errors.external_manufacturer_name && (
              <p className="text-xs text-destructive">{errors.external_manufacturer_name.message}</p>
            )}
          </div>
        )}

        {/* Category */}
        <div className="space-y-1">
          <Label htmlFor="category_id">Category</Label>
          <select
            id="category_id"
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
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g. Parachute Coconut Oil 500ml"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* SKU */}
          <div className="space-y-1">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register('sku')} placeholder="e.g. PCO-500" />
          </div>

          {/* Unit */}
          <div className="space-y-1">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" {...register('unit')} placeholder="e.g. Piece, Box, Kg" />
          </div>
        </div>

        {/* MRP */}
        <div className="space-y-1">
          <Label htmlFor="mrp">MRP (₹) *</Label>
          <Input
            id="mrp"
            type="number"
            step="0.01"
            min="0"
            {...register('mrp')}
            placeholder="0.00"
          />
          {errors.mrp && <p className="text-xs text-destructive">{errors.mrp.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* GST % */}
          <div className="space-y-1">
            <Label htmlFor="gst_percent">GST %</Label>
            <Input
              id="gst_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('gst_percent')}
              placeholder="18"
            />
          </div>

          {/* Dist. Discount % */}
          <div className="space-y-1">
            <Label htmlFor="distributor_discount_percent">Dist. Disc. %</Label>
            <Input
              id="distributor_discount_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('distributor_discount_percent')}
              placeholder="0"
            />
          </div>

          {/* Special Discount % */}
          <div className="space-y-1">
            <Label htmlFor="special_discount_percent">Special Disc. %</Label>
            <Input
              id="special_discount_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('special_discount_percent')}
              placeholder="0"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Product description..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Mutation error */}
        {createMutation.isError && (
          <p className="text-xs text-destructive">
            Failed to create product. Please try again.
          </p>
        )}
      </form>
    </EntityFormDrawer>
  );
}
