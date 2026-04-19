#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


API_FAMILY_HINTS = {
    "weather": "Weather API",
    "forecast": "Weather API",
    "stock": "Financial API",
    "finance": "Financial API",
    "market": "Financial API",
    "search": "Search API",
    "docs": "Search API",
    "browser": "Browser Automation Runtime",
    "playwright": "Browser Automation Runtime",
    "image": "Media Generation API",
    "video": "Media Generation API",
    "translate": "Translation API",
    "slack": "Productivity API",
    "notion": "Productivity API",
    "github": "Social API",
    "youtube": "Social API",
}

STOPWORDS = {
    "for",
    "the",
    "a",
    "an",
    "to",
    "of",
    "and",
    "with",
    "on",
    "in",
}


def compact_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def infer_api_family(idea: str) -> str:
    lower = idea.lower()
    for token, family in API_FAMILY_HINTS.items():
        if token in lower:
            return family
    return "Unknown"


def make_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:64]


def title_candidates(idea: str) -> list[str]:
    base = compact_spaces(idea)
    tokens = [token.lower() for token in re.findall(r"[A-Za-z0-9]+", base)]
    filtered = [token for token in tokens if token not in STOPWORDS]
    usable = filtered[:3] or tokens[:3] or ["skill"]
    words = [token.upper() if token in {"api", "ai"} else token.capitalize() for token in usable]
    merged = " ".join(words) or "Skill"
    return [
        merged,
        f"{merged} Pro",
        f"{merged} Agent",
        f"{merged} Assistant",
    ]


def build_spec(idea: str, stage: str) -> dict[str, Any]:
    family = infer_api_family(idea)
    titles = title_candidates(idea)
    primary = titles[0]
    job = f"Help the user complete this narrow job: {compact_spaces(idea)}."
    return {
        "inputIdea": idea,
        "apiFamily": family,
        "stage": stage,
        "jobToBeDone": job,
        "primaryTitle": primary,
        "alternativeTitles": titles[1:],
        "slug": make_slug(primary),
        "descriptionCandidate": f"{primary} for {compact_spaces(idea)}. Use when: the user needs this exact result quickly. Supports a fast first-run success path and obvious next actions.",
        "viralUpgradePath": {
            "ordinaryVersion": "Broad positioning, generic title, unclear first-run value.",
            "improvedVersion": "Narrow use case, clear promise, more direct title.",
            "viralVersion": "Exact intent title, instant first success, stronger proof of value, visible monetization hook.",
        },
        "breakoutScorecard": {
            "demandFit": "High" if family != "Unknown" else "Medium",
            "timeToValue": "High",
            "discoverability": "High",
            "portfolioFit": "High" if family != "Unknown" else "Medium",
            "monetizationFit": "High" if family in {"Weather API", "Financial API", "Search API", "Productivity API", "Media Generation API", "Social API"} else "Medium",
        },
        "contentCharacteristics": [
            "Lead with the job, not the implementation.",
            "Make the first prompt succeed without heavy setup.",
            "Keep input requirements low and output certainty high.",
            "Use search-intent vocabulary in title and description.",
            "Design one obvious upgrade reason from the first version.",
        ],
        "structure": {
            "nameRule": "Use exact user-intent terms, not internal architecture language.",
            "descriptionRule": "State what it does, when to use it, and what it supports.",
            "exampleRule": "The first example must succeed with one prompt.",
            "outputRule": "Return concrete, decision-ready output rather than vague capability prose.",
        },
        "monetizationHooks": [
            "Free: small result set or capped usage.",
            "Pro: real-time freshness or better quality output.",
            "Pro: batch mode or automation depth.",
            "Team: governance, logs, and shared credits.",
        ],
        "launchChecklist": [
            "Validate one-sentence job-to-be-done.",
            "Test first-run success path.",
            "Ship with 3 example prompts.",
            "Track install velocity and repeat usage.",
            "Design 5 adjacent variants from the same capability core.",
        ],
        "operationalSteps": [
            "Day 1: validate the narrow user problem and choose one API/runtime.",
            "Day 2: draft title, description, and first-run prompt flow.",
            "Day 3: implement the minimal successful path only.",
            "Day 4: package for ClawHub with examples and clear 'when to use'.",
            "Day 5-7: release, observe usage, and prepare adjacent variants.",
        ],
        "portfolioVariants": [
            f"{primary} for operators",
            f"{primary} for researchers",
            f"{primary} for analysts",
            f"{primary} monitor",
            f"{primary} automation",
        ],
        "examplePrompts": [
            f"Use {primary} to handle: {compact_spaces(idea)}",
            f"Give me the fastest successful path for: {compact_spaces(idea)}",
            f"Help me turn this into an automation-ready workflow: {compact_spaces(idea)}",
        ],
    }


def render_skill_md(spec: dict[str, Any]) -> str:
    title = spec["primaryTitle"]
    slug = spec["slug"]
    description = spec["descriptionCandidate"]
    prompts = "\n".join(f"- `{prompt}`" for prompt in spec["examplePrompts"])
    checklist = "\n".join(f"- {item}" for item in spec["launchChecklist"])
    steps = "\n".join(f"- {item}" for item in spec["operationalSteps"])
    hooks = "\n".join(f"- {item}" for item in spec["monetizationHooks"])
    variants = "\n".join(f"- {item}" for item in spec["portfolioVariants"])
    characteristics = "\n".join(f"- {item}" for item in spec["contentCharacteristics"])
    alt_titles = "\n".join(f"- {item}" for item in spec["alternativeTitles"])
    return f"""---
name: {slug}
version: "0.1.0"
description: "{description}"
argument-hint: "{spec['inputIdea']}"
allowed-tools: Bash, Read, Write
author: AIsa-team
license: MIT
user-invocable: true
metadata:
  openclaw:
    emoji: "🚀"
    requires:
      bins:
        - python3
---

# {title}

{description}

## When to use

- Use when the user explicitly needs this narrow job done: {spec['inputIdea']}.
- Use when fast first-run success matters more than broad feature coverage.
- Use when the task is a good fit for the `{spec['apiFamily']}` capability family.

## When NOT to use

- Do not use when the request is broad, exploratory, or missing a clear outcome.
- Do not use when the workflow depends on a different API family than `{spec['apiFamily']}`.
- Do not use when the user needs a large multi-step system before validating the first result.

## Job To Be Done

- {spec['jobToBeDone']}

## Breakout Characteristics

{characteristics}

## Title Options

- Primary: `{title}`
{alt_titles}

## Example Prompts

{prompts}

## Launch Checklist

{checklist}

## Monetization Hooks

{hooks}

## 0-to-1 Execution Steps

{steps}

## Portfolio Variants

{variants}
"""


def scaffold_skill(output_dir: Path, spec: dict[str, Any]) -> Path:
    skill_dir = output_dir / spec["slug"]
    scripts_dir = skill_dir / "scripts"
    refs_dir = skill_dir / "references"
    scripts_dir.mkdir(parents=True, exist_ok=True)
    refs_dir.mkdir(parents=True, exist_ok=True)

    (skill_dir / "SKILL.md").write_text(render_skill_md(spec), encoding="utf-8")
    (skill_dir / "spec.json").write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (refs_dir / "launch-plan.md").write_text(
        "# Launch Plan\n\n"
        + "\n".join(f"- {item}" for item in spec["operationalSteps"])
        + "\n",
        encoding="utf-8",
    )
    (scripts_dir / "generate-spec.sh").write_text(
        "#!/usr/bin/env bash\nset -euo pipefail\n\n"
        + 'python3 "${SKILL_ROOT}/scripts/hit_factory.py" "$@" --format=json\n',
        encoding="utf-8",
    )
    return skill_dir


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate breakout-ready ClawHub skill specs from a single idea.")
    parser.add_argument("idea", help="Narrow job or capability idea")
    parser.add_argument("--stage", default="0-to-1", choices=["0-to-1", "upgrade", "portfolio"])
    parser.add_argument("--format", default="text", choices=["text", "json"])
    parser.add_argument("--emit-skill-md", action="store_true", help="Print a full SKILL.md draft instead of the summary view.")
    parser.add_argument("--output-dir", help="Scaffold a full skill directory into this directory.")
    args = parser.parse_args()

    spec = build_spec(args.idea, args.stage)
    if args.output_dir:
        out = scaffold_skill(Path(args.output_dir), spec)
        print(str(out))
        return
    if args.emit_skill_md:
        print(render_skill_md(spec))
        return
    if args.format == "json":
        print(json.dumps(spec, ensure_ascii=False, indent=2))
        return

    print(f"Primary title: {spec['primaryTitle']}")
    print(f"Slug: {spec['slug']}")
    print(f"API family: {spec['apiFamily']}")
    print(f"Job-to-be-done: {spec['jobToBeDone']}")
    print(f"Description: {spec['descriptionCandidate']}")
    print("Alternative titles:")
    for item in spec["alternativeTitles"]:
        print(f"- {item}")
    print("Content characteristics:")
    for item in spec["contentCharacteristics"]:
        print(f"- {item}")
    print("Launch checklist:")
    for item in spec["launchChecklist"]:
        print(f"- {item}")
    print("Operational steps:")
    for item in spec["operationalSteps"]:
        print(f"- {item}")
    print("Portfolio variants:")
    for item in spec["portfolioVariants"]:
        print(f"- {item}")


if __name__ == "__main__":
    main()
