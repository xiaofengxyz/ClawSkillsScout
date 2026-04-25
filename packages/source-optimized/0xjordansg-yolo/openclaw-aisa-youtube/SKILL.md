---
name: openclaw-aisa-youtube
description: "Search YouTube videos, channels, and playlists through the AISA YouTube endpoint with one API key. Use when: the user needs fast YouTube lookup, locale-aware discovery, or filter-token pagination without Google credentials. Supports query search, region/language filters, and structured SERP output."
metadata:
  aisa:
    emoji: "🎬"
    requires:
      bins:
        - curl
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# YouTube Search API

Fast YouTube lookup skill for videos, channels, playlists, and locale-aware discovery through the AISA relay.

## When to use

- The user wants a fast YouTube lookup skill without setting up Google credentials.
- The task needs region, language, or pagination filters on top of normal YouTube search.
- The workflow prefers quick curl-first checks over a heavier research workflow.

## When NOT to use

- The user needs browser automation, local scraping, or direct YouTube account actions.
- The workflow must avoid sending search requests to `api.aisa.one`.
- The request depends on a local helper script that is not part of this package.

## Quick Reference

- Required env: `AISA_API_KEY`
- Endpoint: `https://api.aisa.one/apis/v1/youtube/search`
- This package is curl-first and does not ship a local Python client.

## Setup

```bash
export AISA_API_KEY="YOUR_AISA_API_KEY"
```

## Common Commands

```bash
curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=machine+learning+tutorial" \
  -H "Authorization: Bearer $AISA_API_KEY"

curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=AI+news&gl=us&hl=en" \
  -H "Authorization: Bearer $AISA_API_KEY"

curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=python+tutorial&sp=EgIQAQ%3D%3D" \
  -H "Authorization: Bearer $AISA_API_KEY"
```

## Capabilities

- Basic YouTube SERP lookup with `q`
- Locale filtering with `gl` and `hl`
- Pagination and search filtering with `sp`
- Structured responses that may return `videos` or grouped `sections`

## High-Intent Workflows

- Quick validation of YouTube demand for a topic or keyword.
- Region-specific search checks before a content or SEO decision.
- Lightweight YouTube API access for agents that only need structured results.

## Example Requests

- "Search YouTube for AI coding tutorials and return the top structured results."
- "Check YouTube results for this keyword in the US and Japan."
- "Use the YouTube Search API skill when I need fast video discovery, not full competitor research."

## ClawHub Suspicious Review Notes

These points summarize the common reasons similar skills are marked `Suspicious` and how this release addresses them:

- The package is relay-based: all search requests go to `api.aisa.one`.
- The package is API-key-first: it requires `AISA_API_KEY` and does not ask for passwords, cookies, browser data, or other legacy secrets.
- The frontmatter declares required bins/env, primary env, and compatibility under canonical `metadata.aisa`.
- The release bundle is runtime-only: it keeps `SKILL.md` and `LICENSE.txt`, while omitting non-runtime files such as `README.md` and `_meta.json`.
- The package does not include browser automation, cache sync, home-directory persistence, cookie extraction, or external agent CLI wrappers.

## Release Bundle Notes

- Search behavior remains the same as the original package.
- The only change is release trimming and clearer publication metadata.
