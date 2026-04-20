#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import time
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

import requests

CONVEX_QUERY_URL = "https://wry-manatee-359.convex.cloud/api/query"
BASE_URL = "https://clawhub.ai"
TOP_N = 200
PAGE_SIZE = 50
TIMEOUT = (20, 90)

CATALOG_PATH = Path("public/data/catalog.json")
HISTORY_PATH = Path("docs/lastChat")

AISA_PLAN_JSON = Path("public/data/aisa-all-skills-breakout-plan.json")
AISA_PLAN_MD = Path("reports/AISA_All_Skills_Breakout_Plan_ZH.md")
AISA_PLAN_PUBLIC_MD = Path("public/reports/AISA_All_Skills_Breakout_Plan_ZH.md")
AISA_PLAN_DOCX = Path("reports/AISA_All_Skills_Breakout_Plan_ZH.docx")
AISA_PLAN_PUBLIC_DOCX = Path("public/reports/AISA_All_Skills_Breakout_Plan_ZH.docx")

TOP200_PLAN_JSON = Path("public/data/clawhub-top200-aisa-conversion-plan.json")
TOP200_PLAN_MD = Path("reports/ClawHub_Top200_AISA_Conversion_Report_ZH.md")
TOP200_PLAN_PUBLIC_MD = Path("public/reports/ClawHub_Top200_AISA_Conversion_Report_ZH.md")
TOP200_PLAN_DOCX = Path("reports/ClawHub_Top200_AISA_Conversion_Report_ZH.docx")
TOP200_PLAN_PUBLIC_DOCX = Path("public/reports/ClawHub_Top200_AISA_Conversion_Report_ZH.docx")

RANKING_URLS = {
    "downloads": "https://clawhub.ai/skills?sort=downloads&dir=desc",
    "stars": "https://clawhub.ai/skills?sort=stars&dir=desc",
    "installs": "https://clawhub.ai/skills?sort=installs&dir=desc",
}

SESSION = requests.Session()


def compact_spaces(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def parse_int(value: Any) -> int:
    if value is None or isinstance(value, bool):
        return 0
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    text = compact_spaces(str(value)).lower().replace(",", "")
    if not text:
        return 0
    multiplier = 1
    if text.endswith("k"):
        text = text[:-1]
        multiplier = 1_000
    elif text.endswith("m"):
        text = text[:-1]
        multiplier = 1_000_000
    try:
        return int(float(text) * multiplier)
    except ValueError:
        return 0


def first_non_empty(*values: Any) -> Any:
    for value in values:
        if value is None:
            continue
        if isinstance(value, str) and not compact_spaces(value):
            continue
        return value
    return None


def convex_query(path: str, args: dict[str, Any], retries: int = 5) -> Any:
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            response = SESSION.post(
                CONVEX_QUERY_URL,
                json={"path": path, "args": args},
                headers={"content-type": "application/json", "accept": "application/json"},
                timeout=TIMEOUT,
            )
            response.raise_for_status()
            payload = response.json()
            if payload.get("status") == "success":
                return payload.get("value")
            last_error = RuntimeError(f"non-success payload: {payload}")
        except Exception as error:
            last_error = error
        if attempt < retries - 1:
            time.sleep(1.5 + attempt * 1.5)
    raise RuntimeError(f"Convex query failed for {path}: {last_error}")


def detect_category(name: str, description: str) -> str:
    lower_name = name.lower()
    text = f"{name} {description}".lower()
    if any(term in lower_name for term in ["skill vetter", "security", "auditor", "moltguard"]):
        return "Security & Audit"
    if any(term in lower_name for term in ["self-improving", "proactive agent", "ontology", "memory manager", "second brain", "jarvis"]):
        return "Agentic Systems"
    if any(term in lower_name for term in ["github", "git essentials", "api gateway", "model usage", "frontend design", "answer overflow", "developer", "code"]):
        return "Developer"
    if any(term in lower_name for term in ["notion", "slack", "gmail", "calendar", "apple notes", "bear notes", "things mac", "imap-smtp-email", "agentmail"]):
        return "Productivity & Workspace"
    if any(term in lower_name for term in ["word", "docx", "excel", "xlsx", "powerpoint", "ppt", "pdf", "markdown converter", "markdown.new", "aippt", "slides"]):
        return "Office Documents"
    if any(term in lower_name for term in ["twitter", "tweet", "xiaohongshu", "social", "discord", "answer overflow"]):
        return "Social & Growth"
    if any(term in lower_name for term in ["youtube", "video frames", "youtube watcher", "creator", "video "]):
        return "Video & Creator Research"
    if any(term in lower_name for term in ["image gen", "openai image", "nano banana", "media gen", "humanizer", "skill creator", "diagram-generator"]):
        return "Media Generation"
    if any(term in lower_name for term in ["stock", "market", "finance", "polymarket", "kalshi", "weather", "admapix", "ecomseer"]):
        return "Finance & Market Data" if "weather" not in lower_name else "Weather & Utility Data"
    if any(term in lower_name for term in ["browser", "playwright", "desktop control", "browser use", "home assistant", "n8n", "mcporter", "oracle", "automation"]):
        return "Browser & Automation"
    if any(term in lower_name for term in ["search", "news", "research", "tavily", "exa", "duckduckgo", "baidu", "firecrawl", "clawdbot documentation expert"]):
        return "Search & Research"
    if any(term in text for term in ["security", "audit", "vetter", "antivirus", "guardrails", "risk"]):
        return "Security & Audit"
    if any(term in text for term in ["self-improving", "proactive", "agent", "ontology", "brain", "memory", "jarvis"]):
        return "Agentic Systems"
    if any(term in text for term in ["twitter", "tweet", "x/", "social", "community", "spaces", "engage", "follow", "followers"]):
        return "Social & Growth"
    if any(term in text for term in ["youtube", "video", "channel", "creator", "serp scout"]):
        return "Video & Creator Research"
    if any(term in text for term in ["image", "video generation", "media gen", "banana", "wan", "gemini image", "generate images", "generate videos"]):
        return "Media Generation"
    if any(term in text for term in ["stock", "finance", "market", "crypto", "equity", "price", "trading", "polymarket", "kalshi"]):
        return "Finance & Market Data"
    if any(term in text for term in ["weather", "forecast"]):
        return "Weather & Utility Data"
    if any(term in text for term in ["browser", "playwright", "scraper", "automation", "mcp", "desktop control", "browser use"]):
        return "Browser & Automation"
    if any(term in text for term in ["gmail", "calendar", "drive", "docs", "sheets", "workspace", "email", "slack", "notion", "apple notes"]):
        return "Productivity & Workspace"
    if any(term in text for term in ["word", "docx", "excel", "xlsx", "powerpoint", "ppt", "pdf", "markdown converter", "slides"]):
        return "Office Documents"
    if any(term in text for term in ["github", "repo", "pull request", "pr ", "issue", "git ", "developer", "code"]):
        return "Developer"
    if any(term in text for term in ["search", "research", "news", "tavily", "serp", "web ", "academic", "browser search"]):
        return "Search & Research"
    return "General Utility"


def infer_api_family(category: str, name: str, description: str) -> str:
    category_map = {
        "Developer": "Developer Platform API",
        "Search & Research": "Search API",
        "Productivity & Workspace": "Workspace API",
        "Office Documents": "Document Office API",
        "Social & Growth": "Social API",
        "Video & Creator Research": "Video Research API",
        "Media Generation": "Media Generation API",
        "Finance & Market Data": "Market Data API",
        "Weather & Utility Data": "Weather / Utility API",
        "Browser & Automation": "Browser Automation API",
        "Security & Audit": "Security Audit API",
        "Agentic Systems": "Agent Orchestration Layer",
        "General Utility": "General Utility API",
    }
    return category_map[category]


def fit_score(category: str) -> int:
    mapping = {
        "Developer": 95,
        "Search & Research": 96,
        "Productivity & Workspace": 93,
        "Office Documents": 92,
        "Social & Growth": 90,
        "Video & Creator Research": 90,
        "Media Generation": 89,
        "Finance & Market Data": 90,
        "Weather & Utility Data": 84,
        "Browser & Automation": 91,
        "Security & Audit": 87,
        "Agentic Systems": 72,
        "General Utility": 60,
    }
    return mapping[category]


def monetization_score(category: str) -> int:
    mapping = {
        "Developer": 95,
        "Search & Research": 94,
        "Productivity & Workspace": 93,
        "Office Documents": 92,
        "Social & Growth": 88,
        "Video & Creator Research": 88,
        "Media Generation": 91,
        "Finance & Market Data": 94,
        "Weather & Utility Data": 80,
        "Browser & Automation": 95,
        "Security & Audit": 94,
        "Agentic Systems": 78,
        "General Utility": 68,
    }
    return mapping[category]


def factory_score(category: str) -> int:
    mapping = {
        "Developer": 95,
        "Search & Research": 96,
        "Productivity & Workspace": 92,
        "Office Documents": 90,
        "Social & Growth": 92,
        "Video & Creator Research": 90,
        "Media Generation": 89,
        "Finance & Market Data": 91,
        "Weather & Utility Data": 80,
        "Browser & Automation": 92,
        "Security & Audit": 88,
        "Agentic Systems": 82,
        "General Utility": 65,
    }
    return mapping[category]


def category_summary(category: str) -> str:
    mapping = {
        "Developer": "开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。",
        "Search & Research": "高频信息入口，最适合 API 化和多变体扩张。",
        "Productivity & Workspace": "团队协作与办公自动化适合做多席位和高客单价套餐。",
        "Office Documents": "文档办公场景清晰，容易切成 Word/Excel/PPT/PDF 多 SKU。",
        "Social & Growth": "适合做研究、监控、发布、互动四层矩阵。",
        "Video & Creator Research": "内容研究、竞品研究、选题验证都适合变成 API 和工作流 skill。",
        "Media Generation": "展示强、传播强、按量收费自然。",
        "Finance & Market Data": "决策价值高，付费意愿强，适合专业套餐。",
        "Weather & Utility Data": "高频低门槛，适合做调用量和嵌入型产品。",
        "Browser & Automation": "自动化价值高，适合高阶付费和团队套餐。",
        "Security & Audit": "安装决策、风险治理、企业合规都适合高价。",
        "Agentic Systems": "更适合做上层系统能力和旗舰叙事入口，而不是单点 API 包。",
        "General Utility": "需重新定义更窄 JTBD 才更容易成为爆款。",
    }
    return mapping[category]


def target_title(category: str, name: str) -> str:
    lower = name.lower()
    if "github" in lower:
        return "GitHub Command Center"
    if any(term in lower for term in ["twitter", "tweet", "x/"]):
        return "Twitter API Command Center"
    if "youtube" in lower:
        return "YouTube SERP Scout"
    if any(term in lower for term in ["gmail", "calendar", "drive", "workspace"]):
        return "Workspace Command Center"
    if any(term in lower for term in ["word", "docx", "excel", "xlsx", "powerpoint", "ppt", "pdf"]):
        return "Document Office Command Center"
    if "weather" in lower:
        return "Weather Decision API"
    if any(term in lower for term in ["finance", "stock", "market", "crypto"]):
        return "Market Data Command Center"
    if any(term in lower for term in ["search", "research", "news", "tavily", "serp"]):
        return "Multi-Source Search Command Center"
    if any(term in lower for term in ["browser", "playwright", "scraper", "automation"]):
        return "Browser Automation Command Center"
    if any(term in lower for term in ["security", "audit", "vetter"]):
        return "Security Audit Command Center"
    if any(term in lower for term in ["image", "video generation", "media"]):
        return "Image & Video Command Center"
    category_default = {
        "Developer": "Developer Command Center",
        "Search & Research": "Research Command Center",
        "Productivity & Workspace": "Workspace Command Center",
        "Office Documents": "Document Office Command Center",
        "Social & Growth": "Social Growth Command Center",
        "Video & Creator Research": "Video Research Command Center",
        "Media Generation": "Media Generation Command Center",
        "Finance & Market Data": "Market Data Command Center",
        "Weather & Utility Data": "Utility Data Command Center",
        "Browser & Automation": "Browser Automation Command Center",
        "Security & Audit": "Security Audit Command Center",
        "Agentic Systems": "Agent Upgrade Command Center",
        "General Utility": "Utility Command Center",
    }
    return category_default[category]


def jtbd(category: str, name: str) -> str:
    mapping = {
        "Developer": "让开发者在一条工作流里完成仓库研究、代码决策、Issue/PR 处理或开发协作。",
        "Search & Research": "让用户用一个入口更快得到可决策的检索与研究结果。",
        "Productivity & Workspace": "让用户把日常办公动作统一收进一个可复用的 command center。",
        "Office Documents": "让文档和表格操作从零散工具变成可直接调用的办公能力层。",
        "Social & Growth": "让用户在一个入口里完成研究、监控、发帖或互动增长。",
        "Video & Creator Research": "让创作者和研究者快速验证选题、竞品和内容趋势。",
        "Media Generation": "让用户用可展示、可复用的媒体生成入口快速出结果。",
        "Finance & Market Data": "让用户快速拿到可用于分析和决策的市场数据。",
        "Weather & Utility Data": "让用户直接拿到简单明确、能指导行动的实时数据。",
        "Browser & Automation": "让复杂网页操作变成可重复执行的自动化能力。",
        "Security & Audit": "让用户在高风险决策前快速得到可执行的安全判断。",
        "Agentic Systems": "让 agent 在记忆、主动性、反馈和执行上变得更强。",
        "General Utility": "把泛能力重新切成一个首轮就能显现价值的窄任务。",
    }
    return mapping[category]


def conversion_moves(category: str) -> list[str]:
    mapping = {
        "Developer": [
            "先把 skill 名字改成开发者会搜索的平台词或任务词。",
            "旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。",
            "用示例仓库和真实输出样板强化首轮成功率。",
        ],
        "Search & Research": [
            "先把能力聚焦成一个更窄的检索任务入口。",
            "同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。",
            "输出要直接给结论和来源，不要只返回原始结果。",
        ],
        "Productivity & Workspace": [
            "以 command center 方式整合办公动作。",
            "先做个人工作流，再扩团队协作和自动化套餐。",
            "发布页要强调每天都会用到的场景。",
        ],
        "Office Documents": [
            "先做 Word / Excel / PPT / PDF 的独立高意图入口。",
            "再做 Office 全家桶汇总包。",
            "突出结构化输出和批量处理能力。",
        ],
        "Social & Growth": [
            "把读、写、互动、增长拆成不同层级 skill。",
            "旗舰包负责研究 + 发布，变体包负责 engage 或监控。",
            "示例 prompt 要直接覆盖爆款选题、竞品研究和发帖链路。",
        ],
        "Video & Creator Research": [
            "把快速搜索和深度研究拆成双层入口。",
            "强调选题、竞品、趋势三类场景。",
            "准备不同国家和语言的对比样例。",
        ],
        "Media Generation": [
            "把模型能力改写成用户目标，而不是模型名堆叠。",
            "拆出图片、视频、风格、商品图等多入口变体。",
            "通过结果展示强化传播和收藏。",
        ],
        "Finance & Market Data": [
            "先做最窄的行情或研究入口。",
            "再扩成股票、加密、新闻、组合、提醒矩阵。",
            "突出实时性、可信度和专业价值。",
        ],
        "Weather & Utility Data": [
            "突出一轮内得到明确答案。",
            "把实况、预报、出行建议拆分变体。",
            "优先做调用量收费和嵌入型能力。",
        ],
        "Browser & Automation": [
            "先定义最清晰的自动化任务，不要笼统叫 automation。",
            "用 command center 包 + 单任务包组合发布。",
            "准备企业和高级用户场景，承接更高客单价。",
        ],
        "Security & Audit": [
            "让输出直接形成通过/警告/阻断决策。",
            "先占高风险安装前入口，再扩依赖、权限、合规变体。",
            "把风险解释和证据输出成结构化模板。",
        ],
        "Agentic Systems": [
            "先把抽象愿景改成具体工作流收益。",
            "同时配一组更实用的支撑技能承接流量。",
            "把‘更聪明’改成‘哪里会更强’。",
        ],
        "General Utility": [
            "先重写标题，让它更像任务而不是模糊能力。",
            "压缩功能范围，优先做一轮就见效的窄入口。",
            "通过例子找到最强搜索词再迭代。",
        ],
    }
    return mapping[category]


def priority_tier(score: float) -> str:
    if score >= 88:
        return "P0"
    if score >= 80:
        return "P1"
    if score >= 72:
        return "P2"
    return "P3"


def portfolio_role(index: int, total: int) -> str:
    if index == 0:
        return "flagship"
    if index <= 2:
        return "growth-variant"
    if index <= 5:
        return "supporting-variant"
    return "long-tail-experiment"


def normalize_ranking_entry(entry: dict[str, Any], rank: int) -> dict[str, Any]:
    skill = entry.get("skill") or {}
    owner = entry.get("owner") or {}
    stats = skill.get("stats") or {}
    slug = compact_spaces(first_non_empty(skill.get("slug"), "unknown"))
    author = compact_spaces(first_non_empty(entry.get("ownerHandle"), owner.get("handle"), "unknown"))
    name = compact_spaces(first_non_empty(skill.get("displayName"), slug))
    description = compact_spaces(first_non_empty(skill.get("summary"), ""))
    category = detect_category(name, description)
    return {
        "slug": slug,
        "author": author,
        "name": name,
        "description": description,
        "downloads": parse_int(stats.get("downloads")),
        "stars": parse_int(stats.get("stars")),
        "installsCurrent": parse_int(stats.get("installsCurrent")),
        "url": f"{BASE_URL}/{author}/{slug}",
        "category": category,
        "apiFamily": infer_api_family(category, name, description),
        "rank": rank,
    }


def fetch_ranking(sort_key: str, limit: int = TOP_N) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    cursor: str | None = None
    while len(items) < limit:
        args: dict[str, Any] = {"numItems": min(PAGE_SIZE, limit - len(items)), "sort": sort_key, "dir": "desc"}
        if cursor:
            args["cursor"] = cursor
        value = convex_query("skills:listPublicPageV4", args)
        page = value.get("page") or []
        if not page:
            break
        for entry in page:
            items.append(normalize_ranking_entry(entry, len(items) + 1))
            if len(items) >= limit:
                break
        if not value.get("hasMore") or not value.get("nextCursor"):
            break
        cursor = value["nextCursor"]
    return items


def load_catalog() -> dict[str, Any]:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def repo_local_packages() -> list[dict[str, Any]]:
    root = Path("packages/source-optimized")
    items = []
    for skill_path in sorted(root.glob("*/*/SKILL.md")):
        owner = skill_path.parts[-3]
        slug = skill_path.parts[-2]
        items.append({"owner": owner, "slug": slug, "path": str(skill_path)})
    return items


def fetch_owner_portfolio(handle: str) -> list[dict[str, Any]]:
    try:
        user = convex_query("users:getByHandle", {"handle": handle}, retries=3)
        if user and user.get("_id"):
            items = convex_query("skills:list", {"ownerUserId": user["_id"], "limit": 100}, retries=3)
            if isinstance(items, list):
                results = []
                for item in items:
                    skill = item.get("skill") or item
                    stats = item.get("stats") or skill.get("stats") or {}
                    slug = compact_spaces(first_non_empty(skill.get("slug"), item.get("slug"), "unknown"))
                    name = compact_spaces(first_non_empty(skill.get("displayName"), skill.get("name"), item.get("name"), slug))
                    description = compact_spaces(first_non_empty(skill.get("summary"), item.get("summary"), ""))
                    category = detect_category(name, description)
                    results.append(
                        {
                            "slug": slug,
                            "name": name,
                            "description": description,
                            "downloads": parse_int(first_non_empty(stats.get("downloads"), skill.get("downloads"), item.get("downloads"))),
                            "stars": parse_int(first_non_empty(stats.get("stars"), skill.get("stars"), item.get("stars"))),
                            "installsCurrent": parse_int(
                                first_non_empty(stats.get("installsCurrent"), skill.get("installsCurrent"), item.get("installsCurrent"))
                            ),
                            "category": category,
                            "apiFamily": infer_api_family(category, name, description),
                        }
                    )
                return results
    except Exception:
        pass
    return []


def build_existing_aisa_plan() -> dict[str, Any]:
    catalog = load_catalog()
    catalog_items = catalog["items"]
    owner_handles = sorted({item["owner"].lower() for item in catalog_items if item.get("usesAisaApi")})
    live_by_owner = {owner: fetch_owner_portfolio(owner) for owner in owner_handles}
    live_index = {(owner, item["slug"]): item for owner, items in live_by_owner.items() for item in items}

    repo_locals = repo_local_packages()
    repo_local_index = {(item["owner"].lower(), item["slug"]): item for item in repo_locals}

    plans = []
    seen: set[tuple[str, str]] = set()
    for item in catalog_items:
        if not item.get("usesAisaApi"):
            continue
        owner = item["owner"].lower()
        slug = item["clawhubUrl"].rstrip("/").split("/")[-1]
        key = (owner, slug)
        seen.add(key)
        live = live_index.get(key, {})
        name = compact_spaces(first_non_empty(live.get("name"), item.get("name"), slug))
        description = compact_spaces(first_non_empty(live.get("description"), item.get("description"), item.get("readmeSnippet"), ""))
        category = detect_category(name, description)
        downloads = parse_int(first_non_empty(live.get("downloads"), item.get("downloads")))
        stars = parse_int(first_non_empty(live.get("stars"), item.get("stars")))
        installs = parse_int(first_non_empty(live.get("installsCurrent"), 0))
        popularity = min(100.0, downloads / 50.0 + stars * 3 + installs * 5)
        fit = fit_score(category)
        monetization = monetization_score(category)
        factory = factory_score(category)
        priority = round(0.35 * fit + 0.20 * monetization + 0.20 * factory + 0.25 * popularity, 2)
        plans.append(
            {
                "owner": owner,
                "slug": slug,
                "name": name,
                "description": description,
                "downloads": downloads,
                "stars": stars,
                "installsCurrent": installs,
                "category": category,
                "apiFamily": infer_api_family(category, name, description),
                "targetTitle": target_title(category, name),
                "targetJTBD": jtbd(category, name),
                "priorityScore": priority,
                "priorityTier": priority_tier(priority),
                "summary": category_summary(category),
                "moves": conversion_moves(category),
                "source": "catalog",
                "repoLocalPackage": key in repo_local_index,
                "clawhubUrl": item.get("clawhubUrl"),
            }
        )

    for key, repo_item in repo_local_index.items():
        if key in seen:
            continue
        owner, slug = key
        live = live_index.get(key, {})
        name = compact_spaces(first_non_empty(live.get("name"), slug.replace("-", " ").title()))
        description = compact_spaces(first_non_empty(live.get("description"), "Repo-local optimized package"))
        category = detect_category(name, description)
        fit = fit_score(category)
        monetization = monetization_score(category)
        factory = factory_score(category)
        priority = round(0.45 * fit + 0.25 * monetization + 0.30 * factory, 2)
        plans.append(
            {
                "owner": owner,
                "slug": slug,
                "name": name,
                "description": description,
                "downloads": parse_int(live.get("downloads")),
                "stars": parse_int(live.get("stars")),
                "installsCurrent": parse_int(live.get("installsCurrent")),
                "category": category,
                "apiFamily": infer_api_family(category, name, description),
                "targetTitle": target_title(category, name),
                "targetJTBD": jtbd(category, name),
                "priorityScore": priority,
                "priorityTier": priority_tier(priority),
                "summary": category_summary(category),
                "moves": conversion_moves(category),
                "source": "repo-local",
                "repoLocalPackage": True,
                "clawhubUrl": f"{BASE_URL}/{owner}/{slug}",
            }
        )

    plans.sort(key=lambda item: (-item["priorityScore"], -item["downloads"], -item["installsCurrent"], item["owner"], item["slug"]))
    by_owner: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in plans:
        by_owner[item["owner"]].append(item)
    for owner, items in by_owner.items():
        for index, item in enumerate(items):
            item["portfolioRole"] = portfolio_role(index, len(items))
    summary = {
        "totalAisaSkillsPlanned": len(plans),
        "ownerBreakdown": {owner: len(items) for owner, items in by_owner.items()},
        "categoryBreakdown": dict(Counter(item["category"] for item in plans)),
        "topPriorities": plans[:20],
    }
    return {"generatedAt": datetime.now(timezone.utc).isoformat(), "summary": summary, "skills": plans}


def build_top200_conversion_plan(catalog_index: dict[tuple[str, str], dict[str, Any]]) -> dict[str, Any]:
    rankings = {sort_key: fetch_ranking(sort_key, TOP_N) for sort_key in ["downloads", "stars", "installs"]}
    union: dict[tuple[str, str], dict[str, Any]] = {}
    for sort_key, items in rankings.items():
        for item in items:
            key = (item["author"].lower(), item["slug"])
            row = union.setdefault(
                key,
                {
                    **item,
                    "ranks": {},
                    "appearances": 0,
                    "compositeScore": 0,
                    "alreadyAisaKnown": key in catalog_index,
                },
            )
            row["ranks"][sort_key] = item["rank"]
            row["downloads"] = max(row["downloads"], item["downloads"])
            row["stars"] = max(row["stars"], item["stars"])
            row["installsCurrent"] = max(row["installsCurrent"], item["installsCurrent"])
            row["appearances"] = len(row["ranks"])
            row["compositeScore"] += TOP_N + 1 - item["rank"]

    union_items = list(union.values())
    for item in union_items:
        popularity = (item["compositeScore"] / (TOP_N * 3)) * 100
        fit = fit_score(item["category"])
        monetization = monetization_score(item["category"])
        factory = factory_score(item["category"])
        convert_score = round(0.25 * popularity + 0.30 * fit + 0.25 * monetization + 0.20 * factory, 2)
        item["aisaFitScore"] = fit
        item["monetizationScore"] = monetization
        item["factoryScore"] = factory
        item["popularityScore"] = round(popularity, 2)
        item["aisaConversionScore"] = convert_score
        item["targetTitle"] = target_title(item["category"], item["name"])
        item["targetJTBD"] = jtbd(item["category"], item["name"])
        item["apiFamily"] = infer_api_family(item["category"], item["name"], item["description"])
        item["summary"] = category_summary(item["category"])
        item["moves"] = conversion_moves(item["category"])
        item["priorityTier"] = priority_tier(convert_score)

    suitable = [item for item in union_items if item["aisaFitScore"] >= 80 and not item["alreadyAisaKnown"]]
    suitable.sort(
        key=lambda item: (-item["aisaConversionScore"], -item["appearances"], -item["compositeScore"], item["name"].lower())
    )
    top100 = suitable[:100]
    summary = {
        "rankingSources": RANKING_URLS,
        "topNPerRanking": TOP_N,
        "uniqueSkillsAcrossThreeTop200": len(union_items),
        "suitableNonAisaCandidates": len(suitable),
        "categoryBreakdownAll": dict(Counter(item["category"] for item in union_items)),
        "categoryBreakdownSuitable": dict(Counter(item["category"] for item in suitable)),
        "top100Categories": dict(Counter(item["category"] for item in top100)),
    }
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "rankings": {key: value[:20] for key, value in rankings.items()},
        "allUnion": sorted(union_items, key=lambda item: (-item["appearances"], -item["compositeScore"], item["name"].lower())),
        "top100Candidates": top100,
    }


def paragraph_xml(text: str) -> str:
    safe = text if text else " "
    return f"<w:p><w:r><w:t xml:space=\"preserve\">{escape(safe)}</w:t></w:r></w:p>"


def write_docx(path: Path, paragraphs: list[str]) -> None:
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
    body = "".join(paragraph_xml(line) for line in paragraphs)
    document = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {body}
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


def md_table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return lines


def build_aisa_markdown(payload: dict[str, Any], history: str) -> str:
    skills = payload["skills"]
    summary = payload["summary"]
    owner_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in skills:
        owner_groups[item["owner"]].append(item)
    lines: list[str] = []
    lines.append("# AISA 全量 Skills 爆款改造计划")
    lines.append("")
    lines.append(f"- 生成时间：{payload['generatedAt']}")
    lines.append(f"- 规划范围：{summary['totalAisaSkillsPlanned']} 个现有 AISA skills / repo-local AISA 包")
    lines.append("")
    lines.append("## 一、压缩结论")
    lines.extend(history.strip().splitlines()[:24])
    lines.append("")
    lines.append("## 二、总体判断")
    lines.extend(
        [
            "- 现有 AISA skills 的问题不是能力少，而是标题、入口分层、矩阵关系和首轮成功路径不够强。",
            "- 需要把技能集从“平铺发布”改成“旗舰包 + 变体包 + 中文镜像包 + API 收益层”。",
            "- 先做强入口，再做广覆盖；先拿安装和心智，再拿长尾变体。",
        ]
    )
    lines.append("")
    lines.append("## 三、按优先级看的全量改造顺序")
    lines.extend(
        md_table(
            ["优先级", "Owner", "Skill", "分类", "目标标题", "作品集角色"],
            [
                [
                    item["priorityTier"],
                    item["owner"],
                    item["name"],
                    item["category"],
                    item["targetTitle"],
                    item["portfolioRole"],
                ]
                for item in skills[:25]
            ],
        )
    )
    lines.append("")
    lines.append("## 四、按 Owner 的爆款改造策略")
    for owner, items in sorted(owner_groups.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        lines.append("")
        lines.append(f"### @{owner}")
        lines.append(f"- 当前纳入规划数量：{len(items)}")
        lines.append(f"- 最强入口：{items[0]['name']} -> {items[0]['targetTitle']}")
        lines.append(f"- 作品集判断：{items[0]['summary']}")
        lines.append("- 改造策略：")
        lines.extend(f"  - {move}" for move in items[0]["moves"])
        lines.append("- 该 owner 的优先 skill：")
        for skill in items[:5]:
            lines.append(
                f"  - {skill['name']} | {skill['category']} | {skill['priorityTier']} | 目标：{skill['targetTitle']}"
            )
    lines.append("")
    lines.append("## 五、全量 AISA skills 的共性改造动作")
    lines.extend(
        [
            "- 所有 skill 都要先重写成高意图任务名，而不是内部技术名。",
            "- 所有 skill 都要明确旗舰包和变体包，不再全部用同一级别包装。",
            "- 所有 skill 都要补充首轮成功样例、明显的升级路径和中文镜像。",
            "- 相同家族要统一命名体系，避免互相抢搜索词。",
        ]
    )
    lines.append("")
    lines.append("## 六、附录：全部 AISA skills 改造表")
    lines.extend(
        md_table(
            ["Owner", "Skill", "下载", "星标", "安装", "分类", "优先级", "目标标题", "角色"],
            [
                [
                    item["owner"],
                    item["name"],
                    str(item["downloads"]),
                    str(item["stars"]),
                    str(item["installsCurrent"]),
                    item["category"],
                    item["priorityTier"],
                    item["targetTitle"],
                    item["portfolioRole"],
                ]
                for item in skills
            ],
        )
    )
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def build_top200_markdown(payload: dict[str, Any]) -> str:
    summary = payload["summary"]
    top100 = payload["top100Candidates"]
    lines: list[str] = []
    lines.append("# ClawHub 三榜 Top 200 AISA 改造机会报告")
    lines.append("")
    lines.append(f"- 生成时间：{payload['generatedAt']}")
    lines.append(f"- 数据来源：{RANKING_URLS['downloads']}、{RANKING_URLS['stars']}、{RANKING_URLS['installs']}")
    lines.append(f"- 分析范围：downloads / stars / installs 各 Top {TOP_N}")
    lines.append("")
    lines.append("## 一、结论")
    lines.extend(
        [
            f"- 三榜 Top 200 合并后共得到 {summary['uniqueSkillsAcrossThreeTop200']} 个唯一 skill。",
            f"- 其中适合改造成非 AISA -> AISA 的候选共有 {summary['suitableNonAisaCandidates']} 个。",
            "- 最适合 AISA 的大类依次是：Search、Developer、Workspace、Office、Browser Automation、Finance、Social、Security。",
            "- 真正值得优先做的不是所有热门 skill，而是那些既热门、又能被 API 化、还能拆成作品集矩阵的 skill。",
        ]
    )
    lines.append("")
    lines.append("## 二、分类结果")
    lines.extend(
        md_table(
            ["分类", "三榜 Top 200 合并数", "适合转 AISA 数", "判断"],
            [
                [
                    category,
                    str(summary["categoryBreakdownAll"].get(category, 0)),
                    str(summary["categoryBreakdownSuitable"].get(category, 0)),
                    category_summary(category),
                ]
                for category in sorted(summary["categoryBreakdownAll"].keys(), key=lambda c: (-summary["categoryBreakdownSuitable"].get(c, 0), -summary["categoryBreakdownAll"].get(c, 0), c))
            ],
        )
    )
    lines.append("")
    lines.append("## 三、最适合改造成 AISA 的前 100 个候选")
    lines.extend(
        md_table(
            ["排名", "Skill", "作者", "分类", "改造分", "目标标题", "目标 API 家族"],
            [
                [
                    str(index + 1),
                    item["name"],
                    item["author"],
                    item["category"],
                    str(item["aisaConversionScore"]),
                    item["targetTitle"],
                    item["apiFamily"],
                ]
                for index, item in enumerate(top100)
            ],
        )
    )
    lines.append("")
    lines.append("## 四、Top 20 候选的爆款改造打法")
    for item in top100[:20]:
        lines.append("")
        lines.append(f"### {item['name']} | @{item['author']}")
        lines.append(
            f"- 热度表现：appearances {item['appearances']}，downloads {item['downloads']}，stars {item['stars']}，installs {item['installsCurrent']}。"
        )
        lines.append(f"- 适合转 AISA 的原因：{item['summary']}")
        lines.append(f"- 目标标题：{item['targetTitle']}")
        lines.append(f"- 目标 JTBD：{item['targetJTBD']}")
        lines.append("- 改造动作：")
        lines.extend(f"  - {move}" for move in item["moves"])
    lines.append("")
    lines.append("## 五、前 100 改造计划的实施顺序")
    lines.extend(
        [
            "- 第 1 波：前 10 名，做旗舰包和样板案例。",
            "- 第 2 波：11-40 名，做同家族变体包和中文镜像。",
            "- 第 3 波：41-100 名，按行业、地区、细分人群继续扩张。",
            "- 每一波都要优先做可 API 化的高价值入口，再做长尾实验。",
        ]
    )
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def write_outputs(json_path: Path, md_path: Path, public_md_path: Path, docx_path: Path, public_docx_path: Path, payload: dict[str, Any], markdown: str) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    public_md_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(markdown, encoding="utf-8")
    public_md_path.write_text(markdown, encoding="utf-8")
    write_docx(docx_path, markdown.splitlines())
    write_docx(public_docx_path, markdown.splitlines())


def main() -> None:
    catalog = load_catalog()
    catalog_index = {(item["owner"].lower(), item["clawhubUrl"].rstrip("/").split("/")[-1]): item for item in catalog["items"]}
    history = HISTORY_PATH.read_text(encoding="utf-8") if HISTORY_PATH.exists() else ""

    aisa_payload = build_existing_aisa_plan()
    aisa_markdown = build_aisa_markdown(aisa_payload, history)
    write_outputs(AISA_PLAN_JSON, AISA_PLAN_MD, AISA_PLAN_PUBLIC_MD, AISA_PLAN_DOCX, AISA_PLAN_PUBLIC_DOCX, aisa_payload, aisa_markdown)

    top200_payload = build_top200_conversion_plan(catalog_index)
    top200_markdown = build_top200_markdown(top200_payload)
    write_outputs(TOP200_PLAN_JSON, TOP200_PLAN_MD, TOP200_PLAN_PUBLIC_MD, TOP200_PLAN_DOCX, TOP200_PLAN_PUBLIC_DOCX, top200_payload, top200_markdown)

    print(f"Wrote {AISA_PLAN_JSON} and {TOP200_PLAN_JSON}")


if __name__ == "__main__":
    main()
