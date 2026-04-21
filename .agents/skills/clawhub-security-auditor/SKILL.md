---
name: clawhub-security-auditor
description: "Audit public skill or plugin bundles for ClawHub, Claude, Hermes, AgentSkill, and GitHub release risks. Use when: checking Suspicious/upload flags, dangerous local behaviors, quality/security mismatches, legacy auth surface, or non-runtime files before publishing."
---

# Publish Security Auditor

This skill keeps the legacy `clawhub-*` name for compatibility, but its real job is broader: audit public skill and plugin bundles for patterns that commonly trigger `Suspicious` flags, marketplace rejection, quality-score collapse, or avoidable trust regressions during publishing.

## When to use

- When a skill or plugin was flagged `Suspicious` on ClawHub and you need the likely causes
- When preparing a release bundle for ClawHub, Claude, Hermes, AgentSkill, or public GitHub distribution
- When comparing EN and ZH bundles to ensure they were trimmed consistently
- When checking whether a release bundle still contains risky helper scripts, legacy auth paths, or local credential access code
- When a package looks structurally correct but may still fail scanner, audit, or trust review

## When NOT to use

- When you only need metadata optimization or search wording; use `clawhub-skill-optimizer`
- When you need plugin manifests or marketplace wrappers; use `clawhub-plugin-packager`
- When the task is general product refactoring unrelated to publishing

## Scope boundary

This skill owns:

- suspicious-pattern detection
- upload-risk explanation
- smallest-safe cleanup recommendations
- EN/ZH consistency checks for shipped runtime scope
- frontmatter and registry mismatch detection
- quality/security trust-surface mismatch detection

This skill does not own:

- search-copy optimization
- plugin manifest generation
- broad feature redesign unless required to remove a concrete publish risk

## Core goal

Find and explain publish risks without breaking runtime behavior. Prefer:

- removing non-runtime files from release bundles
- downgrading dangerous defaults to repo-local or explicit behavior
- shrinking credential surface area
- preserving the main shipped workflow

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

- scanners may classify these as `cookie extraction`, `Keychain access`, or `local sensitive credentials`

### 2. Dangerous external CLI invocation

Flag patterns such as:

- `claude -p --dangerously-skip-permissions`
- helper scripts that shell out to local agent CLIs
- broad local execution wrappers not needed for end-user runtime

Why this matters:

- scanners may interpret this as privileged or unbounded local-agent execution

### 3. Self-install or cache sync behavior

Flag paths and scripts touching:

- `~/.claude/plugins/cache`
- `~/.openclaw/skills`
- `~/.agents/skills`
- local plugin cache sync helpers

Why this matters:

- scanners may interpret this as persistence or self-modifying install behavior

### 4. Default writes into user-home data locations

Flag defaults such as:

- `~/.local/share/<tool>`
- `~/Documents/...`
- implicit SQLite stores in user home

Why this matters:

- scanners may interpret this as persistent local data collection

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

- even if deprecated, these enlarge the visible secret surface and can trigger suspicion

### 6. Version-switching or repo-mutation helpers

Flag patterns such as:

- `git show upstream/main`
- scripts that overwrite local `SKILL.md`
- scripts that swap skill versions in local install locations

Why this matters:

- scanners may interpret this as code mutation or repo rewriting

### 7. Non-runtime developer utilities in release bundles

Flag files such as:

- `compare.sh`
- `sync.sh`
- `test-v1-vs-v2.sh`
- local benchmark scripts
- packaging-only utilities
- release-only debug helpers

Why this matters:

- these often contain one or more flagged behaviors even if runtime is clean

### 8. Non-text files and generated artifacts

Flag and usually remove:

- `__pycache__/`
- `.pytest_cache/`
- `*.pyc`
- logs
- binary assets not required by runtime
- temporary comparison output

Why this matters:

- they enlarge the upload surface and are unnecessary for published skills

### 9. Aggressive persistence wording

Flag wording such as:

- `always save the FULL dump to disk`
- transcript persistence as a default behavior

Why this matters:

- comments and docs can influence security review when they describe unconditional local retention

### 10. Frontmatter or registry mismatch

Flag cases such as:

- runtime instructions require `AISA_API_KEY` or another secret, but machine-readable metadata is missing or stale
- `primaryEnv` appears only in prose, not in frontmatter
- release bundles ship different frontmatter shapes across EN and ZH variants
- the package declares bins or env vars that do not match the actual shipped runtime path
- source and publish bundles drift so far apart that the publish copy claims capabilities the bundle no longer ships

Why this matters:

- a package can fail upload or trust review even when the runtime itself is fine

### 11. Quality-score collapse from bundle drift

Flag cases such as:

- the title promises a narrow expert workflow, but the bundle is generic or empty
- examples mention outputs the shipped files do not produce
- AgentSkill or marketplace metadata claims platform support the bundle does not actually ship
- GitHub README, marketplace listing, and bundle contents disagree materially

Why this matters:

- a package can survive upload and still lose discovery because quality/security/rating reviewers see a trust mismatch

## Platform-specific review lenses

### ClawHub

- watch for `Suspicious`, source mismatch, capability/install incoherence, and unsafe local side effects

### Claude

- watch for runtime vs README drift, non-runtime helpers, and overly broad install claims

### Hermes

- watch for unsafe community wording, non-runtime references, and category/tag mismatch

### AgentSkill

- watch for obvious security findings, weak implementation evidence, and copy that would depress discovery/structure/expertise scores
- quality and security pages effectively become part of the public product surface

### GitHub

- watch for provenance gaps, stale README claims, and missing install proof

## Severity model

Classify every finding as exactly one of:

- `blocker`
  - high likelihood of upload rejection, `Suspicious`, or hidden trust regression
- `warning`
  - upload may succeed, but residual risk or trust fragility remains
- `note`
  - informational cleanup or polish item

## Output format

Prefer this structure:

1. Findings
   - grouped into `blocker`, `warning`, and `note`
   - include file paths, the suspicious pattern, and why the platform may care
2. Safe fixes
   - explain the smallest change that removes the risk
   - state whether runtime functionality is preserved, reduced, or unchanged
3. Final verdict
   - `ready to upload`
   - `uploadable with low residual risk`
   - `uploadable with residual risk`
   - `not ready`

## Practical rules

- do not recommend deleting core runtime code just because it looks noisy
- prefer trimming publish bundles over rewriting the whole skill
- prefer API-key-only runtime auth for published bundles
- when a credential mismatch is reported, compare against a known-good uploaded bundle before touching runtime code
- if multiple invocation styles exist in docs, prefer declaring only the true shipped runtime path as required
- apply the same trimming to EN and ZH bundles; platforms may rescan them independently
- if AgentSkill/marketplace pages emphasize security or quality reviews, treat mismatched documentation as a trust issue, not just a style issue

## Example requests

- `Audit this skill bundle for ClawHub Suspicious risks`
- `Check whether this Claude or AgentSkill bundle still ships non-runtime files`
- `Compare the Hermes and ClawHub releases for the same skill and list publish risks`
- `Give me the smallest safe cleanup before uploading this package`
