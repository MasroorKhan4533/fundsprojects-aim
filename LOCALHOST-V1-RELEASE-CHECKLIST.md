# FundsProjects AIM — Localhost Production V1 Release Checklist

- [ ] Docker Desktop running.
- [ ] MongoDB container healthy.
- [ ] Mailpit container healthy.
- [ ] Backend readiness endpoint returns 200.
- [ ] Frontend opens on port 5173.
- [ ] Admin login works.
- [ ] Registration/approval/activation/reset flow works.
- [ ] AIM Master and Target Sheet work.
- [ ] A Master Leads create/edit/search/archive/restore works.
- [ ] I C1/C2 interactions persist and update AIM actuals.
- [ ] M C3/C4 commercial journey and BUILD handover work.
- [ ] My Profile loads actual targets/pipeline/commission/upcoming work.
- [ ] CSV/XLSX import preview validates duplicates and invalid rows.
- [ ] Lead private document upload/list/download/delete works.
- [ ] FundsMailer/WhatsApp/Calling capability endpoints are healthy.
- [ ] Backend lint/tests pass.
- [ ] Frontend lint/tests/build pass.
- [ ] Production dependency audits have no high-severity findings.
- [ ] Secret scan passes.
- [ ] Local MongoDB backup succeeds.
- [ ] Git working tree contains no `.env` or backup secret files.
- [ ] `production-v1` checkpoint pushed to GitHub.

AWS/staging/domain/HTTPS/monitoring remain intentionally outside this localhost checkpoint and continue in Phases 8–10.
