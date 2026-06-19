# Environment Setup Guide

This project strictly enforces environment variables at startup. If required variables are missing or incorrectly formatted, the application will fail to boot.

## Validation Strategy
The environment variables are validated using Zod schemas located in `src/config/env.validation.ts`. This ensures:
- All required keys are present.
- Numbers are correctly coerced (e.g., `PORT`, `DB_PORT`).
- Enumerations match defined values (e.g., `NODE_ENV`).
- Secrets meet length requirements.

## Required Variables

### Server
- `NODE_ENV`: Must be `development`, `production`, or `test`.
- `PORT`: (Default: `3000`) Server listen port.

### Database
- `DB_HOST`: PostgreSQL database host.
- `DB_PORT`: PostgreSQL port (usually `5432`).
- `DB_USER`: Database user.
- `DB_PASS`: Database password.
- `DB_NAME`: Database name.

### JWT
- `JWT_SECRET`: Must be at least 32 characters long. The app will fail to start if it is too short.
- `JWT_EXPIRES_IN`: (Optional, default `7d`) JWT expiration format.

## Optional & Seed Variables
Several variables are used for seeding initial admins or configuring UI URLs:
- `ADMIN_PANEL_URL` and `REACT_NATIVE_WEB_URL` are used for CORS.
- `SUPER_ADMIN_*`, `MANUFACTURER_ADMIN_*`, `DISTRIBUTOR_ADMIN_*`, `SALESMAN_*` configure default credentials for seeding operations.

## Managing Config Internally
Do not use `process.env.VAR_NAME` or `configService.get('VAR_NAME')` explicitly scattered across the application.
Instead, use the strongly typed configuration namespaces:
- `appConfig`
- `databaseConfig`
- `jwtConfig`

These are injected using NestJS standard syntax:
```ts
constructor(@Inject(jwtConfig.KEY) private jwtCfg: any) {}
```
