'use client';

import { useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { visitsColumns } from './visits-columns';
import { useGetVisitsQuery } from '@/hooks/visits/useGetVisitsQuery';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

export function VisitsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useGetVisitsQuery({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  if (isError) {
    return <div className="text-red-500">Failed to load visits. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search visits (status, reason, etc)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <DataTable
        columns={visitsColumns}
        data={data}
        isLoading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}
