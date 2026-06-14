# Field Sales Platform - Architecture Governance Skill

## Purpose

This skill governs all development, analysis, planning, implementation, verification, testing, refactoring, architecture reviews, and bug fixes for the Field Sales Platform.

This skill is mandatory.

Before performing any task, read this skill and the project documentation.

Failure to follow this skill is considered an implementation defect.

---

# PROJECT OVERVIEW

Project Name:
Field Sales Platform

Technology Stack:

Backend:

* NestJS
* TypeScript
* TypeORM
* PostgreSQL
* PostGIS
* Socket.IO
* Firebase Cloud Messaging

Mobile:

* React Native
* Offline First
* WatermelonDB

Admin:

* Next.js
* TypeScript
* Tailwind
* shadcn/ui

Architecture:

* Single VPS Deployment
* PostgreSQL is Source of Truth
* Offline First Mobile
* Visit Centric Business Model
* Database Driven Jobs
* Role Based Access Control
* Ownership Based Access Control

---

# ABSOLUTE DOCUMENT AUTHORITY ORDER

Every implementation decision must be sourced from documentation.

Documentation precedence:

Priority 1:
11_Backend_Module_Implementation_Guide.md

Priority 2:
08_Database_Schema_And_ERD_Specification.md

Priority 3:
07_API_Contracts_And_Sync_Specification.md

Priority 4:
backend_architecture_updated.md

Priority 5:
09_Admin_Panel_Specification.md

Priority 6:
01_Product_Vision_And_User_Journeys.md

Priority 7:
02_Salesman_Module_Specification.md

Priority 8:
03_Distributor_Module_Specification.md

Priority 9:
04_Manufacturer_Module_Specification.md

Priority 10:
05_React_Native_Technical_Architecture.md

Priority 11:
06_Design_System_And_QA.md

Priority 12:
10_System_Architecture_And_Deployment.md

If documents conflict:

Higher priority document wins.

Never invent undocumented rules.

If documentation is unclear:

STOP
Document ambiguity
Ask for clarification

Never assume.

---

# MANDATORY PRE-TASK PROCESS

Before any implementation:

Step 1:
Identify impacted module.

Step 2:
Read ALL related documentation.

Step 3:
Generate Documentation Understanding Report.

Step 4:
Generate Blueprint.

Step 5:
Wait for approval.

Only after approval:

Step 6:
Implement.

Step 7:
Generate Verification Report.

Step 8:
Generate Gap Analysis.

Step 9:
Wait for approval.

Never skip steps.

---

# MODULE COMPLETION CRITERIA

A module is NOT complete when code compiles.

A module is complete ONLY when ALL requirements below are satisfied.

## Database

* Tables implemented
* Relations implemented
* Constraints implemented
* Indexes implemented
* Transactions implemented
* PostGIS requirements implemented

## APIs

* Controllers implemented
* DTOs implemented
* Validation implemented
* Swagger implemented
* Error handling implemented

## Business Logic

* All documented workflows implemented
* All documented edge cases implemented
* No undocumented assumptions

## Security

* Authentication verified
* Authorization verified
* Ownership verified
* Role checks verified
* Approval status verified

## Realtime

* Socket.IO implemented
* Events documented
* Room strategy implemented

## Notifications

* Notification records implemented
* Push notification integration implemented

## Audit

* Audit logging implemented
* Audit payload complete

## Offline

* Idempotency implemented
* Sync compatibility verified
* Conflict handling verified

## Testing

* Unit tests
* Integration tests
* Permission tests
* Ownership tests
* Transaction tests
* Failure tests
* E2E tests

## Verification

* Code verification
* Architecture verification
* Live database verification

If any item is missing:

MODULE STATUS = NOT APPROVED

Do not move to next module.

---

# CRITICAL BUSINESS RULES

These rules are non-negotiable.

## Visit Centric Architecture

Every order belongs to a visit.

Orders can never exist without visits.

Never create shortcuts around visits.

---

## Inventory Rule

Inventory reduces only on dispatch.

Inventory never reduces on order creation.

Inventory never reduces on reservation.

Inventory never reduces on draft orders.

---

## Salesman Visibility Rule

Salesmen must never see inventory quantities.

This applies to:

* APIs
* Mobile responses
* Sync responses
* Socket events

---

## Shop Verification Rule

Shop verification image is mandatory.

Shop creation is invalid without verification image.

---

## Approval Rule

Pending users have catalogue-only access.

Pending users cannot perform operational actions.

---

## Offline Rule

All sync operations must be idempotent.

Duplicate sync submissions must never create duplicate business records.

---

## Ownership Rule

Manufacturer:
Can only access linked ecosystem.

Distributor:
Can only access own data.

Salesman:
Can only access assigned distributor data.

Never grant global visibility unless documentation explicitly allows it.

---

# IMPLEMENTATION ORDER

Modules must be implemented in this order:

1. Auth
2. Users
3. Roles
4. Permissions
5. Manufacturers
6. Distributors
7. Salesmen
8. Approval
9. Products
10. Inventory
11. Shops
12. Working Days
13. Location Tracking
14. Visits
15. Orders
16. Fulfillment
17. Backorders
18. Notifications
19. Offline Sync
20. Analytics

Never skip ahead.

Never start a new module until the current module is approved.

---

# REQUIRED REPORT TYPES

Before implementation:

1. Architecture Understanding Report
2. Blueprint Report

After implementation:

3. Verification Report
4. Compliance Report
5. Gap Analysis Report

For rejected modules:

6. Remediation Plan

---

# MANDATORY VERIFICATION CHECKLIST

For every module verify:

Database:

* Tables
* Indexes
* Constraints
* Transactions

Security:

* JWT
* Roles
* Ownership
* Approval status

Audit:

* Audit events
* Audit payloads

Notifications:

* Records
* Push notifications

Realtime:

* Socket events
* Room routing

Offline:

* Idempotency
* Sync compatibility

Testing:

* Unit
* Integration
* E2E

Architecture:

* Documentation compliance
* Dependency compliance

---

# WHEN ANALYSING EXISTING CODE

Never trust previous reports.

Always inspect actual code.

Always inspect actual entities.

Always inspect actual DTOs.

Always inspect actual services.

Always inspect actual controllers.

Always inspect actual migrations.

Always inspect actual tests.

Evidence beats assumptions.

---

# RESPONSE RULES

When reporting:

Separate findings into:

* COMPLIANT
* PARTIAL
* MISSING
* CRITICAL GAP

Never use vague language such as:

* Looks good
* Seems fine
* Probably works
* Appears correct

Every statement must be backed by:

* Documentation reference
* Code reference
* Database reference

---

# FINAL GOVERNANCE RULE

If a module fails verification:

STOP.

Do not continue to the next module.

Generate:

Remediation Plan

Wait for approval.

Only after successful remediation and re-verification may development continue.
