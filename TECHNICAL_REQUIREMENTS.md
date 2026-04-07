# Onboarding Diary Web Application - Technical Requirements

## Table of Contents

1. [Overview](#1-overview)
2. [User Stories](#2-user-stories)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [UI Flows](#5-ui-flows)
6. [Validation Rules](#6-validation-rules)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Suggested Improvements](#8-suggested-improvements)

---

## 1. Overview

### 1.1 Purpose

The Onboarding Diary is a web application that enables new recruits to document their onboarding journey by logging daily tasks, recording issues, providing feedback, and capturing notes. Managers can oversee their assigned recruits and generate reports, while Admins have full system control.

### 1.2 Tech Stack (Recommended)

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | React 18+ with TypeScript           |
| UI Library   | Material UI (MUI) or Tailwind CSS   |
| State Mgmt   | React Context / Zustand             |
| Routing      | React Router v6                     |
| Backend      | Node.js with Express / NestJS       |
| Database     | PostgreSQL 15+                      |
| ORM          | Prisma                              |
| Auth         | JWT (access + refresh tokens)       |
| File Export  | jsPDF (PDF), PapaParse (CSV)        |
| Testing      | Jest, React Testing Library, Cypress |
| CI/CD        | GitHub Actions                      |

### 1.3 Roles

| Role      | Description                                                  |
| --------- | ------------------------------------------------------------ |
| Recruit   | New employee documenting their onboarding journey            |
| Manager   | Supervises assigned recruits, views their data, generates reports |
| Admin     | Full system access: manage users, access all data            |

---

## 2. User Stories

### 2.1 Authentication & Profile

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 | Any     | As a user, I want to sign up with my email and password so I can create an account.            | - Sign-up form with email, password, confirm password. - Email must be unique. - Password meets strength requirements. - User receives confirmation.       |
| US-02 | Any     | As a user, I want to log in with my email and password so I can access my account.             | - Login form with email and password. - Returns JWT tokens on success. - Shows error on invalid credentials. - Redirect to dashboard on success.           |
| US-03 | Any     | As a user, I want to log out so I can securely end my session.                                 | - Clears tokens from storage. - Redirects to login page. - Subsequent API calls are rejected.                                                             |
| US-04 | Any     | As a user, I want to view and edit my profile so my information stays current.                 | - View name, email, role, department, start date. - Edit name, department, start date. - Role is read-only (set by Admin). - Changes persist on save.      |
| US-05 | Any     | As a user, I want to reset my password if I forget it.                                         | - "Forgot password" link on login page. - Email sent with reset link. - Reset link expires after 1 hour. - User can set a new password.                   |

### 2.2 Task Log

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-10 | Recruit | As a recruit, I want to create a task entry so I can log my daily work.                        | - Form with date, title, description, category, status, priority. - Saved task appears in task list. - Success notification shown.                         |
| US-11 | Recruit | As a recruit, I want to edit a task entry so I can correct or update details.                  | - Click edit on any task. - Pre-populated form. - Changes persist on save. - Only own tasks can be edited.                                                |
| US-12 | Recruit | As a recruit, I want to delete a task entry so I can remove incorrect records.                 | - Confirmation dialog before deletion. - Task removed from list. - Undo option available for 5 seconds.                                                  |
| US-13 | Recruit | As a recruit, I want to filter tasks by date, category, or status so I can find specific entries. | - Filter controls for date range, category dropdown, status dropdown. - List updates in real-time. - Multiple filters can be combined. - Clear all option. |
| US-14 | Recruit | As a recruit, I want to view my tasks in a paginated list so I can browse through history.     | - Default 10 tasks per page. - Pagination controls (prev/next/page numbers). - Sort by date (newest first by default).                                    |

### 2.3 Issue Log

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-20 | Recruit | As a recruit, I want to log an issue so I can track blockers I encounter.                      | - Form with date, title, description, severity, status, resolution notes. - Saved issue appears in list. - Success notification shown.                    |
| US-21 | Recruit | As a recruit, I want to edit an issue so I can update its status or add resolution notes.      | - Click edit on any issue. - Pre-populated form. - Can update status and resolution notes. - Changes persist on save.                                     |
| US-22 | Recruit | As a recruit, I want to delete an issue log entry.                                             | - Confirmation dialog before deletion. - Issue removed from list.                                                                                         |
| US-23 | Recruit | As a recruit, I want to filter issues by status or severity so I can focus on critical items.  | - Filter controls for status and severity. - List updates in real-time. - Filters can be combined.                                                        |
| US-24 | Recruit | As a recruit, I want to mark an issue as resolved with notes explaining the resolution.        | - "Resolve" action on issue. - Resolution notes field required. - Status changes to "Resolved". - Resolution date auto-set.                               |

### 2.4 Feedback Notes

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-30 | Recruit | As a recruit, I want to submit feedback about the onboarding process.                          | - Form with date, subject, type (Positive/Suggestion/Concern), details. - Saved feedback appears in list. - Success notification shown.                   |
| US-31 | Recruit | As a recruit, I want to edit my feedback entries.                                              | - Click edit on any feedback. - Pre-populated form. - Changes persist on save.                                                                            |
| US-32 | Recruit | As a recruit, I want to delete a feedback entry.                                               | - Confirmation dialog before deletion. - Feedback removed from list.                                                                                      |
| US-33 | Recruit | As a recruit, I want to filter feedback by type so I can review specific categories.           | - Dropdown filter for type. - List updates accordingly.                                                                                                   |

### 2.5 Additional Notes

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-40 | Recruit | As a recruit, I want to create free-form notes so I can capture anything related to onboarding. | - Form with date, title, content (rich text), tags. - Saved note appears in list.                                                                         |
| US-41 | Recruit | As a recruit, I want to edit my notes.                                                         | - Click edit on any note. - Pre-populated form with rich text editor. - Changes persist on save.                                                          |
| US-42 | Recruit | As a recruit, I want to delete notes.                                                          | - Confirmation dialog before deletion. - Note removed from list.                                                                                          |
| US-43 | Recruit | As a recruit, I want to search notes by title or tags so I can find specific entries.          | - Search input for text search. - Tag-based filter (multi-select). - Results update as user types.                                                        |

### 2.6 Dashboard

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-50 | Recruit | As a recruit, I want to see a dashboard summarizing my onboarding progress.                    | - Summary cards: total tasks, completed tasks, open issues, feedback count, notes count. - Recent entries section (last 5 across all categories). - Task completion progress bar. |
| US-51 | Recruit | As a recruit, I want to see my open issues at a glance.                                        | - Open issues list on dashboard with severity indicator. - Click to navigate to full issue.                                                               |
| US-52 | Manager | As a manager, I want to see an overview dashboard of all my assigned recruits.                 | - List of assigned recruits with onboarding start date. - Per-recruit summary: task count, open issues, days since start. - Click to drill into any recruit's data. |

### 2.7 Reports

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-60 | Recruit | As a recruit, I want to generate a report of my activities by date range.                      | - Date range picker (start/end). - Category filter: tasks, issues, feedback, or combined. - Preview report on screen before download.                     |
| US-61 | Recruit | As a recruit, I want to download my report as PDF or CSV.                                      | - "Download PDF" and "Download CSV" buttons. - PDF includes formatted tables and summary. - CSV includes all fields.                                      |
| US-62 | Manager | As a manager, I want to generate reports for recruits I oversee.                               | - Select recruit from assigned list. - Same date range and category filters. - Download as PDF or CSV. - Report header includes recruit name and department. |
| US-63 | Manager | As a manager, I want to generate a combined report for all my recruits.                        | - Option to select "All recruits" in report generator. - Aggregated data grouped by recruit. - Summary statistics at top.                                 |

### 2.8 Manager Features

| ID    | Role    | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-70 | Manager | As a manager, I want to view the task log of a recruit I oversee.                              | - Read-only access to recruit's tasks. - Same filtering capabilities as recruit view.                                                                     |
| US-71 | Manager | As a manager, I want to view the issue log of a recruit I oversee.                             | - Read-only access to recruit's issues. - Same filtering capabilities.                                                                                    |
| US-72 | Manager | As a manager, I want to view the feedback submitted by a recruit I oversee.                    | - Read-only access to recruit's feedback.                                                                                                                 |
| US-73 | Manager | As a manager, I want to view the notes of a recruit I oversee.                                 | - Read-only access to recruit's notes.                                                                                                                    |

### 2.9 Admin Features

| ID    | Role  | Story                                                                                          | Acceptance Criteria                                                                                                                                       |
| ----- | ----- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-80 | Admin | As an admin, I want to create new user accounts.                                               | - Form with name, email, password, role, department, start date. - Email must be unique. - New user appears in user list.                                 |
| US-81 | Admin | As an admin, I want to view a list of all users.                                               | - Paginated list with name, email, role, department, status. - Search by name or email. - Filter by role or department.                                   |
| US-82 | Admin | As an admin, I want to edit any user's profile.                                                | - Edit name, role, department, start date, active status. - Can assign/change manager for recruits. - Changes persist on save.                            |
| US-83 | Admin | As an admin, I want to deactivate a user account.                                              | - "Deactivate" action with confirmation. - Deactivated user cannot log in. - Data is preserved (soft delete). - Can be reactivated.                      |
| US-84 | Admin | As an admin, I want to delete a user account.                                                  | - Hard delete with confirmation and warning. - Requires typing user's email to confirm. - All associated data is deleted.                                 |
| US-85 | Admin | As an admin, I want to access any user's data for auditing purposes.                           | - Dropdown to select any user. - Full read access to all their entries.                                                                                   |
| US-86 | Admin | As an admin, I want to assign managers to recruits.                                            | - In user edit, select manager from dropdown. - Manager sees the recruit in their assigned list.                                                          |

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram (Textual)

```
User (1) ──── (N) TaskLog
User (1) ──── (N) IssueLog
User (1) ──── (N) FeedbackNote
User (1) ──── (N) AdditionalNote
User (1:Manager) ──── (N) User (Recruit)   [manager_id FK]
AdditionalNote (N) ──── (N) Tag             [through NoteTag join table]
```

### 3.2 Tables

#### 3.2.1 `users`

| Column       | Type                                     | Constraints                    | Description                        |
| ------------ | ---------------------------------------- | ------------------------------ | ---------------------------------- |
| id           | UUID                                     | PK, DEFAULT gen_random_uuid()  | Unique identifier                  |
| email        | VARCHAR(255)                             | UNIQUE, NOT NULL               | Login email                        |
| password_hash| VARCHAR(255)                             | NOT NULL                       | Bcrypt hashed password             |
| name         | VARCHAR(100)                             | NOT NULL                       | Full name                          |
| role         | ENUM('recruit','manager','admin')        | NOT NULL, DEFAULT 'recruit'    | User role                          |
| department   | VARCHAR(100)                             | NULL                           | Department name                    |
| start_date   | DATE                                     | NULL                           | Onboarding start date              |
| manager_id   | UUID                                     | FK -> users(id), NULL          | Assigned manager (for recruits)    |
| is_active    | BOOLEAN                                  | NOT NULL, DEFAULT true         | Soft delete / deactivation flag    |
| avatar_url   | VARCHAR(500)                             | NULL                           | Profile photo URL                  |
| created_at   | TIMESTAMP WITH TIME ZONE                 | NOT NULL, DEFAULT NOW()        | Record creation time               |
| updated_at   | TIMESTAMP WITH TIME ZONE                 | NOT NULL, DEFAULT NOW()        | Last update time                   |

**Indexes:** `idx_users_email` (unique), `idx_users_manager_id`, `idx_users_role`

#### 3.2.2 `task_logs`

| Column      | Type                                             | Constraints                    | Description                        |
| ----------- | ------------------------------------------------ | ------------------------------ | ---------------------------------- |
| id          | UUID                                             | PK, DEFAULT gen_random_uuid()  | Unique identifier                  |
| user_id     | UUID                                             | FK -> users(id), NOT NULL      | Owner of the task                  |
| date        | DATE                                             | NOT NULL                       | Task date                          |
| title       | VARCHAR(200)                                     | NOT NULL                       | Task title                         |
| description | TEXT                                             | NULL                           | Task description                   |
| category    | ENUM('learning','setup','meeting','coding','documentation','other') | NOT NULL        | Task category                      |
| status      | ENUM('not_started','in_progress','completed','deferred') | NOT NULL, DEFAULT 'not_started' | Task status                    |
| priority    | ENUM('low','medium','high','urgent')             | NOT NULL, DEFAULT 'medium'     | Task priority                      |
| created_at  | TIMESTAMP WITH TIME ZONE                         | NOT NULL, DEFAULT NOW()        | Record creation time               |
| updated_at  | TIMESTAMP WITH TIME ZONE                         | NOT NULL, DEFAULT NOW()        | Last update time                   |

**Indexes:** `idx_task_logs_user_id`, `idx_task_logs_date`, `idx_task_logs_user_date` (composite), `idx_task_logs_status`, `idx_task_logs_category`

#### 3.2.3 `issue_logs`

| Column           | Type                                             | Constraints                    | Description                        |
| ---------------- | ------------------------------------------------ | ------------------------------ | ---------------------------------- |
| id               | UUID                                             | PK, DEFAULT gen_random_uuid()  | Unique identifier                  |
| user_id          | UUID                                             | FK -> users(id), NOT NULL      | Owner of the issue                 |
| date             | DATE                                             | NOT NULL                       | Issue date                         |
| title            | VARCHAR(200)                                     | NOT NULL                       | Issue title                        |
| description      | TEXT                                             | NOT NULL                       | Issue description                  |
| severity         | ENUM('low','medium','high','critical')           | NOT NULL, DEFAULT 'medium'     | Issue severity                     |
| status           | ENUM('open','in_progress','resolved','closed')   | NOT NULL, DEFAULT 'open'       | Issue status                       |
| resolution_notes | TEXT                                             | NULL                           | How the issue was resolved         |
| resolved_at      | TIMESTAMP WITH TIME ZONE                         | NULL                           | When the issue was resolved        |
| created_at       | TIMESTAMP WITH TIME ZONE                         | NOT NULL, DEFAULT NOW()        | Record creation time               |
| updated_at       | TIMESTAMP WITH TIME ZONE                         | NOT NULL, DEFAULT NOW()        | Last update time                   |

**Indexes:** `idx_issue_logs_user_id`, `idx_issue_logs_date`, `idx_issue_logs_status`, `idx_issue_logs_severity`

#### 3.2.4 `feedback_notes`

| Column    | Type                                             | Constraints                    | Description                        |
| --------- | ------------------------------------------------ | ------------------------------ | ---------------------------------- |
| id        | UUID                                             | PK, DEFAULT gen_random_uuid()  | Unique identifier                  |
| user_id   | UUID                                             | FK -> users(id), NOT NULL      | Owner of the feedback              |
| date      | DATE                                             | NOT NULL                       | Feedback date                      |
| subject   | VARCHAR(200)                                     | NOT NULL                       | Feedback subject                   |
| type      | ENUM('positive','suggestion','concern')          | NOT NULL                       | Feedback type                      |
| details   | TEXT                                             | NOT NULL                       | Feedback details                   |
| created_at| TIMESTAMP WITH TIME ZONE                         | NOT NULL, DEFAULT NOW()        | Record creation time               |
| updated_at| TIMESTAMP WITH TIME ZONE                         | NOT NULL, DEFAULT NOW()        | Last update time                   |

**Indexes:** `idx_feedback_notes_user_id`, `idx_feedback_notes_date`, `idx_feedback_notes_type`

#### 3.2.5 `additional_notes`

| Column    | Type                         | Constraints                    | Description                        |
| --------- | ---------------------------- | ------------------------------ | ---------------------------------- |
| id        | UUID                         | PK, DEFAULT gen_random_uuid()  | Unique identifier                  |
| user_id   | UUID                         | FK -> users(id), NOT NULL      | Owner of the note                  |
| date      | DATE                         | NOT NULL                       | Note date                          |
| title     | VARCHAR(200)                 | NOT NULL                       | Note title                         |
| content   | TEXT                         | NOT NULL                       | Note content (supports rich text)  |
| created_at| TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT NOW()        | Record creation time               |
| updated_at| TIMESTAMP WITH TIME ZONE     | NOT NULL, DEFAULT NOW()        | Last update time                   |

**Indexes:** `idx_additional_notes_user_id`, `idx_additional_notes_date`

#### 3.2.6 `tags`

| Column | Type          | Constraints                    | Description         |
| ------ | ------------- | ------------------------------ | ------------------- |
| id     | UUID          | PK, DEFAULT gen_random_uuid()  | Unique identifier   |
| name   | VARCHAR(50)   | UNIQUE, NOT NULL               | Tag name (lowercase)|

**Indexes:** `idx_tags_name` (unique)

#### 3.2.7 `note_tags` (Join Table)

| Column  | Type | Constraints                          | Description          |
| ------- | ---- | ------------------------------------ | -------------------- |
| note_id | UUID | FK -> additional_notes(id), NOT NULL | Note reference       |
| tag_id  | UUID | FK -> tags(id), NOT NULL             | Tag reference        |

**Constraints:** PRIMARY KEY (note_id, tag_id), ON DELETE CASCADE for both FKs

#### 3.2.8 `refresh_tokens`

| Column     | Type                     | Constraints                    | Description                |
| ---------- | ------------------------ | ------------------------------ | -------------------------- |
| id         | UUID                     | PK, DEFAULT gen_random_uuid()  | Unique identifier          |
| user_id    | UUID                     | FK -> users(id), NOT NULL      | Token owner                |
| token_hash | VARCHAR(255)             | UNIQUE, NOT NULL               | Hashed refresh token       |
| expires_at | TIMESTAMP WITH TIME ZONE | NOT NULL                       | Token expiry               |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW()        | Creation time              |

**Indexes:** `idx_refresh_tokens_user_id`, `idx_refresh_tokens_token_hash`

#### 3.2.9 `password_reset_tokens`

| Column     | Type                     | Constraints                    | Description                |
| ---------- | ------------------------ | ------------------------------ | -------------------------- |
| id         | UUID                     | PK, DEFAULT gen_random_uuid()  | Unique identifier          |
| user_id    | UUID                     | FK -> users(id), NOT NULL      | Token owner                |
| token_hash | VARCHAR(255)             | UNIQUE, NOT NULL               | Hashed reset token         |
| expires_at | TIMESTAMP WITH TIME ZONE | NOT NULL                       | Expires 1 hour after creation |
| used       | BOOLEAN                  | NOT NULL, DEFAULT false        | Whether token has been used|
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW()        | Creation time              |

---

## 4. API Endpoints

### 4.1 Authentication

| Method | Endpoint                    | Description                  | Auth   | Request Body                                    | Response                              |
| ------ | --------------------------- | ---------------------------- | ------ | ----------------------------------------------- | ------------------------------------- |
| POST   | `/api/auth/signup`          | Register new user            | Public | `{ email, password, name }`                     | `201 { user, accessToken, refreshToken }` |
| POST   | `/api/auth/login`           | Login                        | Public | `{ email, password }`                           | `200 { user, accessToken, refreshToken }` |
| POST   | `/api/auth/logout`          | Logout (invalidate refresh)  | Auth   | `{ refreshToken }`                              | `200 { message }`                     |
| POST   | `/api/auth/refresh`         | Refresh access token         | Public | `{ refreshToken }`                              | `200 { accessToken, refreshToken }`   |
| POST   | `/api/auth/forgot-password` | Request password reset       | Public | `{ email }`                                     | `200 { message }`                     |
| POST   | `/api/auth/reset-password`  | Reset password with token    | Public | `{ token, newPassword }`                        | `200 { message }`                     |

### 4.2 User Profile

| Method | Endpoint                    | Description                  | Auth       | Request Body                                | Response                 |
| ------ | --------------------------- | ---------------------------- | ---------- | ------------------------------------------- | ------------------------ |
| GET    | `/api/profile`              | Get current user profile     | Auth       | -                                           | `200 { user }`           |
| PATCH  | `/api/profile`              | Update current user profile  | Auth       | `{ name?, department?, startDate? }`        | `200 { user }`           |
| PATCH  | `/api/profile/password`     | Change password              | Auth       | `{ currentPassword, newPassword }`          | `200 { message }`        |
| POST   | `/api/profile/avatar`       | Upload avatar                | Auth       | `multipart/form-data { avatar }`            | `200 { avatarUrl }`      |

### 4.3 Task Logs

| Method | Endpoint                    | Description                  | Auth       | Query Params / Body                         | Response                 |
| ------ | --------------------------- | ---------------------------- | ---------- | ------------------------------------------- | ------------------------ |
| GET    | `/api/tasks`                | List user's tasks            | Auth       | `?page, limit, dateFrom, dateTo, category, status, sortBy, sortOrder` | `200 { tasks[], total, page, limit }` |
| GET    | `/api/tasks/:id`            | Get single task              | Auth       | -                                           | `200 { task }`           |
| POST   | `/api/tasks`                | Create task                  | Auth       | `{ date, title, description?, category, status?, priority? }` | `201 { task }`           |
| PUT    | `/api/tasks/:id`            | Update task                  | Auth (own) | `{ date?, title?, description?, category?, status?, priority? }` | `200 { task }`           |
| DELETE | `/api/tasks/:id`            | Delete task                  | Auth (own) | -                                           | `200 { message }`        |

### 4.4 Issue Logs

| Method | Endpoint                    | Description                  | Auth       | Query Params / Body                         | Response                 |
| ------ | --------------------------- | ---------------------------- | ---------- | ------------------------------------------- | ------------------------ |
| GET    | `/api/issues`               | List user's issues           | Auth       | `?page, limit, dateFrom, dateTo, status, severity, sortBy, sortOrder` | `200 { issues[], total, page, limit }` |
| GET    | `/api/issues/:id`           | Get single issue             | Auth       | -                                           | `200 { issue }`          |
| POST   | `/api/issues`               | Create issue                 | Auth       | `{ date, title, description, severity?, status? }` | `201 { issue }`          |
| PUT    | `/api/issues/:id`           | Update issue                 | Auth (own) | `{ date?, title?, description?, severity?, status?, resolutionNotes? }` | `200 { issue }`          |
| PATCH  | `/api/issues/:id/resolve`   | Resolve issue                | Auth (own) | `{ resolutionNotes }`                       | `200 { issue }`          |
| DELETE | `/api/issues/:id`           | Delete issue                 | Auth (own) | -                                           | `200 { message }`        |

### 4.5 Feedback Notes

| Method | Endpoint                    | Description                  | Auth       | Query Params / Body                         | Response                 |
| ------ | --------------------------- | ---------------------------- | ---------- | ------------------------------------------- | ------------------------ |
| GET    | `/api/feedback`             | List user's feedback         | Auth       | `?page, limit, dateFrom, dateTo, type, sortBy, sortOrder` | `200 { feedback[], total, page, limit }` |
| GET    | `/api/feedback/:id`         | Get single feedback          | Auth       | -                                           | `200 { feedback }`       |
| POST   | `/api/feedback`             | Create feedback              | Auth       | `{ date, subject, type, details }`          | `201 { feedback }`       |
| PUT    | `/api/feedback/:id`         | Update feedback              | Auth (own) | `{ date?, subject?, type?, details? }`      | `200 { feedback }`       |
| DELETE | `/api/feedback/:id`         | Delete feedback              | Auth (own) | -                                           | `200 { message }`        |

### 4.6 Additional Notes

| Method | Endpoint                    | Description                  | Auth       | Query Params / Body                         | Response                 |
| ------ | --------------------------- | ---------------------------- | ---------- | ------------------------------------------- | ------------------------ |
| GET    | `/api/notes`                | List user's notes            | Auth       | `?page, limit, dateFrom, dateTo, search, tags, sortBy, sortOrder` | `200 { notes[], total, page, limit }` |
| GET    | `/api/notes/:id`            | Get single note              | Auth       | -                                           | `200 { note }`           |
| POST   | `/api/notes`                | Create note                  | Auth       | `{ date, title, content, tags? }`           | `201 { note }`           |
| PUT    | `/api/notes/:id`            | Update note                  | Auth (own) | `{ date?, title?, content?, tags? }`        | `200 { note }`           |
| DELETE | `/api/notes/:id`            | Delete note                  | Auth (own) | -                                           | `200 { message }`        |
| GET    | `/api/tags`                 | List all available tags       | Auth       | `?search`                                   | `200 { tags[] }`         |

### 4.7 Dashboard

| Method | Endpoint                        | Description                          | Auth       | Query Params                        | Response                 |
| ------ | ------------------------------- | ------------------------------------ | ---------- | ----------------------------------- | ------------------------ |
| GET    | `/api/dashboard`                | Get recruit's dashboard summary      | Auth       | -                                   | `200 { summary }`        |
| GET    | `/api/dashboard/recent`         | Get recent entries across categories | Auth       | `?limit`                            | `200 { recentEntries[] }` |
| GET    | `/api/manager/dashboard`        | Get manager's overview               | Manager+   | -                                   | `200 { recruits[] }`    |
| GET    | `/api/manager/recruits/:id/dashboard` | Get specific recruit's dashboard | Manager+ | -                                   | `200 { summary }`        |

**Dashboard Summary Response Shape:**
```json
{
  "summary": {
    "tasks": { "total": 45, "completed": 30, "inProgress": 10, "notStarted": 5 },
    "issues": { "total": 12, "open": 3, "resolved": 9 },
    "feedback": { "total": 8, "positive": 4, "suggestion": 3, "concern": 1 },
    "notes": { "total": 15 },
    "completionRate": 66.7,
    "daysOnboarding": 22
  }
}
```

### 4.8 Reports

| Method | Endpoint                         | Description                          | Auth       | Query Params                        | Response                 |
| ------ | -------------------------------- | ------------------------------------ | ---------- | ----------------------------------- | ------------------------ |
| GET    | `/api/reports`                   | Generate report for current user     | Auth       | `?dateFrom, dateTo, categories, format(json|pdf|csv)` | `200 { report }` or file download |
| GET    | `/api/reports/preview`           | Preview report data (JSON)           | Auth       | `?dateFrom, dateTo, categories`     | `200 { reportData }`    |
| GET    | `/api/manager/recruits/:id/reports` | Generate report for a recruit     | Manager+   | `?dateFrom, dateTo, categories, format` | `200 { report }` or file download |
| GET    | `/api/manager/reports`           | Generate combined report for all recruits | Manager+ | `?dateFrom, dateTo, categories, format` | `200 { report }` or file download |

### 4.9 Admin: User Management

| Method | Endpoint                    | Description                  | Auth  | Query Params / Body                                  | Response                 |
| ------ | --------------------------- | ---------------------------- | ----- | ---------------------------------------------------- | ------------------------ |
| GET    | `/api/admin/users`          | List all users               | Admin | `?page, limit, search, role, department, isActive`   | `200 { users[], total, page, limit }` |
| GET    | `/api/admin/users/:id`      | Get user details             | Admin | -                                                    | `200 { user }`           |
| POST   | `/api/admin/users`          | Create new user              | Admin | `{ email, password, name, role, department?, startDate?, managerId? }` | `201 { user }`           |
| PUT    | `/api/admin/users/:id`      | Update user                  | Admin | `{ name?, role?, department?, startDate?, managerId?, isActive? }` | `200 { user }`           |
| DELETE | `/api/admin/users/:id`      | Hard delete user + data      | Admin | `{ confirmEmail }` (body for safety)                 | `200 { message }`        |
| PATCH  | `/api/admin/users/:id/deactivate` | Deactivate user        | Admin | -                                                    | `200 { user }`           |
| PATCH  | `/api/admin/users/:id/activate`   | Reactivate user        | Admin | -                                                    | `200 { user }`           |

### 4.10 Manager: Recruit Data Access

| Method | Endpoint                                   | Description                  | Auth     | Query Params                        | Response                 |
| ------ | ------------------------------------------ | ---------------------------- | -------- | ----------------------------------- | ------------------------ |
| GET    | `/api/manager/recruits`                    | List assigned recruits       | Manager+ | `?page, limit`                      | `200 { recruits[] }`     |
| GET    | `/api/manager/recruits/:id/tasks`          | Get recruit's tasks          | Manager+ | Same as `/api/tasks`                | `200 { tasks[] }`        |
| GET    | `/api/manager/recruits/:id/issues`         | Get recruit's issues         | Manager+ | Same as `/api/issues`               | `200 { issues[] }`       |
| GET    | `/api/manager/recruits/:id/feedback`       | Get recruit's feedback       | Manager+ | Same as `/api/feedback`             | `200 { feedback[] }`     |
| GET    | `/api/manager/recruits/:id/notes`          | Get recruit's notes          | Manager+ | Same as `/api/notes`                | `200 { notes[] }`        |

### 4.11 Common API Patterns

**Pagination:**
```
GET /api/tasks?page=1&limit=10
Response: { data: [...], total: 45, page: 1, limit: 10, totalPages: 5 }
```

**Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Email is required" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
}
```

**HTTP Status Codes:**
| Code | Usage                                      |
| ---- | ------------------------------------------ |
| 200  | Successful GET, PUT, PATCH, DELETE         |
| 201  | Successful POST (resource created)         |
| 400  | Validation error / bad request             |
| 401  | Unauthenticated (missing/invalid token)    |
| 403  | Unauthorized (insufficient permissions)    |
| 404  | Resource not found                         |
| 409  | Conflict (e.g., duplicate email)           |
| 429  | Rate limited                               |
| 500  | Internal server error                      |

---

## 5. UI Flows

### 5.1 Application Layout

```
+--------------------------------------------------------------+
|  HEADER: Logo | Navigation Tabs | Profile Avatar | Logout    |
+--------------------------------------------------------------+
|                                                              |
|  SIDEBAR (responsive - collapsible on mobile):               |
|  - Dashboard                                                 |
|  - Task Log                                                  |
|  - Issue Log                                                 |
|  - Feedback                                                  |
|  - Notes                                                     |
|  - Reports                                                   |
|  - [Manager] My Recruits                                     |
|  - [Admin] User Management                                   |
|                                                              |
|  MAIN CONTENT AREA                                           |
|                                                              |
+--------------------------------------------------------------+
```

### 5.2 Authentication Flow

```
[Landing Page]
     |
     +---> [Sign Up Form] ---> email, password, confirm password, name
     |          |
     |          +---> Validation pass ---> Create Account ---> [Dashboard]
     |          +---> Validation fail ---> Show errors inline
     |
     +---> [Login Form] ---> email, password
     |          |
     |          +---> Success ---> [Dashboard]
     |          +---> Failure ---> Show "Invalid credentials" error
     |          +---> [Forgot Password] ---> Enter email
     |                    |
     |                    +---> Email sent ---> [Check Email Page]
     |                    +---> [Reset Password Form] ---> new password, confirm
     |                              |
     |                              +---> Success ---> [Login Form]
```

### 5.3 Dashboard Flow (Recruit)

```
[Dashboard]
  |
  +--- Summary Cards Row:
  |     [Total Tasks: 45] [Completed: 30] [Open Issues: 3] [Feedback: 8] [Notes: 15]
  |
  +--- Progress Section:
  |     [Task Completion: ====67%====------]
  |     [Days Onboarding: 22]
  |
  +--- Open Issues Panel:
  |     - Issue #1 (Critical) - "Cannot access VPN"
  |     - Issue #2 (Medium) - "Missing documentation"
  |     - Issue #3 (Low) - "Badge not working"
  |     Click any ---> [Issue Detail]
  |
  +--- Recent Activity Timeline:
        - Today: Completed "Set up IDE" (Task)
        - Today: Submitted feedback "Great mentor session" (Feedback)
        - Yesterday: Logged issue "Email config problem" (Issue)
        - Yesterday: Created note "Team meeting notes" (Note)
        Click any ---> [Entry Detail]
```

### 5.4 Task Log CRUD Flow

```
[Task Log List]
  |
  +--- Filter Bar: [Date Range] [Category ▼] [Status ▼] [Clear Filters]
  |
  +--- [+ New Task] button
  |       |
  |       +---> [Task Form Modal/Page]
  |               - Date (date picker, default today)
  |               - Title (text input)
  |               - Description (textarea)
  |               - Category (dropdown: Learning, Setup, Meeting, Coding, Documentation, Other)
  |               - Status (dropdown: Not Started, In Progress, Completed, Deferred)
  |               - Priority (dropdown: Low, Medium, High, Urgent)
  |               [Save] [Cancel]
  |
  +--- Task List (paginated table/cards):
        Each row: Date | Title | Category (chip) | Status (badge) | Priority (icon) | [Edit] [Delete]
          |
          +--- [Edit] ---> [Task Form Modal] (pre-populated)
          +--- [Delete] ---> [Confirmation Dialog] ---> "Are you sure?" [Yes] [No]
                              |
                              +--- Yes ---> Delete + show undo snackbar (5 sec)
```

### 5.5 Issue Log Flow

```
[Issue Log List]
  |
  +--- Filter Bar: [Date Range] [Status ▼] [Severity ▼] [Clear Filters]
  |
  +--- [+ New Issue] button ---> [Issue Form]
  |       - Date, Title, Description, Severity, Status
  |       [Save] [Cancel]
  |
  +--- Issue List:
        Each row: Date | Title | Severity (color-coded) | Status (badge) | [Edit] [Resolve] [Delete]
          |
          +--- [Resolve] ---> [Resolution Dialog]
                  - Resolution Notes (required textarea)
                  - [Confirm Resolve] [Cancel]
                  ---> Status = "Resolved", resolved_at = now
```

### 5.6 Feedback Flow

```
[Feedback List]
  |
  +--- Filter: [Type ▼: All | Positive | Suggestion | Concern]
  |
  +--- [+ New Feedback] ---> [Feedback Form]
  |       - Date (default today)
  |       - Subject (text)
  |       - Type (radio: Positive / Suggestion / Concern)
  |       - Details (textarea)
  |       [Submit] [Cancel]
  |
  +--- Feedback List:
        Each row: Date | Subject | Type (color chip: green/blue/orange) | [Edit] [Delete]
```

### 5.7 Notes Flow

```
[Notes List]
  |
  +--- Search Bar: [Search by title...] + [Tag Filter: multi-select]
  |
  +--- [+ New Note] ---> [Note Form]
  |       - Date (default today)
  |       - Title (text)
  |       - Content (rich text editor - bold, italic, lists, links)
  |       - Tags (tag input with autocomplete, create new tags inline)
  |       [Save] [Cancel]
  |
  +--- Notes List (card layout):
        Each card: Title | Date | Tags (chips) | Content preview (first 100 chars)
        Click card ---> [Note Detail View] ---> [Edit] [Delete]
```

### 5.8 Reports Flow

```
[Reports Page]
  |
  +--- Report Configuration:
  |     - Date Range: [Start Date] to [End Date]
  |     - Categories: [x] Tasks [x] Issues [x] Feedback [x] Notes
  |     - [Manager only] Recruit: [Select Recruit ▼ | All Recruits]
  |     [Generate Preview]
  |
  +--- Report Preview (on-screen):
  |     - Summary statistics
  |     - Tables for each selected category
  |     - Charts (task completion pie, issues by severity bar)
  |
  +--- Download: [Download PDF] [Download CSV]
```

### 5.9 Manager Flow

```
[My Recruits]
  |
  +--- Recruit List:
        Each row: Name | Department | Start Date | Tasks | Open Issues | Days
          |
          +--- Click ---> [Recruit Detail Dashboard]
                  |
                  +--- Same as Recruit Dashboard (read-only)
                  +--- Tabs: [Dashboard] [Tasks] [Issues] [Feedback] [Notes] [Reports]
                  +--- Each tab shows recruit's data (read-only) with filters
```

### 5.10 Admin User Management Flow

```
[User Management]
  |
  +--- Search & Filters: [Search name/email] [Role ▼] [Department ▼] [Active ▼]
  |
  +--- [+ Create User] ---> [User Form]
  |       - Name, Email, Password, Role, Department, Start Date, Manager (if recruit)
  |       [Create] [Cancel]
  |
  +--- User List (paginated table):
        Each row: Name | Email | Role (badge) | Department | Status | [Edit] [Deactivate/Activate] [Delete]
          |
          +--- [Edit] ---> [User Edit Form] (pre-populated, can change role and assign manager)
          +--- [Deactivate] ---> [Confirmation Dialog]
          +--- [Delete] ---> [Danger Dialog: Type user's email to confirm]
```

### 5.11 Page Routing

| Route                          | Component          | Auth Required | Role Required |
| ------------------------------ | ------------------ | ------------- | ------------- |
| `/`                            | Landing/Login      | No            | -             |
| `/signup`                      | Sign Up            | No            | -             |
| `/login`                       | Login              | No            | -             |
| `/forgot-password`             | Forgot Password    | No            | -             |
| `/reset-password/:token`       | Reset Password     | No            | -             |
| `/dashboard`                   | Dashboard          | Yes           | Any           |
| `/tasks`                       | Task Log List      | Yes           | Any           |
| `/tasks/new`                   | Task Form          | Yes           | Any           |
| `/tasks/:id/edit`              | Task Form (edit)   | Yes           | Own           |
| `/issues`                      | Issue Log List     | Yes           | Any           |
| `/issues/new`                  | Issue Form         | Yes           | Any           |
| `/issues/:id/edit`             | Issue Form (edit)  | Yes           | Own           |
| `/feedback`                    | Feedback List      | Yes           | Any           |
| `/feedback/new`                | Feedback Form      | Yes           | Any           |
| `/feedback/:id/edit`           | Feedback Form      | Yes           | Own           |
| `/notes`                       | Notes List         | Yes           | Any           |
| `/notes/new`                   | Note Form          | Yes           | Any           |
| `/notes/:id`                   | Note Detail        | Yes           | Own           |
| `/notes/:id/edit`              | Note Form (edit)   | Yes           | Own           |
| `/reports`                     | Reports            | Yes           | Any           |
| `/profile`                     | Profile Settings   | Yes           | Any           |
| `/manager/recruits`            | Recruits List      | Yes           | Manager+      |
| `/manager/recruits/:id`        | Recruit Detail     | Yes           | Manager+      |
| `/manager/recruits/:id/reports`| Recruit Reports    | Yes           | Manager+      |
| `/admin/users`                 | User Management    | Yes           | Admin         |
| `/admin/users/new`             | Create User        | Yes           | Admin         |
| `/admin/users/:id`             | User Detail/Edit   | Yes           | Admin         |

---

## 6. Validation Rules

### 6.1 Authentication

| Field            | Rules                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Email            | Required. Valid email format. Max 255 chars. Lowercase on save. Unique in system.                        |
| Password         | Required. Min 8 chars. At least 1 uppercase, 1 lowercase, 1 number, 1 special character (`!@#$%^&*`).   |
| Confirm Password | Required. Must match password field.                                                                     |
| Name             | Required. 2-100 chars. Letters, spaces, hyphens, and apostrophes only.                                   |

### 6.2 User Profile

| Field       | Rules                                                         |
| ----------- | ------------------------------------------------------------- |
| Name        | Required. 2-100 chars.                                        |
| Department  | Optional. Max 100 chars.                                      |
| Start Date  | Optional. Must be a valid date. Cannot be in the future.      |
| Avatar      | Optional. Max 2MB. JPG, PNG, or WebP only.                    |

### 6.3 Task Log

| Field       | Rules                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| Date        | Required. Valid date. Cannot be more than 30 days in the future.              |
| Title       | Required. 3-200 chars.                                                        |
| Description | Optional. Max 5,000 chars.                                                    |
| Category    | Required. Must be one of: `learning`, `setup`, `meeting`, `coding`, `documentation`, `other`. |
| Status      | Required. Must be one of: `not_started`, `in_progress`, `completed`, `deferred`. Default: `not_started`. |
| Priority    | Required. Must be one of: `low`, `medium`, `high`, `urgent`. Default: `medium`. |

### 6.4 Issue Log

| Field            | Rules                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Date             | Required. Valid date. Cannot be more than 30 days in the future.           |
| Title            | Required. 3-200 chars.                                                     |
| Description      | Required. 10-10,000 chars.                                                 |
| Severity         | Required. Must be one of: `low`, `medium`, `high`, `critical`. Default: `medium`. |
| Status           | Required. Must be one of: `open`, `in_progress`, `resolved`, `closed`. Default: `open`. |
| Resolution Notes | Required when status is `resolved` or `closed`. Max 5,000 chars.          |

### 6.5 Feedback Notes

| Field   | Rules                                                               |
| ------- | ------------------------------------------------------------------- |
| Date    | Required. Valid date.                                               |
| Subject | Required. 3-200 chars.                                              |
| Type    | Required. Must be one of: `positive`, `suggestion`, `concern`.      |
| Details | Required. 10-10,000 chars.                                          |

### 6.6 Additional Notes

| Field   | Rules                                                               |
| ------- | ------------------------------------------------------------------- |
| Date    | Required. Valid date.                                               |
| Title   | Required. 3-200 chars.                                              |
| Content | Required. Min 1 char. Max 50,000 chars.                             |
| Tags    | Optional. Array of strings. Each tag: 2-50 chars, alphanumeric + hyphens. Max 10 tags per note. |

### 6.7 Reports

| Field      | Rules                                                              |
| ---------- | ------------------------------------------------------------------ |
| Date From  | Required. Valid date.                                              |
| Date To    | Required. Valid date. Must be >= Date From. Max range: 365 days.   |
| Categories | Required. At least one of: `tasks`, `issues`, `feedback`, `notes`. |
| Format     | Required for download. Must be one of: `pdf`, `csv`.              |

### 6.8 Admin User Management

| Field      | Rules                                                                         |
| ---------- | ----------------------------------------------------------------------------- |
| Email      | Required. Valid email format. Unique in system.                               |
| Password   | Required on creation. Same rules as authentication password.                  |
| Name       | Required. 2-100 chars.                                                        |
| Role       | Required. Must be one of: `recruit`, `manager`, `admin`.                      |
| Department | Optional. Max 100 chars.                                                      |
| Start Date | Optional. Valid date.                                                         |
| Manager ID | Optional. Must reference an existing user with role `manager`. Required for recruits. |

### 6.9 General Validation Rules

- **XSS Prevention:** Sanitize all text inputs before storage. Strip HTML tags from plain text fields. Use a library like DOMPurify for rich text content.
- **SQL Injection:** Use parameterized queries (handled by ORM/Prisma).
- **Rate Limiting:** Max 100 requests per minute per IP for public endpoints. Max 300 requests per minute per authenticated user.
- **File Upload:** Validate MIME type on server side (not just extension). Scan for malicious content.
- **Pagination:** `page` must be >= 1. `limit` must be between 1 and 100. Default limit: 10.
- **UUID Parameters:** All `:id` route params must be valid UUIDs.
- **Date Formats:** All dates must be in ISO 8601 format (`YYYY-MM-DD`).

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric              | Target                                    |
| ------------------- | ----------------------------------------- |
| API response time   | < 200ms for standard CRUD operations      |
| Page load time      | < 2 seconds (initial), < 500ms (subsequent) |
| Report generation   | < 5 seconds for up to 1 year of data      |
| Concurrent users    | Support at least 500 simultaneous users   |

### 7.2 Security

- Passwords hashed with bcrypt (cost factor 12).
- JWT access tokens expire after 15 minutes.
- Refresh tokens expire after 7 days, stored hashed, single-use (rotation).
- HTTPS enforced in production.
- CORS configured to allow only the frontend origin.
- Helmet.js for security headers.
- Input sanitization on all endpoints.
- Role-based access control (RBAC) enforced at API middleware level.
- Recruits can only access their own data.
- Managers can only read data of their assigned recruits.
- Admin actions are audit-logged.

### 7.3 Accessibility

- WCAG 2.1 AA compliance.
- Keyboard navigable.
- Screen reader friendly (ARIA labels).
- Color contrast ratios meet AA standards.
- Focus indicators on all interactive elements.

### 7.4 Responsiveness

- Mobile-first design.
- Breakpoints: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px).
- Sidebar collapses to hamburger menu on mobile.
- Tables switch to card layout on mobile.

### 7.5 Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## 8. Suggested Improvements

### 8.1 Short-Term Enhancements

| # | Improvement                       | Description                                                                                              | Priority |
| - | --------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| 1 | **Email Notifications**           | Send email notifications for: welcome email on sign-up, weekly digest of activity, manager alerts when recruit logs a critical issue. | High     |
| 2 | **Activity Timeline**             | A unified timeline view showing all activities (tasks, issues, feedback, notes) in chronological order.  | High     |
| 3 | **Search Across All Categories**  | Global search bar that searches across tasks, issues, feedback, and notes simultaneously.                | Medium   |
| 4 | **Bulk Operations**               | Select multiple entries and perform bulk actions (delete, change status, change category).                | Medium   |
| 5 | **Dark Mode**                     | Toggle between light and dark themes. Persist preference in user profile.                                | Low      |
| 6 | **Onboarding Checklist Template** | Admin-defined onboarding checklist templates that auto-generate tasks for new recruits.                  | High     |

### 8.2 Medium-Term Features

| # | Improvement                       | Description                                                                                              | Priority |
| - | --------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| 7 | **Comments & Collaboration**      | Allow managers to add comments on recruit entries (tasks, issues). Enables two-way communication within the app. | High     |
| 8 | **File Attachments**              | Allow attaching files (screenshots, documents) to tasks, issues, and notes. Store in cloud storage (S3/GCS). Max 10MB per file, 5 files per entry. | Medium   |
| 9 | **Dashboard Analytics Charts**    | Interactive charts: task completion trend over time, issue resolution rate, feedback sentiment breakdown, activity heatmap (calendar view). | Medium   |
| 10| **Mentorship Pairing**            | Extend the manager concept to include a "buddy/mentor" role. Buddies can view and comment on recruit entries but can't generate reports. | Low      |
| 11| **Customizable Task Categories**  | Allow admins to define custom task categories and issue severity levels per department.                    | Medium   |
| 12| **Automated Reminders**           | Configurable reminders: daily prompt to log tasks, weekly reminder to submit feedback, nudge when no activity for 3+ days. | High     |

### 8.3 Long-Term / Advanced Features

| # | Improvement                       | Description                                                                                              | Priority |
| - | --------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| 13| **SSO Integration**               | Support SAML/OIDC for enterprise single sign-on (Okta, Azure AD, Google Workspace).                      | High     |
| 14| **Audit Log**                     | Track all user actions (create, update, delete) with timestamps and actor info. Viewable by admins. Useful for compliance. | High     |
| 15| **API Rate Limiting & Monitoring**| Advanced rate limiting with Redis. API monitoring dashboard for admins showing request volumes, error rates, response times. | Medium   |
| 16| **Multi-Language Support (i18n)** | Internationalization framework to support multiple languages. Start with English, plan for expansion.     | Low      |
| 17| **Mobile App (PWA)**              | Progressive Web App with offline support. Allow recruits to log tasks offline; sync when back online.     | Medium   |
| 18| **AI-Powered Insights**           | Analyze patterns across all recruits' data to identify common onboarding bottlenecks, suggest process improvements, and predict at-risk recruits. | Low      |
| 19| **Integration with HR Systems**   | Sync user data and department info from HRIS (e.g., BambooHR, Workday). Auto-create recruit accounts on hire. | Medium   |
| 20| **Onboarding Progress Milestones**| Define milestone stages (Week 1, Month 1, Quarter 1) with expected completions. Visual progress tracker showing where the recruit is in their journey. | High     |

### 8.4 Technical Improvements

| # | Improvement                       | Description                                                                                              |
| - | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1 | **Caching Layer**                 | Add Redis caching for dashboard summaries and frequently accessed data. Cache invalidation on writes.    |
| 2 | **Database Migrations**           | Use Prisma Migrate for version-controlled schema changes. Seed scripts for development data.             |
| 3 | **API Documentation**             | Auto-generate OpenAPI/Swagger docs from route definitions. Interactive API explorer at `/api/docs`.      |
| 4 | **Error Tracking**                | Integrate Sentry for frontend and backend error monitoring.                                              |
| 5 | **Logging**                       | Structured logging with Winston/Pino. Log levels: error, warn, info, debug. Correlation IDs for request tracing. |
| 6 | **Containerization**              | Docker + Docker Compose for local development. Production-ready Dockerfile with multi-stage builds.      |
| 7 | **CI/CD Pipeline**                | GitHub Actions: lint, test, build on PR. Auto-deploy to staging on merge to `develop`. Production deploy on release tag. |
| 8 | **E2E Testing**                   | Cypress tests covering critical user journeys: sign up, create task, resolve issue, generate report.     |
| 9 | **Database Backups**              | Automated daily backups with point-in-time recovery capability.                                          |
| 10| **Health Check Endpoint**         | `GET /api/health` returning app version, uptime, and database connectivity status.                       |

---

## Appendix A: Enum Reference

### Task Categories
| Value           | Display Name    |
| --------------- | --------------- |
| `learning`      | Learning        |
| `setup`         | Setup           |
| `meeting`       | Meeting         |
| `coding`        | Coding          |
| `documentation` | Documentation   |
| `other`         | Other           |

### Task Statuses
| Value          | Display Name  | Color   |
| -------------- | ------------- | ------- |
| `not_started`  | Not Started   | Gray    |
| `in_progress`  | In Progress   | Blue    |
| `completed`    | Completed     | Green   |
| `deferred`     | Deferred      | Orange  |

### Task Priorities
| Value    | Display Name | Color   | Icon    |
| -------- | ------------ | ------- | ------- |
| `low`    | Low          | Gray    | Arrow down |
| `medium` | Medium       | Yellow  | Arrow right |
| `high`   | High         | Orange  | Arrow up |
| `urgent` | Urgent       | Red     | Double arrow up |

### Issue Severities
| Value      | Display Name | Color  |
| ---------- | ------------ | ------ |
| `low`      | Low          | Green  |
| `medium`   | Medium       | Yellow |
| `high`     | High         | Orange |
| `critical` | Critical     | Red    |

### Issue Statuses
| Value         | Display Name  | Color  |
| ------------- | ------------- | ------ |
| `open`        | Open          | Red    |
| `in_progress` | In Progress   | Blue   |
| `resolved`    | Resolved      | Green  |
| `closed`      | Closed        | Gray   |

### Feedback Types
| Value        | Display Name | Color  |
| ------------ | ------------ | ------ |
| `positive`   | Positive     | Green  |
| `suggestion` | Suggestion   | Blue   |
| `concern`    | Concern      | Orange |

### User Roles
| Value     | Display Name | Permissions                          |
| --------- | ------------ | ------------------------------------ |
| `recruit` | Recruit      | CRUD own data, view own dashboard    |
| `manager` | Manager      | All Recruit permissions + read assigned recruits' data + generate reports |
| `admin`   | Admin        | All permissions + CRUD users + access all data |

---

## Appendix B: Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/onboarding_diary

# JWT
JWT_ACCESS_SECRET=<random-256-bit-key>
JWT_REFRESH_SECRET=<random-256-bit-key>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (for password reset & notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=<smtp-password>
EMAIL_FROM=Onboarding Diary <noreply@example.com>

# File Storage (for avatars & attachments)
STORAGE_PROVIDER=local  # or 's3'
STORAGE_PATH=./uploads
# S3_BUCKET=onboarding-diary-uploads
# S3_REGION=us-east-1

# Frontend
REACT_APP_API_URL=http://localhost:3001/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

*Document Version: 1.0*
*Last Updated: April 2026*
*Author: Onboarding Diary Development Team*
