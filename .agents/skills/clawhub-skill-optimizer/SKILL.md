---
name: clawhub-skill-optimizer
description: "Optimize publish-ready SKILL.md packages across ClawHub, Claude, Hermes, AgentSkill, and GitHub. Use when: refining naming, frontmatter, body structure, bilingual copy, platform variants, and breakout positioning without changing runtime behavior."
---

# Publish Skill Optimizer

This skill keeps the legacy `clawhub-*` name for compatibility, but its job is now broader: optimize `SKILL.md`-based skills for public distribution across ClawHub, Claude, Hermes, AgentSkill, GitHub, and related runtimes while preserving runtime behavior.

## When to use

- When packaging or refining a skill for public distribution on ClawHub, Claude, Hermes, AgentSkill, or GitHub
- When optimizing skill naming, frontmatter, and body structure for stronger discovery and invocation
- When generating bilingual English and Chinese variants
- When deciding how the source mother skill should differ from a platform-specific publish bundle
- When improving breakout positioning without rewriting runtime logic

## When NOT to use

- When the task is primarily about plugin manifests or marketplace wrappers; use `clawhub-plugin-packager`
- When the main task is auditing security or publish risk; use `clawhub-security-auditor`
- When editing business logic, API behavior, or runtime code beyond publish-surface alignment

## Scope boundary

This skill owns:

- naming and bilingual naming
- YAML frontmatter quality
- `SKILL.md` structure
- search discoverability and invocation wording
- publish-mode wording and section layout
- platform-specific publish variants
- breakout positioning and sibling-ladder separation

This skill does not own:

- plugin manifest generation
- release zip assembly rules
- deep Suspicious/security auditing
- broad runtime refactors

## Release modes

Choose the target mode before editing copy:

- `source mode`
  - canonical mother skill
  - keep portable, richer context
  - use canonical `metadata.aisa`
- `clawhub publish mode`
  - optimize for ClawHub search, upload safety, and parser compatibility
- `claude publish mode`
  - optimize for Claude Code readability, repo trust, and install clarity
- `hermes publish mode`
  - optimize for category/tag discovery and runtime-only clarity
- `agentskill publish mode`
  - optimize for quality review, security review, rating trust, GitHub proof, and platform coverage
- `github release mode`
  - optimize for source trust, README clarity, and copy-paste installability

If one `SKILL.md` cannot satisfy all targets cleanly, generate separate publish variants instead of forcing a noisy compromise.

## Core principles

### 1. Selection happens on the description first

Most agents see `name` and `description` before they read the full body. Therefore the description must:

- say what the skill does in plain language
- contain `Use when:` or `触发条件：`
- include the exact task words users search for
- state the first useful outcome, not generic marketing

### 2. "Breakout" means clearer JTBD, not louder hype

Prefer:

- title = user task, system, or workflow surface
- first line = immediate user value
- examples = concrete, high-intent requests
- sibling skills = distinct jobs, not keyword overlap

Avoid:

- vague adjectives like `powerful`, `best`, `advanced`
- abstract names with no task signal
- making sibling skills compete for the same demand

### 3. Mother skill and publish bundle can differ

The source skill can stay richer and more portable. The publish bundle should only describe the shipped runtime and shipped files.

### 4. Explosive growth usually comes from a ladder, not a singleton

When optimizing a public skill family, think in three layers:

- flagship skill
  - broad command center or command surface
- sibling skills
  - narrower, high-intent JTBD variants
- author factory
  - repeated naming logic, repeated trust logic, repeated install logic

The copy should help the skill fit into this ladder instead of looking like a random one-off.

## Cross-platform ranking signals

### ClawHub

- exact keyword matches in `name`, `slug`, and `description` matter
- clear `Use when:` phrasing improves invocation fit
- upload-safe wording and coherent metadata reduce trust friction
- bilingual EN/ZH variants should keep the same runtime surface

### Claude

- strong task titles and direct descriptions outperform abstract internal names
- repo trust, stars, installs, and example readability affect adoption
- the publish copy should match the shipped runtime exactly
- flagship + sibling packaging performs better than one overloaded mega skill

### Hermes

- category and tag clarity matter more than broad marketing copy
- runtime-only, community-safe wording is important
- bundle should read as a useful operational unit, not a dev dump

### AgentSkill

- quality score is shaped by discovery, implementation, structure, and expertise
- security score, audit freshness, and issue severity influence trust immediately
- GitHub stars, platform coverage, and rating reinforce cold-start confidence
- naming and summary must survive directory browsing without extra context

### GitHub

- README trust, install clarity, examples, and visible source proof matter
- publish bundles should not advertise files or flows that are not shipped
- changelog, provenance, and example outputs help convert skeptical users

## Hard publish conventions

When optimizing a published repo skill, enforce these before polishing copy:

- use minimal frontmatter with `name`, `description`, and canonical `metadata.aisa`
- prefer `metadata.aisa.emoji`, `metadata.aisa.requires`, `metadata.aisa.primaryEnv`, and `metadata.aisa.compatibility`
- every command example should use `{baseDir}` when a runtime placeholder is needed
- keep `SKILL.md` aligned to the shipped runtime only
- if compare/test/sync/dev scripts are not in the publish artifact, do not mention them
- if EN and ZH variants exist, keep the same runtime surface area, command layout, and section structure
- if AgentSkill or marketplace listings reference GitHub, make sure the README and shipped files actually support that claim

## Recommended body structure

Choose only the modules that help the shipped runtime:

- `When to use`
  - always include
- `When NOT to use`
  - include when sibling skills exist
- `Quick Reference`
  - include for CLI-first skills
- `Capabilities`
  - include for multi-function skills
- `High-Intent Workflows`
  - include when there are multiple top jobs-to-be-done
- `Inputs and Outputs`
  - include when the interface is structured
- `Example Requests`
  - include when discovery matters
- `Setup`
  - include only what the published runtime actually needs

## Description rules

Preferred English pattern:

```text
[Core task]. Use when: [trigger]. Supports [important outcomes].
```

Preferred Chinese pattern:

```text
[核心任务]。触发条件：当用户需要[场景]时使用。支持[关键结果]。
```

Description quality checklist:

- 50-200 characters when possible
- no angle brackets `<>`
- exact task keywords present
- no marketing fluff
- no undocumented dependencies

## Breakout packaging heuristics

Before publishing, sanity-check whether the copy creates a true breakout surface:

1. Could a user search for this title directly?
2. Does the first line say what is done, for whom, and when?
3. Is the skill narrow enough to be memorable?
4. Is there proof, trust, or concrete result language?
5. Does this skill have a clear relationship to the rest of the author's portfolio?

If the answer is no, tighten the JTBD before polishing more prose.

## Validation checklist

Before publishing, verify:

1. Frontmatter is valid and machine-readable.
2. `name` is short, keyword-rich, and platform-appropriate.
3. `description` contains `Use when:` or `触发条件：`.
4. The skill body matches the shipped runtime and shipped files.
5. Required env vars and binaries are declared in `metadata.aisa`.
6. EN and ZH variants have parallel runtime scope.
7. The optimization changed wording and packaging clarity, not core runtime semantics.
8. Sibling skills do not compete for the same exact positioning.
9. Platform-specific proof signals are visible where needed: repo trust, audit posture, category/tag fit, or bilingual search fit.

## Lightweight publish-risk reminders

While this skill is not a full auditor, always avoid obvious publish regressions:

- do not advertise password, cookie, or browser-credential flows
- do not describe non-runtime helper scripts as part of normal usage
- do not default to home-directory persistence in public bundles
- do not claim functionality that only exists in source/dev tooling
- do not let AgentSkill/marketplace copy promise a rating, audit, or platform coverage story the bundle cannot support

## Example requests

- `Optimize this skill for ClawHub search and upload`
- `Turn this mother skill into source mode plus Hermes publish mode`
- `Rewrite the SKILL.md so Claude and AgentSkill versions each read cleanly`
- `Make these EN/ZH variants consistent and more high-intent without changing runtime behavior`
