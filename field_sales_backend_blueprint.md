# Field Sales, Distributor Inventory, Order Fulfillment & Analytics Backend Blueprint

## 1. Purpose of the System

This backend is for a field sales application where manufacturers, distributors, and salesmen operate together in a structured hierarchy.

The platform is not only an order management system. It is a complete field sales operating system that covers:

- Manufacturer management
- Distributor invitation and approval
- Salesman management
- Product catalog management
- Distributor-wise inventory management
- Shop/retailer management
- Shop visit tracking
- Sales order creation
- Backorder handling
- Order editing with complete logs
- Delivery/fulfillment tracking
- Working-hours-based live location tracking
- Offline-first mobile sync
- Distributor notifications
- Manufacturer, distributor, and salesman analytics
- Full audit logging

The final goal is to keep a complete record of:

- Which manufacturer owns which products
- Which distributor is selling for which manufacturer
- Which salesman is selling under which distributor
- Which shops are being visited
- Which shops are ordering
- Which products are selling
- Which locations/regions are performing
- Which distributors are fulfilling properly
- Which salesmen are productive
- Where backorders and delays are happening

---

## 2. Core Business Entities

### 2.1 Manufacturer

A manufacturer is the product owner.

Manufacturer can:

- Create products
- Invite distributors
- Approve or reject distributor access
- Add salesmen
- View distributors
- View salesmen
- View shops
- View orders
- View inventory visibility across distributors
- View delivery performance
- View location and visit analytics
- View full analytics dashboards

Manufacturer cannot:

- Fulfill orders directly
- Update delivery status
- Manage distributor stock directly, unless specifically allowed later

---

### 2.2 Distributor

A distributor handles inventory and order fulfillment.

Distributor can:

- Work with multiple manufacturers
- Maintain separate inventory for each manufacturer
- Add salesmen
- View assigned salesmen
- View shops
- Receive order notifications
- Fulfill orders
- Update order delivery statuses
- Mark orders as delivered
- View analytics for their own business

Distributor receives operational notifications only.

---

### 2.3 Salesman

A salesman works under one distributor.

Salesman can:

- Sell products available through their own distributor
- Sell only for the distributor they belong to
- Check in for the working day
- Start location tracking during working hours
- Visit shops
- Register new shops
- Place orders
- Edit or cancel orders at any point
- Mark visit as productive or non-productive
- Add no-order reason
- Work offline
- Sync data later

Salesman cannot:

- Create manufacturer products
- Manage inventory
- Update delivery fulfillment status
- Mark orders delivered

---

### 2.4 Shop / Retailer

A shop is a shared business entity.

Shops can be created by:

- Manufacturer
- Distributor
- Salesman

New shops become active immediately.

A shop should not belong exclusively to one salesman. Multiple salesmen, distributors, and manufacturers can build history against the same shop.

The shop record should preserve:

- Shop details
- Owner/contact details
- Location
- Created by
- Visit history
- Order history
- Manufacturer-wise sales
- Distributor-wise sales
- Salesman-wise sales
- No-order history
- Last visit date
- Last order date

---

## 3. Confirmed Business Rules

```txt
System supports multiple manufacturers.

Manufacturer creates products.

Manufacturer invites distributors.

Manufacturer approves/rejects distributor access.

Distributor can work with multiple manufacturers.

Distributor maintains inventory separately for each manufacturer.

Salesman belongs to one distributor.

Salesman sells products only through their own distributor.

Manufacturer and distributor can both add salesmen.

Shop can be created by manufacturer, distributor, or salesman.

New shop becomes active immediately.

Shop records are shared for long-term analytics.

Shop duplication is checked using phone number, location, and fuzzy name matching.

Salesman can register a new shop and then place an order.

Salesman can edit/cancel an order at any point.

Every edit must be logged completely.

Distributor manages fulfillment.

Distributor marks order delivery statuses.

Distributor marks orders as delivered.

Inventory is reserved on order.

Inventory is reduced on dispatch.

Backorders are allowed by default.

No payment collection module is needed.

No returns/damaged goods module is needed for now.

No sales target module is needed for now.

Distributor receives operational notifications.

Location tracking runs only during working hours after check-in/login.

Shop visit management is required.

Full analytics are required for manufacturer, distributor, and salesman.
```

---

## 4. Recommended High-Level Architecture

```txt
Mobile App for Salesmen
        |
        | REST/GraphQL APIs
        v
Backend API Server
        |
        |-----------------------------|
        |                             |
PostgreSQL Database             Redis Cache
        |
        |-----------------------------|
        |                             |
Queue Workers              Analytics Workers
        |
        v
Notification Service
        |
        v
Distributor Notifications

Web Dashboard
        |
        v
Backend API Server
```

---

## 5. Recommended Technology Stack

### Backend

Recommended options:

- NestJS with Node.js
- Java Spring Boot
- Django / FastAPI

Preferred recommendation:

```txt
NestJS + PostgreSQL + Redis + BullMQ
```

Reason:

- Strong modular structure
- Good for role-based APIs
- Easy background job handling
- Good support for queues
- Works well for REST APIs
- Easy integration with mobile and web apps

### Database

Recommended:

```txt
PostgreSQL
```

Why:

- Strong relational structure
- Good indexing
- Good JSON support
- Good geospatial support with PostGIS
- Reliable transactions for inventory handling

### Cache / Queue

Recommended:

```txt
Redis
BullMQ / RabbitMQ
```

Used for:

- Notifications
- Offline sync processing
- Analytics aggregation
- Background jobs
- Location latest-state caching

### Mobile Offline Storage

Recommended:

```txt
SQLite or Realm
```

Used for:

- Offline shop creation
- Offline order creation
- Offline shop visits
- Offline location logs
- Pending sync queue

### Maps / Location

Recommended:

- Google Maps
- Mapbox
- OpenStreetMap based solution

---

## 6. User Roles & Permissions

### 6.1 Super Admin

Optional internal system role.

Can:

- Manage all manufacturers
- Manage global settings
- View system-wide logs
- Handle support issues
- Disable users

---

### 6.2 Manufacturer Admin

Can:

- Manage manufacturer profile
- Create products
- Invite distributors
- Approve/reject distributor access
- Add salesmen
- View all manufacturer-linked data
- View analytics
- View locations during working hours
- View shop performance
- View distributor performance

Cannot:

- Update delivery status
- Mark order delivered
- Directly create distributor stock movement unless enabled later

---

### 6.3 Distributor Admin

Can:

- Manage own profile
- Manage inventory by manufacturer
- Add salesmen
- View assigned salesmen
- View orders
- Receive notifications
- Update fulfillment status
- Mark delivered
- View shop visits
- View location data of own salesmen
- View analytics

---

### 6.4 Salesman

Can:

- Check in
- Check out
- Share location while checked in
- View assigned/available shops
- Create shops
- Start shop visit
- Mark no-order reason
- Place orders
- Edit orders anytime
- Cancel orders anytime
- Work offline
- Sync offline data

Cannot:

- Create products
- Manage inventory
- Mark delivered
- Approve distributors

---

## 7. Distributor Invitation & Approval Flow

Recommended model:

```txt
Manufacturer creates distributor invite
        ↓
Distributor receives invitation
        ↓
Distributor completes signup
        ↓
Manufacturer approves/rejects access
        ↓
If approved, distributor can operate for that manufacturer
```

This is better than open distributor signup because manufacturers should control who can sell their products.

A distributor can be connected to multiple manufacturers.

Example:

```txt
Distributor X
  ├ Manufacturer A
  ├ Manufacturer B
  └ Manufacturer C
```

Each manufacturer relationship should have its own approval status.

Possible statuses:

```txt
Invited
Pending Signup
Pending Approval
Approved
Rejected
Suspended
Revoked
```

---

## 8. Product Catalog

Only manufacturers can create products.

Product belongs to one manufacturer.

Distributor cannot create manufacturer products.

Manufacturer product information may include:

- Product name
- SKU/code
- Category
- Unit
- MRP/base price
- Description
- Product image
- Active/inactive status
- Tax/category metadata if needed later

Distributors maintain inventory for products belonging to manufacturers they are approved for.

---

## 9. Inventory Management

### 9.1 Inventory Ownership

Inventory is maintained per distributor and per manufacturer.

Example:

```txt
Distributor X
  ├ Manufacturer A Inventory
  ├ Manufacturer B Inventory
  └ Manufacturer C Inventory
```

This is required because one distributor can work with multiple manufacturers.

---

### 9.2 Inventory States

Recommended inventory concepts:

```txt
Available Quantity
Reserved Quantity
Backordered Quantity
Dispatched Quantity
```

Example:

```txt
Product A stock = 100
Order placed = 30

Available = 70
Reserved = 30
```

When dispatched:

```txt
Reserved = 0
Actual stock reduced
```

Inventory is reduced on dispatch.

---

### 9.3 Backorder Handling

Backorders are allowed by default.

Example:

```txt
Available stock: 30
Order quantity: 50

30 units reserved
20 units backordered
```

The system should not reject the order because of insufficient stock.

Distributor should be notified when an order has backordered quantity.

---

### 9.4 Inventory Adjustment

Distributor should be able to adjust inventory manually for operational reasons.

Examples:

- New stock received
- Manual correction
- Stock count correction
- Lost stock
- Opening stock entry

Every adjustment must be logged.

Each inventory movement should record:

- Product
- Distributor
- Manufacturer
- Quantity change
- Movement type
- Previous quantity
- New quantity
- User who changed it
- Timestamp
- Reason

---

## 10. Order Management

### 10.1 Order Creation Flow

```txt
Salesman checks in
        ↓
Location tracking starts
        ↓
Salesman starts shop visit
        ↓
Salesman selects or creates shop
        ↓
Salesman places order
        ↓
System checks distributor inventory
        ↓
Available quantity is reserved
        ↓
Unavailable quantity becomes backorder
        ↓
Distributor receives notification
        ↓
Distributor processes the order
        ↓
Distributor dispatches
        ↓
Inventory reduces on dispatch
        ↓
Distributor marks delivered
```

---

### 10.2 Order Statuses

Recommended order-level statuses:

```txt
Created
Confirmed
Partially Confirmed
Backordered
Processing
Packed
Partially Dispatched
Dispatched
Partially Delivered
Delivered
Cancelled
Edited/Revised
```

Because backorders are allowed, order-level status alone is not enough. Each order item should also have its own status.

---

### 10.3 Order Item Statuses

Recommended item-level statuses:

```txt
Ordered
Reserved
Backordered
Packed
Dispatched
Delivered
Cancelled
Edited
```

Item-level tracking is important because one order may contain multiple products with different stock availability.

Example:

```txt
Order #1001
  Product A: Reserved
  Product B: Backordered
  Product C: Dispatched
```

---

## 11. Order Editing Rules

Salesman can edit or cancel an order at any point.

However, the system must not simply overwrite the old data.

Every change must create a complete revision/audit trail.

### 11.1 Recommended UX

Keep the user experience simple:

```txt
Salesman opens order
Salesman edits quantity/products
Salesman saves changes
```

Internally, the backend logs everything.

---

### 11.2 What Must Be Logged

For every order edit, store:

- Order ID
- Old order data
- New order data
- Changed fields
- Old item quantities
- New item quantities
- Added products
- Removed products
- Edited products
- User who changed it
- Role of user
- Timestamp
- Order status at time of edit
- Reason for change if required
- Inventory impact
- Whether distributor was notified

---

### 11.3 Before Dispatch

If the order is edited before dispatch:

- Reserved stock can be adjusted automatically
- Backorder quantities can be recalculated
- Distributor receives normal update notification

Example:

```txt
Original order: 50 units
Edited order: 40 units

Reserved quantity is reduced by 10
```

---

### 11.4 After Dispatch or Delivery

If the order is edited after dispatch or delivery:

- Do not automatically reverse inventory
- Store the changed order data
- Store full edit logs
- Notify distributor
- Show warning/flag on order
- Analytics should be able to show original vs revised quantity

Reason:

Once stock has physically moved, automatic reversal can create incorrect inventory.

Recommended flag:

```txt
Post Dispatch Edited = true
```

or

```txt
Post Delivery Edited = true
```

Distributor should see these as exceptions.

---

## 12. Delivery / Fulfillment Management

Distributor owns fulfillment.

Distributor marks:

- Processing
- Packed
- Partially dispatched
- Dispatched
- Partially delivered
- Delivered
- Cancelled

Inventory is reduced when distributor marks items/order as dispatched.

Distributor marks delivered.

Salesman does not mark delivered.

---

## 13. Shop Management

### 13.1 Shop Creation

Shops can be created by:

- Manufacturer
- Distributor
- Salesman

New shop becomes active immediately.

If salesman wants to place order for a new shop, the shop must be registered first.

Flow:

```txt
Salesman enters shop details
        ↓
System checks possible duplicates
        ↓
If no duplicate, shop is created
        ↓
Shop becomes active immediately
        ↓
Salesman places order
```

---

### 13.2 Duplicate Detection

Duplicate checking should use:

```txt
1. Phone number match
2. Location proximity match
3. Fuzzy shop name match
```

Optional future field:

```txt
GST number
```

Duplicate detection should not always block creation. It should warn the user.

Example:

```txt
Possible duplicate found:
ABC Hardware, 120 meters away, same phone number
```

The user can:

- Use existing shop
- Create new shop anyway, if allowed

Every duplicate bypass should be logged.

---

### 13.3 Shop History

Each shop should show:

- Total visits
- Total orders
- Total sales value
- Last visit date
- Last order date
- Salesman-wise history
- Distributor-wise history
- Manufacturer-wise history
- Product-wise order history
- No-order reasons
- Location history if changed

---

## 14. Shop Visit Management

Shop visit management is a core module.

### 14.1 Visit Flow

```txt
Salesman checks in for working day
        ↓
Location tracking starts
        ↓
Salesman reaches shop
        ↓
Salesman starts visit
        ↓
Location is captured
        ↓
Salesman either places order or marks No Order
        ↓
If No Order, reason is mandatory
        ↓
Salesman ends visit
        ↓
Location is captured again
```

---

### 14.2 Visit Types

```txt
Productive Visit
Non-Productive Visit
```

A productive visit means an order was placed.

A non-productive visit means no order was placed and a reason was selected.

---

### 14.3 No-Order Reasons

Recommended default reasons:

```txt
Shop closed
Owner unavailable
No stock requirement
Price issue
Already purchased
Competitor product available
Follow-up needed
Other
```

The reason should be mandatory when no order is placed.

---

### 14.4 Visit Analytics

Track:

- Total visits
- Productive visits
- Non-productive visits
- Visit-to-order conversion rate
- No-order reason breakdown
- Salesman-wise visits
- Distributor-wise visits
- Manufacturer-wise visits
- Shop-wise visit history
- Average time spent per shop
- Visits without location
- Visits far from shop location

---

## 15. Working Day & Location Tracking

Location tracking should only run during working hours after salesman check-in/login.

### 15.1 Working Day Flow

```txt
Salesman checks in
        ↓
Location tracking starts
        ↓
Salesman performs visits and orders
        ↓
Salesman checks out
        ↓
Location tracking stops
```

---

### 15.2 Location Capture Events

Capture location:

- On check-in
- Periodically during working hours
- On shop visit start
- On shop visit end
- On order creation
- On order edit
- On check-out

---

### 15.3 Location Frequency

Recommended:

```txt
Every 2-5 minutes during working hours
```

The exact interval can be configurable.

Consider battery optimization and privacy.

---

### 15.4 Location Data Use

Location data is used for:

- Live salesman tracking
- Route history
- Visit verification
- Order location verification
- Shop coverage analytics
- Salesman productivity analytics
- Distance travelled
- Working hours validation

---

## 16. Offline-First Sync

Offline support is required because salesmen may work in remote areas without network.

The mobile app should store data locally and sync later.

### 16.1 Offline Data Types

The app should support offline creation of:

- Shop visits
- New shops
- Orders
- Order items
- Location logs
- No-order reasons
- Order edits
- Check-in/check-out events, if network is unavailable

---

### 16.2 Local Sync Fields

Each offline record should have:

```txt
local_id
server_id
sync_status
created_at
updated_at
device_id
idempotency_key
last_sync_attempt_at
sync_error
```

Recommended sync statuses:

```txt
Pending
Synced
Failed
Conflict
```

---

### 16.3 Idempotency

Every offline-created object must have an idempotency key.

Example:

```txt
idempotency_key = device_id + local_id + entity_type
```

This prevents duplicate orders, duplicate shops, and duplicate visits when sync is retried.

---

### 16.4 Sync Flow

```txt
Mobile app collects offline data
        ↓
Network becomes available
        ↓
App sends batch sync request
        ↓
Backend validates data
        ↓
Backend creates/updates records
        ↓
Backend returns server IDs
        ↓
Mobile marks records as synced
```

---

### 16.5 Sync Conflict Examples

Possible conflicts:

- Duplicate shop found
- Product no longer active
- Distributor-manufacturer relationship disabled
- Salesman account disabled
- Order was edited from another device
- Inventory changed before sync

Because backorders are allowed, insufficient inventory should not fail order sync. It should create backordered quantity.

---

## 17. Notifications

Only distributor receives notifications.

### 17.1 Distributor Notification Events

Recommended notifications:

```txt
New order received
Order edited
Order cancelled
Order edited after dispatch
Order edited after delivery
Backorder created
New shop created by salesman
Low inventory
Shop visit completed without order
Offline data synced with pending issues
```

### 17.2 Notification Channels

Possible channels:

- In-app notification
- Push notification
- Email, optional
- SMS/WhatsApp, optional future enhancement

For v1, in-app and push notifications are enough.

---

## 18. Audit Logs

Audit logs are mandatory for each and everything.

This system should be audit-first.

### 18.1 What Should Be Logged

Log all important actions:

- Login
- Logout
- Check-in
- Check-out
- Location started/stopped
- Manufacturer created/updated
- Distributor invited
- Distributor approved/rejected
- Salesman created/updated/deactivated
- Product created/updated/deactivated
- Inventory added/adjusted
- Shop created/updated
- Duplicate warning ignored
- Visit started
- Visit ended
- No-order reason submitted
- Order created
- Order edited
- Order cancelled
- Order status changed
- Order dispatched
- Order delivered
- Backorder created
- Offline sync completed
- Offline sync failed
- Notification sent

---

### 18.2 Audit Log Data

Each audit log should include:

```txt
actor_user_id
actor_role
action
entity_type
entity_id
old_value
new_value
metadata
ip_address
device_id
location_latitude
location_longitude
created_at
```

---

### 18.3 Why Audit Logs Matter

Audit logs help answer:

- Who changed the order?
- What exactly changed?
- When did it change?
- Was inventory affected?
- Was the distributor notified?
- Was the salesman at the shop when order was created?
- Was the order edited after dispatch?
- Who approved the distributor?

---

## 19. Analytics Dashboards

Analytics are required for all three entities:

- Manufacturer
- Distributor
- Salesman

Manufacturer needs the most detailed analytics.

---

### 19.1 Manufacturer Analytics

Manufacturer should see everything possible across:

#### Sales Analytics

- Total sales
- Sales by date range
- Sales by distributor
- Sales by salesman
- Sales by shop
- Sales by product
- Sales by city/area/region
- Average order value
- Order count
- Quantity sold
- Product category performance

#### Distributor Performance

- Distributor-wise total sales
- Distributor-wise order count
- Distributor-wise fulfillment speed
- Distributor-wise backorder rate
- Distributor-wise delayed orders
- Distributor-wise inventory health
- Distributor-wise cancellation rate

#### Salesman Performance

- Salesman-wise sales
- Salesman-wise order count
- Salesman-wise shop visits
- Salesman-wise productive visits
- Salesman-wise non-productive visits
- Salesman-wise conversion rate
- Salesman active working hours
- Salesman distance travelled
- Salesman order edits/cancellations

#### Shop Analytics

- Active shops
- Inactive shops
- New shops created
- Shops with repeat orders
- Shops with no orders
- Shop-wise revenue
- Shop-wise product demand
- Last visit date
- Last order date

#### Visit Analytics

- Total visits
- Productive visits
- Non-productive visits
- Visit conversion percentage
- No-order reason breakdown
- Visit duration
- Visits without order
- Visits far from shop location

#### Inventory & Backorder Analytics

- Product-wise available stock at distributors
- Low-stock products
- Backordered products
- Backorder quantity
- Distributor-wise backorder rate
- Product-wise stock shortage trends

#### Delivery Analytics

- Orders by status
- Average dispatch time
- Average delivery time
- Delayed dispatches
- Delayed deliveries
- Partially dispatched orders
- Partially delivered orders

#### Location Analytics

- Salesman live location
- Route history
- Check-in/check-out locations
- Shop visit location validation
- Distance travelled
- Coverage by area

---

### 19.2 Distributor Analytics

Distributor should see:

- Total orders received
- Orders by status
- Pending orders
- Backordered orders
- Salesman-wise sales
- Salesman-wise visits
- Shop-wise order history
- Product-wise sales
- Inventory available
- Low stock
- Dispatch performance
- Delivery performance
- New shops created
- No-order reasons

---

### 19.3 Salesman Analytics

Salesman should see:

- Own total orders
- Own total sales
- Own shop visits
- Productive vs non-productive visits
- No-order reasons
- Shops visited
- Orders created
- Backordered orders
- Order status history
- Daily working hours
- Route history

---

## 20. API Module Structure

Recommended backend modules:

```txt
Auth Module
User Module
Role & Permission Module
Manufacturer Module
Distributor Module
Distributor Approval Module
Salesman Module
Product Module
Inventory Module
Shop Module
Shop Duplicate Detection Module
Shop Visit Module
Order Module
Order Revision Module
Backorder Module
Fulfillment Module
Location Module
Working Day Module
Offline Sync Module
Notification Module
Analytics Module
Audit Log Module
```

---

## 21. Suggested API Endpoints

This is a conceptual API list, not final code.

### 21.1 Authentication

```txt
POST /auth/login
POST /auth/refresh-token
POST /auth/logout
GET  /auth/me
```

---

### 21.2 Manufacturer

```txt
POST /manufacturers
GET  /manufacturers/:id
PATCH /manufacturers/:id
GET  /manufacturers/:id/dashboard
GET  /manufacturers/:id/analytics
```

---

### 21.3 Distributor Invitation & Approval

```txt
POST /manufacturers/:manufacturerId/distributors/invite
GET  /manufacturers/:manufacturerId/distributors/pending
PATCH /manufacturer-distributors/:id/approve
PATCH /manufacturer-distributors/:id/reject
PATCH /manufacturer-distributors/:id/suspend
```

---

### 21.4 Distributor

```txt
GET  /distributors/:id
PATCH /distributors/:id
GET  /distributors/:id/dashboard
GET  /distributors/:id/analytics
GET  /distributors/:id/notifications
```

---

### 21.5 Salesman

```txt
POST /salesmen
GET  /salesmen/:id
PATCH /salesmen/:id
GET  /salesmen/:id/orders
GET  /salesmen/:id/visits
GET  /salesmen/:id/location-history
```

---

### 21.6 Product

```txt
POST /manufacturers/:manufacturerId/products
GET  /manufacturers/:manufacturerId/products
PATCH /products/:id
PATCH /products/:id/activate
PATCH /products/:id/deactivate
```

---

### 21.7 Inventory

```txt
GET  /distributors/:distributorId/inventory
GET  /distributors/:distributorId/manufacturers/:manufacturerId/inventory
POST /inventory/adjust
GET  /inventory/movements
GET  /inventory/low-stock
```

---

### 21.8 Shops

```txt
POST /shops/check-duplicates
POST /shops
GET  /shops
GET  /shops/:id
PATCH /shops/:id
GET  /shops/:id/history
GET  /shops/:id/orders
GET  /shops/:id/visits
```

---

### 21.9 Shop Visits

```txt
POST /shop-visits/start
POST /shop-visits/:id/end
POST /shop-visits/:id/no-order
GET  /shop-visits
GET  /shop-visits/:id
```

---

### 21.10 Orders

```txt
POST /orders
GET  /orders
GET  /orders/:id
PATCH /orders/:id/edit
PATCH /orders/:id/cancel
GET  /orders/:id/revisions
GET  /orders/:id/audit-logs
```

---

### 21.11 Fulfillment

```txt
PATCH /orders/:id/status
PATCH /orders/:id/pack
PATCH /orders/:id/dispatch
PATCH /orders/:id/partial-dispatch
PATCH /orders/:id/deliver
PATCH /orders/:id/partial-deliver
```

---

### 21.12 Working Day & Location

```txt
POST /working-day/check-in
POST /working-day/check-out
POST /locations
POST /locations/batch
GET  /salesmen/:id/live-location
GET  /salesmen/:id/location-history
GET  /distributors/:id/salesmen/live-locations
GET  /manufacturers/:id/salesmen/live-locations
```

---

### 21.13 Offline Sync

```txt
POST /sync
GET  /sync/status
POST /sync/retry
```

---

### 21.14 Notifications

```txt
GET   /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all
```

---

### 21.15 Analytics

```txt
GET /analytics/manufacturer/:id/overview
GET /analytics/manufacturer/:id/sales
GET /analytics/manufacturer/:id/distributors
GET /analytics/manufacturer/:id/salesmen
GET /analytics/manufacturer/:id/products
GET /analytics/manufacturer/:id/shops
GET /analytics/manufacturer/:id/visits
GET /analytics/manufacturer/:id/inventory
GET /analytics/manufacturer/:id/delivery

GET /analytics/distributor/:id/overview
GET /analytics/distributor/:id/orders
GET /analytics/distributor/:id/salesmen
GET /analytics/distributor/:id/inventory
GET /analytics/distributor/:id/delivery

GET /analytics/salesman/:id/overview
GET /analytics/salesman/:id/visits
GET /analytics/salesman/:id/orders
```

---

## 22. Data Security & Access Control

Every request must be scoped by role and ownership.

Examples:

- Manufacturer can view only data linked to that manufacturer.
- Distributor can view only their own salesmen and orders.
- Salesman can view only their own orders, visits, and assigned/available shop information.
- Distributor can update only orders assigned to them.
- Manufacturer cannot update delivery status.
- Salesman cannot update delivery status.

Use:

```txt
JWT authentication
Refresh tokens
Role-based access control
Permission guards
Entity ownership validation
Audit logs
```

---

## 23. Important Backend Design Principles

### 23.1 Never Delete Important Business Data

Use soft delete for:

- Users
- Products
- Shops
- Distributors
- Salesmen

Orders, inventory movements, and audit logs should generally never be deleted.

---

### 23.2 Keep Historical Records

The system should preserve history for:

- Order edits
- Inventory movements
- Shop visits
- Location logs
- Status changes
- Distributor approvals
- Product changes

---

### 23.3 Avoid Overwriting Critical Data

Do not overwrite important records without logging old and new values.

Especially:

- Order quantity
- Product price
- Inventory quantity
- Delivery status
- Shop location
- Distributor relationship

---

### 23.4 Use Background Jobs

Use queue workers for:

- Sending notifications
- Processing offline sync
- Aggregating analytics
- Recalculating dashboards
- Cleaning old location logs if retention policy exists
- Detecting low inventory

---

### 23.5 Use Materialized Analytics

Do not calculate all analytics live from raw tables every time.

Use:

- Aggregated summary tables
- Materialized views
- Background analytics jobs
- Cached dashboard results

---

## 24. Suggested Database Areas

This is not a full schema, but the backend will likely need these table groups:

```txt
users
roles
permissions
manufacturers
distributors
manufacturer_distributors
salesmen
products
distributor_inventory
inventory_movements
shops
shop_duplicate_logs
shop_visits
working_days
orders
order_items
order_revisions
order_status_history
backorders
fulfillment_logs
location_logs
latest_locations
notifications
offline_sync_batches
offline_sync_items
audit_logs
analytics_snapshots
```

---

## 25. Recommended MVP Scope

### Phase 1: Core Platform

Build:

- Authentication
- Roles and permissions
- Manufacturer management
- Distributor invitation and approval
- Salesman management
- Product catalog
- Distributor inventory
- Shop creation
- Duplicate shop detection
- Shop visit management
- Order creation
- Backorder logic
- Distributor fulfillment
- Order editing with logs
- Location check-in/check-out
- Basic offline sync
- Distributor notifications
- Basic dashboards
- Audit logs

---

### Phase 2: Advanced Analytics

Add:

- Manufacturer deep analytics
- Distributor performance analytics
- Salesman productivity analytics
- Visit conversion reports
- No-order reason analytics
- Inventory health reports
- Delivery SLA reports
- Location route analytics
- Export reports

---

### Phase 3: Optimization & Scale

Add:

- Advanced duplicate detection
- Geofencing
- Route replay
- Predictive low-stock alerts
- Advanced offline conflict resolution
- Data warehouse / ClickHouse if volume grows
- More notification channels

---

## 26. Open Future Enhancements Not Needed Now

These are not required in v1, but the backend should not block them later:

- Sales targets
- Payment collection
- Returns and damaged goods
- Credit limits
- Distributor invoices
- Scheme/discount management
- Route planning
- Lead/prospect shop management
- WhatsApp/SMS notifications
- Distributor mobile app
- Retailer app

---

## 27. Final Recommended Product Flow

```txt
Manufacturer creates products
        ↓
Manufacturer invites distributor
        ↓
Distributor signs up
        ↓
Manufacturer approves distributor
        ↓
Distributor adds inventory for that manufacturer's products
        ↓
Manufacturer or distributor adds salesman
        ↓
Salesman checks in for working day
        ↓
Location tracking starts
        ↓
Salesman visits shop
        ↓
Salesman starts shop visit
        ↓
If shop is new, salesman creates shop
        ↓
System checks duplicates
        ↓
Shop becomes active
        ↓
Salesman places order or marks No Order
        ↓
If order placed, system checks inventory
        ↓
Available stock is reserved
        ↓
Unavailable quantity becomes backorder
        ↓
Distributor receives notification
        ↓
Distributor processes order
        ↓
Distributor dispatches order
        ↓
Inventory reduces on dispatch
        ↓
Distributor marks delivered
        ↓
Analytics update
        ↓
All actions are logged
```

---

## 28. Final Backend Philosophy

The backend should be designed around five principles:

```txt
1. Every action must be traceable.
2. Every business record must preserve history.
3. Offline data must sync safely without duplication.
4. Inventory must remain consistent even when orders change.
5. Analytics should be built into the system from day one.
```

This will make the system reliable, scalable, and useful for real field sales operations.
