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