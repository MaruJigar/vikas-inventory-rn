09_Admin_Panel_Specification.md

Admin Panel Specification

Version: 1.0
Status: Approved
Platform: Web Admin Panel
Recommended Stack: Next.js + TypeScript + Tailwind CSS + shadcn/ui

⸻

1. Purpose

The Admin Panel is the internal web-based control center for managing the entire field sales platform.

The mobile application is used by:

Salesmen
Distributors
Manufacturers

The Admin Panel is used by:

Super Admin
Internal Operations Team
Support Team
System Admins

The Admin Panel provides complete visibility and control across:

Users
Manufacturers
Distributors
Salesmen
Approvals
Products
Inventory
Shops
Visits
Orders
Fulfillment
Notifications
Offline Sync
Location Tracking
Audit Logs
Analytics
System Jobs
File Uploads

⸻

2. Admin Panel Goals

The Admin Panel should allow admins to:

View all platform data
Approve or reject users
Manage manufacturers
Manage distributors
Manage salesmen
Monitor orders
Monitor inventory
Monitor visits
Monitor shop creation
Monitor location activity
Review audit logs
Review sync failures
Retry failed jobs
View analytics
Resolve operational issues

The Admin Panel should be:

Fast
Searchable
Filter-heavy
Table-based
Audit-friendly
Permission-controlled
Clean and professional
Human Readability Governance: End users must never see raw UUIDs or technical identifiers.
Pagination & Query Efficiency Governance: Frontend must never fetch unbounded collections. All list queries must be server-side paginated, and DataTables must provide pagination controls.
⸻

3. Recommended Technology Stack

Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Recharts
Socket.IO Client
Firebase Admin/Notification Support

⸻

4. Admin Roles

Super Admin

Can:

Access everything
Approve users
Suspend users
View all manufacturers
View all distributors
View all salesmen
View all orders
View all inventory
View all shops
View all audit logs
Manage system settings
Retry failed jobs

⸻

Operations Admin

Can:

View business data
Approve/reject distributors
Approve/reject salesmen
Review orders
Review shops
Review sync issues
View analytics

Cannot:

Manage super admins
Change system-level settings

⸻

Support Admin

Can:

Search users
View orders
View shops
View sync issues
View audit logs
Help resolve support cases

Cannot:

Approve users unless permitted
Edit critical records
Change inventory
Delete records

⸻

5. Admin Panel Navigation

Recommended Sidebar Navigation:

Dashboard
Approvals
Users
  - Manufacturers
  - Distributors
  - Salesmen
  - Admin Users
Products
  - Manufacturer Products
  - Distributor Products
  - Categories
Inventory
Orders
Shops
Visits
Locations
Notifications
Offline Sync
Uploads
Background Jobs
Analytics
Audit Logs
Settings

⸻

6. Global Layout

Desktop Layout

Left Sidebar:

Navigation Menu

Top Header:

Search Bar
Notifications
Admin Profile
Logout

Main Content:

Page Title
Filters
Tables
Details
Actions

⸻

7. Global Search

Purpose:

Allow admin to search across the platform.

Search Input Placeholder:

Search users, orders, shops, products...

Search Results:

Users
Orders
Shops
Products
Distributors
Salesmen

Clicking a result opens the relevant detail page.

⸻

8. Dashboard

Purpose

The dashboard gives the admin a platform-wide overview.

⸻

KPI Cards

Display:

Total Manufacturers
Total Distributors
Pending Distributor Approvals
Pending Salesman Approvals
Total Salesmen
Orders Today
Backorders
Failed Sync Items
Failed Background Jobs

⸻

Charts

Display:

Orders Over Time
User Registrations
Backorder Trend
Sync Failure Trend

⸻

Action Panels

Display:

Pending Approvals
Failed Sync Items
Orders Needing Attention
Recent Audit Logs

⸻

9. Approvals Module

Purpose:

Admins can review and approve/reject distributors and salesmen.

⸻

9.1 Approvals List Page

Tabs:

Distributor Requests
Salesman Requests
Rejected
Suspended
Approved

⸻

Filters:

Role
Status
Date Range
Manufacturer
Distributor
City
State

⸻

Table Columns:

Name
Role
Phone
Email
Requested On
Status
Action

Actions:

View
Approve
Reject
Suspend

⸻

9.2 Distributor Approval Detail

Displays:

Business Name
Owner Name
Phone
Email
Address
City
State
GST Number
Registered Date
Current Status

Documents:

Business Documents
GST Certificate
Uploaded Files

Linked Manufacturers:

Manufacturer Name
Relationship Status

Buttons:

Approve Distributor
Reject Distributor
Suspend Distributor

⸻

Reject Distributor Modal

Fields:

Rejection Reason *

Buttons:

Cancel
Confirm Reject

⸻

Approve Distributor Action

On click:

Status changes to APPROVED
Distributor becomes active
Audit log created
Notification sent
Socket event emitted

⸻

9.3 Salesman Approval Detail

Displays:

Salesman Name
Phone
Email
Selected Distributor
Distributor Status
Registered Date
Current Status

Buttons:

Approve Salesman
Reject Salesman
Suspend Salesman

⸻

Approve Salesman Action

On click:

Status changes to APPROVED
Salesman becomes active
Audit log created
Notification sent
Socket event emitted

⸻

10. Users Module

⸻

10.1 Manufacturers Page

Table Columns:

Company Name
Contact Person
Phone
Email
Total Products
Linked Distributors
Status
Created Date
Actions

Actions:

View
Edit
Suspend

⸻

Manufacturer Detail Page

Tabs:

Overview
Products
Distributors
Salesmen
Orders
Analytics
Audit Logs

⸻

10.2 Distributors Page

Table Columns:

Business Name
Owner Name
Phone
Email
City
State
Approval Status
Active Salesmen
Orders
Actions

Actions:

View
Approve
Reject
Suspend

⸻

Distributor Detail Page

Tabs:

Overview
Products
Inventory
Salesmen
Shops
Orders
Visits
Analytics
Audit Logs

⸻

10.3 Salesmen Page

Table Columns:

Name
Phone
Email
Distributor
Approval Status
Check-In Status
Orders Today
Visits Today
Actions

Actions:

View
Approve
Reject
Suspend

⸻

Salesman Detail Page

Tabs:

Overview
Working Days
Visits
Orders
Location History
Audit Logs

⸻

11. Products Module

⸻

Product List Tabs

Manufacturer Products
Distributor Products
Categories

⸻

Manufacturer Product Table

Columns:

Product Image
Product Name
SKU
Manufacturer
MRP
GST
Status
Created Date
Actions

⸻

Distributor Product Table

Columns:

Product Image
Product Name
SKU
Distributor
External Manufacturer Name
MRP
GST
Status
Created Date
Actions

⸻

Product Detail Page

Displays:

Product Information
Pricing
Manufacturer Details
Distributor Details
Inventory Across Distributors
Sales Performance
Audit Logs

⸻

Product Rules

Manufacturer product:

Admin can view and manage if permission allows.
Distributor cannot edit MRP.

Distributor product:

Visible to admin.
Visible to its distributor.
Visible to salesmen under that distributor.
Visible to associated manufacturer for visibility.

⸻

12. Inventory Module

Purpose:

Allow admin to monitor inventory across all distributors.

⸻

Inventory Table Columns

Distributor
Product
Product Source
Manufacturer
Available Quantity
Reserved Quantity
Backordered Quantity
Low Stock Threshold
Status
Actions

⸻

Actions:

View
View Movements

Optional with permission:

Adjust Inventory

⸻

Inventory Detail Page

Tabs:

Overview
Movements
Orders
Backorders
Audit Logs

⸻

Important:

No warehouse or storage location tracking.
Inventory exists only at Distributor + Product level.

⸻

13. Orders Module

Purpose:

Admin can view and monitor all orders.

⸻

Orders Table Columns

Order Number
Shop
Distributor
Salesman
Amount
Status
Backorder
Edited
Created Date
Actions

⸻

Filters:

Status
Distributor
Salesman
Manufacturer
Shop
Date Range
Backorder
Edited
Post-Dispatch Edited
Post-Delivery Edited

⸻

Actions:

View
View Timeline
View Revisions
View Audit Logs

⸻

Order Detail Page

Tabs:

Overview
Items
Pricing
Fulfillment
Revisions
Timeline
Audit Logs

⸻

Important Display:

Visit ID
Shop
Salesman
Distributor
Order Status
Gross Amount
Discounts
Final Amount
Backordered Quantity

⸻

14. Shops Module

Purpose:

Admin can monitor all shops.

⸻

Shops Table Columns

Shop Name
Phone
Owner
Distributor
Created By
Verification Status
Last Visit
Last Order
Actions

⸻

Filters:

Distributor
Salesman
Verification Status
City
State
Created Date

⸻

Shop Detail Page

Tabs:

Overview
Verification Photo
Visits
Orders
Duplicate Logs
Audit Logs

⸻

Important:

Shop photo is mandatory.
Visiting card is accepted as verification photo.
Images must be compressed before upload.

⸻

15. Visits Module

Purpose:

Admin can monitor shop visits.

⸻

Visits Table Columns

Visit ID
Shop
Salesman
Distributor
Visit Type
Status
Started At
Ended At
Duration
Actions

⸻

Filters:

Salesman
Distributor
Visit Type
Status
Date Range
No Order Reason

⸻

Visit Detail Page

Displays:

Shop
Salesman
Distributor
Start Location
End Location
Order Linked
No Order Reason
Duration

⸻

Important Rule:

Every order must belong to a visit.

⸻

16. Location Module

Purpose:

Admin can monitor live and historical location activity.

⸻

Live Location Page

Displays:

Checked-In Salesmen
Current Location
Last Updated
Distributor
Working Since

Map:

Salesman Current Marker
Visited Shops
Route Path

⸻

Location History Page

Filters:

Salesman
Distributor
Date
Event Type

Displays:

Check In
Periodic Logs
Visit Start
Visit End
Order Created
Check Out

⸻

17. Notifications Module

Purpose:

Admin can monitor notifications.

⸻

Notifications Table Columns

Recipient
Role
Title
Type
Entity
Firebase Sent
Socket Sent
Read Status
Created At

Actions:

View
Retry Send

⸻

18. Offline Sync Module

Purpose:

Monitor mobile sync health.

⸻

Sync Batches Table

Columns:

User
Device ID
Status
Total Items
Successful
Failed
Conflicts
Started At
Completed At

Actions:

View Items
Retry Failed

⸻

Sync Items Table

Columns:

Entity Type
Operation
Local ID
Server ID
Status
Error
Conflict Reason
Processed At

⸻

19. Uploads Module

Purpose:

Monitor uploaded files/images.

⸻

Upload Table Columns

Uploaded By
Entity Type
File Type
Original Size
Compressed Size
Compression Applied
Created At

Important:

All images must be compressed.

⸻

Actions:

View File
View Linked Entity

⸻

20. Background Jobs Module

Purpose:

Monitor DB-backed jobs.

⸻

Jobs Table Columns

Job Type
Status
Attempts
Scheduled At
Started At
Completed At
Error
Actions

Actions:

Retry
Cancel
View Payload

⸻

21. Analytics Module

Admin analytics includes:

Total Sales
Orders
Backorders
Inventory Health
Salesman Performance
Distributor Performance
Manufacturer Performance
Sync Failures
System Jobs

⸻

Tabs:

Platform Overview
Sales
Orders
Users
Inventory
Sync Health
System Health

⸻

22. Audit Logs Module

Purpose:

Track every important action.

⸻

Audit Log Table Columns

Actor
Role
Action
Entity Type
Entity ID
Date
Device
IP Address
Actions

Filters:

Actor
Role
Action
Entity Type
Date Range

⸻

Audit Detail

Displays:

Old Value
New Value
Metadata
Location
Device ID
Timestamp

⸻

23. Settings Module

Settings:

User Management
Role Permissions
Notification Settings
System Config
Approval Rules
File Upload Limits

⸻

24. UI Design Requirements

Use shadcn/ui components:

Button
Input
Card
Table
Dialog
Dropdown
Tabs
Badge
Sheet
Toast
Command Menu
Date Picker
Form

⸻

25. Table Standards

All tables must include:

Search
Filters
Pagination
Sort
Column Visibility
Export CSV

⸻

26. Modal Standards

Use confirmation modals for:

Approve
Reject
Suspend
Cancel Job
Retry Job
Adjust Inventory

⸻

27. Permission Standards

Every admin action must check:

Role
Permission
Entity Scope

Both:

Frontend
Backend

⸻

28. Audit Standards

Every admin action must create audit log:

Approve User
Reject User
Suspend User
Edit Product
Adjust Inventory
Retry Job
Change Settings

⸻

29. Socket.IO Admin Events

Admin receives:

NEW_APPROVAL_REQUEST
NEW_ORDER
SYNC_FAILED
BACKGROUND_JOB_FAILED
BACKORDER_CREATED

⸻

30. Firebase Admin Notifications

Admin may receive:

High Priority Approval
System Failure
Sync Failure
Large Backorder Alert

⸻

31. Important Business Rules

Rule 1

Admin can access all functionalities.

Rule 2

Admin actions must be audited.

Rule 3

Admins can approve distributors.

Rule 4

Admins can approve salesmen.

Rule 5

Admin can monitor all orders, visits, shops and inventory.

Rule 6

Admin can view compressed image uploads.

Rule 7

Admin can retry failed background jobs.

Rule 8

Admin can monitor offline sync failures.

⸻

32. QA Acceptance Criteria

Admin Panel is accepted when:

Admin can approve/reject distributors
Admin can approve/reject salesmen
Admin can view all users
Admin can view all products
Admin can view all orders
Admin can view all shops
Admin can view visits
Admin can view locations
Admin can view sync failures
Admin can view audit logs
Admin can retry failed jobs
All admin actions are audited
Tables support filters and pagination
Permissions are enforced

⸻