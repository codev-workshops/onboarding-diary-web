# Onboarding Diary — Requirements

Elaborated from the source requirements brief. Stack (fixed): Next.js App Router + TypeScript + Prisma + SQLite + Tailwind CSS + NextAuth (credentials) + recharts.

## Roles

| Role | Description |
|---|---|
| Recruit | New hire; logs tasks, issues, feedback, and notes; sees only their own data |
| Manager | Views entries of recruits they oversee; generates scoped reports |
| Admin | Manages users and manager↔recruit assignments; views all data |

MoSCoW: **M** = Must, **S** = Should, **C** = Could, **W** = Won't (this phase).

---

## 1. Authentication & Profile

| ID | Story | Priority |
|---|---|---|
| A1 | As a visitor, I can sign up with email + password so I can start my diary | M |
| A2 | As a user, I can log in and log out | M |
| A3 | As a user, I can view and edit my profile (name, department, start date) | M |
| A4 | As an admin, I am the only role that can change a user's role | M |
| A5 | As a user, I can change my password | S |

**Acceptance criteria**

- A1: Given a visitor on /register, When they submit a valid email, password (≥8 chars, 1 letter + 1 digit) and name, Then an account is created with role `RECRUIT` and they are redirected to login. Given an email already in use, When submitted, Then a generic "registration failed" error is shown (no account enumeration).
- A2: Given valid credentials, When submitted on /login, Then a session is established and the user lands on their role's dashboard. Given invalid credentials, Then a generic "invalid email or password" error is shown.
- A3: Given a logged-in user on /profile, When they save valid changes to name/department/start date, Then the profile updates; role is read-only here.
- A4: Given a non-admin, When they attempt any role change (UI or API), Then the request is rejected with 403.
- A5: Given a logged-in user, When they submit the correct current password and a valid new password, Then the password is re-hashed and updated; otherwise 400.

## 2. Task Log

| ID | Story | Priority |
|---|---|---|
| T1 | As a recruit, I can create a task entry (date, title, description, category, status, priority) | M |
| T2 | As a recruit, I can edit and delete my own task entries | M |
| T3 | As a recruit, I can filter my tasks by date range, category, or status | M |
| T4 | As a manager, I can view (read-only) tasks of recruits I oversee | M |

**Acceptance criteria**

- T1: Given a recruit on the task form, When they submit valid fields, Then the task is saved and appears in their list. Given a missing title or date, Then inline validation errors are shown and nothing is saved.
- T2: Given a recruit viewing their own task, When they edit/delete it, Then the change persists. Given a task owned by someone else, When accessed, Then 404/403 (no data leak).
- T3: Given tasks exist, When filters are applied, Then only matching tasks are listed and filters combine (AND).
- T4: Given a manager, When they open a supervised recruit's task list, Then entries render read-only (no edit/delete controls, mutating API calls rejected 403). Given a recruit not assigned to them, Then 403.

## 3. Issue Log

| ID | Story | Priority |
|---|---|---|
| I1 | As a recruit, I can log an issue/blocker (date, title, description, severity, status, resolution notes) | M |
| I2 | As a recruit, I can edit/delete my own issues and update status/resolution | M |
| I3 | As a recruit, I can filter issues by status or severity | M |
| I4 | As a manager, I can view issues of recruits I oversee | M |

**Acceptance criteria**

- I1: Given valid fields, When submitted, Then the issue is saved with severity in {LOW, MEDIUM, HIGH, CRITICAL} and status in {OPEN, IN_PROGRESS, RESOLVED}.
- I2: Given the owner, When they change status to RESOLVED, Then resolution notes may be added; ownership rules as T2.
- I3: Given issues exist, When status/severity filters are applied, Then only matching issues are listed.
- I4: Same scoping rules as T4.

## 4. Feedback Notes

| ID | Story | Priority |
|---|---|---|
| F1 | As a recruit, I can submit feedback (date, subject, type: Positive/Suggestion/Concern, details) | M |
| F2 | As a recruit, I can edit/delete my own feedback | M |
| F3 | As a manager, I can view feedback of recruits I oversee | M |

**Acceptance criteria**

- F1: Given valid fields with type in {POSITIVE, SUGGESTION, CONCERN}, When submitted, Then the entry is saved and listed newest-first.
- F2/F3: ownership and scoping identical to Task Log rules.

## 5. Additional Notes

| ID | Story | Priority |
|---|---|---|
| N1 | As a recruit, I can create free-form notes (date, title, content, tags) | M |
| N2 | As a recruit, I can edit/delete my own notes and filter by tag | S |
| N3 | As a manager, I can view notes of recruits I oversee | S |

**Acceptance criteria**

- N1: Given valid fields, When submitted, Then the note is saved; tags are a comma-separated set of ≤10 tags, each ≤30 chars.
- N2: Given notes with tags, When a tag filter is selected, Then only notes containing that tag are shown.

## 6. Dashboard

| ID | Story | Priority |
|---|---|---|
| D1 | As a recruit, I see summary counts (tasks by status, open issues, feedback, notes) and recent entries | M |
| D2 | As a recruit, I see task completion progress and open issues at a glance | M |
| D3 | As a manager, I see a roster of my recruits with per-recruit summary stats | M |
| D4 | As an admin, I see org-wide counts (users by role, totals per entry type) | S |

**Acceptance criteria**

- D1: Given a recruit with entries, When they open the dashboard, Then counts match the database and the 5 most recent entries across categories are listed with links.
- D2: Given tasks exist, When the dashboard renders, Then a completion percentage (DONE/total) and the count of OPEN + IN_PROGRESS issues are shown.
- D3: Given a manager with assigned recruits, When they open the dashboard, Then each recruit row shows task completion %, open issue count, and last activity date.

## 7. Reports

| ID | Story | Priority |
|---|---|---|
| R1 | As a recruit, I can generate a report of my own entries by date range and type (tasks, issues, feedback, or combined) | M |
| R2 | As a user, I can download a generated report as PDF or CSV | M |
| R3 | As a manager, I can generate reports for recruits I oversee (single recruit) | M |
| R4 | As an admin, I can generate reports for any user | S |

**Acceptance criteria**

- R1: Given a valid date range (from ≤ to), When a report is requested, Then it includes only entries within the range and of the selected type(s).
- R2: Given a generated report, When PDF/CSV is chosen, Then a file downloads with correct content type and a filename like `report_<user>_<from>_<to>.<ext>`.
- R3: Given a manager, When they request a report for an unassigned recruit, Then 403. When assigned, Then the report generates as R1.

## 8. User & Assignment Management (Admin)

| ID | Story | Priority |
|---|---|---|
| U1 | As an admin, I can list, create, edit, and deactivate users | M |
| U2 | As an admin, I can set a user's role (recruit/manager/admin) | M |
| U3 | As an admin, I can assign/unassign recruits to a manager | M |
| U4 | As an admin, I can reset a user's password | S |

**Acceptance criteria**

- U1: Given an admin on /admin/users, When they create a user with valid fields, Then the account exists and can log in. Deactivated users cannot log in (401 with generic message).
- U3: Given an admin, When they assign recruit X to manager Y, Then Y immediately gains read access to X's entries and X appears on Y's dashboard; unassignment revokes it.
- U4: Given an admin, When they reset a password, Then a new bcrypt hash replaces the old one and old sessions for that user are invalidated.

---

## Security

### Authentication strategy

- NextAuth **Credentials provider**; passwords hashed with **bcrypt, cost factor 12** (never stored or logged in plaintext).
- Sessions: NextAuth JWT strategy; cookie flags `httpOnly`, `SameSite=Lax`, `Secure` in production; session maxAge 7 days, rolled on activity.
- JWT carries `userId` and `role`; role is re-checked server-side per request (never trusted from the client).
- Login/registration return generic errors (no account enumeration); rate-limit auth endpoints (e.g. 5 attempts/min/IP).

### Authorization matrix (role × resource × action)

| Resource | Recruit | Manager | Admin |
|---|---|---|---|
| Own profile | read/update | read/update | read/update |
| Other profiles | — | read (assigned recruits) | read/update all |
| Roles & user accounts | — | — | full CRUD |
| Manager↔recruit assignments | — | read own | full CRUD |
| Task/Issue/Feedback/Note entries (own) | full CRUD | full CRUD (their own, if any) | full CRUD |
| Entries of assigned recruits | — | read only | read only (all users) |
| Entries of unassigned users | — | — | read only |
| Own dashboard | read | read (incl. roster) | read (org-wide) |
| Reports (self) | generate/download | generate/download | generate/download |
| Reports (others) | — | assigned recruits only | any user |

Enforcement: every API handler resolves the session server-side, checks role, and scopes queries by `authorId` (recruits) or via the `ManagerAssignment` join (managers). Object-level checks return 404 for records outside the caller's scope to avoid ID probing.

### Input validation rules

- All request bodies and query params validated with **zod** schemas shared between client and server; unknown keys stripped.
- Strings trimmed; lengths bounded (title ≤200, subject ≤200, description/content/details ≤5000, tag ≤30).
- Dates: ISO 8601 `YYYY-MM-DD`; report ranges require `from ≤ to` and span ≤366 days.
- Enums (status, severity, priority, category, feedback type, role) validated against fixed lists.
- Email: RFC-style format check + lowercase normalization; password policy ≥8 chars with letter + digit.
- IDs: cuid/uuid format-checked before queries.

### OWASP-relevant considerations

| Risk | Mitigation |
|---|---|
| A01 Broken access control | Central per-request role + ownership checks; deny by default; scoped Prisma queries |
| A02 Cryptographic failures | bcrypt(12) hashes; secrets via env vars; HTTPS assumed in deployment |
| A03 Injection | Prisma parameterized queries only (no raw SQL); zod validation |
| A05 Security misconfiguration | Secure cookie flags, `X-Content-Type-Options`, `X-Frame-Options=DENY`, minimal error detail in responses |
| A07 Identification & auth failures | Rate limiting on auth routes, generic errors, session invalidation on password reset/deactivation |
| XSS | React auto-escaping; no `dangerouslySetInnerHTML`; user content rendered as text |
| CSRF | NextAuth built-in CSRF token on auth routes; SameSite=Lax cookies; state-changing routes require session |
| Sensitive data exposure | Password hash never serialized in API responses; logs exclude credentials and tokens |
