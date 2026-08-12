# Bundle 4 — A Master Leads

This bundle installs the production MongoDB-backed A master lead domain.

## Production rules
- One permanent lead record per company/opportunity journey. Stage changes do not create duplicate lead rows.
- Permanent IDs use `AIM-L-000001` sequencing and never change after creation.
- Active internal users can read the master register. A team member can create leads, but new leads are assigned to that member unless an ADMIN assigns another active owner.
- Only ADMIN or the assigned owner can edit/archive a lead. Only ADMIN can restore an archived lead.
- Delete is a soft archive. Audit history is retained.
- Lists are server paginated with a maximum page size of 100 and support server search/filter/sort.
- Additional contacts remain embedded under the same permanent lead because they are part of the company lead aggregate.
- C1/C2/C3/C4 actual activity is not fabricated here. Phase 5 and Phase 6 will attach journey records to this same lead `_id`.
- AIM Master actual lead count and upcoming follow-ups become live in this phase.

## Scope
Backend: lead model, lead audit model, CRUD/archive/restore/history/summary API, indexes, validation, RBAC ownership, dashboard aggregation, tests.
Frontend: full A form, multiple contacts, 3 planned follow-ups, server-paginated lead register, filters, sorting, archive confirmation, audit-history modal, links into I and M, React Query, React Hook Form + Zod, tests.
