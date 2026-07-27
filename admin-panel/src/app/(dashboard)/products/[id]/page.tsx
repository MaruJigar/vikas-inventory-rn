'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductQuery } from '@/hooks/products/useProductQuery';
import { useInventoryQuery } from '@/hooks/inventory/useInventoryQuery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Package, Calendar, Truck, Factory, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils/image';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: productData, isLoading, isError } = useProductQuery(id);
  const { data: inventoryData } = useInventoryQuery({ product_id: id, limit: 1 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !productData) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <Card className="bg-red-50/50 border-red-100">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Package className="h-12 w-12 text-red-200 mb-4" />
            <p className="text-red-600 font-medium">Failed to load product details</p>
            <p className="text-sm text-red-500/80 mt-1">The product may have been deleted or you don't have permission to view it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = productData;

  // Extract images safely from legacy comma-separated strings or arrays
  const images: string[] = [];
  if (product.product_image_url) {
    if (Array.isArray(product.product_image_url)) {
      images.push(...product.product_image_url);
    } else {
      images.push(...product.product_image_url.split(',').map(u => u.trim()).filter(Boolean));
    }
  }

  const activeImage = selectedImage || images[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500">
              SKU: {product.sku || 'N/A'} • {product.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
        <Badge variant={product.is_active ? 'default' : 'secondary'} className={product.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
          {product.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border">
                {activeImage ? (
                  <Image
                    src={getImageUrl(activeImage)}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <Package className="h-12 w-12 opacity-20" />
                    <span className="text-sm font-medium">No Image Available</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-300'}`}
                    >
                      <Image
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description Card */}
          {product.description && (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                  <FileText className="h-4 w-4" /> Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 whitespace-pre-wrap">
                {product.description}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing & Units */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-medium text-slate-700">Pricing & Inventory Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Selling Price</p>
                <p className="text-lg font-semibold text-slate-900">₹{Number(product.mrp).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">GST</p>
                <p className="text-lg font-semibold text-slate-900">{product.gst_percent ?? 0}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dist. Discount</p>
                <p className="text-lg font-semibold text-slate-900">{product.distributor_discount_percent ?? 0}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Special Discount</p>
                <p className="text-lg font-semibold text-slate-900">{product.special_discount_percent ?? 0}%</p>
              </div>
              
              <div className="col-span-2 md:col-span-4 border-t border-slate-100 my-2" />
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</p>
                <p className="font-medium text-slate-900">{product.unit || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stock</p>
                <p className="font-medium text-slate-900">{inventoryData?.data?.[0]?.available_quantity ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</p>
                <p className="font-medium text-slate-900">{product.sku || '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ownership & Origin */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-medium text-slate-700">Origin & Ownership</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Factory className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Manufacturer</p>
                      <p className="text-xs text-slate-500">
                        {/* @ts-ignore - nested fields from custom query */}
                        {product.manufacturer?.company_name || product.external_manufacturer_name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Distributor</p>
                      <p className="text-xs text-slate-500">
                        {/* @ts-ignore */}
                        {product.distributor?.business_name || 'Direct / All'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <div className="flex flex-col sm:flex-row gap-4 text-xs text-slate-500 px-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Created: {formatDate(product.created_at)}
            </div>
            <div className="hidden sm:block text-slate-300">•</div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Updated: {formatDate(product.updated_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
