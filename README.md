# Onboarding Diary Web

A full-stack web application for new recruits to document their onboarding journey. Recruits can log daily tasks, record issues, provide feedback, and capture notes. Managers can view assigned recruits and generate reports. Admins can manage users and access all data.

## Tech Stack

| Layer     | Technology                                      |
|-----------|--------------------------------------------------|
| Frontend  | React 18+, TypeScript, Vite, Material UI (MUI)  |
| Backend   | Node.js, Express 5, TypeScript                   |
| Database  | PostgreSQL 15+, Prisma ORM                       |
| Auth      | JWT (access + refresh tokens)                    |
| Testing   | Jest, React Testing Library                      |

## Prerequisites

- **Node.js** v18+ (v22 recommended)
- **npm** v8+
- **PostgreSQL** 15+ running locally
- **Python** 3.8+ (for the management script)

## Quick Start

The project includes a `manage.py` script that handles the full application lifecycle.

### 1. Clone the repository

```bash
git clone https://github.com/codev-workshops/onboarding-diary-web.git
cd onboarding-diary-web
```

### 2. Set up the database

Ensure PostgreSQL is running and create the database:

```bash
createdb onboarding_diary
```

The backend expects the following connection string (configured in `backend/.env`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onboarding_diary
```

Update `backend/.env` if your PostgreSQL credentials differ.

### 3. Install dependencies

```bash
python manage.py install
```

This installs npm packages for both backend and frontend, and generates the Prisma client.

### 4. Start the application

```bash
python manage.py start
```

This will:
- Run `prisma generate` and `prisma db push` to sync the database schema
- Start the backend dev server on **http://localhost:3001**
- Start the frontend dev server on **http://localhost:5173**

### 5. Open the application

Visit **http://localhost:5173** in your browser to access the application.

## Management Script (`manage.py`)

The `manage.py` script provides commands to manage the entire application lifecycle.

### Usage

```bash
python manage.py <command> [options]
```

### Available Commands

| Command       | Description                                    |
|---------------|------------------------------------------------|
| `start`       | Start both backend and frontend                |
| `stop`        | Stop both backend and frontend                 |
| `restart`     | Restart both backend and frontend              |
| `start-be`    | Start backend only                             |
| `start-fe`    | Start frontend only                            |
| `stop-be`     | Stop backend only                              |
| `stop-fe`     | Stop frontend only                             |
| `clean`       | Clean build artifacts (dist, coverage)         |
| `clean --all` | Clean build artifacts and node_modules         |
| `build`       | Build both backend and frontend for production |
| `install`     | Install dependencies for both projects         |
| `status`      | Show running status of backend and frontend    |

### Examples

```bash
# Install all dependencies
python manage.py install

# Start the full application
python manage.py start

# Check if services are running
python manage.py status

# Restart everything
python manage.py restart

# Stop the application
python manage.py stop

# Start only the backend
python manage.py start-be

# Clean everything including node_modules and reinstall
python manage.py clean --all
python manage.py install

# Build for production
python manage.py build
```

### Logs

Application logs are stored in the `.pids/` directory:
- `.pids/backend.log` — Backend server output
- `.pids/frontend.log` — Frontend dev server output

## Manual Setup (without manage.py)

If you prefer to run things manually:

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit with your database credentials
npx prisma generate
npx prisma db push
npm run dev             # Starts on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev             # Starts on http://localhost:5173
```

## Running Tests

### Backend tests

```bash
cd backend
npm test                    # Run all tests
npm run test:coverage       # Run with coverage report
```

### Frontend tests

```bash
cd frontend
npx jest --forceExit                # Run all tests
npx jest --coverage --forceExit     # Run with coverage report
```

### Test Coverage

| Module   | Tests | Suites | Statement Coverage |
|----------|-------|--------|--------------------|
| Backend  | 242   | 26     | 91.53%             |
| Frontend | 177   | 33     | 84.62%             |

Both exceed the 70% coverage threshold.

## Project Structure

```
onboarding-diary-web/
├── manage.py                   # Application management script
├── sonar-project.properties    # SonarQube configuration
├── backend/
│   ├── src/
│   │   ├── config/             # Database, JWT, app configuration
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic
│   │   ├── validators/         # Input validation rules
│   │   └── __tests__/          # Unit tests
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios API client modules
│   │   ├── components/         # Shared components (MainLayout, ConfirmDialog)
│   │   ├── contexts/           # AuthContext for JWT state management
│   │   ├── pages/              # Page components organized by feature
│   │   ├── types/              # TypeScript type definitions
│   │   └── __tests__/          # Unit tests
│   └── package.json
└── README.md
```

## Features

### Roles

- **Recruit** — Log tasks, record issues, provide feedback, capture notes
- **Manager** — View assigned recruits, generate reports
- **Admin** — Manage users (CRUD), access all data

### Modules

- **Authentication** — Sign up, login, JWT token refresh, password reset
- **Task Log** — Create, edit, delete tasks with category, status, priority
- **Issue Log** — Track issues/blockers with severity and resolution notes
- **Feedback Notes** — Submit onboarding feedback (positive, suggestion, concern)
- **Additional Notes** — Free-form notes with tags
- **Dashboard** — Summary counts, task completion progress, recent activity
- **Reports** — Generate reports by date range, download as CSV
- **Admin Panel** — User management with role assignment and activate/deactivate
- **Profile** — Update profile info and change password

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Default                                                    | Description              |
|--------------------|------------------------------------------------------------|--------------------------|
| PORT               | 3001                                                       | Backend server port      |
| NODE_ENV           | development                                                | Environment mode         |
| DATABASE_URL       | postgresql://postgres:postgres@localhost:5432/onboarding_diary | PostgreSQL connection |
| JWT_ACCESS_SECRET  | *(required)*                                               | JWT access token secret  |
| JWT_REFRESH_SECRET | *(required)*                                               | JWT refresh token secret |
| JWT_ACCESS_EXPIRY  | 15m                                                        | Access token expiry      |
| JWT_REFRESH_EXPIRY | 7d                                                         | Refresh token expiry     |

## License

ISC
