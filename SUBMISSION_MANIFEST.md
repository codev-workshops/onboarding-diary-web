# Submission Manifest — Onboarding Diary (Priyal Walpita)

Final deliverable for the greenfield "Onboarding Diary" workshop assessment.
Repo: `codev-workshops/onboarding-diary-web`. `docs/` on the stack is the single source of truth.

## Stack graph (stacked PRs — merge bottom-up, none merged)

```
main
 └── PR #5  priyal/g1-elaboration      Step 1: Requirements elaboration (docs only)   [root, into main]
      └── PR #6  priyal/g2-skeleton    G2: Skeleton — schema, auth, roles, seed
           └── PR #7  priyal/g3-core-crud   G3: Core CRUD — tasks, issues, feedback, notes
                └── PR #8  priyal/g4-dashboard-reports   G4: Dashboard + Reports (CSV/PDF) + recruit browsing
                     └── PR #9  priyal/g5-extensions     G5: Extensions — charts + onboarding checklists  [this branch]
```

## PRs and build sessions

| PR | Branch (into) | Devin session |
|---|---|---|
| [#5 — Step 1: Requirements elaboration](https://github.com/codev-workshops/onboarding-diary-web/pull/5) | `priyal/g1-elaboration` → `main` | https://codev.devinenterprise.com/sessions/9491683b2f7942aeada99c45ec1dbba2 |
| [#6 — G2: Skeleton — schema, auth, roles, seed](https://github.com/codev-workshops/onboarding-diary-web/pull/6) | `priyal/g2-skeleton` → `priyal/g1-elaboration` | https://codev.devinenterprise.com/sessions/9491683b2f7942aeada99c45ec1dbba2 |
| [#7 — G3: Core CRUD](https://github.com/codev-workshops/onboarding-diary-web/pull/7) | `priyal/g3-core-crud` → `priyal/g2-skeleton` | https://codev.devinenterprise.com/sessions/3ecb4051370942289d47d76abf3f5735 |
| [#8 — G4: Dashboard + Reports + recruit browsing](https://github.com/codev-workshops/onboarding-diary-web/pull/8) | `priyal/g4-dashboard-reports` → `priyal/g3-core-crud` | https://codev.devinenterprise.com/sessions/50651bd1b61043d7af651e045edc7e03 |
| [#9 — G5: Extensions — charts + onboarding checklists](https://github.com/codev-workshops/onboarding-diary-web/pull/9) | `priyal/g5-extensions` → `priyal/g4-dashboard-reports` | https://codev.devinenterprise.com/sessions/91023a1ecd6f4df0a0af30467231e019 |

## Run instructions

```bash
git checkout priyal/g5-extensions
npm install
cp -n .env.example .env
npx prisma migrate dev     # applies all migrations incl. 20260709032804_checklists
npm run seed
npm run dev                # http://localhost:3000
```

Quality gates: `npm test` · `npm run lint` · `npm run build`

### Demo credentials (password for all: `Passw0rd!`)

| Role | Email |
|---|---|
| Admin | admin@demo.co |
| Manager | manager1@demo.co (also manager2@demo.co) |
| Recruit | recruit1@demo.co (also recruit2–4@demo.co) |

## Test totals

| Stage | Tests |
|---|---|
| G2 skeleton | 16 |
| G3 core CRUD | 50 (34 new) |
| G4 dashboard/reports | 92 (42 new) |
| **G5 extensions (this branch)** | **114 (22 new) — all green** |

New in G5: `tests/charts.test.ts` (chart aggregations per role, 14-day window, zero-filling, empty-roster manager) and `tests/checklists.test.ts` (template → assign → complete → progress lifecycle plus the full scoping matrix).

## Screenshot index (embedded in PR #9 description)

1. Recruit dashboard — task-status donut, issues-by-severity (empty state), 14-day activity timeline.
2. Manager dashboard — roster with the new per-recruit **Checklist** progress column + all three charts scoped to assigned recruits.
3. Admin dashboard — org-wide charts.
4. Checklists management (manager) — template creation form, template list, assignment with progress.
5. Recruit checklist — ticked items with live progress bar (50%, 2/4).
6. Mobile width (390px) — recruit dashboard with fluid charts (`ResponsiveContainer`).

## Convention notes

1. **Stacked-PR etiquette.** Each step branches from, and PRs into, the previous step's branch — never into `main` directly (only the root #5 targets `main`). Reviews happen per-layer on a small diff; merging is bottom-up (#5 first, then #6→#7→#8→#9), and no PR is merged until its base has merged. None of these PRs are merged — they are left open for review by request.
2. **Blueprint declined.** A Devin environment blueprint/snapshot was intentionally not set up for this repo: snapshots are built from the repository's **default branch** (`main`), which here contains only the initial commit — all real work lives on the stacked feature branches. A snapshot would therefore bake in none of the app, its dependencies, or migrations, while per-session preflight (`npm install`, `prisma migrate dev`, `seed`) is fast and deterministic. Revisit once the stack merges to `main`.

## Archival

Full repo (all branches/refs) bundled at `/home/ubuntu/onboarding-diary-deliverable.bundle`:

```bash
git clone /home/ubuntu/onboarding-diary-deliverable.bundle onboarding-diary-web
```
