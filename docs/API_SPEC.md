# Onboarding Diary — API Specification

REST-ish JSON API under Next.js App Router route handlers.

## Conventions

- Base path: `/api`. All request/response bodies are JSON unless noted (report downloads).
- Auth: NextAuth session cookie; every non-auth endpoint requires a valid session. Role checked server-side.
- IDs: cuid strings.
- Timestamps: ISO 8601. Entry `date` fields: `YYYY-MM-DD`.
- Error response shape (all endpoints):

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Human-readable summary", "fields": { "title": "Title is required" } } }
```

| Status | Code | When |
|---|---|---|
| 400 | VALIDATION_ERROR | Body/query fails zod validation |
| 401 | UNAUTHENTICATED | No/expired session |
| 403 | FORBIDDEN | Role or scope check fails |
| 404 | NOT_FOUND | Missing record, or record outside caller's scope |
| 409 | CONFLICT | Duplicate (e.g. email in use — auth flows return generic 400 instead) |
| 429 | RATE_LIMITED | Auth rate limit hit |
| 500 | INTERNAL | Unexpected error (no details leaked) |

- List endpoints support `?page=1&pageSize=20` (max 100) and return `{ items: [...], total, page, pageSize }`.

## Auth & Profile

| Method | Path | Role | Description |
|---|---|---|---|
| POST | /api/register | public | Create recruit account |
| POST/GET | /api/auth/[...nextauth] | public | NextAuth login/logout/session (credentials) |
| GET | /api/me | any | Current user profile |
| PATCH | /api/me | any | Update own name/department/startDate |
| POST | /api/me/password | any | Change own password |

**POST /api/register** — body `{ email, password, name }`. Validation: email format (lowercased), password ≥8 chars with letter+digit, name 1–100 chars. 201 → `{ id, email, name, role: "RECRUIT" }`. Duplicate email → 400 generic "registration failed".

**PATCH /api/me** — body `{ name?, department?, startDate? }` (department ≤100 chars; startDate `YYYY-MM-DD`). 200 → updated profile. Role/email not updatable here.

**POST /api/me/password** — body `{ currentPassword, newPassword }`. Wrong current password → 400.

## Entry resources (shared pattern)

Tasks, issues, feedback, notes follow the same CRUD pattern; recruit operates on own entries; manager/admin have read access per authorization matrix (manager: assigned recruits via `?userId=`; admin: any via `?userId=`).

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/{tasks\|issues\|feedback\|notes} | any | List own entries; manager/admin may pass `?userId=` for scoped read |
| POST | /api/{...} | owner | Create entry (authorId = session user) |
| GET | /api/{...}/:id | owner / scoped mgr / admin | Fetch one |
| PATCH | /api/{...}/:id | owner | Update |
| DELETE | /api/{...}/:id | owner | Delete |

Out-of-scope `:id` access → 404. Non-owner mutation → 403.

### Tasks

Schema: `{ id, authorId, date, title, description?, category, status, priority, createdAt, updatedAt }`
- category: `GENERAL | TRAINING | SETUP | MEETING | DOCUMENTATION | OTHER`
- status: `TODO | IN_PROGRESS | DONE | BLOCKED`; priority: `LOW | MEDIUM | HIGH`
- Validation: date required; title 1–200; description ≤5000; enums as above.
- List filters: `?from=&to=&category=&status=` (combined with AND).

### Issues

Schema: `{ id, authorId, date, title, description?, severity, status, resolutionNotes?, createdAt, updatedAt }`
- severity: `LOW | MEDIUM | HIGH | CRITICAL`; status: `OPEN | IN_PROGRESS | RESOLVED`
- Validation: title 1–200; description/resolutionNotes ≤5000.
- List filters: `?status=&severity=&from=&to=`.

### Feedback

Schema: `{ id, authorId, date, subject, type, details, createdAt, updatedAt }`
- type: `POSITIVE | SUGGESTION | CONCERN`
- Validation: subject 1–200; details 1–5000.
- List filters: `?type=&from=&to=`.

### Notes

Schema: `{ id, authorId, date, title, content, tags: string[], createdAt, updatedAt }`
- Validation: title 1–200; content 1–5000; ≤10 tags, each 1–30 chars (stored comma-separated, exposed as array).
- List filters: `?tag=&from=&to=`.

## Dashboard

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/dashboard | any | Role-appropriate summary |

- Recruit → `{ taskCounts: {TODO,IN_PROGRESS,DONE,BLOCKED}, completionPct, openIssues, feedbackCount, noteCount, recent: [{type,id,title,date}] (5) }`
- Manager → `{ recruits: [{ userId, name, completionPct, openIssues, lastActivity }] }`
- Admin → `{ usersByRole, totals: {tasks,issues,feedback,notes} }`

## Reports

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/reports | any (scoped) | Generate & download a report |

**GET /api/reports** — query `{ userId?, from, to, types, format }`
- `types`: comma list of `tasks,issues,feedback` (or `combined` = all three)
- `format`: `pdf | csv`
- `userId` optional; defaults to self. Recruit: self only (else 403). Manager: self or assigned recruit. Admin: any user.
- Validation: `from ≤ to`, span ≤366 days.
- 200 → file stream, `Content-Type: application/pdf` or `text/csv`, `Content-Disposition: attachment; filename="report_<user>_<from>_<to>.<ext>"`.

## Admin

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/admin/users | admin | List users (`?role=&q=` name/email search) |
| POST | /api/admin/users | admin | Create user `{ email, password, name, role, department?, startDate? }` |
| PATCH | /api/admin/users/:id | admin | Update profile fields, `role`, `active` |
| POST | /api/admin/users/:id/password | admin | Reset password `{ newPassword }` (invalidates sessions) |
| GET | /api/admin/assignments | admin | List manager↔recruit assignments (`?managerId=`) |
| POST | /api/admin/assignments | admin | Create `{ managerId, recruitId }` |
| DELETE | /api/admin/assignments/:id | admin | Remove assignment |

Assignment validation: `managerId` must be role MANAGER, `recruitId` role RECRUIT, pair unique (409 on duplicate). Admin cannot deactivate or demote the last active admin (400).
