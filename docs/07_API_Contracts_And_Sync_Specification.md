07_API_Contracts_And_Sync_Specification.md

API Contracts & Sync Specification

Version: 1.0

Status: Approved

This document defines:

REST API Standards
Request Structure
Response Structure
Error Handling
Offline Sync Architecture
WatermelonDB Mapping
Socket.IO Contracts
Firebase Notification Contracts
Image Upload Contracts
Idempotency Rules
Conflict Resolution Rules

Audience:

Backend Developers
React Native Developers
QA Engineers
Architects

⸻

1. API Design Philosophy

The API must support:

Online Operations
Offline Operations
Background Sync
Large Scale Growth
Auditability

⸻

Core Principles

Principle 1

Backend is source of truth.

⸻

Principle 2

Mobile may work offline.

⸻

Principle 3

Every sync operation must be idempotent.

⸻

Principle 4

Nothing important is deleted.

Use soft deletes.

⸻

2. API Standards

Base URL

/api/v1

⸻

Authentication

Authorization: Bearer JWT_TOKEN

⸻

Content Type

application/json

⸻

Success Response

{
  "success": true,
  "message": "Order created successfully",
  "data": {}
}

⸻

Error Response

{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

⸻

3. Authentication APIs

Login

POST /auth/login

Request

{
  "email": "user@email.com",
  "password": "password"
}

Response

{
  "accessToken": "",
  "refreshToken": "",
  "user": {}
}

⸻

Refresh Token

POST /auth/refresh-token

⸻

Logout

POST /auth/logout

⸻

4. Registration APIs

Distributor Registration

POST /auth/register/distributor

Status Created:

Pending Approval

⸻

Salesman Registration

POST /auth/register/salesman

Status Created:

Pending Approval

⸻

5. Approval APIs

Distributor Approval

PATCH /approvals/distributors/{id}/approve

⸻

Distributor Rejection

PATCH /approvals/distributors/{id}/reject

⸻

Salesman Approval

PATCH /approvals/salesmen/{id}/approve

⸻

Salesman Rejection

PATCH /approvals/salesmen/{id}/reject

⸻

6. Product APIs

Get Products

GET /products

Filters:

Category
Manufacturer
Distributor
Source

⸻

Create Manufacturer Product

POST /products/manufacturer

⸻

Create Distributor Product

POST /products/distributor

⸻

Distributor Product Fields

{
  "name": "",
  "sku": "",
  "manufacturerName": "",
  "manufacturerAddress": "",
  "gstPercentage": 18
}

⸻

7. Shop APIs

Create Shop

POST /shops

Request

{
  "name": "",
  "phone": "",
  "ownerName": "",
  "address": "",
  "latitude": "",
  "longitude": "",
  "verificationPhoto": ""
}

⸻

Business Rule

Verification photo mandatory.

⸻

Duplicate Check

POST /shops/check-duplicate

Response

{
  "duplicates": []
}

⸻

8. Visit APIs

Start Visit

POST /visits/start

⸻

Request

{
  "shopId": "",
  "latitude": "",
  "longitude": ""
}

⸻

Response

{
  "visitId": ""
}

⸻

End Visit

POST /visits/end

⸻

No Order Visit

POST /visits/no-order

Request

{
  "visitId": "",
  "reason": ""
}

⸻

9. Order APIs

Important Rule:

Every order must belong to a visit.

⸻

Create Order

POST /orders

⸻

Request

{
  "visitId": "",
  "shopId": "",
  "products": []
}

⸻

Response

{
  "orderId": ""
}

⸻

Edit Order

PATCH /orders/{id}

⸻

Cancel Order

PATCH /orders/{id}/cancel

⸻

Get Order Detail

GET /orders/{id}

⸻

Get Order Revisions

GET /orders/{id}/revisions

⸻

10. Fulfillment APIs

Distributor Only

⸻

Confirm Order

PATCH /orders/{id}/confirm

⸻

Processing

PATCH /orders/{id}/processing

⸻

Packed

PATCH /orders/{id}/packed

⸻

Dispatch

PATCH /orders/{id}/dispatch

Business Rule:

Inventory reduced on dispatch.

⸻

Deliver

PATCH /orders/{id}/deliver

⸻

11. Inventory APIs

Inventory List

GET /inventory

⸻

Inventory Detail

GET /inventory/{id}

⸻

Inventory Adjustment

POST /inventory/adjust

⸻

Request

{
  "productId": "",
  "adjustmentType": "",
  "quantity": 10,
  "reason": ""
}

⸻

12. Location APIs

Check In

POST /working-day/check-in

⸻

Check Out

POST /working-day/check-out

⸻

Upload Location

POST /locations

⸻

Batch Upload

POST /locations/batch

⸻

13. Image Upload APIs

Upload Image

POST /uploads/image

⸻

Supported Types

JPEG
PNG
WEBP

⸻

Compression

Mandatory before upload.

⸻

Request

multipart/form-data

⸻

Response

{
  "fileUrl": ""
}

⸻

14. Notification APIs

Get Notifications

GET /notifications

⸻

Mark Read

PATCH /notifications/{id}/read

⸻

15. Analytics APIs

Manufacturer Analytics

GET /analytics/manufacturer

⸻

Distributor Analytics

GET /analytics/distributor

⸻

Salesman Analytics

GET /analytics/salesman

⸻

16. Offline Sync Architecture

Purpose:

Synchronize WatermelonDB with Backend.

⸻

Sync Endpoint

POST /sync

⸻

Request Structure

{
  "deviceId": "",
  "items": []
}

⸻

Item Example

{
  "entityType": "ORDER",
  "operation": "CREATE",
  "idempotencyKey": "",
  "payload": {}
}

⸻

17. Idempotency Rules

Every offline record must have:

idempotency_key

Format:

deviceId_entityType_localId

Example:

abc123_ORDER_999

⸻

Purpose:

Prevent Duplicate Orders
Prevent Duplicate Shops
Prevent Duplicate Visits

⸻

18. WatermelonDB Mapping

Local Table

orders

Maps To:

backend.orders

⸻

Local Table

shops

Maps To:

backend.shops

⸻

Local Table

visits

Maps To:

backend.visits

⸻

19. Sync Statuses

Supported Statuses

Pending
Synced
Failed
Conflict

⸻

Meaning

Pending

Waiting To Sync

⸻

Synced

Successfully Uploaded

⸻

Failed

Upload Failed

⸻

Conflict

Requires User Review

⸻

20. Conflict Resolution Rules

Example:

Product Deactivated
Distributor Suspended
Shop Deleted
Order Changed Elsewhere

⸻

Conflict Response

{
  "status": "CONFLICT",
  "reason": "Product Deactivated"
}

⸻

Client Behavior

Show Conflict Screen
Allow Retry
Allow Discard

⸻

21. Socket.IO Architecture

Purpose:

Live Updates

⸻

Connection Flow

Login
↓
Connect
↓
Join Rooms

⸻

Room Structure

manufacturer:{id}
distributor:{id}
salesman:{id}

⸻

Distributor Events

Receive

NEW_ORDER
ORDER_EDITED
ORDER_CANCELLED
BACKORDER_CREATED

⸻

Manufacturer Events

Receive

DISTRIBUTOR_APPROVAL_REQUEST
SALESMAN_APPROVAL_REQUEST
ORDER_UPDATED

⸻

Salesman Events

Receive

ORDER_STATUS_CHANGED
APPROVAL_STATUS_CHANGED

⸻

Event Payload Example

{
  "event": "NEW_ORDER",
  "orderId": "",
  "timestamp": ""
}

⸻

22. Firebase Notification Contracts

Categories

Orders
Approvals
Backorders
Inventory
System

⸻

Payload Example

{
  "type": "NEW_ORDER",
  "entityId": "123"
}

⸻

Navigation Rules

Tap Notification
↓
Open Related Screen

⸻

23. Image Upload Sync

Flow

Capture Image
↓
Compress
↓
Store Locally
↓
Queue Upload
↓
Upload
↓
Mark Synced

⸻

Image Statuses

Pending Upload
Uploaded
Failed

⸻

24. Error Handling Standards

401

Session Expired

⸻

403

Permission Denied

⸻

404

Record Not Found

⸻

422

Validation Error

⸻

500

Server Error

⸻

25. Retry Policy

Sync Retry

1 Minute
5 Minutes
15 Minutes
30 Minutes

Maximum:

5 Attempts

⸻

26. API Versioning

Current Version

v1

Example:

/api/v1/orders

⸻

Future:

v2
v3

⸻

27. Security Standards

All APIs:

JWT Protected
HTTPS Only
Audit Logged

⸻

Uploads:

Authenticated
Virus Checked
Size Limited

⸻

28. Performance Targets

API Response:

< 500ms

⸻

Search:

< 1s

⸻

Sync:

Begin Within 5 Seconds

After Network Restoration.

⸻

29. Important Business Rules

Rule 1

Every Order Must Belong To Visit

Rule 2

Salesman Cannot See Inventory

Rule 3

Backorders Allowed

Rule 4

Image Compression Mandatory

Rule 5

All Sync Operations Must Be Idempotent

Rule 6

Distributor Products Are Private

Rule 7

Manufacturer Can View Distributor Products

Rule 8

Inventory Reduced On Dispatch

⸻

30. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md