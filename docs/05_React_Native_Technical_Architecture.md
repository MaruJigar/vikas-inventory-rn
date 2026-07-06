05_React_Native_Technical_Architecture.md

React Native Technical Architecture

Version: 1.0

Status: Approved

This document defines the complete technical architecture of the React Native application.

Audience:

* React Native Developers
* Mobile Architects
* Backend Developers
* DevOps Engineers
* QA Engineers

This document explains:

Application Architecture
Folder Structure
Navigation Structure
WatermelonDB Architecture
Offline Sync Engine
Socket.IO Integration
Firebase Integration
State Management
API Layer
Image Processing
Background Jobs
Error Handling
Security
Performance Optimization

⸻

1. Technical Stack

Core Framework

React Native
TypeScript

Reason:

Single Codebase
Android + iOS
Strong Community

⸻

Navigation

React Navigation

Modules:

Bottom Tabs
Stack Navigation
Deep Linking

⸻

State Management

Zustand

Used For:

Auth State
User State
Permissions
Theme
Network State
Sync State

Not used for:

Large Data Storage
Orders
Products
Visits

Those belong to WatermelonDB.

⸻

Server Data

TanStack Query

Used For:

API Fetching
Caching
Revalidation
Background Refresh

⸻

Forms

React Hook Form

Validation:

Zod

⸻

Local Database

WatermelonDB

Reason:

Offline First
Large Dataset Support
Fast Queries
Reliable Sync

⸻

Real Time Updates

Socket.IO

Used For:

Live Orders
Live Notifications
Approval Updates
Dashboard Updates

⸻

Push Notifications

Firebase Cloud Messaging

Used For:

Order Notifications
Approval Notifications
Backorder Alerts
System Notifications

⸻

2. Application Architecture

Architecture Style:

Feature Based Modular Architecture

Structure:

UI Layer
↓
Application Layer
↓
Domain Layer
↓
Data Layer

⸻

3. Folder Structure

src/
├── app/
│
├── navigation/
│
├── modules/
│
├── components/
│
├── services/
│
├── database/
│
├── sockets/
│
├── notifications/
│
├── store/
│
├── hooks/
│
├── constants/
│
├── theme/
│
├── utils/
│
├── types/
│
└── assets/

⸻

4. Modules Structure

Example:

modules/
salesman/
distributor/
manufacturer/
auth/
orders/
visits/
shops/
products/
inventory/
analytics/
notifications/
profile/

⸻

Each Module Contains:

screens/
components/
hooks/
services/
types/
validators/

⸻

5. Navigation Architecture

Root Navigator

Splash
↓
Auth Check
↓
Role Check
↓
Role Navigator

⸻

Auth Navigator

Login
Register
Forgot Password

⸻

Pending Approval Navigator

Home
Catalogues
Manufacturers
Profile

⸻

Salesman Navigator

Home
Visits
Orders
Shops
Profile

⸻

Distributor Navigator

Home
Orders
Inventory
Team
Profile

⸻

Manufacturer Navigator

Home
Orders
People
Analytics
Profile

⸻

6. WatermelonDB Architecture

Purpose:

Offline First Support

⸻

Local Collections

users
products
shops
visits
orders
order_items
locations
notifications
sync_queue

⸻

Orders Collection

Stores:

Pending Orders
Synced Orders
Failed Orders

⸻

Shops Collection

Stores:

Shop Data
Verification Photo Reference
Sync Status

⸻

Visits Collection

Stores:

Visit Start
Visit End
No Order Reasons

⸻

Sync Queue Collection

Stores:

Pending Actions
Retry Count
Status

⸻

7. Offline Sync Engine

Purpose:

Synchronize WatermelonDB with Backend

⸻

Sync States

Pending
Synced
Failed
Conflict

⸻

Offline Flow

User Creates Order
↓
Saved In WatermelonDB
↓
Status = Pending
↓
Network Available
↓
Sync Engine Starts
↓
Backend Sync
↓
Status = Synced

⸻

Conflict Handling

Examples:

Product Deactivated
User Disabled
Distributor Suspended

Status:

Conflict

User Can:

Review
Retry
Discard

⸻

Sync Scheduler

Runs:

App Launch
Internet Restored
Manual Sync
Periodic Background Sync

⸻

8. Image Upload Architecture

All Images Must Be Compressed.

Mandatory For:

Shop Verification Photos
Product Images
Profile Photos

⸻

Image Pipeline

Capture Image
↓
Compress
↓
Resize
↓
Store Locally
↓
Upload
↓
Mark Synced

⸻

Compression Rules

Target:

Max Width: 1280px
JPEG Quality:
70%-80%

⸻

Upload Queue

Images Are Uploaded Through:

Background Upload Queue

Benefits:

Does Not Block User
Works Offline
Retry Support

⸻

9. Socket.IO Architecture

Purpose:

Real Time Updates

⸻

Events Received

Salesman:

Order Updated
Order Delivered
Approval Status Changed

Distributor:

New Order
Order Edited
Backorder Created

Manufacturer:

Approval Request
Order Updates
Backorder Alert

⸻

Socket Connection Lifecycle

Login
↓
Connect Socket
↓
Join Role Rooms
↓
Listen Events

⸻

Disconnect

Logout
App Closed
Token Expired

⸻

10. Firebase Architecture

Purpose:

Push Notifications

⸻

Notification Categories

Orders
Approvals
Backorders
Inventory
System

⸻

Notification Action

Example:

New Order Notification
↓
Tap Notification
↓
Open Order Detail Screen

⸻

11. API Layer

Structure:

services/
auth.service.ts
orders.service.ts
visits.service.ts
shops.service.ts
products.service.ts
inventory.service.ts

⸻

Responsibilities:

HTTP Calls
Error Mapping
Request Formatting
Response Mapping

⸻

12. Authentication Architecture

Tokens:

Access Token
Refresh Token

Stored Securely:

Encrypted Secure Storage

Never:

AsyncStorage
Plain Text Storage

⸻

13. Network Layer

Monitor:

Online
Offline
Weak Connection

⸻

Banner:

You are offline.
Changes will sync automatically.

⸻

14. State Management Architecture

Zustand Stores:

authStore
userStore
permissionStore
networkStore
syncStore
notificationStore

⸻

WatermelonDB Handles:

Orders
Visits
Shops
Products

⸻

15. Error Handling

API Errors

Examples:

Unauthorized
Network Error
Validation Error
Server Error

Mapped To:

User Friendly Messages

⸻

Sync Errors

Display:

Order Sync Failed
Tap To Retry

⸻

Upload Errors

Display:

Photo Upload Failed
Retry Upload

⸻

16. Loading States

Use:

Skeleton Loaders

Instead of:

Large Spinners

⸻

Examples:

Orders Loading
Products Loading
Dashboard Loading

⸻

17. Performance Optimization

Use:

FlatList
SectionList
Pagination
Lazy Loading

⸻

Avoid:

Large Scroll Views
Massive Memory Usage

⸻

Product Catalogue

Load:

Paginated
Searchable
Cached

⸻

18. Security

Role Validation:

Backend
AND
Frontend

⸻

Permissions:

Hide Unauthorized Screens
Hide Unauthorized Actions

⸻

Data Protection

Use:

HTTPS
Secure Token Storage
Encrypted Local Data

⸻

19. Analytics Tracking

Track:

Login
Check In
Check Out
Visit Started
Visit Completed
Order Created
Order Edited
Shop Created

⸻

Purpose:

Usage Analytics
Performance Monitoring
Bug Investigation

⸻

20. Crash Monitoring

Recommended:

Firebase Crashlytics

Tracks:

App Crashes
JS Exceptions
Native Crashes

⸻

21. Build Environments

Environments:

Development
Staging
Production

Each Environment Has:

Different API URLs
Different Firebase Config
Different Socket URLs

⸻

22. CI/CD Recommendations

Recommended:

GitHub Actions

Pipeline:

Lint
Tests
Build
Deploy

⸻

23. Important Technical Rules

Rule 1

Every Order Must Belong To A Visit

Rule 2

Offline Support Is Mandatory

Rule 3

WatermelonDB Is Source Of Local Truth

Rule 4

Backend Is Source Of Global Truth

Rule 5

All Images Must Be Compressed

Rule 6

Uploads Must Use Background Queue

Rule 7

Socket.IO For Live Updates

Rule 8

Firebase For Push Notifications

Rule 9

Salesmen Cannot See Inventory Quantities

Rule 10

Sync Must Be Idempotent

⸻

24. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
06_Design_System_And_QA.md
