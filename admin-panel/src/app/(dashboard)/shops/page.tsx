'use client';

import { Suspense, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DataTable } from '@/components/data-table/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useShopsQuery } from '@/hooks/shops/useShopsQuery';
import { getShopsColumns } from '@/features/shops/shops-columns';
import { ShopFilters } from '@/features/shops/ShopFilters';
import { ShopDetailsDrawer } from '@/features/shops/components/shop-details-drawer';
import { CreateShopDrawer } from '@/features/shops/components/CreateShopDrawer';
import { EditShopDrawer } from '@/features/shops/components/EditShopDrawer';
import { UploadShopImageDialog } from '@/features/shops/components/UploadShopImageDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ShopDto } from '@/types/api/shop.types';
import { useDeleteShopMutation } from '@/hooks/shops/useDeleteShopMutation';

function ShopsPageContent() {
  const [selectedShop, setSelectedShop] = useState<ShopDto | null>(null);
  const [editingShop, setEditingShop] = useState<ShopDto | null>(null);
  const [uploadingShop, setUploadingShop] = useState<ShopDto | null>(null);
  const [deletingShop, setDeletingShop] = useState<ShopDto | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const deleteShopMutation = useDeleteShopMutation();

  // ── URL-driven table state (canonical hook) ────────────────────────
  const {
    queryState,
    isPending,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useDataTable();

  // ── API query ──────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useShopsQuery(queryState);

  const columns = getShopsColumns({
    onViewDetails: (shop) => setSelectedShop(shop),
    onEdit: (shop) => setEditingShop(shop),
    onUploadImage: (shop) => setUploadingShop(shop),
    onDelete: (shop) => setDeletingShop(shop),
  });

  const handleDelete = async () => {
    if (!deletingShop) return;
    try {
      await deleteShopMutation.mutateAsync(deletingShop.id);
      setDeletingShop(null);
    } catch (err) {
      console.error('Failed to delete shop', err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view registered shops.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Shop
          </Button>
        </div>

        {/* Toolbar: Search Filter */}
        <ShopFilters
          searchQuery={queryState.search || ''}
          verificationStatus={queryState.verification_status as string | undefined}
          isActive={queryState.is_active as string | undefined}
          onSearchChange={setSearch}
          onVerificationStatusChange={(val) => setFilter('verification_status', val)}
          onIsActiveChange={(val) => setFilter('is_active', val)}
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

        {/* Details Drawer */}
        <ShopDetailsDrawer
          shop={selectedShop}
          isOpen={!!selectedShop}
          onClose={() => setSelectedShop(null)}
        />

        {/* Create Drawer */}
        <CreateShopDrawer
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        {/* Edit Drawer */}
        <EditShopDrawer
          shop={editingShop}
          isOpen={!!editingShop}
          onClose={() => setEditingShop(null)}
        />

        {/* Upload Image Dialog */}
        <UploadShopImageDialog
          shop={uploadingShop}
          isOpen={!!uploadingShop}
          onClose={() => setUploadingShop(null)}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingShop}
          onOpenChange={(open) => !open && setDeletingShop(null)}
          title="Delete Shop"
          description={`Are you sure you want to delete "${deletingShop?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          intent="destructive"
          onConfirm={handleDelete}
          isLoading={deleteShopMutation.isPending}
        />
      </div>
    </AppLayout>
  );
}

export default function ShopsPage() {
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
        <ShopsPageContent />
      </Suspense>
    </RoleGuard>
  );
}
