import { ColumnDef } from '@tanstack/react-table';

// Re-export ColumnDef so consuming modules don't need to import directly from tanstack
export type { ColumnDef } from '@tanstack/react-table';

// We can extend the standard ColumnDef if we need custom properties later, 
// such as specific RBAC definitions per column, but for now we rely on the generic ColumnDef.
export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue>;
