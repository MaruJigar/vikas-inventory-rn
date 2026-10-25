'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CatalogueFiltersProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function CatalogueFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: CatalogueFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg border">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by manufacturer name, contact person, or filename..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      <Select
        value={statusFilter}
        onValueChange={(val) => val && onStatusChange(val)}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Catalogues" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Catalogues</SelectItem>
          <SelectItem value="uploaded">Catalogue Uploaded</SelectItem>
          <SelectItem value="not_uploaded">No Catalogue</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
