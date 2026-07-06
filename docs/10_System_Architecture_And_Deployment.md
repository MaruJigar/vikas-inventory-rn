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
NEXT_PUBLIC_BACKEND_URL=
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
