import React from 'react';

interface DataTableFiltersProps {
  children?: React.ReactNode;
}

export function DataTableFilters({ children }: DataTableFiltersProps) {
  if (!children) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
    </div>
  );
}
