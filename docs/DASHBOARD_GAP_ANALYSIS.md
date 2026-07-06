# Enterprise Dashboard Gap Analysis

## Objective
This document outlines a complete architectural gap analysis for the Dashboard/Analytics module of the Vikas Inventory backend. It compares the existing implementation against the full scope of available modules to define an enterprise-grade reporting roadmap.

---

## 1. Inspect Every Module & Identify Missing Widgets

### 1. Authentication & Users
- **Current Metrics:** None.
- **Should Exist:** New Users, Recently Approved Users, Active Users, Active Sessions, Blocked/Suspended Users, Authentication Failures.
- **Widgets:** 
  - *User Registration Trend (Line Chart)*
  - *Active vs Inactive Users (Pie Chart)*

### 2. Manufacturers, Distributors, Salesmen
- **Current Metrics:** Top Salesmen, Top Distributors (in orders only).
- **Should Exist:** Manufacturer Onboarding Growth, Active vs Inactive Distributors, Distributor Reach (number of shops), Salesman Attrition, Salesman Coverage (shops visited vs total assigned).
- **Widgets:** 
  - *Salesman Performance Leaderboard (Ranking)*
  - *Distributor Health Score (Gauge)*
  - *Salesman Territory Map (Geo Analytics)*

### 3. Products & Product Categories
- **Current Metrics:** None.
- **Should Exist:** Top Selling Products, Bottom Selling Products, Top Categories, Fast Moving Products, Slow Moving Products, Product Availability Rate, Price History Trend.
- **Widgets:** 
  - *Top Products by Volume (Bar Chart)*
  - *Top Products by Revenue (Bar Chart)*
  - *Category Revenue Split (Pie Chart)*

### 4. Shops & Shop Visits
- **Current Metrics:** Total Visits, Active Visits, Completed Visits, No-Order Visits, Visit Conversion Rate.
- **Should Exist:** Top Shops, Bottom Shops, Inactive Shops, New Shops This Month, Average Visit Time, Visit Success Heatmap, Shop Route Efficiency, Duplicate Shops Detected.
- **Widgets:** 
  - *Visit Trend (Line Chart)*
  - *Sales Per Shop Leaderboard (Table)*
  - *Visit Density (Heatmap)*

### 5. Working Days (Attendance)
- **Current Metrics:** Active Salesmen, Checked In Today, Checked Out Today, Average Working Hours.
- **Should Exist:** Late Check-ins, Early Check-outs, Absenteeism Rate, Attendance Trend, Overtime Hours.
- **Widgets:** 
  - *Attendance Trend (Area Chart)*
  - *Check-in/Check-out Timeline (Timeline)*

### 6. Orders & Order Items
- **Current Metrics:** Total Orders, Total Revenue, Average Order Value, Status Distribution, Order Trends (daily), Fulfillment metrics.
- **Should Exist:** Orders Pending, Cancelled Orders, Returned Orders, Return Rate, Revenue by Payment Method, Average Items per Order.
- **Widgets:** 
  - *Revenue Trend (Line Chart)*
  - *Order Value Cohorts (Stacked Bar)*

### 7. Inventory & Inventory Movements
- **Current Metrics:** Low Stock Products, Backordered Products, Inventory Adjustments.
- **Should Exist:** Out of Stock Products, Negative Inventory Items, Total Inventory Value, Inventory Turnover Ratio, Reorder Recommendations.
- **Widgets:** 
  - *Inventory Value Trend (Area Chart)*
  - *Stock Depletion Forecast (Line Chart)*

### 8. Billing & Collections
- **Current Metrics:** None.
- **Should Exist:** Outstanding Payments, Collections Today, Overdue Invoices, Payment Success %, Revenue Realization.
- **Widgets:** 
  - *Collection Efficiency (Gauge Chart)*
  - *Overdue Payments List (Table)*

### 9. Fulfillment & Backorders
- **Current Metrics:** Orders Pending Dispatch, Orders Dispatched, Orders Delivered, Partial Deliveries, Open Backorders, Resolved Backorders.
- **Should Exist:** Average Delivery Time, Order Fulfillment %, Overdue Backorders, Logistics Bottlenecks.
- **Widgets:** 
  - *Delivery Time Trend (Line Chart)*
  - *Fulfillment Efficiency (Gauge)*

### 10. Notifications & Audit Logs
- **Current Metrics:** Unread Notifications.
- **Should Exist:** Live Notifications feed, System Error Rates, Security Events (Failed Logins), Audit Activity Heatmap.
- **Widgets:** 
  - *System Error Trend (Line Chart)*
  - *Live Activity Feed (Timeline)*

---

## 2. Missing APIs (Architecture & Roadmap)

| Module | Required Widget | Required SQL / Logic | Complexity | Priority | Est. Time |
|--------|----------------|----------------------|------------|----------|-----------|
| **Shops** | Top Shops | `SELECT shop_id, SUM(total_amount) FROM orders GROUP BY shop_id ORDER BY SUM DESC` | Low | High | 4h |
| **Shops** | Inactive Shops | `SELECT * FROM shops WHERE id NOT IN (SELECT shop_id FROM shop_visits WHERE date > NOW() - 30 days)` | Medium | High | 4h |
| **Products** | Top Products | `SELECT product_id, SUM(quantity) FROM order_items GROUP BY product_id ORDER BY SUM DESC` | Low | High | 4h |
| **Billing** | Outstanding Payments | `SELECT SUM(balance) FROM billing WHERE status != 'PAID'` | Low | High | 3h |
| **Working Days** | Late Check-ins | `SELECT COUNT(id) FROM working_days WHERE CAST(check_in_time AS time) > '09:30:00'` | Medium | Medium | 3h |
| **Users** | User Growth | `SELECT DATE(created_at), COUNT(id) FROM users GROUP BY DATE(created_at)` | Low | Medium | 2h |
| **Inventory** | Inventory Value | `SELECT SUM(available_quantity * purchase_price) FROM distributor_inventory` | Medium | High | 4h |

---

## 3. Missing Charts

Currently, the system only returns raw JSON arrays designed for basic Daily Trends and simple Bar/Pie charts.
The following charts **must** be implemented in the Dashboard UI and supported by backend grouped aggregations:

- **Pie/Doughnut:** Category Revenue Split, Order Status Distribution, User Roles Distribution.
- **Bar/Column:** Top Products, Top Shops, Top Salesmen, Sales by Territory.
- **Line/Area:** Revenue Trend (Weekly/Monthly/Yearly), Visit Trend, Growth Trend, Attendance Trend.
- **Heatmap:** Sales density by region (Geo), Activity by day of week / hour of day.
- **Calendar:** Attendance Calendar (Salesmen), Scheduled Visits.
- **Gauge:** Collection Efficiency, Order Fulfillment %, Visit Success %.
- **Map:** Geo Analytics showing shop locations, active salesmen pins, delivery routes.
- **Leaderboard:** Salesmen Ranking, Distributor Ranking.

---

## 4. Dashboard Layout by Role

### SUPER_ADMIN
- **Top Cards:** Total Revenue, Total Active Distributors, Total Salesmen, Total Inventory Value.
- **Charts:** Enterprise Revenue Trend (Yearly/Monthly), Distributor Growth (Line), System Health (Gauge).
- **Tables:** Top 10 Distributors, Recent System Errors.
- **Realtime:** Live User Registrations, Global Live Orders.

### MANUFACTURER_ADMIN
- **Top Cards:** Manufacturer Revenue, Active Distributors, Total Products Sold, Pending Approvals.
- **Charts:** Revenue Trend by Distributor (Stacked Bar), Product Category Split (Pie), Fulfillment % (Gauge).
- **Leaderboards:** Top Distributors, Top Selling Products.
- **Realtime:** Live Approvals, Live Orders from Network.

### DISTRIBUTOR_ADMIN
- **Top Cards:** Today's Revenue, Active Salesmen Today, Pending Orders, Low Stock Alerts.
- **Charts:** Sales Trend (Daily/Weekly), Visit Conversion Rate (Line), Inventory Adjustments (Bar).
- **Quick Actions:** Re-order Stock, Approve Leave, Dispatch Orders.
- **Realtime:** Live Check-ins/Check-outs, Live Inventory Depletion, Live Shop Visits.

### SALESMAN
- **Top Cards:** Today's Target, Sales Achieved Today, Visits Completed, Order Success Rate.
- **Charts:** Personal Sales Trend, Daily Attendance Timeline.
- **Tables:** Missing Collections, Planned Visits Today.
- **Quick Actions:** Start Working Day, Add Visit, View Route Map.
- **Realtime:** New Assigned Visits, Order Dispatch Confirmations.

---

## 5. Realtime Opportunities (Socket.IO)

Currently, the dashboard relies on REST polling. The `socket-gateway` module exists and should be utilized for:
- **Live Check-ins:** Broadcast to Distributor Admin when a Salesman checks in/out.
- **Live Orders:** Toast notification for Super Admin / Distributor Admin on large orders.
- **Live Inventory:** Instantly reflect stock out events to prevent salesmen from placing backorders unknowingly.
- **Live Approvals:** Notify Salesmen instantly when a Distributor approves a discount/order.
- **Live Location:** Stream Salesman GPS coordinates to Distributor Map View.

---

## 6. Performance Improvements

### Expensive Queries
- **Current Issue:** `EXTRACT(EPOCH)` and `SUM(CASE WHEN)` are computed on the fly on large transactional tables (`orders`, `shop_visits`, `working_days`).
- **Solution:** Migrate to aggregate tables or materialized views.

### Missing Indexes
- **Recommendation:** Ensure composite indexes on `(status, created_at)`, `(distributor_id, created_at)`, and `(salesman_id, created_at)` for all major tables.

### Analytics Snapshot Usage
- **Current Issue:** The `analytics_snapshots` entity exists but is completely unused.
- **Solution:** Implement Cron Jobs to calculate daily/weekly metrics at midnight and store them in `analytics_snapshots`. The Dashboard API should read historical data from snapshots and only compute "Today's" data on the fly.

### Materialized View Opportunities
- Create a `mat_shop_performance` view updating hourly for "Top Shops" aggregations.
- Create a `mat_salesman_performance` view to cache complex conversion rates.

---

## 7. Final Score & Completion Status

| Category | Score | Notes |
|----------|-------|-------|
| Current Dashboard Completeness | **30%** | Basic foundations exist; huge enterprise gaps. |
| Dashboard APIs | **40%** | Good for basic metrics, lacks multi-dimensional filtering. |
| Dashboard Widgets | **25%** | Only core metrics present. Missing product, shop, and billing data. |
| Dashboard Charts | **20%** | Only daily order trends available. No heatmaps, geos, or gauges. |
| Role Dashboards | **75%** | `applyOwnership` handles data isolation well. Needs UI layout. |
| Business KPIs | **35%** | AOV and conversion exist, but ROI, collection, and turnover are missing. |
| Executive Reporting | **10%** | No monthly/yearly roll-ups or cross-manufacturer metrics. |
| Operational Reporting | **50%** | Good dispatch and attendance metrics. |
| Realtime Reporting | **0%** | Fully REST based. Socket.IO is not used for analytics. |
| **Overall Enterprise Dashboard** | **~32%** | Needs substantial expansion for enterprise grade tier. |

---
**Summary:** The infrastructure is solid, and data isolation via role guards is implemented correctly. To become an Enterprise Dashboard, the focus must shift towards robust product/shop analytics, Cron-based snapshot caching, flexible timeline filtering (weekly/monthly/yearly), and realtime Socket.IO integrations.
