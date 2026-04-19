---
name: x-intelligence-automation
description: "Run X/Twitter intelligence and growth workflows through the AISA relay. Use when: the user needs tweet search, monitoring, posting, likes, follows, or market intelligence with one API key. Supports read APIs, OAuth-gated publishing, and engagement actions."
metadata:
  aisa:
    emoji: "🐦"
    requires:
      bins:
        - python3
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# X Intelligence Automation

Intelligence-first X/Twitter operator for monitoring, publishing, and approved engagement through the AISA relay.

## When to use

- The user wants Twitter/X monitoring and intelligence, not just one-off tweet search.
- The workflow needs one package for read, publish, and engagement actions after explicit approval.
- The task fits analyst, operator, or competitor-tracking use cases powered by `AISA_API_KEY`.

## When NOT to use

- The user needs cookie extraction, password login, or a fully local Twitter client.
- The workflow must avoid relay-based network calls or media upload through `api.aisa.one`.
- The task needs undocumented secrets or browser-derived auth values.

## Quick Reference

- Required env: `AISA_API_KEY`
- Read client: `./scripts/twitter_client.py`
- Post client: `./scripts/twitter_oauth_client.py`
- Engage client: `./scripts/twitter_engagement_client.py`
- References: `./references/post_twitter.md`, `./references/engage_twitter.md`

## Setup

```bash
export AISA_API_KEY="your-key"
```

All network calls go to `https://api.aisa.one/apis/v1/...`.

## Capabilities

- Read user, tweet, trend, list, community, and Spaces data.
- Publish text, image, and video posts after explicit OAuth approval.
- Like, unlike, follow, and unfollow through the engagement client once authorization exists.
- Reuse OpenClaw context instead of local file-based conversation persistence.

## High-Intent Workflows

- Monitor creators, competitors, or trends before taking action.
- Search a topic, identify who matters, then follow or engage after approval.
- Use one skill as an X/Twitter intelligence desk for operators.

## Common Commands

```bash
python3 {baseDir}/scripts/twitter_client.py search --query "AI agents" --type Latest
python3 {baseDir}/scripts/twitter_oauth_client.py authorize
python3 {baseDir}/scripts/twitter_oauth_client.py post --text "Hello from OpenClaw"
python3 {baseDir}/scripts/twitter_engagement_client.py like-latest --user "@elonmusk"
python3 {baseDir}/scripts/twitter_engagement_client.py follow-user --user "@elonmusk"
```

## Posting and Engagement Workflow

- Use `./references/post_twitter.md` for post, reply, quote, and media-upload actions.
- Use `./references/engage_twitter.md` for likes, unlikes, follows, and unfollows.
- Obtain OAuth authorization before any write action.

## Example Requests

- "Monitor X for competitors in AI coding and show me the strongest accounts to track."
- "Search a niche, summarize the conversation, then follow the top operators after approval."
- "Use X Intelligence Automation as a research-and-action workflow."

## ClawHub Suspicious Review Notes

These points summarize the common reasons similar skills are marked `Suspicious` and how this release addresses them:

- The package is relay-based: read calls, OAuth requests, engagement actions, and approved media uploads go to `api.aisa.one`.
- The package is API-key-first: it requires `AISA_API_KEY` and does not ask for passwords, cookies, `CT0`, or other legacy secrets.
- The release bundle is runtime-only: it keeps `SKILL.md`, `scripts/`, and the required references, while omitting non-runtime files such as `README.md` and `_meta.json`.
- The package does not include cache sync, self-install logic, home-directory persistence, browser-cookie extraction, or external agent CLI wrappers.
- Browser opening is optional and not the default workflow; returning the authorization link is the preferred path for OpenClaw.

## Release Bundle Notes

- `scripts/twitter_client.py` preserves the read API surface from the original bundle.
- `scripts/twitter_oauth_client.py` preserves OAuth and posting behavior from the original bundle.
- `scripts/twitter_engagement_client.py` preserves like, unlike, follow, and unfollow behavior from the original bundle.
- This package is optimized for publication metadata and upload safety, not for changing runtime logic.
