# Production Control — Assignment Planning Docs

Planning documents for the **Production Control Dashboard** front-end take-home
assignment. These docs contain architecture, decisions, and guidance only —
**all implementation code will be hand-written by the candidate** (the brief
forbids AI-generated code).

## Reading order

| # | Doc | Purpose |
|---|-----|---------|
| 01 | [Overview](docs/01-overview.md) | Assignment brief, rules, evaluation criteria |
| 02 | [Decisions](docs/02-decisions.md) | Decision records D1–D6 with rationale |
| 03 | [Architecture](docs/03-architecture.md) | File structure, component tree, data flow |
| 04 | [Data Model](docs/04-data-model.md) | Types, mock data spec, API contract |
| 05 | [State Management](docs/05-state-management.md) | State inventory, derived data, mutations |
| 06 | [UI Spec](docs/06-ui-spec.md) | Visual direction, component specs, states |
| 07 | [Execution Plan](docs/07-execution-plan.md) | 2-hour timeline, setup commands, scope guard |
| 08 | [README Template](docs/08-readme-template.md) | Skeleton for the submitted repo's README |
| 09 | [Submission Checklist](docs/09-submission-checklist.md) | Final pre-submission verification |

## Quick start (when implementation begins)

```bash
npx create-next-app@latest production-control-app --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd production-control-app
npx shadcn@latest init -d
npx shadcn@latest add button card badge table input select sheet skeleton separator
```

Then follow `docs/07-execution-plan.md` timeboxes.
