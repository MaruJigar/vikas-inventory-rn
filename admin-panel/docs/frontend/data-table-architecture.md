# DataTable Architecture Foundation

The `admin-panel` utilizes a highly composable, strictly-typed, URL-driven DataTable architecture built upon `@tanstack/react-table`, `shadcn/ui`, and Next.js 15 App Router.

## Folder Structure

The DataTable ecosystem is centralized to ensure maximum reusability across all modules:

*   **`src/lib/table/`**: Core utilities.
    *   `table-query-parser.ts`: Parses Next.js `ReadonlyURLSearchParams` into a strongly-typed `QueryParams` object for the backend API.
    *   `table-query-builder.ts`: Merges current URL parameters with state updates to preserve URL state across interactions.
*   **`src/hooks/table/`**: 
    *   `useDataTable.ts`: The primary hook that bridges Next.js navigation with the table's state. It provides setter functions (`setPage`, `setSearch`, etc.) that update the URL.
*   **`src/components/data-table/`**: The visual components.
    *   `DataTable.tsx`: The generic `<DataTable<TData, TValue>>` wrapper.
    *   `DataTablePagination.tsx`: Handles server-side pagination controls based on `PaginatedResponse['meta']`.
    *   `DataTableSearch.tsx`: A debounced search input synchronized with the URL `search` param.
    *   `DataTableToolbar.tsx`: Layout container for search, filters, and actions.
    *   `DataTableFilters.tsx`: Container for module-specific filters.
    *   `DataTableSkeleton.tsx`, `DataTableEmpty.tsx`, `DataTableError.tsx`: Standardized states.
*   **`src/types/table/`**:
    *   `column-definition.ts`: Base typings for column definitions ensuring no `any` is required.

## Data Flow & URL Synchronization

The architecture enforces that the **URL is the single source of truth** for table state.

1.  **State Change**: A user interacts with a control (e.g., changes page or types a search query).
2.  **Hook Update**: The `useDataTable` hook's setter function (e.g., `setSearch`) is called.
3.  **URL Build**: `buildTableQueryString` updates the specific parameter while preserving others.
4.  **Navigation**: `useTransition` and `router.push` update the URL without a full page reload (`scroll: false`).
5.  **Parsing**: The Next.js page re-renders. `parseTableQueryParams` extracts the new state from the URL.
6.  **Data Fetching**: The parsed `QueryParams` object is passed into TanStack Query hooks (e.g., `useProductsQuery(queryParams)`), triggering a refetch if the cache is stale.

This ensures that browser history (Back/Forward) works flawlessly and URLs can be shared directly.

## RBAC Lifecycle (Row Actions)

Row actions (Edit, Delete, Suspend) are integrated cleanly without polluting the generic table component.

When defining columns for a specific module (e.g., `ProductsColumns`), the definition file should import `isAdminRole` from `@/lib/auth/rbac` and the current user from `useAuthStore`.

```tsx
// Example integration pattern for future modules
const user = useAuthStore((state) => state.user);

const columns: DataTableColumnDef<ProductDto>[] = [
  // ... data columns ...
  {
    id: "actions",
    cell: ({ row }) => {
      // Role-based visibility
      if (!isAdminRole(user?.role)) {
        return null; // Or return a limited "View Only" action
      }
      return <ProductRowActions row={row} />;
    }
  }
];
```
This guarantees no UI leakage of administrative actions to restricted roles (like `SALESMAN`).

## Integration Strategy for Future Modules

When building a new list-based module (e.g., Products):

1.  **Define Columns**: Create `products-columns.tsx` using `DataTableColumnDef`.
2.  **Initialize Hook**: Inside the page component, call `const tableState = useDataTable()`.
3.  **Fetch Data**: Pass `tableState.queryState` to the module's query hook (e.g., `useProductsQuery(tableState.queryState)`).
4.  **Assemble**: 
    ```tsx
    <DataTableToolbar 
      searchQuery={tableState.queryState.search} 
      onSearchChange={tableState.setSearch} 
    />
    <DataTable 
      columns={columns} 
      data={data} 
      isLoading={isLoading} 
      isError={isError} 
      error={error}
      onPageChange={tableState.setPage}
      onLimitChange={tableState.setLimit}
    />
    ```
