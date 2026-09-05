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