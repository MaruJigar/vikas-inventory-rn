'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { MovementType, InventoryDto } from '@/types/api/inventory.types';
import { useAdjustInventoryMutation } from '@/hooks/inventory/useAdjustInventoryMutation';
import { useProductsQuery } from '@/hooks/products/useProductsQuery';
import { useAuthStore } from '@/store/useAuthStore';

const AdjustStockSchema = z.object({
  product_id: z.string().optional(),
  movement_type: z.enum(['OPENING_STOCK', 'STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_CORRECTED', 'MANUAL_ADJUSTMENT']),
  quantity_change: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().optional(),
});

type AdjustStockFormValues = z.infer<typeof AdjustStockSchema>;

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory?: InventoryDto;
}

export function AdjustStockDialog({ open, onOpenChange, inventory }: AdjustStockDialogProps) {
  const adjustMutation = useAdjustInventoryMutation();
  const { user } = useAuthStore();
  const productParams = useMemo(() => ({ limit: 100, own_products_only: true }), []);
  const { data: productsData, isLoading: isLoadingProducts } = useProductsQuery(productParams, {
    enabled: open && !inventory,
  });
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustStockFormValues>({
    resolver: zodResolver(AdjustStockSchema) as any,
    defaultValues: {
      movement_type: 'STOCK_ADDED',
      quantity_change: 1,
      reason: '',
    },
  });

  const onSubmit = (values: AdjustStockFormValues) => {
    const targetProductId = inventory?.product_id || values.product_id;
    if (!targetProductId) return;
    
    // Convert STOCK_REMOVED quantity to negative
    const finalQuantity = values.movement_type === 'STOCK_REMOVED' 
      ? -Math.abs(values.quantity_change) 
      : Math.abs(values.quantity_change);

    adjustMutation.mutate(
      {
        product_id: targetProductId,
        movement_type: values.movement_type as MovementType,
        quantity_change: finalQuantity,
        reason: values.reason,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <EntityFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={inventory ? "Adjust Inventory" : "Add Opening Stock"}
      description={inventory?.product ? `Product: ${inventory.product.name}` : 'Select a product to add to your inventory'}
      width="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={adjustMutation.isPending}>
            Cancel
          </Button>
          <Button form="adjust-stock-form" type="submit" disabled={adjustMutation.isPending}>
            {adjustMutation.isPending ? 'Saving...' : 'Confirm'}
          </Button>
        </div>
      }
    >
      {isLoadingProducts ? (
        <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">Loading products...</div>
      ) : (
        <form id="adjust-stock-form" onSubmit={handleSubmit((values) => onSubmit(values as unknown as AdjustStockFormValues))} className="space-y-4">
          
          {!inventory && (
            <div className="space-y-1">
              <Label htmlFor="product_id">Select Product *</Label>
              <select
                id="product_id"
                {...register('product_id')}
                className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">-- Choose a product --</option>
                {productsData?.data?.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku || 'No SKU'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="movement_type">Movement Type *</Label>
            <select
              id="movement_type"
              {...register('movement_type')}
              className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="STOCK_ADDED">Add Stock</option>
              <option value="STOCK_REMOVED">Remove Stock</option>
              <option value="STOCK_CORRECTED">Stock Correction</option>
              <option value="OPENING_STOCK">Opening Stock</option>
              <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
            </select>
            {errors.movement_type && <p className="text-xs text-destructive">{errors.movement_type.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="quantity_change">Quantity *</Label>
            <Input id="quantity_change" type="number" step="1" {...register('quantity_change')} />
            {errors.quantity_change && <p className="text-xs text-destructive">{errors.quantity_change.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input id="reason" placeholder="e.g. Restocking, Damage, etc." {...register('reason')} />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
          </div>

        </form>
      )}
    </EntityFormDrawer>
  );
}
