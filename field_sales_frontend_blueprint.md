# Field Sales Application - Frontend UI/UX Blueprint

## 1. Product Overview

This application is a fully mobile/app-based field sales platform. There will be no separate web dashboard. A single mobile application will support multiple user roles and show different experiences based on the logged-in user's role.

The application supports:

- Manufacturers
- Distributors
- Salesmen

The goal of the frontend is to make daily field operations simple for salesmen, operational control easy for distributors, and business visibility clear for manufacturers.

---

## 2. Core UI Decision

### Single Application With Role-Based Access

Instead of building separate apps for each user type, the system will use one mobile application.

After login, the backend returns the user's role and permissions. Based on that role, the app loads the correct navigation, screens, actions, and dashboard data.

Supported roles:

```txt
MANUFACTURER
DISTRIBUTOR
SALESMAN
```

Benefits:

- One mobile application
- Easier maintenance
- One release cycle
- Consistent design language
- Easier future expansion
- Centralized authentication and user management

---

## 3. Global Navigation Structure

The application will use bottom navigation with 5 tabs.

This is preferred over a hamburger menu because the app will be used frequently in the field, and users should reach important actions quickly.

Each role gets a different bottom navigation structure.

---

# 4. Salesman App Experience

The salesman app is the most important part of the product because it will be used daily in the field.

The experience should be:

- Fast
- Simple
- Offline-friendly
- Big-button driven
- Low text
- Easy to use in sunlight
- Designed for quick actions

---

## 4.1 Salesman Bottom Navigation

```txt
Home
Visits
Orders
Shops
Profile
```

---

## 4.2 Salesman Home Screen

The Home screen should act as the salesman's daily command center.

### Before Check-In

Main CTA:

```txt
[ Check In ]
```

Supporting cards:

```txt
Today's Planned/Recent Visits
Pending Sync
Recent Orders
Assigned Distributor
Location Permission Status
```

### After Check-In

Main status section:

```txt
Checked In
Working Since: 09:05 AM
Location Tracking Active
```

Quick action buttons:

```txt
+ Start Visit
+ Create Order
+ Add Shop
```

Summary cards:

```txt
Today's Visits
Today's Orders
Pending Sync
No-Order Visits
```

### Important UX Rules

- Check-In should be highly visible.
- If location permission is disabled, show a blocking warning.
- If the device is offline, show an offline banner.
- Pending sync count should always be visible.
- Salesman should not need to navigate deeply for core actions.

---

## 4.3 Salesman Visit Flow

Shop Visit Management is a core module.

### Visit Flow

```txt
Check In
↓
Start Visit
↓
Select Existing Shop OR Create New Shop
↓
Capture Start Location
↓
Visit Started
↓
Create Order OR Mark No Order
↓
Capture End Location
↓
End Visit
```

---

## 4.4 Start Visit Screen

The salesman can start a visit from:

- Home quick action
- Visits tab
- Shop detail screen

### Screen Elements

```txt
Search Shop
Nearby Shops
Recently Visited Shops
Create New Shop
```

When a shop is selected:

```txt
Shop Name
Address
Phone Number
Distance from Current Location
Last Visit Date
Last Order Date
```

CTA:

```txt
[ Start Visit ]
```

---

## 4.5 Active Visit Screen

Once a visit starts, the salesman should see a focused screen.

### Screen Content

```txt
Shop Name
Visit Timer
Current Location Status
Last Order Summary
```

Primary actions:

```txt
[ Create Order ]
[ Mark No Order ]
[ End Visit ]
```

Rules:

- Visit cannot end without either an order or no-order reason.
- Location should be captured at visit start and visit end.
- If offline, the visit should still be saved locally.

---

## 4.6 No-Order Flow

If no order is placed, reason is mandatory.

### No-Order Reasons

```txt
Shop Closed
Owner Unavailable
No Stock Requirement
Price Issue
Already Purchased
Competitor Product Available
Follow-Up Needed
Other
```

If `Other` is selected, a text note should be required.

CTA:

```txt
[ Save No-Order Visit ]
```

---

## 4.7 Salesman Orders Screen

The Orders tab shows only orders created by the salesman.

### Filters

```txt
All
Created
Confirmed
Backordered
Processing
Dispatched
Delivered
Cancelled
```

### Order Card

```txt
Order Number
Shop Name
Distributor Name
Order Amount
Status
Created Date
Sync Status
```

Actions:

```txt
View Details
Edit Order
Cancel Order
```

Important rule:

Salesman can edit/cancel orders at any point, but every action must be logged.

If order is already packed, dispatched, or delivered, distributor receives a notification after edit.

---

## 4.8 Create Order Flow

The order flow should be quick and mobile-friendly.

### Flow

```txt
Select Shop
↓
Select Products
↓
Enter Quantities
↓
Review Order
↓
Place Order
```

### Product Selection UI

Products should be displayed with:

```txt
Product Name
SKU
Price
Available Stock
Backorder Allowed Indicator
Quantity Stepper
```

Search and category filters should be available.

### Review Screen

```txt
Shop Details
Selected Products
Total Quantity
Total Amount
Available Quantity
Backorder Quantity
```

CTA:

```txt
[ Place Order ]
```

Offline behavior:

- Order should be stored locally if there is no network.
- App should show `Pending Sync`.
- Once synced, backend will calculate inventory/backorder status.

---

## 4.9 Salesman Shops Screen

The Shops tab helps the salesman find, create, and revisit shops.

### Screen Features

```txt
Search Shops
Nearby Shops
Recently Visited
Recently Ordered
Add New Shop
```

### Shop Card

```txt
Shop Name
Phone Number
Address
Last Visit
Last Order
Distance
```

Actions:

```txt
Start Visit
Create Order
View History
```

---

## 4.10 Create Shop Flow

A salesman can create a new shop and place an order immediately.

### Required Fields

```txt
Shop Name
Phone Number
Address
Location
```

Optional fields:

```txt
Owner Name
GST Number
Notes
Photo
```

### Duplicate Detection

Before creating a shop, the app should check for possible duplicates using:

```txt
Phone Number
Location
Fuzzy Name Match
```

If possible duplicates are found, show:

```txt
Possible Duplicate Shops Found
```

Actions:

```txt
Use Existing Shop
Create Anyway
```

---

## 4.11 Salesman Profile Screen

Profile should include:

```txt
User Details
Assigned Distributor
Manufacturer Access
Check-In/Check-Out History
App Settings
Offline Data Status
Logout
```

---

# 5. Distributor App Experience

Distributor app is operational. The distributor must be able to process orders, manage inventory, monitor salesmen, and receive notifications.

---

## 5.1 Distributor Bottom Navigation

```txt
Home
Orders
Inventory
Team
Profile
```

---

## 5.2 Distributor Home Screen

The Home screen should highlight operational priorities.

### KPI Cards

```txt
New Orders
Orders Processing
Backorders
Low Stock Products
Today's Sales
Active Salesmen
```

### Activity Sections

```txt
Recent Orders
Recent Notifications
Salesman Activity
Low Stock Alerts
```

Primary actions:

```txt
View Orders
Update Inventory
View Team Location
```

---

## 5.3 Distributor Orders Screen

This is one of the distributor's most-used screens.

### Filters

```txt
New
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
```

### Order Card

```txt
Order Number
Shop Name
Salesman Name
Manufacturer Name
Total Amount
Status
Backorder Indicator
Created Date
```

Actions:

```txt
View
Update Status
Process Order
```

---

## 5.4 Distributor Order Detail Screen

### Header

```txt
Order Number
Order Status
Shop Name
Salesman Name
Manufacturer Name
Created Date
Last Updated
```

### Order Items

Each item should show:

```txt
Product Name
Ordered Quantity
Reserved Quantity
Backorder Quantity
Dispatched Quantity
Delivered Quantity
Item Status
```

### Status Actions

Distributor can move order through fulfillment statuses:

```txt
Confirmed
Processing
Packed
Dispatched
Delivered
Cancelled
```

Inventory reduces on dispatch.

### Revision History

Show all order edits:

```txt
Changed By
Changed At
Old Value
New Value
Reason
Order Status When Edited
```

---

## 5.5 Distributor Inventory Screen

Inventory is maintained per distributor + manufacturer.

A distributor may manage inventory for multiple manufacturers.

### Inventory Grouping

```txt
Manufacturer A
  Product 1
  Product 2

Manufacturer B
  Product 3
  Product 4
```

### Product Inventory Card

```txt
Product Name
SKU
Available Stock
Reserved Stock
Backordered Quantity
Low Stock Indicator
```

Actions:

```txt
View Product
Adjust Inventory
View Stock Movement
```

---

## 5.6 Inventory Adjustment Screen

Distributor can manually update inventory when needed.

### Fields

```txt
Product
Manufacturer
Adjustment Type
Quantity
Reason
Notes
```

Adjustment types:

```txt
Stock Added
Stock Corrected
Stock Removed
Opening Stock
Manual Adjustment
```

Every inventory change must be logged.

---

## 5.7 Distributor Team Screen

The Team tab shows assigned salesmen and their activity.

### Team List

```txt
Salesman Name
Check-In Status
Current Location Status
Today's Visits
Today's Orders
Last Active Time
```

Actions:

```txt
View Profile
View Location
View Orders
View Visits
```

---

## 5.8 Salesman Location Detail

Distributor can view location only during working hours after salesman check-in.

### Screen Content

```txt
Current Location
Last Updated Time
Today's Route
Visited Shops
Orders Created Today
Check-In Time
```

Map should show:

```txt
Current Location Marker
Visited Shop Markers
Route Path
```

---

## 5.9 Distributor Notifications

Only distributors receive notifications.

Notification examples:

```txt
New Order Received
Order Edited After Dispatch
Order Edited After Delivery
New Shop Created
Inventory Low
Backorder Created
Salesman Checked In
Salesman Checked Out
Offline Order Synced
```

Notifications should be grouped by type and priority.

---

# 6. Manufacturer App Experience

Manufacturer app is focused on visibility, approvals, performance, and analytics.

---

## 6.1 Manufacturer Bottom Navigation

```txt
Home
Orders
People
Analytics
Profile
```

---

## 6.2 Manufacturer Home Screen

The manufacturer Home screen should be an executive summary.

### KPI Cards

```txt
Sales Today
Orders Today
Active Distributors
Active Salesmen
Shops Visited
Visit Conversion Rate
Backorders
Delayed Deliveries
```

### Sections

```txt
Top Products
Top Distributors
Recent Orders
Recent Activities
Pending Distributor Approvals
```

---

## 6.3 Manufacturer Orders Screen

Manufacturer can view orders but cannot fulfill them.

### Filters

```txt
All
By Distributor
By Salesman
By Shop
By Product
By Status
By Date Range
```

### Order Card

```txt
Order Number
Shop Name
Distributor Name
Salesman Name
Amount
Status
Created Date
```

Actions:

```txt
View Details
View Timeline
View Revision Logs
```

---

## 6.4 Manufacturer People Screen

This screen manages and views distributors and salesmen.

### Sections

```txt
Distributors
Salesmen
Approval Requests
```

Distributor card:

```txt
Distributor Name
Region
Active Salesmen
Sales This Month
Pending Orders
Backorders
Status
```

Salesman card:

```txt
Salesman Name
Distributor Name
Today's Visits
Today's Orders
Current Working Status
Last Active Time
```

---

## 6.5 Distributor Approval Flow

Manufacturer invites or creates a distributor.

Flow:

```txt
Manufacturer Creates Distributor Invite
↓
Distributor Receives Access / Completes Signup
↓
Manufacturer Approves Distributor
↓
Distributor Becomes Active
```

Approval screen should show:

```txt
Distributor Name
Contact Details
Region
Requested Manufacturer Access
Submitted Date
```

Actions:

```txt
Approve
Reject
```

---

## 6.6 Manufacturer Analytics Screen

Manufacturer wants broad analytics across every possible business angle.

The analytics screen should be layered, not overloaded.

### Analytics Structure

```txt
Overview
Sales
Orders
Products
Distributors
Salesmen
Shops
Visits
Inventory
Backorders
Delivery
Location Activity
```

### Overview KPIs

```txt
Total Sales
Total Orders
Average Order Value
Visit-to-Order Conversion
Active Shops
Active Salesmen
Backorder Rate
Delivery Completion Rate
```

### Sales Analytics

```txt
Sales by Date
Sales by Distributor
Sales by Salesman
Sales by Product
Sales by Shop
Sales by Region
```

### Visit Analytics

```txt
Total Visits
Productive Visits
No-Order Visits
Visit Conversion Rate
No-Order Reason Breakdown
Average Visit Duration
```

### Distributor Analytics

```txt
Distributor-wise Sales
Distributor-wise Orders
Fulfillment Time
Backorder Rate
Low Stock Frequency
Delayed Deliveries
```

### Salesman Analytics

```txt
Salesman-wise Orders
Salesman-wise Visits
Productive Visit Ratio
Working Hours
Distance Travelled
Orders Per Visit
```

### Shop Analytics

```txt
Top Shops
Inactive Shops
New Shops Added
Shop Visit History
Shop Order History
Shop-wise Sales
```

### Inventory & Backorder Analytics

```txt
Available Stock by Distributor
Reserved Stock
Backorder Quantity
Low Stock Products
Stock Movement
Products Frequently Backordered
```

### Delivery Analytics

```txt
Delivered Orders
Pending Dispatch
Delayed Orders
Average Dispatch Time
Average Delivery Time
Partially Delivered Orders
```

---

## 6.7 Manufacturer Profile Screen

Profile should include:

```txt
Company Details
User Details
Product Management
Distributor Management
App Settings
Logout
```

Manufacturer can create and manage products from this section or from a dedicated Product area inside Profile/More.

---

# 7. Shared App Screens

These screens/components are shared across roles.

---

## 7.1 Login Screen

### Fields

```txt
Phone/Email
Password
```

Actions:

```txt
Login
Forgot Password
```

After login:

```txt
Role detected
Permissions loaded
Correct bottom navigation rendered
```

---

## 7.2 Offline Mode UI

Offline support is critical for salesmen.

### Global Offline Banner

```txt
You are offline. Data will sync when internet is available.
```

### Pending Sync Indicator

Should show count of unsynced records:

```txt
3 orders pending sync
2 visits pending sync
15 location logs pending sync
```

### Sync Status Labels

```txt
Synced
Pending Sync
Sync Failed
Conflict
```

---

## 7.3 Sync Center

Available mainly for salesmen but useful for debugging/support.

### Screen Content

```txt
Pending Orders
Pending Visits
Pending Shops
Pending Location Logs
Last Sync Time
Retry Failed Sync
```

CTA:

```txt
[ Sync Now ]
```

---

## 7.4 Audit Log UI

Logs should be visible where relevant.

Examples:

- Order detail
- Inventory detail
- Shop detail
- User profile
- Distributor approval

Audit log item:

```txt
Action
Changed By
Changed At
Old Value
New Value
Reason
Device/Source
```

---

# 8. Styling System

The app should feel modern, clean, professional, and fast.

It should not look like old ERP software.

Design inspiration:

```txt
Linear
Stripe
Notion
Modern fintech dashboards
```

Avoid:

```txt
Old ERP look
Too many borders
Crowded tables
Heavy gradients
Overuse of bright colors
```

---

## 8.1 Color Palette

### Primary

```txt
Deep Slate: #0F172A
```

Used for:

- Main text
- Headers
- Important UI elements

### Accent

```txt
Blue: #2563EB
```

Used for:

- Primary buttons
- Active tab
- Links
- Important CTAs

### Success

```txt
Green: #16A34A
```

Used for:

- Delivered
- Synced
- Active
- Success messages

### Warning

```txt
Amber: #F59E0B
```

Used for:

- Backorders
- Low inventory
- Pending sync
- Attention states

### Error

```txt
Red: #DC2626
```

Used for:

- Cancelled
- Failed sync
- Critical warnings

### Background

```txt
Light Gray: #F8FAFC
```

Used for app background.

### Card Background

```txt
White: #FFFFFF
```

---

## 8.2 Typography

Recommended fonts:

```txt
Inter
Roboto
SF Pro
```

Typography rules:

```txt
Large headers for screen titles
Medium-weight labels
Readable body text
Avoid tiny text in field screens
```

Recommended sizes:

```txt
Screen Title: 22-26px
Section Title: 16-18px
Body Text: 14-16px
Small Metadata: 12-13px
Button Text: 15-16px
```

---

## 8.3 Spacing

Use generous spacing.

Recommended system:

```txt
4px
8px
12px
16px
24px
32px
```

Cards should have:

```txt
16px padding
12-16px border radius
8-16px gap between cards
```

---

## 8.4 Components

### Cards

Use cards for:

```txt
KPI summaries
Orders
Shops
Salesmen
Products
Inventory
Notifications
```

Card style:

```txt
White background
Rounded corners
Soft shadow or subtle border
Clear title
Status badge
Primary action
```

---

### Buttons

Button types:

```txt
Primary
Secondary
Danger
Ghost
Icon Button
```

Primary buttons should be full-width in important mobile flows.

Examples:

```txt
[ Check In ]
[ Start Visit ]
[ Place Order ]
[ Dispatch Order ]
```

---

### Status Badges

Use badges for all order and sync states.

Examples:

```txt
Created
Confirmed
Backordered
Processing
Packed
Dispatched
Delivered
Cancelled
Pending Sync
Synced
Failed
```

---

### Forms

Forms should be simple and step-based.

Rules:

```txt
Avoid long forms on one screen
Use required field indicators
Use clear validation messages
Allow offline saving where applicable
```

---

### Charts

Use simple mobile-friendly charts.

Recommended chart types:

```txt
Line Chart
Bar Chart
Donut Chart
Ranking List
KPI Cards
```

Avoid complex charts on small screens.

---

# 9. Role-Based UX Principles

## 9.1 Salesman UX Principle

```txt
Make daily work fast.
```

Salesman should never feel like they are filling enterprise software.

Prioritize:

```txt
Check-In
Start Visit
Create Order
Mark No Order
Sync Status
```

---

## 9.2 Distributor UX Principle

```txt
Make operations controllable.
```

Distributor should immediately know:

```txt
What needs action?
Which orders are pending?
Which products are low stock?
Which salesmen are active?
```

---

## 9.3 Manufacturer UX Principle

```txt
Make business performance visible.
```

Manufacturer should get:

```txt
High-level summary
Drill-down analytics
People performance
Shop and distributor performance
Order and delivery visibility
```

---

# 10. Important Mobile UX Rules

## 10.1 App Should Be Fast

- Minimize loading screens.
- Cache key data locally.
- Use skeleton loaders.
- Keep forms short.
- Avoid unnecessary confirmation popups.

## 10.2 App Should Be Offline-Aware

- Salesman can create visits, shops, and orders offline.
- App clearly shows pending sync.
- Failed sync should be retryable.
- Location logs should sync later.

## 10.3 App Should Be Field-Friendly

- Large touch targets.
- High contrast.
- Minimal typing.
- Search should be fast.
- Quantity selection should be easy.
- Important actions should be reachable within 1-2 taps.

## 10.4 App Should Be Transparent

Every important action should have visible history.

Examples:

```txt
Order edited
Inventory adjusted
Status updated
Shop created
Distributor approved
Visit completed
```

---

# 11. Screen List Summary

## Salesman Screens

```txt
Login
Home
Check-In/Check-Out
Visits List
Start Visit
Active Visit
No-Order Reason
Create Order
Edit Order
Order Details
Shops List
Create Shop
Shop Detail
Sync Center
Profile
```

## Distributor Screens

```txt
Login
Home
Orders List
Order Details
Update Order Status
Inventory List
Inventory Detail
Inventory Adjustment
Team List
Salesman Detail
Salesman Location
Notifications
Profile
```

## Manufacturer Screens

```txt
Login
Home
Orders List
Order Details
People
Distributor List
Distributor Detail
Salesman List
Salesman Detail
Distributor Approval
Analytics
Product Management
Profile
```

---

# 12. Suggested Frontend Tech Stack

Recommended options:

## Option 1: React Native

Good for:

- Cross-platform app
- Fast development
- Large ecosystem
- Offline storage support

Suggested stack:

```txt
React Native
TypeScript
React Navigation
TanStack Query
Zustand or Redux Toolkit
SQLite/WatermelonDB/Realm
React Hook Form
Zod/Yup validation
Mapbox or Google Maps SDK
Firebase Cloud Messaging
```

## Option 2: Flutter

Good for:

- Excellent UI consistency
- Strong performance
- Great mobile experience
- Strong offline support

Suggested stack:

```txt
Flutter
Dart
Riverpod or Bloc
GoRouter
Hive/Isar/SQLite
Dio
Google Maps/Mapbox
Firebase Cloud Messaging
```

Either option works well. If the team is stronger in JavaScript/TypeScript, use React Native. If the priority is polished mobile UI and consistent performance, Flutter is also a strong choice.

---

# 13. Recommended MVP Frontend Scope

## Salesman MVP

```txt
Login
Check-In/Check-Out
Location Tracking Indicator
Create Shop
Duplicate Shop Warning
Start Visit
Create Order
Mark No Order
Offline Save
Sync Pending Data
View Own Orders
Edit/Cancel Order
```

## Distributor MVP

```txt
Login
Home Summary
Orders List
Order Detail
Update Order Status
Inventory List
Inventory Adjustment
Notifications
Team Activity
```

## Manufacturer MVP

```txt
Login
Home Summary
Orders View
Distributor View
Salesman View
Distributor Approval
Product Management
Basic Analytics
```

---

# 14. Future UI Enhancements

These can be added after MVP:

```txt
Advanced Analytics
Route Replay
Heatmaps
Shop Performance Timeline
Voice Notes
Shop Photos
Barcode Product Search
Bulk Inventory Upload
Smart Duplicate Shop Merge
Push Notification Preferences
Dark Mode
Multi-language Support
```

---

# 15. Final UI Direction

The app should feel like a modern field-sales operating system.

The frontend should be designed around three clear experiences:

```txt
Salesman = Fast field actions
Distributor = Operational control
Manufacturer = Business visibility
```

The most important design priorities are:

```txt
Speed
Clarity
Offline support
Role-based simplicity
Clean analytics
Complete action history
```

