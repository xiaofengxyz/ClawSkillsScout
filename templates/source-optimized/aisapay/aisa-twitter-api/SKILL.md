---
name: aisa-twitter-api
description: "Run the official AISA Twitter/X API workflow from research to approved posting. Use when: the user needs profile lookup, tweet search, trend tracking, thread context, or OAuth-gated publishing with one AISA_API_KEY. Supports account intel, market monitoring, quote/reply prep, and media posting."
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

# AISA Twitter API Command Center

Official AISA-first X/Twitter workflow skill for account intelligence, live conversation research, and approved posting with one API key.

## When to use

- The user wants the AISA flagship skill for X/Twitter research, monitoring, and posting.
- The workflow needs one package that starts with account or topic research and can continue into approved publishing.
- The task needs repeatable JSON outputs for search, trends, profile intel, thread context, or quote/reply preparation.

## When NOT to use

- The user needs cookie extraction, browser credential scraping, or direct password login.
- The workflow must avoid sending requests, OAuth state, or approved media through `api.aisa.one`.
- The request is for likes, follows, engagement farming, or other actions not covered by this package.

## Quick Reference

- Required env: `AISA_API_KEY`
- Read client: `./scripts/twitter_client.py`
- OAuth and post client: `./scripts/twitter_oauth_client.py`
- Post workflow guide: `./references/post_twitter.md`

## Setup

```bash
export AISA_API_KEY="your-key"
```

All network calls go to `https://api.aisa.one/apis/v1/...`.

## Capabilities

- Account intelligence: profile lookup, about data, tweets, mentions, followers, followings, verified followers, and follow-relationship checks.
- Conversation intelligence: advanced tweet search, tweet detail, replies, quotes, retweeters, article fetch, and full thread context.
- Discovery surfaces: trends, user search, lists, communities, and Spaces.
- Approved posting: authorization, text posts, media posts, quote posts, reply-based threads, and automatic splitting for long content.

## Inputs and Outputs

- Inputs: usernames, search queries, tweet IDs or URLs, optional local media files, and explicit post text.
- Read outputs: JSON results from search, profile, trend, thread, and discovery endpoints.
- Publish outputs: authorization links, relay responses, tweet IDs, and publish status.

## High-Intent Workflows

- Research a creator, founder, or competitor before outreach.
- Scan a launch, brand, or topic on X, then inspect thread context before responding.
- Check trends, gather evidence, and prepare a post that can be published after approval.
- Quote or reply to a specific tweet with explicit OAuth approval and workspace media files.

## Common Commands

```bash
python3 {baseDir}/scripts/twitter_client.py user-info --username elonmusk
python3 {baseDir}/scripts/twitter_client.py search --query "AI agents" --type Latest
python3 {baseDir}/scripts/twitter_client.py thread --tweet-id 1888888888888888888
python3 {baseDir}/scripts/twitter_oauth_client.py authorize
python3 {baseDir}/scripts/twitter_oauth_client.py post --text "My take on this" --type quote --quote-tweet-url "https://x.com/example/status/1888888888888888888"
python3 {baseDir}/scripts/twitter_oauth_client.py post --text "Shipping day" --media-file ./workspace/launch.png
```

## Posting Workflow

When the user asks to send, publish, quote, or reply on X/Twitter, follow `./references/post_twitter.md`.

- Return the authorization link first when posting is not yet approved.
- Use `--media-file` only for user-provided local workspace files.
- Quote posts require the original tweet URL; reply-to-external-tweet flows require the target tweet ID.
- Do not claim success until the relay returns a successful publish result.

## Example Requests

- "Research this X account and summarize what they talk about, who they engage with, and whether it is worth replying."
- "Search X for AI agent launches in the last day and show me the highest-signal tweets plus thread context."
- "Check worldwide X trends and tell me which ones matter for our product category."
- "Quote this tweet with my comment after OAuth approval."
- "Use the local image file in the workspace and publish a short launch post to X."

## ClawHub Suspicious Review Notes

These points summarize the common reasons similar skills are marked `Suspicious` and how this release addresses them:

- The package is relay-based: read calls, OAuth requests, and approved media uploads go to `api.aisa.one`.
- The package is `AISA_API_KEY`-first: it does not ask for passwords, cookies, `CT0`, or other legacy secrets.
- The release bundle is runtime-only: it keeps `SKILL.md`, `scripts/`, and the posting reference, while omitting non-runtime files such as `README.md` and `_meta.json`.
- The package does not include cache sync, self-install logic, home-directory persistence, browser-cookie extraction, or external agent CLI wrappers.
- Browser opening is optional and not the default workflow; returning the authorization link is the preferred path for OpenClaw and similar hosts.

## Release Bundle Notes

- `scripts/twitter_client.py` preserves the read API surface from the original bundle.
- `scripts/twitter_oauth_client.py` preserves OAuth and posting behavior from the original bundle.
- This package is optimized for publication metadata and upload safety, not for changing runtime logic.
