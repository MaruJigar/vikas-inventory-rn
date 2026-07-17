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
import { useGetCategories } from '@/hooks/categories/useCategories';
import { useUploadProductImageMutation } from '@/hooks/products/useUploadProductImageMutation';
import { ProductDto } from '@/types/api/product.types';
import { z } from 'zod';
import { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDto | null;
}

export function EditProductDrawer({ open, onOpenChange, product }: EditProductDrawerProps) {
  const updateMutation = useUpdateProductMutation(product?.id ?? '');
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetCategories({ limit: 1000 });
  const categories = categoriesResponse?.data ?? [];

  const uploadMutation = useUploadProductImageMutation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof UpdateProductSchema>, unknown, UpdateProductFormValues>({
    resolver: zodResolver(UpdateProductSchema),
  });

  const categoryId = watch('category_id');

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
      if (product.product_image_url) {
        setImagePreview(getImageUrl(product.product_image_url));
      } else {
        setImagePreview(null);
      }
    }
  }, [product, reset]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      reset();
      setImagePreview(null);
    }
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        setValue('product_image_url', data.url, { shouldValidate: true });
      },
      onError: () => {
        // Revert to original if it fails
        if (product?.product_image_url) {
          setImagePreview(getImageUrl(product.product_image_url));
        } else {
          setImagePreview(null);
        }
      }
    });
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('product_image_url', '');
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
        
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Product Image</Label>
          <input type="hidden" {...register('product_image_url')} />
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-lg border overflow-hidden bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
              {uploadMutation.isPending && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              {!uploadMutation.isPending && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadMutation.isPending}
              />
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600 font-medium">Click to replace image</span>
                <span className="text-xs text-slate-500 mt-1">JPEG, PNG, WEBP (Max 5MB)</span>
              </div>
            </div>
          )}
          {errors.product_image_url && <p className="text-xs text-destructive">{errors.product_image_url.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label htmlFor="edit-category_id">Category</Label>
          <Select value={categoryId || 'none'} onValueChange={(val: string | null) => setValue('category_id', val === 'none' || val === null ? undefined : val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="— Select Category —">
                {isCategoriesLoading 
                  ? "Loading categories..."
                  : categoryId && categoryId !== 'none' 
                    ? categories.find(c => c.id === categoryId)?.name || (product as any)?.category?.name || categoryId 
                    : "— Select Category —"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
