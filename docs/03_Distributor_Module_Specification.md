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