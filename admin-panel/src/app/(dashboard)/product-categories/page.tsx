'use client';

import React, { useState, Suspense } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useGetCategories, useDeleteCategoryMutation } from '@/hooks/categories/useCategories';
import { CategoryDto } from '@/types/api/product.types';
import { useDataTable } from '@/hooks/table/useDataTable';
import { DataTable } from '@/components/data-table/DataTable';
import { getCategoryColumns } from '@/features/categories/categories-columns';
import { CreateCategoryDrawer } from '@/features/categories/CreateCategoryDrawer';
import { EditCategoryDrawer } from '@/features/categories/EditCategoryDrawer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTableSearch } from '@/components/data-table/DataTableSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ProductCategoriesContent() {
  const user = useAuthStore((s) => s.user);
  const canManage = ['SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN'].includes(user?.role || '');

  const { queryState, setPage, setLimit, setSearch, setSort } = useDataTable();
  const { data: categoriesResponse, isLoading, isError, error } = useGetCategories(queryState);
  const deleteMutation = useDeleteCategoryMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = getCategoryColumns({
    onEdit: setSelectedCategory,
    onDelete: handleDelete,
    canManage,
    queryState,
    setSort,
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Product Categories</h2>
        {canManage && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Category
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <DataTableSearch
              placeholder="Search categories..."
              initialValue={queryState.search || ''}
              onSearch={setSearch}
            />
          </div>
          <DataTable
            columns={columns}
            data={categoriesResponse}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </CardContent>
      </Card>

      {isCreateOpen && (
        <CreateCategoryDrawer
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      )}

      {selectedCategory && (
        <EditCategoryDrawer
          open={!!selectedCategory}
          onOpenChange={(open) => !open && setSelectedCategory(null)}
          category={selectedCategory}
        />
      )}
    </div>
  );
}

export default function ProductCategoriesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading categories...</div>}>
      <ProductCategoriesContent />
    </Suspense>
  );
}
