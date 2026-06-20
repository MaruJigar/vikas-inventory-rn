# Field Sales Platform - React Native Architecture Governance Skill

## Purpose

This skill governs all frontend development, architecture reviews, implementation, bug fixes, refactoring, testing, offline-sync development, API integration, navigation design, UI development, performance optimization, and code verification for the Field Sales Platform React Native application.

This skill is mandatory.

Before performing any task, read this skill and all referenced documentation.

Failure to follow this skill is considered an implementation defect.

---

# PROJECT OVERVIEW

Project Name:

Field Sales Platform

Frontend Technology Stack:

Core:

* React Native
* TypeScript

Architecture:

* Feature Based Modular Architecture
* Offline First
* Role Based Navigation
* Visit Centric Workflow
* API First Integration
* Database Driven Synchronization

Navigation:

* React Navigation
* Bottom Tabs
* Stack Navigation
* Deep Linking

State Management:

* Zustand

Server State:

* TanStack Query

Forms:

* React Hook Form
* Zod

Local Database:

* WatermelonDB

Realtime:

* Socket.IO

Notifications:

* Firebase Cloud Messaging

Backend:

* NestJS
* PostgreSQL
* PostGIS
* Socket.IO

Admin:

* Next.js
* TypeScript
* Tailwind
* shadcn/ui

---

# ABSOLUTE DOCUMENT AUTHORITY ORDER

Every frontend decision must be sourced from documentation.

Documentation precedence:

Priority 1:
Frontend_Product_UX_Architecture_Spec.md

Priority 2:
05_React_Native_Technical_Architecture.md

Priority 3:
06_Design_System_And_QA.md

Priority 4:
07_API_Contracts_And_Sync_Specification.md

Priority 5:
01_Product_Vision_And_User_Journeys.md

Priority 6:
02_Salesman_Module_Specification.md

Priority 7:
03_Distributor_Module_Specification.md

Priority 8:
04_Manufacturer_Module_Specification.md

Priority 9:
11_Backend_Module_Implementation_Guide.md

Priority 10:
08_Database_Schema_And_ERD_Specification.md

Priority 11:
backend_architecture_updated.md

Priority 12:
09_Admin_Panel_Specification.md

Priority 13:
10_System_Architecture_And_Deployment.md

If documents conflict:

Higher priority document wins.

Never invent requirements.

Never invent screens.

Never invent workflows.

Never invent navigation.

Never invent API behavior.

Never invent sync behavior.

If documentation is unclear:

STOP

Document ambiguity.

Ask for clarification.

Never assume.

---

# FRONTEND GOVERNANCE PHILOSOPHY

Frontend is NOT responsible only for rendering UI.

Frontend is responsible for enforcing documented business workflows.

The mobile application must prevent invalid user actions before requests reach the backend.

Frontend must always validate:

* Navigation access
* Approval status
* Permissions
* Ownership visibility
* Visit requirements
* Offline constraints
* Required images
* Sync requirements

Backend remains source of truth.

Frontend must never contradict backend rules.

---

# MANDATORY PRE-TASK PROCESS

Before any implementation:

Step 1

Identify impacted module.

Step 2

Identify impacted role:

* Pending User
* Salesman
* Distributor
* Manufacturer

Step 3

Read ALL relevant documentation.

Step 4

Generate Documentation Understanding Report.

Step 5

Generate Frontend Blueprint.

Must include:

* Screens impacted
* Components impacted
* Navigation impact
* API impact
* WatermelonDB impact
* Zustand impact
* Sync impact
* Realtime impact
* Notification impact
* Testing impact

Step 6

Wait for approval.

Only after approval:

Step 7

Implement.

Step 8

Generate Verification Report.

Step 9

Generate Compliance Report.

Step 10

Generate Gap Analysis.

Step 11

Wait for approval.

Never skip steps.

---

# REACT NATIVE ARCHITECTURE RULES

Mandatory structure:

src/

app/
navigation/
modules/
components/
services/
database/
sockets/
notifications/
store/
hooks/
constants/
theme/
utils/
types/
assets/

Never violate folder structure.

Never place business logic inside screens.

Never place API logic inside components.

Never place navigation logic inside reusable UI components.

Never place WatermelonDB queries directly inside UI.

---

# MODULE STRUCTURE RULES

Every module must contain:

screens/
components/
hooks/
services/
types/
validators/

Optional:

constants/
navigation/
utils/

Business logic belongs in:

services/

Form logic belongs in:

validators/

Screen logic belongs in:

hooks/

---

# STATE MANAGEMENT RULES

Zustand is only allowed for:

* Authentication State
* User State
* Permission State
* Theme State
* Network State
* Sync State

Never store:

* Orders
* Shops
* Visits
* Products
* Inventory

inside Zustand.

Those belong to WatermelonDB.

Never duplicate persistent data.

---

# TANSTACK QUERY RULES

Used only for:

* API communication
* Server synchronization
* Cache management
* Background refresh

Never use TanStack Query as local storage.

Never use TanStack Query instead of WatermelonDB.

WatermelonDB remains local source of truth while offline.

Backend remains global source of truth.

---

# WATERMELONDB GOVERNANCE

Mandatory Collections:

users
products
shops
visits
orders
order_items
locations
notifications
sync_queue

Every schema change must include:

* Collection update
* Migration
* Sync compatibility review
* Verification report

Never bypass WatermelonDB for offline-capable modules.

---

# OFFLINE FIRST GOVERNANCE

Offline support is mandatory.

Critical offline features:

* Shop Creation
* Visit Creation
* Visit Completion
* Order Creation
* Order Editing
* Location Tracking
* Verification Image Capture

Every offline action must:

* Create local record
* Create sync queue entry
* Support retries
* Support idempotency
* Support failure recovery

Never create online-only workflows unless documentation explicitly allows it.

---

# NAVIGATION GOVERNANCE

Root Navigation Flow:

Splash
↓
Auth Check
↓
Role Check
↓
Role Navigator

Supported Navigators:

Auth Navigator

Pending Approval Navigator

Salesman Navigator

Distributor Navigator

Manufacturer Navigator

Never add screens outside documented navigation.

Never bypass approval restrictions.

Never expose restricted tabs.

---

# API GOVERNANCE

All APIs must comply with:

07_API_Contracts_And_Sync_Specification.md

Frontend must validate:

* Request structure
* Response structure
* Error structure
* Authentication requirements
* Sync requirements

Never invent endpoints.

Never invent payloads.

Never invent response fields.

---

# SOCKET.IO GOVERNANCE

Socket.IO allowed only for:

* Order Updates
* Notification Updates
* Approval Updates
* Dashboard Updates
* Sync Updates

All socket events must:

* Have reconnection strategy
* Have cleanup logic
* Have offline handling
* Have lifecycle management

No orphan socket subscriptions.

---

# FIREBASE GOVERNANCE

FCM is mandatory.

Notifications include:

* New Orders
* Order Updates
* Approval Updates
* Backorders
* Sync Results
* System Alerts

Every notification must support:

* Foreground handling
* Background handling
* Navigation routing
* Deep linking

---

# UI GOVERNANCE

Design authority:

06_Design_System_And_QA.md

Mandatory characteristics:

* Mobile First
* Fast
* Modern
* Clean
* Field Friendly

Avoid:

* ERP style UI
* Dense layouts
* Excessive colors
* Complex tables
* Small touch targets

Minimum touch target:

48px

Preferred:

56px

---

# FORM GOVERNANCE

All forms must use:

React Hook Form

Validation:

Zod

No uncontrolled business forms.

No custom validation logic outside validators.

---

# IMAGE GOVERNANCE

Mandatory image processing:

Before upload:

* Compress Image
* Resize Large Images
* Remove Metadata

Required image:

Shop Verification Photo

Shop creation must fail without image.

Never bypass verification photo requirements.

---

# ROLE GOVERNANCE

Pending User:

Can:

* Login
* View Catalogues
* View Manufacturers
* Complete Profile

Cannot:

* Create Orders
* Create Shops
* Check In
* Start Visits
* Manage Inventory

Salesman:

Field operations only.

Distributor:

Operational management.

Manufacturer:

Analytics and approvals.

Never expose unauthorized functionality.

---

# CRITICAL BUSINESS RULES

These rules are non-negotiable.

## Visit Centric Rule

Orders can only be created inside visits.

Frontend must never expose order creation outside active visits.

---

## Inventory Visibility Rule

Salesmen must never see:

* Inventory
* Available Quantity
* Reserved Quantity
* Stock Levels

This applies to:

* Screens
* APIs
* Cached Data
* Sync Data
* Search Results

---

## Verification Rule

Shop verification image is mandatory.

No image.

No shop creation.

---

## Approval Rule

Pending users receive catalogue-only experience.

Operational actions must be hidden and blocked.

---

## Offline Rule

Offline functionality is mandatory.

No critical workflow may depend on active internet.

---

## Ownership Rule

Salesmen only access assigned distributor ecosystem.

Distributors only access own ecosystem.

Manufacturers only access linked ecosystem.

Never expose global visibility.

---

# PERFORMANCE GOVERNANCE

Mandatory:

* FlatList virtualization
* Memoization where justified
* Lazy loading
* Query optimization
* Image optimization
* Render minimization

Avoid:

* Unbounded lists
* Heavy rerenders
* Large global state
* Business logic inside render cycle

---

# TESTING GOVERNANCE

Every module requires:

Unit Tests

Component Tests

Integration Tests

Navigation Tests

Offline Tests

Sync Tests

Permission Tests

Role Tests

Approval Tests

Error Handling Tests

Realtime Tests

Notification Tests

Performance Verification

No module is complete without testing.

---

# REQUIRED REPORTS

Before implementation:

1. Documentation Understanding Report
2. Frontend Blueprint Report

After implementation:

3. Verification Report
4. Compliance Report
5. Gap Analysis Report

Rejected implementation:

6. Remediation Plan

---

# RESPONSE RULES

When reviewing code:

Separate findings into:

COMPLIANT

PARTIAL

MISSING

CRITICAL GAP

Never use:

* Looks good
* Seems fine
* Probably works
* Appears correct

Every finding must reference:

* Documentation
* Screen
* Navigation
* API Contract
* Sync Contract
* Component
* Code Evidence

Evidence beats assumptions.

---

# FINAL GOVERNANCE RULE

If implementation violates:

* Product Specification
* UX Specification
* Navigation Specification
* Offline Specification
* API Contract
* Design System
* Business Rules

STOP.

Generate:

Remediation Plan

Wait for approval.

Only after remediation and re-verification may development continue.