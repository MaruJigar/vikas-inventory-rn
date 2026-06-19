# Production Health Checks

The Vikas Inventory Backend implements industry-standard health probes to facilitate robust deployments behind load balancers, PM2, Docker, or Kubernetes.

## Endpoints

### 1. `GET /health`
A simple heartbeat endpoint returning a JSON status payload.
```json
{
  "status": "ok",
  "timestamp": "2026-06-19T10:00:00.000Z"
}
```

### 2. `GET /health/live` (Liveness Probe)
Verifies that the Node.js application process is running and accepting HTTP connections.
- **Dependency checks:** None.
- **Orchestrator Behavior:** If this endpoint fails repeatedly, the orchestrator (e.g., Kubernetes) will restart the container.
- **Response Format:** Terminus standard health check structure.

### 3. `GET /health/ready` (Readiness Probe)
Verifies that the application is fully booted and connected to all essential external services (Database, Config loading).
- **Dependency checks:** 
  - `database`: Validates TypeORM Postgres connection.
  - `configuration`: Validates environment variables have loaded successfully.
- **Orchestrator Behavior:** If this endpoint fails, the load balancer temporarily stops sending user traffic to the instance until it recovers. It does **not** trigger a restart.
- **Response Format:** Terminus standard health check structure.

## Future Extensibility
When introducing external asynchronous systems (like Redis or RabbitMQ), you should create a new `HealthIndicator` (e.g., `redis.health.ts`) and add it strictly to the `checkReadiness()` array in `HealthController`. Liveness probes should remain isolated from external network dependencies.
