---
name: clawhub-skill-optimizer
description: "Optimize ClawHub skill packaging and metadata. Use when: publishing or refining a SKILL.md-based ClawHub skill for better search discoverability, bilingual naming, frontmatter quality, and agent invocation. Not for plugin manifest generation or Suspicious-risk auditing."
---

# ClawHub Skill Optimizer

Optimize SKILL.md-based ClawHub skills to maximize search discoverability on ClawHub (clawhub.ai / cn.clawhub-mirror.com) and agent invocation probability in OpenClaw, without changing the skill's original functionality.

## When to use

- When packaging a new skill for publication on ClawHub
- When optimizing an existing skill's metadata for better search ranking
- When generating bilingual (English + Chinese) skill versions
- When writing or rewriting YAML frontmatter `description` fields
- When structuring SKILL.md body for optimal agent consumption
- When the target artifact is still a skill, not a plugin

## When NOT to use

- When creating skills for local-only use (not published to ClawHub)
- When the task is about OpenClaw configuration, not skill packaging
- When editing skill functionality or logic (this skill only optimizes metadata and structure)
- When generating `.claude-plugin/plugin.json`, `package.json`, or `openclaw.plugin.json`; use `clawhub-plugin-packager`
- When auditing a bundle for `Suspicious` upload risks; use `clawhub-security-auditor`

## Scope boundary

This skill owns:

- skill naming and bilingual naming
- YAML frontmatter quality
- `SKILL.md` structure
- ClawHub skill search discoverability
- OpenClaw skill invocation wording

This skill does not own:

- plugin manifest generation
- release zip assembly rules for plugins
- security/risk auditing beyond lightweight reminders

## Core mechanism awareness

Two mechanisms drive all optimization decisions:

**OpenClaw agent selection**: Agent sees only `<name>` + `<description>` in an XML list at session start. Agent decides based on description alone — SKILL.md body is loaded only after selection. Therefore `description` quality directly determines invocation probability.

**ClawHub search**: Uses hybrid text matching + relevance scoring on `name`, `slug`, and `summary` (= frontmatter `description`). Exact keyword matches in name/slug rank highest. Usage signals (downloads, stars) also affect ranking but do NOT dominate relevance.

**Critical platform difference**: clawhub.ai search does NOT support Chinese characters — pure Chinese skills are invisible on the main site. cn.clawhub-mirror.com has its own localized search that supports Chinese.

## Packaging workflow

1. Generate YAML frontmatter (apply description rules)
2. Structure SKILL.md body (apply section rules)
3. Generate bilingual versions (English + Chinese)
4. Run the validation checklist
5. Publish to ClawHub

### Step 1: Generate YAML frontmatter

The frontmatter is the single most important element. Read `references/frontmatter-rules.md` for complete templates and the five description writing laws.

Key points for the `description` field:
- Lead with core functionality — action verb preferred but not mandatory
- Embed explicit trigger: "Use when:" (EN) or "触发条件：" (ZH)
- Include exact keywords users will search for (not just semantic synonyms)
- Keep 50-200 characters (sweet spot: 80-150)
- No marketing language ("powerful", "best", "强大的")

**English pattern:**
```
[Core functionality description]. Use when: [trigger]. Supports [features].
```

**Chinese pattern:**
```
[核心功能描述]。触发条件：当用户需要[场景]时使用。支持[特性]。
```

**Upload-compatibility rule:**
- Prefer a flat, conservative frontmatter shape for published skills.
- Put `author`, `version`, `license`, and `user-invocable` at the top level when present.
- Keep `metadata:` focused on `metadata.openclaw` only; avoid mixing unrelated sibling keys under `metadata`.
- For relay/API-key skills, declare `primaryEnv` and `requires` both at the top level and under `metadata.openclaw`.
- If a package was previously flagged for undeclared credentials, first compare its frontmatter shape against a known-good upload before changing runtime behavior.
- If the shipped runtime is primarily a bundled Python client, declare `python3` as the required bin and treat `curl` as optional documentation only unless the release bundle truly depends on both paths equally.
- Keep descriptions, setup steps, and command examples aligned with the same primary runtime path; mixed `curl` + `python` messaging can look like a metadata mismatch when only one path is actually shipped and supported.

### Step 2: Structure SKILL.md body

The body is read only after agent selects the skill. Structure should match the skill type. Read `references/body-structure.md` for detailed guidance.

**Recommended modules** (choose what fits, not all required):

| Module | When to include | Priority |
| :--- | :--- | :--- |
| When to use | Always — helps agent confirm selection | Required |
| When NOT to use | When similar skills exist — prevents misuse | Recommended |
| Quick Reference | For CLI/command-based skills | High |
| Capabilities | For multi-function skills | High |
| Operations | For API-wrapper skills with callable functions | Medium |
| Inputs/Outputs | For skills with structured parameters | Medium |
| Example Queries | For search/query-based skills | Medium |
| Setup/Installation | For skills requiring environment config | As needed |

### Step 3: Generate bilingual versions

Always generate both English and Chinese versions. Read `references/bilingual-rules.md` for naming conventions and Chinese localization requirements.

| Aspect | English (clawhub.ai) | Chinese (cn.clawhub-mirror.com) |
| :--- | :--- | :--- |
| Slug | `[function]` or `[function]-[qualifier]` | `[function]-zh` or `[chinese-pinyin]` |
| Name | Concise, keyword-rich | Natural Chinese expression |
| Description | Must contain English search keywords | Must contain Chinese search terms + keep core English terms |
| Target site | clawhub.ai (English search only) | cn.clawhub-mirror.com (Chinese search) |

### Step 4: Run validation checklist

Before publishing, verify every item:

| # | Check | Standard |
| :--- | :--- | :--- |
| 1 | Frontmatter format | Valid YAML with `name`, `description`; name is hyphen-case, max 64 chars |
| 2 | Description content | No angle brackets `<>`, max 1024 chars |
| 3 | Trigger in description | Contains "Use when:" (EN) or "触发条件：" (ZH) |
| 4 | Keyword coverage | Name/slug contain primary search terms users would type |
| 5 | Bilingual versions | Both EN and ZH with correct slug conventions |
| 6 | Body relevance | Includes at minimum "When to use" section |
| 7 | Chinese naturalness | No literal translation artifacts |
| 8 | Search isolation | EN version searchable on clawhub.ai; ZH version searchable on cn.clawhub-mirror.com |
| 9 | Security | No password requests; API key auth only |
| 10 | Environment deps | Required bins/env declared in metadata (if applicable) |
| 11 | Functionality preserved | Optimization did not change skill logic |

### Step 4.5: Suspicious Scan Lessons

Recent real ClawHub uploads were flagged `Suspicious` for these exact reasons:

1. **Dangerous external CLI invocation**
   - Examples: `claude -p --dangerously-skip-permissions`, helper scripts that shell out to external agent CLIs.
   - Why it flags: platform scanners treat this as elevated local-agent execution.

2. **Copying into plugin caches or user skill directories**
   - Examples: scripts that write into `~/.claude/plugins/cache`, `~/.openclaw/skills`, `~/.agents/skills`, or similar directories.
   - Why it flags: scanners interpret this as self-install / persistence behavior.

3. **Writing research data into user home directories by default**
   - Examples: default paths like `~/.local/share/last30days`, `~/Documents/...`, or implicit SQLite stores in home.
   - Why it flags: scanners interpret this as persistent local data collection.

4. **Version-control or repo-rewriting helpers in the shipped package**
   - Examples: `git show upstream/main`, scripts that overwrite `SKILL.md`, or tooling that swaps local skill versions.
   - Why it flags: scanners interpret this as code mutation or source rewriting.

5. **Publishing debug/test helpers that are not required for runtime**
   - Examples: compare harnesses, migration helpers, test runners, sync scripts, packaging-only utilities.
   - Why it flags: even if benign, these widen the attack surface and often include the behaviors above.

6. **Transcript/raw dump wording that implies broad local persistence**
   - Examples: comments or docs saying “always save the FULL dump to disk”.
   - Why it flags: scanners may treat this as suspicious data retention even when it is only a debug artifact.

7. **Browser cookie extraction or Keychain access code in the shipped package**
   - Examples: files like `chrome_cookies.py`, `cookie_extract.py`, `safari_cookies.py`
   - Why it flags: these often read browser cookie databases, call macOS `security`, call `openssl`, or otherwise touch local credential stores
   - This maps directly to scanner labels such as `cookie extraction`, `Keychain access`, and `local sensitive credentials`

8. **Legacy credential inputs still exposed in runtime config**
   - Examples: `AUTH_TOKEN`, `CT0`, `FROM_BROWSER`, `XAI_API_KEY`, `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `SCRAPECREATORS_API_KEY`
   - Why it flags: even if no longer recommended, scanners interpret multi-provider auth and browser-derived credentials as expanded secret surface area
   - If a skill is intended to be AISA-only or API-key-only, these legacy auth inputs should be removed from the shipped runtime, not merely undocumented

How to avoid repeat flags:

- Prefer API-key-only runtime paths.
- Keep release bundles minimal: runtime code, `SKILL.md`, and essential metadata only.
- Remove or neuter helper scripts that invoke external CLIs, mutate local installs, or persist to home directories by default.
- Use repo-local default data paths such as `./.tool-data` when persistence is necessary.
- Remove browser cookie extraction helpers and any code that touches Keychain, browser SQLite stores, or local credential vaults.
- Collapse legacy auth inputs to the minimum supported set; do not ship dead compatibility secrets in `env.py` or setup code.
- Treat Chinese and English packages the same: if one bundle still contains risky helpers, a re-upload may be reclassified even if a previous version passed.

### Step 5: Publish

Use `clawhub skill publish` or `openclaw skills install` to publish. Ensure both language versions are published separately.

## Security rules

- NEVER request user passwords in any skill
- Use API key authentication only
- Declare required binaries in `metadata.openclaw.requires.bins`
- Declare required env vars in `metadata.openclaw.requires.env`
- For maximum parser compatibility, also duplicate required env/bins at top-level `requires` and set top-level `primaryEnv`
- Do not declare `curl` as a required bin when the published package's real execution path is a Python client and `curl` is only an illustrative example
- Avoid shipping helper scripts that call external agent CLIs, sync into cache directories, or write persistent data into user-home locations by default
