| Module | Endpoint | Method | Request DTO | Response DTO | Pagination | Search | Filters | Sort | Roles |
| ------ | -------- | ------ | ----------- | ------------ | ---------- | ------ | ------- | ---- | ----- |
| App | / | GET | None | None | false | false | false | false | Any |
| Streamable | /mcp | POST | None | None | undefined | false | false | false | Any |
| Streamable | /mcp | GET | None | None | false | false | false | false | Any |
| Streamable | /mcp | DELETE | None | None | false | false | false | false | Any |
| Sse | /sse | GET | None | None | false | false | false | false | Any |
| Sse | /messages | POST | None | None | undefined | false | false | false | Any |
| Auth | /auth/login | POST | None | None | false | false | false | false | Any |
| Auth | /auth/register/distributor | POST | None | None | undefined | false | false | false | Any |
| Auth | /auth/register/salesman | POST | None | None | undefined | false | false | false | Any |
| Auth | /auth/refresh | POST | None | None | false | false | false | false | Any |
| Auth | /auth/logout | POST | None | None | false | false | false | false | Any |
| Auth | /auth/me | GET | None | None | false | false | false | false | Any |
| Approval | /approvals/pending | GET | None | Paginated T | true | true | true | true | Any |
| Approval | /approvals/{id}/review | POST | None | None | undefined | false | true | false | Any |
| Notification | /notifications | GET | None | Paginated T | true | true | true | true | Any |
| Notification | /notifications/unread-count | GET | None | None | false | false | false | false | Any |
| Notification | /notifications/read-all | PATCH | None | None | false | false | false | false | Any |
| Notification | /notifications/{id}/read | PATCH | None | None | false | false | true | false | Any |
| Notification | /notifications/{id} | DELETE | None | None | false | false | true | false | Any |
| Manufacturer | /manufacturers/profile | POST | None | None | undefined | false | false | false | Any |
| Manufacturer | /manufacturers/profile | GET | None | None | false | false | false | false | Any |
| Manufacturer | /manufacturers/profile | PUT | None | None | false | false | false | false | Any |
| Manufacturer | /manufacturers | GET | None | Paginated T | true | true | true | true | Any |
| Manufacturer | /manufacturers | POST | None | None | undefined | false | false | false | Any |
| Manufacturer | /manufacturers/{id} | GET | None | None | false | false | true | false | Any |
| Manufacturer | /manufacturers/{id} | PATCH | None | None | false | false | true | false | Any |
| Manufacturer | /manufacturers/profile/distributors/{distributorId} | POST | None | None | undefined | false | true | false | Any |
| Distributor | /distributors/profile | GET | None | None | false | false | false | false | Any |
| Distributor | /distributors/profile | PUT | None | None | false | false | false | false | Any |
| Distributor | /distributors | GET | None | Paginated T | true | true | true | true | Any |
| Distributor | /distributors | POST | None | None | undefined | false | false | false | Any |
| Distributor | /distributors/{id} | GET | None | None | false | false | true | false | Any |
| Distributor | /distributors/{id} | PATCH | None | None | false | false | true | false | Any |
| Salesman | /salesmen/register | POST | None | None | undefined | false | false | false | Any |
| Salesman | /salesmen | GET | None | Paginated T | true | true | true | true | Any |
| Salesman | /salesmen/{id} | GET | None | None | false | false | true | false | Any |
| Salesman | /salesmen/{id} | PUT | None | None | false | false | true | false | Any |
| Product | /products | POST | None | None | undefined | false | false | false | Any |
| Product | /products | GET | None | Paginated T | true | true | true | true | Any |
| Product | /products/{id} | PUT | None | None | false | false | true | false | Any |
| Category | /product-categories | POST | None | None | undefined | false | false | false | Any |
| Category | /product-categories | GET | None | None | false | false | false | false | Any |
| ProductPricing | /product-pricing/products/{id}/history | GET | None | None | false | false | true | false | Any |
| Inventory | /inventory | GET | None | Paginated T | true | true | true | true | Any |
| Inventory | /inventory/adjust | POST | None | None | undefined | false | false | false | Any |
| Inventory | /inventory/{id}/movements | GET | None | None | true | true | true | true | Any |
| Backorders | /backorders | GET | None | Paginated T | true | true | true | true | Any |
| Backorders | /backorders/{id} | GET | None | None | false | false | true | false | Any |
| Backorders | /backorders/{id}/allocate | POST | None | None | undefined | false | true | false | Any |
| Shop | /shops/check-duplicate | POST | None | None | undefined | false | false | false | Any |
| Shop | /shops | POST | None | None | undefined | false | false | false | Any |
| Shop | /shops | GET | None | Paginated T | true | true | true | true | Any |
| Shop | /shops/{id} | GET | None | None | false | false | true | false | Any |
| Shop | /shops/{id} | PATCH | None | None | false | false | true | false | Any |
| ShopImage | /shop-images/{shopId}/upload | POST | None | None | undefined | false | true | false | Any |
| Orders | /orders | POST | None | None | undefined | false | false | false | Any |
| Orders | /orders | GET | None | Paginated T | true | true | true | true | Any |
| Orders | /orders/{id} | GET | None | None | false | false | true | false | Any |
| Orders | /orders/{id} | PATCH | None | None | false | false | true | false | Any |
| Orders | /orders/{id}/cancel | PATCH | None | None | false | false | true | false | Any |
| Orders | /orders/{id}/revisions | GET | None | None | false | false | true | false | Any |
| Fulfillment | /orders/{id}/confirm | PATCH | None | None | false | false | true | false | Any |
| Fulfillment | /orders/{id}/processing | PATCH | None | None | false | false | true | false | Any |
| Fulfillment | /orders/{id}/packed | PATCH | None | None | false | false | true | false | Any |
| Fulfillment | /orders/{id}/dispatch | PATCH | None | None | false | false | true | false | Any |
| Fulfillment | /orders/{id}/deliver | PATCH | None | None | false | false | true | false | Any |
| Fulfillment | /orders/{id}/partial-dispatch | PATCH | None | None | false | false | true | false | Any |
| Fulfillment | /orders/{id}/partial-deliver | PATCH | None | None | false | false | true | false | Any |
| Location | /locations | POST | None | None | undefined | false | false | false | Any |
| Location | /locations/batch | POST | None | None | undefined | false | false | false | Any |
| Location | /locations/salesmen/{id}/live | GET | None | None | false | false | true | false | Any |
| Location | /locations/salesmen/{id}/history | GET | None | None | false | false | true | false | Any |
| WorkingDay | /working-day/check-in | POST | None | None | undefined | false | false | false | Any |
| WorkingDay | /working-day/check-out | POST | None | None | undefined | false | false | false | Any |
| WorkingDay | /working-day/history | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/dashboard | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/sales | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/visits | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/orders | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/inventory | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/backorders | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/fulfillment | GET | None | None | false | false | false | false | Any |
| Analytics | /analytics/approvals | GET | None | None | false | false | false | false | Any |
| Health | /health | GET | None | None | false | false | false | false | Any |
| Visit | /visits/start | POST | None | None | undefined | false | false | false | Any |
| Visit | /visits/end | POST | None | None | undefined | false | false | false | Any |
| Visit | /visits/no-order | POST | None | None | undefined | false | false | false | Any |
| Visit | /visits | GET | None | Paginated T | true | true | true | true | Any |
| Visit | /visits/{id} | GET | None | None | false | false | true | false | Any |
