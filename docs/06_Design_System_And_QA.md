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
Human Readability Governance: End users must never see raw UUIDs or technical identifiers.
Pagination Governance: Ensure no list queries exceed max limit of 100, and all DataTables paginate natively using server-side endpoints.
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
