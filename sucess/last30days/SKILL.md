---
name: last30days
description: "Research the last 30 days across Reddit, X/Twitter, YouTube, TikTok, Instagram, Hacker News, Polymarket, GitHub, and grounded web results. Use when: you need recent social research, company updates, competitor comparisons, launch reactions, or trend scans with one-query first-run success. Supports AISA-powered planning, clustering, reranking, JSON output, and optional local watchlist/briefing workflows."
metadata:
  aisa:
    emoji: "📰"
    requires:
      env:
        - AISA_API_KEY
      bins:
        - python3
        - bash
    primaryEnv: AISA_API_KEY
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# last30days

Research recent evidence across social platforms, community forums, prediction markets, GitHub, and grounded web results, then merge everything into one brief.

## When to use

- Use when you need a last-30-days research brief on a person, company, product, market, tool, or trend.
- Use when you want a recent competitor comparison, launch reaction summary, creator/community sentiment scan, or shipping update.
- Use when you want structured JSON with `query_plan`, `ranked_candidates`, `clusters`, and `items_by_source`.

## When NOT to use

- Do not use for timeless encyclopedia questions with no recent evidence requirement.
- Do not use when you need only one official source and do not want social/community signals.

## Capabilities

- AISA-hosted planning, reranking, synthesis, grounded web search, X/Twitter search, YouTube search, and Polymarket search.
- Public Reddit and Hacker News retrieval with fail-soft behavior.
- Official GitHub API search when `GH_TOKEN` or `GITHUB_TOKEN` is available.
- Hosted discovery for TikTok, Instagram, Threads, and Pinterest when enabled in runtime config.

## Setup

- `AISA_API_KEY` is the main hosted credential.
- `GH_TOKEN` or `GITHUB_TOKEN` is optional for GitHub search only.
- `python3` and `bash` are the only host binaries required.
- The runtime is stdlib-only Python. Do not assume `requests`, `httpx`, `pytest`, or project build tooling is available.

## Quick Reference

```bash
bash {baseDir}/scripts/run-last30days.sh "$ARGUMENTS" --emit=compact
python3 {baseDir}/scripts/last30days.py "$ARGUMENTS" --emit=json
python3 {baseDir}/scripts/last30days.py "$ARGUMENTS" --quick
python3 {baseDir}/scripts/last30days.py "$ARGUMENTS" --deep
python3 {baseDir}/scripts/last30days.py "$ARGUMENTS" --search=reddit,x,grounding
python3 {baseDir}/scripts/last30days.py --diagnose
python3 {baseDir}/scripts/watchlist.py list
python3 {baseDir}/scripts/briefing.py generate
```

## Inputs And Outputs

- Input: a topic or comparison query such as `OpenAI Agents SDK`, `OpenClaw vs Codex`, or `Peter Steinberger`.
- Output: synthesized research plus `provider_runtime`, `query_plan`, `ranked_candidates`, `clusters`, and `items_by_source`.

## Example Queries

- `last30days OpenAI Agents SDK`
- `last30days Peter Steinberger`
- `last30days OpenClaw vs Codex`
- `last30days Kanye West --quick`

## Packaging Guardrails

- Keep the bundle runtime-only: `last30days.py`, `watchlist.py`, `briefing.py`, `store.py`, wrapper scripts, and `scripts/lib/*`.
- Do not add `pyproject.toml`, test scripts, sync helpers, evaluation tooling, or extra docs to the shipped skill bundle.
- When referencing local scripts in this file, always use the literal token `{baseDir}` so the harness can substitute the install path.
- Keep Python HTTP clients stdlib-only with `urllib.request`; do not introduce `requests` or other third-party runtime deps.

