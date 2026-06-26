# 01_FRONTEND_TECHNICAL_KNOWLEDGE_BASE.md

## SECTION 1: Executive Technical Summary

The Vikas Inventory system is a modern field-sales and distribution management platform. It allows field salesmen to track shop visits, record real-time location data, take orders, and manage inventory. The backend is built on NestJS and PostgreSQL (with PostGIS for spatial queries), utilizing TypeORM for data access.

### Integration Architecture
* **Backend Framework:** NestJS
* **Database:** PostgreSQL + PostGIS (TypeORM)
* **Realtime:** Socket.IO Gateway
* **Notifications:** Firebase Cloud Messaging (FCM) via BullMQ background jobs
* **Uploads:** Direct backend multipart/form-data handling (shop images)
* **Frontend Targets:** React Native (Mobile app for field workers), Next.js (Admin Panel for managers)

## SECTION 2: Complete Architecture Deep Dive

### Request Lifecycle
1. **Guards:** Global JWT AuthGuard, RoleGuard.
2. **Interceptors:** AuditLogInterceptor logs state changes.
3. **Controllers:** Parse request parameters, validate via class-validator DTOs.
4. **Services:** Core business logic, transactional database modifications.
5. **Event Emission:** Notification and WebSocket events are fired asynchronously upon business logic completion.

## SECTION 3: Database Domain Model

### Key Entities:
1. **User / Salesman / Distributor / Manufacturer:** Core identities. User maps 1:1 to roles.
2. **Shop & ShopVisit:** A Shop represents a physical location (Point geometry). ShopVisit logs a salesman's interaction.
3. **Product & Order:** Order encapsulates items, prices, and status. It supports revisions (`OrderRevision`).
4. **LocationLog:** Tracks salesman GPS coordinates over time using PostGIS points.

## SECTION 4: Authentication & Authorization

### JWT Implementation
* **Login Flow:** `/auth/login` accepts credentials, returns `accessToken` and `refreshToken`.
* **Guards:** Endpoints require Bearer token. `RoleGuard` uses the `roles` and `permissions` metadata to enforce access controls.
* **Frontend Implementation:** Tokens should be stored in secure storage. Refresh tokens must be rotated automatically when the access token expires.

## SECTION 5: Complete API Contracts

### Endpoints (Representative Mapping)
* **Auth:** `POST /auth/login`, `POST /auth/refresh`
* **Salesmen:** `GET /salesmen`, `POST /salesmen`, `GET /salesmen/:id`
* **Shops:** `GET /shops`, `POST /shops` (Requires multipart image upload), `GET /shops/nearby`
* **Visits:** `POST /visits/check-in`, `POST /visits/check-out`
* **Orders:** `POST /orders`, `GET /orders`
* **Pagination:** Query parameters `?page=1&limit=10&search=keyword` mapped to TypeORM skip/take.

## SECTION 6: Complete Realtime Architecture

* **WebSocket Gateway:** `/socket-gateway`
* **Rooms:** Users join rooms based on their `userId` and `role`.
* **Events Fired:** 
  * `notification.received`: Emitted when FCM/background job generates an alert.
  * `order.updated`: Emitted to distributors when an order status changes.

## SECTION 7: Push Notification Architecture

* **FCM Registration:** Mobile app registers FCM token via `POST /user/fcm-token`.
* **Delivery:** Background jobs (`NotificationProcessor` using BullMQ) queue and dispatch Firebase messages.
* **Types:** Order Status Changes, Approval Requests, Admin Announcements.

## SECTION 8: File Upload Architecture

* **Flow:** `POST /shops` accepts `multipart/form-data`.
* **Backend Handling:** Image is processed and saved, creating an `UploadedFile` entity.
* **Validation:** File size and MIME type (image/jpeg, image/png) are enforced via NestJS pipes.

## SECTION 9: Search, Filter, Pagination & Query Systems

* **Architecture:** Uses standard query params parsed into TypeORM `FindManyOptions`.
* **Frontend Expectation:** Use hooks like `useDataTable` to sync URL search params with grid states.

## SECTION 10: Error Handling & Recovery

* **Validation:** class-validator throws 400 Bad Request with an array of constraints.
* **API Errors:** Global exception filter standardizes errors into `{ statusCode, message, timestamp, path }`.

## SECTION 11: Offline & Sync Expectations

* **Sync Behavior:** Field agents may operate offline. The backend provides an `offline-sync` module.
* **Conflict Resolution:** Operations are stamped with `sync_id` and timestamped to handle eventual consistency.

## SECTION 12: Screen-to-API Mapping

* **Manufacturers/Salesmen Grid:** `GET /manufacturers`, `GET /salesmen` (requires Pagination Response format).
* **Shop Check-in Screen:** `POST /visits/check-in` (requires active GPS coordinates).
* **Order Creation Screen:** `GET /products`, `POST /orders`.

## SECTION 13: Frontend Architecture Recommendations

* **State:** Use TanStack Query for robust caching and optimistic updates.
* **API:** Axios interceptors for automatic JWT refresh.
* **Realtime:** Socket.IO client integrated with React Context.

## SECTION 14: Technical Risks & Integration Warnings

* **GPS Drift:** PostGIS queries must tolerate minor GPS drift during check-ins.
* **Prop Signatures:** Strictly type API responses (e.g., `PaginatedResponse<T>`) to prevent React hydration or rendering failures.
* **Queue Injections:** If Redis is down, `QueueModule` safely no-ops. Frontend must not rely purely on websockets for critical state.

## SECTION 15: Complete Frontend Build Checklist

- [ ] JWT Interceptors Configured
- [ ] FCM Token Registration Flow
- [ ] Offline Sync Queue implemented
- [ ] Strict TypeScript mapping of all nested DTOs
- [ ] Location permission handling for check-ins
