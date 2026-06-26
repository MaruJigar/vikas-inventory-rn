'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useProductsQuery } from '@/hooks/products/useProductsQuery';
import { getProductColumns } from '@/features/products/products-columns';
import { ProductFilters } from '@/features/products/ProductFilters';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { CreateProductDrawer } from '@/features/products/CreateProductDrawer';
import { EditProductDrawer } from '@/features/products/EditProductDrawer';
import { useDeleteProductMutation } from '@/hooks/products/useDeleteProductMutation';
import { Button } from '@/components/ui/button';
import { ProductDto } from '@/types/api/product.types';
import { Plus } from 'lucide-react';

const PRODUCT_WRITE_ROLES = ['SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN'];

function ProductsPageContent() {
  const user = useAuthStore((s) => s.user);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDto | null>(null);
  const canWrite = Boolean(user?.role && PRODUCT_WRITE_ROLES.includes(user.role));
  
  const deleteMutation = useDeleteProductMutation();

  // ── URL-driven table state (canonical hook) ────────────────────────
  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
  } = useDataTable();

  // ── API query ──────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useProductsQuery(queryState);

  const handleDelete = (product: ProductDto) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const columns = getProductColumns({
    onEdit: (product) => setEditProduct(product),
    onDelete: handleDelete,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage the product catalog.
            </p>
          </div>
          {canWrite && (
            <Button size="sm" onClick={() => setCreateOpen(true)} id="products-create-btn">
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          )}
        </div>

        {/* Toolbar: Search Filter */}
        <ProductFilters
          searchQuery={queryState.search || ''}
          onSearchChange={setSearch}
        />

        {/* DataTable */}
        <DataTable
          columns={columns ?? []}
          data={data ?? undefined}
          isLoading={isLoading || isPending}
          isError={isError}
          error={error as Error | null}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        {/* Create Drawer */}
        <CreateProductDrawer open={createOpen} onOpenChange={setCreateOpen} />
        
        {/* Edit Drawer */}
        <EditProductDrawer 
          open={!!editProduct} 
          onOpenChange={(open) => !open && setEditProduct(null)} 
          product={editProduct} 
        />
      </div>
    </AppLayout>
  );
}

export default function ProductsPage() {
  return (
    <RoleGuard>
      <Suspense fallback={
        <AppLayout>
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </AppLayout>
      }>
        <ProductsPageContent />
      </Suspense>
    </RoleGuard>
  );
}
