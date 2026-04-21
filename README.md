# Claw Skills Scout

Claw Skills Scout pulls ClawHub skills and plugins, detects probable AISA API usage, flags suspicious packages, and publishes a searchable dashboard to GitHub Pages.

## Start Here

Before doing project work, read these files first:

1. [AGENTS.md](/mnt/d/workplace/skillGet/AGENTS.md)
2. [docs/PROJECT_OVERVIEW_AI.md](/mnt/d/workplace/skillGet/docs/PROJECT_OVERVIEW_AI.md)
3. [docs/project-map.json](/mnt/d/workplace/skillGet/docs/project-map.json)
4. [docs/AI_PROJECT_MEMORY.md](/mnt/d/workplace/skillGet/docs/AI_PROJECT_MEMORY.md)

Project-level context docs do not need to be updated after every task. Only update them when one of these changes:

- a directory is added or removed
- a core artifact is added or removed
- the release or publish flow changes
- the official repository or branch changes
- the recommended workflow changes
- the project stage changes

## Manuals And Report Library

- Project handbook: [docs/PROJECT_MANUAL.md](/mnt/d/workplace/skillGet/docs/PROJECT_MANUAL.md)
- Repo-local report index: [reports/README.md](/mnt/d/workplace/skillGet/reports/README.md)
- Public report library: [public/reports/index.html](/mnt/d/workplace/skillGet/public/reports/index.html)

## Scope

- Track known ClawHub accounts from `config/accounts.json`
- Discover extra items from the public `skills` and `plugins` catalogs
- Extract:
  - name
  - description
  - version
  - ClawHub link
  - download count
  - suspicious status
  - probable AISA API usage
- Analyze AISA API usage from all archives in `public/downloads/`
- Generate a static dashboard in `dist/` with interface and skill search views
- Generate a standalone ClawHub growth strategy page from `public/data/clawhub-growth-report.json`
- Generate a standalone ClawHub downloads-insights page from `public/data/clawhub-download-insights.json`
- Generate a standalone ClawHub plugin viral report from `public/data/clawhub-plugin-report.json`
- Generate a standalone ClawHub `10k+` repeatable-systems page from `public/data/clawhub-10k-system-report.json`
- Generate a standalone cross-market intelligence page from `public/data/market-ecosystem-report.json`
- Generate a standalone AgentSkill report from `public/data/agentskill-report.json`
- Generate a standalone AgentSkills.so report from `public/data/agentskills-so-report.json`
- Generate Chinese and boss-facing EN/ZH follow-up reports from the `10k+` system dataset
- Deploy daily through GitHub Actions
- Package GitHub-hosted skill directories from tracked owner accounts into `public/downloads/github/`

## Local usage

```bash
npm install
npm run scrape
npm run download:clawhub-account-skills
npm run download:github-account-skills
npm run analyze:aisa
npm run analyze:clawhub-growth
npm run analyze:clawhub-download-insights
npm run analyze:clawhub-plugins
npm run analyze:clawhub-10k-system
npm run analyze:clawhub-10k-followups
npm run analyze:market-ecosystem
npm run analyze:agentskill
npm run analyze:agentskills-so
npm run dev
```

Standard end-to-end AISA analysis flow:

```bash
npm run pipeline:aisa-analysis
```

Detailed workflow and operating rules: [docs/AISA_ANALYSIS_WORKFLOW.md](/mnt/d/workplace/skillGet/docs/AISA_ANALYSIS_WORKFLOW.md)

`download:clawhub-account-skills` will try the Chinese mirror download URL first and fall back to the ClawHub-origin download URL when the mirror does not have the latest synced skill yet.
When Python `playwright` + `bs4` are available, it also refreshes owner-page HTML seeds first so newly published skills from tracked accounts can be discovered before scraping.
`download:github-account-skills` treats catalog owners as GitHub usernames, scans their public repositories for `SKILL.md`, and packages each discovered skill directory to `public/downloads/github/`.
`convert:github-to-clawhub` converts those GitHub tarballs into ClawHub-ready zip bundles in `public/downloads/clawHub-github/`, rewrites `SKILL.md` for ClawHub metadata/search, trims non-runtime packaging files, and emits both EN and ZH variants.
`pipeline:aisa-analysis` is the recommended full refresh command for the AISA analysis page: it refreshes ClawHub downloads, refreshes GitHub skill archives, rebuilds `public/data/aisa-api-analysis.json`, and then runs `vite build`.

Production build:

```bash
npm run build
```

`build` now runs `scrape` + `analyze:aisa` before `vite build`, so the GitHub Pages site includes the latest interface table, skill table, and GitHub skill archive analysis.
`analyze:clawhub-growth` builds the separate business-analysis dataset consumed by `clawhub-growth.html`.
`analyze:clawhub-download-insights` queries the live ClawHub downloads ranking, builds the standalone breakout-skill/author strategy dataset, and feeds `clawhub-download-insights.html`.
`analyze:clawhub-plugins` queries the live ClawHub plugin catalog, extracts verification and scan signals from plugin detail SSR payloads, and outputs JSON plus EN/ZH Markdown reports for plugin breakout strategy.
`analyze:clawhub-10k-system` downloads all live 10k+ skills, downloads prolific-author portfolios, and outputs JSON + Markdown + Word (`.docx`) system reports for repeatable production and AIsa monetization strategy.
`analyze:clawhub-10k-followups` converts the 10k system report into a Chinese system report plus boss-facing EN/ZH briefs, and publishes both Markdown and Word outputs under `public/reports/`.
`analyze:market-ecosystem` now publishes separate Claude and Hermes EN/ZH AISA reports under `reports/` and `public/reports/` in addition to refreshing `public/data/market-ecosystem-report.json`.
`analyze:agentskill` captures the current visible AgentSkill skill/plugin leaderboard surfaces plus detail-page metrics, then outputs JSON and EN/ZH Markdown reports.
`analyze:agentskills-so` captures the current AgentSkills.so skill samples plus detail-page security/download/repo signals, then outputs JSON and EN/ZH Markdown reports.

## Deployment

- GitHub Pages is configured by `.github/workflows/deploy.yml`
- Server-side rebuild helper lives in `deploy/deploy-server.sh`
- Daily refresh is triggered by the scheduled GitHub Action
- Cron template for server deployment lives in `deploy/clawskillsscout.cron`
- Full deployment instructions live in `docs/DEPLOYMENT.md`
- GitHub Action now runs `npm run pipeline:aisa-analysis`, so it refreshes ClawHub downloads, refreshes GitHub skill archives, rebuilds `public/data/aisa-api-analysis.json`, and then builds `dist/`
- The workflow also uploads `catalog.json`, `aisa-api-analysis.json`, download indexes, and `dist/` as CI artifacts for troubleshooting
- The workflow uses concurrency protection and retries the full AISA pipeline up to 3 times for transient network failures

## Notes

- AISA detection is heuristic and currently checks rendered page content and extracted README text.
- Known-account skill discovery now prioritizes real hash links extracted from `/u/{account}` pages, matching the logic used in `extract_all_skills_correct.py`.
- Global traversal currently scans the first few public catalog pages. This can be extended after we verify pagination behavior and possible hidden APIs.
- Current project memory and next-step handoff live in [docs/AI_PROJECT_MEMORY.md](/mnt/d/workplace/skillGet/docs/AI_PROJECT_MEMORY.md).
