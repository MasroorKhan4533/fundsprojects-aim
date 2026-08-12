# FundsProjects AIM — Bundle 1 Authentication & User Management

Production V1 localhost authentication slice.

Includes:
- controlled internal registration requests
- admin approval/rejection
- secure one-time activation links
- password setup and reset
- email/mobile/user-ID login
- short-lived access cookie + rotating opaque refresh session
- backend RBAC
- account lockout + auth-specific rate limiting
- session revocation on password/role/status changes
- security audit records
- local Mailpit SMTP inbox
- admin user management UI
- React Query + React Hook Form + Zod integration
- MongoDB indexes and TTL cleanup for sessions/tokens
- automated backend/frontend quality gates

Local bootstrap administrator:
- Email: admin@fundsprojects.local
- Password: Admin@12345

The bootstrap credential is for localhost testing only and must be replaced for production deployment.
