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

interface ShopFiltersProps {
  searchQuery: string;
  verificationStatus?: string;
  isActive?: string;
  onSearchChange: (value: string) => void;
  onVerificationStatusChange?: (value: string | undefined) => void;
  onIsActiveChange?: (value: string | undefined) => void;
  hideStatusFilters?: boolean;
}

export function ShopFilters({ 
  searchQuery, 
  verificationStatus,
  isActive,
  onSearchChange,
  onVerificationStatusChange,
  onIsActiveChange,
  hideStatusFilters = false,
}: ShopFiltersProps) {
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
    <div className="flex items-center space-x-4">
      <div className="relative w-64 flex-shrink-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={hideStatusFilters ? "Search by shop name, city, state..." : "Search by name, owner, phone..."}
          className="pl-10 h-9"
        />
      </div>

      {!hideStatusFilters && (
        <>
          <div className="w-[180px]">
            <Select 
              value={verificationStatus || "ALL"} 
              onValueChange={(val) => onVerificationStatusChange?.(val === "ALL" ? undefined : (val || undefined))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <Select 
              value={isActive || "ALL"} 
              onValueChange={(val) => onIsActiveChange?.(val === "ALL" ? undefined : (val || undefined))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Active Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Active States</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
