# FundsProjects AIM — Phase 7 Final Localhost Hardening

Phase 7 closes the production-grade localhost V1 engineering scope before staging/AWS work.

## Added

- My Profile backed by actual target, pipeline, commission and upcoming-work data.
- Admin-only CSV/XLSX lead import with preview, validation, duplicate detection, row-level error export and permanent AIM lead IDs.
- Private authenticated lead document storage with a provider boundary that can be replaced by object storage in cloud deployment.
- FundsMailer, Chatting/WhatsApp and Calling integration boundaries. Local V1 uses safe deep-link fallbacks; calling records remain recording-URL ready.
- Final frontend permission regression: TEAM_MEMBER pages do not request the ADMIN-only user list.
- Local MongoDB backup and explicit-confirmation restore scripts.
- Secret/sensitive-file scanner and cleanup of temporary environment backup files.
- GitHub quality-gate workflow for lint, tests, builds, dependency audits and secret scan. Deployment is intentionally deferred to the AWS phase.
- Final runtime verification and consolidated localhost quality-gate scripts.

## Import columns

Recognized columns include: Company, Full Name, Designation, Email, Mobile/Contact, WhatsApp, LinkedIn Profile URL, Industry, Sub Sector, Business Model(s), Company Size, Employee Strength, Annual Turnover, Estimated Budget, Country, State, City, Website, LinkedIn Post URL, Post Date, Post Content, Business Requirement Analysis, Buying Intent Score, Lead Priority, Personalized Comment, First Message, Sales Stage, Source/Lead Source, Temperature, Decision Makers, Company Overview, Pain Points, Internal Comments, Next Action, Next Follow-up Date, Attachment URL, Research Notes and Additional Contacts.

`Additional Contacts` format: `Name|Designation|Email|Mobile|WhatsApp;Name 2|Designation 2|Email 2|Mobile 2|WhatsApp 2`.

The importer requires Company, Full Name and Industry, and limits a single file to 6,000 data rows.

## Storage boundary

Localhost stores private files under `backend/storage/private` and never serves that directory statically. Downloads go through authenticated API authorization. Production cloud storage will replace this provider with private object storage and signed/download-controlled access without changing the document domain model.

## Final localhost commands

Start:

```bash
./scripts/dev-local.sh
```

Verify:

```bash
./scripts/verify-phase7.sh
```

Full quality gate:

```bash
./scripts/final-localhost-check.sh
```

Backup:

```bash
./scripts/backup-local.sh
```

Restore requires an explicit backup path and interactive `RESTORE` confirmation.
