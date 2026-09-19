# Production Control Dashboard

A small factory operations dashboard for an operations manager: production jobs,
machine status, due-date urgency, and the issues that need attention.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui · lucide-react

**Live demo:** https://production-control-sepia.vercel.app
**Repository:** https://github.com/maminataei/production-control

## Setup

```bash
npm install
npm run dev
# open http://localhost:3000
```

To run the production build locally:

```bash
npm run build
npm start
```

No environment variables, database, or external services are required.

## Features

- Jobs / work orders table: job ID, product, customer, quantity, due date,
  status, and assigned machine
- Search by product, customer, or job ID (trimmed and case-insensitive)
- Filter by status, and sort by due date or quantity in both directions
- Defaults to due date ascending, so the most time-sensitive work is on top
- Relative urgency in the due-date column ("3 days overdue", "Due today", "in 2 days")
- Job detail side panel: job details, assigned machine and its status,
  notes / issues, and a status update action
- Summary metrics: total jobs, delayed jobs, jobs due soon, completed jobs
- Loading skeletons, a retryable error state, and an empty state when no jobs match
- Responsive layout; the table scrolls horizontally on narrow screens
- Keyboard accessible: sort controls are real buttons, and each job opens from a
  focusable link rather than relying on a row click

## Mock API

Two route handlers serve the demo data:

| Route | Method | Purpose |
|---|---|---|
| `/api/jobs` | `GET` | Returns `{ jobs }` |
| `/api/jobs/[id]` | `PATCH` | Accepts `{ status }`, returns `{ job }`; `400` for an invalid status or body, `404` for an unknown job |

Data lives in `lib/mock-data.ts`. Status updates are written to module-level
memory in the server process, so they are **demo state, not durable
persistence** — on a serverless deploy a change may not survive a cold start,
refresh, or redeploy. The client reconciles the `PATCH` response into its own
state, so the table and the summary stay consistent within a session.

Due dates are generated relative to "today", so the overdue / due-today /
due-soon cases still exist whenever the app is opened, rather than depending on
the day the mock data was written.

## Component structure

```
app/page.tsx                     Server component; renders <Dashboard />
app/api/jobs/route.ts            GET  /api/jobs
app/api/jobs/[id]/route.ts       PATCH /api/jobs/[id]

components/dashboard.tsx         Client component. Owns all state — jobs,
                                 filters, sort, selection, status update — and
                                 composes the sections below.
components/summary-cards.tsx     The four headline metrics.
components/toolbar.tsx           Search, status filter, sort control, clear
                                 filters, and the result count.
components/jobs-table.tsx        The table, sortable headers, and loading rows.
components/job-detail-panel.tsx  The side sheet: details, machine, notes, and
                                 the status update form.
components/status-badge.tsx      The one place a status maps to a label + colour.
components/ui/*                  shadcn/ui primitives.

lib/types.ts                     Domain types and the status vocabulary.
lib/jobs.ts                      Pure helpers: filter, sort, date/urgency
                                 classification, and summary metrics.
lib/mock-data.ts                 Mock jobs and machines.
```

The interactive state lives in one client component because the dashboard is a
single workflow — nothing needs to be shared across routes or survive
navigation, so no store library is warranted. Everything below it is
presentational: it receives data and callbacks and renders. The business rules
(filtering, sorting, date classification, metrics) are deliberately kept out of
the components as pure functions in `lib/jobs.ts`, so they can be read and
reasoned about on their own.

## Assumptions

- **Summary metrics describe the whole plant**, not the filtered table, so the
  headline numbers stay stable while the user searches or filters.
- **Due soon** means an unfinished job due today or within the next 3 calendar
  days. Completed jobs are excluded.
- **Due dates have date precision only.** They are stored as `YYYY-MM-DD` and
  parsed as local dates by hand, because `new Date("2025-05-02")` is interpreted
  as UTC and can shift the day for the viewer.
- **A completed job is never labelled overdue.** The model has no completion
  timestamp, so lateness cannot be proven — JOB-1055 is completed with a future
  due date and is treated as finished ahead of schedule.
- **The dataset is small** (14 jobs), so filtering, sorting, and summarising all
  happen client-side. Pagination would be premature at this size.
- **Machine status is read-only reference data**; only job status is mutable.

## What I would improve with more time

- URL-driven filter, sort, and selection state, so a view is shareable and
  survives a refresh or a back button press
- Durable persistence and a status change history, so an update is auditable
  rather than living in server memory
- Optimistic status updates with rollback, instead of waiting for the `PATCH`
- Server-side filtering and pagination for a realistic job count (thousands of
  rows) rather than sending the whole collection to the client
- Machine status surfaced outside the detail panel — a status column or a small
  machine overview, since that is half of what an operations manager watches
- Adding a note from the panel; notes are currently read-only
- Focused unit tests for the `lib/jobs.ts` helpers and an end-to-end test for
  the search → open job → update status workflow
- A stacked card layout per job on small screens instead of a horizontally
  scrolling table
