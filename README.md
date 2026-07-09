# Onboarding Diary

Onboarding Diary - React web application for tracking onboarding progress.

New recruits log tasks, issues, feedback, and notes; managers view entries for the recruits they oversee and generate reports; admins manage users. Built with Next.js (App Router), TypeScript, Prisma, SQLite, Tailwind CSS, NextAuth (credentials), and recharts.

Design docs live in [`docs/`](docs/): [REQUIREMENTS](docs/REQUIREMENTS.md) · [API_SPEC](docs/API_SPEC.md) · [DATA_MODEL](docs/DATA_MODEL.md) · [UI_FLOWS](docs/UI_FLOWS.md) · [DECISIONS](docs/DECISIONS.md)

## Run locally

Requires Node.js 22+.

```bash
npm install                              # install dependencies
cp .env.example .env                     # DATABASE_URL + AUTH_SECRET
npx prisma migrate dev                   # create/migrate the SQLite database
npm run seed                             # load demo users and sample entries
npm run dev                              # start on http://localhost:3000
```

Other commands:

```bash
npm run test    # vitest (auth + authorization guard tests)
npm run lint    # eslint
npm run build   # production build
```

## Demo credentials

All seeded accounts use the password `Passw0rd!`.

| Role | Email |
|---|---|
| Admin | admin@demo.co |
| Manager | manager1@demo.co, manager2@demo.co |
| Recruit | recruit1@demo.co, recruit2@demo.co (→ manager1); recruit3@demo.co, recruit4@demo.co (→ manager2) |
