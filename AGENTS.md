# AGENTS.md

## Purpose

This repository expects every AI agent to build project context before editing and to keep the project map current only when structural changes happen.

## Required Read Order Before Starting Work

Before making code changes, file moves, release changes, or documentation updates, read these files in order:

1. `README.md`
2. `docs/PROJECT_OVERVIEW_AI.md`
3. `docs/project-map.json`
4. `package.json`

If the task touches a specific subsystem, also read its direct entry files before editing:

- ClawHub scraping: `scripts/scrape-clawhub.ts`
- Dashboard/frontend: `src/App.tsx`, `src/types.ts`
- Optimized packaging: `scripts/build-source-optimized-packages.mjs`, `scripts/verify-source-optimized.mjs`, `scripts/publish-optimized-downloads.mjs`
- Chinese optimized packaging: `scripts/build-source-optimized-zh.mjs`, `scripts/package-source-optimized-zh.mjs`
- `last30days` skill: `sucess/last30days/SKILL.md`

## Standard Execution Flow

Every AI agent should follow this default workflow:

1. Read `README.md`, `docs/PROJECT_OVERVIEW_AI.md`, and `docs/project-map.json`.
2. Identify which subsystem is affected.
3. Read the subsystem entry files directly related to the task.
4. Make the requested change.
5. Before finishing, decide whether project-level context documents need updates.
6. Update only the minimal sections that changed.

## Documentation Update Rule

Do not refresh all overview documents after every task.

Only update `README.md`, `docs/PROJECT_OVERVIEW_AI.md`, and `docs/project-map.json` when at least one of the following changed:

- a directory was added or removed
- a core artifact was added or removed
- the release or publish flow changed
- the official repository or branch changed
- the recommended workflow changed
- the project stage changed

## Preferred End-Of-Task Behavior

At the end of a task:

- update project-level docs only if one of the trigger conditions above is true
- if no trigger condition is true, leave project-level docs unchanged
- if only one section changed, update only that section instead of rewriting the whole document

## Source Of Truth

- `README.md`: human-facing quick entry
- `docs/PROJECT_OVERVIEW_AI.md`: human-readable AI handoff overview
- `docs/project-map.json`: machine-readable project map

When these files disagree, prefer fixing the smallest stale layer rather than rewriting all three.
