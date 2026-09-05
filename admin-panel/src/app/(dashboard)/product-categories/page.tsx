'use client';

import { Suspense, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useGetCategories, useDeleteCategoryMutation } from '@/hooks/categories/useCategories';
import { getCategoryColumns } from '@/features/categories/categories-columns';
import { CategoryFilters } from '@/features/categories/CategoryFilters';
import { CreateCategoryDrawer } from '@/features/categories/CreateCategoryDrawer';
import { EditCategoryDrawer } from '@/features/categories/EditCategoryDrawer';
import { CategoryDetailsDrawer } from '@/features/categories/components/CategoryDetailsDrawer';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CategoryDto } from '@/types/api/product.types';
import { useAuthStore } from '@/store/useAuthStore';

const CATEGORY_CREATE_ROLES = ['SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN'];
const CATEGORY_MANAGE_ROLES = ['SUPER_ADMIN', 'MANUFACTURER_ADMIN'];

function ProductCategoriesContent() {
  const user = useAuthStore((s) => s.user);
  const canCreate = Boolean(user?.role && CATEGORY_CREATE_ROLES.includes(user.role));
  const canManage = Boolean(user?.role && CATEGORY_MANAGE_ROLES.includes(user.role));

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryDto | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null);

  // ── URL-driven table state (canonical hook) ────────────────────────
  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
  } = useDataTable();

  // ── API queries & mutations ────────────────────────────────────────
  const { data, isLoading, isError, error } = useGetCategories(queryState);
  const deleteMutation = useDeleteCategoryMutation();

  const handleDelete = () => {
    if (!deletingCategory) return;
    deleteMutation.mutate(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  };

  const columns = getCategoryColumns({
    onViewDetails: (cat) => setViewingCategory(cat),
    onEdit: (cat) => setEditingCategory(cat),
    onDelete: (cat) => setDeletingCategory(cat),
    canManage,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Product Categories</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and organize product categories across the catalog.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setIsCreateOpen(true)} id="categories-create-btn">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
        </div>

        {/* Toolbar: Search Filter */}
        <CategoryFilters
          searchQuery={queryState.search || ''}
          onSearchChange={setSearch}
        />

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading || isPending}
          isError={isError}
          error={error as Error | null}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        {/* Details Drawer */}
        <CategoryDetailsDrawer
          category={viewingCategory}
          isOpen={!!viewingCategory}
          onClose={() => setViewingCategory(null)}
        />

        {/* Create Drawer */}
        <CreateCategoryDrawer
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />

        {/* Edit Drawer */}
        <EditCategoryDrawer
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
          title="Delete Category"
          description={`Are you sure you want to delete "${deletingCategory?.name}"? If products are currently assigned to this category, deletion will be blocked.`}
          confirmLabel="Delete"
          intent="destructive"
          isLoading={deleteMutation.isPending}
          onConfirm={handleDelete}
        />
      </div>
    </AppLayout>
  );
}

export default function ProductCategoriesPage() {
  return (
    <RoleGuard allowedRoles={PERMISSIONS.PRODUCT_CATEGORIES_VIEW}>
      <Suspense
        fallback={
          <AppLayout>
            <div className="space-y-4 p-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </AppLayout>
        }
      >
        <ProductCategoriesContent />
      </Suspense>
    </RoleGuard>
  );
}
