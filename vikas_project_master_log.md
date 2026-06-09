# Vikas Marketing — Project Master Log
### Field Sales, Inventory & Order Management System

**Started:** June 9, 2026
**Client:** Vikas Marketing
**Team:** Param Buddh (Frontend) & Jigar Maru (Backend)

> This document tracks every decision, change, and step taken throughout the project. Updated continuously.

---

## 1. Blueprint Review Summary (June 9, 2026)

### Documents Reviewed
- `field_sales_backend_blueprint.md` — 1868 lines, 28 sections
- `field_sales_frontend_blueprint.md` — 1734 lines, 15 sections

### Key Observation: MASSIVE Scope Expansion

These blueprints describe a **completely different product** from what was originally quoted. Here's the delta:

| Aspect | Original Quote (May 2026) | Blueprint Scope |
| :--- | :--- | :--- |
| **User Roles** | 2 (Admin + Salesman) | 3+ (Manufacturer + Distributor + Salesman + optional Super Admin) |
| **Hierarchy** | Flat — Vikas is admin | Multi-level — Manufacturer → Distributor → Salesman |
| **Shops/Customers** | Simple customer list | Full shop management with duplicate detection, visit tracking, no-order reasons |
| **Inventory** | Admin adds, auto-deducts | Multi-distributor inventory with reserved/backordered/dispatched states |
| **Orders** | Simple place & view | Full lifecycle with item-level statuses, revisions, edit logs, backorders |
| **Location** | GPS at order time only | Working-day check-in/out, continuous tracking every 2-5 min, route history |
| **Offline** | Not planned | Full offline-first with SQLite/Realm, batch sync, idempotency, conflict resolution |
| **Analytics** | Basic stats | 50+ analytics dimensions across 3 roles |
| **Notifications** | Simple in-app | Push notifications + in-app + queue-based processing |
| **Audit** | None | Full audit logging on every action |
| **Fulfillment** | Not planned | Complete dispatch/delivery pipeline owned by distributor |
| **Total Screens** | ~14 | ~40+ screens across 3 roles |

---

## 2. Blueprint Architecture Summary

### Backend Architecture (from blueprint)
```
Mobile App → REST API (Node.js) → PostgreSQL (Neon DB)
                                → Redis (Cache/Queue)
                                → Queue Workers (Notifications, Sync, Analytics)
                                → Cloudinary (Images)
```

### Three User Roles & Their Core Functions

#### Manufacturer (= Vikas Marketing in this context)
- Creates products
- Invites & approves distributors
- Adds salesmen
- Views all orders, analytics, locations
- Cannot fulfill orders or update delivery

#### Distributor
- Works with multiple manufacturers
- Maintains separate inventory per manufacturer
- Adds salesmen
- Receives order notifications
- Fulfills orders (pack → dispatch → deliver)
- Manages stock with reserved/backordered quantities

#### Salesman
- Works under ONE distributor
- Check-in/out for working day (triggers location tracking)
- Visits shops, registers new shops
- Places/edits/cancels orders
- Works offline, syncs later
- Cannot manage inventory or mark delivered

### Database Tables Needed (~22 table groups)
```
users, roles, permissions, manufacturers, distributors,
manufacturer_distributors, salesmen, products,
distributor_inventory, inventory_movements, shops,
shop_duplicate_logs, shop_visits, working_days,
orders, order_items, order_revisions, order_status_history,
backorders, fulfillment_logs, location_logs, latest_locations,
notifications, offline_sync_batches, offline_sync_items,
audit_logs, analytics_snapshots
```

### Frontend Screen Count
- Salesman: ~15 screens
- Distributor: ~13 screens
- Manufacturer: ~13 screens
- Shared: ~5 screens (Login, Offline, Sync, Audit, etc.)
- **Total: ~46 screens**

---

## 3. Confirmed Tech Stack (Vikas Project)

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| Mobile App | React Native (Expo) | Single app, role-based navigation |
| Backend API | Node.js (Express or Fastify) | Blueprint recommends NestJS — need to decide |
| Database | Neon DB (PostgreSQL) | Free tier = 0.5GB, may need upgrade |
| Image Storage | Cloudinary | Product images, shop photos |
| Cache/Queue | TBD | Blueprint recommends Redis + BullMQ |
| Offline Storage | TBD | Blueprint recommends SQLite/WatermelonDB/Realm |
| Maps | TBD | Google Maps / Mapbox |
| Push Notifications | TBD | Firebase Cloud Messaging recommended |

---

## 4. Critical Decisions Needed

### 4.1 Is Vikas the "Manufacturer" in this system?
The blueprint treats manufacturer as the top-level entity who owns products and invites distributors. Is Vikas Marketing the manufacturer? Or is Vikas a distributor who sells for multiple manufacturers?

### 4.2 How many manufacturers will the system support?
- Just Vikas Marketing (single-tenant)?
- Multiple manufacturers (multi-tenant SaaS)?

### 4.3 Continuous location tracking vs. order-time only?
- Original agreement: GPS only at order placement + customer visit
- Blueprint: Every 2-5 minutes during working hours with route replay
- Which one are we building?

### 4.4 Offline-first or online-only?
- Blueprint mandates full offline support with SQLite + batch sync
- This is a major architectural decision that affects everything
- 75 salesmen in potentially remote areas — offline may be necessary

### 4.5 Backend framework: Express vs NestJS?
- Blueprint recommends NestJS for structure
- Team familiarity may favor Express
- Jigar's preference matters here

### 4.6 Redis needed?
- Blueprint uses Redis for caching, queues, notifications
- Adds infrastructure cost and complexity
- Can we start without it?

### 4.7 Pricing impact?
- This scope is 5-10x larger than what was quoted at ₹90k-₹120k
- Has the pricing been renegotiated for this expanded scope?

---

## 5. MVP Phase Recommendation (from blueprint)

### Phase 1: Core Platform
- Authentication + roles
- Manufacturer management
- Distributor invitation + approval
- Salesman management
- Product catalog
- Distributor inventory
- Shop creation + duplicate detection
- Shop visit management
- Order creation + backorder logic
- Distributor fulfillment
- Order editing with logs
- Location check-in/check-out
- Basic offline sync
- Distributor notifications
- Basic dashboards
- Audit logs

### Phase 2: Advanced Analytics
- Deep analytics for all 3 roles
- Visit conversion reports
- Inventory health reports
- Delivery SLA reports
- Location route analytics
- Export reports

### Phase 3: Optimization & Scale
- Advanced duplicate detection
- Geofencing
- Route replay
- Predictive alerts
- Advanced conflict resolution

---

## 6. Change Log

| Date | Change | Details |
| :--- | :--- | :--- |
| June 9, 2026 | Blueprint review completed | Both backend and frontend blueprints analyzed. Scope expansion identified. |
| | | Awaiting user clarification on critical decisions before proceeding. |
