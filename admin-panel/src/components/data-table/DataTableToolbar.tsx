import { DataTableSearch } from './DataTableSearch';
import { DataTableFilters } from './DataTableFilters';

interface DataTableToolbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DataTableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {onSearchChange && (
          <DataTableSearch
            initialValue={searchQuery}
            onSearch={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}
        <DataTableFilters>{filters}</DataTableFilters>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
