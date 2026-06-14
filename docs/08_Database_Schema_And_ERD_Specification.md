08_Database_Schema_And_ERD_Specification.md

Database Schema & ERD Specification

Version: 1.0
Status: Draft for Technical Review
Database: PostgreSQL + PostGIS
Cache: No Redis
Queue: Database-backed jobs
Realtime: Socket.IO
Push Notifications: Firebase Cloud Messaging

⸻

1. Database Philosophy

The database must be designed around:

Traceability
Auditability
Offline Sync Safety
Inventory Accuracy
Visit-Based Sales
Role-Based Access
Approval Control
Historical Records

Important rules:

Do not hard delete business records.
Use soft delete where needed.
Orders must preserve history.
Inventory movements must preserve history.
Order edits must preserve full revision history.
Every order must belong to a visit.
Every shop belongs to a distributor.
Every salesman belongs to one distributor.
Salesman cannot see inventory quantities.
Backorders are allowed.
Images must be compressed before upload.

⸻

2. Database Extensions

Recommended PostgreSQL extensions:

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

Purpose:

pgcrypto = UUID generation
postgis = location and distance queries
uuid-ossp = UUID support

⸻

3. Common Table Standards

Every main table should include:

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
deleted_at TIMESTAMP NULL

Use:

deleted_at = NULL means active record
deleted_at IS NOT NULL means soft deleted

⸻

4. Core Enum Values

User Roles

SUPER_ADMIN
MANUFACTURER_ADMIN
DISTRIBUTOR_ADMIN
SALESMAN

⸻

Approval Status

PENDING_APPROVAL
APPROVED
REJECTED
SUSPENDED
REVOKED
DEACTIVATED

⸻

Product Source

MANUFACTURER_CREATED
DISTRIBUTOR_CREATED

⸻

Order Status

CREATED
CONFIRMED
PROCESSING
PACKED
PARTIALLY_DISPATCHED
DISPATCHED
PARTIALLY_DELIVERED
DELIVERED
CANCELLED
BACKORDERED
EDITED

⸻

Visit Type

PRODUCTIVE
NON_PRODUCTIVE

⸻

Sync Status

PENDING
SYNCED
FAILED
CONFLICT

⸻

Discount Type

NONE
AMOUNT
PERCENTAGE

⸻

5. ERD High-Level Relationship Summary

users
  ├── manufacturers
  ├── distributors
  └── salesmen
manufacturer_distributors
  ├── manufacturer_id
  └── distributor_id
salesmen
  └── distributor_id
shops
  └── distributor_id
products
  ├── manufacturer_id nullable
  └── distributor_id nullable
distributor_inventory
  ├── distributor_id
  └── product_id
shop_visits
  ├── salesman_id
  ├── distributor_id
  └── shop_id
orders
  ├── visit_id
  ├── shop_id
  ├── salesman_id
  ├── distributor_id
  └── manufacturer_id nullable
order_items
  ├── order_id
  └── product_id

⸻

6. Identity & Access Tables

⸻

6.1 users

Purpose:

Stores all login users.

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(30) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

Notes:

Distributor and salesman self-signup creates user as PENDING_APPROVAL.
Pending users can only view catalogues and complete profile.

Indexes:

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_users_phone ON users(phone);

⸻

6.2 roles

Purpose:

Optional normalized role table.

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

6.3 permissions

Purpose:

Stores permission keys.

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

6.4 role_permissions

Purpose:

Maps roles to permissions.

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

⸻

7. Manufacturer Tables

⸻

7.1 manufacturers

Purpose:

Stores manufacturer company profiles.

CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  phone VARCHAR(30),
  email VARCHAR(150),
  gst_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

Indexes:

CREATE INDEX idx_manufacturers_user_id ON manufacturers(user_id);
CREATE INDEX idx_manufacturers_company_name ON manufacturers(company_name);

⸻

8. Distributor Tables

⸻

8.1 distributors

Purpose:

Stores distributor business profile.

CREATE TABLE distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  business_name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(150),
  phone VARCHAR(30),
  email VARCHAR(150),
  gst_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
  approved_by_user_id UUID REFERENCES users(id),
  approved_at TIMESTAMP NULL,
  rejected_reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

Notes:

Distributor can login while pending approval.
Pending distributor can view catalogues only.
Approved distributor can manage products, inventory, orders and team.

Indexes:

CREATE INDEX idx_distributors_user_id ON distributors(user_id);
CREATE INDEX idx_distributors_status ON distributors(approval_status);

⸻

8.2 manufacturer_distributors

Purpose:

Maps manufacturers and distributors.

CREATE TABLE manufacturer_distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
  approved_by_user_id UUID REFERENCES users(id),
  approved_at TIMESTAMP NULL,
  rejected_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  UNIQUE(manufacturer_id, distributor_id)
);

Notes:

A distributor can work with multiple manufacturers.
Each manufacturer-distributor relationship has its own approval status.

⸻

9. Salesman Tables

⸻

9.1 salesmen

Purpose:

Stores salesman profile.

CREATE TABLE salesmen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
  approved_by_user_id UUID REFERENCES users(id),
  approved_at TIMESTAMP NULL,
  rejected_reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

Important rule:

One salesman belongs to one distributor only.

Indexes:

CREATE INDEX idx_salesmen_user_id ON salesmen(user_id);
CREATE INDEX idx_salesmen_distributor_id ON salesmen(distributor_id);
CREATE INDEX idx_salesmen_status ON salesmen(approval_status);

⸻

10. Approval Tables

⸻

10.1 approval_requests

Purpose:

Generic approval request table.

CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type VARCHAR(50) NOT NULL,
  requester_user_id UUID REFERENCES users(id),
  manufacturer_id UUID REFERENCES manufacturers(id),
  distributor_id UUID REFERENCES distributors(id),
  salesman_id UUID REFERENCES salesmen(id),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_by_user_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP NULL,
  rejection_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Request types:

DISTRIBUTOR_APPROVAL
SALESMAN_APPROVAL
MANUFACTURER_DISTRIBUTOR_ACCESS

⸻

10.2 approval_logs

Purpose:

Stores approval history.

CREATE TABLE approval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID REFERENCES approval_requests(id),
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  acted_by_user_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

11. Product & Catalogue Tables

⸻

11.1 product_categories

Purpose:

Stores product categories.

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  parent_id UUID REFERENCES product_categories(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

⸻

11.2 products

Purpose:

Stores both manufacturer-created and distributor-created products.

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_source VARCHAR(50) NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id),
  distributor_id UUID REFERENCES distributors(id),
  category_id UUID REFERENCES product_categories(id),
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100),
  unit VARCHAR(50),
  description TEXT,
  product_image_url TEXT,
  mrp NUMERIC(12,2) NOT NULL,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  distributor_discount_percent NUMERIC(5,2) DEFAULT 0,
  special_discount_percent NUMERIC(5,2) DEFAULT 0,
  external_manufacturer_name VARCHAR(200),
  external_manufacturer_contact VARCHAR(150),
  external_manufacturer_phone VARCHAR(30),
  external_manufacturer_email VARCHAR(150),
  external_manufacturer_address TEXT,
  external_manufacturer_gst_number VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

Rules:

Manufacturer-created product:
- manufacturer_id required
- distributor_id nullable
- manufacturer controls MRP and GST
Distributor-created product:
- distributor_id required
- external manufacturer name required
- visible only to that distributor and its salesmen
- manufacturer can view if associated with distributor

Recommended check constraint:

ALTER TABLE products ADD CONSTRAINT chk_product_source_owner
CHECK (
  (product_source = 'MANUFACTURER_CREATED' AND manufacturer_id IS NOT NULL)
  OR
  (product_source = 'DISTRIBUTOR_CREATED' AND distributor_id IS NOT NULL AND external_manufacturer_name IS NOT NULL)
);

Indexes:

CREATE INDEX idx_products_source ON products(product_source);
CREATE INDEX idx_products_manufacturer_id ON products(manufacturer_id);
CREATE INDEX idx_products_distributor_id ON products(distributor_id);
CREATE INDEX idx_products_category_id ON products(category_id);

⸻

11.3 product_price_history

Purpose:

Stores historical price and discount changes.

CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  old_mrp NUMERIC(12,2),
  new_mrp NUMERIC(12,2),
  old_gst_percent NUMERIC(5,2),
  new_gst_percent NUMERIC(5,2),
  old_distributor_discount_percent NUMERIC(5,2),
  new_distributor_discount_percent NUMERIC(5,2),
  old_special_discount_percent NUMERIC(5,2),
  new_special_discount_percent NUMERIC(5,2),
  changed_by_user_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

12. Inventory Tables

⸻

12.1 distributor_inventory

Purpose:

Stores product stock at distributor level.

CREATE TABLE distributor_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  product_id UUID NOT NULL REFERENCES products(id),
  available_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  reserved_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  backordered_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(distributor_id, product_id)
);

Important rules:

Inventory belongs to Distributor + Product.
No warehouse or godown location.
Salesmen cannot see inventory quantities.
Inventory reduces only on dispatch.
Backorders are allowed.

⸻

12.2 inventory_movements

Purpose:

Stores all inventory changes.

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  product_id UUID NOT NULL REFERENCES products(id),
  order_id UUID NULL,
  movement_type VARCHAR(50) NOT NULL,
  quantity_change NUMERIC(12,2) NOT NULL,
  previous_available_quantity NUMERIC(12,2),
  new_available_quantity NUMERIC(12,2),
  previous_reserved_quantity NUMERIC(12,2),
  new_reserved_quantity NUMERIC(12,2),
  previous_backordered_quantity NUMERIC(12,2),
  new_backordered_quantity NUMERIC(12,2),
  reason TEXT,
  changed_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Movement types:

OPENING_STOCK
STOCK_ADDED
STOCK_REMOVED
STOCK_CORRECTED
ORDER_RESERVED
ORDER_BACKORDERED
ORDER_DISPATCHED
ORDER_CANCELLED
MANUAL_ADJUSTMENT

⸻

13. Shop Tables

⸻

13.1 shops

Purpose:

Stores distributor-scoped shops.

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  created_by_user_id UUID REFERENCES users(id),
  created_by_salesman_id UUID REFERENCES salesmen(id),
  name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(150),
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  gst_number VARCHAR(50),
  location GEOGRAPHY(Point, 4326),
  verification_photo_url TEXT NOT NULL,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
  last_visit_at TIMESTAMP NULL,
  last_order_at TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

Important rules:

Shop belongs to distributor.
Visible to all salesmen under same distributor.
Shop verification photo is mandatory.
Visiting card works as verification photo.
Images must be compressed before upload.

Indexes:

CREATE INDEX idx_shops_distributor_id ON shops(distributor_id);
CREATE INDEX idx_shops_phone ON shops(phone);
CREATE INDEX idx_shops_location ON shops USING GIST(location);

⸻

13.2 shop_duplicate_logs

Purpose:

Stores duplicate detection warnings and bypasses.

CREATE TABLE shop_duplicate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES distributors(id),
  attempted_shop_name VARCHAR(200),
  attempted_phone VARCHAR(30),
  attempted_location GEOGRAPHY(Point, 4326),
  matched_shop_id UUID REFERENCES shops(id),
  match_type VARCHAR(50),
  match_score NUMERIC(5,2),
  action_taken VARCHAR(50),
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Actions:

USED_EXISTING
CREATED_ANYWAY
CANCELLED

⸻

14. Working Day & Location Tables

⸻

14.1 working_days

Purpose:

Tracks salesman check-in and check-out.

CREATE TABLE working_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesman_id UUID NOT NULL REFERENCES salesmen(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  check_in_at TIMESTAMP NOT NULL,
  check_out_at TIMESTAMP NULL,
  check_in_location GEOGRAPHY(Point, 4326),
  check_out_location GEOGRAPHY(Point, 4326),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  device_id VARCHAR(150),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

14.2 location_logs

Purpose:

Stores full location history.

CREATE TABLE location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesman_id UUID NOT NULL REFERENCES salesmen(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  working_day_id UUID REFERENCES working_days(id),
  event_type VARCHAR(50) NOT NULL,
  location GEOGRAPHY(Point, 4326),
  accuracy NUMERIC(10,2),
  captured_at TIMESTAMP NOT NULL,
  device_id VARCHAR(150),
  sync_status VARCHAR(50) DEFAULT 'SYNCED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Event types:

CHECK_IN
PERIODIC
VISIT_START
VISIT_END
ORDER_CREATED
ORDER_EDITED
CHECK_OUT

⸻

14.3 latest_locations

Purpose:

Stores current/latest salesman location for live tracking.

CREATE TABLE latest_locations (
  salesman_id UUID PRIMARY KEY REFERENCES salesmen(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  working_day_id UUID REFERENCES working_days(id),
  location GEOGRAPHY(Point, 4326),
  accuracy NUMERIC(10,2),
  is_tracking_active BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

15. Visit Tables

⸻

15.1 shop_visits

Purpose:

Stores shop visit records.

CREATE TABLE shop_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesman_id UUID NOT NULL REFERENCES salesmen(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  working_day_id UUID REFERENCES working_days(id),
  visit_type VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NULL,
  start_location GEOGRAPHY(Point, 4326),
  end_location GEOGRAPHY(Point, 4326),
  no_order_reason VARCHAR(100),
  no_order_note TEXT,
  is_offline_created BOOLEAN DEFAULT FALSE,
  idempotency_key VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Important rule:

A visit must be completed with either an order or no-order reason.

⸻

16. Order Tables

⸻

16.1 orders

Purpose:

Stores order header.

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  visit_id UUID NOT NULL REFERENCES shop_visits(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  salesman_id UUID NOT NULL REFERENCES salesmen(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  manufacturer_id UUID REFERENCES manufacturers(id),
  status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
  gross_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_product_discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  bill_discount_type VARCHAR(50) DEFAULT 'NONE',
  bill_discount_value NUMERIC(12,2) DEFAULT 0,
  bill_discount_amount NUMERIC(12,2) DEFAULT 0,
  final_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_backordered_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_offline_created BOOLEAN DEFAULT FALSE,
  idempotency_key VARCHAR(200),
  post_dispatch_edited BOOLEAN DEFAULT FALSE,
  post_delivery_edited BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP NULL,
  cancelled_by_user_id UUID REFERENCES users(id),
  cancellation_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

Important rules:

Every order must belong to a visit.
Salesman-to-shop billing uses MRP inclusive of tax.
Product-level and bill-level discounts are allowed.

Indexes:

CREATE INDEX idx_orders_visit_id ON orders(visit_id);
CREATE INDEX idx_orders_salesman_id ON orders(salesman_id);
CREATE INDEX idx_orders_distributor_id ON orders(distributor_id);
CREATE INDEX idx_orders_status ON orders(status);

⸻

16.2 order_items

Purpose:

Stores order line items with price snapshot.

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  product_name_snapshot VARCHAR(200) NOT NULL,
  sku_snapshot VARCHAR(100),
  manufacturer_name_snapshot VARCHAR(200),
  quantity NUMERIC(12,2) NOT NULL,
  mrp NUMERIC(12,2) NOT NULL,
  gross_line_amount NUMERIC(12,2) NOT NULL,
  item_discount_type VARCHAR(50) DEFAULT 'NONE',
  item_discount_value NUMERIC(12,2) DEFAULT 0,
  item_discount_amount NUMERIC(12,2) DEFAULT 0,
  net_line_amount NUMERIC(12,2) NOT NULL,
  reserved_quantity NUMERIC(12,2) DEFAULT 0,
  backordered_quantity NUMERIC(12,2) DEFAULT 0,
  dispatched_quantity NUMERIC(12,2) DEFAULT 0,
  delivered_quantity NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ORDERED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Important:

Order item stores pricing snapshot.
Future product price changes do not affect old orders.

⸻

16.3 order_revisions

Purpose:

Stores full order edit history.

CREATE TABLE order_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  revision_number INTEGER NOT NULL,
  old_data JSONB NOT NULL,
  new_data JSONB NOT NULL,
  changed_fields JSONB,
  changed_by_user_id UUID REFERENCES users(id),
  changed_by_role VARCHAR(50),
  order_status_at_time VARCHAR(50),
  inventory_impact JSONB,
  distributor_notified BOOLEAN DEFAULT FALSE,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, revision_number)
);

⸻

16.4 order_status_history

Purpose:

Stores every order status change.

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_user_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

16.5 backorders

Purpose:

Stores backordered quantities.

CREATE TABLE backorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  quantity NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  resolved_quantity NUMERIC(12,2) DEFAULT 0,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

17. Fulfillment Tables

⸻

17.1 fulfillment_logs

Purpose:

Stores fulfillment actions.

CREATE TABLE fulfillment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  distributor_id UUID NOT NULL REFERENCES distributors(id),
  action VARCHAR(50) NOT NULL,
  quantity NUMERIC(12,2),
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  performed_by_user_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Actions:

CONFIRMED
PROCESSING
PACKED
DISPATCHED
DELIVERED
CANCELLED

⸻

18. Notifications Tables

⸻

18.1 notifications

Purpose:

Stores all in-app notifications.

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES users(id),
  recipient_role VARCHAR(50),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80),
  entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  firebase_sent BOOLEAN DEFAULT FALSE,
  socket_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

19. Offline Sync Tables

⸻

19.1 offline_sync_batches

Purpose:

Stores sync batch requests from mobile.

CREATE TABLE offline_sync_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  device_id VARCHAR(150),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  total_items INTEGER DEFAULT 0,
  successful_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  conflict_items INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

19.2 offline_sync_items

Purpose:

Stores individual sync items.

CREATE TABLE offline_sync_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_batch_id UUID REFERENCES offline_sync_batches(id),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(80) NOT NULL,
  operation VARCHAR(50) NOT NULL,
  local_id VARCHAR(150),
  server_id UUID,
  idempotency_key VARCHAR(200) UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  error_message TEXT,
  conflict_reason TEXT,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

⸻

20. File Upload Tables

⸻

20.1 uploaded_files

Purpose:

Stores uploaded images and documents.

CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by_user_id UUID REFERENCES users(id),
  entity_type VARCHAR(80),
  entity_id UUID,
  file_type VARCHAR(80),
  original_file_name TEXT,
  file_url TEXT NOT NULL,
  compressed_file_url TEXT,
  mime_type VARCHAR(100),
  original_size_bytes BIGINT,
  compressed_size_bytes BIGINT,
  compression_applied BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Important:

All uploaded images must be compressed.

⸻

21. Background Job Tables

⸻

21.1 background_jobs

Purpose:

Replaces Redis/BullMQ with DB-backed jobs.

CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Job types:

SEND_NOTIFICATION
RETRY_IMAGE_UPLOAD
AGGREGATE_ANALYTICS
LOW_STOCK_CHECK
SYNC_PROCESSING

⸻

22. Analytics Tables

⸻

22.1 analytics_snapshots

Purpose:

Stores calculated analytics.

CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type VARCHAR(50) NOT NULL,
  owner_id UUID NOT NULL,
  snapshot_type VARCHAR(80) NOT NULL,
  date_from DATE,
  date_to DATE,
  data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Owner types:

MANUFACTURER
DISTRIBUTOR
SALESMAN

⸻

23. Audit Tables

⸻

23.1 audit_logs

Purpose:

Stores all critical action logs.

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  ip_address VARCHAR(80),
  device_id VARCHAR(150),
  location GEOGRAPHY(Point, 4326),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

Must log:

Login
Logout
Approval
Product Created
Product Updated
Inventory Adjusted
Shop Created
Visit Started
Visit Ended
Order Created
Order Edited
Order Cancelled
Dispatch
Delivery
Sync Failed

⸻

24. Critical Database Rules

Rule 1

Every order must belong to a visit.

Enforced by:

orders.visit_id NOT NULL

⸻

Rule 2

Shop belongs to distributor.

Enforced by:

shops.distributor_id NOT NULL

⸻

Rule 3

Salesman belongs to one distributor.

Enforced by:

salesmen.distributor_id NOT NULL

⸻

Rule 4

Distributor-created product is private.

Enforced by:

products.distributor_id
products.product_source = DISTRIBUTOR_CREATED

⸻

Rule 5

Salesman cannot see inventory.

Enforced by:

API permission layer
Frontend hidden fields

⸻

Rule 6

Inventory reduced on dispatch only.

Enforced by:

Fulfillment service
Inventory movement logs

⸻

Rule 7

Images must be compressed.

Enforced by:

Mobile compression
Upload service validation
uploaded_files.compression_applied

⸻

25. Suggested Migration Order

1. users, roles, permissions
2. manufacturers, distributors, salesmen
3. approval tables
4. product categories, products
5. inventory
6. shops
7. working days and locations
8. visits
9. orders and order items
10. fulfillment and backorders
11. notifications
12. offline sync
13. uploaded files
14. background jobs
15. analytics
16. audit logs

⸻

26. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md
07_API_Contracts_And_Sync_Specification.md