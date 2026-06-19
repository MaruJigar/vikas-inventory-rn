# API Versioning Guide

The Vikas Inventory Backend uses URI-based API versioning to ensure backward compatibility as the platform evolves.

## Current Version
The default API version is **`v1`**. 
All existing controllers automatically run under `/v1/...` without requiring any controller-level decorators, thanks to the global default version configured in `main.ts`.

## How to Create a New Version (`v2`)

When introducing breaking changes to an endpoint, do **not** modify the existing `v1` method if it's currently consumed by the frontend. Instead, create a new versioned endpoint.

### Method-Level Versioning
You can override the global default version for a specific route using the `@Version()` decorator:

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller('users')
export class UserController {
  // Available at: GET /v1/users
  @Get()
  getUsersV1() {
    return 'V1 Users';
  }

  // Available at: GET /v2/users
  @Version('2')
  @Get()
  getUsersV2() {
    return 'V2 Users';
  }
}
```

### Controller-Level Versioning
If an entire feature is being rewritten, you can create a separate controller for `v2`:

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller('orders')
@Version('2')
export class OrdersV2Controller {
  @Get()
  getOrders() {
    return 'V2 Orders implementation';
  }
}
```

## Special Cases

### Unversioned Routes (Version Neutral)
Some routes like `/health` are hit by internal infrastructure (e.g., Kubernetes, AWS target groups) that do not care about API versions. These routes should be declared as version neutral:

```typescript
import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';

@Controller('health')
@Version(VERSION_NEUTRAL)
export class HealthController {
  // Available at: GET /health
}
```

## Deprecation Strategy
1. Introduce the `v2` endpoint alongside `v1`.
2. Wait for the mobile application (`vikas-inventory-rn`) and `admin-panel` to migrate.
3. Monitor logs to confirm `v1` traffic has ceased.
4. Add the `@nestjs/swagger` `@ApiDeprecated()` tag to the `v1` endpoint.
5. After the sunset period, remove the `v1` implementation.
