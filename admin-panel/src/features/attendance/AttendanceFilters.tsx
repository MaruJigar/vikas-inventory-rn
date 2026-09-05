import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AttendanceFiltersProps {
  searchQuery: string;
  startDate?: string;
  endDate?: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string | undefined) => void;
}

export function AttendanceFilters({
  searchQuery,
  startDate,
  endDate,
  onSearchChange,
  onFilterChange,
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-md border shadow-sm">
      {/* Search by Salesman */}
      <div className="flex-1 w-full sm:w-auto">
        <Label className="text-xs text-slate-500 mb-1.5 block">Search Salesman</Label>
        <Input
          placeholder="Enter salesman name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Start Date */}
      <div className="w-full sm:w-[200px]">
        <Label className="text-xs text-slate-500 mb-1.5 block">Start Date</Label>
        <Input
          type="date"
          value={startDate || ''}
          onChange={(e) => onFilterChange('startDate', e.target.value || undefined)}
          className="h-9"
        />
      </div>

      {/* End Date */}
      <div className="w-full sm:w-[200px]">
        <Label className="text-xs text-slate-500 mb-1.5 block">End Date</Label>
        <Input
          type="date"
          value={endDate || ''}
          onChange={(e) => onFilterChange('endDate', e.target.value || undefined)}
          className="h-9"
        />
      </div>
    </div>
  );
}
