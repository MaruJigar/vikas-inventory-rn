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