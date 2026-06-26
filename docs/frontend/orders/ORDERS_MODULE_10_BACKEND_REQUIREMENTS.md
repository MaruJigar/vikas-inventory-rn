# Orders Module 10 — Backend Requirements

## Overview
A backend audit was performed for the Analytics module (`AnalyticsController` and `AnalyticsService`). While an endpoint exists (`GET /analytics/orders`), its implementation does not fulfill the frontend requirements for Module 10.

## Deficiencies Found
The current implementation of `getOrdersAnalytics` internally calculates fixed data (`today` and `firstDay` of the month) but fails to support:
1. **Date Range Filtering:** The API does not accept `startDate` and `endDate` query parameters.
2. **Status Distribution:** The API only counts `CANCELLED` orders, ignoring other lifecycle statuses (e.g., `CONFIRMED`, `DISPATCHED`).
3. **Performance Aggregation:** There is no grouping or aggregation support for Salesman Performance or Distributor Performance metrics.

## Required Backend Changes
The `GET /analytics/orders` API must be refactored or new dedicated endpoints must be introduced to support:
- Dynamic `startDate` and `endDate` parameters (ISO 8601 strings).
- An array or object of counts for all order statuses.
- Top-performing salesmen metrics (Order Count / Value).
- Top-performing distributors metrics (Order Count / Value).

## Status
**BLOCKED.** Frontend implementation cannot proceed until the analytics service is expanded to cover these necessary data points.
