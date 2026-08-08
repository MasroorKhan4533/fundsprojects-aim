# Bundle 0 — Production Engineering Foundation

## Status

This bundle intentionally establishes the permanent Production V1 engineering foundation before business modules are migrated. Prototype business modules are removed from the active `production-v1` source tree; the frozen prototype remains available in Git history / the protected prototype branch and reference package.

## Permanent architecture established

### Frontend
- React + Vite
- feature-based structure
- reusable shared UI primitives
- TanStack React Query for server state
- Zustand for cross-app client/UI state only
- centralized API transport with timeout and structured errors
- Zod environment validation
- application error boundary
- Testing Library + Vitest

### Backend
- Node + Express
- MongoDB + Mongoose
- strict environment validation using Zod
- structured Pino logging
- request correlation IDs
- security headers, CORS, compression and rate limiting
- standardized success/error response contracts
- MongoDB pool configuration
- liveness and readiness endpoints
- graceful shutdown
- Supertest + Vitest

### Local infrastructure
- Dockerized MongoDB with persistent named volume
- one-command bootstrap
- one-command local dev startup
- one-command local verification

## Phase boundary

Bundle 0 does not implement authentication or business APIs. Those are deliberately added in subsequent bundles on top of this permanent foundation rather than keeping the old PostgreSQL/Sequelize implementation alive.

## Health endpoints

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `GET /api/v1/health`

## Definition of Bundle 0 green

1. Docker MongoDB is healthy.
2. Backend lint/tests pass.
3. Frontend lint/tests/build pass.
4. Backend starts on port 5001.
5. Frontend starts on port 5173.
6. Frontend System Readiness shows MongoDB connected.
7. `./scripts/verify-local.sh` passes.
