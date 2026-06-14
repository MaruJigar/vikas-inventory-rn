11_Backend_Module_Implementation_Guide.md

Backend Module Implementation Guide

Version: 1.0
Status: Approved
Recommended Backend Stack: NestJS + TypeScript + PostgreSQL + PostGIS
Realtime: Socket.IO
Push Notifications: Firebase Cloud Messaging
Queue Strategy: Database-backed jobs
Cache Strategy: No Redis

⸻

1. Purpose

This document defines the backend implementation structure for the field sales platform.

It explains:

NestJS Module Structure
Service Responsibilities
Controller Responsibilities
DTO Structure
Guard Strategy
Permission Checks
Database Access Strategy
Socket Event Strategy
Background Job Strategy
Implementation Order

Audience:

Backend Developers
Backend Leads
Technical Architects
QA Engineers
Frontend Developers

⸻

2. Backend Philosophy

The backend must be:

Audit First
Permission First
Offline Safe
Inventory Safe
Visit Based
Sync Friendly
Extensible

⸻

3. Core Rules

The backend must enforce these rules even if frontend fails:

Every order must belong to a visit.
Salesman cannot create order without active visit.
Salesman cannot see inventory quantities.
Inventory reduces only on dispatch.
Backorders are allowed.
Shop belongs to distributor.
Salesman belongs to one distributor.
Distributor-created products are private.
Manufacturer-created products cannot have MRP changed by distributor.
Shop verification photo is mandatory.
All images must be compressed before upload.
Pending users can only view catalogues.
All critical actions must create audit logs.

⸻

4. Recommended NestJS Project Structure

src/
├── main.ts
├── app.module.ts
├── config/
├── common/
├── database/
├── modules/
├── jobs/
├── sockets/
├── notifications/
├── uploads/
├── audit/
└── utils/

⸻

5. Common Layer

common/
├── decorators/
├── guards/
├── interceptors/
├── filters/
├── pipes/
├── dto/
├── enums/
└── constants/

⸻

6. Required Common Guards

JWT Auth Guard

Purpose:

Validate authenticated user.

⸻

Role Guard

Purpose:

Validate role-level access.

⸻

Permission Guard

Purpose:

Validate action-level access.

⸻

Approval Status Guard

Purpose:

Block pending users from operational modules.

Pending users can only access:

Catalogue
Profile
Manufacturers

⸻

Ownership Guard

Purpose:

Validate entity ownership.

Examples:

Salesman can access only own orders.
Distributor can access only own salesmen.
Manufacturer can access only linked ecosystem.

⸻

7. Backend Modules

Recommended modules:

Auth Module
Users Module
Roles & Permissions Module
Manufacturer Module
Distributor Module
Salesman Module
Approval Module
Product Module
Inventory Module
Shop Module
Visit Module
Order Module
Fulfillment Module
Location Module
Working Day Module
Notification Module
Upload Module
Offline Sync Module
Analytics Module
Audit Log Module
Background Job Module
Socket Module
Admin Module

⸻

8. Auth Module

Responsibilities

Login
Register Distributor
Register Salesman
Refresh Token
Logout
Password Hashing
Token Generation
Approval Status Response

⸻

Controllers

AuthController

Endpoints:

POST /auth/login
POST /auth/register/distributor
POST /auth/register/salesman
POST /auth/refresh-token
POST /auth/logout
GET  /auth/me

⸻

Services

AuthService
TokenService
PasswordService

⸻

Important Logic

Distributor registration:

Create User
Create Distributor
Set Status = PENDING_APPROVAL
Create Approval Request
Send Notification To Manufacturer/Admin

Salesman registration:

Create User
Create Salesman
Set Status = PENDING_APPROVAL
Create Approval Request
Send Notification To Manufacturer/Admin

⸻

9. Users Module

Responsibilities

User Profile
User Status
User Activation
User Suspension

⸻

Controllers

UsersController

⸻

Services

UsersService

⸻

10. Approval Module

Responsibilities

Approve Distributor
Reject Distributor
Approve Salesman
Reject Salesman
Suspend User
Track Approval History

⸻

Controllers

ApprovalsController

Endpoints:

GET   /approvals
GET   /approvals/:id
PATCH /approvals/distributors/:id/approve
PATCH /approvals/distributors/:id/reject
PATCH /approvals/salesmen/:id/approve
PATCH /approvals/salesmen/:id/reject

⸻

Services

ApprovalService
ApprovalLogService

⸻

Approve Distributor Logic

Validate Admin or Manufacturer
Update Distributor Status = APPROVED
Update User Status = APPROVED
Activate Distributor
Create Approval Log
Create Audit Log
Send Notification
Emit Socket Event

⸻

Reject Distributor Logic

Validate Rejection Reason
Update Status = REJECTED
Store Reason
Create Approval Log
Create Audit Log
Send Notification
Emit Socket Event

⸻

11. Manufacturer Module

Responsibilities

Manufacturer Profile
Product Ownership
Distributor Visibility
Salesman Visibility
Analytics Visibility

⸻

Controllers

ManufacturersController

⸻

Services

ManufacturersService

⸻

12. Distributor Module

Responsibilities

Distributor Profile
Inventory Ownership
Salesman Team
Distributor Products
Order Fulfillment

⸻

Controllers

DistributorsController

⸻

Services

DistributorsService

⸻

13. Salesman Module

Responsibilities

Salesman Profile
Distributor Link
Visit Access
Order Access
Location Access

Important:

One salesman belongs to one distributor.

⸻

14. Product Module

Responsibilities

Manufacturer Product Creation
Distributor Product Creation
Catalogue Browsing
Product Pricing
Product Visibility
Product Images

⸻

Controllers

ProductsController

Endpoints:

GET  /products
POST /products/manufacturer
POST /products/distributor
GET  /products/:id
PATCH /products/:id

⸻

Product Visibility Logic

Manufacturer product visible to:

Linked distributors
Salesmen under linked distributors
Manufacturer
Admin

Distributor product visible to:

Distributor
Distributor salesmen
Associated manufacturer
Admin

⸻

Product Edit Rules

Manufacturer-created product:

Distributor cannot edit MRP, GST, name, SKU.

Distributor-created product:

Owning distributor can edit.

⸻

15. Inventory Module

Responsibilities

Inventory View
Inventory Adjustment
Stock Reservation
Backorder Calculation
Inventory Dispatch Reduction
Movement Logs

⸻

Controllers

InventoryController

Endpoints:

GET  /inventory
GET  /inventory/:id
POST /inventory/adjust
GET  /inventory/movements

⸻

Important Logic

Order creation:

Reserve available stock.
Create backorder if insufficient.

Dispatch:

Reduce inventory.
Reduce reserved quantity.
Create inventory movement.

⸻

Salesman Rule

Never expose inventory quantities to salesman APIs.

⸻

16. Shop Module

Responsibilities

Distributor Scoped Shops
Shop Creation
Duplicate Detection
Shop Verification Photo
Shop History

⸻

Controllers

ShopsController

Endpoints:

POST /shops/check-duplicate
POST /shops
GET  /shops
GET  /shops/:id
PATCH /shops/:id

⸻

Create Shop Logic

Validate Distributor Scope
Validate Required Fields
Validate Verification Photo
Create Shop
Link To Distributor
Create Audit Log

⸻

Duplicate Detection Logic

Use:

Phone Match
Location Proximity
Fuzzy Name Match

Duplicate warning should not always block creation.

⸻

17. Visit Module

Responsibilities

Start Visit
End Visit
No Order Reason
Visit History
Visit Analytics

⸻

Controllers

VisitsController

Endpoints:

POST /visits/start
POST /visits/end
POST /visits/no-order
GET  /visits
GET  /visits/:id

⸻

Start Visit Logic

Validate Salesman Approved
Validate Checked In
Validate Shop Belongs To Distributor
Capture Location
Create Active Visit

⸻

End Visit Logic

Validate Order Exists OR No Order Reason Exists
Capture End Location
Close Visit
Create Audit Log

⸻

18. Order Module

Responsibilities

Create Order
Edit Order
Cancel Order
Order Items
Order Discounts
Order Revisions
Order Status History
Backorders

⸻

Controllers

OrdersController

Endpoints:

POST /orders
GET  /orders
GET  /orders/:id
PATCH /orders/:id
PATCH /orders/:id/cancel
GET  /orders/:id/revisions

⸻

Create Order Logic

Validate Visit ID
Validate Visit Is Active
Validate Shop Matches Visit
Validate Products
Calculate MRP Billing
Apply Product Discounts
Apply Bill Discount
Reserve Inventory
Create Backorders
Create Order
Create Order Items
Create Status History
Create Audit Log
Notify Distributor
Emit Socket Event

⸻

Pricing Logic

Salesman to shop:

MRP is tax inclusive.

Discounts:

Product-level discount
Bill-level discount
Amount or Percentage

⸻

Edit Order Logic

Before dispatch:

Recalculate reservation and backorders.

After dispatch:

Do not auto-reverse inventory.
Flag post_dispatch_edited.
Notify distributor.
Create audit log.

After delivery:

Flag post_delivery_edited.
Notify distributor.
Create audit log.

⸻

19. Fulfillment Module

Responsibilities

Confirm Order
Processing
Pack
Dispatch
Deliver
Partial Dispatch
Partial Delivery
Fulfillment Logs

⸻

Controllers

FulfillmentController

Endpoints:

PATCH /orders/:id/confirm
PATCH /orders/:id/processing
PATCH /orders/:id/packed
PATCH /orders/:id/dispatch
PATCH /orders/:id/deliver

⸻

Dispatch Logic

Validate Distributor Ownership
Reduce Inventory
Update Order Items
Update Order Status
Create Fulfillment Log
Create Inventory Movement
Create Audit Log
Notify Salesman

⸻

20. Location Module

Responsibilities

Store Location Logs
Update Latest Location
Support Live Tracking
Support Location History

⸻

Controllers

LocationController

Endpoints:

POST /locations
POST /locations/batch
GET  /salesmen/:id/live-location
GET  /salesmen/:id/location-history

⸻

Important Rule

Location tracking works only:

After Check In
Before Check Out

⸻

21. Working Day Module

Responsibilities

Check In
Check Out
Working Day History

⸻

Controllers

WorkingDayController

Endpoints:

POST /working-day/check-in
POST /working-day/check-out
GET  /working-day/history

⸻

22. Upload Module

Responsibilities

Image Uploads
Document Uploads
Compression Validation
File Storage

⸻

Controllers

UploadsController

Endpoints:

POST /uploads/image
POST /uploads/document

⸻

Upload Rules

All images must be compressed.
Max file size must be enforced.
File type must be validated.

⸻

23. Notification Module

Responsibilities

Create Notification
Send Firebase Push
Emit Socket Events
Store Notification Records
Retry Failed Notifications

⸻

Channels

In-App
Socket.IO
Firebase Push

⸻

24. Offline Sync Module

Responsibilities

Receive Sync Batch
Validate Idempotency
Process Offline Records
Return Server IDs
Handle Conflicts
Track Sync Status

⸻

Controllers

SyncController

Endpoint:

POST /sync

⸻

Sync Logic

Receive Batch
Create Sync Batch Record
Process Each Item
Validate Idempotency Key
Create/Update Server Record
Return Mapping

⸻

25. Background Job Module

Responsibilities

Process Database Jobs
Notification Retry
Analytics Aggregation
Low Stock Checks
Failed Upload Retry

No Redis.

No BullMQ.

⸻

Worker Logic

Find Pending Jobs
Lock Job
Process Job
Mark Completed Or Failed

⸻

26. Socket Module

Responsibilities

Socket Authentication
Room Joining
Live Event Emission

Rooms:

manufacturer:{id}
distributor:{id}
salesman:{id}
admin

⸻

27. Audit Log Module

Responsibilities

Create Audit Logs
Query Audit Logs
Filter Audit Logs

⸻

Must log:

Approval
Order Created
Order Edited
Order Cancelled
Inventory Adjusted
Dispatch
Delivery
Shop Created
Visit Started
Visit Ended
Sync Failed

⸻

28. Analytics Module

Responsibilities

Sales Analytics
Visit Analytics
Inventory Analytics
Backorder Analytics
Performance Analytics
Snapshot Generation

⸻

Use:

Materialized Views
Analytics Snapshots
Background Jobs

⸻

29. Admin Module

Responsibilities

Admin Dashboard
Global Search
Approval Management
User Management
Monitoring
Sync Monitoring
Audit Review

⸻

30. Implementation Order

Recommended:

1. Auth
2. Users/Roles/Permissions
3. Manufacturers
4. Distributors
5. Salesmen
6. Approval Flow
7. Products
8. Inventory
9. Shops
10. Working Days
11. Visits
12. Orders
13. Fulfillment
14. Locations
15. Uploads
16. Notifications
17. Offline Sync
18. Sockets
19. Analytics
20. Admin APIs
21. Background Jobs
22. Audit Logs

⸻

31. Testing Requirements

Each module must include:

Unit Tests
Integration Tests
Permission Tests
Ownership Tests
Failure Tests

Critical tests:

Order cannot be created without visit.
Salesman cannot see inventory.
Distributor cannot edit manufacturer product MRP.
Pending user cannot create order.
Shop cannot be created without photo.
Inventory reduces only on dispatch.

⸻

32. Important Backend Rules

Rule 1

Backend must never trust frontend permissions.

Rule 2

Every critical action must be audited.

Rule 3

Every order must belong to visit.

Rule 4

All offline sync must be idempotent.

Rule 5

Inventory operations must use database transactions.

Rule 6

No Redis or BullMQ in Phase 1.

Rule 7

Socket events are for realtime updates, not source of truth.

Rule 8

PostgreSQL is source of truth.

⸻

33. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md
07_API_Contracts_And_Sync_Specification.md
08_Database_Schema_And_ERD_Specification.md
09_Admin_Panel_Specification.md
10_System_Architecture_And_Deployment.md