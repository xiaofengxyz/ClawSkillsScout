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

1. Verify whether the improved AgentSkills.so security and distribution extraction should be mirrored with deeper payload extraction on AgentSkill
2. Decide whether AgentSkill and AgentSkills.so need their own standalone frontend pages beyond the now-expanded `market-intelligence.html`
3. Expand cross-platform opportunity scoring so the unified queue can feed release planning and automated skill-family generation more directly

## Archive Protocol

After any substantive task, update this file minimally:

1. Add a dated bullet list under `Recently Completed`.
2. Refresh `In Progress` only if the active work truly changed.
3. Refresh `Next Recommended Steps` only when priorities changed.
4. Do not rewrite old history; append or lightly edit the affected section.

This file is intended to replace the need to read old chat transcripts for normal project handoff.
