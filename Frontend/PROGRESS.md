# Vikash Inventory — Progress Tracker

> Lean checklist. `[ ]` todo · `[~]` in-progress · `[x]` done.
> Full requirements live in `PRD.md`. Project context in `CLAUDE.md`.

**Last updated:** 2026-06-27
**Active task:** (paused) Recent work: dashboards polish + recent orders, distributor product CRUD + tags/image, add-shop location search, cart gated to active visit + unit stock cap, salesman-only check-in/visit.

**NEXT PLAN — Statuses:**
1. **Product status (active/inactive)** — show Active/Inactive badge on distributor's own product cards; toggle via `PUT /products/:id { is_active }` (UpdateProductDto currently lacks `is_active` → backend must add; whitelist strips it for now). Optional: filter products by status.
2. **Order-status summary on dashboard** — wire the distributor "Orders Summary" counts (Pending/Approved/Dispatched, currently 0) to real data via `GET /orders?status=…` counts or `GET /analytics/dashboard` (orders analytics). Consider a small status summary on the salesman dashboard too. (Note: order status *transitions* are admin-only — dashboard is view/counts.)
Deferred still: Account & Profile, Notifications, Catalog (no backend), PDF share.
**Blockers:** Forgot-password has NO backend endpoint (OTP not implemented) — UI built but inert. Backend base URL needed for live testing. Cart totals are a client-side PREVIEW — authoritative pricing comes from the backend at order placement (Phase 5). Product category filter awaits backend query param.

---

## Authentication
- [x] Login (email/phone + password) — wired to POST /v1/auth/login → /me
- [x] App is LOGIN-ONLY — no in-app registration (distributors created on backend/admin side; salesmen by their distributor)
- [x] Salesman creation on distributor side (POST /v1/salesmen)
- [~] Forgot password (OTP flow) — UI built, BLOCKED on backend (no OTP endpoint)
- [x] Session management — secure-store tokens + 401 auto-refresh

## Approval Workflow
- [x] Salesman waiting-for-approval state
- [ ] Distributor pre-approval browse-only
- [ ] Approval notifications

## GPS & Visit Tracking (Salesman)
- [x] Check-in / check-out with GPS (POST /working-day/check-in|check-out)
- [x] Start visit at a shop with GPS (POST /visits/start) → active visit
- [x] End visit / no-order with reason (POST /visits/no-order, /visits/end)
- [x] GPS error handling (permission / insecure-origin / failure messages)
- [ ] Auto checkout 12:00 AM (backend job; client shows server state)

## Dashboards
- [x] Salesman dashboard — check-in/out + active-visit banner wired to backend; recent-orders still placeholder
- [~] Distributor dashboard — New Order → products wired; orders-summary/categories counts still placeholder
- [x] Bottom-tab nav shell (Home · Shops · Orders · Account), role-routed Home
- [x] Account tab (identity, language, logout)

## Shop Management
- [x] Shop listing (search by name/phone/owner, infinite scroll, pull-to-refresh)
- [x] Shop detail (view + delete)
- [x] Add shop (GPS capture, camera/library photo, duplicate check + bypass, create + image upload)
- [~] Nearby-first sort + city/state filter — backend `GET /shops` has no distance/city/state params yet (search + status only)

## Product Management
- [x] Salesman product visibility (Browse Products → GET /products, backend-enforced)
- [x] Distributor product visibility (New Order → GET /products, backend-enforced)
- [x] Distributor product CRUD — add (POST /products), edit (PUT /products/:id), delete (DELETE /products/:id); own DISTRIBUTOR_CREATED products show edit/delete icons; inline add-tag/category (POST /product-categories). Note: edit can't change category/manufacturer (UpdateProductDto omits them).
- [x] Product card UI + cart actions (image, MRP/distributor price, add + qty stepper)

## Cart & Pricing
- [~] Salesman cart (shares distributor breakdown; editable-discount variant deferred to salesman order phase)
- [x] Distributor cart (subtotal → distributor discount → additional discount → GST → final, client preview)

## Ordering
- [x] Salesman order flow (check-in → start visit → add products → place order → success)
- [x] Order placement (POST /orders with visitId+shopId; backend computes pricing)
- [x] No-order / end-visit popup (reason ≤20 chars)
- n/a Distributor order flow — backend POST /orders is SALESMAN-only by design

## Orders Module
- [x] Orders listing (search + status filter chips + paginated, role-scoped via GET /orders)
- [x] Order details (items, totals breakdown, status timeline, Share TXT)
- [~] Share PDF — TXT done via RN Share; PDF deferred (needs a print/pdf lib)
- [x] Order success screen (order number + go to dashboard)

## Catalog
- [ ] Catalog PDF viewer

## Notifications
- [ ] All order/approval/catalog notifications

## Account & Profile
- [ ] Profile, password, delete, logout
- [ ] Sidebar menu
- [x] Distributor: Salesmen management (Account → Salesmen: list/search, add, edit name/email/phone)
- active/approval controls handled on backend/admin side (not in app); status shown read-only on detail

## Error & Recovery
- [ ] All error/empty/retry screens

## Security
- [ ] JWT, secure storage, timeout, HTTPS, authz

## Localization (Hindi + English)
- [x] i18n setup (i18next + react-i18next, device-locale detection)
- [~] Hindi + English strings (auth/common done; add keys per feature)
- [x] Language switcher (LanguageToggle component)
- [x] Persist language choice (AsyncStorage)
- [~] All screens/errors/notifications translated (auth done; rest as built)