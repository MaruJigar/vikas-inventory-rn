# Project Rules & Standards

## Date & Time Standard
- All timestamps returned by the backend must be considered UTC (or the project's storage standard).
- Every date/time displayed in the Admin Panel must be converted to **Indian Standard Time (`Asia/Kolkata`)** before rendering.
- Developers must use the shared date formatting utility `formatDate` from `@/lib/utils` and must not format dates inline using `toLocaleString()`, `date-fns`, or custom logic.
- Any new feature displaying timestamps must follow this standard.
