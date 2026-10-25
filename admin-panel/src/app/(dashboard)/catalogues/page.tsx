'use client';

import { useState, Suspense, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/data-table/DataTable';
import { useDataTable } from '@/hooks/table/useDataTable';
import { useCataloguesQuery } from '@/hooks/catalogues/useCataloguesQuery';
import { useDeleteCatalogueMutation } from '@/hooks/catalogues/useDeleteCatalogueMutation';
import { getCataloguesColumns } from '@/features/catalogues/catalogues-columns';
import { CatalogueFilters } from '@/features/catalogues/CatalogueFilters';
import { CataloguePreviewDialog } from '@/features/catalogues/components/CataloguePreviewDialog';
import { UploadCatalogueDialog } from '@/features/catalogues/components/UploadCatalogueDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ManufacturerCatalogueItemDto } from '@/types/api/catalogue.types';
import { catalogueService } from '@/services/catalogue.service';
import { useAuthStore } from '@/store/useAuthStore';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

function CataloguesPageContent() {
  const { user } = useAuthStore();
  const { queryState, setPage, setLimit, setSearch } = useDataTable();

  const [status, setStatus] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<ManufacturerCatalogueItemDto | null>(null);
  const [uploadItem, setUploadItem] = useState<{
    item: ManufacturerCatalogueItemDto;
    isReplace: boolean;
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState<ManufacturerCatalogueItemDto | null>(null);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isManufacturerAdmin = user?.role === 'MANUFACTURER_ADMIN';
  const canManage = isSuperAdmin || isManufacturerAdmin;

  // ── Queries ──────────────────────────────────────────────────
  const { data: response, isLoading, isError, error } = useCataloguesQuery({
    ...queryState,
    status: status !== 'all' ? status : undefined,
  });

  const deleteMutation = useDeleteCatalogueMutation();

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.manufacturer_id);
      setDeletingItem(null);
    } catch {
      // Handled in mutation onError toast
    }
  };

  const handleDownload = (item: ManufacturerCatalogueItemDto) => {
    catalogueService.downloadPdf(
      item.manufacturer_id,
      item.catalogue?.original_filename,
    );
  };

  // ── Columns ──────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getCataloguesColumns({
        onPreview: (item) => setPreviewItem(item),
        onDownload: handleDownload,
        onUpload: (item) => setUploadItem({ item, isReplace: false }),
        onReplace: (item) => setUploadItem({ item, isReplace: true }),
        onDelete: (item) => setDeletingItem(item),
        canManage,
      }),
    [canManage],
  );

  // If manufacturer admin has a single row in response, check if they can upload
  const singleRow = response?.data?.[0];
  const showTopUploadButton =
    isManufacturerAdmin && singleRow && !singleRow.has_catalogue;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manufacturer Catalogues
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage, upload, preview, and download PDF product catalogues for manufacturers.
            </p>
          </div>
          {showTopUploadButton && (
            <Button
              onClick={() =>
                setUploadItem({ item: singleRow, isReplace: false })
              }
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Catalogue
            </Button>
          )}
        </div>

        {/* Toolbar: Search & Filter */}
        <CatalogueFilters
          searchQuery={queryState.search || ''}
          onSearchChange={setSearch}
          statusFilter={status}
          onStatusChange={setStatus}
        />

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={response}
          isLoading={isLoading}
          isError={isError}
          error={error as Error | null}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        {/* PDF Preview Dialog */}
        <CataloguePreviewDialog
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          manufacturerId={previewItem?.manufacturer_id}
          companyName={previewItem?.company_name}
          filename={previewItem?.catalogue?.original_filename}
        />

        {/* Upload / Replace Dialog */}
        <UploadCatalogueDialog
          isOpen={!!uploadItem}
          onClose={() => setUploadItem(null)}
          manufacturerId={uploadItem?.item.manufacturer_id}
          companyName={uploadItem?.item.company_name}
          isReplace={uploadItem?.isReplace}
          existingFilename={uploadItem?.item.catalogue?.original_filename}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          title="Delete Catalogue"
          description={`Are you sure you want to delete the product catalogue for "${deletingItem?.company_name}"? The PDF file will be removed and will no longer be accessible.`}
          confirmLabel="Delete"
          intent="destructive"
          isLoading={deleteMutation.isPending}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </AppLayout>
  );
}

export default function CataloguesPage() {
  return (
    <RoleGuard allowedRoles={PERMISSIONS.CATALOGUES_VIEW}>
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
        <CataloguesPageContent />
      </Suspense>
    </RoleGuard>
  );
}
