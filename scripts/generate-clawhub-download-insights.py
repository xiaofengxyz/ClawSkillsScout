#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import time
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests


BASE_URL = "https://clawhub.ai"
CONVEX_QUERY_URL = "https://wry-manatee-359.convex.cloud/api/query"
OUTPUT_PATH = Path("public/data/clawhub-download-insights.json")
PAGE_SIZE = 25
TOP_N = 60
HIGH_DOWNLOAD_THRESHOLD = 10_000
MID_DOWNLOAD_THRESHOLD = 5_000

TIMEOUT = 8
SESSION = requests.Session()


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


def compact_spaces(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def tokenize(value: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", value.lower())


def parse_int(value: Any) -> int | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    text = compact_spaces(str(value)).lower().replace(",", "")
    if not text:
        return None
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
        return None


def first_non_empty(*values: Any) -> Any:
    for value in values:
        if value is None:
            continue
        if isinstance(value, str) and not compact_spaces(value):
            continue
        return value
    return None


def jaccard_similarity(left: str, right: str) -> float:
    left_tokens = set(tokenize(left))
    right_tokens = set(tokenize(right))
    if not left_tokens or not right_tokens:
        return 0.0
    return len(left_tokens & right_tokens) / len(left_tokens | right_tokens)


def title_keywords(name: str) -> list[str]:
    lower = name.lower()
    keywords: list[str] = []
    for keyword in [
        "ai",
        "free",
        "fast",
        "search",
        "browser",
        "weather",
        "stock",
        "news",
        "youtube",
        "twitter",
        "slack",
        "github",
        "docs",
        "pdf",
        "translate",
        "summary",
        "automation",
        "agent",
    ]:
        if keyword in lower:
            keywords.append(keyword)
    return keywords


def classify_category(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["weather", "stock", "finance", "market", "news", "search", "docs", "github", "youtube", "x ", "twitter", "reddit"]):
        return "Information"
    if any(term in text for term in ["image", "video", "translate", "summary", "generate", "generator", "transcript", "rewrite"]):
        return "AI Generation"
    if any(term in text for term in ["pdf", "browser", "desktop", "playwright", "tool", "workspace", "notion", "slack", "gmail", "calendar"]):
        return "Tools"
    return "Automation"


def classify_input_complexity(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["one input", "single", "simple", "lookup", "summarize", "translate", "current weather", "quick"]):
        return "Low"
    if any(term in text for term in ["workflow", "automation", "browser", "portfolio", "knowledge graph", "memory", "workspace", "multi-step"]):
        return "High"
    return "Medium"


def classify_output_value(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["automation", "control", "analysis", "portfolio", "workspace", "browser", "monitor", "alert", "post", "manage"]):
        return "High"
    if any(term in text for term in ["weather", "search", "summary", "transcript", "video", "image", "translate", "news"]):
        return "Medium"
    return "Low"


def classify_api_dependency(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["api", "search", "weather", "stock", "finance", "news", "youtube", "twitter", "github", "notion", "slack", "gmail", "calendar", "translation"]):
        return "Yes"
    if any(term in text for term in ["local", "cli", "ffmpeg", "whisper cli", "filesystem"]):
        return "No"
    return "Unknown"


def infer_likely_apis(name: str, description: str) -> list[str]:
    text = f"{name} {description}".lower()
    mapping = [
        ("Weather API", ["weather", "forecast"]),
        ("Financial API", ["stock", "finance", "market", "portfolio", "crypto", "trading", "polymarket"]),
        ("Search API", ["search", "news", "docs", "documentation", "web", "reddit"]),
        ("Translation API", ["translate", "translation"]),
        ("Social API", ["twitter", "x ", "youtube", "slack", "github", "reddit", "linkedin"]),
        ("Productivity API", ["gmail", "calendar", "drive", "docs", "sheets", "workspace", "email", "notion"]),
        ("Browser Automation Runtime", ["browser", "playwright", "desktop"]),
        ("Media Generation API", ["image", "video", "transcript", "whisper", "generate", "generator"]),
    ]
    detected = [label for label, keywords in mapping if any(keyword in text for keyword in keywords)]
    return detected or ["Unknown"]


def classify_monetization_potential(name: str, description: str, likely_apis: list[str]) -> str:
    if any(
        api in likely_apis
        for api in [
            "Weather API",
            "Financial API",
            "Search API",
            "Translation API",
            "Social API",
            "Productivity API",
            "Media Generation API",
        ]
    ):
        return "High"
    text = f"{name} {description}".lower()
    if any(term in text for term in ["browser", "pdf", "automation", "workspace", "monitor"]):
        return "Medium"
    return "Low"


def repeatable_flags(name: str, description: str, category: str, likely_apis: list[str]) -> list[str]:
    flags: list[str] = []
    text = f"{name} {description}".lower()
    if any(term in text for term in ["search", "summarize", "monitor", "control", "analyze", "translate", "browser"]):
        flags.append("clear-job-to-be-done")
    if any(term in text for term in ["api", "browser", "workspace", "tool", "github", "slack", "weather"]):
        flags.append("runtime-or-api-wrapper")
    if category in {"Information", "Tools"}:
        flags.append("immediate-utility")
    if len(likely_apis) == 1 and likely_apis[0] != "Unknown":
        flags.append("single-api-factory-fit")
    if any(term in text for term in ["quick", "fast", "simple", "one-shot"]):
        flags.append("low-friction-adoption")
    return flags


def convex_query(path: str, args: dict[str, Any], timeout: int = TIMEOUT) -> Any:
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            response = SESSION.post(
                CONVEX_QUERY_URL,
                json={"path": path, "args": args},
                headers={"content-type": "application/json", "accept": "application/json"},
                timeout=(10, timeout),
            )
            response.raise_for_status()
            payload = response.json()
            if payload.get("status") == "success":
                return payload.get("value")
            last_error = RuntimeError(f"Convex query failed for {path}: {payload}")
        except Exception as error:
            last_error = error
        if attempt < 1:
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"Convex query failed for {path}: {last_error}")


def normalize_badges(skill: dict[str, Any], entry: dict[str, Any]) -> list[str]:
    badges = skill.get("badges") or entry.get("badges") or {}
    if isinstance(badges, dict):
        return sorted([key for key, value in badges.items() if value])
    if isinstance(badges, list):
        return [compact_spaces(str(item)) for item in badges if compact_spaces(str(item))]
    return []


def normalize_skill_entry(entry: dict[str, Any], rank: int) -> SkillRecord:
    skill = entry.get("skill") or {}
    latest_version = entry.get("latestVersion") or {}
    owner = entry.get("owner") or {}
    stats = entry.get("stats") or skill.get("stats") or latest_version.get("stats") or {}

    author = compact_spaces(
        first_non_empty(
            entry.get("ownerHandle"),
            owner.get("handle"),
            skill.get("ownerHandle"),
            skill.get("owner"),
            "unknown",
        )
    )
    slug = compact_spaces(first_non_empty(skill.get("slug"), entry.get("slug"), "unknown"))
    name = compact_spaces(
        first_non_empty(
            skill.get("displayName"),
            latest_version.get("displayName"),
            skill.get("name"),
            slug.replace("-", " ").title(),
        )
    )
    description = compact_spaces(
        first_non_empty(
            latest_version.get("summary"),
            skill.get("summary"),
            latest_version.get("description"),
            skill.get("description"),
            entry.get("summary"),
            "",
        )
    )
    downloads = parse_int(first_non_empty(stats.get("downloads"), entry.get("downloads"), skill.get("downloads"))) or 0
    rating = parse_int(first_non_empty(stats.get("stars"), entry.get("stars"), skill.get("stars")))
    version = compact_spaces(str(first_non_empty(latest_version.get("version"), skill.get("latestVersion"), ""))) or None
    likely_apis = infer_likely_apis(name, description)
    category = classify_category(name, description)

    return SkillRecord(
        rank=rank,
        name=name,
        url=f"{BASE_URL}/{author}/{slug}",
        author=author,
        slug=slug,
        downloads=downloads,
        rating=rating,
        description=description,
        version=version,
        badges=normalize_badges(skill, entry),
        category=category,
        inputComplexity=classify_input_complexity(name, description),
        outputValue=classify_output_value(name, description),
        apiDependency=classify_api_dependency(name, description),
        monetizationPotential=classify_monetization_potential(name, description, likely_apis),
        likelyApis=likely_apis,
        titleKeywords=title_keywords(name),
        repeatablePatternFlags=repeatable_flags(name, description, category, likely_apis),
    )


def fetch_top_skills(limit: int = TOP_N) -> list[SkillRecord]:
    records: list[SkillRecord] = []
    cursor: str | None = None

    while len(records) < limit:
        query_args: dict[str, Any] = {
            "numItems": min(PAGE_SIZE, limit - len(records)),
            "sort": "downloads",
            "dir": "desc",
        }
        if cursor:
            query_args["cursor"] = cursor
        value = convex_query(
            "skills:listPublicPageV4",
            query_args,
        )
        page = value.get("page") or []
        if not page:
            break
        for entry in page:
            records.append(normalize_skill_entry(entry, len(records) + 1))
            if len(records) >= limit:
                break
        cursor = value.get("nextCursor")
        if not value.get("hasMore") or not cursor:
            break

    return records


def normalize_author_skill(handle: str, item: dict[str, Any], fallback_rank: int) -> dict[str, Any]:
    skill = item.get("skill") or item
    latest_version = item.get("latestVersion") or item.get("version") or {}
    stats = item.get("stats") or skill.get("stats") or latest_version.get("stats") or {}
    slug = compact_spaces(first_non_empty(skill.get("slug"), item.get("slug"), f"unknown-{fallback_rank}"))
    name = compact_spaces(first_non_empty(skill.get("displayName"), skill.get("name"), item.get("name"), slug.replace("-", " ").title()))
    description = compact_spaces(
        first_non_empty(skill.get("summary"), item.get("summary"), latest_version.get("summary"), skill.get("description"), "")
    )
    downloads = parse_int(first_non_empty(stats.get("downloads"), item.get("downloads"), skill.get("downloads"))) or 0
    category = classify_category(name, description)
    likely_apis = infer_likely_apis(name, description)
    return {
        "name": name,
        "url": f"{BASE_URL}/{handle}/{slug}",
        "downloads": downloads,
        "category": category,
        "likelyApis": likely_apis,
        "description": description,
    }


def fetch_author_skill_list(handle: str, sample_skills: list[SkillRecord]) -> tuple[list[dict[str, Any]], str]:
    try:
        user = convex_query("users:getByHandle", {"handle": handle}, timeout=5)
        if user and user.get("_id"):
            try:
                items = convex_query("skills:list", {"ownerUserId": user["_id"], "limit": 50}, timeout=4)
                if isinstance(items, list) and items:
                    return [normalize_author_skill(handle, item, index + 1) for index, item in enumerate(items)], "profile-query"
            except Exception:
                pass
    except Exception:
        pass

    try:
        items = convex_query("search:searchSkills", {"query": handle, "limit": 100}, timeout=4)
        if isinstance(items, list):
            normalized = [
                normalize_author_skill(handle, item, index + 1)
                for index, item in enumerate(items)
                if compact_spaces(first_non_empty(item.get("ownerHandle"), (item.get("owner") or {}).get("handle"), "")) == handle
            ]
            deduped: dict[str, dict[str, Any]] = {}
            for item in normalized:
                deduped[item["url"]] = item
            if deduped:
                return list(deduped.values()), "search-fallback"
    except Exception:
        pass

    return [
        {
            "name": skill.name,
            "url": skill.url,
            "downloads": skill.downloads,
            "category": skill.category,
            "likelyApis": skill.likelyApis,
            "description": skill.description,
        }
        for skill in sorted(sample_skills, key=lambda item: (-item.downloads, item.name.lower()))
    ], "sample-derived"


def author_strategy_label(categories: Counter[str], api_counter: Counter[str], repetition_score: float) -> str:
    primary_category = categories.most_common(1)[0][0] if categories else "Mixed"
    primary_api = api_counter.most_common(1)[0][0] if api_counter else "Unknown"
    if repetition_score >= 0.58:
        return f"Niche factory around {primary_api}"
    if len(categories) >= 3:
        return f"Multi-vertical portfolio led by {primary_category}"
    return f"Focused utility builder in {primary_category}"


def build_author_records(skills: list[SkillRecord]) -> list[dict[str, Any]]:
    by_author: dict[str, list[SkillRecord]] = defaultdict(list)
    for skill in skills:
        by_author[skill.author].append(skill)

    records: list[dict[str, Any]] = []
    for author, sample_skills in by_author.items():
        sample_skills = sorted(sample_skills, key=lambda item: (-item.downloads, item.name.lower()))
        should_fetch_portfolio = (
            len(sample_skills) >= 2
            or sum(skill.downloads for skill in sample_skills) >= 20_000
            or sample_skills[0].downloads >= HIGH_DOWNLOAD_THRESHOLD
        )

        if should_fetch_portfolio:
            portfolio_skills, author_page_status = fetch_author_skill_list(author, sample_skills)
        else:
            portfolio_skills = [
                {
                    "name": skill.name,
                    "url": skill.url,
                    "downloads": skill.downloads,
                    "category": skill.category,
                    "likelyApis": skill.likelyApis,
                    "description": skill.description,
                }
                for skill in sample_skills
            ]
            author_page_status = "sample-derived"

        portfolio_skills = sorted(portfolio_skills, key=lambda item: (-item["downloads"], item["name"].lower()))

        category_counter = Counter(item["category"] for item in portfolio_skills)
        api_counter = Counter(api for item in portfolio_skills for api in item["likelyApis"])
        similarities: list[float] = []
        template_pairs = 0
        for index, left in enumerate(portfolio_skills):
            for right in portfolio_skills[index + 1 :]:
                score = max(
                    jaccard_similarity(left["name"], right["name"]),
                    jaccard_similarity(left["description"], right["description"]),
                )
                similarities.append(score)
                if score >= 0.42 or set(left["likelyApis"]) == set(right["likelyApis"]):
                    template_pairs += 1

        pair_count = math.comb(len(portfolio_skills), 2) if len(portfolio_skills) > 1 else 0
        repetition_score = round(sum(similarities) / len(similarities), 2) if similarities else 0.0
        template_ratio = template_pairs / pair_count if pair_count else 0.0
        api_reuse_ratio = api_counter.most_common(1)[0][1] / max(len(portfolio_skills), 1) if api_counter else 0.0
        number_of_10k_plus = sum(item["downloads"] >= HIGH_DOWNLOAD_THRESHOLD for item in portfolio_skills)
        number_of_5k_plus = sum(item["downloads"] >= MID_DOWNLOAD_THRESHOLD for item in portfolio_skills)

        records.append(
            {
                "author": author,
                "profileUrl": f"{BASE_URL}/u/{author}",
                "totalSkills": len(portfolio_skills),
                "sampledTopSkills": len(sample_skills),
                "sampledSkillUrls": [skill.url for skill in sample_skills],
                "skills": portfolio_skills,
                "numberOf10kPlusSkills": number_of_10k_plus,
                "numberOf5kPlusSkills": number_of_5k_plus,
                "categoryDistribution": dict(category_counter),
                "repetitionScore": repetition_score,
                "apiReuseLikelihood": "High" if api_reuse_ratio >= 0.6 else "Medium" if api_reuse_ratio >= 0.35 else "Low",
                "templateUsage": "High" if template_ratio >= 0.45 else "Medium" if template_ratio >= 0.2 else "Low",
                "strategyLabel": author_strategy_label(category_counter, api_counter, repetition_score),
                "totalDownloadsInPortfolio": sum(item["downloads"] for item in portfolio_skills),
                "totalDownloadsInTopSample": sum(skill.downloads for skill in sample_skills),
                "topSkillNames": [item["name"] for item in portfolio_skills[:3]],
                "apiFamilies": [api for api, _ in api_counter.most_common(4)],
                "authorPageStatus": author_page_status,
                "viralProductive": number_of_10k_plus >= 2 and len(portfolio_skills) >= 4,
            }
        )

    records.sort(
        key=lambda item: (
            -item["numberOf10kPlusSkills"],
            -item["totalDownloadsInTopSample"],
            -item["totalSkills"],
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

    prolific_hit_authors = [
        {
            "author": author["author"],
            "profileUrl": author["profileUrl"],
            "totalSkills": author["totalSkills"],
            "numberOf10kPlusSkills": author["numberOf10kPlusSkills"],
            "strategyLabel": author["strategyLabel"],
        }
        for author in authors
        if author["viralProductive"]
    ][:10]

    replaceable_apis = [
        {
            "apiFamily": api,
            "skillCount": count,
            "whyItMatters": (
                "Multiple top skills appear to wrap the same external capability, so AIsa can replace the dependency with a cleaner API product."
                if api != "Unknown"
                else "Good template baseline, but the dependency surface is unclear."
            ),
        }
        for api, count in api_counts.most_common(8)
    ]

    rebuild_candidates = [
        {
            "skill": skill.name,
            "author": skill.author,
            "category": skill.category,
            "rationale": f"Already validated by downloads and a clean fit for {', '.join(skill.likelyApis[:2])}.",
            "aisaAngle": (
                "Monetize freshness, rate limits, and richer filters."
                if skill.apiDependency == "Yes"
                else "Use it as a template-led entry point that upgrades into paid orchestration."
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
                {"category": category, "count": count, "share": percentage(count, len(skills))}
                for category, count in category_counts.most_common()
            ],
            "top20Skills": [asdict(skill) for skill in top20],
            "keySuccessFactors": [
                f"{category_counts.most_common(1)[0][0]} is the leading category, showing that immediate utility still wins on ClawHub.",
                f"{percentage(low_medium_input, len(top20))}% of the top 20 keep input complexity low or medium, which lowers trial friction.",
                f"{percentage(high_value, len(top20))}% of the top 20 promise high-value outputs such as action, monitoring, or operational leverage.",
                f"{percentage(high_monetization, len(top20))}% of the top 20 map cleanly to monetizable API families, especially {', '.join(api for api, _ in api_counts.most_common(3))}.",
                f"Most repeated title hooks in the top set: {', '.join(keyword for keyword, _ in keyword_counts.most_common(6)) or 'plain utility naming'}.",
            ],
        },
        "document2": {
            "title": "Top Authors Analysis",
            "top10Authors": top10_authors,
            "viralProductiveAuthors": prolific_hit_authors,
            "authorPatterns": [
                "Top authors usually compound around one reusable capability, then ship multiple angles of the same core wrapper.",
                "The strongest portfolios mix one broad traffic magnet with several narrower utility skills that share API logic or templates.",
                "Repeated naming patterns plus repeated API families are strong signals of a real skill factory rather than one-off publishing.",
            ],
        },
        "document3": {
            "title": "Skill Factory Playbook",
            "productionSystem": [
                "Pick one high-demand API family and launch a small portfolio across search, read, summarize, monitor, and act workflows.",
                "Name for immediate intent first, not architecture: users should understand the outcome in under five words.",
                "Constrain inputs, make outputs concrete, and optimize for a one-prompt time-to-value moment.",
                "Ship skill variations from a shared template: same core wrapper, different vertical framing, prompts, and examples.",
                "Treat discoverability as part of the product by reusing recognizable brands, nouns, and user jobs in titles and descriptions.",
            ],
            "templates": [
                {"name": "Search Wrapper", "bestFor": "news, docs, web, YouTube, finance", "structure": "single query -> ranked results -> optional deep mode"},
                {"name": "Control Panel", "bestFor": "Slack, GitHub, Notion, browser, productivity tools", "structure": "authenticate -> inspect -> act -> confirm"},
                {"name": "Generator", "bestFor": "images, videos, translation, summaries", "structure": "minimal prompt -> preset options -> premium quality upgrade"},
                {"name": "Monitor + Alert", "bestFor": "weather, markets, mentions, signals", "structure": "watch target -> threshold -> alert or follow-up action"},
            ],
            "namingPatterns": [
                "Brand + job: 'Brave Search', 'YouTube', 'Slack'.",
                "Outcome + modality: 'News Summary', 'Browser Automation'.",
                "Immediate utility noun: 'Weather', 'Stocks', 'Docs'.",
            ],
        },
        "document4": {
            "title": "AIsa Monetization Strategy",
            "replaceableApis": replaceable_apis,
            "freeVsPaidByCategory": [
                {
                    "category": "Information",
                    "freeTier": "Basic lookup, small result sets, cached responses.",
                    "paidTier": "Fresh data, richer filters, history, alerts, bulk enrichment.",
                },
                {
                    "category": "AI Generation",
                    "freeTier": "Short outputs or low-cost presets.",
                    "paidTier": "Premium models, higher throughput, better quality, multi-step workflows.",
                },
                {
                    "category": "Tools",
                    "freeTier": "Single-task utility access.",
                    "paidTier": "Automation bundles, audit logs, concurrency, team controls.",
                },
                {
                    "category": "Automation",
                    "freeTier": "One-shot actions and simple triggers.",
                    "paidTier": "Scheduled runs, webhooks, retries, analytics, orchestration.",
                },
            ],
            "top10Rebuilds": rebuild_candidates,
            "skillFactorySystemDesign": [
                "Layer 1: shared auth, billing, telemetry, retries, and usage metering.",
                "Layer 2: category adapters for search, weather, finance, social, productivity, and generation.",
                "Layer 3: prompt-friendly skill templates that only swap branding, schema, examples, and endpoint config.",
                "Layer 4: analytics feedback loop for installs, retention, conversion triggers, and naming experiments.",
            ],
            "apiMonetizationFunnel": [
                "Free discovery skills win installs with capped requests, cached data, or lower-quality outputs.",
                "Pro unlocks freshness, larger result sets, premium models, scheduled jobs, and higher rate limits.",
                "Team plans add audit logs, shared credits, governance, and white-label skill templates.",
            ],
            "roadmap": [
                "Start with search, weather, and finance because demand is clear and usage-based monetization is straightforward.",
                "Then add social and productivity connectors because top skills increasingly win by enabling actions, not just read-only lookup.",
                "Finally standardize the best wrappers into a repeatable skill factory pipeline that launches new verticals quickly.",
            ],
        },
    }


def build_payload(limit: int = TOP_N) -> dict[str, Any]:
    skills = fetch_top_skills(limit)
    print(f"Fetched {len(skills)} top skills", flush=True)
    authors = build_author_records(skills)
    print(f"Built {len(authors)} author records", flush=True)
    documents = build_documents(skills, authors)
    category_counts = Counter(skill.category for skill in skills)
    author_status_counts = Counter(author["authorPageStatus"] for author in authors)

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": {
            "skillsListUrl": f"{BASE_URL}/skills?sort=downloads",
            "convexQueryUrl": CONVEX_QUERY_URL,
            "sampleType": "live ClawHub downloads ranking",
            "notes": [
                "Skills are collected live from the public downloads-sorted ClawHub list via Convex queries.",
                "Author portfolios try the public author query first, then fall back to search-derived or sample-derived reconstruction when needed.",
                f"The report highlights {HIGH_DOWNLOAD_THRESHOLD:,}+ downloads as the main breakout threshold and keeps {MID_DOWNLOAD_THRESHOLD:,}+ as the broader growth band.",
            ],
        },
        "summary": {
            "sampledSkills": len(skills),
            "sampledAuthors": len(authors),
            "skills5kPlus": sum(skill.downloads >= MID_DOWNLOAD_THRESHOLD for skill in skills),
            "skills10kPlus": sum(skill.downloads >= HIGH_DOWNLOAD_THRESHOLD for skill in skills),
            "topSkillDownloads": skills[0].downloads if skills else 0,
            "prolificHitAuthors": sum(1 for author in authors if author["viralProductive"]),
            "topCategory": category_counts.most_common(1)[0][0] if category_counts else "Unknown",
        },
        "collectionDiagnostics": {
            "authorPageStatusCounts": dict(author_status_counts),
            "thresholds": {
                "midDownload": MID_DOWNLOAD_THRESHOLD,
                "highDownload": HIGH_DOWNLOAD_THRESHOLD,
            },
        },
        "skills": [asdict(skill) for skill in skills],
        "authors": authors,
        "documents": documents,
    }


def main() -> None:
    payload = build_payload(TOP_N)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {OUTPUT_PATH} with {payload['summary']['sampledSkills']} skills, "
        f"{payload['summary']['sampledAuthors']} authors, "
        f"and {payload['summary']['skills10kPlus']} skills above {HIGH_DOWNLOAD_THRESHOLD:,} downloads."
    )


if __name__ == "__main__":
    main()
