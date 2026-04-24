# AI Project Memory

## Purpose

This file is the fast handoff layer for future chats. Read it when you need to know:

- what this repository can do right now
- what was completed recently
- what is still in progress
- what the next highest-value steps are

## Current Capabilities

### ClawHub intelligence

- Scrape public ClawHub skills and plugins
- Track owner portfolios and public catalog movement
- Detect probable AISA API usage from rendered pages and downloaded archives
- Build standalone reports for growth, downloads, 10k+ systems, and multi-ranking strategy

### Cross-market intelligence

- Analyze Claude marketplaces and Hermes skill ecosystems from live public sources
- Analyze AgentSkill and AgentSkills.so live public skill ecosystems
- Build cross-market opportunity maps for AISA conversion
- Compare categories, owners, and repeatable packaging patterns across ecosystems

### Plugin and skill packaging

- Convert GitHub-hosted skills into ClawHub-ready bundles
- Build source-optimized suspicious-package releases
- Validate runtime-only bundles and publish download indexes
- Optimize publish-facing skills and plugin bundles for ClawHub, Claude, Hermes, AgentSkill, and GitHub

### Reporting and delivery

- Generate JSON datasets under `public/data/`
- Generate Markdown reports under `reports/` and `public/reports/`
- Publish a Vite + React static dashboard to GitHub Pages

## Recently Completed

### 2026-04-24

- Fixed the server-side deployment helper so `deploy/deploy-server.sh` now publishes the built `dist/` output into a real web root instead of stopping after `npm run build`
- Updated `docs/DEPLOYMENT.md`, `README.md`, and `docs/project-map.json` so server deployment now documents `DEPLOY_WEB_ROOT` and the build-then-sync flow explicitly
- Added `reports/AISA_Breakout_Test_Plan_ZH.md` with a dual-track breakout test plan: three primary AISA-native test skills, three primary online-to-AISA conversion skills, and two reserve slots based on current Hermes and ClawHub opportunity data

- Fixed the ClawHub plugin report pipeline so `.json` artifacts such as `/plugins/page.json` are filtered out before ranking rows and detail fetches are built
- Added a frontend fallback in `src/clawhub-plugins/App.tsx` so invalid plugin-detail URLs are rendered as plain text instead of broken clickable links
- Regenerated `public/data/clawhub-plugin-report.json`, refreshed the paired ClawHub plugin Markdown + DOCX reports, and verified the site with `npm run typecheck` plus `npx vite build`

### 2026-04-23

- Reworked `reports/README.md` into a report chooser with question-to-report mapping, report-family summaries, format guidance, and report-library usage notes
- Reworked `public/reports/index.html` into a clearer public report shelf with quick-pick guidance, stronger page shortcuts, and explicit Markdown-vs-DOCX usage cues
- Updated `docs/AISA_ANALYSIS_WORKFLOW.md` so it now matches the real push-vs-schedule GitHub Actions behavior and no longer points at stale local path casing
- Reorganized `README.md` into a clearer operator entry point with project overview, feature map, page map, grouped npm-script summaries, parameter notes, and workflow guidance
- Added `scripts/README.md` as the repo-wide script catalog covering npm aliases, direct script responsibilities, inputs/outputs, CLI parameters, and environment-variable requirements
- Added `example/accounts` as the shareable local-credentials template and documented the pattern of keeping real private values in gitignored `docs/accounts`
- Updated `docs/PROJECT_MANUAL.md`, `docs/PROJECT_OVERVIEW_AI.md`, and `docs/project-map.json` so the new script-reference doc, example directory, plugin page entry, and current cross-market page description are reflected in the handoff docs
- Updated `.github/workflows/deploy.yml` so push builds stay on `pipeline:aisa-analysis`, while scheduled/manual GitHub Actions now run `pipeline:scheduled-analysis` to refresh the broader report suite automatically
- Added `analyze:full-report-suite` and `pipeline:scheduled-analysis` in `package.json` so CI has a single full-refresh entry point for report datasets plus the final site build
- Updated `README.md`, `docs/DEPLOYMENT.md`, `docs/PROJECT_MANUAL.md`, `docs/PROJECT_OVERVIEW_AI.md`, and `docs/project-map.json` so the documented CI flow now matches the actual push-vs-schedule behavior
- Added `scripts/sync-report-docx.py` plus `npm run sync:report-docx` so repo-local and public Markdown reports can be backfilled or refreshed into matching `.docx` files
- Updated `scripts/build-market-ecosystem-report.mjs`, `scripts/build-agentskill-report.mjs`, `scripts/build-agentskills-so-report.mjs`, and `scripts/build-clawhub-plugin-report.mjs` so their generated Markdown reports now also refresh `.docx` companions automatically
- Backfilled missing `.docx` outputs for the ClawHub plugin, Claude, Hermes, AgentSkill, AgentSkills.so, AISA execution-plan, and AISA test-evidence report families under both `reports/` and `public/reports/`
- Updated `reports/README.md`, `public/reports/index.html`, `docs/PROJECT_MANUAL.md`, `docs/PROJECT_OVERVIEW_AI.md`, `docs/project-map.json`, and `README.md` so the report library and project-function map now reflect the Markdown + Word report workflow more clearly
- Added a standalone `clawhub-plugins.html` page plus `src/clawhub-plugins/*` so the site now shows the ClawHub plugin downloads / installs / stars boards, composite ranking, author factories, trust mechanics, and AISA opportunities directly in the browser
- Strengthened `scripts/build-clawhub-plugin-report.mjs` so plugin reporting now separates the three public boards instead of collapsing analysis into code-vs-bundle alone, and made detail-page failures fall back to partial records instead of aborting the whole report
- Strengthened `scripts/build-market-ecosystem-report.mjs`, `scripts/build-agentskill-report.mjs`, and `scripts/build-agentskills-so-report.mjs` so the generated reports spell out ranking mechanics, breakout mechanics, publish moves, and common failure modes more explicitly
- Updated the local `.agents/skills/clawhub-*` guides and the global `/home/xiaofeng/.codex/skills/clawhub-*-all/SKILL.md` guides with newer ClawHub plugin, Claude, Hermes, AgentSkill, and AgentSkills.so publishing/ranking lessons for breakout-oriented skill and plugin releases

### 2026-04-22

- Updated the main dashboard plus the ClawHub growth, download-insights, 10k-system, and market-intelligence pages with a shared EN/ZH language toggle stored in browser state
- Reworked `src/market-intelligence/App.tsx` so skill/owner/opportunity details now expand inline as accordions instead of using the tall right-side detail panel
- Added shared browser-side JSON caching in `src/site.tsx`, switched report pages to cached loads, and made the main dashboard defer `optimized-packages.json` until the catalog view is opened
- Changed market-intelligence loading so `market-ecosystem-report.json` can render first while AgentSkill / AgentSkills.so datasets continue loading in the background
- Finished a second frontend localization pass so the main dashboard and market-intelligence page now translate more of their headings, action labels, stat labels, and empty states instead of leaving mixed-language shell UI
- Added idle-time warming from the main dashboard for the growth, downloads, 10k-system, and market-intelligence JSON datasets, plus fallback HTML titles/descriptions for the standalone pages
- Added JSON request de-duplication in `src/site.tsx` so parallel effects and idle warmups no longer fetch the same dataset twice in one session
- Added a third UI polish pass across `src/clawhub-download-insights/App.tsx`, `src/clawhub-growth/App.tsx`, `src/clawhub-10k-system/App.tsx`, and `src/market-intelligence/App.tsx` so more inline metrics and accordion labels follow the EN/ZH toggle instead of staying mixed-language
- Expanded secondary-page idle warming so the growth, download-insights, and 10k-system pages now prewarm adjacent report datasets for faster same-session navigation
- Verified the frontend changes with `npm run typecheck` and a clean `npx vite build`

### 2026-04-21

- Tightened `scripts/build-agentskills-so-report.mjs` so it now targets security breakdown fields and cross-distribution install coverage more directly from live detail pages
- Updated `scripts/build-agentskill-report.mjs`, `scripts/build-agentskills-so-report.mjs`, and `scripts/build-market-ecosystem-report.mjs` so generated report dates are no longer hard-coded
- Added a repo-local report index at `reports/README.md`
- Added a public browser-friendly report library at `public/reports/index.html`
- Added `docs/PROJECT_MANUAL.md` as the detailed project function + document handbook
- Updated `market-intelligence.html` to link to the public report library instead of a missing raw Markdown path

### 2026-04-20

- Added `scripts/build-clawhub-plugin-report.mjs` and `npm run analyze:clawhub-plugins`
- Generated `public/data/clawhub-plugin-report.json`
- Generated `reports/ClawHub_Plugin_Viral_Report_ZH.md` and `reports/ClawHub_Plugin_Viral_Report_EN.md`
- Updated `scripts/build-market-ecosystem-report.mjs` so Claude and Hermes are now reported separately as `reports/Claude_AISA_Report_*.md` and `reports/Hermes_AISA_Report_*.md`
- Added `scripts/build-agentskill-report.mjs` and generated `public/data/agentskill-report.json` plus `reports/AgentSkill_Report_*.md`
- Added `scripts/build-agentskills-so-report.mjs` and generated `public/data/agentskills-so-report.json` plus `reports/AgentSkills_SO_Report_*.md`
- Expanded `scripts/build-agentskill-report.mjs` from homepage-only sampling into homepage + plugin pages + owner-page expansion, raising sampled AgentSkill skills to deeper multi-page coverage
- Expanded `scripts/build-agentskills-so-report.mjs` into deeper paginated homepage/search sampling and refreshed the AgentSkills.so dataset
- Updated `market-intelligence.html` so it now loads and compares ClawHub, Claude, Hermes, AgentSkill, and AgentSkills.so inside one shared page
- Folded the newest AgentSkill / AgentSkills.so breakout, trust, and packaging lessons back into:
  - `/home/xiaofeng/.codex/skills/clawhub-skill-optimizer-all/SKILL.md`
  - `/home/xiaofeng/.codex/skills/clawhub-security-auditor-all/SKILL.md`
  - `/home/xiaofeng/.codex/skills/clawhub-plugin-packager-all/SKILL.md`
- Updated local `.agents` skills:
  - `clawhub-plugin-packager`
  - `clawhub-skill-optimizer`
  - `clawhub-security-auditor`
- Updated global Codex skills:
  - `clawhub-plugin-packager-all`
  - `clawhub-skill-optimizer-all`
  - `clawhub-security-auditor-all`
- Added `docs/sucess.txt` with the required `clawhubplugin sucess` completion marker
- Changed the ClawHub download-insights page so skill and author details expand inline as accordions instead of occupying a large side panel

## In Progress

- Tightening the live collectors where target sites expose unstable or partially rendered trust/security fields, especially deeper payload-backed trust signals beyond visible SSR text

## Next Recommended Steps

1. Decide whether AgentSkill and AgentSkills.so need their own standalone frontend pages beyond the now-expanded `market-intelligence.html`
2. Expand cross-platform opportunity scoring so the unified queue can feed release planning and automated skill-family generation more directly
3. Add more cached fallbacks for long-running live collectors where third-party sites intermittently stall or partially render

## Archive Protocol

After any substantive task, update this file minimally:

1. Add a dated bullet list under `Recently Completed`.
2. Refresh `In Progress` only if the active work truly changed.
3. Refresh `Next Recommended Steps` only when priorities changed.
4. Do not rewrite old history; append or lightly edit the affected section.

This file is intended to replace the need to read old chat transcripts for normal project handoff.
