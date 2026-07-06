# Pagination Governance Exception — Contextual Drawers

## Rationale
The primary Pagination Governance explicitly requires URL-driven query state (e.g. via `useDataTable()`) for lists to guarantee browser history persistence, deep linking, and layout stability.

However, an architectural exception has been granted for **Drawer-local paginated secondary resources**, specifically:
* Order Revision History
* Order Status Timeline
* Similar contextual datasets (Audit logs, comments, etc.)

## Exception Rules
Local component state pagination (`const [page, setPage] = useState(1)`) is permitted **ONLY IF** the following conditions are met:

1. **Server-side pagination is used:** The API still receives `page` and `limit`, and the response must contain the standard `meta` block.
2. **No client-side slicing exists:** The frontend cannot fetch the whole dataset and slice it using local Javascript array methods.
3. **Dataset is contextual:** It belongs to a parent entity (e.g., an `orderId` bound to a drawer/modal).
4. **Dataset is not independently navigable:** The user accesses it strictly as an overlay on a primary page.
5. **Dataset does not require URL persistence:** The application does not require deep linking to specific pages of this contextual subset, and the user expects browser "Back" to navigate the primary layout, not step backward through drawer pagination states.
