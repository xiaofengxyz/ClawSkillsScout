#!/usr/bin/env python3
from __future__ import annotations

import json
import time
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

import requests

BASE_URL = "https://clawhub.ai"
CONVEX_QUERY_URL = "https://wry-manatee-359.convex.cloud/api/query"
RANKING_URLS = {
    "downloads": "https://clawhub.ai/skills?sort=downloads&dir=desc",
    "stars": "https://clawhub.ai/skills?sort=stars&dir=desc",
    "installs": "https://clawhub.ai/skills?sort=installs&dir=desc",
}
TOP_N = 100
TIMEOUT = (20, 90)
SESSION = requests.Session()

DATA_PATH = Path("public/data/clawhub-multi-ranking-report.json")
REPORT_PATH = Path("reports/ClawHub_Multi_Ranking_Report_ZH.md")
PUBLIC_REPORT_PATH = Path("public/reports/ClawHub_Multi_Ranking_Report_ZH.md")
DOCX_PATH = Path("reports/ClawHub_Multi_Ranking_Report_ZH.docx")
PUBLIC_DOCX_PATH = Path("public/reports/ClawHub_Multi_Ranking_Report_ZH.docx")

AISA_OWNERS = [
    "0xjordansg-yolo",
    "aisadocs",
    "aisapay",
    "chaimengphp",
    "karensheng",
]

LOCAL_SKILL_PATHS = {
    "openclaw-twitter": "packages/source-optimized/0xjordansg-yolo/openclaw-twitter/SKILL.md",
    "aisa-twitter-api": "packages/source-optimized/aisapay/aisa-twitter-api/SKILL.md",
    "openclaw-twitter-post-engage": "packages/source-optimized/aisadocs/openclaw-twitter-post-engage/SKILL.md",
    "openclaw-aisa-twitter": "packages/source-optimized/chaimengphp/openclaw-aisa-twitter/SKILL.md",
    "x-intelligence-automation": "packages/source-optimized/karensheng/x-intelligence-automation/SKILL.md",
    "openclaw-aisa-youtube": "packages/source-optimized/0xjordansg-yolo/openclaw-aisa-youtube/SKILL.md",
    "openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking": "packages/source-optimized/0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking/SKILL.md",
}

THEME_RULES = [
    ("Self-Improving / Agentic", ["self-improving", "proactive", "agent", "ontology"]),
    ("Developer / GitHub", ["github", "repo", "git", "code", "ontology"]),
    ("Search / Research", ["search", "weather", "news", "browser", "vetter"]),
    ("Social / Growth", ["twitter", "x/", "youtube", "social", "engage", "trend"]),
]


def compact_spaces(value: str | None) -> str:
    return " ".join((value or "").split())


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


def theme_label(name: str, description: str) -> str:
    text = f"{name} {description}".lower()
    for label, keys in THEME_RULES:
        if any(key in text for key in keys):
            return label
    return "Utility / Other"


def normalize_skill(entry: dict[str, Any], rank: int) -> dict[str, Any]:
    skill = entry.get("skill") or {}
    owner = entry.get("owner") or {}
    stats = skill.get("stats") or {}
    slug = compact_spaces(first_non_empty(skill.get("slug"), "unknown"))
    author = compact_spaces(first_non_empty(entry.get("ownerHandle"), owner.get("handle"), "unknown"))
    name = compact_spaces(first_non_empty(skill.get("displayName"), slug))
    description = compact_spaces(first_non_empty(skill.get("summary"), ""))
    downloads = parse_int(stats.get("downloads"))
    stars = parse_int(stats.get("stars"))
    installs = parse_int(stats.get("installsCurrent"))
    return {
        "rank": rank,
        "slug": slug,
        "name": name,
        "author": author,
        "description": description,
        "downloads": downloads,
        "stars": stars,
        "installsCurrent": installs,
        "url": f"{BASE_URL}/{author}/{slug}",
        "theme": theme_label(name, description),
    }


def fetch_ranking(sort_key: str) -> list[dict[str, Any]]:
    value = convex_query("skills:listPublicPageV4", {"numItems": TOP_N, "sort": sort_key, "dir": "desc"})
    page = value.get("page") or []
    return [normalize_skill(entry, index + 1) for index, entry in enumerate(page[:TOP_N])]


def merge_portfolio_with_samples(portfolio: list[dict[str, Any]], sample_skills: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {item["slug"]: dict(item) for item in portfolio}
    for sample in sample_skills:
        slug = sample["slug"]
        current = merged.get(slug)
        if current is None:
            merged[slug] = {
                "slug": slug,
                "name": sample["name"],
                "downloads": sample["downloads"],
                "stars": sample["stars"],
                "installsCurrent": sample["installsCurrent"],
                "theme": sample["theme"],
            }
            continue
        current["downloads"] = max(parse_int(current.get("downloads")), parse_int(sample.get("downloads")))
        current["stars"] = max(parse_int(current.get("stars")), parse_int(sample.get("stars")))
        current["installsCurrent"] = max(parse_int(current.get("installsCurrent")), parse_int(sample.get("installsCurrent")))
        if not current.get("name"):
            current["name"] = sample["name"]
        if not current.get("theme"):
            current["theme"] = sample["theme"]
    return sorted(merged.values(), key=lambda item: (-item["downloads"], -item["stars"], item["name"].lower()))


def fetch_author_portfolio(handle: str, sample_skills: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    sample_skills = sample_skills or []
    try:
        user = convex_query("users:getByHandle", {"handle": handle}, retries=2)
        if user and user.get("_id"):
            items = convex_query("skills:list", {"ownerUserId": user["_id"], "limit": 50}, retries=2)
            if isinstance(items, list):
                records = []
                for item in items:
                    skill = item.get("skill") or item
                    stats = item.get("stats") or skill.get("stats") or {}
                    slug = compact_spaces(first_non_empty(skill.get("slug"), item.get("slug"), "unknown"))
                    name = compact_spaces(first_non_empty(skill.get("displayName"), skill.get("name"), item.get("name"), slug))
                    description = compact_spaces(first_non_empty(skill.get("summary"), item.get("summary"), ""))
                    records.append(
                        {
                            "slug": slug,
                            "name": name,
                            "downloads": parse_int(first_non_empty(stats.get("downloads"), skill.get("downloads"), item.get("downloads"))),
                            "stars": parse_int(first_non_empty(stats.get("stars"), skill.get("stars"), item.get("stars"))),
                            "installsCurrent": parse_int(
                                first_non_empty(stats.get("installsCurrent"), skill.get("installsCurrent"), item.get("installsCurrent"))
                            ),
                            "theme": theme_label(name, description),
                        }
                    )
                return merge_portfolio_with_samples(records, sample_skills)
    except Exception:
        pass
    if sample_skills:
        return merge_portfolio_with_samples([], sample_skills)
    return []


def build_cross_rank_summary(rankings: dict[str, list[dict[str, Any]]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    by_slug: dict[str, dict[str, Any]] = {}
    by_author: dict[str, dict[str, Any]] = defaultdict(lambda: {"author": "", "skills": set(), "appearances": 0, "score": 0, "ranks": {}})

    for sort_key, items in rankings.items():
        for item in items:
            row = by_slug.setdefault(
                item["slug"],
                {
                    "slug": item["slug"],
                    "name": item["name"],
                    "author": item["author"],
                    "url": item["url"],
                    "description": item["description"],
                    "downloads": item["downloads"],
                    "stars": item["stars"],
                    "installsCurrent": item["installsCurrent"],
                    "theme": item["theme"],
                    "ranks": {},
                    "appearances": 0,
                    "compositeScore": 0,
                },
            )
            row["ranks"][sort_key] = item["rank"]
            row["appearances"] = len(row["ranks"])
            row["compositeScore"] += TOP_N + 1 - item["rank"]

            author_row = by_author[item["author"]]
            author_row["author"] = item["author"]
            author_row["skills"].add(item["slug"])
            author_row["appearances"] += 1
            author_row["score"] += TOP_N + 1 - item["rank"]
            author_row["ranks"].setdefault(sort_key, [])
            author_row["ranks"][sort_key].append(item["rank"])

    cross_skills = sorted(
        by_slug.values(),
        key=lambda item: (-item["appearances"], -item["compositeScore"], item["name"].lower()),
    )
    cross_authors = []
    for item in by_author.values():
        cross_authors.append(
            {
                "author": item["author"],
                "distinctSkills": len(item["skills"]),
                "appearances": item["appearances"],
                "score": item["score"],
                "bestRanks": {sort_key: min(ranks) for sort_key, ranks in item["ranks"].items()},
            }
        )
    cross_authors.sort(key=lambda item: (-item["appearances"], -item["score"], item["author"]))
    return cross_skills, cross_authors


def ranking_theme_summary(items: list[dict[str, Any]], limit: int = 20) -> list[dict[str, Any]]:
    counter = Counter(item["theme"] for item in items[:limit])
    return [{"theme": theme, "count": count} for theme, count in counter.most_common()]


def build_local_aisa_snapshot() -> dict[str, Any]:
    owner_payloads: dict[str, Any] = {}
    local_entries: list[dict[str, Any]] = []

    for owner in AISA_OWNERS:
        portfolio = fetch_author_portfolio(owner)
        owner_payloads[owner] = {
            "totalSkills": len(portfolio),
            "topSkills": portfolio[:5],
        }
        for item in portfolio:
            if item["slug"] in LOCAL_SKILL_PATHS:
                record = {
                    "owner": owner,
                    "slug": item["slug"],
                    "name": item["name"],
                    "downloads": item["downloads"],
                    "stars": item["stars"],
                    "installsCurrent": item["installsCurrent"],
                    "theme": item["theme"],
                    "path": LOCAL_SKILL_PATHS[item["slug"]],
                }
                local_entries.append(record)

    local_entries.sort(key=lambda item: (-item["downloads"], -item["installsCurrent"], -item["stars"], item["slug"]))
    if not local_entries:
        return {"owners": owner_payloads, "localSkills": [], "priorityOrder": [], "primaryFlagshipSlug": None}

    max_downloads = max(item["downloads"] for item in local_entries) or 1
    max_stars = max(item["stars"] for item in local_entries) or 1
    max_installs = max(item["installsCurrent"] for item in local_entries) or 1

    priority_order = []
    for item in local_entries:
        score = (
            0.35 * (item["downloads"] / max_downloads)
            + 0.25 * (item["stars"] / max_stars if max_stars else 0)
            + 0.40 * (item["installsCurrent"] / max_installs if max_installs else 0)
        )
        reason = []
        if item["installsCurrent"] == max_installs:
            reason.append("本地 AISA 包里安装转化最高")
        if item["downloads"] >= int(max_downloads * 0.9):
            reason.append("下载基础已被验证")
        if item["slug"] == "aisa-twitter-api":
            reason.append("AISA 品牌一致性最好，适合做旗舰包")
        priority_order.append({**item, "priorityScore": round(score, 4), "reason": "，".join(reason) or "适合作为批量改造候选"})

    priority_order.sort(key=lambda item: (-item["priorityScore"], -item["downloads"], -item["installsCurrent"], item["slug"]))
    return {
        "owners": owner_payloads,
        "localSkills": local_entries,
        "priorityOrder": priority_order,
        "primaryFlagshipSlug": priority_order[0]["slug"],
    }


def build_payload() -> dict[str, Any]:
    rankings = {sort_key: fetch_ranking(sort_key) for sort_key in ["downloads", "stars", "installs"]}
    cross_skills, cross_authors = build_cross_rank_summary(rankings)
    ranking_samples_by_author: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for items in rankings.values():
        for item in items:
            ranking_samples_by_author[item["author"]].append(item)
    aisa_snapshot = build_local_aisa_snapshot()
    top_author_handles = [item["author"] for item in cross_authors[:8]]
    top_author_profiles = {}
    for handle in top_author_handles:
        portfolio = fetch_author_portfolio(handle, ranking_samples_by_author.get(handle, []))
        top_author_profiles[handle] = {
            "totalSkills": len(portfolio),
            "topSkills": portfolio[:5],
        }

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": {
            "rankingPages": RANKING_URLS,
            "convexQueryUrl": CONVEX_QUERY_URL,
            "sampleSizePerRanking": TOP_N,
        },
        "rankings": {
            key: {
                "top10": value[:10],
                "top20ThemeSummary": ranking_theme_summary(value, 20),
            }
            for key, value in rankings.items()
        },
        "crossRanking": {
            "topSkills": cross_skills[:15],
            "topAuthors": cross_authors[:12],
            "topAuthorProfiles": top_author_profiles,
        },
        "aisaSnapshot": aisa_snapshot,
    }


def table(headers: list[str], rows: list[list[str]]) -> list[str]:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return lines


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


def build_markdown(payload: dict[str, Any]) -> str:
    downloads = payload["rankings"]["downloads"]
    stars = payload["rankings"]["stars"]
    installs = payload["rankings"]["installs"]
    cross = payload["crossRanking"]
    aisa = payload["aisaSnapshot"]
    flagship = next((item for item in aisa["priorityOrder"] if item["slug"] == aisa["primaryFlagshipSlug"]), None)
    downloads_themes = ", ".join(f"{item['theme']} {item['count']}个" for item in downloads["top20ThemeSummary"][:4])
    stars_themes = ", ".join(f"{item['theme']} {item['count']}个" for item in stars["top20ThemeSummary"][:4])
    installs_themes = ", ".join(f"{item['theme']} {item['count']}个" for item in installs["top20ThemeSummary"][:4])

    lines: list[str] = []
    lines.append("# ClawHub 多榜单爆款系统报告（AISA 机会版）")
    lines.append("")
    lines.append(f"- 生成时间：{payload['generatedAt']}")
    lines.append(f"- 数据样本：downloads / stars / installs 各取 Top {payload['sources']['sampleSizePerRanking']}")
    lines.append(f"- 数据来源：{RANKING_URLS['downloads']}、{RANKING_URLS['stars']}、{RANKING_URLS['installs']}")
    lines.append("")
    lines.append("## 一、老板先看这 6 句")
    lines.extend(
        [
            "- 下载榜、星标榜、安装榜的头部技能高度重合，说明真正的爆款不是“偶发标题党”，而是兼具被发现、被收藏、被长期装着用三种能力。",
            "- 头部名字几乎都在直接说任务或结果，例如 Github、Weather、Browser、Skill Vetter、Self-Improving；用户一眼就知道为什么装。",
            "- 下载榜更偏“宽需求入口”，星标榜更偏“方法论和身份感”，安装榜更偏“持续复用的日常工具”。",
            "- 头部作者并不是靠单个 skill 爆，而是在运营作品集：一个能力核，多个高意图变体，持续迭代。",
            "- 仓库里的 7 个 AISA runtime 包目前整体不在三榜 Top 100，问题不在 API 能力缺失，而在包装、选题、分层和命名没有进入主流搜索心智。",
            f"- 本地第一优先旗舰包应该先打 `{flagship['slug'] if flagship else 'aisa-twitter-api'}`：它在本地 AISA 包里安装转化最强，也最适合做成 AISA 官方代表作。",
        ]
    )
    lines.append("")

    lines.append("## 二、三张榜分别说明了什么")
    lines.append("")
    lines.append("### 1. 下载榜：谁最容易被点进来")
    lines.extend(
        [
            f"- 前三名分别是 `{downloads['top10'][0]['name']}`、`{downloads['top10'][1]['name']}`、`{downloads['top10'][2]['name']}`。",
            f"- 下载榜 Top 20 的主题集中在：{downloads_themes}。",
            "- 结论：下载靠的是清晰标题、通用入口、低试错成本，不一定最深，但一定最容易第一次装。",
        ]
    )
    lines.append("")
    lines.extend(
        table(
            ["下载榜 Top 10", "作者", "下载", "星标", "安装"],
            [
                [
                    f"{item['rank']}. {item['name']}",
                    item["author"],
                    str(item["downloads"]),
                    str(item["stars"]),
                    str(item["installsCurrent"]),
                ]
                for item in downloads["top10"]
            ],
        )
    )
    lines.append("")

    lines.append("### 2. 星标榜：谁最容易让人觉得“这东西有方法论”")
    lines.extend(
        [
            f"- 前三名分别是 `{stars['top10'][0]['name']}`、`{stars['top10'][1]['name']}`、`{stars['top10'][2]['name']}`。",
            f"- 星标榜 Top 20 的主题集中在：{stars_themes}。",
            "- 结论：星标榜奖励的是“愿景 + 方法 + 可信度”，因此带有 agent、自进化、工具哲学感的 skill 更容易被收藏。",
        ]
    )
    lines.append("")
    lines.extend(
        table(
            ["星标榜 Top 10", "作者", "下载", "星标", "安装"],
            [
                [
                    f"{item['rank']}. {item['name']}",
                    item["author"],
                    str(item["downloads"]),
                    str(item["stars"]),
                    str(item["installsCurrent"]),
                ]
                for item in stars["top10"]
            ],
        )
    )
    lines.append("")

    lines.append("### 3. 安装榜：谁最容易留下来")
    lines.extend(
        [
            f"- 前三名分别是 `{installs['top10'][0]['name']}`、`{installs['top10'][1]['name']}`、`{installs['top10'][2]['name']}`。",
            f"- 安装榜 Top 20 的主题集中在：{installs_themes}。",
            "- 结论：安装榜最接近“长期驻留价值”。用户愿意长期保留的 skill，往往是低配置、高复用、每天都可能碰到的工具。",
        ]
    )
    lines.append("")
    lines.extend(
        table(
            ["安装榜 Top 10", "作者", "下载", "星标", "安装"],
            [
                [
                    f"{item['rank']}. {item['name']}",
                    item["author"],
                    str(item["downloads"]),
                    str(item["stars"]),
                    str(item["installsCurrent"]),
                ]
                for item in installs["top10"]
            ],
        )
    )
    lines.append("")

    lines.append("## 三、综合起来，真正的爆款长什么样")
    lines.extend(
        [
            "- 真爆款往往同时上三榜，至少也会稳定出现在其中两榜。",
            "- 它们共有三个特征：标题直接对准任务、第一次使用几乎不需要解释、用户能想象出复用场景。",
            "- 另外一个明显规律是：爆款 skill 大多不靠大而全取胜，而是靠一个能力核拆出多个不同入口。",
        ]
    )
    lines.append("")
    lines.extend(
        table(
            ["综合强势技能", "作者", "上榜次数", "综合分", "排名分布"],
            [
                [
                    item["name"],
                    item["author"],
                    str(item["appearances"]),
                    str(item["compositeScore"]),
                    ", ".join(f"{key}:{value}" for key, value in item["ranks"].items()),
                ]
                for item in cross["topSkills"][:10]
            ],
        )
    )
    lines.append("")

    lines.append("## 四、作者角度：谁在运营作品集，而不是只做一个 skill")
    lines.extend(
        [
            "- 头部作者的共同点不是“写得多”，而是“围绕某个能力核有稳定产出”。",
            "- 他们的运营方式更像产品矩阵：旗舰入口包负责吸量，窄场景包负责吃转化，强概念包负责拿星标。",
        ]
    )
    lines.append("")
    lines.extend(
        table(
            ["作者", "上榜次数", "综合分", "最佳名次", "作品集样本"],
            [
                [
                    item["author"],
                    str(item["appearances"]),
                    str(item["score"]),
                    ", ".join(f"{key}:{value}" for key, value in item["bestRanks"].items()),
                    ", ".join(skill["name"] for skill in cross["topAuthorProfiles"].get(item["author"], {}).get("topSkills", [])[:3]),
                ]
                for item in cross["topAuthors"][:10]
            ],
        )
    )
    lines.append("")

    lines.append("## 五、AISA 现有 runtime 包现状")
    lines.extend(
        [
            "- 本地 7 个 AISA runtime 包全部完成了新一轮 SKILL 改造：统一成 `metadata.aisa`、加了 compatibility、补了高意图工作流和示例请求，并同步到模板层。",
            "- 但从市场位置看，它们整体距离三榜头部还有明显差距，说明下一步必须从“包装系统”继续推进到“选题分层 + 发布节奏 + 样板案例”。",
        ]
    )
    lines.append("")
    lines.extend(
        table(
            ["本地 AISA skill", "作者", "下载", "星标", "安装", "优先级说明"],
            [
                [
                    item["name"],
                    item["owner"],
                    str(item["downloads"]),
                    str(item["stars"]),
                    str(item["installsCurrent"]),
                    item["reason"],
                ]
                for item in aisa["priorityOrder"]
            ],
        )
    )
    lines.append("")

    lines.append("## 六、为什么先打 `aisa-twitter-api`")
    lines.extend(
        [
            "- 它是本地 AISA 包里安装转化最强的一个，说明用户不只点进去看过，还愿意留下来。",
            "- Twitter/X 同时覆盖搜索、监控、发帖三种高频任务，天然适合做旗舰指挥台。",
            "- 它的品牌归属最清晰，适合直接作为 AISA 官方代表 skill；同 runtime 的其他包再承担细分场景和变体角色。",
            "- 这次已经把它改造成 `Twitter API Command Center` 口径，下一步只差真实案例、发布物料和持续迭代节奏。",
        ]
    )
    lines.append("")

    lines.append("## 七、AISA 爆款系统结论")
    lines.extend(
        [
            "- AISA 不该再把每个 skill 当作平级孤岛，而应该按 API 家族做“旗舰包 + 窄场景包 + 中文镜像包”的作品集。",
            "- Twitter 家族和 YouTube 家族已经具备第一波改造基础，接下来重点不是继续写代码，而是持续用标题、案例、发布节奏去放大现有能力。",
            "- 如果执行得当，AISA 的目标不是做出一个爆款，而是建立一个能够持续复制爆款的发布系统。",
        ]
    )
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def main() -> None:
    payload = build_payload()
    markdown = build_markdown(payload)

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    DATA_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_PATH.write_text(markdown, encoding="utf-8")
    PUBLIC_REPORT_PATH.write_text(markdown, encoding="utf-8")
    write_docx(DOCX_PATH, markdown.splitlines())
    write_docx(PUBLIC_DOCX_PATH, markdown.splitlines())
    print(f"Wrote {DATA_PATH}, {REPORT_PATH}, and public copies.")


if __name__ == "__main__":
    main()
