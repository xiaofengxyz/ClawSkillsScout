---
name: clawhub-hit-factory
description: "Design viral-ready ClawHub skills from repeatable systems. Use when: you want to go from 0 to 1 on a new skill, turn an ordinary skill into a breakout candidate, or build a multi-variant portfolio around one API family. Supports title design, positioning, packaging guardrails, monetization hooks, and launch sequencing."
metadata:
  aisa:
    emoji: "🏭"
    requires:
      bins:
        - python3
        - bash
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# clawhub-hit-factory

Turn the ClawHub 10K+ systems analysis into an execution-ready skill design workflow.

## When to use

- Use when you want to create a new ClawHub skill from scratch with a higher chance of breakout adoption.
- Use when you already have a working skill but need to sharpen title, description, structure, and launch framing.
- Use when you want to build a portfolio of related skills from one API/runtime instead of shipping a single one-off skill.

## When NOT to use

- Do not use when the task is only to implement runtime code without product or packaging decisions.
- Do not use when you need plugin manifests or ClawHub plugin packaging.
- Do not use when the goal is purely academic analysis with no launch or reuse intent.

## Operating model

1. Clarify the API family or core capability.
2. Define one narrow job-to-be-done with visible first-run value.
3. Generate title, description, positioning, and monetization hooks.
4. Produce a launch-ready skill specification.
5. Expand into 5-10 adjacent variants only after the first skill spec is coherent.

## Quick Reference

```bash
python3 {baseDir}/scripts/hit_factory.py "search api for developer workflows"
python3 {baseDir}/scripts/hit_factory.py "weather assistant for travelers" --format=json
python3 {baseDir}/scripts/hit_factory.py "browser automation for support agents" --stage=portfolio
```

## Workflow

- Read [references/playbook-zh.md](/mnt/d/workplace/skillget/sucess/clawhub-hit-factory/references/playbook-zh.md) when the user wants Chinese strategy guidance or local team execution wording.
- Read [references/playbook-en.md](/mnt/d/workplace/skillget/sucess/clawhub-hit-factory/references/playbook-en.md) when you need the English operating model or bilingual packaging.
- Read [references/skill-packaging-rules.md](/mnt/d/workplace/skillget/sucess/clawhub-hit-factory/references/skill-packaging-rules.md) before shipping or updating a skill bundle so the output follows the repo's harness rules.
- Run `scripts/hit_factory.py` whenever you want a structured spec instead of freeform advice.
- If the output is intended for ClawHub publication, apply the naming and description patterns from the generated spec before writing `SKILL.md`.

## Outputs

- Breakout scorecard
- Job-to-be-done statement
- Title and subtitle candidates
- SKILL.md description candidate
- Capability structure
- Monetization hooks
- 0-to-1 launch checklist
- Portfolio expansion plan
