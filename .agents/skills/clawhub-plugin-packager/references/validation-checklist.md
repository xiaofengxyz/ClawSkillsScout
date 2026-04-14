# Bundle Plugin Packaging Validation Checklist

Run through every item before publishing or packaging a Bundle Plugin. All items must pass.

## Structure Validation

| # | Check | Standard | How to Verify |
| :--- | :--- | :--- | :--- |
| S1 | `.claude-plugin/plugin.json` exists | Valid JSON, minimal 4 fields | `cat .claude-plugin/plugin.json \| python3 -m json.tool` |
| S2 | `package.json` exists | Minimal metadata, NO `openclaw` field | `cat package.json \| python3 -m json.tool` |
| S3 | `openclaw.plugin.json` DOES NOT exist | Bundle Plugins must not have this | `ls openclaw.plugin.json` (should fail) |
| S4 | `skills/` directory exists | Contains subdirectories for each skill | `ls skills/` |
| S5 | `SKILL.md` exists in subdirectories | E.g., `skills/my-skill/SKILL.md` | `ls skills/*/SKILL.md` |
| S6 | No conflicting formats | No `.codex-plugin/` or `.cursor-plugin/` dirs | `ls -a` |

## Metadata Validation

| # | Check | Standard | How to Verify |
| :--- | :--- | :--- | :--- |
| M1 | `name` consistency | Same slug across both manifests | Compare `name` fields |
| M2 | `version` consistency | Same semver across both manifests | Compare `version` fields |
| M3 | `description` quality | 80-150 chars, contains search keywords | Manual review |
| M4 | `skills` field in plugin.json | Must be `"skills"` | Check `.claude-plugin/plugin.json` |
| M5 | No extra fields in plugin.json | No `interface`, `keywords`, etc. | Check `.claude-plugin/plugin.json` |

## Search Optimization Validation

| # | Check | Standard |
| :--- | :--- | :--- |
| O1 | Slug contains primary keyword | e.g., `claw-voice-call` not `my-plugin-v2` |
| O2 | Description is keyword-dense | Contains all primary search terms naturally |
| O3 | No Chinese on clawhub.ai version | English-only for main site |

## Invocation Optimization Validation

| # | Check | Standard |
| :--- | :--- | :--- |
| I1 | SKILL.md frontmatter has "Use when:" | Explicit trigger condition in description |
| I2 | SKILL.md description starts with action verb | e.g., "Place phone calls..." not "A plugin that..." |
| I3 | SKILL.md is uppercase | Must be exactly `SKILL.md`, not `skill.md` |

## Release Packaging Validation

| # | Check | Standard |
| :--- | :--- | :--- |
| R1 | Zip structure is correct | All files must be inside a `package/` top-level directory |
| R2 | Zip contains all files | Includes manifests, skills, scripts, README |
