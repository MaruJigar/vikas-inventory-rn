'use client';

import { useState, useMemo } from 'react';
import { useInventoryQuery } from '@/hooks/inventory/useInventoryQuery';
import { InventoryDto } from '@/types/api/inventory.types';
import { getInventoryColumns } from './inventory-columns';
import { DataTable } from '@/components/data-table/DataTable';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function InventoryList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedInventory, setSelectedInventory] = useState<InventoryDto | undefined>();
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const { user } = useAuthStore();
  const currentRole = user?.role || '';

  const { data, isLoading, isError, error } = useInventoryQuery({
    page,
    limit,
  });

  const columns = useMemo(
    () => getInventoryColumns({ 
      onAdjustStock: (inv) => {
        setSelectedInventory(inv);
        setIsAdjustOpen(true);
      },
      currentRole: currentRole || '',
    }),
    [currentRole]
  );

  if (isError) {
    return (
      <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
        Failed to load inventory: {(error as Error).message}
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            setSelectedInventory(undefined);
            setIsAdjustOpen(true);
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Opening Stock
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />

      <AdjustStockDialog
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        inventory={selectedInventory}
      />
    </div>
  );
}
