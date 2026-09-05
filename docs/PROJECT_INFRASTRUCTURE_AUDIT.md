# Executive Summary
This document provides a comprehensive infrastructure audit of the Vikas Inventory Backend. The system is a robust, modular NestJS application using TypeORM with PostgreSQL, JWT-based authentication, and a well-defined Role-Based Access Control (RBAC) system. The audit covers architecture, authentication, authorization, database, validation, logging, exceptions, WebSockets, testing, environments, and deployment.

# Architecture Overview
The application follows a standard modular NestJS architecture. It serves as a unified backend for an Admin Panel and a React Native mobile app.
- **Framework:** NestJS
- **Language:** TypeScript
- **Database ORM:** TypeORM
- **Database Engine:** PostgreSQL
- **Real-time:** Socket.io via `@nestjs/websockets`
- **Global Pipes:** `ValidationPipe` is enabled globally with `whitelist: true` and `transform: true` in `main.ts`.
- **Global Filters:** `DatabaseExceptionFilter` is applied globally.
- **API Documentation:** Swagger is configured and automatically generates an `openapi.json` file on startup.
- **Static Files:** Served via `ServeStaticModule` from a configured upload directory.
- **CORS:** Configured to allow localhost ports (3000, 3001, 8081) and URLs from environment variables (`ADMIN_PANEL_URL`, `REACT_NATIVE_WEB_URL`).

# Module Inventory
The `src/` directory contains a rich set of modules handling specific business domains:
- **Core/Shared:** `app.module`, `auth`, `user`, `role-permission`, `common`, `health`, `mcp-tools`
- **Users/Roles:** `approval`, `manufacturer`, `distributor`, `salesman`
- **Inventory/Products:** `product`, `product-pricing`, `inventory`, `backorder`
- **Sales/Visits:** `shop`, `shop-image`, `shop-duplicate-detection`, `shop-visit`, `visit`, `working-day`
- **Orders/Fulfillment:** `order`, `order-revision`, `billing`, `fulfillment`
- **System/Infrastructure:** `location`, `offline-sync`, `notification`, `socket-gateway`, `firebase-notification`, `analytics`, `background-job`, `audit-log`, `admin-panel-api`

# Authentication Audit
- **Implementation:** `AuthModule` using Passport-JWT.
- **Login Flow:** Validate credentials against the `User` entity (hashed using bcrypt), generate an access token and a refresh token.
- **Refresh Flow:** Refresh tokens are hashed and stored in the database (`hashed_refresh_token`). The `/refresh` endpoint validates the token and issues a new pair.
- **Token Settings:** Access tokens contain email, sub (userId), role, and approvalStatus. Refresh tokens expire in 7 days (`7d`).
- **File Locations:** `src/auth/auth.service.ts`, `src/auth/jwt.strategy.ts`, `src/auth/auth.controller.ts`.
- **Risk Level:** Low. The implementation uses secure bcrypt hashing for both passwords and refresh tokens.

# Authorization Audit
- **Implementation:** `RolesGuard` working in tandem with the `@Roles` decorator.
- **Flow:** Endpoints specify allowed roles via `@Roles('SUPER_ADMIN', 'SALESMAN', etc.)`. `RolesGuard` checks the `user.role` from the JWT payload against the allowed roles.
- **Usage:** Broadly applied across domain controllers (e.g., `ShopController`, `VisitController`, `OrderController`) paired with `JwtAuthGuard`.
- **File Locations:** `src/role-permission/roles.guard.ts`, `src/role-permission/roles.decorator.ts`.
- **Risk Level:** Low. Role verification is centralized and correctly applied to controllers.

# Database Audit
- **Implementation:** `@nestjs/typeorm` with PostgreSQL.
- **Configuration:** Set up asynchronously in `AppModule` using `ConfigService` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`).
- **Synchronize:** Currently set to `synchronize: true` in `app.module.ts`.
- **Logging:** `logging: true` is enabled in TypeORM configuration.
- **File Locations:** `src/app.module.ts`, `docker-compose.yml`.
- **Risk Level:** High. `synchronize: true` is dangerous in production as it can cause data loss or unintended schema modifications.
- **Recommendation:** Disable `synchronize` in production and enforce a strict TypeORM migration strategy.

# Validation Audit
- **Implementation:** `class-validator` and `class-transformer` paired with NestJS `ValidationPipe`.
- **Configuration:** Global validation pipe with `whitelist: true` strips unknown properties.
- **Coverage:** Extensive use of DTOs with decorators (`@IsString`, `@IsOptional`, `@IsUUID`, `@IsNumber`) across all modules.
- **File Locations:** `src/main.ts`, various `dto` folders (e.g., `src/auth/dto`, `src/visit/dto`).
- **Risk Level:** Low. Strong validation strategy is already in place.

# Logging Audit
- **Implementation:** Standard NestJS `Logger` module.
- **Usage:** Instances of `Logger` are instantiated in specific services (e.g., `BackgroundJobService`, `DatabaseExceptionFilter`). Some files like `socket.gateway.ts` rely on raw `console.log`.
- **File Locations:** `src/common/filters/database-exception.filter.ts`, `src/socket-gateway/socket.gateway.ts`.
- **Risk Level:** Medium. Console logging lacks structure, log levels, and log rotation, making debugging and observability difficult in production.
- **Recommendation:** Implement a structured logging solution (like Winston or Pino) globally, replacing all `console.log` statements.

# Exception Handling Audit
- **Implementation:** NestJS built-in HTTP Exceptions and custom filters.
- **Usage:** Extensive use of `ForbiddenException`, `BadRequestException`, `NotFoundException`, `ConflictException` across services (e.g., `VisitService`, `WorkingDayService`) to handle business logic constraints.
- **Global Filters:** `DatabaseExceptionFilter` is registered globally to catch and transform TypeORM database exceptions into friendly HTTP responses.
- **File Locations:** `src/main.ts`, `src/common/filters/database-exception.filter.ts`, `src/working-day/working-day.service.ts`.
- **Risk Level:** Low to Medium. Business logic exceptions are well handled. Normalizing all error responses into a single standard JSON structure could improve API consistency.

# WebSocket Audit
- **Implementation:** `@nestjs/websockets` with `socket.io`.
- **Authentication:** `AppSocketGateway` extracts the token from `handshake.auth.token` or `headers.authorization`, verifies it synchronously using `JwtService`, and joins a role-based room (`${role}:${sub}`).
- **Events:** Custom broadcasting implemented via `broadcastToRoom`.
- **File Locations:** `src/socket-gateway/socket.gateway.ts`.
- **Risk Level:** Medium. Synchronous JWT verification inside socket connection without rate limiting or structured error handling could lead to potential abuse.
- **Recommendation:** Implement rate limiting and use asynchronous validation with standard error emission.

# Testing Audit
- **Implementation:** Jest for Unit and E2E testing.
- **Coverage:** Numerous `.spec.ts` files exist alongside services and controllers (e.g., `visit.service.spec.ts`, `working-day.service.spec.ts`).
- **Scripts:** `test`, `test:watch`, `test:cov`, `test:e2e` configured in `package.json`.
- **File Locations:** `package.json`, `test/` directory, `*.spec.ts` files.
- **Risk Level:** Low. Testing infrastructure is well integrated and actively used.

# Environment Audit
- **Implementation:** `@nestjs/config` (`ConfigModule` registered globally).
- **Variables:** `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_PANEL_URL`, `REACT_NATIVE_WEB_URL`, `UPLOAD_ROOT`, and seed admin credentials.
- **Risk Level:** Medium. `.env.example` shows credentials configuration. The system currently lacks strict startup validation for required environment variables (e.g., using Joi or Zod).
- **Recommendation:** Implement strict environment variable validation using Zod/Joi within `ConfigModule` to prevent application crash at runtime due to missing vars.

# Deployment Audit
- **Implementation:** `docker-compose.yml` provides a PostgreSQL database (`postgis/postgis:15-3.3`). The application provides `build`, `start:prod` scripts.
- **Artifacts:** A `Dockerfile` does not appear to be explicitly defined or standardized at the root. No explicit PM2 or CI/CD pipelines (GitHub Actions) were detected.
- **File Locations:** `Backend/docker-compose.yml`, `Backend/package.json`.
- **Risk Level:** High. The lack of standard Dockerfiles, CI/CD, and process managers limits the application's ability to be deployed safely and consistently on VPS.
- **Recommendation:** Create production-ready `Dockerfile`, a robust `docker-compose` for the backend, and integrate CI/CD workflows.

# Risks Identified
1. **[High] TypeORM Synchronize:** `synchronize: true` is enabled in `AppModule`.
2. **[High] Missing Containerization for Backend:** The Node.js app lacks a production `Dockerfile`.
3. **[Medium] Unstructured Logging:** Use of `console.log` in some areas and default `Logger` without rotation/transports.
4. **[Medium] Missing Environment Validation:** Missing strict validation schema for environment variables on boot.
5. **[Medium] WebSocket Security:** Connection flow lacks rate limiting and proper exception catching formatting.

# Recommendations Before Task 1
- **Current implementation:** Dependant on NestJS synchronize.
- **Recommended future action:** Switch TypeORM to `synchronize: false` and establish a strict migration pipeline. Provide a `Dockerfile` for the API. Integrate Zod for config validation and Pino/Winston for structured logging. Replace scattered `console.log` across the gateway.
