# Project Manual

This document is the chat-independent handbook for the repository.

Use it when you need to answer three questions quickly:

- what this project can do right now
- which pages / datasets / reports exist and what each one is for
- which commands and files you should touch next

## 1. Project Mission

This repository is a mixed intelligence + packaging + publishing workspace around AI skills and plugins.

Its main jobs are:

- collect ClawHub public skill and plugin data
- detect probable AISA API usage from pages and downloaded archives
- compare breakout patterns across ClawHub, Claude, Hermes, AgentSkill, and AgentSkills.so
- generate strategy datasets and reports for breakout skills, prolific authors, and AISA conversion
- package and verify optimized suspicious bundles
- maintain reusable skill-packaging knowledge for other projects

## 2. Main Functions

### 2.1 ClawHub intelligence

- Scrape public skill and plugin listings plus detail pages.
- Track known owners from `config/accounts.json`.
- Discover additional items from public catalog pages.
- Download tracked owner skill archives into `public/downloads/clawHub/`.
- Detect probable AISA usage from downloaded archives and page text.
- Build dedicated ClawHub growth, downloads-insights, plugin, and `10k+` strategy datasets.

### 2.2 Cross-market intelligence

- Analyze Claude skills and Claude marketplaces separately.
- Analyze Hermes as a workflow atlas and bundled/optional skill surface.
- Analyze AgentSkill skills, plugins, creators, trust, quality, and security surfaces.
- Analyze AgentSkills.so skills, authors, weekly downloads, repo trust, security posture, and distribution coverage.
- Merge all platforms into one AISA opportunity queue.

### 2.3 Packaging and optimization

- Download suspicious ClawHub skill zips.
- Rebuild them into runtime-preserving optimized packages.
- Verify metadata, file hygiene, compileability, and smoke-testability.
- Publish optimized downloads to `public/downloads/optimized/`.
- Build Chinese optimized variants under `public/downloads/optimized-zh/`.
- Convert GitHub-hosted skills into ClawHub-ready release bundles.

### 2.4 Skill-system reuse

- Maintain local `.agents` skills for optimizer / auditor / packager use inside this repo.
- Maintain global `/home/xiaofeng/.codex/skills/` all-platform skills for reuse in other projects.
- Continuously fold live breakout lessons back into those reusable skills.

## 3. User-Facing Pages

- `index.html`
  Purpose: main searchable dashboard for catalog and AISA archive analysis.
- `clawhub-growth.html`
  Purpose: ClawHub business and growth strategy view.
- `clawhub-download-insights.html`
  Purpose: downloads leaderboard, breakout-skill, and prolific-author analysis.
- `clawhub-10k-system.html`
  Purpose: repeatable production-system view for `10k+` skills and authors.
- `market-intelligence.html`
  Purpose: unified view across ClawHub, Claude, Hermes, AgentSkill, and AgentSkills.so.
- `public/reports/index.html`
  Purpose: public report library showing which report covers which market question.

## 4. Core Data Files

- `public/data/catalog.json`
  What it is: normalized ClawHub catalog and tracked-owner dataset for the main dashboard.
- `public/data/aisa-api-analysis.json`
  What it is: archive-level AISA endpoint and skill-interface analysis used by the main dashboard.
- `public/data/clawhub-growth-report.json`
  What it is: ClawHub growth and business analysis dataset.
- `public/data/clawhub-download-insights.json`
  What it is: ClawHub downloads leaderboard and breakout-author dataset.
- `public/data/clawhub-plugin-report.json`
  What it is: ClawHub plugin breakout and author-factory dataset.
- `public/data/clawhub-10k-system-report.json`
  What it is: ClawHub `10k+` repeatable-system and AISA monetization dataset.
- `public/data/clawhub-multi-ranking-report.json`
  What it is: multi-dimensional ClawHub ranking merge across downloads, stars, and installs.
- `public/data/aisa-all-skills-breakout-plan.json`
  What it is: structured plan for expanding the current AISA skill portfolio.
- `public/data/clawhub-top200-aisa-conversion-plan.json`
  What it is: Top-200 merged ClawHub queue for selecting AISA conversion targets.
- `public/data/market-ecosystem-report.json`
  What it is: unified cross-market dataset for ClawHub, Claude, and Hermes.
- `public/data/agentskill-report.json`
  What it is: AgentSkill skill/plugin/creator dataset with trust, quality, security, and AISA opportunity signals.
- `public/data/agentskills-so-report.json`
  What it is: AgentSkills.so dataset with weekly downloads, repo trust, security posture, distribution coverage, and AISA opportunity signals.

## 5. Report Library

The editable report sources live in `reports/`. Public copies live in `public/reports/`.

### ClawHub reports

- `ClawHub_Plugin_Viral_Report_*.md`
  Use when you want plugin breakout logic, plugin-author patterns, and plugin-to-AISA opportunities.
- `ClawHub_10K_System_Report*.md/.docx`
  Use when you want the full repeatable-system view for `10k+` skills and prolific authors.
- `ClawHub_10K_Boss_Brief_*.md/.docx`
  Use when you want a shorter boss-facing summary of the 10k system.
- `ClawHub_Multi_Ranking_Report_ZH.md/.docx`
  Use when you want the combined ranking view across downloads, stars, and installs.
- `ClawHub_Viral_Boss_Report_ZH.md/.docx`
  Use when you want the management-level ClawHub breakout summary.
- `ClawHub_Top200_AISA_Conversion_Report_ZH.md/.docx`
  Use when you want the ranked list of ClawHub skills most suited to AISA conversion.

### Cross-market reports

- `Claude_AISA_Report_*.md`
  Use when you want Claude-only breakout patterns and AISA selection guidance.
- `Hermes_AISA_Report_*.md`
  Use when you want Hermes-only workflow-atlas and AISA packaging guidance.
- `AgentSkill_Report_*.md`
  Use when you want AgentSkill skill / plugin / creator analysis.
- `AgentSkills_SO_Report_*.md`
  Use when you want AgentSkills.so skill / author / security / distribution analysis.

### AISA execution reports

- `AISA_All_Skills_Breakout_Plan_ZH.md/.docx`
  Use when you want the overall AISA portfolio expansion roadmap.
- `AISA_Breakout_Execution_Plan_ZH.md`
  Use when you want the rollout sequence.
- `AISA_Breakout_Test_Evidence_ZH.md`
  Use when you want validation proof and acceptance notes.

## 6. Key Commands

- `npm run scrape`
  Refresh ClawHub catalog intelligence.
- `npm run download:clawhub-account-skills`
  Download tracked ClawHub owner skill archives.
- `npm run download:github-account-skills`
  Download GitHub owner skill archives inferred from tracked owners.
- `npm run analyze:aisa`
  Rebuild archive-level AISA analysis.
- `npm run analyze:clawhub-growth`
  Rebuild ClawHub growth report dataset.
- `npm run analyze:clawhub-download-insights`
  Rebuild ClawHub downloads-insights dataset.
- `npm run analyze:clawhub-plugins`
  Rebuild ClawHub plugin dataset and EN/ZH reports.
- `npm run analyze:clawhub-10k-system`
  Rebuild ClawHub `10k+` dataset and reports.
- `npm run analyze:clawhub-10k-followups`
  Rebuild follow-up Chinese and boss-facing 10k report assets.
- `npm run analyze:market-ecosystem`
  Rebuild the cross-market dataset plus separate Claude and Hermes reports.
- `npm run analyze:agentskill`
  Rebuild the AgentSkill dataset and reports.
- `npm run analyze:agentskills-so`
  Rebuild the AgentSkills.so dataset and reports.
- `npm run pipeline:aisa-analysis`
  Recommended end-to-end refresh for ClawHub downloads, GitHub downloads, AISA archive analysis, and build.
- `npm run typecheck`
  TypeScript validation.
- `npm run build`
  Production build for the site.

## 7. Key Source Directories

- `src/`
  React/Vite frontend source.
- `scripts/`
  Scrapers, analyzers, converters, and packaging workflows.
- `reports/`
  Repo-local generated report sources.
- `public/data/`
  Published JSON datasets consumed by the pages.
- `public/reports/`
  Published report copies and public report index.
- `public/downloads/`
  Downloadable generated packages and mirrors.
- `packages/source-optimized/`
  English optimized package directories.
- `packages/source-optimized-zh/`
  Chinese optimized package directories.
- `sucess/`
  Reference skill assets and success experiments.

## 8. Recommended “Start Here” Paths

### If you want market insight

Read in this order:

- `market-intelligence.html`
- `public/reports/index.html`
- the relevant platform report in `reports/`

### If you want ClawHub-only insight

Read in this order:

- `clawhub-download-insights.html`
- `reports/ClawHub_Plugin_Viral_Report_ZH.md`
- `reports/ClawHub_10K_System_Report_ZH.md`

### If you want packaging / release work

Read in this order:

- `scripts/build-source-optimized-packages.mjs`
- `scripts/verify-source-optimized.mjs`
- `scripts/publish-optimized-downloads.mjs`

### If you want reusable skill knowledge for other projects

Read in this order:

- `.agents/skills/clawhub-plugin-packager/SKILL.md`
- `.agents/skills/clawhub-security-auditor/SKILL.md`
- `.agents/skills/clawhub-skill-optimizer/SKILL.md`
- `/home/xiaofeng/.codex/skills/clawhub-plugin-packager-all/SKILL.md`
- `/home/xiaofeng/.codex/skills/clawhub-security-auditor-all/SKILL.md`
- `/home/xiaofeng/.codex/skills/clawhub-skill-optimizer-all/SKILL.md`

## 9. Maintenance Notes

- When a new core page, dataset, or report family is added, update this manual.
- When only “recent progress / next steps” changes, update `docs/AI_PROJECT_MEMORY.md` instead of rewriting this file.
- When you need the report list in a browser, use `public/reports/index.html`.
- When you need the repo-local source list, use `reports/README.md`.
