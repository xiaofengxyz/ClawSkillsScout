#!/usr/bin/env bash
set -euo pipefail

cat <<'JSON'
{
  "name": "github-repo-research",
  "title": "GitHub Repo Research",
  "apiFamily": "Search API / Social API",
  "oneLineValue": "Turn one GitHub repository URL into a fast decision brief.",
  "firstRunInput": "One public GitHub repository URL",
  "outputSections": [
    "One-line verdict",
    "Repo summary",
    "Ideal user",
    "Stack and architecture",
    "Key files",
    "API and dependency signals",
    "Quality signals",
    "Reuse recommendation",
    "Next action"
  ],
  "monetizationHooks": [
    "Free: shallow single-repo analysis",
    "Pro: deep traversal and issue/PR review",
    "Team: watchlists and shared evaluation templates"
  ],
  "portfolioVariants": [
    "GitHub Repo Summary",
    "GitHub Repo Due Diligence",
    "GitHub PR Review",
    "GitHub Issue Triage",
    "GitHub Tech Stack Audit"
  ]
}
JSON
