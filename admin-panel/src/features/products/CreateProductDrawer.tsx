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
import { useGetCategories } from '@/hooks/categories/useCategories';
import { useUploadProductImageMutation } from '@/hooks/products/useUploadProductImageMutation';
import { useManufacturersQuery } from '@/hooks/manufacturers/useManufacturersQuery';
import { useDistributorsQuery } from '@/hooks/distributors/useDistributorsQuery';
import { useDistributorProfileQuery } from '@/hooks/distributors/useDistributorProfileQuery';
import { useAuthStore } from '@/store/useAuthStore';
import { z } from 'zod';
import { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CreateProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDrawer({ open, onOpenChange }: CreateProductDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateProductMutation();
  const { data: categoriesResponse } = useGetCategories();
  const categories = categoriesResponse?.data ?? [];

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isDistributorAdmin = user?.role === 'DISTRIBUTOR_ADMIN';
  
  const { data: mfrResponse } = useManufacturersQuery({ limit: 100 });
  const { data: distResponse } = useDistributorsQuery({ limit: 100 });
  const { data: distProfile } = useDistributorProfileQuery(isDistributorAdmin);
  
  const manufacturers = mfrResponse?.data ?? [];
  const distributors = distResponse?.data ?? [];
  const isInternalDistributor = isDistributorAdmin && distProfile?.is_internal_distributor;

  const uploadMutation = useUploadProductImageMutation();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof CreateProductSchema>, unknown, CreateProductFormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      product_source: (user?.role === 'MANUFACTURER_ADMIN' || user?.role === 'SUPER_ADMIN') ? 'MANUFACTURER_CREATED' : 'DISTRIBUTOR_CREATED',
      mrp: 0,
      is_active: true,
      product_image_url: '',
    },
  });

  const productSource = watch('product_source');

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      reset();
      setImagePreviews([]);
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentUrls = watch('product_image_url')?.split(',').filter(Boolean) || [];
    if (currentUrls.length + files.length > 3) {
      // @ts-ignore
      alert('A product can have a maximum of 3 images.');
      return;
    }

    for (const file of files) {
      const tempPreview = URL.createObjectURL(file);
      setImagePreviews((prev) => [...prev, tempPreview]);
      
      try {
        const data = await uploadMutation.mutateAsync(file);
        const latestUrls = watch('product_image_url')?.split(',').filter(Boolean) || [];
        setValue('product_image_url', [...latestUrls, data.url].join(','), { shouldValidate: true });
      } catch (error) {
        setImagePreviews((prev) => prev.filter(p => p !== tempPreview));
      }
    }
    
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    const currentUrls = watch('product_image_url')?.split(',').filter(Boolean) || [];
    const newUrls = currentUrls.filter((_, i) => i !== indexToRemove);
    setValue('product_image_url', newUrls.join(','));
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
        
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Account Status</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Active Product</Label>
              <p className="text-sm text-slate-500">
                {watch('is_active') 
                  ? 'Visible to everyone with permission.' 
                  : 'Hidden from others. Visible only to you.'}
              </p>
            </div>
            <Switch 
              checked={watch('is_active')} 
              onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })} 
            />
          </div>
        </div>

        {/* Product Source */}
        {!isSuperAdmin && (
          <input type="hidden" {...register('product_source')} />
        )}
        {isSuperAdmin && (
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
        )}

        {(isSuperAdmin && productSource === 'MANUFACTURER_CREATED') || (isInternalDistributor && productSource === 'DISTRIBUTOR_CREATED') ? (
          <div className="space-y-1">
            <Label htmlFor="manufacturer_id">Manufacturer *</Label>
            <select
              id="manufacturer_id"
              {...register('manufacturer_id')}
              className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Select Manufacturer —</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.company_name}
                </option>
              ))}
            </select>
            {errors.manufacturer_id && <p className="text-xs text-destructive">{errors.manufacturer_id.message}</p>}
          </div>
        ) : null}

        {isSuperAdmin && productSource === 'DISTRIBUTOR_CREATED' && (
          <div className="space-y-1">
            <Label htmlFor="distributor_id">Distributor *</Label>
            <select
              id="distributor_id"
              {...register('distributor_id')}
              className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Select Distributor —</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.business_name}
                </option>
              ))}
            </select>
            {errors.distributor_id && <p className="text-xs text-destructive">{errors.distributor_id.message}</p>}
          </div>
        )}

        {/* External Manufacturer Name (only for DISTRIBUTOR_CREATED and non-internal) */}
        {productSource === 'DISTRIBUTOR_CREATED' && !isInternalDistributor && (
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
          <Select onValueChange={(val: string | null) => setValue('category_id', val === 'none' || val === null ? undefined : val)}>
            <SelectTrigger>
              <SelectValue placeholder="— Select Category —" />
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

        {/* Image Upload */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Product Images (Max 3)</Label>
          <input type="hidden" {...register('product_image_url')} />
          
          <div className="flex flex-wrap gap-4">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative w-32 h-32 rounded-lg border overflow-hidden bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                {!uploadMutation.isPending && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            {(watch('product_image_url')?.split(',').filter(Boolean) || []).length < 3 && (
              <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadMutation.isPending}
                />
                {uploadMutation.isPending ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-xs text-slate-600 font-medium text-center px-2">Upload</span>
                  </>
                )}
              </div>
            )}
          </div>
          {errors.product_image_url && <p className="text-xs text-destructive">{errors.product_image_url.message}</p>}
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
