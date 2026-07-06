'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFiltersProps {
  searchQuery: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | undefined) => void;
  onStartDateChange: (value: string | undefined) => void;
  onEndDateChange: (value: string | undefined) => void;
}

export function OrderFilters({ 
  searchQuery, 
  status,
  startDate,
  endDate,
  onSearchChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange
}: OrderFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative w-64 flex-shrink-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by order, shop, salesman..."
          className="pl-10 h-9"
        />
      </div>

      <div className="w-[180px]">
        <Select 
          value={status || "ALL"} 
          onValueChange={(val) => onStatusChange(val === "ALL" ? undefined : (val || undefined))}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="CREATED">Created</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="PACKED">Packed</SelectItem>
            <SelectItem value="DISPATCHED">Dispatched</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-500">From:</span>
        <Input 
          type="date" 
          className="h-9 w-auto" 
          value={startDate || ''}
          onChange={(e) => onStartDateChange(e.target.value || undefined)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-500">To:</span>
        <Input 
          type="date" 
          className="h-9 w-auto" 
          value={endDate || ''}
          onChange={(e) => onEndDateChange(e.target.value || undefined)}
        />
      </div>
    </div>
  );
}
