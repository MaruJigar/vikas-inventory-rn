# Field Sales, Distributor Inventory, Order Fulfillment & Analytics Backend Architecture

## 1. Purpose of the System

This backend supports a complete field sales operating system for manufacturers, distributors, salesmen, and admins.

The platform is not only an order management system. It manages the full field-sales lifecycle:

- Manufacturer management
- Distributor self-signup and approval
- Salesman self-signup and approval
- Product catalogue management
- Manufacturer-created products
- Distributor-created products
- Distributor-wise inventory management
- Distributor-owned shop/retailer management
- Shop visit tracking
- Sales order creation
- Backorder handling
- Salesman-to-shop billing
- Manufacturer-to-distributor billing
- Order editing with complete revision logs
- Delivery and fulfillment tracking
- Working-hours-based live location tracking
- Offline-first mobile sync
- Distributor notifications
- Firebase push notifications
- Socket.IO live updates
- Manufacturer, distributor, salesman, and admin analytics
- Full audit logging
- Admin panel backend support

The final goal is to keep a complete record of:

- Which manufacturer owns which products
- Which distributor is selling which products
- Which products were created by manufacturers
- Which products were created by distributors
- Which manufacturer details are attached to distributor-created products
- Which distributor is selling for which manufacturer
- Which salesman is selling under which distributor
- Which shops belong to which distributor
- Which shops are being visited
- Which shops are ordering
- Which products are selling
- Which discounts were applied
- Which orders were backordered
- Which distributors are fulfilling properly
- Which salesmen are productive
- Which locations/regions are performing
- Where delays, backorders, edits, and fulfillment issues are happening

---

## 2. Final Technology Stack

### Backend

Recommended backend stack:

```txt
NestJS
TypeScript
PostgreSQL
PostGIS
Socket.IO / WebSockets
Firebase Cloud Messaging
Cron Jobs
Database-backed Job Processing
File/Object Storage
```

### Database

```txt
PostgreSQL + PostGIS
```

PostgreSQL is the main source of truth for:

- Users
- Roles
- Manufacturers
- Distributors
- Salesmen
- Approvals
- Products
- Pricing
- Inventory
- Shops
- Visits
- Orders
- Fulfillment
- Location logs
- Notifications
- Offline sync
- Analytics snapshots
- Audit logs
- Background jobs

PostGIS is used for:

- Shop location
- Salesman location logs
- Visit location validation
- Distance calculations
- Nearby shop search
- Route history

### Real-Time Updates

```txt
Socket.IO / WebSockets
```

Used for:

- Live salesman location updates
- Live distributor order notifications
- Live order status updates
- Live admin dashboard updates
- Live manufacturer dashboard updates
- Live inventory alerts
- Live sync status updates

### Push Notifications

```txt
Firebase Cloud Messaging
```

Used for mobile push notifications such as:

- New order received
- Order edited
- Order cancelled
- Backorder created
- Low inventory alert
- Distributor approved/rejected
- Salesman approved/rejected
- Offline sync completed with issues
- New shop created

### Removed From Architecture

The following should not be used in the current deployment:

```txt
Redis
BullMQ
RabbitMQ
Redis cache layer
Redis socket adapter
Redis-based queue processing
```

Reason:

- Deployment is on a single VPS.
- RAM is limited.
- PostgreSQL can be used as the durable source of truth.
- Socket.IO can work directly on one backend instance.
- Background jobs can be handled using cron jobs and database-backed job tables.

---

## 3. Recommended High-Level Architecture

```txt
Mobile App
React Native + WatermelonDB
        |
        | REST APIs
        v
NestJS Backend API Server
        |
        |----------------------------|
        |                            |
PostgreSQL + PostGIS          Socket.IO Server
        |                            |
        |                            v
        |                    Live Updates
        |
        |----------------------------|
        |
Cron Jobs / Background Workers
        |
        |----------------------------|
        |                            |
Analytics Jobs          Notification Jobs
        |                            |
        v                            v
Analytics Snapshots      Firebase Cloud Messaging
                                      |
                                      v
                              Push Notifications

Admin Panel
Next.js + shadcn/ui
        |
        | REST APIs + Socket.IO
        v
NestJS Backend API Server
```

---

## 4. Main User Roles

### 4.1 Super Admin

Super Admin is a global platform-level admin.

Can:

- Access all platform data
- Manage all manufacturers
- Manage all distributors
- Manage all salesmen
- Manage all products
- Manage all shops
- Manage all orders
- Manage all inventory
- Manage all visits
- Manage all approvals
- View all analytics
- View all audit logs
- Suspend or deactivate users
- Resolve support issues

All Super Admin actions must be audit logged.

---

### 4.2 Manufacturer Admin

Manufacturer Admin represents a manufacturer.

Can:

- Manage manufacturer profile
- Create manufacturer products
- Edit manufacturer-created products
- Set MRP, GST, distributor discount, and special discount for manufacturer products
- View distributors linked to the manufacturer
- Approve/reject distributor requests
- Approve/reject salesman requests linked to the manufacturer ecosystem
- View distributor-created products associated with linked distributors
- View salesmen
- View shops under linked distributors
- View orders
- View visits
- View inventory visibility across linked distributors
- View fulfillment and delivery performance
- View analytics
- View live locations during working hours

Cannot:

- Fulfill orders directly
- Mark orders delivered
- Directly change distributor stock unless future permission is added
- Edit distributor-created products unless allowed by admin policy later

---

### 4.3 Distributor Admin

Distributor handles inventory and fulfillment.

Can:

- Self-sign up
- Login while pending approval
- View catalogues while pending approval
- Complete profile while pending approval
- After approval, manage distributor profile
- Add distributor-created products
- Edit distributor-created products
- Add manufacturer information for distributor-created products
- Manage own inventory
- View assigned salesmen
- View distributor-owned shops
- Receive operational notifications
- Fulfill orders
- Update order delivery statuses
- Mark orders as delivered
- View own analytics
- View live location of own approved checked-in salesmen

Cannot:

- Approve distributors
- Approve salesmen
- Edit manufacturer-created product MRP or product details
- View other distributors' distributor-created products
- View other distributors' shops

---

### 4.4 Salesman

Salesman works under one distributor only.

Can:

- Self-sign up
- Login while pending approval
- View catalogues while pending approval
- Complete profile while pending approval
- After approval, check in for the working day
- Start location tracking during working hours
- View products available under their distributor
- Sell all products available under their distributor
- Visit shops belonging to their distributor
- Register new shops under their distributor
- Place orders
- Give item-level discounts
- Give bill-level discounts
- Edit or cancel orders at any point
- Mark visit as productive or non-productive
- Add no-order reason
- Work offline
- Sync data later

Cannot:

- Belong to multiple distributors
- See inventory quantities
- Manage inventory
- Create manufacturer products
- Fulfill orders
- Mark orders delivered
- Approve distributors
- Approve salesmen

Important rule:

```txt
A salesman cannot see inventory quantity because backorders are allowed for every product.
```

---

## 5. Approval System

### 5.1 Distributor Signup Flow

```txt
Distributor signs up
        ↓
Account status = Pending Approval
        ↓
Distributor can login
        ↓
Distributor can view catalogues only
        ↓
Admin / Manufacturer reviews request
        ↓
Approve or Reject
        ↓
If approved, full distributor functionality is enabled
```

### 5.2 Salesman Signup Flow

```txt
Salesman signs up
        ↓
Account status = Pending Approval
        ↓
Salesman can login
        ↓
Salesman can view catalogues only
        ↓
Admin / Manufacturer reviews request
        ↓
Approve or Reject
        ↓
If approved, full salesman functionality is enabled
```

### 5.3 Pending Approval Permissions

Pending distributors and pending salesmen can access only:

```txt
Login
View manufacturers
View catalogues
View products
Complete profile
Upload required documents if needed
```

Pending users cannot access:

```txt
Orders
Visits
Shop creation
Inventory
Fulfillment
Analytics
Location tracking
Team management
Operational notifications
Order editing
Check-in / check-out
```

### 5.4 Approval Authority

Can approve/reject distributors and salesmen:

```txt
Super Admin
Manufacturer Admin
```

Cannot approve/reject:

```txt
Distributor Admin
Salesman
```

### 5.5 Distributor Statuses

```txt
PENDING_APPROVAL
APPROVED
REJECTED
SUSPENDED
REVOKED
```

### 5.6 Salesman Statuses

```txt
PENDING_APPROVAL
APPROVED
REJECTED
SUSPENDED
DEACTIVATED
```

---

## 6. Product Catalogue Rules

### 6.1 Product Creators

Products can be created by:

```txt
Manufacturer
Distributor
```

### 6.2 Product Source Types

```txt
MANUFACTURER_CREATED
DISTRIBUTOR_CREATED
```

---

### 6.3 Manufacturer-Created Products

Manufacturer-created product rules:

- Created by Manufacturer Admin or Super Admin
- Owned by manufacturer account
- Visible to approved distributors linked to that manufacturer
- Visible to salesmen under those approved distributors
- Visible to Super Admin
- Distributor cannot edit MRP or product details
- Distributor can only manage inventory for that product

Manufacturer controls:

```txt
Product name
SKU
Category
Unit
MRP
GST %
Distributor discount %
Special discount %
Product image
Product active/inactive status
```

---

### 6.4 Distributor-Created Products

Distributor-created product rules:

- Created by Distributor Admin
- Belongs only to that distributor
- Visible only to that distributor
- Visible only to salesmen under that distributor
- Visible to linked manufacturer for records and visibility
- Visible to Super Admin
- Not visible to other distributors
- Not visible to salesmen of other distributors
- Distributor can edit MRP and product details only for products created by that distributor

Distributor-created products must store manufacturer details for record keeping.

Required manufacturer details:

```txt
Manufacturer Name
Manufacturer Address
```

Recommended manufacturer details:

```txt
Manufacturer Contact Person
Manufacturer Phone
Manufacturer Email
Manufacturer GST / Tax Number
Manufacturer Notes
```

---

### 6.5 Salesman Product Visibility

Salesman can sell all products available under their distributor.

This includes:

```txt
Manufacturer-created products available to the distributor
Distributor-created products created by their distributor
```

Salesman product cards should show:

```txt
Product Image
Product Name
MRP
Manufacturer Name
Category
Unit
```

Salesman product cards must not show:

```txt
Available Stock
Reserved Stock
Backordered Quantity
Inventory Levels
```

---

## 7. Pricing and Billing Rules

The platform has two separate pricing layers:

```txt
1. Manufacturer → Distributor Billing
2. Salesman → Shop Billing
```

---

### 7.1 Manufacturer to Distributor Billing

This is used when a manufacturer sells products to a distributor.

Formula:

```txt
MRP
- Distributor Discount
- Special Discount
+ GST
= Distributor Purchase Price
```

Example without special discount:

```txt
MRP = ₹100
Distributor Discount = 50%
GST = 18%

100 - 50 + 18 = ₹68
```

Example with special discount:

```txt
MRP = ₹100
Distributor Discount = 50%
Special Discount = 5%
GST = 18%

100 - 50 - 5 + 18 = ₹63
```

Important implementation note:

For now, GST is calculated using the percentage on the MRP-based amount as described above. The system should store each amount separately so the tax calculation can be adjusted later if accounting rules change.

Required stored values:

```txt
mrp
distributor_discount_percent
distributor_discount_amount
special_discount_percent
special_discount_amount
gst_percent
gst_amount
final_distributor_purchase_price
```

---

### 7.2 Salesman to Shop Billing

This is used when a salesman sells to a shop.

Rules:

```txt
MRP is the shop selling price.
MRP is inclusive of taxes.
GST is not added separately in salesman-to-shop billing.
```

Salesman can apply discounts in two ways:

```txt
1. Product-level discount
2. Final bill-level discount
```

Discount type can be:

```txt
PERCENTAGE
AMOUNT
```

Item-level discount example:

```txt
Product MRP = ₹100
Quantity = 2
Gross line amount = ₹200
Item discount = 10%
Discount amount = ₹20
Net line amount = ₹180
```

Bill-level discount example:

```txt
Gross order amount = ₹1,000
Bill discount = ₹100
Final order amount = ₹900
```

Required stored order item values:

```txt
mrp
quantity
gross_line_amount
item_discount_type
item_discount_value
item_discount_amount
net_line_amount
```

Required stored order values:

```txt
gross_order_amount
bill_discount_type
bill_discount_value
bill_discount_amount
final_order_amount
```

---

## 8. Inventory Management

### 8.1 Inventory Ownership

Inventory is maintained at distributor + product level.

There is no warehouse, godown, or inventory location tracking.

```txt
Distributor + Product = Inventory Record
```

### 8.2 Inventory States

Recommended inventory values:

```txt
Available Quantity
Reserved Quantity
Backordered Quantity
Dispatched Quantity
```

### 8.3 Backorder Handling

Backorders are allowed by default for every product.

Example:

```txt
Available stock: 30
Order quantity: 50

30 units reserved
20 units backordered
```

The order should not fail because of insufficient stock.

### 8.4 Salesman Inventory Visibility

Salesmen cannot see inventory quantities.

Reason:

- Backorders are allowed
- Salesman should focus on selling
- Inventory is distributor operational data
- It avoids unnecessary field-level confusion

### 8.5 Inventory Reduction Rule

```txt
Inventory is reserved on order creation.
Inventory is reduced on dispatch.
```

### 8.6 Inventory Adjustments

Distributor can adjust inventory manually for:

- New stock received
- Manual correction
- Stock count correction
- Lost stock
- Opening stock entry

Every adjustment must create an inventory movement log and an audit log.

---

## 9. Shop Management

### 9.1 Shop Ownership Model

Shops are distributor-owned.

If a salesman under Distributor A creates a shop, that shop belongs to Distributor A.

Visibility:

```txt
Visible to Distributor A
Visible to all salesmen under Distributor A
Visible to linked manufacturer for analytics/records
Visible to Super Admin
```

Not visible to:

```txt
Other distributors
Salesmen under other distributors
```

### 9.2 Shop Creation

Shops can be created by:

```txt
Distributor
Salesman
Admin
```

If created by salesman, the shop is assigned to that salesman's distributor.

New shop becomes active immediately.

### 9.3 Mandatory Shop Verification Image

Every new shop must have a verification image.

Recommended label:

```txt
Visiting Card / Shop Verification Photo
```

Accepted proof examples:

```txt
Visiting card
Shop front photo
GST certificate
Business proof
```

Helper text:

```txt
Upload a visiting card or clear photo of the shop for verification purposes.
```

### 9.4 Image Compression Rule

All images uploaded to the backend must be compressed before storage.

This applies to:

- Shop verification photos
- Visiting card images
- Product images
- Distributor documents
- Salesman documents
- Any future uploaded image

Recommended backend image processing:

```txt
Validate file type
Validate file size
Compress image
Generate optimized web/mobile version
Generate thumbnail
Store original only if required by business policy
Store compressed URL in database
Store metadata in database
```

Recommended image metadata:

```txt
original_file_name
mime_type
original_size_bytes
compressed_size_bytes
width
height
storage_path
thumbnail_path
uploaded_by_user_id
uploaded_at
```

### 9.5 Duplicate Detection

Duplicate checking should use:

```txt
Phone number match
Location proximity match
Fuzzy shop name match
```

Duplicate detection should warn, not always block.

If bypassed, log:

```txt
duplicate warning shown
duplicate warning ignored
user who ignored
reason if provided
created shop id
possible duplicate shop ids
```

---

## 10. Shop Visit Management

### 10.1 Visit Flow

```txt
Salesman checks in
        ↓
Location tracking starts
        ↓
Salesman selects shop
        ↓
Salesman starts visit
        ↓
Start location captured
        ↓
Salesman creates order OR marks No Order
        ↓
End location captured
        ↓
Visit ends
```

### 10.2 Visit Rules

- Visit cannot end without an order or no-order reason.
- No-order reason is mandatory if no order is placed.
- Location is captured at visit start and visit end.
- Visit can be created offline.
- Visit sync must be idempotent.

### 10.3 Visit Types

```txt
PRODUCTIVE
NON_PRODUCTIVE
```

Productive visit means an order was placed.

Non-productive visit means no order was placed and a reason was selected.

---

## 11. Order Management

### 11.1 Order Creation Flow

```txt
Salesman checks in
        ↓
Salesman starts shop visit
        ↓
Salesman selects products
        ↓
Salesman enters quantities
        ↓
Salesman applies item-level discounts if needed
        ↓
Salesman applies bill-level discount if needed
        ↓
Order is submitted
        ↓
Backend checks distributor inventory
        ↓
Available quantity is reserved
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
```

### 11.2 Order Statuses

```txt
CREATED
CONFIRMED
PARTIALLY_CONFIRMED
BACKORDERED
PROCESSING
PACKED
PARTIALLY_DISPATCHED
DISPATCHED
PARTIALLY_DELIVERED
DELIVERED
CANCELLED
EDITED_REVISED
```

### 11.3 Order Item Statuses

```txt
ORDERED
RESERVED
BACKORDERED
PACKED
DISPATCHED
DELIVERED
CANCELLED
EDITED
```

### 11.4 Order Editing

Salesman can edit or cancel an order at any point.

Every edit must create a full revision log.

Required edit log data:

```txt
Order ID
Old order data
New order data
Changed fields
Old item quantities
New item quantities
Added products
Removed products
Edited products
Old pricing values
New pricing values
User who changed it
Role of user
Timestamp
Order status at time of edit
Reason for change if required
Inventory impact
Whether distributor was notified
```

### 11.5 Before Dispatch Edit Rule

If edited before dispatch:

- Reserved stock can be adjusted automatically.
- Backorder quantity can be recalculated.
- Distributor receives update notification.

### 11.6 After Dispatch / Delivery Edit Rule

If edited after dispatch or delivery:

- Do not automatically reverse inventory.
- Store changed order data.
- Store full edit logs.
- Notify distributor.
- Flag order as exception.

Recommended flags:

```txt
post_dispatch_edited = true
post_delivery_edited = true
```

---

## 12. Fulfillment Management

Distributor owns fulfillment.

Distributor can mark:

```txt
Processing
Packed
Partially Dispatched
Dispatched
Partially Delivered
Delivered
Cancelled
```

Inventory is reduced when distributor marks items/order as dispatched.

Salesman cannot mark orders delivered.

Manufacturer cannot mark orders delivered.

---

## 13. Working Day and Location Tracking

### 13.1 Working Day Flow

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

### 13.2 Location Capture Events

Capture location:

- On check-in
- Periodically during working hours
- On shop visit start
- On shop visit end
- On order creation
- On order edit
- On check-out

### 13.3 Location Frequency

Recommended:

```txt
Every 2-5 minutes during working hours
```

Exact interval should be configurable.

### 13.4 Location Storage

Use two tables:

```txt
location_logs
latest_locations
```

`location_logs` stores full history.

`latest_locations` stores only the latest known position for quick live tracking.

Socket.IO broadcasts latest location updates to authorized distributor, manufacturer, and admin dashboards.

---

## 14. Offline-First Sync

Offline support is required for salesmen.

Mobile app uses:

```txt
WatermelonDB
```

Backend source of truth:

```txt
PostgreSQL
```

### 14.1 Offline-Capable Data

The mobile app should support offline creation of:

- Shops
- Shop visits
- Orders
- Order edits
- No-order reasons
- Location logs
- Check-in/check-out events

### 14.2 Offline Record Fields

Each offline-created record should include:

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

### 14.3 Sync Statuses

```txt
PENDING
SYNCED
FAILED
CONFLICT
```

### 14.4 Idempotency

Every offline object must have an idempotency key.

Example:

```txt
idempotency_key = device_id + local_id + entity_type
```

This prevents duplicate orders, shops, visits, and location logs.

### 14.5 Sync Conflicts

Possible conflicts:

- Duplicate shop found
- Product no longer active
- Distributor approval revoked
- Salesman disabled
- Order edited from another device
- Inventory changed before sync

Because backorders are allowed, insufficient inventory should not fail order sync. It should create backorder quantity.

---

## 15. Notifications

### 15.1 Notification Storage

Every important notification should be stored in PostgreSQL.

Socket.IO sends live in-app updates.

Firebase Cloud Messaging sends mobile push notifications.

### 15.2 Distributor Notification Events

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
Salesman checked in
Salesman checked out
```

### 15.3 Approval Notifications

```txt
Distributor signup pending approval
Distributor approved
Distributor rejected
Salesman signup pending approval
Salesman approved
Salesman rejected
```

---

## 16. Admin Panel Backend Support

The admin panel is a web panel built with:

```txt
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
```

Admin panel users can access all functionality based on role and permissions.

### 16.1 Admin Panel Modules

```txt
Dashboard
Manufacturers
Distributors
Salesmen
Approvals
Products
Product Pricing
Inventory
Shops
Shop Verification
Visits
Orders
Fulfillment
Backorders
Notifications
Location Tracking
Offline Sync Logs
Background Jobs
Analytics
Audit Logs
System Settings
```

All admin actions must be audit logged.

---

## 17. Background Jobs Without Redis

Since Redis and BullMQ are removed, background work should use database-backed jobs.

Recommended tables:

```txt
background_jobs
background_job_attempts
scheduled_tasks
```

Used for:

- Notification retry
- Analytics aggregation
- Offline sync processing
- Low stock checks
- Dashboard refresh
- Location cleanup if retention policy exists
- Image compression processing if async

Recommended job statuses:

```txt
PENDING
PROCESSING
COMPLETED
FAILED
RETRYING
CANCELLED
```

---

## 18. Audit Logs

Audit logs are mandatory.

Log all important actions:

- Login
- Logout
- Signup
- Approval submitted
- Approval approved/rejected
- Check-in
- Check-out
- Location tracking started/stopped
- Manufacturer created/updated
- Distributor created/updated
- Salesman created/updated/deactivated
- Product created/updated/deactivated
- Product price changed
- Inventory adjusted
- Shop created/updated
- Shop verification image uploaded
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
- Image uploaded/compressed

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

## 19. Database Design Overview

### 19.1 Core Table Groups

```txt
users
roles
permissions
role_permissions
user_sessions
manufacturers
distributors
salesmen
approval_requests
approval_logs
manufacturer_distributors
manufacturer_salesmen
products
product_categories
product_pricing
distributor_inventory
inventory_movements
shops
shop_images
shop_duplicate_logs
shop_visits
working_days
orders
order_items
order_revisions
order_status_history
fulfillment_logs
backorders
location_logs
latest_locations
notifications
notification_delivery_logs
offline_sync_batches
offline_sync_items
background_jobs
background_job_attempts
analytics_snapshots
audit_logs
uploaded_files
```

---

### 19.2 Key Database Principles

Use UUID primary keys:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

Use timestamps on all main tables:

```sql
created_at TIMESTAMP DEFAULT now()
updated_at TIMESTAMP DEFAULT now()
deleted_at TIMESTAMP NULL
```

Use soft delete for:

```txt
users
manufacturers
distributors
salesmen
products
shops
```

Never hard delete:

```txt
orders
order_items
order_revisions
inventory_movements
audit_logs
location_logs
approval_logs
fulfillment_logs
```

Use PostGIS geography type for locations:

```sql
location GEOGRAPHY(Point, 4326)
```

---

## 20. Important Database Tables

### 20.1 users

Purpose: stores login and identity data for all user types.

Important fields:

```txt
id
full_name
email
phone
password_hash
role
account_status
approval_status
is_active
last_login_at
created_at
updated_at
deleted_at
```

Recommended statuses:

```txt
PENDING_APPROVAL
APPROVED
REJECTED
SUSPENDED
DEACTIVATED
```

---

### 20.2 distributors

Purpose: stores distributor business profile.

Important fields:

```txt
id
user_id
business_name
owner_name
phone
email
address
city
state
gst_number
approval_status
approved_at
approved_by_user_id
created_at
updated_at
deleted_at
```

---

### 20.3 salesmen

Purpose: stores salesman profile and distributor assignment.

Important fields:

```txt
id
user_id
distributor_id
full_name
phone
email
approval_status
approved_at
approved_by_user_id
created_at
updated_at
deleted_at
```

Important rule:

```txt
A salesman belongs to one distributor only.
```

---

### 20.4 products

Purpose: stores all manufacturer-created and distributor-created products.

Important fields:

```txt
id
product_source
owner_type
manufacturer_id
distributor_id
created_by_user_id
name
sku
category_id
unit
mrp
gst_percent
manufacturer_name
manufacturer_contact_person
manufacturer_phone
manufacturer_email
manufacturer_address
manufacturer_gst_number
description
image_file_id
is_active
created_at
updated_at
deleted_at
```

Recommended product_source values:

```txt
MANUFACTURER_CREATED
DISTRIBUTOR_CREATED
```

Recommended owner_type values:

```txt
MANUFACTURER
DISTRIBUTOR
```

Rules:

```txt
manufacturer_id required for MANUFACTURER_CREATED products.
distributor_id required for DISTRIBUTOR_CREATED products.
manufacturer_name and manufacturer_address required for DISTRIBUTOR_CREATED products.
```

---

### 20.5 product_pricing

Purpose: stores distributor purchase price calculation values.

Important fields:

```txt
id
product_id
mrp
distributor_discount_percent
distributor_discount_amount
special_discount_percent
special_discount_amount
gst_percent
gst_amount
final_distributor_purchase_price
effective_from
effective_to
is_active
created_by_user_id
created_at
updated_at
```

---

### 20.6 distributor_inventory

Purpose: stores distributor stock for each product.

Important fields:

```txt
id
distributor_id
product_id
available_quantity
reserved_quantity
backordered_quantity
dispatched_quantity
low_stock_threshold
created_at
updated_at
```

Unique constraint:

```txt
UNIQUE(distributor_id, product_id)
```

---

### 20.7 shops

Purpose: stores distributor-owned shops.

Important fields:

```txt
id
distributor_id
created_by_user_id
created_by_salesman_id
shop_name
owner_name
phone
address
city
state
gst_number
location
verification_status
primary_image_file_id
last_visit_at
last_order_at
created_at
updated_at
deleted_at
```

Important rule:

```txt
Shop must belong to a distributor.
Shop verification image is mandatory.
```

---

### 20.8 uploaded_files

Purpose: stores metadata for compressed uploaded files.

Important fields:

```txt
id
entity_type
entity_id
file_type
original_file_name
mime_type
original_size_bytes
compressed_size_bytes
width
height
storage_path
thumbnail_path
uploaded_by_user_id
created_at
```

Image compression should happen before final storage or before final file record is marked active.

---

### 20.9 orders

Purpose: stores shop orders.

Important fields:

```txt
id
order_number
distributor_id
salesman_id
shop_id
visit_id
status
gross_order_amount
bill_discount_type
bill_discount_value
bill_discount_amount
final_order_amount
total_quantity
total_backorder_quantity
is_offline_created
sync_batch_id
post_dispatch_edited
post_delivery_edited
created_at
updated_at
cancelled_at
```

---

### 20.10 order_items

Purpose: stores product-level order details and pricing snapshot.

Important fields:

```txt
id
order_id
product_id
product_name_snapshot
product_sku_snapshot
manufacturer_name_snapshot
quantity
mrp
gross_line_amount
item_discount_type
item_discount_value
item_discount_amount
net_line_amount
reserved_quantity
backordered_quantity
dispatched_quantity
delivered_quantity
status
created_at
updated_at
```

---

### 20.11 order_revisions

Purpose: stores full order edit history.

Important fields:

```txt
id
order_id
revision_number
changed_by_user_id
changed_by_role
old_data
new_data
changed_fields
reason
order_status_at_time
inventory_impact
notified_distributor
created_at
```

---

### 20.12 working_days

Purpose: stores salesman check-in/check-out sessions.

Important fields:

```txt
id
salesman_id
distributor_id
check_in_at
check_out_at
check_in_location
check_out_location
status
created_at
updated_at
```

---

### 20.13 location_logs

Purpose: stores historical location points.

Important fields:

```txt
id
salesman_id
distributor_id
working_day_id
event_type
location
accuracy
battery_level
captured_at
source
created_at
```

---

### 20.14 latest_locations

Purpose: stores latest location for quick live tracking.

Important fields:

```txt
salesman_id
distributor_id
working_day_id
location
accuracy
last_updated_at
is_tracking_active
```

---

### 20.15 notifications

Purpose: stores in-app notification records.

Important fields:

```txt
id
recipient_user_id
recipient_role
notification_type
title
message
entity_type
entity_id
priority
is_read
read_at
created_at
```

---

### 20.16 background_jobs

Purpose: replaces Redis/BullMQ job queue.

Important fields:

```txt
id
job_type
payload
status
attempt_count
max_attempts
scheduled_at
started_at
completed_at
failed_at
last_error
created_at
updated_at
```

---

### 20.17 audit_logs

Purpose: stores complete system traceability.

Important fields:

```txt
id
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
location
created_at
```

---

## 21. API Module Structure

Recommended backend modules:

```txt
Auth Module
User Module
Role & Permission Module
Approval Module
Manufacturer Module
Distributor Module
Salesman Module
Product Module
Product Pricing Module
Inventory Module
Shop Module
Shop Image / Upload Module
Shop Duplicate Detection Module
Shop Visit Module
Order Module
Order Revision Module
Billing Module
Backorder Module
Fulfillment Module
Location Module
Working Day Module
Offline Sync Module
Notification Module
Socket Gateway Module
Firebase Notification Module
Analytics Module
Background Job Module
Audit Log Module
Admin Panel API Module
```

---

## 22. Suggested API Endpoints

### 22.1 Authentication

```txt
POST /auth/login
POST /auth/register/distributor
POST /auth/register/salesman
POST /auth/refresh-token
POST /auth/logout
GET  /auth/me
```

### 22.2 Approvals

```txt
GET   /approvals
GET   /approvals/distributors
GET   /approvals/salesmen
GET   /approvals/:id
PATCH /approvals/:id/approve
PATCH /approvals/:id/reject
PATCH /approvals/:id/suspend
PATCH /approvals/:id/revoke
```

### 22.3 Products

```txt
POST /products
GET  /products
GET  /products/:id
PATCH /products/:id
PATCH /products/:id/activate
PATCH /products/:id/deactivate
GET  /catalogues
GET  /catalogues/:manufacturerId/products
```

### 22.4 Product Pricing

```txt
POST /products/:id/pricing
GET  /products/:id/pricing
PATCH /product-pricing/:id
```

### 22.5 Inventory

```txt
GET  /distributors/:distributorId/inventory
POST /inventory/adjust
GET  /inventory/movements
GET  /inventory/low-stock
```

### 22.6 Shops

```txt
POST /shops/check-duplicates
POST /shops
GET  /shops
GET  /shops/:id
PATCH /shops/:id
POST /shops/:id/images
GET  /shops/:id/history
GET  /shops/:id/orders
GET  /shops/:id/visits
```

### 22.7 Shop Visits

```txt
POST /shop-visits/start
POST /shop-visits/:id/end
POST /shop-visits/:id/no-order
GET  /shop-visits
GET  /shop-visits/:id
```

### 22.8 Orders

```txt
POST /orders
GET  /orders
GET  /orders/:id
PATCH /orders/:id/edit
PATCH /orders/:id/cancel
GET  /orders/:id/revisions
GET  /orders/:id/audit-logs
```

### 22.9 Fulfillment

```txt
PATCH /orders/:id/status
PATCH /orders/:id/pack
PATCH /orders/:id/dispatch
PATCH /orders/:id/partial-dispatch
PATCH /orders/:id/deliver
PATCH /orders/:id/partial-deliver
```

### 22.10 Working Day and Location

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

### 22.11 Offline Sync

```txt
POST /sync
GET  /sync/status
POST /sync/retry
```

### 22.12 Notifications

```txt
GET   /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all
POST  /notifications/register-fcm-token
```

### 22.13 Analytics

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

### 22.14 Admin Panel APIs

```txt
GET /admin/dashboard
GET /admin/users
GET /admin/manufacturers
GET /admin/distributors
GET /admin/salesmen
GET /admin/products
GET /admin/orders
GET /admin/shops
GET /admin/visits
GET /admin/inventory
GET /admin/approvals
GET /admin/audit-logs
GET /admin/background-jobs
GET /admin/offline-sync-logs
```

---

## 23. Socket.IO Events

### 23.1 Client to Server

```txt
location:update
order:subscribe
order:unsubscribe
notification:acknowledge
dashboard:subscribe
```

### 23.2 Server to Client

```txt
location:updated
order:created
order:edited
order:status_changed
order:cancelled
backorder:created
inventory:low_stock
notification:new
approval:status_changed
sync:status_updated
dashboard:metrics_updated
```

### 23.3 Authorization

Every socket connection must be authenticated with JWT.

Every socket room must be scoped by role and ownership.

Examples:

```txt
distributor:{distributorId}
manufacturer:{manufacturerId}
salesman:{salesmanId}
admin:global
order:{orderId}
```

---

## 24. Data Security and Access Control

Every request must be scoped by:

```txt
Role
Approval status
Ownership
Distributor relationship
Manufacturer relationship
```

Examples:

- Pending users can only access catalogues.
- Manufacturer can view linked distributors and their relevant data.
- Distributor can view only own salesmen, shops, inventory, and orders.
- Salesman can view only distributor-owned shops and their own orders/visits.
- Distributor-created products are limited to that distributor and its salesmen.
- Manufacturer-created product details cannot be edited by distributor.
- Salesman cannot see inventory quantities.
- Distributor can update only orders assigned to them.
- Salesman cannot update delivery status.
- Manufacturer cannot update delivery status.
- Admin can access all data.

Use:

```txt
JWT authentication
Refresh tokens
Role-based guards
Permission guards
Approval-status guards
Entity ownership validation
Audit logs
```

---

## 25. MVP Scope

### Phase 1: Core Platform

Build:

- Authentication
- Distributor self-signup
- Salesman self-signup
- Pending approval flow
- Catalogue-only access for pending users
- Roles and permissions
- Manufacturer management
- Distributor approval
- Salesman approval
- Product catalogue
- Manufacturer-created products
- Distributor-created products
- Product pricing
- Distributor inventory
- Shop creation with mandatory compressed verification image
- Duplicate shop detection
- Shop visit management
- Order creation
- Salesman discount logic
- Backorder logic
- Distributor fulfillment
- Order editing with logs
- Location check-in/check-out
- Basic offline sync
- Socket.IO live updates
- Firebase push notifications
- Distributor notifications
- Basic dashboards
- Admin panel APIs
- Audit logs

### Phase 2: Advanced Analytics

Add:

- Manufacturer deep analytics
- Distributor performance analytics
- Salesman productivity analytics
- Visit conversion reports
- No-order reason analytics
- Inventory health reports
- Delivery SLA reports
- Product-source analytics
- Manufacturer-name analytics for distributor-created products
- Location route analytics
- Export reports

### Phase 3: Optimization and Scale

Add:

- Advanced duplicate detection
- Geofencing
- Route replay
- Predictive low-stock alerts
- Advanced offline conflict resolution
- Advanced image processing pipeline
- Multi-server socket scaling if needed later
- Redis only if scaling requires it later
- Data warehouse / ClickHouse if volume grows

---

## 26. Final Backend Philosophy

The backend should be designed around these principles:

```txt
1. Every action must be traceable.
2. Every business record must preserve history.
3. Pending users can only view catalogues until approved.
4. Products can be created by manufacturers and distributors.
5. Distributor-created products are limited to that distributor ecosystem.
6. Salesmen can sell all products under their distributor.
7. Salesmen cannot see inventory quantities.
8. Shops belong to distributors, not globally to all users.
9. Shop verification image is mandatory and must be compressed.
10. Offline data must sync safely without duplication.
11. Inventory must remain consistent even when orders change.
12. Backorders are allowed by default.
13. Socket.IO handles live updates on the single VPS.
14. Firebase handles push notifications.
15. PostgreSQL is the source of truth.
16. Analytics should be built into the system from day one.
```
