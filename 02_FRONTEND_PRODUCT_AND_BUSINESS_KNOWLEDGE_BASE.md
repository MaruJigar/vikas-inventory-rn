# 02_FRONTEND_PRODUCT_AND_BUSINESS_KNOWLEDGE_BASE.md

## SECTION 1: Executive Product Summary

Vikas Inventory Platform provides end-to-end management for field sales operations. The product vision is to eliminate paperwork, provide real-time location tracking of field agents, streamline order generation, and centralize the approval and notification process for administrators, distributors, and salesmen.

## SECTION 2: Business Domain Overview

Field sales involves agents visiting shops, taking stock of inventory, creating orders, and establishing new shop relationships. Managers require visibility into where their agents are and what orders are pending. The system brings this entirely digital.

## SECTION 3: User Personas

1. **Super Admin:** Full visibility, manages manufacturers and distributors.
2. **Manufacturer:** Views orders and inventory associated with their products.
3. **Distributor:** Reviews and fulfills orders placed by salesmen.
4. **Salesman:** Visits shops, logs attendance, takes orders.

## SECTION 4: Complete Business Workflows

* **Visit Management:** 
  1. Salesman approaches shop.
  2. Submits Check-In (GPS is verified against Shop Location).
  3. Takes Order.
  4. Submits Check-Out.
* **Shop Registration:** 
  1. Salesman captures Shop details + Image.
  2. Duplicate detection triggers (PostGIS search for proximity).
  3. Sent for admin approval if flagged.

## SECTION 5: Complete User Journeys

### Field Visit Journey
1. Salesman opens mobile app, logs in.
2. Background location tracking begins.
3. Arrives at destination, taps "Check In".
4. API validates distance. If offline, the action is queued.
5. Salesman captures order and hits Submit. Order is placed in "Pending Approval" state.

## SECTION 6: Business Rules Repository

* **RULE-01 (Check-In Proximity):** A salesman cannot check into a shop if their GPS location exceeds the maximum allowed radius (handled via PostGIS `ST_Distance`).
* **RULE-02 (Duplicate Shop):** A shop cannot be created if another shop with a similar name exists within 100 meters without overriding duplicate detection logic.

## SECTION 7: KPIs, Metrics & Reporting Logic

* **Sales KPIs:** Total orders generated, Total value of orders.
* **Visit KPIs:** Daily check-ins, average duration spent per shop.
* **Calculations:** Visit durations are computed as the delta between `checkInTime` and `checkOutTime`.

## SECTION 8: Notification & Alert Matrix

* **Order Created:** Triggered on order submit. Sent to Distributor.
* **Order Approved/Rejected:** Triggered by Distributor. Sent to Salesman.
* **Duplicate Flagged:** Triggered on shop creation. Sent to Admin.

## SECTION 9: UX & Product Expectations

* **Mobile-First:** Salesmen use low-end Android devices in the field. UI must be high-contrast and buttons must be large.
* **Reliability:** Data must not be lost during spotty cellular coverage. Offline sync is non-negotiable.

## SECTION 10: Edge Cases & Failure Scenarios

* **GPS Failure:** If GPS is denied, check-ins fall back to manual override (requires Admin approval).
* **Token Expiry:** Seamless refresh via interceptors. User should never be abruptly logged out while submitting an order.
* **Upload Failures:** Images should be cached locally and retried.

## SECTION 11: Complete Frontend Behavior Specification

* **What users expect:** Instant feedback on orders, smooth navigation.
* **What should never happen:** A salesman losing a drafted order due to a network timeout.
* **Loading states:** Required for all grid fetching, image uploads, and check-ins. Skeleton loaders preferred.

## SECTION 12: AI Frontend Development Context

### Architecture Constraints
* MUST enforce strict Suspense boundaries on Next.js pages consuming `useSearchParams`.
* MUST maintain exact parity with `PaginatedResponse<T>` wrappers from the backend.
* Offline Sync MUST utilize the `/offline-sync` batch endpoints to drain local SQLite queues.
* FCM tokens MUST be refreshed and synced to the backend periodically.
