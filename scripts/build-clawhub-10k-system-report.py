#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

import requests

BASE_URL = "https://clawhub.ai"
CONVEX_QUERY_URL = "https://wry-manatee-359.convex.cloud/api/query"
DOWNLOAD_ENDPOINT = f"{BASE_URL}/api/v1/download"
USER_AGENT = "Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/xiaofengxyz/ClawSkillsScout)"

DOWNLOAD_THRESHOLD = 10_000
PAGE_SIZE = 25
MAX_SCAN_SKILLS = 800
AUTHOR_PORTFOLIO_LIMIT = 100
PROLIFIC_MIN_10K = 2
PROLIFIC_MIN_TOTAL = 8
MAX_DEEP_FETCH_AUTHORS = 60
DEEP_FETCH_MIN_SAMPLE_SKILLS = 2
DEEP_FETCH_MIN_SAMPLE_DOWNLOADS = 20_000
DOWNLOAD_WORKERS = 8

DATA_DIR = Path("public/data")
ARTIFACT_DIR = Path("artifacts/clawhub-10k")
REPORT_DIR = Path("reports")
PUBLIC_REPORT_DIR = Path("public/reports")

JSON_OUTPUT_PATH = DATA_DIR / "clawhub-10k-system-report.json"
MARKDOWN_OUTPUT_PATH = REPORT_DIR / "ClawHub_10K_System_Report.md"
DOCX_OUTPUT_PATH = REPORT_DIR / "ClawHub_10K_System_Report.docx"
PUBLIC_MARKDOWN_OUTPUT_PATH = PUBLIC_REPORT_DIR / "ClawHub_10K_System_Report.md"
PUBLIC_DOCX_OUTPUT_PATH = PUBLIC_REPORT_DIR / "ClawHub_10K_System_Report.docx"
SKILL_DOWNLOAD_DIR = ARTIFACT_DIR / "skills"
AUTHOR_DOWNLOAD_DIR = ARTIFACT_DIR / "authors"
DOWNLOAD_INDEX_PATH = ARTIFACT_DIR / "downloads-index.json"

SESSION = requests.Session()
TIMEOUT = 8


@dataclass
class SkillRecord:
    rank: int
    name: str
    author: str
    slug: str
    url: str
    downloads: int
    stars: int | None
    description: str
    version: str | None
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
    return re.findall(r"[a-z0-9]+", (value or "").lower())


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


def title_keywords(name: str) -> list[str]:
    lower = name.lower()
    keywords = []
    for token in [
        "ai",
        "agent",
        "free",
        "fast",
        "search",
        "weather",
        "stock",
        "news",
        "github",
        "youtube",
        "pdf",
        "notion",
        "slack",
        "browser",
        "self-improving",
        "automation",
    ]:
        if token in lower:
            keywords.append(token)
    return keywords


def classify_category(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["weather", "stock", "finance", "market", "news", "search", "docs", "youtube", "github", "reddit"]):
        return "Information"
    if any(term in text for term in ["image", "video", "translate", "summary", "rewrite", "generate", "generator"]):
        return "AI Generation"
    if any(term in text for term in ["pdf", "browser", "playwright", "tool", "notion", "slack", "gmail", "calendar", "workspace"]):
        return "Tools"
    return "Automation"


def classify_input_complexity(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["simple", "quick", "single", "one-shot", "lookup", "summary"]):
        return "Low"
    if any(term in text for term in ["workflow", "multi-step", "automation", "portfolio", "knowledge graph", "memory", "browser"]):
        return "High"
    return "Medium"


def classify_output_value(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["automation", "control", "analysis", "monitor", "alert", "manage", "workspace", "portfolio"]):
        return "High"
    if any(term in text for term in ["search", "summary", "weather", "news", "translate", "video", "image"]):
        return "Medium"
    return "Low"


def classify_api_dependency(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    if any(term in text for term in ["api", "search", "weather", "stock", "finance", "news", "youtube", "github", "slack", "translation", "browser"]):
        return "Yes"
    if any(term in text for term in ["local", "cli", "filesystem", "ffmpeg"]):
        return "No"
    return "Unknown"


def infer_likely_apis(name: str, description: str) -> list[str]:
    text = f"{name} {description}".lower()
    mapping = [
        ("Weather API", ["weather", "forecast"]),
        ("Financial API", ["stock", "finance", "market", "portfolio", "crypto", "trading"]),
        ("Search API", ["search", "news", "docs", "documentation", "web", "reddit"]),
        ("Translation API", ["translate", "translation"]),
        ("Social API", ["youtube", "github", "twitter", "slack", "reddit", "linkedin"]),
        ("Productivity API", ["gmail", "calendar", "drive", "docs", "sheets", "workspace", "notion", "email"]),
        ("Browser Automation Runtime", ["browser", "playwright", "desktop"]),
        ("Media Generation API", ["image", "video", "generator", "generate"]),
    ]
    results = [label for label, keys in mapping if any(key in text for key in keys)]
    return results or ["Unknown"]


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
    if any(term in text for term in ["browser", "pdf", "automation", "workspace"]):
        return "Medium"
    return "Low"


def repeatable_flags(name: str, description: str, category: str, likely_apis: list[str]) -> list[str]:
    text = f"{name} {description}".lower()
    flags: list[str] = []
    if any(term in text for term in ["search", "summary", "monitor", "control", "analyze", "translate", "agent"]):
        flags.append("clear-job-to-be-done")
    if any(term in text for term in ["api", "browser", "tool", "workspace", "weather", "stock", "github"]):
        flags.append("runtime-or-api-wrapper")
    if category in {"Information", "Tools"}:
        flags.append("immediate-utility")
    if len(likely_apis) == 1 and likely_apis[0] != "Unknown":
        flags.append("single-api-factory-fit")
    if any(term in text for term in ["quick", "fast", "simple"]):
        flags.append("low-friction-adoption")
    return flags


def jaccard_similarity(left: str, right: str) -> float:
    left_tokens = set(tokenize(left))
    right_tokens = set(tokenize(right))
    if not left_tokens or not right_tokens:
        return 0.0
    return len(left_tokens & right_tokens) / len(left_tokens | right_tokens)


def convex_query(path: str, args: dict[str, Any], retries: int = 3) -> Any:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            response = SESSION.post(
                CONVEX_QUERY_URL,
                json={"path": path, "args": args},
                headers={"content-type": "application/json", "accept": "application/json"},
                timeout=(8, TIMEOUT),
            )
            response.raise_for_status()
            payload = response.json()
            if payload.get("status") == "success":
                return payload.get("value")
            last_error = RuntimeError(f"Query {path} returned non-success payload: {payload}")
        except Exception as error:
            last_error = error
        if attempt < retries - 1:
            time.sleep(1.0 + attempt)
    raise RuntimeError(f"Convex query failed for {path}: {last_error}")


def normalize_skill_entry(entry: dict[str, Any], rank: int) -> SkillRecord:
    skill = entry.get("skill") or {}
    owner = entry.get("owner") or {}
    latest = entry.get("latestVersion") or {}
    stats = skill.get("stats") or {}

    author = compact_spaces(first_non_empty(entry.get("ownerHandle"), owner.get("handle"), "unknown"))
    slug = compact_spaces(first_non_empty(skill.get("slug"), "unknown"))
    name = compact_spaces(first_non_empty(skill.get("displayName"), slug.replace("-", " ").title()))
    description = compact_spaces(first_non_empty(skill.get("summary"), ""))
    downloads = parse_int(stats.get("downloads")) or 0
    stars = parse_int(stats.get("stars"))
    version = compact_spaces(str(first_non_empty(latest.get("version"), ""))) or None
    likely_apis = infer_likely_apis(name, description)
    category = classify_category(name, description)

    return SkillRecord(
        rank=rank,
        name=name,
        author=author,
        slug=slug,
        url=f"{BASE_URL}/{author}/{slug}",
        downloads=downloads,
        stars=stars,
        description=description,
        version=version,
        category=category,
        inputComplexity=classify_input_complexity(name, description),
        outputValue=classify_output_value(name, description),
        apiDependency=classify_api_dependency(name, description),
        monetizationPotential=classify_monetization_potential(name, description, likely_apis),
        likelyApis=likely_apis,
        titleKeywords=title_keywords(name),
        repeatablePatternFlags=repeatable_flags(name, description, category, likely_apis),
    )


def fetch_10k_plus_skills() -> list[SkillRecord]:
    skills: list[SkillRecord] = []
    cursor: str | None = None

    while len(skills) < MAX_SCAN_SKILLS:
        args: dict[str, Any] = {"numItems": PAGE_SIZE, "sort": "downloads", "dir": "desc"}
        if cursor:
            args["cursor"] = cursor

        value = convex_query("skills:listPublicPageV4", args)
        page = value.get("page") or []
        if not page:
            break

        stop = False
        for entry in page:
            record = normalize_skill_entry(entry, len(skills) + 1)
            if record.downloads < DOWNLOAD_THRESHOLD:
                stop = True
                break
            skills.append(record)

        if stop:
            break

        if not value.get("hasMore"):
            break
        cursor = value.get("nextCursor")
        if not cursor:
            break

    return skills


def download_skill_zip(author: str, slug: str, target_path: Path) -> dict[str, Any]:
    target_path.parent.mkdir(parents=True, exist_ok=True)
    if target_path.exists() and target_path.stat().st_size > 0:
        return {"status": "existing", "bytes": target_path.stat().st_size}

    url = f"{DOWNLOAD_ENDPOINT}?slug={slug}"
    for attempt in range(3):
        try:
            response = requests.get(
                url,
                headers={"user-agent": USER_AGENT, "accept": "application/zip,application/octet-stream"},
                timeout=(8, 35),
                allow_redirects=True,
            )
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if "application/zip" not in content_type and not response.content.startswith(b"PK\x03\x04"):
                raise RuntimeError(f"Unexpected response type for {author}/{slug}: {content_type}")
            target_path.write_bytes(response.content)
            return {
                "status": "downloaded",
                "bytes": len(response.content),
                "downloadUrl": url,
            }
        except Exception as error:
            if attempt == 2:
                return {"status": "failed", "error": str(error), "downloadUrl": url}
            time.sleep(1.0 + attempt)
    return {"status": "failed", "error": "unknown", "downloadUrl": url}


def fetch_author_portfolio(handle: str) -> tuple[list[dict[str, Any]], str]:
    try:
        user = convex_query("users:getByHandle", {"handle": handle}, retries=2)
        if user and user.get("_id"):
            try:
                items = convex_query(
                    "skills:list",
                    {"ownerUserId": user["_id"], "limit": AUTHOR_PORTFOLIO_LIMIT},
                    retries=2,
                )
                if isinstance(items, list):
                    return items, "profile-query"
            except Exception:
                pass
    except Exception:
        pass

    try:
        items = convex_query("search:searchSkills", {"query": handle, "limit": AUTHOR_PORTFOLIO_LIMIT}, retries=2)
        if isinstance(items, list):
            owned = []
            for item in items:
                owner = compact_spaces(first_non_empty(item.get("ownerHandle"), (item.get("owner") or {}).get("handle"), ""))
                if owner == handle:
                    owned.append(item)
            return owned, "search-fallback"
    except Exception:
        pass

    return [], "sample-derived"


def normalize_author_skill(handle: str, item: dict[str, Any], index: int) -> dict[str, Any]:
    skill = item.get("skill") or item
    stats = skill.get("stats") or item.get("stats") or {}
    slug = compact_spaces(first_non_empty(skill.get("slug"), item.get("slug"), f"unknown-{index}"))
    name = compact_spaces(first_non_empty(skill.get("displayName"), item.get("name"), slug.replace("-", " ").title()))
    description = compact_spaces(first_non_empty(skill.get("summary"), item.get("summary"), ""))
    downloads = parse_int(first_non_empty(stats.get("downloads"), item.get("downloads"))) or 0
    category = classify_category(name, description)
    likely_apis = infer_likely_apis(name, description)
    return {
        "name": name,
        "slug": slug,
        "url": f"{BASE_URL}/{handle}/{slug}",
        "downloads": downloads,
        "description": description,
        "category": category,
        "likelyApis": likely_apis,
    }


def merge_portfolio_with_sample(
    portfolio: list[dict[str, Any]],
    sample_skills: list[SkillRecord],
) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}

    for item in portfolio:
        slug = item["slug"]
        merged[slug] = dict(item)

    for skill in sample_skills:
        sample_item = {
            "name": skill.name,
            "slug": skill.slug,
            "url": skill.url,
            "downloads": skill.downloads,
            "description": skill.description,
            "category": skill.category,
            "likelyApis": skill.likelyApis,
        }
        existing = merged.get(skill.slug)
        if not existing:
            merged[skill.slug] = sample_item
            continue

        existing["downloads"] = max(existing.get("downloads", 0), sample_item["downloads"])
        if not compact_spaces(existing.get("description")) and sample_item["description"]:
            existing["description"] = sample_item["description"]
        if existing.get("category") == "Automation" and sample_item["category"] != "Automation":
            existing["category"] = sample_item["category"]
        if existing.get("likelyApis") == ["Unknown"] and sample_item["likelyApis"] != ["Unknown"]:
            existing["likelyApis"] = sample_item["likelyApis"]
        if not compact_spaces(existing.get("name")) and sample_item["name"]:
            existing["name"] = sample_item["name"]
        if not compact_spaces(existing.get("url")) and sample_item["url"]:
            existing["url"] = sample_item["url"]

    return list(merged.values())


def build_author_records(skills: list[SkillRecord]) -> list[dict[str, Any]]:
    by_author: dict[str, list[SkillRecord]] = defaultdict(list)
    for skill in skills:
        by_author[skill.author].append(skill)

    ranked_authors = sorted(
        by_author.items(),
        key=lambda kv: (-len(kv[1]), -sum(skill.downloads for skill in kv[1]), kv[0]),
    )
    deep_fetch_authors: set[str] = set()
    for author, sample in ranked_authors:
        if (
            len(deep_fetch_authors) < MAX_DEEP_FETCH_AUTHORS
            and (len(sample) >= DEEP_FETCH_MIN_SAMPLE_SKILLS or sum(skill.downloads for skill in sample) >= DEEP_FETCH_MIN_SAMPLE_DOWNLOADS)
        ):
            deep_fetch_authors.add(author)

    records: list[dict[str, Any]] = []
    total_authors = len(by_author)
    for index, (author, sample_skills) in enumerate(by_author.items(), start=1):
        sample_skills = sorted(sample_skills, key=lambda x: (-x.downloads, x.name.lower()))

        should_deep_fetch = author in deep_fetch_authors
        portfolio_items: list[dict[str, Any]] = []
        status = "sample-derived"
        if should_deep_fetch:
            portfolio_items, status = fetch_author_portfolio(author)

        if portfolio_items:
            portfolio = [normalize_author_skill(author, item, idx + 1) for idx, item in enumerate(portfolio_items)]
        else:
            portfolio = [
                {
                    "name": skill.name,
                    "slug": skill.slug,
                    "url": skill.url,
                    "downloads": skill.downloads,
                    "description": skill.description,
                    "category": skill.category,
                    "likelyApis": skill.likelyApis,
                }
                for skill in sample_skills
            ]
            status = "sample-derived"

        portfolio = merge_portfolio_with_sample(portfolio, sample_skills)
        portfolio = sorted(portfolio, key=lambda x: (-x["downloads"], x["name"].lower()))

        category_counter = Counter(item["category"] for item in portfolio)
        api_counter = Counter(api for item in portfolio for api in item["likelyApis"])

        similarities: list[float] = []
        template_pairs = 0
        for idx, left in enumerate(portfolio):
            for right in portfolio[idx + 1 :]:
                score = max(
                    jaccard_similarity(left["name"], right["name"]),
                    jaccard_similarity(left["description"], right["description"]),
                )
                similarities.append(score)
                if score >= 0.42 or set(left["likelyApis"]) == set(right["likelyApis"]):
                    template_pairs += 1

        repetition_score = round(sum(similarities) / len(similarities), 2) if similarities else 0.0
        pair_count = math.comb(len(portfolio), 2) if len(portfolio) > 1 else 0
        template_ratio = template_pairs / pair_count if pair_count else 0.0
        api_reuse_ratio = api_counter.most_common(1)[0][1] / max(len(portfolio), 1) if api_counter else 0.0

        number_10k_plus = sum(item["downloads"] >= DOWNLOAD_THRESHOLD for item in portfolio)
        number_5k_plus = sum(item["downloads"] >= 5_000 for item in portfolio)

        records.append(
            {
                "author": author,
                "profileUrl": f"{BASE_URL}/u/{author}",
                "totalSkills": len(portfolio),
                "sampled10kSkills": len(sample_skills),
                "numberOf10kPlusSkills": number_10k_plus,
                "numberOf5kPlusSkills": number_5k_plus,
                "totalDownloadsInPortfolio": sum(item["downloads"] for item in portfolio),
                "totalDownloadsIn10kSample": sum(skill.downloads for skill in sample_skills),
                "categoryDistribution": dict(category_counter),
                "repetitionScore": repetition_score,
                "apiReuseLikelihood": "High" if api_reuse_ratio >= 0.6 else "Medium" if api_reuse_ratio >= 0.35 else "Low",
                "templateUsage": "High" if template_ratio >= 0.45 else "Medium" if template_ratio >= 0.2 else "Low",
                "apiFamilies": [api for api, _ in api_counter.most_common(4)],
                "topSkillNames": [item["name"] for item in portfolio[:3]],
                "authorPageStatus": status,
                "skills": portfolio,
                "isProlific": number_10k_plus >= PROLIFIC_MIN_10K or len(portfolio) >= PROLIFIC_MIN_TOTAL,
            }
        )
        if index % 20 == 0 or index == total_authors:
            print(f"Author modeling progress: {index}/{total_authors}", flush=True)

    records.sort(key=lambda x: (-x["numberOf10kPlusSkills"], -x["totalDownloadsIn10kSample"], -x["totalSkills"], x["author"]))
    return records


def percentage(part: int, whole: int) -> float:
    if whole == 0:
        return 0.0
    return round(part / whole * 100, 1)


def build_documents(skills: list[SkillRecord], authors: list[dict[str, Any]]) -> dict[str, Any]:
    top20 = skills[:20]
    top10_authors = authors[:10]
    prolific_authors = [author for author in authors if author["isProlific"]][:20]

    category_counts = Counter(skill.category for skill in skills)
    api_counts = Counter(api for skill in skills for api in skill.likelyApis)
    keyword_counts = Counter(keyword for skill in top20 for keyword in skill.titleKeywords)
    low_medium_input = sum(skill.inputComplexity in {"Low", "Medium"} for skill in top20)
    high_value = sum(skill.outputValue == "High" for skill in top20)

    self_improving_focus = [
        author
        for author in authors
        if author["author"] in {"pskoett", "ivangdavila", "steipete"} or any("self-improving" in name.lower() for name in author["topSkillNames"])
    ]

    top_rebuilds = [
        {
            "skill": skill.name,
            "author": skill.author,
            "category": skill.category,
            "downloads": skill.downloads,
            "likelyApis": skill.likelyApis,
            "systemRationale": f"Validated demand with {skill.downloads:,} downloads and clean API wrapper potential.",
            "aisaMonetizationHook": "Charge for fresher data, richer controls, and higher request ceilings.",
        }
        for skill in sorted(
            [skill for skill in skills if skill.monetizationPotential in {"High", "Medium"}],
            key=lambda x: (-x.downloads, x.name.lower()),
        )[:10]
    ]

    return {
        "document1": {
            "title": "Top Skills Systems Analysis",
            "categoryDistribution": [
                {"category": category, "count": count, "share": percentage(count, len(skills))}
                for category, count in category_counts.most_common()
            ],
            "top20Skills": [asdict(skill) for skill in top20],
            "systemLevelFindings": [
                f"{category_counts.most_common(1)[0][0]} dominates the 10K+ cohort, signaling that immediate utility consistently outperforms novelty.",
                f"{percentage(low_medium_input, len(top20))}% of top skills keep inputs low/medium complexity, compressing time-to-value.",
                f"{percentage(high_value, len(top20))}% of top skills promise operational leverage instead of passive information.",
                f"Recurring title tokens: {', '.join(token for token, _ in keyword_counts.most_common(8)) or 'utility-first naming'}.",
                f"Top monetizable API families: {', '.join(api for api, _ in api_counts.most_common(5))}.",
            ],
            "repeatableSystem": [
                "System S1 - Demand-first packaging: start from narrow, explicit user job statements.",
                "System S2 - Fast value confirmation: make first successful output possible in one prompt.",
                "System S3 - Wrapper factory: reuse one API runtime across many vertical variants.",
                "System S4 - Discoverability loop: title, subtitle, and tags mirror user search intent terms.",
                "System S5 - Iteration cadence: release small variants weekly and promote the best performers.",
            ],
        },
        "document2": {
            "title": "Top Authors Production Systems",
            "top10Authors": top10_authors,
            "prolificAuthors": prolific_authors,
            "selfImprovingAuthorFocus": self_improving_focus,
            "productionSystemFindings": [
                "High-output authors are running portfolio systems, not one-off releases: shared scaffolds, naming templates, and API reuse.",
                "They maximize derivative output from one core capability by framing multiple adjacent user jobs.",
                "Template usage and API reuse are reliable leading indicators of sustained hit-rate.",
                "The 'self-improving' cluster succeeds by embedding learning/feedback loops directly into workflow-facing utility.",
            ],
        },
        "document3": {
            "title": "Skill Factory Playbook (Replicable Capability)",
            "operatingModel": [
                "Step 1: Select one API family with stable external demand (search, weather, finance, translation, productivity).",
                "Step 2: Build one base wrapper with strict input/output contracts and telemetry hooks.",
                "Step 3: Launch 5-10 variants using the same engine with different user-job framing.",
                "Step 4: Track install velocity, completion rate, repeat usage, and conversion triggers.",
                "Step 5: Promote winners, deprecate weak variants, and feed learnings back into templates.",
            ],
            "ordinaryToViralTransformation": [
                "V1 Ordinary: generic feature description, broad scope, slow initial value.",
                "V2 Better: narrow use case, one explicit promise, cleaner examples.",
                "V3 Viral Candidate: obvious title, immediate output, visible trust signal, reusable API backend.",
                "V4 Portfolio Asset: same engine reused across adjacent niches with controlled variation.",
            ],
            "executionChecklist": [
                "Define single-sentence job-to-be-done before coding.",
                "Ensure first-run success path within one prompt.",
                "Instrument outcome metrics and log prompt class distribution.",
                "Maintain reusable starter template for future variants.",
                "Design pricing hooks from day one (limits, freshness, volume, automation depth).",
            ],
        },
        "document4": {
            "title": "AIsa API Monetization Systems",
            "replaceableApis": [
                {
                    "apiFamily": api,
                    "skillCount": count,
                    "systemPlay": "Use AIsa as unified paid backend and ship many low-friction wrappers."
                    if api != "Unknown"
                    else "Keep as experimental template pool; prioritize clearer dependency mapping.",
                }
                for api, count in api_counts.most_common(10)
            ],
            "freeProModelByCategory": [
                {
                    "category": "Information",
                    "freeTier": "Small result set, cached snapshots, low request caps.",
                    "proTier": "Real-time freshness, historical depth, richer filters, higher rate limits.",
                },
                {
                    "category": "AI Generation",
                    "freeTier": "Short output, baseline models, low throughput.",
                    "proTier": "Premium models, larger context, batch generation, quality controls.",
                },
                {
                    "category": "Tools",
                    "freeTier": "Single-task utility and limited runs.",
                    "proTier": "Workflow automation, audit trail, concurrency, team controls.",
                },
                {
                    "category": "Automation",
                    "freeTier": "Manual trigger and one-shot execution.",
                    "proTier": "Scheduling, retries, event hooks, orchestration analytics.",
                },
            ],
            "top10AisaRebuildCandidates": top_rebuilds,
            "monetizationFunnel": [
                "Acquire: free utility skill with clear task completion.",
                "Activate: show premium benefits only after first successful run.",
                "Convert: unlock throughput/freshness/automation depth.",
                "Expand: upsell team governance and shared API credits.",
            ],
            "roadmap": [
                "Phase 1: Ship 10 high-demand wrappers on unified AIsa endpoints.",
                "Phase 2: Add telemetry-driven auto-variant generation.",
                "Phase 3: Productize author-side skill factory tooling as paid SaaS.",
            ],
        },
    }


def build_markdown_report(payload: dict[str, Any]) -> str:
    docs = payload["documents"]
    lines: list[str] = []
    lines.append("# ClawHub 10K+ Skills System Report")
    lines.append("")
    lines.append(f"- GeneratedAt: {payload['generatedAt']}")
    lines.append(f"- Sampled10kSkills: {payload['summary']['sampled10kSkills']}")
    lines.append(f"- SampledAuthors: {payload['summary']['sampledAuthors']}")
    lines.append(f"- ProlificAuthors: {payload['summary']['prolificAuthors']}")
    lines.append("")

    lines.append("## Document 1 - Top Skills Systems Analysis")
    lines.append("")
    for item in docs["document1"]["systemLevelFindings"]:
        lines.append(f"- {item}")
    lines.append("")
    lines.append("### Repeatable Systems")
    for item in docs["document1"]["repeatableSystem"]:
        lines.append(f"- {item}")
    lines.append("")

    lines.append("## Document 2 - Top Authors Production Systems")
    lines.append("")
    lines.append("### Top Authors")
    for author in docs["document2"]["top10Authors"]:
        lines.append(
            f"- @{author['author']}: totalSkills={author['totalSkills']}, 10kPlus={author['numberOf10kPlusSkills']}, strategy={author['apiReuseLikelihood']}/{author['templateUsage']}"
        )
    lines.append("")
    lines.append("### Self-Improving Focus")
    for author in docs["document2"]["selfImprovingAuthorFocus"]:
        lines.append(
            f"- @{author['author']}: topSkills={', '.join(author['topSkillNames'])}, totalSkills={author['totalSkills']}, 10kPlus={author['numberOf10kPlusSkills']}"
        )
    lines.append("")
    for item in docs["document2"]["productionSystemFindings"]:
        lines.append(f"- {item}")
    lines.append("")

    lines.append("## Document 3 - Skill Factory Playbook")
    lines.append("")
    lines.append("### Operating Model")
    for step in docs["document3"]["operatingModel"]:
        lines.append(f"- {step}")
    lines.append("")
    lines.append("### Ordinary to Viral")
    for step in docs["document3"]["ordinaryToViralTransformation"]:
        lines.append(f"- {step}")
    lines.append("")
    lines.append("### Execution Checklist")
    for step in docs["document3"]["executionChecklist"]:
        lines.append(f"- {step}")
    lines.append("")

    lines.append("## Document 4 - AIsa Monetization Systems")
    lines.append("")
    lines.append("### Replaceable API Families")
    for item in docs["document4"]["replaceableApis"]:
        lines.append(f"- {item['apiFamily']}: {item['skillCount']} skills. {item['systemPlay']}")
    lines.append("")
    lines.append("### Top 10 Rebuild Candidates")
    for item in docs["document4"]["top10AisaRebuildCandidates"]:
        lines.append(
            f"- {item['skill']} (@{item['author']}): {item['downloads']:,} downloads, APIs={', '.join(item['likelyApis'])}. {item['systemRationale']}"
        )
    lines.append("")
    lines.append("### Monetization Funnel")
    for item in docs["document4"]["monetizationFunnel"]:
        lines.append(f"- {item}")
    lines.append("")
    lines.append("### Roadmap")
    for item in docs["document4"]["roadmap"]:
        lines.append(f"- {item}")
    lines.append("")

    return "\n".join(lines).strip() + "\n"


def build_docx_paragraph_xml(text: str) -> str:
    text = text if text else " "
    return f"<w:p><w:r><w:t xml:space=\"preserve\">{escape(text)}</w:t></w:r></w:p>"


def write_simple_docx(path: Path, paragraphs: list[str]) -> None:
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""
    doc_body = "".join(build_docx_paragraph_xml(line) for line in paragraphs)
    document = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {doc_body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", rels)
        archive.writestr("word/document.xml", document)


def download_10k_skills(skills: list[SkillRecord]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    downloaded: list[dict[str, Any]] = []
    failed: list[dict[str, Any]] = []
    total = len(skills)
    with ThreadPoolExecutor(max_workers=DOWNLOAD_WORKERS) as pool:
        tasks = {
            pool.submit(download_skill_zip, skill.author, skill.slug, SKILL_DOWNLOAD_DIR / skill.author / f"{skill.slug}.zip"): skill
            for skill in skills
        }
        for idx, future in enumerate(as_completed(tasks), start=1):
            skill = tasks[future]
            target = SKILL_DOWNLOAD_DIR / skill.author / f"{skill.slug}.zip"
            result = future.result()
            entry = {
                "author": skill.author,
                "slug": skill.slug,
                "name": skill.name,
                "downloads": skill.downloads,
                "url": skill.url,
                "file": str(target.as_posix()),
                **result,
            }
            if result["status"] == "failed":
                failed.append(entry)
            else:
                downloaded.append(entry)
            if idx % 25 == 0 or idx == total:
                print(f"10k skill download progress: {idx}/{total}", flush=True)
    return downloaded, failed


def download_prolific_author_skills(authors: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    downloaded: list[dict[str, Any]] = []
    failed: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    jobs: list[tuple[str, dict[str, Any], Path]] = []
    for author in authors:
        for skill in author["skills"]:
            key = (author["author"], skill["slug"])
            if key in seen:
                continue
            seen.add(key)
            target = AUTHOR_DOWNLOAD_DIR / author["author"] / f"{skill['slug']}.zip"
            jobs.append((author["author"], skill, target))

    total = len(jobs)
    with ThreadPoolExecutor(max_workers=DOWNLOAD_WORKERS) as pool:
        tasks = {
            pool.submit(download_skill_zip, author_handle, skill["slug"], target): (author_handle, skill, target)
            for author_handle, skill, target in jobs
        }
        for idx, future in enumerate(as_completed(tasks), start=1):
            author_handle, skill, target = tasks[future]
            result = future.result()
            entry = {
                "author": author_handle,
                "slug": skill["slug"],
                "name": skill["name"],
                "downloads": skill["downloads"],
                "url": skill["url"],
                "file": str(target.as_posix()),
                **result,
            }
            if result["status"] == "failed":
                failed.append(entry)
            else:
                downloaded.append(entry)
            if idx % 40 == 0 or idx == total:
                print(f"Prolific portfolio download progress: {idx}/{total}", flush=True)
    return downloaded, failed


def main() -> None:
    started_at = datetime.now(timezone.utc).isoformat()
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_REPORT_DIR.mkdir(parents=True, exist_ok=True)

    print("Fetching 10k+ skills from live downloads ranking...", flush=True)
    skills = fetch_10k_plus_skills()
    print(f"Fetched {len(skills)} skills with downloads >= {DOWNLOAD_THRESHOLD}.", flush=True)

    print("Building author records and production patterns...", flush=True)
    authors = build_author_records(skills)
    prolific_authors = [author for author in authors if author["isProlific"]]
    print(f"Built {len(authors)} author records. Prolific authors: {len(prolific_authors)}", flush=True)

    print("Downloading all 10k+ skill packages...", flush=True)
    downloaded_10k, failed_10k = download_10k_skills(skills)
    print(f"10k+ downloads complete. Success: {len(downloaded_10k)} Failed: {len(failed_10k)}", flush=True)

    print("Downloading portfolios for prolific authors...", flush=True)
    downloaded_authors, failed_authors = download_prolific_author_skills(prolific_authors)
    print(f"Prolific author downloads complete. Success: {len(downloaded_authors)} Failed: {len(failed_authors)}", flush=True)

    documents = build_documents(skills, authors)

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "startedAt": started_at,
        "source": {
            "skillsListUrl": f"{BASE_URL}/skills?sort=downloads",
            "queryBackend": CONVEX_QUERY_URL,
            "downloadEndpoint": DOWNLOAD_ENDPOINT,
            "threshold": DOWNLOAD_THRESHOLD,
            "notes": [
                "This dataset is built from live downloads-sorted ranking entries.",
                "Only skills with downloads >= 10k are included in the primary cohort.",
                "The analysis prioritizes repeatable systems over single-hit narratives.",
            ],
        },
        "summary": {
            "sampled10kSkills": len(skills),
            "sampledAuthors": len(authors),
            "prolificAuthors": len(prolific_authors),
            "topSkillDownloads": skills[0].downloads if skills else 0,
            "downloaded10kSkills": len(downloaded_10k),
            "downloadedProlificPortfolioSkills": len(downloaded_authors),
            "failed10kSkillDownloads": len(failed_10k),
            "failedProlificPortfolioDownloads": len(failed_authors),
        },
        "skills": [asdict(skill) for skill in skills],
        "authors": authors,
        "documents": documents,
        "downloadArtifacts": {
            "skills10k": downloaded_10k,
            "skills10kFailures": failed_10k,
            "prolificAuthors": downloaded_authors,
            "prolificAuthorFailures": failed_authors,
        },
    }

    JSON_OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    DOWNLOAD_INDEX_PATH.write_text(
        json.dumps(
            {
                "generatedAt": payload["generatedAt"],
                "skills10kCount": len(downloaded_10k),
                "skills10kFailed": len(failed_10k),
                "prolificPortfolioCount": len(downloaded_authors),
                "prolificPortfolioFailed": len(failed_authors),
                "skills10k": downloaded_10k,
                "skills10kFailures": failed_10k,
                "prolificPortfolio": downloaded_authors,
                "prolificPortfolioFailures": failed_authors,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    markdown = build_markdown_report(payload)
    MARKDOWN_OUTPUT_PATH.write_text(markdown, encoding="utf-8")
    PUBLIC_MARKDOWN_OUTPUT_PATH.write_text(markdown, encoding="utf-8")
    write_simple_docx(DOCX_OUTPUT_PATH, markdown.splitlines())
    write_simple_docx(PUBLIC_DOCX_OUTPUT_PATH, markdown.splitlines())

    print(f"Wrote JSON report: {JSON_OUTPUT_PATH}")
    print(f"Wrote Markdown report: {MARKDOWN_OUTPUT_PATH}")
    print(f"Wrote Word report: {DOCX_OUTPUT_PATH}")
    print(f"Wrote public Markdown report: {PUBLIC_MARKDOWN_OUTPUT_PATH}")
    print(f"Wrote public Word report: {PUBLIC_DOCX_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
