#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


BASE_URL = "https://clawhub.ai"
CATALOG_PATH = Path("public/data/catalog.json")
OUTPUT_PATH = Path("public/data/clawhub-growth-report.json")
TOP_N = 100
MIN_HIGH_DOWNLOAD = 5_000


@dataclass
class SkillRecord:
    rank: int
    name: str
    url: str
    author: str
    slug: str
    downloads: int
    rating: int | None
    description: str
    version: str | None
    badges: list[str]
    category: str
    inputComplexity: str
    outputValue: str
    apiDependency: str
    monetizationPotential: str
    likelyApis: list[str]
    titleKeywords: list[str]
    repeatablePatternFlags: list[str]


def compact_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse_abbrev_number(value: str) -> int:
    text = compact_spaces(value).lower().replace(",", "")
    if not text:
        return 0
    multiplier = 1
    if text.endswith("k"):
        multiplier = 1_000
        text = text[:-1]
    elif text.endswith("m"):
        multiplier = 1_000_000
        text = text[:-1]
    try:
        return int(float(text) * multiplier)
    except ValueError:
        return 0


def tokenize(value: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", value.lower())


def title_keywords(name: str) -> list[str]:
    keywords = []
    lower = name.lower()
    for keyword in [
        "ai",
        "free",
        "fast",
        "search",
        "automation",
        "browser",
        "agent",
        "weather",
        "stock",
        "news",
        "youtube",
        "twitter",
        "github",
        "docs",
        "video",
        "image",
        "pdf",
        "memory",
    ]:
        if keyword in lower:
            keywords.append(keyword)
    return keywords


def classify_category(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["weather", "stock", "finance", "market", "news", "search", "docs", "documentation", "youtube", "github", "notion", "obsidian"]):
        return "Information"
    if any(term in text for term in ["image", "video", "translate", "summary", "whisper", "humanize", "generate", "generator"]):
        return "AI Generation"
    if any(term in text for term in ["pdf", "browser", "desktop", "playwright", "cli", "ffmpeg", "api", "tool", "workspace"]):
        return "Tools"
    return "Automation"


def classify_input_complexity(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["one key", "one api key", "single", "simple", "no api key required", "current weather"]):
        return "Low"
    if any(term in text for term in ["workflow", "automation", "portfolio", "knowledge graph", "memory", "browser interactions", "advanced"]):
        return "High"
    return "Medium"


def classify_output_value(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["automation", "control", "post", "portfolio", "analysis", "workspace", "knowledge graph", "browser", "github", "slack"]):
        return "High"
    if any(term in text for term in ["weather", "search", "summary", "transcript", "video", "image", "translate"]):
        return "Medium"
    return "Low"


def classify_api_dependency(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["api", "search", "weather", "stock", "finance", "news", "youtube", "twitter", "github", "notion", "slack", "browser", "google workspace", "translation", "web search"]):
        return "Yes"
    if any(term in text for term in ["cli", "local", "no api key required", "ffmpeg", "whisper cli"]):
        return "No"
    return "Unknown"


def infer_likely_apis(name: str, description: str) -> list[str]:
    text = f"{name} {description}".lower()
    mapping = [
        ("Weather API", ["weather", "forecast"]),
        ("Financial API", ["stock", "finance", "portfolio", "market", "crypto", "polymarket"]),
        ("Search API", ["search", "tavily", "brave", "docs", "documentation"]),
        ("Translation API", ["translate", "translation"]),
        ("Social API", ["twitter", "x/", "youtube", "slack", "github", "notion"]),
        ("Media Generation API", ["image", "video", "generate", "generator", "whisper"]),
        ("Browser Automation Runtime", ["browser", "playwright", "desktop", "web testing"]),
        ("Productivity API", ["gmail", "calendar", "drive", "contacts", "sheets", "docs", "workspace", "email"]),
    ]
    results = [label for label, keywords in mapping if any(keyword in text for keyword in keywords)]
    return results or ["Unknown"]


def classify_monetization_potential(name: str, description: str, likely_apis: list[str]) -> str:
    text = f"{name} {description}".lower()
    if any(api in likely_apis for api in ["Weather API", "Financial API", "Search API", "Social API", "Media Generation API", "Productivity API"]):
        return "High"
    if any(term in text for term in ["browser", "pdf", "automation", "workspace", "knowledge graph"]):
        return "Medium"
    return "Low"


def repeatable_flags(name: str, description: str, category: str, likely_apis: list[str]) -> list[str]:
    flags: list[str] = []
    text = f"{name} {description}".lower()
    if any(keyword in text for keyword in ["use when", "supports", "automate", "search", "control"]):
        flags.append("clear-job-to-be-done")
    if any(keyword in text for keyword in ["api", "cli", "tool", "workspace", "browser"]):
        flags.append("runtime-or-api-wrapper")
    if category in {"Information", "Tools"}:
        flags.append("immediate-utility")
    if len(likely_apis) == 1 and likely_apis[0] != "Unknown":
        flags.append("single-api-factory-fit")
    if any(keyword in text for keyword in ["no api key required", "one api key", "fast"]):
        flags.append("low-friction-adoption")
    return flags


def jaccard_similarity(left: str, right: str) -> float:
    left_tokens = set(tokenize(left))
    right_tokens = set(tokenize(right))
    if not left_tokens or not right_tokens:
        return 0.0
    return len(left_tokens & right_tokens) / len(left_tokens | right_tokens)


def author_strategy_label(categories: Counter[str], api_counter: Counter[str], repetition_score: float) -> str:
    primary_category = categories.most_common(1)[0][0] if categories else "Mixed"
    primary_api = api_counter.most_common(1)[0][0] if api_counter else "Unknown"
    if repetition_score >= 0.6:
        return f"Niche factory around {primary_api}"
    if len(categories) >= 3:
        return f"Multi-vertical portfolio led by {primary_category}"
    return f"Focused utility builder in {primary_category}"


def load_catalog_skills(limit: int) -> list[SkillRecord]:
    payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    raw_skills = [item for item in payload.get("items", []) if item.get("type") == "skill"]
    raw_skills.sort(key=lambda item: (-(item.get("downloads") or 0), item.get("name", "").lower()))
    records: list[SkillRecord] = []

    for rank, item in enumerate(raw_skills[:limit], start=1):
        url = item.get("clawhubUrl") or ""
        author = item.get("owner") or "unknown"
        slug = url.rstrip("/").split("/")[-1] if url else re.sub(r"[^a-z0-9]+", "-", item.get("name", "").lower()).strip("-")
        name = compact_spaces(item.get("name") or slug.replace("-", " ").title())
        description = compact_spaces(item.get("description") or "")
        likely_apis = infer_likely_apis(name, description)

        records.append(
            SkillRecord(
                rank=rank,
                name=name,
                url=url,
                author=author,
                slug=slug,
                downloads=int(item.get("downloads") or 0),
                rating=int(item["stars"]) if isinstance(item.get("stars"), int) else (int(item["stars"]) if str(item.get("stars", "")).isdigit() else None),
                description=description,
                version=item.get("version"),
                badges=[],
                category=classify_category(name, description),
                inputComplexity=classify_input_complexity(name, description),
                outputValue=classify_output_value(name, description),
                apiDependency=classify_api_dependency(name, description),
                monetizationPotential=classify_monetization_potential(name, description, likely_apis),
                likelyApis=likely_apis,
                titleKeywords=title_keywords(name),
                repeatablePatternFlags=repeatable_flags(name, description, classify_category(name, description), likely_apis),
            )
        )

    return records


def build_author_records(skills: list[SkillRecord]) -> list[dict[str, Any]]:
    by_author: dict[str, list[SkillRecord]] = defaultdict(list)
    for skill in skills:
        by_author[skill.author].append(skill)

    records: list[dict[str, Any]] = []
    for author, author_skills in by_author.items():
        sorted_skills = sorted(author_skills, key=lambda skill: (-skill.downloads, skill.name.lower()))
        category_counter = Counter(skill.category for skill in sorted_skills)
        api_counter = Counter(api for skill in sorted_skills for api in skill.likelyApis)
        similarities: list[float] = []
        template_pairs = 0
        for index, left in enumerate(sorted_skills):
            for right in sorted_skills[index + 1:]:
                score = max(
                    jaccard_similarity(left.name, right.name),
                    jaccard_similarity(left.description, right.description),
                )
                similarities.append(score)
                if score >= 0.42 or set(left.likelyApis) == set(right.likelyApis):
                    template_pairs += 1
        repetition_score = round(sum(similarities) / len(similarities), 2) if similarities else 0.0
        api_reuse_ratio = api_counter.most_common(1)[0][1] / max(len(sorted_skills), 1) if api_counter else 0
        template_ratio = template_pairs / max(math.comb(len(sorted_skills), 2), 1) if len(sorted_skills) > 1 else 0

        records.append(
            {
                "author": author,
                "profileUrl": f"{BASE_URL}/u/{author}",
                "sampledTotalSkills": len(sorted_skills),
                "sampledSkillUrls": [skill.url for skill in sorted_skills],
                "skills": [
                    {
                        "name": skill.name,
                        "url": skill.url,
                        "downloads": skill.downloads,
                        "category": skill.category,
                        "likelyApis": skill.likelyApis,
                    }
                    for skill in sorted_skills
                ],
                "numberOf5kPlusSkills": sum(skill.downloads >= MIN_HIGH_DOWNLOAD for skill in sorted_skills),
                "categoryDistribution": dict(category_counter),
                "repetitionScore": repetition_score,
                "apiReuseLikelihood": "High" if api_reuse_ratio >= 0.6 else "Medium" if api_reuse_ratio >= 0.35 else "Low",
                "templateUsage": "High" if template_ratio >= 0.45 else "Medium" if template_ratio >= 0.2 else "Low",
                "strategyLabel": author_strategy_label(category_counter, api_counter, repetition_score),
                "totalDownloadsInSample": sum(skill.downloads for skill in sorted_skills),
                "topSkillNames": [skill.name for skill in sorted_skills[:3]],
                "authorPageStatus": "sample-derived",
            }
        )

    records.sort(
        key=lambda item: (
            -item["numberOf5kPlusSkills"],
            -item["totalDownloadsInSample"],
            -item["sampledTotalSkills"],
            item["author"],
        )
    )
    return records


def percentage(part: int, whole: int) -> float:
    if whole == 0:
        return 0.0
    return round(part / whole * 100, 1)


def build_documents(skills: list[SkillRecord], authors: list[dict[str, Any]]) -> dict[str, Any]:
    top20 = skills[:20]
    top10_authors = authors[:10]

    category_counts = Counter(skill.category for skill in skills)
    keyword_counts = Counter(keyword for skill in top20 for keyword in skill.titleKeywords)
    api_counts = Counter(api for skill in skills for api in skill.likelyApis)
    low_medium_input = sum(skill.inputComplexity in {"Low", "Medium"} for skill in top20)
    high_value = sum(skill.outputValue == "High" for skill in top20)
    high_monetization = sum(skill.monetizationPotential == "High" for skill in top20)

    replaceable_apis = [
        {
            "apiFamily": api,
            "skillCount": count,
            "whyItMatters": (
                "Strong candidate for AIsa packaging because multiple top skills appear to wrap the same external capability."
                if api != "Unknown"
                else "Unclear dependency, but still useful as a template baseline."
            ),
        }
        for api, count in api_counts.most_common(8)
    ]

    free_paid_by_category = [
        {
            "category": category,
            "freeTier": free_tier,
            "paidTier": paid_tier,
        }
        for category, free_tier, paid_tier in [
            ("Information", "Basic lookup, small result sets, cached responses.", "Fresh data, richer filters, alerts, historical depth, batch enrichment."),
            ("AI Generation", "Low-res output or short text transforms.", "Premium models, higher throughput, branded presets, multi-step workflows."),
            ("Tools", "Single-file or single-task utility access.", "Automation bundles, audit logs, team controls, higher concurrency."),
            ("Automation", "Simple triggers and one-shot actions.", "Scheduled runs, multi-step orchestration, webhooks, analytics, retries."),
        ]
    ]

    rebuild_candidates = [
        {
            "skill": skill.name,
            "author": skill.author,
            "category": skill.category,
            "rationale": f"High visibility in top downloads and a clean fit for {', '.join(skill.likelyApis[:2])}.",
            "aisaAngle": (
                "Sell better freshness, rate limits, and reusable API credits."
                if skill.apiDependency == "Yes"
                else "Bundle as a low-friction template that upgrades into paid orchestration."
            ),
        }
        for skill in sorted(
            [skill for skill in skills if skill.monetizationPotential in {"High", "Medium"}],
            key=lambda item: (-item.downloads, item.name.lower()),
        )[:10]
    ]

    return {
        "document1": {
            "title": "Top Skills Analysis",
            "categoryDistribution": [
                {
                    "category": category,
                    "count": count,
                    "share": percentage(count, len(skills)),
                }
                for category, count in category_counts.most_common()
            ],
            "top20Skills": [asdict(skill) for skill in top20],
            "keySuccessFactors": [
                f"{category_counts.most_common(1)[0][0]} is the leading category in the sampled top skills, showing that immediate utility beats novelty.",
                f"{percentage(low_medium_input, len(top20))}% of the top 20 skills keep input complexity low or medium, which reduces decision friction.",
                f"{percentage(high_value, len(top20))}% of the top 20 promise high-value outputs such as control, automation, or operational leverage.",
                f"{percentage(high_monetization, len(top20))}% of the top 20 are strong API monetization candidates, especially in {', '.join(api for api, _ in api_counts.most_common(3))}.",
                f"Most repeated title hooks in the top set: {', '.join(keyword for keyword, _ in keyword_counts.most_common(6)) or 'utility-first naming'}.",
            ],
        },
        "document2": {
            "title": "Top Authors Analysis",
            "top10Authors": top10_authors,
            "authorPatterns": [
                "Winning authors usually compound around one reusable capability, then branch into adjacent use cases instead of starting from scratch each time.",
                "High-performing portfolios often mix one broad traffic driver with several narrower utility wrappers that reuse the same trust and install base.",
                "Authors with repeated naming patterns and shared API families look the most like scalable skill producers rather than one-off creators.",
            ],
        },
        "document3": {
            "title": "Skill Factory Playbook",
            "productionSystem": [
                "Choose one high-demand API or runtime and create a small family of skills around search, read, generate, monitor, and automate jobs.",
                "Use titles that make the value legible in under 5 words, then let the description clarify exact jobs-to-be-done with 'Use when' phrasing.",
                "Keep inputs narrow, outputs concrete, and time-to-first-value short enough that users can validate the skill in one prompt.",
                "Ship variations from a shared template: same core wrapper, different vertical framing, example prompts, and monetization hooks.",
                "Prioritize discoverability with plain-English nouns, recognizable brand names, and keywords that match user intent rather than internal implementation terms.",
            ],
            "templates": [
                {"name": "Search Wrapper", "bestFor": "news, docs, web, YouTube, finance", "structure": "single query -> ranked results -> optional deep mode"},
                {"name": "Control Panel", "bestFor": "Slack, GitHub, Notion, browser, desktop", "structure": "authenticate -> inspect -> act -> confirm"},
                {"name": "Generator", "bestFor": "images, videos, translation, summaries", "structure": "minimal prompt -> preset options -> premium quality upgrade"},
                {"name": "Monitor + Alert", "bestFor": "weather, markets, social mentions", "structure": "watch target -> threshold/trigger -> notification or follow-up action"},
            ],
            "namingPatterns": [
                "Brand + job: 'Tavily Search', 'Brave Search', 'Github'.",
                "Outcome + modality: 'News Summary', 'Browser Automation'.",
                "Immediate utility noun: 'Weather', 'Slack', 'Notion'.",
            ],
        },
        "document4": {
            "title": "AIsa Monetization Strategy",
            "replaceableApis": replaceable_apis,
            "freeVsPaidByCategory": free_paid_by_category,
            "top10Rebuilds": rebuild_candidates,
            "skillFactorySystemDesign": [
                "Layer 1: shared auth, billing, telemetry, and retry middleware for every AIsa-backed skill.",
                "Layer 2: category-specific adapters such as weather, finance, search, social, and generation endpoints.",
                "Layer 3: reusable prompt-friendly skill templates that only swap branding, examples, and endpoint config.",
                "Layer 4: analytics loop that tracks installs, retention, conversion triggers, and high-performing naming patterns.",
            ],
            "apiMonetizationFunnel": [
                "Free discovery skills drive adoption with limited requests, cached data, or lower-quality outputs.",
                "Pro plans unlock freshness, larger result sets, premium models, scheduled jobs, and higher rate limits.",
                "Team plans add audit logs, shared credits, workspace governance, and white-label templates.",
            ],
            "roadmap": [
                "Start with search, weather, and finance because they are common, legible, and easy to turn into usage-based APIs.",
                "Add social and productivity connectors next, since top skills show strong demand for actionable workflows, not just read-only data.",
                "Use the best-performing wrappers as templates for a semi-automated skill factory that can launch new verticals quickly.",
            ],
        },
    }


async def main() -> None:
    skills = load_catalog_skills(TOP_N)
    authors = build_author_records(skills)
    documents = build_documents(skills, authors)

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": {
            "skillsListUrl": f"{BASE_URL}/skills?sort=downloads",
            "sampleType": "local catalog snapshot sorted by downloads",
            "notes": [
                "Data is generated from the repository snapshot in public/data/catalog.json and sorted by downloads.",
                "Author-level metrics are derived from the sampled catalog set, not from live public profile inventories.",
                f"The report treats {MIN_HIGH_DOWNLOAD}+ downloads as the high-performance threshold.",
            ],
        },
        "summary": {
            "sampledSkills": len(skills),
            "sampledAuthors": len(authors),
            "highDownloadSkills": sum(skill.downloads >= MIN_HIGH_DOWNLOAD for skill in skills),
            "topSkillDownloads": skills[0].downloads if skills else 0,
        },
        "skills": [asdict(skill) for skill in skills],
        "authors": authors,
        "documents": documents,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH} with {len(skills)} skills and {len(authors)} authors.")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
