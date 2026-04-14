---
name: clawhub-security-auditor
description: "Audit ClawHub skill or plugin bundles for Suspicious upload risks. Use when: checking whether a skill or plugin may be flagged for cookie extraction, dangerous CLI calls, local persistence, cache sync, legacy auth env vars, or non-runtime files. This skill audits risk; it does not optimize SKILL.md search metadata or generate plugin manifests."
---

# ClawHub Security Auditor

Audit OpenClaw skills and ClawHub plugin bundles for patterns that commonly trigger `Suspicious` flags during ClawHub upload scans.

## When to use

- When a skill or plugin was flagged `Suspicious` on ClawHub and you need to find the likely causes
- When preparing a skill for upload to `clawhub.ai` or `cn.clawhub-mirror.com`
- When comparing EN and ZH bundles to ensure both were trimmed consistently
- When checking whether a release bundle still contains risky helper scripts, legacy auth paths, or local credential access code

## When NOT to use

- When you are editing product functionality unrelated to publishing
- When you only need search-discoverability optimization; use `clawhub-skill-optimizer` for metadata work
- When you need to package a plugin structure; use `clawhub-plugin-packager` for manifest generation

## Scope boundary

This skill owns:

- suspicious-pattern detection
- upload-risk explanation
- smallest-safe cleanup recommendations
- EN/ZH bundle consistency checks for security trimming

This skill does not own:

- SKILL.md search optimization
- plugin manifest generation
- broad feature refactors unless needed to remove a concrete upload risk

## Core goal

Find and explain upload risks without breaking the skill's runtime behavior. Prefer:

- removing non-runtime files from release bundles
- changing dangerous helper defaults to safe local-only behavior
- reducing credential surface area
- keeping the main runtime intact

## Primary risk categories

### 1. Cookie extraction and local credential access

Flag files or code paths such as:

- `chrome_cookies.py`
- `cookie_extract.py`
- `safari_cookies.py`
- browser SQLite cookie access
- macOS `security`
- `openssl`

Why this matters:

- ClawHub may classify these as `cookie extraction`, `Keychain access`, or `local sensitive credentials`

### 2. Dangerous external CLI invocation

Flag patterns such as:

- `claude -p --dangerously-skip-permissions`
- helper scripts that shell out to local agent CLIs
- broad local execution wrappers not needed for end-user runtime

Why this matters:

- Scanners may interpret this as privileged or unbounded local-agent execution

### 3. Self-install or cache sync behavior

Flag paths and scripts touching:

- `~/.claude/plugins/cache`
- `~/.openclaw/skills`
- `~/.agents/skills`
- local plugin cache sync helpers

Why this matters:

- Scanners may interpret this as persistence or self-modifying install behavior

### 4. Default writes into user-home data locations

Flag defaults such as:

- `~/.local/share/<tool>`
- `~/Documents/...`
- implicit SQLite stores in user home

Why this matters:

- Scanners may interpret this as persistent local data collection

### 5. Legacy secret surface area

Flag runtime config or setup code exposing deprecated credentials such as:

- `AUTH_TOKEN`
- `CT0`
- `FROM_BROWSER`
- `XAI_API_KEY`
- `GOOGLE_API_KEY`
- `GEMINI_API_KEY`
- `SCRAPECREATORS_API_KEY`

Why this matters:

- Even if deprecated, these enlarge the visible secret surface and can trigger suspicion

### 6. Version-switching or repo-mutation helpers

Flag patterns such as:

- `git show upstream/main`
- scripts that overwrite local `SKILL.md`
- scripts that swap skill versions in local install locations

Why this matters:

- Scanners may interpret this as code mutation or repo rewriting

### 7. Non-runtime developer utilities in release bundles

Flag files such as:

- `compare.sh`
- `sync.sh`
- `test-v1-vs-v2.sh`
- local benchmark scripts
- packaging-only utilities
- release-only debug helpers

Why this matters:

- These often contain one or more flagged behaviors even if runtime is clean

### 8. Non-text files and generated artifacts

Flag and usually remove:

- `__pycache__/`
- `.pytest_cache/`
- `*.pyc`
- logs
- binary assets not required by runtime
- temporary comparison output

Why this matters:

- They enlarge the upload surface and are unnecessary for published skills

### 9. Aggressive persistence wording

Flag wording such as:

- `always save the FULL dump to disk`
- transcript persistence as a default behavior

Why this matters:

- Even comments and docs can influence security review when they describe unconditional local data retention

## Audit workflow

1. Identify the target bundle or source directory.
2. Scan for the risk categories above.
3. Separate findings into:
   - runtime-breaking risks
   - non-runtime packaging risks
   - wording / metadata risks
4. Recommend the smallest safe fix.
5. Re-scan after fixes.
6. If EN and ZH bundles exist, compare both and ensure the same safety trimming was applied.

## Output format

Prefer this structure:

1. Findings
   - ordered by upload risk severity
   - include file paths and the suspicious pattern
2. Safe fixes
   - explain the smallest change that removes the risk
   - explicitly say whether runtime functionality is preserved
3. Final verdict
   - `ready to upload`
   - `uploadable with residual risk`
   - `not ready`

## Practical rules

- Do not recommend deleting core runtime code just because it looks noisy.
- Prefer trimming release bundles over rewriting the whole skill.
- Prefer repo-local persistence defaults over user-home defaults.
- Prefer API-key-only runtime auth for published bundles.
- Apply the same security trimming to both EN and ZH bundles; ClawHub may rescan them independently.

## Example requests

- `Audit this skill bundle for ClawHub Suspicious risks`
- `Compare last30days and last30days-zh and tell me why one got flagged`
- `Check whether this upload package still has cookie extraction or cache sync behavior`
- `Give me the smallest safe cleanup before publishing to ClawHub`
