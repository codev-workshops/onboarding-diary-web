# Onboarding Diary — Decisions, Assumptions & Suggested Features

## Stack (fixed for this assessment)

Next.js App Router + TypeScript + Prisma + SQLite + Tailwind CSS + NextAuth (credentials) + recharts.

### Rationale

| Decision | Rationale |
|---|---|
| Next.js App Router + TypeScript | **Agent ergonomics**: one framework covers UI, API routes, and auth wiring with strong typing end-to-end — fewer moving parts for AI-driven incremental builds, and conventions (file-based routing, route handlers) make diffs predictable and reviewable. |
| Single-process architecture | **Demo velocity**: no separate backend/frontend servers, no CORS, one `npm run dev`; trivial to run and demo anywhere. |
| Prisma + SQLite | **SQLite-now / Postgres-ready**: zero-install file database for the demo; the schema avoids SQLite-only features so switching to Postgres is a datasource change + migration (enum strings become native enums). Prisma gives typed queries and parameterization (injection safety) for free. |
| NextAuth credentials | Meets the brief's email+password requirement without external IdP dependencies; session/CSRF handling built in. |
| Tailwind CSS | Fast, consistent responsive styling with utility classes; no design-system overhead. |
| recharts | Lightweight React-native charting for the planned Step 3 dashboard charts. |

## Explicit assumptions

1. Self-signup always creates a **RECRUIT**; managers and admins are provisioned by an admin (a seeded admin account bootstraps the system).
2. Manager↔recruit oversight is modeled many-to-many, but the demo default is **one manager per recruit**.
3. Managers have **read-only** access to recruit entries — they never edit or delete a recruit's data.
4. Report date ranges are capped at 366 days; reports are generated synchronously (data volumes are demo-scale).
5. No email verification, password recovery email, or SSO in this phase (Won't-haves); admin password reset covers lockouts.
6. Soft deactivation (`active=false`) instead of hard user deletion, preserving diary history; entry deletes are hard deletes by their owner.
7. Single-tenant: one organization per deployment; no department-level permissions (department is informational).
8. Dates are stored as date-only values in the user's submitted form; no timezone conversion logic in this phase.

## Suggested additional features

| # | Feature | Value |
|---|---|---|
| 1 | **Dashboard charts** (recharts) — planned Step 3 pick | Visual task-completion and issue-trend charts make progress obvious at a glance for recruits and managers. |
| 2 | **Onboarding checklist templates** — planned Step 3 pick | Admins define reusable checklists (e.g. "Week 1") that auto-seed a recruit's task log, standardizing onboarding across hires. |
| 3 | Global full-text search | Find any past task/issue/note instantly across entry types, keeping the diary useful as it grows. |
| 4 | Manager comments on entries | Lightweight feedback loop — managers can respond to issues/feedback in context instead of out-of-band email. |
| 5 | Weekly digest for managers | Automatic summary of each recruit's week (completed tasks, new issues) so managers stay informed without polling dashboards. |
| 6 | Issue SLA/aging indicators | Highlight blockers open beyond N days so onboarding friction gets escalated before it stalls a new hire. |
| 7 | CSV import/export of tasks | Bulk-load planned onboarding tasks from existing spreadsheets and take data out for HR tooling. |
