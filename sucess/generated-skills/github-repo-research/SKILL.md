---
name: github-repo-research
description: "GitHub Repo Research turns a repository URL into a fast decision brief. Use when: you want to understand what a repo does, whether it is worth reading, what stack and APIs it uses, where to start, and what risks or reuse opportunities exist. Supports one-link first-run success, structured repo analysis, launch positioning, and portfolio expansion."
metadata:
  aisa:
    emoji: "🔎"
    requires:
      bins:
        - python3
        - bash
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# GitHub Repo Research

Turn one GitHub repository link into a structured research brief that helps the user decide what the repo is, why it matters, where to start, and whether it should be reused, tracked, copied, or avoided.

## When to use

- Use when the user gives a GitHub repo URL and wants a fast understanding of the project.
- Use when the user needs a decision-ready summary instead of a vague code overview.
- Use when the user wants to compare repos, scan competitors, find implementation ideas, or evaluate whether a repo is worth deeper reading.
- Use when first-run success must happen with one link and no setup.

## When NOT to use

- Do not use when the user already knows the repo well and only needs one tiny code edit.
- Do not use when the request is a broad market scan across many sources; use `last30days` for that workflow.
- Do not use when the repo is private or inaccessible from the current environment.

## Job To Be Done

- Given one GitHub repository URL, tell the user what the repo does, who it is for, how mature it looks, what the key files and technologies are, what APIs or external services it depends on, what risks exist, and whether it is worth further time.

## First-Run Success Path

1. Accept one repo URL.
2. Read top-level signals first: `README`, directory structure, package manifests, key config files.
3. Return a compact brief with fixed sections:
   - What it is
   - Who it is for
   - Tech stack
   - Key entry points
   - External APIs / services
   - Maturity / maintenance signals
   - Reuse value
   - Risks / unknowns
   - Recommended next step
4. Keep the first answer decision-oriented, not exhaustive.

## Output Contract

- `One-line verdict`: should the user spend more time on this repo.
- `Repo summary`: what it does and why it exists.
- `Ideal user`: who benefits from it.
- `Stack and architecture`: main languages, frameworks, runtime, build tools.
- `Key files`: entry files and why they matter.
- `API and dependency signals`: external services, SDKs, hosted dependencies, auth requirements.
- `Quality signals`: stars, recency, docs clarity, test presence, release hygiene, obvious rough edges.
- `Reuse recommendation`: copy, learn from, monitor, integrate, or skip.
- `Next action`: the single best follow-up action.

## Working Rules

- Lead with the user decision, not with implementation trivia.
- Prefer top-level proof over speculative guesses.
- If a fact is not verified from repo files, say it is inferred.
- Keep the first response short enough to scan quickly.
- Treat missing docs, missing tests, and outdated dependencies as real product signals.

## Example Prompts

- `github-repo-research https://github.com/openai/openai-agents-python`
- `Use GitHub Repo Research on https://github.com/microsoft/playwright and tell me if it is worth integrating`
- `Analyze this repo and give me stack, entry points, risks, and reuse value`

## Monetization Hooks

- Free: one repo at a time with shallow analysis.
- Pro: deep file traversal, issue and PR review, dependency risk scan, and multi-repo comparison.
- Pro: exportable due-diligence briefs for teams, clients, or investment memos.
- Team: shared workspace, watchlists, alerting on repo changes, and reusable evaluation templates.

## Launch Checklist

- Make one-link first-run success non-negotiable.
- Ship with 3 public example repos and their expected output style.
- Use search-intent language in title and description: GitHub, Repo, Research, Analyzer, Summary.
- Track which output sections users care about most.
- Prepare adjacent variants only after the core repo brief feels obvious and useful.

## Portfolio Variants

- GitHub Repo Summary
- GitHub Repo Due Diligence
- GitHub PR Review
- GitHub Issue Triage
- GitHub Tech Stack Audit
- GitHub Competitor Repo Compare

## References

- Read [references/product-spec-zh.md](/mnt/d/workplace/skillget/sucess/generated-skills/github-repo-research/references/product-spec-zh.md) when you need the Chinese product definition, ICP, pricing hooks, and launch positioning.
- Read [references/launch-plan.md](/mnt/d/workplace/skillget/sucess/generated-skills/github-repo-research/references/launch-plan.md) when you want the 7-day shipping plan and release checklist.
- Read [references/publish-copy-zh.md](/mnt/d/workplace/skillget/sucess/generated-skills/github-repo-research/references/publish-copy-zh.md) when you need Chinese listing copy, value hooks, and launch messaging for publication.

## Packaging Guardrails

- Keep the published bundle lean: SKILL, runtime scripts, and concise references only.
- Use `metadata.aisa` frontmatter and `{baseDir}` for any future bundled-script examples.
- Avoid adding build files, tests, or environment-specific bootstrap commands to the release bundle.
