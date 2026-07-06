# Observability & Metrics

The Vikas Inventory Backend automatically exports highly efficient Prometheus-compatible metrics, providing extreme visibility into the operational health of the application.

## Endpoints

### `GET /metrics`
Returns plain-text Prometheus format metrics.

**Security:**
- If `METRICS_TOKEN` is defined in your `.env` file, you must pass the header: `Authorization: Bearer <TOKEN>`.
- If `METRICS_TOKEN` is left blank, the endpoint is publicly accessible (useful for isolated VPC polling where the network itself is secure).

## Available Custom Metrics

| Metric Name | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | `method`, `route`, `statusCode` | Total count of all requests processed. |
| `http_request_duration_seconds` | Histogram | `method`, `route` | Duration of requests. Bucket values allow calculation of P95/P99 latency. |
| `http_errors_total` | Counter | `route`, `statusCode` | Total count of 4xx and 5xx errors. |
| `app_health_status` | Gauge | `service` | 1 if the backend/database is initialized, 0 if severely degraded. |

*Note: It also automatically exports default Node.js metrics such as CPU usage, heap memory, and event loop lag.*

## Future Expansion
- **Grafana/Prometheus Integration**: Currently, these metrics are exposed natively via the `/metrics` endpoint. In the future, a Prometheus server should be configured to scrape this endpoint every 15s.
- **Alerting**: Once scraped, Grafana can alert Devops automatically if the `http_errors_total` spikes above normal baselines.
- **Cardinality Protection**: The middleware utilizes `req.route.path` rather than the raw URL. This prevents an explosion of memory usage when dynamic IDs are passed (e.g., `/users/123` is safely grouped as `/users/:id`). Unmatched routes are clumped under `unmatched_route`.
