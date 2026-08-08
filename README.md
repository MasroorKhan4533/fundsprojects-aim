# FundsProjects AIM — Production V1

Production V1 is being rebuilt as a MERN application:

- MongoDB
- Express.js
- React.js
- Node.js

## Bundle 0 foundation

The current foundation provides:

- strict environment validation
- MongoDB/Mongoose connectivity with pool configuration
- structured Pino logging and request IDs
- Helmet, CORS, compression and API rate limiting
- standardized API success/error contracts
- liveness/readiness health checks
- graceful server shutdown
- React Query for server state
- Zustand for cross-app client/UI state
- centralized frontend API transport
- reusable UI primitives
- Vitest/Supertest/Testing Library test foundations
- Dockerized local MongoDB
- lint/test/build verification scripts

## Local bootstrap

```bash
./scripts/bootstrap-local.sh
```

## Local development

```bash
./scripts/dev-local.sh
```

Then open http://localhost:5173.

In a second terminal, verify the full Bundle 0 stack:

```bash
./scripts/verify-local.sh
```

## Security

Never commit `.env`, credentials, tokens, production MongoDB URLs, AWS keys or provider secrets.

## Localhost Production V1

Phases 0–7 now cover the complete localhost product workflow: authentication, AIM Master/Targets, A Master Leads, I C1/C2, M C3/C4, My Profile, bulk lead import, private documents, integration boundaries and final engineering hardening.

Final verification:

```bash
./scripts/final-localhost-check.sh
```

Local MongoDB backup:

```bash
./scripts/backup-local.sh
```

Cloud staging, AWS deployment, domain/HTTPS and production operations continue in Phases 8–10.
