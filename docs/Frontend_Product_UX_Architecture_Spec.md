# Field Sales Platform - Frontend Product, UX & React Native Architecture Specification

## Purpose

This document serves as:
- Product Specification
- UX Specification
- UI Specification
- React Native Architecture Specification
- Navigation Specification
- Offline Sync Specification

Audience:
- Business Owners
- Product Managers
- UI/UX Designers
- React Native Developers
- Backend Developers
- QA Engineers

---

# Product Philosophy

Primary User: Salesman

The application is designed around visits, not orders.

Flow:

Check In
→ Start Visit
→ Create Shop (if needed)
→ Create Order OR No Order
→ End Visit
→ Check Out

---

# Roles

## Pending Approval User

Can:
- Login
- View Catalogues
- View Manufacturers
- Complete Profile

Cannot:
- Create Orders
- Create Shops
- Check In
- Start Visits
- Manage Inventory

## Salesman

Primary field user.

## Distributor

Operational user.

## Manufacturer

Management and analytics user.

---

# Technology Stack

- React Native
- TypeScript
- WatermelonDB
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Socket.IO
- Firebase Cloud Messaging
- React Navigation

---

# Offline Architecture

WatermelonDB stores:

- Shops
- Visits
- Orders
- Order Edits
- Location Logs
- Sync Queue

All images should be automatically compressed before upload.

Recommended:
- Compress to web/mobile optimized format
- Resize large images
- Upload background queue

---

# Navigation Architecture

## Auth Navigator

- Splash
- Login
- Register
- Forgot Password

## Pending Approval Navigator

- Home
- Catalogues
- Manufacturers
- Profile

## Salesman Navigator

- Home
- Visits
- Orders
- Shops
- Profile

## Distributor Navigator

- Home
- Orders
- Inventory
- Team
- Profile

## Manufacturer Navigator

- Home
- Orders
- People
- Analytics
- Profile

---

# Salesman Experience

## Home Screen

Before Check-In:

Buttons:
- Check In

Cards:
- Pending Sync
- Today's Orders
- Today's Visits

After Check-In:

Buttons:
- Start Visit
- Create Order
- Add Shop

Status:
- Checked In
- Location Tracking Active

---

## Start Visit Screen

Fields:

Search Shop

Sections:

- Nearby Shops
- Recently Visited
- Recently Ordered

Buttons:

- Start Visit
- Add New Shop

---

## Active Visit Screen

Displays:

- Shop Name
- Visit Timer

Actions:

- Create Order
- Mark No Order
- End Visit

User cannot end visit until:
- Order created
OR
- No-order reason selected

---

## Create Shop Screen

Step 1

Fields:

- Shop Name *
- Phone Number *

Duplicate check runs automatically.

Step 2

Fields:

- Owner Name
- Address *
- GPS Location *

Step 3

Mandatory:

Visiting Card / Shop Verification Photo *

Label:

"Upload Visiting Card or Shop Verification Photo"

Buttons:

- Capture Photo
- Select From Gallery

Image is automatically compressed.

Cannot create shop without image.

---

## Create Order Screen

Step 1

Select Shop

Step 2

Product Catalogue

Displays:

- Product Image
- Product Name
- Manufacturer Name
- MRP

Salesman CANNOT see inventory quantities.

Step 3

Cart

Item Discount Options:

- Amount
- Percentage

Bill Discount Options:

- Amount
- Percentage

Step 4

Review

Displays:

- Gross Amount
- Discount
- Final Amount

Button:

Place Order

---

# Distributor Experience

## Home

Displays:

- New Orders
- Backorders
- Low Stock
- Active Salesmen

Priority Queue:

Orders Requiring Action

---

## Inventory

Manufacturer Grouped View

Actions:

- Adjust Inventory
- View Movements

Distributor-created products:

Visible only to that distributor and their salesmen.

Manufacturer can view them.

---

## Orders

Actions:

- Confirm
- Process
- Pack
- Dispatch
- Deliver

---

# Manufacturer Experience

## Home

KPIs:

- Sales
- Orders
- Backorders
- Active Distributors
- Active Salesmen

---

## People

Tabs:

- Distributor Requests
- Salesman Requests
- Approved Distributors
- Approved Salesmen

Actions:

- Approve
- Reject
- Suspend

---

# Product Rules

Manufacturer Products:

- Controlled by Manufacturer
- Distributor cannot edit MRP

Distributor Products:

- Controlled by Distributor
- Visible only within distributor ecosystem
- Manufacturer can view

---

# Notification Rules

Firebase Push Notifications:

- New Order
- Order Edited
- Order Cancelled
- Backorder Created
- Approval Request
- Approval Status Changed

Socket.IO:

- Live Order Updates
- Live Dashboard Updates
- Live Notifications

---

# UX Principles

- Maximum 2-3 taps for common actions
- Large touch targets
- Minimal typing
- Offline-first
- Search-first design
- Visit-centric workflow
- High visibility of pending sync status

---

# Future Detailed Sections

The next iteration should expand:
- Every screen wireframe
- Every API integration
- Component library
- Design tokens
- State management flows
- WatermelonDB schema
- Sync conflict handling
- QA test cases

================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

01_Product_Vision_And_User_Journeys.md

Field Sales Platform

Product Vision, User Journeys & Navigation Architecture

Version: 1.0

Status: Approved Foundation Specification

⸻

1. Document Purpose

This document defines:

* Product vision
* Business goals
* User personas
* User roles
* User journeys
* Registration flow
* Approval flow
* Navigation architecture
* Global application behavior
* Offline behavior
* Image upload standards
* Notification behavior

This document should be understood by:

* Founders
* Product Managers
* UI/UX Designers
* React Native Developers
* Backend Developers
* QA Engineers

⸻

2. Product Vision

The goal of the platform is to create a complete field sales operating system where:

* Manufacturers manage products and business visibility.
* Distributors manage inventory and order fulfillment.
* Salesmen perform field sales activities.
* Shops are managed and visited systematically.
* Orders are tracked end-to-end.
* Every activity is traceable.
* Offline operation is fully supported.

The application must feel modern, fast, mobile-first, and field-friendly.

It should never feel like traditional ERP software.

⸻

3. Core Product Philosophy

Principle 1

Every action must be traceable.

Examples:

* Order created
* Order edited
* Inventory adjusted
* Shop created
* Visit completed

Everything must be auditable.

⸻

Principle 2

Visits are the center of the system.

The application is not order-centric.

The application is visit-centric.

Correct flow:

Check In
↓
Start Visit
↓
Create Order OR No Order
↓
End Visit
↓
Check Out

Every order must belong to a visit.

Orders cannot be created outside a visit.

⸻

Principle 3

Salesmen should sell, not manage inventory.

Salesmen cannot see inventory quantities.

Reason:

* Backorders are supported.
* Inventory is operational data.
* Salesmen should focus on sales.

⸻

Principle 4

Offline support is mandatory.

The application must continue working without internet.

All critical field activities must function offline.

⸻

Principle 5

Image verification is required.

Every newly created shop must contain:

Visiting Card / Shop Verification Photo

The image must be compressed automatically before upload.

⸻

4. User Personas

Salesman

Primary user.

Goals:

* Visit shops
* Create orders
* Register new shops
* Track daily work
* Complete visits quickly

Environment:

* Field work
* Mobile device
* Sometimes offline
* Bright sunlight
* Limited typing

Design Priority:

Speed

⸻

Distributor

Operational user.

Goals:

* Manage inventory
* Manage products
* Fulfill orders
* Track salesmen
* Monitor daily operations

Design Priority:

Control

⸻

Manufacturer

Management user.

Goals:

* Manage products
* Approve distributors
* Approve salesmen
* Monitor business performance
* Monitor sales trends

Design Priority:

Visibility

⸻

5. User Roles

Pending Approval User

Distributor

Status:

Pending Approval

Can:

* Login
* View catalogues
* View manufacturers
* Complete profile

Cannot:

* Manage inventory
* Process orders
* Add products
* Add salesmen

⸻

Salesman

Status:

Pending Approval

Can:

* Login
* View catalogues
* View manufacturers
* Complete profile

Cannot:

* Check In
* Start visits
* Create shops
* Create orders

⸻

Approved Salesman

Can:

* Check In
* Check Out
* Start visits
* Create shops
* Create orders
* Edit orders
* Cancel orders

⸻

Approved Distributor

Can:

* Manage inventory
* Create distributor products
* Manage salesmen
* Fulfill orders
* Track operations

⸻

Manufacturer

Can:

* Create products
* Approve distributors
* Approve salesmen
* View analytics
* Monitor ecosystem

⸻

6. Registration Journey

Distributor Registration

Screen 1

Fields:

Business Name *
Owner Name *
Phone Number *
Email *
Password *

Button:

Continue

⸻

Screen 2

Fields:

Address *
City *
State *
GST Number

Button:

Continue

⸻

Screen 3

Fields:

Business Documents

Button:

Submit Registration

Result:

Pending Approval

⸻

Salesman Registration

Screen 1

Fields:

Full Name *
Phone Number *
Email *
Password *

⸻

Screen 2

Field:

Select Distributor *

Search Distributor

⸻

Button:

Submit Registration

Result:

Pending Approval

⸻

7. Approval Journey

Distributor Approval

Flow:

Distributor Registers
↓
Pending Approval
↓
Manufacturer/Admin Reviews
↓
Approve or Reject

If approved:

Distributor becomes active.

⸻

Salesman Approval

Flow:

Salesman Registers
↓
Pending Approval
↓
Manufacturer/Admin Reviews
↓
Approve or Reject

If approved:

Salesman becomes active.

⸻

8. Pending Approval User Experience

Bottom Navigation:

Home
Catalogues
Manufacturers
Profile

⸻

Home Screen

Banner:

Your account is currently under review.
You can browse catalogues while approval is pending.

⸻

Catalogue Screen

Displays:

Product Image
Product Name
Manufacturer
MRP

No ordering actions available.

⸻

9. Salesman User Journey

Daily Flow:

Login
↓
Check In
↓
Start Visit
↓
Create Order OR No Order
↓
End Visit
↓
Repeat
↓
Check Out

⸻

Shop Creation Flow:

Start Visit
↓
Create Shop
↓
Duplicate Check
↓
Capture Verification Photo
↓
Save Shop
↓
Continue Visit

⸻

Order Flow:

Start Visit
↓
Select Products
↓
Apply Discounts
↓
Review
↓
Place Order
↓
End Visit

⸻

10. Distributor User Journey

Daily Flow:

Login
↓
Review New Orders
↓
Confirm Orders
↓
Process Orders
↓
Pack Orders
↓
Dispatch Orders
↓
Deliver Orders

⸻

Inventory Flow:

Open Inventory
↓
Select Product
↓
Adjust Inventory
↓
Save

All inventory movements are logged.

⸻

11. Manufacturer User Journey

Daily Flow:

Login
↓
Review Approvals
↓
Approve Requests
↓
Review Orders
↓
Monitor Analytics
↓
Review Product Performance

⸻

12. Navigation Architecture

Root Navigator

Decision Tree:

Launch App
↓
Logged In?

No:

Auth Navigator

Yes:

Check Role

⸻

Auth Navigator

Screens:

Splash
Login
Register
Forgot Password

⸻

Pending Approval Navigator

Tabs:

Home
Catalogues
Manufacturers
Profile

⸻

Salesman Navigator

Tabs:

Home
Visits
Orders
Shops
Profile

⸻

Distributor Navigator

Tabs:

Home
Orders
Inventory
Team
Profile

⸻

Manufacturer Navigator

Tabs:

Home
Orders
People
Analytics
Profile

⸻

13. Notification Navigation

Push Notification Examples:

New Order
Approval Granted
Approval Rejected
Order Edited
Order Cancelled
Backorder Created

Clicking notification:

Notification
↓
Relevant Screen Opens

Examples:

New Order
→ Order Detail
Approval Granted
→ Dashboard
Order Edited
→ Order Revision Screen

⸻

14. Offline Behaviour

The application must function offline.

Supported Offline Actions:

Create Shop
Create Visit
Create Order
Edit Order
Capture Location
Capture Verification Photo

⸻

Offline Banner:

You are offline.
Data will sync automatically when internet is available.

⸻

Pending Sync Indicator:

3 Orders Pending
2 Visits Pending
1 Shop Pending

⸻

15. Image Upload Standards

Mandatory Images:

Shop Verification Photo

Accepted:

Visiting Card
Shop Board
GST Certificate
Business Proof

⸻

Image Capture Options:

Capture Photo
Select From Gallery

⸻

Compression Rules

Every image:

Compress before upload
Resize large images
Remove unnecessary metadata

Purpose:

Reduce bandwidth
Improve sync speed
Reduce storage costs

⸻

16. Global Application Rules

Rule 1

Every order must belong to a visit.

⸻

Rule 2

Salesmen cannot see inventory quantities.

⸻

Rule 3

Backorders are supported.

⸻

Rule 4

Every new shop requires a verification image.

⸻

Rule 5

Distributor-created products are visible only inside that distributor ecosystem.

Manufacturer can still view those products.

⸻

Rule 6

Manufacturer-created products cannot have MRP changed by distributors.

⸻

Rule 7

All important actions are logged.

⸻

17. Success Metrics

Salesman Metrics:

* Visits per day
* Orders per day
* Visit conversion rate
* Distance travelled

Distributor Metrics:

* Order fulfillment rate
* Backorder rate
* Inventory health

Manufacturer Metrics:

* Sales
* Product performance
* Distributor performance
* Salesman performance

⸻

18. Future Sections

The following documents build on this foundation:

02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md

================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

02_Salesman_Module_Specification.md

Salesman Module Specification

Version: 1.0

Status: Approved

This document defines the complete Salesman experience.

This is the most important module in the platform because Salesmen are the primary daily users.

⸻

1. Module Goals

The Salesman module should allow a user to:

Check In
Start Visits
Create Shops
Create Orders
Record No-Order Visits
Edit Orders
Cancel Orders
Check Out
Work Offline
Sync Data Later

The entire experience should be optimized for:

Speed
Minimal Typing
Offline Usage
Field Operations

⸻

2. Salesman Navigation

Bottom Navigation:

Home
Visits
Orders
Shops
Profile

Rules:

Always visible
Maximum one-tap access
Consistent across the app

⸻

3. Salesman Home Screen

Purpose

Daily command center.

This screen is opened immediately after login.

⸻

3.1 Home Before Check-In

Header:

Good Morning, {Salesman Name}

Status Card:

You are currently not checked in.

Primary CTA:

[ CHECK IN ]

Large blue button.

⸻

Summary Cards:

Today's Visits
Today's Orders
Pending Sync
Assigned Distributor

⸻

System Status Section:

Location Permission
Internet Status
Sync Status

Examples:

Location Enabled
Online
All Data Synced

or

Location Disabled
Offline
3 Records Pending Sync

⸻

Check In Flow

User presses:

CHECK IN

System checks:

Location Permission
GPS Availability

If permission missing:

Show:

Location permission is required to start your working day.

Buttons:

Enable Location
Cancel

⸻

If successful:

Create Working Day
Capture GPS Location
Start Location Tracking

Redirect:

Salesman Home (Checked In State)

⸻

3.2 Home After Check-In

Header:

Good Morning, {Salesman Name}

Working Day Card:

Checked In
Started At:
09:02 AM
Location Tracking Active

⸻

Quick Actions

Large buttons:

Start Visit
Add Shop

Note:

Create Order button removed.

Reason:

Orders can only be created inside visits.

⸻

Daily Statistics

Cards:

Today's Visits
Today's Orders
No-Order Visits
Pending Sync

⸻

4. Visit Management

Visits are the core entity of the application.

Every order must belong to a visit.

⸻

Visit Lifecycle

Check In
↓
Start Visit
↓
Create Order
OR
No Order
↓
End Visit
↓
Next Visit
↓
Check Out

⸻

5. Visits Screen

Purpose:

View all visits

Filters:

Today
This Week
This Month
All

Visit Card:

Shop Name
Visit Type
Visit Duration
Visit Date
Visit Status

Status:

Active
Completed

Actions:

View Visit

⸻

6. Start Visit Screen

Purpose:

Select shop and begin visit.

Search Bar:

Search Shop

⸻

Sections:

Nearby Shops
Recently Visited
Recently Ordered

⸻

Shop Card

Displays:

Shop Name
Owner Name
Phone Number
Distance
Last Visit
Last Order

Buttons:

Start Visit

⸻

Bottom CTA:

Add New Shop

⸻

Start Visit Action

System performs:

Capture GPS Location
Create Visit Record
Start Visit Timer

Redirect:

Active Visit Screen

⸻

7. Active Visit Screen

Purpose:

Focused visit execution.

Header:

Shop Name

⸻

Timer:

Visit Duration

Example:

00:12:34

⸻

Shop Information

Displays:

Owner Name
Phone Number
Last Order Date

⸻

Actions

Large Buttons:

Create Order
No Order
End Visit

⸻

Rules:

End Visit not allowed until:
Order Created
OR
No Order Submitted

⸻

8. No Order Flow

User presses:

No Order

⸻

Screen Title:

No Order Reason

Dropdown:

Shop Closed
Owner Unavailable
No Requirement
Price Issue
Already Purchased
Competitor Product
Follow-Up Needed
Other

⸻

If Other:

Show Text Area:

Reason

Mandatory.

⸻

Button:

Save No Order Visit

System:

Mark Visit Non-Productive
Capture GPS

⸻

9. Create Shop Flow

Purpose:

Create new shop.

⸻

Step 1

Fields:

Shop Name *
Phone Number *

Validation:

Required

System:

Duplicate Check Runs Automatically

⸻

Duplicate Warning

Displays:

Possible Duplicate Found

Shows:

Shop Name
Distance
Phone

Buttons:

Use Existing Shop
Create Anyway

⸻

Step 2

Fields:

Owner Name
Address *
GPS Location *

GPS auto-filled.

⸻

Step 3

Mandatory:

Visiting Card / Shop Verification Photo *

Label:

Upload Visiting Card or Shop Verification Photo

Accepted:

Visiting Card
Shop Board
GST Certificate
Business Proof

Buttons:

Capture Photo
Select From Gallery

⸻

Image Processing

Before Upload:

Compress Image
Resize Image
Remove Metadata

Purpose:

Reduce Bandwidth
Improve Sync
Reduce Storage

⸻

Button:

Create Shop

System:

Shop Created
Shop Linked To Distributor
Shop Visible To All Salesmen Under Same Distributor

Redirect:

Return To Active Visit

⸻

10. Create Order Flow

Orders can only be created inside visits.

⸻

Step 1

Current Visit Shop Selected Automatically.

User cannot change shop.

⸻

Step 2

Product Catalogue

Search:

Search Products

Filters:

Category
Manufacturer

⸻

Product Card

Displays:

Image
Product Name
Manufacturer Name
MRP

Does NOT show:

Inventory
Available Stock
Reserved Stock

⸻

Quantity Control

Stepper:

[-] 10 [+]

Avoid keyboard entry.

⸻

Add To Cart

Button:

Add

⸻

Step 3 Cart

Displays:

Selected Products
Quantity
MRP
Line Total

⸻

Product Discount

Options:

None
Amount
Percentage

⸻

Example:

₹20 Off
OR
10% Off

⸻

Bill Discount

Options:

None
Amount
Percentage

Applies to entire order.

⸻

Step 4 Review Order

Displays:

Gross Amount
Product Discounts
Bill Discount
Final Amount

⸻

Button:

Place Order

System:

Create Order
Link To Visit

Redirect:

Order Success

⸻

11. Orders Screen

Purpose:

View all orders.

Filters:

All
Created
Processing
Dispatched
Delivered
Cancelled

Search:

Order Number
Shop Name

⸻

Order Card

Displays:

Order Number
Shop
Amount
Status
Created Date
Sync Status

⸻

Actions:

View Order

⸻

12. Order Detail Screen

Displays:

Order Number
Shop
Products
Discounts
Final Amount

⸻

Timeline:

Created
Processing
Packed
Dispatched
Delivered

⸻

Revision History

Displays:

Edited By
Date
Changes

⸻

Buttons:

Edit Order
Cancel Order

⸻

13. Edit Order

Rules:

Before Dispatch:

Allowed

After Dispatch:

Allowed

But:

Distributor Notification Sent
Audit Log Created
Exception Flag Created

⸻

14. Shops Screen

Purpose:

Manage shops.

Search First Design.

Top:

Search Shops

⸻

Sections:

Nearby
Recently Visited
Recently Ordered

⸻

Shop Card

Displays:

Shop Name
Owner Name
Phone
Distance

⸻

Actions:

View
Start Visit

⸻

15. Shop Detail Screen

Displays:

Shop Information
Last Order
Last Visit

⸻

Tabs:

Orders
Visits

⸻

Actions:

Start Visit

⸻

16. Sync Center

Purpose:

Offline monitoring.

Displays:

Pending Orders
Pending Visits
Pending Shops
Pending Photos

⸻

Buttons:

Sync Now
Retry Failed

⸻

17. Profile Screen

Displays:

Name
Phone
Distributor
Approval Status

⸻

Sections:

Working Day History
Sync Status
Settings

⸻

Actions:

Logout

⸻

18. Check Out Flow

Button:

Check Out

System:

Capture GPS
Stop Location Tracking
Close Working Day

Confirmation:

Working Day Completed

⸻

19. Offline Behaviour

Supported Offline:

Visits
Shops
Orders
Order Edits
Photos
Location Logs

⸻

Sync Status

Possible Values:

Pending
Synced
Failed
Conflict

⸻

20. Success Metrics

Salesman KPIs:

Visits Per Day
Orders Per Day
Productive Visits
No Order Visits
Visit Conversion Rate
Distance Travelled
Working Hours

⸻

21. Important Business Rules

Rule 1

Every Order Must Belong To A Visit

Rule 2

Salesman Cannot See Inventory Quantities

Rule 3

Shop Verification Photo Is Mandatory

Rule 4

Images Must Be Compressed Before Upload

Rule 5

All Actions Must Be Logged

Rule 6

Shops Are Distributor Scoped

Rule 7

Backorders Are Allowed

Rule 8

Orders Can Be Edited After Dispatch
But Must Create Audit Trails

================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

03_Distributor_Module_Specification.md

Distributor Module Specification

Version: 1.0

Status: Approved

This document defines the complete Distributor experience.

The Distributor module is the operational control center of the platform.

Distributor responsibilities:

Manage Inventory
Manage Products
Manage Salesmen
Process Orders
Manage Fulfillment
Monitor Operations

Distributor is NOT responsible for:

Manufacturer Analytics
Approving Other Distributors
Approving Manufacturers

⸻

1. Module Goals

The distributor should be able to:

Manage Inventory
Create Distributor Products
Manage Salesmen
Track Shop Activity
Receive Orders
Process Orders
Dispatch Orders
Mark Deliveries
Track Team Performance

The experience should focus on:

Operational Control
Speed
Order Fulfillment
Inventory Visibility

⸻

2. Distributor Navigation

Bottom Navigation:

Home
Orders
Inventory
Team
Profile

Always visible.

Maximum one-tap access.

⸻

3. Distributor Home Screen

Purpose

Daily operational dashboard.

This screen answers:

What needs attention right now?

⸻

3.1 Dashboard Header

Displays:

Distributor Name
Current Date

⸻

3.2 KPI Cards

Cards:

New Orders
Orders Processing
Backorders
Low Stock Products
Today's Sales
Active Salesmen

Example:

New Orders: 12
Backorders: 4
Low Stock Products: 8

⸻

3.3 Priority Queue

Section Title:

Orders Requiring Action

Displays:

New Orders
Edited Orders
Backorders
Pending Dispatch

Order Card:

Order Number
Shop Name
Salesman Name
Amount
Current Status

Buttons:

View
Process

⸻

3.4 Team Activity

Displays:

Checked-In Salesmen
Active Visits
Orders Today

⸻

3.5 Notifications Widget

Recent Notifications:

New Order
Order Edited
New Shop Created
Low Stock Alert

Button:

View All

⸻

4. Orders Module

Purpose:

Receive and process orders.

⸻

4.1 Orders Screen

Filters:

All
New
Confirmed
Processing
Packed
Dispatched
Delivered
Cancelled
Backordered

Search:

Order Number
Shop Name
Salesman Name

⸻

Order Card

Displays:

Order Number
Shop Name
Salesman
Amount
Status
Created Date

Indicators:

Backorder Badge
Edited Badge
Post-Dispatch Edit Badge

Buttons:

View

⸻

4.2 Order Detail Screen

Displays:

Order Number
Shop Name
Salesman
Visit ID
Order Date
Current Status

⸻

Products Section

Displays:

Product Name
Quantity
MRP
Discount
Final Value

⸻

Fulfillment Section

Displays:

Reserved Quantity
Backordered Quantity
Dispatched Quantity
Delivered Quantity

⸻

Revision History

Displays:

Edited By
Edited At
Changed Fields

⸻

Audit History

Displays:

Status Changes
Inventory Changes
Notifications Sent

⸻

Fulfillment Actions

Buttons:

Confirm
Processing
Pack
Dispatch
Deliver
Cancel

⸻

Dispatch Action

When distributor presses:

Dispatch

System:

Reduce Inventory
Create Fulfillment Log
Send Notifications

⸻

Deliver Action

When distributor presses:

Deliver

System:

Update Delivery Status
Create Audit Log

⸻

5. Inventory Module

Purpose:

Manage stock levels.

Inventory is maintained:

Distributor + Product

No warehouse support.

No location support.

⸻

5.1 Inventory Screen

Grouping:

Manufacturer A
Manufacturer B
Distributor Products

⸻

Inventory Card

Displays:

Product Name
SKU
Available Quantity
Reserved Quantity
Backordered Quantity

⸻

Indicators:

Low Stock
Out Of Stock

⸻

Buttons:

View Product
Adjust Inventory
View Movements

⸻

5.2 Inventory Detail Screen

Displays:

Product Name
SKU
Category
MRP

Inventory:

Available
Reserved
Backordered

⸻

Movement Summary:

Last Adjustment
Last Dispatch
Last Restock

⸻

5.3 Inventory Adjustment

Purpose:

Manual stock correction.

Fields:

Product *
Adjustment Type *
Quantity *
Reason *
Notes

Adjustment Types:

Stock Added
Stock Removed
Stock Corrected
Opening Stock
Manual Adjustment

⸻

Button:

Save Adjustment

System:

Update Inventory
Create Inventory Movement
Create Audit Log

⸻

6. Product Module

Purpose:

Manage distributor-created products.

⸻

Important Product Rules

Manufacturer Products:

Distributor cannot edit:
MRP
GST
Manufacturer Information

⸻

Distributor Products:

Distributor can edit everything.

⸻

Visibility:

Distributor Product visible to:

Distributor
Distributor Salesmen
Manufacturer
Admin

NOT visible to:

Other Distributors
Other Salesmen

⸻

6.1 Product List

Displays:

Image
Product Name
Product Source
MRP
Status

Product Source:

Manufacturer Product
Distributor Product

⸻

Buttons:

View
Add Product

⸻

6.2 Create Distributor Product

Fields:

Product Name *
SKU *
Category *
Unit *
MRP *
GST Percentage *

Manufacturer Details:

Manufacturer Name *
Manufacturer Address *
Manufacturer Phone
Manufacturer Email
Manufacturer GST

⸻

Product Media:

Product Image

Image compression required.

⸻

Button:

Create Product

System:

Create Product
Assign To Distributor

⸻

6.3 Edit Distributor Product

Editable:

Name
MRP
GST
Description
Image
Manufacturer Information

⸻

7. Team Module

Purpose:

Manage Salesmen
Track Activity

⸻

7.1 Team Screen

Displays:

Salesman Name
Status
Orders Today
Visits Today

Status:

Checked In
Checked Out
Offline

⸻

Buttons:

View Profile
View Activity

⸻

7.2 Salesman Detail Screen

Displays:

Name
Phone
Approval Status
Distributor

⸻

Performance:

Orders Today
Visits Today
Productive Visits
No Order Visits

⸻

Buttons:

View Orders
View Visits
View Location

⸻

7.3 Live Location Screen

Displays:

Current Location
Last Updated Time

Map Displays:

Current Marker
Visited Shops
Route

Only available:

During Working Hours

⸻

8. Shop Visibility

Important Rule:

Shops are distributor scoped.

Example:

Salesman A
↓
Distributor A
↓
Creates Shop

Result:

Visible To:
All Salesmen Under Distributor A
Not Visible To:
Distributor B
Distributor C

⸻

9. Notifications Module

Purpose:

Operational awareness.

⸻

Notification Types:

New Order
Order Edited
Order Cancelled
Backorder Created
New Shop Created
Inventory Low
Salesman Checked In
Salesman Checked Out

⸻

Notification Card

Displays:

Title
Description
Timestamp

Button:

View Related Record

⸻

10. Profile Screen

Displays:

Distributor Name
Business Information
Contact Information

⸻

Sections:

Products
Salesmen
Settings
Audit Logs

⸻

Button:

Logout

⸻

11. Offline Behaviour

Distributor operations should function online.

However:

Supported Offline:

View Cached Orders
View Cached Inventory
View Cached Team Data

⸻

Not Supported Offline:

Inventory Adjustments
Order Fulfillment
Product Creation

Reason:

Inventory Consistency

⸻

12. Socket.IO Behaviour

Distributor receives:

New Order
Order Edited
Order Cancelled
Backorder Created

Updates appear instantly.

No refresh required.

⸻

13. Firebase Notifications

Push Notifications:

New Order
Order Edited
Backorder Created
Inventory Alert

⸻

14. KPIs

Distributor Dashboard KPIs:

Orders Received
Orders Delivered
Backorders
Inventory Health
Low Stock Products
Salesman Productivity

⸻

15. Important Business Rules

Rule 1

Distributor manages fulfillment.

Rule 2

Inventory decreases on dispatch.

Rule 3

Backorders are allowed.

Rule 4

Distributor cannot modify manufacturer product pricing.

Rule 5

Distributor products are private to distributor ecosystem.

Rule 6

All inventory changes must be logged.

Rule 7

All order status changes must be logged.

Rule 8

Live team tracking available only during working hours.

Rule 9

Image uploads must be compressed before upload.

Rule 10

Manufacturer can view distributor-created products.

⸻

16. Success Metrics

Distributor Success Metrics:

Average Dispatch Time
Average Delivery Time
Backorder Rate
Inventory Accuracy
Low Stock Frequency
Salesman Productivity

⸻

17. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md



================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

04_Manufacturer_Module_Specification.md

Manufacturer Module Specification

Version: 1.0

Status: Approved

The Manufacturer Module is the executive and business-control layer of the platform.

Unlike Salesmen and Distributors, Manufacturers are not involved in day-to-day operations.

Manufacturers focus on:

Product Management
Distributor Management
Salesman Approvals
Business Visibility
Sales Analytics
Inventory Visibility
Order Visibility
Performance Monitoring

Manufacturers DO NOT:

Manage Inventory
Dispatch Orders
Deliver Orders
Perform Fulfillment
Create Shop Visits
Create Orders

⸻

1. Module Goals

The Manufacturer should be able to:

Create Products
Approve Distributors
Approve Salesmen
Monitor Sales
Monitor Inventory
Monitor Distributors
Monitor Salesmen
View Analytics

The Manufacturer dashboard should answer:

What is happening in my business?
Who is performing?
What products are selling?
Where are problems occurring?

⸻

2. Manufacturer Navigation

Bottom Navigation:

Home
Orders
People
Analytics
Profile

Navigation priority:

Business Visibility
Approvals
Analytics

⸻

3. Manufacturer Home Screen

Purpose:

Executive Summary Dashboard

⸻

3.1 Dashboard Header

Displays:

Manufacturer Name
Current Date

⸻

3.2 KPI Cards

Displays:

Sales Today
Orders Today
Active Distributors
Active Salesmen
Active Shops
Backorders
Delayed Deliveries
Visit Conversion Rate

Example:

Sales Today: ₹85,000
Orders Today: 152
Active Distributors: 12
Backorders: 8

⸻

3.3 Quick Attention Section

Section Title:

Needs Attention

Displays:

Pending Distributor Approvals
Pending Salesman Approvals
High Backorders
Delayed Deliveries

Cards:

Distributor Approval Request
Salesman Approval Request
Backorder Alert

Buttons:

Review
View Details

⸻

3.4 Top Performers

Displays:

Top Distributor
Top Salesman
Top Product
Top Region

⸻

3.5 Recent Activity

Displays:

Distributor Approved
Salesman Approved
New Product Added
Large Order Created

⸻

4. People Module

Purpose:

Manage ecosystem participants.

⸻

Tabs:

Distributor Requests
Salesman Requests
Approved Distributors
Approved Salesmen

⸻

4.1 Distributor Requests

Displays:

Distributor Name
Owner Name
Phone Number
Registration Date
Status

Status:

Pending Approval

⸻

Buttons:

View Details
Approve
Reject

⸻

Distributor Detail Screen

Displays:

Business Name
Owner Name
Phone
Email
Address
GST Number
Registration Date

Documents:

GST Certificate
Business Proof
Uploaded Documents

⸻

Buttons:

Approve Distributor
Reject Distributor

⸻

Approval Action

When Approve pressed:

System:

Activate Distributor
Create Audit Log
Send Notification

⸻

Rejection Action

Popup:

Reason For Rejection

Mandatory.

System:

Store Reason
Send Notification
Create Audit Log

⸻

4.2 Salesman Requests

Displays:

Salesman Name
Distributor
Phone
Registration Date

Buttons:

Approve
Reject
View Details

⸻

Salesman Detail Screen

Displays:

Full Name
Phone
Email
Selected Distributor
Registration Date

⸻

Buttons:

Approve Salesman
Reject Salesman

⸻

4.3 Approved Distributors

Displays:

Distributor Name
Region
Active Salesmen
Monthly Sales
Status

Buttons:

View
Suspend

⸻

4.4 Approved Salesmen

Displays:

Salesman Name
Distributor
Today's Orders
Today's Visits
Current Status

Buttons:

View Profile
View Activity

⸻

5. Product Management Module

Purpose:

Manage manufacturer-owned products.

⸻

Product List Screen

Displays:

Image
Product Name
SKU
MRP
GST
Status

Buttons:

Add Product
View Product
Edit Product
Deactivate Product

⸻

Create Product Screen

Fields:

Product Name *
SKU *
Category *
Unit *
MRP *
GST Percentage *

Optional:

Description
Product Image

⸻

Product Image

Buttons:

Capture Photo
Select From Gallery

System:

Compress Image
Resize Image

⸻

Button:

Create Product

⸻

Important Product Rule

Manufacturer Product:

Manufacturer owns MRP.

Distributors cannot edit:

MRP
GST
Manufacturer Product Information

⸻

Pricing Configuration

Fields:

MRP
Distributor Discount %
Special Discount %
GST %

⸻

Example:

MRP = ₹100
Distributor Discount = 50%
Special Discount = 5%
GST = 18%

Calculated:

100
- 50
- 5
+ 18
Final = ₹63

⸻

Product Detail Screen

Displays:

Image
Product Name
Category
MRP
GST

⸻

Performance:

Total Orders
Total Quantity Sold
Total Revenue

⸻

Associated Distributors:

Distributor List

⸻

6. Orders Module

Purpose:

Business visibility.

Manufacturer cannot fulfill orders.

⸻

Orders List

Filters:

All
Distributor
Salesman
Product
Shop
Date Range
Status

Search:

Order Number
Shop Name
Distributor

⸻

Order Card

Displays:

Order Number
Shop
Distributor
Salesman
Amount
Status
Date

⸻

Buttons:

View

⸻

Order Detail

Displays:

Order Information
Products
Timeline
Revision History

⸻

Timeline:

Created
Confirmed
Processing
Packed
Dispatched
Delivered

⸻

Revision History

Displays:

Edited By
Timestamp
Old Value
New Value

⸻

7. Analytics Module

Purpose:

Provide complete business visibility.

⸻

Tabs:

Overview
Sales
Products
Distributors
Salesmen
Shops
Visits
Inventory
Backorders
Delivery

⸻

7.1 Overview Analytics

Displays:

Total Sales
Total Orders
Average Order Value
Active Shops
Active Salesmen
Visit Conversion Rate
Backorder Rate

⸻

7.2 Sales Analytics

Displays:

Sales By Date
Sales By Distributor
Sales By Salesman
Sales By Product
Sales By Shop
Sales By Region

Charts:

Line Charts
Bar Charts
Ranking Lists

⸻

7.3 Product Analytics

Displays:

Top Products
Lowest Performing Products
Revenue By Product
Quantity Sold

⸻

7.4 Distributor Analytics

Displays:

Sales By Distributor
Order Count
Fulfillment Time
Backorder Rate
Low Stock Frequency

⸻

7.5 Salesman Analytics

Displays:

Orders Created
Visits Completed
Productive Visits
No Order Visits
Visit Conversion Rate
Distance Travelled

⸻

7.6 Shop Analytics

Displays:

Top Shops
New Shops
Inactive Shops
Revenue By Shop
Visit History

⸻

7.7 Inventory Analytics

Displays:

Available Stock
Reserved Stock
Backordered Quantity
Low Stock Products

Visibility Only.

Manufacturer cannot edit inventory.

⸻

7.8 Backorder Analytics

Displays:

Backordered Products
Backorder Quantity
Backorder Trend
Distributor Backorder Rate

⸻

7.9 Delivery Analytics

Displays:

Delivered Orders
Pending Dispatch
Delayed Orders
Average Dispatch Time
Average Delivery Time

⸻

8. Distributor Product Visibility

Important Rule:

Manufacturers can view distributor-created products.

Displays:

Product Name
Distributor Name
MRP
Manufacturer Information

Manufacturer cannot edit distributor-created products.

Visibility only.

⸻

9. Live Salesman Monitoring

Purpose:

Business visibility.

⸻

Displays:

Checked-In Salesmen
Current Location
Last Updated

Map Displays:

Current Position
Visited Shops
Today's Route

Only available during:

Working Hours

⸻

10. Notifications

Manufacturer receives:

Distributor Registration Request
Salesman Registration Request
Large Order Alerts
Backorder Alerts

⸻

Notification Card

Displays:

Title
Description
Timestamp

Button:

Open Related Record

⸻

11. Profile Screen

Displays:

Manufacturer Name
Contact Details
Business Information

⸻

Sections:

Products
Users
Settings
Audit Logs

⸻

Buttons:

Logout

⸻

12. Offline Behaviour

Manufacturer module is primarily online.

Offline Support:

Cached Dashboards
Cached Analytics
Cached Products

Not Supported Offline:

Approvals
Product Creation
User Actions

⸻

13. Socket.IO Behaviour

Live Updates:

New Approval Requests
Order Updates
Backorder Alerts
Dashboard Updates

⸻

14. Firebase Notifications

Push Notifications:

Distributor Registration
Salesman Registration
Backorder Alert
Important Order Activity

⸻

15. Important Business Rules

Rule 1

Manufacturer creates products.

Rule 2

Manufacturer controls MRP.

Rule 3

Manufacturer approves distributors.

Rule 4

Manufacturer approves salesmen.

Rule 5

Manufacturer cannot dispatch orders.

Rule 6

Manufacturer cannot edit inventory.

Rule 7

Manufacturer can view distributor-created products.

Rule 8

All approval actions are audited.

Rule 9

All images must be compressed before upload.

⸻

16. Success Metrics

Manufacturer KPIs:

Sales Growth
Order Growth
Distributor Performance
Salesman Performance
Backorder Rate
Delivery Success Rate
Visit Conversion Rate

⸻

17. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md



================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

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




================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

06_Design_System_And_QA.md

Design System & QA Specification

Version: 1.0

Status: Approved

This document defines:

Design Language
Color System
Typography
Spacing
Components
Forms
Buttons
Cards
Status Badges
Charts
Loading States
Empty States
Error States
Accessibility
QA Standards
UAT Scenarios
Offline Testing
Performance Testing

Audience:

UI/UX Designers
Frontend Developers
QA Engineers
Product Managers

⸻

1. Design Philosophy

The platform must feel:

Modern
Clean
Fast
Professional
Mobile First

Design inspiration:

Linear
Stripe
Notion
Modern SaaS
Modern Fintech

Avoid:

ERP Look
Heavy Borders
Complex Tables
Crowded Screens
Too Many Colors

⸻

2. UX Principles

Salesman

Goal:

Complete tasks quickly.

Should never feel like:

Data Entry Software

⸻

Priority:

Check In
Start Visit
Create Shop
Create Order
Check Out

⸻

Distributor

Goal:

Take action quickly.

Must instantly know:

Pending Orders
Backorders
Low Inventory
Active Salesmen

⸻

Manufacturer

Goal:

Understand business performance.

Must instantly know:

Sales
Orders
Approvals
Backorders
Performance

⸻

3. Color System

Primary

Deep Slate
#0F172A

Usage:

Headers
Primary Text
Important Information

⸻

Accent

Blue
#2563EB

Usage:

Primary Buttons
Active Tabs
Links

⸻

Success

Green
#16A34A

Usage:

Delivered
Success
Approved
Synced

⸻

Warning

Amber
#F59E0B

Usage:

Backorders
Pending Sync
Low Stock

⸻

Error

Red
#DC2626

Usage:

Cancelled
Failed
Rejected

⸻

Background

Light Gray
#F8FAFC

⸻

Card Background

White
#FFFFFF

⸻

4. Typography

Recommended Fonts:

Inter
SF Pro
Roboto

⸻

Text Sizes

Screen Title:

24px
Weight: Bold

⸻

Section Title:

18px
Weight: Semi Bold

⸻

Body Text:

14-16px
Weight: Regular

⸻

Metadata:

12px

⸻

Buttons:

16px
Weight: Medium

⸻

5. Spacing System

Use:

4px
8px
12px
16px
24px
32px

⸻

Card Padding:

16px

⸻

Screen Padding:

16px

⸻

6. Buttons

Primary Button

Usage:

Check In
Create Order
Start Visit
Approve
Dispatch

Style:

Blue Background
White Text
Rounded

⸻

Secondary Button

Usage:

View
Edit
Details

⸻

Danger Button

Usage:

Delete
Reject
Cancel Order

Color:

Red

⸻

Ghost Button

Usage:

Less Important Actions

⸻

Button Rules

Minimum Height:

48px

Recommended:

56px

⸻

7. Cards

Use Cards For:

Orders
Products
Shops
Notifications
KPIs
Visits

⸻

Card Layout

Header:

Title

Body:

Content

Footer:

Actions

⸻

Style:

White
Rounded
Subtle Shadow

⸻

8. Status Badges

Order Status

Created
Confirmed
Processing
Packed
Dispatched
Delivered
Cancelled

⸻

Sync Status

Pending
Synced
Failed
Conflict

⸻

Approval Status

Pending
Approved
Rejected
Suspended

⸻

Badge Colors

Approved:

Green

Pending:

Amber

Rejected:

Red

⸻

9. Forms

Forms must be:

Short
Step Based
Mobile Friendly

Avoid:

Long Forms

⸻

Required Fields

Display:

*

Example:

Shop Name *

⸻

Validation Messages

Bad:

Validation Error

Good:

Shop Name is required.

⸻

10. Inputs

Text Input:

Outlined
Rounded

⸻

Dropdown:

Searchable

⸻

Date Input:

Native Date Picker

⸻

Quantity Input

Use:

Stepper

Example:

[-] 5 [+]

Avoid:

Keyboard Quantity Entry

⸻

11. Product Catalogue Design

Product Card:

Displays:

Image
Product Name
Manufacturer
MRP

Salesman Does Not See:

Inventory
Available Stock

⸻

Actions:

Add
Increase Quantity

⸻

12. Shop Verification Photo UI

Label:

Upload Visiting Card or Shop Verification Photo

Help Text:

Upload a visiting card,
shop board,
GST certificate,
or other business proof.

⸻

Buttons:

Capture Photo
Select From Gallery

⸻

Compression:

Automatic

⸻

13. Charts

Allowed:

Line Chart
Bar Chart
Donut Chart
Ranking List

Avoid:

Complex Desktop Charts

⸻

14. Loading States

Use:

Skeleton Loaders

Not:

Full Screen Spinner

⸻

Examples:

Orders Loading
Products Loading
Analytics Loading

⸻

15. Empty States

Example:

Orders

Message:

No Orders Found

Description:

Orders created by your team will appear here.

⸻

Shops

Message:

No Shops Available

Button:

Add Shop

⸻

16. Error States

Example:

Network Error

Title:

Connection Lost

Description:

Please check your internet connection.

Button:

Retry

⸻

17. Offline States

Banner:

You are offline.
Data will sync automatically.

⸻

Sync Indicator:

3 Orders Pending
2 Visits Pending

⸻

Status Colors

Pending:

Amber

Failed:

Red

Synced:

Green

⸻

18. Accessibility

Minimum Touch Area:

44x44

Recommended:

48x48

⸻

Color Contrast:

WCAG AA

⸻

Text Scaling:

Supported

⸻

19. QA Testing Standards

Every Screen Must Verify:

UI
Validation
Navigation
Permissions
Offline Behavior

⸻

20. Authentication QA

Test:

Login
Logout
Token Expiry
Forgot Password

⸻

Expected:

Correct Navigation
Correct Permissions

⸻

21. Approval Flow QA

Distributor:

Register
Pending
Approve
Reject

⸻

Salesman:

Register
Pending
Approve
Reject

⸻

Verify:

Permissions Update Correctly

⸻

22. Visit QA

Test:

Check In
Start Visit
No Order
Order
End Visit
Check Out

Verify:

GPS Captured
Audit Created

⸻

23. Shop Creation QA

Verify:

Duplicate Detection

⸻

Verify:

Verification Photo Mandatory

⸻

Verify:

Image Compression Executed

⸻

Verify:

Shop Assigned To Distributor

⸻

24. Order QA

Verify:

Order Must Belong To Visit

⸻

Verify:

Product Discount
Bill Discount

⸻

Verify:

Order Edit
Order Cancel

⸻

Verify:

Audit Logs Created

⸻

25. Inventory QA

Verify:

Inventory Adjustment

⸻

Verify:

Dispatch Reduces Inventory

⸻

Verify:

Backorders Created

⸻

26. Offline QA

Disable Internet

Test:

Create Shop
Create Visit
Create Order
Edit Order
Capture Image

⸻

Reconnect Internet

Verify:

Sync Success

⸻

Verify:

No Duplicate Records

⸻

27. Socket.IO QA

Verify:

Distributor:

Receives New Order Instantly

⸻

Manufacturer:

Receives Approval Requests Instantly

⸻

28. Firebase QA

Verify:

Push Notification Received

⸻

Verify:

Tap Notification Opens Correct Screen

⸻

29. Performance QA

App Launch:

< 3 Seconds

⸻

Catalogue Search:

< 1 Second

⸻

Order Creation:

< 2 Seconds

⸻

Sync Start:

Immediate After Internet Available

⸻

30. UAT Checklist

Salesman:

Can Complete Full Day Workflow

⸻

Distributor:

Can Process Order Lifecycle

⸻

Manufacturer:

Can Approve Users
Can Monitor Business

⸻

31. Final Acceptance Criteria

The application is accepted when:

Every Order Belongs To Visit
Offline Support Works
Image Compression Works
Approval Flow Works
Backorders Work
Notifications Work
Inventory Works
Analytics Work
Audit Logs Work

⸻

Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md





================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

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

================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

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


================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

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

33. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md
07_API_Contracts_And_Sync_Specification.md
08_Database_Schema_And_ERD_Specification.md

================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

10_System_Architecture_And_Deployment.md

System Architecture & Deployment Specification

Version: 1.0
Status: Approved
Architecture Type: Monolithic Backend + Mobile App + Admin Panel
Deployment Strategy: Single VPS (Phase 1)

⸻

1. Purpose

This document defines:

Infrastructure Architecture
Application Architecture
Deployment Architecture
Networking
Storage
File Upload Strategy
Offline Sync Infrastructure
Realtime Infrastructure
Backup Strategy
Monitoring Strategy
Security Hardening
Scaling Roadmap
Disaster Recovery

Audience:

Backend Developers
Frontend Developers
DevOps Engineers
System Architects
Technical Founders

⸻

2. Architecture Principles

The system is designed around:

Simplicity
Reliability
Offline Support
Low Infrastructure Cost
Easy Maintenance
Scalability Later

⸻

Important Decisions

Single VPS
PostgreSQL
Socket.IO
Firebase
WatermelonDB
No Redis
No BullMQ
No RabbitMQ

Reason:

Current scale does not justify distributed infrastructure.

⸻

3. High-Level Architecture

┌─────────────────────┐
│   React Native App  │
└──────────┬──────────┘
           │
           │ HTTPS
           │
           ▼
┌─────────────────────┐
│     NestJS API      │
└──────────┬──────────┘
           │
           │
           ▼
┌─────────────────────┐
│    PostgreSQL DB    │
└─────────────────────┘
           ▲
           │
           │ Socket.IO
           │
           ▼
┌─────────────────────┐
│ Realtime Updates    │
└─────────────────────┘
           ▼
┌─────────────────────┐
│ Firebase Cloud Msg  │
└─────────────────────┘
           ▲
           │
           │ HTTPS
           │
           ▼
┌─────────────────────┐
│ Next.js Admin Panel │
└─────────────────────┘

⸻

4. Components

⸻

Mobile Application

Technology:

React Native
TypeScript
WatermelonDB

Responsibilities:

Offline Operations
Shop Creation
Visits
Orders
Location Tracking
Notifications

⸻

Backend

Technology:

NestJS
TypeScript

Responsibilities:

Business Logic
Authentication
Authorization
Inventory
Orders
Approvals
Analytics
Realtime Events
Sync Processing

⸻

Database

Technology:

PostgreSQL
PostGIS

Responsibilities:

Data Storage
Location Queries
Reporting
Auditing

⸻

Admin Panel

Technology:

Next.js
shadcn/ui

Responsibilities:

Approvals
Monitoring
Analytics
Support
Administration

⸻

5. Single VPS Deployment Strategy

Phase 1 Architecture:

One VPS
One Backend
One Database
One Admin Panel

Benefits:

Low Cost
Easy Management
Simple Deployment
Easy Backups

⸻

Recommended Server

Minimum:

4 CPU
8 GB RAM
100 GB SSD

Recommended:

8 CPU
16 GB RAM
200 GB SSD

⸻

Example Providers

Hetzner
Contabo
DigitalOcean
AWS Lightsail
Vultr

⸻

6. Server Structure

Recommended:

/opt/app/backend
/opt/app/admin
/opt/storage/uploads
/opt/backups

⸻

7. Backend Deployment

Deployment Method:

Docker
Docker Compose

Containers:

backend
postgres
nginx

⸻

Example:

backend
admin
postgres

Behind:

Nginx Reverse Proxy

⸻

8. Networking Architecture

Domains:

api.company.com
admin.company.com

Optional:

cdn.company.com

Future.

⸻

Ports:

80
443

Internal:

3000 Backend
3001 Admin
5432 PostgreSQL

⸻

9. SSL Strategy

Mandatory:

HTTPS Everywhere

Use:

Let's Encrypt

Auto-renewal:

Certbot

⸻

10. PostgreSQL Architecture

Technology:

PostgreSQL
PostGIS

⸻

Database Purpose:

Orders
Inventory
Visits
Shops
Users
Approvals
Analytics

⸻

Important Rule:

PostgreSQL is source of truth.

⸻

11. Database Connection Strategy

Backend → PostgreSQL

Use:

Connection Pooling

Recommended:

20-50 Connections

⸻

12. Realtime Architecture

Technology:

Socket.IO

Used For:

Order Updates
Approvals
Dashboard Updates
Notifications

⸻

Not Used For:

Inventory Tracking
Location History Storage

Those remain in PostgreSQL.

⸻

Socket Connection Flow

Login
↓
JWT Validation
↓
Socket Connection
↓
Join Role Rooms

⸻

Example Rooms

manufacturer:{id}
distributor:{id}
salesman:{id}

⸻

13. Firebase Architecture

Technology:

Firebase Cloud Messaging

Purpose:

Push Notifications

⸻

Events:

New Order
Order Updated
Approval Granted
Approval Rejected
Backorder Alert

⸻

Notification Flow

Backend Event
↓
Notification Record
↓
FCM Push
↓
Mobile App

⸻

14. File Storage Architecture

Uploads:

Product Images
Shop Verification Photos
Documents

⸻

Storage Location

/opt/storage/uploads

⸻

Structure

uploads/
products/
shops/
documents/
users/

⸻

15. Image Processing Architecture

All Images:

Compressed
Resized
Stored

⸻

Flow

Capture Image
↓
Compress On Device
↓
Upload
↓
Backend Validation
↓
Store

⸻

Recommended Limits

Max Upload:

5 MB

Target After Compression:

300 KB - 800 KB

⸻

16. Offline Sync Architecture

Mobile Uses:

WatermelonDB

⸻

Backend Uses:

Sync API

⸻

Flow

Create Record
↓
Store Offline
↓
Network Available
↓
Sync API
↓
Backend
↓
Response
↓
Update Local Status

⸻

Sync Statuses

Pending
Synced
Failed
Conflict

⸻

17. Background Jobs

No Redis.

No BullMQ.

⸻

Use:

background_jobs table
cron jobs
database workers

⸻

Examples:

Notification Retry
Analytics Aggregation
Sync Processing
Low Stock Detection

⸻

Job Flow

Create Job
↓
Store In DB
↓
Worker Reads
↓
Execute
↓
Mark Complete

⸻

18. Monitoring Strategy

Recommended Tools:

PM2
Grafana
Prometheus
Uptime Kuma

⸻

Monitor:

CPU
RAM
Disk
Database
API
Sockets

⸻

19. Logging Strategy

Application Logs:

NestJS Logger

⸻

Store:

Errors
Warnings
API Failures
Sync Failures

⸻

Audit Logs:

Database

⸻

20. Backup Strategy

Critical Data:

PostgreSQL
Uploads

⸻

Database Backup

Frequency:

Daily

⸻

Retention:

30 Days

⸻

Uploads Backup

Frequency:

Daily

⸻

Location:

Separate Storage

⸻

21. Disaster Recovery

Failure:

Server Crash

Recovery:

Restore Database
Restore Uploads
Redeploy Containers

⸻

Target:

< 4 Hours

Recovery Time.

⸻

22. Security Architecture

Authentication:

JWT
Refresh Tokens

⸻

Authorization:

RBAC
Permission Checks

⸻

Data Security:

HTTPS
Encrypted Passwords
Secure Tokens

⸻

Passwords:

bcrypt

⸻

23. Environment Variables

Backend:

DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
SOCKET_URL=
FCM_PROJECT_ID=
FCM_PRIVATE_KEY=
UPLOAD_PATH=

⸻

Admin:

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=

⸻

24. CI/CD Strategy

Recommended:

GitHub Actions

Pipeline:

Lint
Test
Build
Deploy
Restart

⸻

Deployment Trigger

Main Branch

⸻

25. Production Readiness Checklist

Backend

JWT Enabled
RBAC Enabled
Audit Logs Enabled
Rate Limiting Enabled

⸻

Database

Indexes Created
Backups Enabled
PostGIS Installed

⸻

Uploads

Compression Enabled
Validation Enabled

⸻

Mobile

Offline Sync Tested
Notifications Tested
Location Tracking Tested

⸻

Admin

Permissions Tested
Approvals Tested
Audit Logs Tested

⸻

26. Scaling Strategy

Current:

Single VPS

⸻

Future Phase 2

Separate PostgreSQL Server
Separate Backend Server
CDN
Object Storage

⸻

Future Phase 3

Load Balancer
Multiple API Servers
Redis
Message Queues

Only if scale requires.

⸻

27. Important Business Rules

Rule 1

No Redis

⸻

Rule 2

No BullMQ

⸻

Rule 3

Socket.IO For Realtime

⸻

Rule 4

Firebase For Push Notifications

⸻

Rule 5

WatermelonDB For Offline

⸻

Rule 6

All Images Must Be Compressed

⸻

Rule 7

PostgreSQL Is Source Of Truth

⸻

Rule 8

Single VPS Architecture For Phase 1

⸻

28. Related Documents

01_Product_Vision_And_User_Journeys.md
02_Salesman_Module_Specification.md
03_Distributor_Module_Specification.md
04_Manufacturer_Module_Specification.md
05_React_Native_Technical_Architecture.md
06_Design_System_And_QA.md
07_API_Contracts_And_Sync_Specification.md
08_Database_Schema_And_ERD_Specification.md
09_Admin_Panel_Specification.md

================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================

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

================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================


================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================


================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================


================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================


================================================================================================================
+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
================================================================================================================
