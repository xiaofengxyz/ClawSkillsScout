#!/usr/bin/env python3
"""
Convert downloaded GitHub skill tarballs into ClawHub-ready zip bundles.

The converter rewrites SKILL.md frontmatter/body for ClawHub publishing,
trims non-runtime files, applies a few upload-safety patches, and emits
bilingual EN/ZH zip bundles plus an index.json manifest.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import tarfile
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT_INDEX = ROOT / "public" / "downloads" / "github" / "index.json"
OUTPUT_ROOT = ROOT / "public" / "downloads" / "clawHub-github"
OUTPUT_INDEX = OUTPUT_ROOT / "index.json"


@dataclass(frozen=True)
class SkillSpec:
    slug: str
    slug_zh: str
    title: str
    title_zh: str
    description: str
    description_zh: str
    script_path: str | None
    feature_en: list[str]
    feature_zh: list[str]
    examples_en: list[str]
    examples_zh: list[str]
    notes_en: list[str]
    notes_zh: list[str]


SPECS: dict[str, SkillSpec] = {
    "Twitter-Skills-Hermes-Agent": SkillSpec(
        slug="twitter-autopilot",
        slug_zh="twitter-autopilot-zh",
        title="Twitter Autopilot",
        title_zh="Twitter 自动化助手",
        description="Search X Twitter data, monitor accounts, track trends, and publish posts through the AISA relay. Use when: the user needs Twitter search, social listening, influencer monitoring, posting, reply, like, or follow workflows.",
        description_zh="搜索 X Twitter 数据、监控账号动态、追踪热点，并通过 AISA 中继完成发帖与互动。触发条件：当用户需要 Twitter 搜索、社媒监听、博主监控、发帖、回复、点赞或关注流程时使用。",
        script_path="scripts/twitter_client.py",
        feature_en=[
            "Read Twitter X profiles, timelines, mentions, followers, trends, and search results via AISA APIs.",
            "Support posting, replying, quoting, liking, unliking, following, and unfollowing through the shipped OAuth relay clients.",
            "Keep auth API-key based for read paths and OAuth based for write paths without asking for passwords or browser cookies.",
        ],
        feature_zh=[
            "通过 AISA API 读取 Twitter X 用户资料、时间线、提及、粉丝、热点和搜索结果。",
            "通过内置 OAuth 中继客户端支持发帖、回复、引用、点赞、取消点赞、关注和取关。",
            "读取能力只需要 API Key，写入能力走 OAuth，不要求密码或浏览器 Cookie。",
        ],
        examples_en=[
            'Research "@OpenAI" and summarize the last 20 tweets about GPT releases.',
            'Find trending AI topics on X Twitter and group them by sentiment.',
            'Post this product launch thread to X Twitter after authorization is ready.',
        ],
        examples_zh=[
            "查看 @OpenAI 最近 20 条和 GPT 发布有关的推文并总结。",
            "分析 X Twitter 上 AI 相关的热门话题并按情绪分组。",
            "在授权完成后，把这条产品发布线程发到 X Twitter。",
        ],
        notes_en=[
            "Write actions use the bundled `twitter_oauth_client.py` and `twitter_engagement_client.py` helpers.",
            "If posting or engagement requires authorization, start the OAuth flow first and then retry the action.",
        ],
        notes_zh=[
            "写入动作使用内置的 `twitter_oauth_client.py` 与 `twitter_engagement_client.py`。",
            "如果发帖或互动提示未授权，先完成 OAuth 授权，再重试动作。",
        ],
    ),
    "aisa-multi-search-engine": SkillSpec(
        slug="aisa-multi-search-engine",
        slug_zh="aisa-multi-search-engine-zh",
        title="AISA Multi Search Engine",
        title_zh="AISA 多源搜索引擎",
        description="Run web search, scholar search, Tavily search and extract, smart search, and Perplexity-style deep research through one AISA skill. Use when: the user needs broad web research, academic search, URL extraction, or multi-source evidence gathering.",
        description_zh="通过一个 AISA skill 统一执行网页搜索、学术搜索、Tavily 搜索与抽取、智能搜索和类 Perplexity 深度研究。触发条件：当用户需要网页研究、学术检索、URL 抽取或多源证据汇总时使用。",
        script_path="scripts/search_client.py",
        feature_en=[
            "Bundle seven search modes behind one AISA API key and one Python client.",
            "Cover structured web search, academic search, smart hybrid search, Tavily search and extract, Perplexity deep research, and multi-source synthesis.",
            "Fit research, due diligence, market scanning, and evidence collection workflows.",
        ],
        feature_zh=[
            "通过一个 AISA API Key 和一个 Python 客户端统一封装七种搜索模式。",
            "覆盖结构化网页搜索、学术搜索、智能混合搜索、Tavily 搜索与抽取、Perplexity 深度研究以及多源综合。",
            "适合研究、尽调、市场扫描和证据收集场景。",
        ],
        examples_en=[
            'Use multi-source research to compare agent frameworks released in 2026.',
            "Search academic papers about multimodal reasoning from 2024 onward.",
            "Extract the main content from a list of URLs and summarize the overlaps.",
        ],
        examples_zh=[
            "用多源研究比较 2026 年发布的 agent 框架。",
            "检索 2024 年以来关于多模态推理的学术论文。",
            "抽取一组 URL 的正文并总结重合结论。",
        ],
        notes_en=[
            "The shipped Python client is the primary runtime path for ClawHub.",
        ],
        notes_zh=[
            "在 ClawHub 场景下，内置 Python 客户端是主要运行入口。",
        ],
    ),
    "aisa-multi-search-engine-claude-skills-multi-search": SkillSpec(
        slug="multi-search",
        slug_zh="multi-search-zh",
        title="Multi Search",
        title_zh="多源综合搜索",
        description="Run multi-source evidence gathering with confidence scoring across web, academic, Tavily, and synthesis layers via AISA. Use when: the user needs a comprehensive answer backed by multiple search sources instead of a single search pass.",
        description_zh="通过 AISA 在网页、学术、Tavily 与综合分析层做多源证据搜索，并输出置信度。触发条件：当用户需要由多个搜索来源支撑的综合结论，而不是一次单点搜索时使用。",
        script_path="scripts/search_client.py",
        feature_en=["Aggregate multiple search sources into one confidence-scored answer."],
        feature_zh=["把多个搜索来源汇总成一个带置信度的综合答案。"],
        examples_en=['Research whether open-source coding agents improved in 2026 and cite multiple sources.'],
        examples_zh=["研究 2026 年开源 coding agent 是否变强，并给出多来源依据。"],
        notes_en=["Invoke the Python client with the multi-search mode."],
        notes_zh=["通过 Python 客户端的 multi-search 模式调用。"],
    ),
    "aisa-multi-search-engine-claude-skills-perplexity-research": SkillSpec(
        slug="perplexity-research",
        slug_zh="perplexity-research-zh",
        title="Perplexity Research",
        title_zh="Perplexity 深度研究",
        description="Produce citation-backed deep research answers through Perplexity Sonar models via AISA. Use when: the user needs synthesized research, comparative analysis, or long-form cited answers instead of raw link lists.",
        description_zh="通过 AISA 调用 Perplexity Sonar 模型生成带引用的深度研究答案。触发条件：当用户需要综合研究、对比分析或长篇引用答案，而不是原始链接列表时使用。",
        script_path="scripts/search_client.py",
        feature_en=["Generate cited research answers with configurable Sonar model depth."],
        feature_zh=["使用可配置的 Sonar 模型深度生成带引用的研究答案。"],
        examples_en=['Research global AI regulation trends and return a cited summary.'],
        examples_zh=["研究全球 AI 监管趋势，并返回带引用的总结。"],
        notes_en=["Best when synthesis matters more than raw result recall."],
        notes_zh=["当综合结论比原始结果列表更重要时优先使用。"],
    ),
    "aisa-multi-search-engine-claude-skills-scholar-search": SkillSpec(
        slug="scholar-search",
        slug_zh="scholar-search-zh",
        title="Scholar Search",
        title_zh="学术论文搜索",
        description="Search academic papers and scholarly sources through the AISA scholar endpoint. Use when: the user asks for papers, authors, recent research, citations, or year-filtered academic evidence.",
        description_zh="通过 AISA Scholar 接口检索学术论文与研究资料。触发条件：当用户需要论文、作者、最新研究、引用信息或带年份筛选的学术证据时使用。",
        script_path="scripts/search_client.py",
        feature_en=["Focus on academic papers, scholar indexing, and year-filtered retrieval."],
        feature_zh=["聚焦学术论文、学者索引与按年份筛选的检索。"],
        examples_en=['Find papers on state-space models published after 2024.'],
        examples_zh=["查找 2024 年之后发表的 state-space model 论文。"],
        notes_en=["Use when scholarly evidence is the priority."],
        notes_zh=["当学术证据是首要目标时使用。"],
    ),
    "aisa-multi-search-engine-claude-skills-smart-search": SkillSpec(
        slug="smart-search",
        slug_zh="smart-search-zh",
        title="Smart Search",
        title_zh="智能混合搜索",
        description="Combine web and academic search into one smart AISA search mode. Use when: the user needs a balanced research pass that mixes public web coverage with academic depth.",
        description_zh="把网页搜索与学术搜索组合成一个智能 AISA 搜索模式。触发条件：当用户需要兼顾公开网页覆盖与学术深度的平衡检索时使用。",
        script_path="scripts/search_client.py",
        feature_en=["Blend public web coverage with academic retrieval in one query flow."],
        feature_zh=["在一次查询流程里同时结合网页覆盖和学术检索。"],
        examples_en=['Research benchmark progress for open-weight reasoning models.'],
        examples_zh=["研究开放权重推理模型的基准进展。"],
        notes_en=["Good default when the query spans both news and papers."],
        notes_zh=["当问题同时涉及新闻与论文时，这是很好的默认选择。"],
    ),
    "aisa-multi-search-engine-claude-skills-tavily-extract": SkillSpec(
        slug="tavily-extract",
        slug_zh="tavily-extract-zh",
        title="Tavily Extract",
        title_zh="Tavily 页面抽取",
        description="Extract clean article content from URLs through the AISA Tavily extract endpoint. Use when: the user already has URLs and needs readable page content for summarization, comparison, or evidence review.",
        description_zh="通过 AISA Tavily 抽取接口从 URL 获取干净正文。触发条件：当用户已经有 URL，需要读取页面正文做总结、对比或证据审查时使用。",
        script_path="scripts/search_client.py",
        feature_en=["Turn raw URLs into clean extractable text for downstream analysis."],
        feature_zh=["把原始 URL 转成可分析的干净正文文本。"],
        examples_en=['Extract these product announcement URLs and summarize the differences.'],
        examples_zh=["抽取这些产品公告 URL，并总结差异。"],
        notes_en=["Best paired with search or follow-up synthesis."],
        notes_zh=["最适合与搜索或后续综合分析配合使用。"],
    ),
    "aisa-multi-search-engine-claude-skills-tavily-search": SkillSpec(
        slug="tavily-search",
        slug_zh="tavily-search-zh",
        title="Tavily Search",
        title_zh="Tavily 网页搜索",
        description="Run Tavily web search through AISA with filters for depth, topic, and time range. Use when: the user needs flexible web search with stronger filtering than a plain keyword search.",
        description_zh="通过 AISA 调用 Tavily 网页搜索，并支持深度、主题和时间范围过滤。触发条件：当用户需要比普通关键词搜索更灵活的网页检索过滤能力时使用。",
        script_path="scripts/search_client.py",
        feature_en=["Offer filtered web search with Tavily-specific controls."],
        feature_zh=["提供带 Tavily 专属过滤能力的网页搜索。"],
        examples_en=['Search AI funding news from the last month with Tavily filters.'],
        examples_zh=["使用 Tavily 过滤条件搜索过去一个月的 AI 融资新闻。"],
        notes_en=["Useful when recency and filtering matter."],
        notes_zh=["当时效性和过滤条件很重要时特别适合。"],
    ),
    "aisa-multi-search-engine-claude-skills-web-search": SkillSpec(
        slug="web-search",
        slug_zh="web-search-zh",
        title="Web Search",
        title_zh="网页搜索",
        description="Search the public web through the AISA web search endpoint and return structured titles, links, and snippets. Use when: the user asks to look something up online, gather recent sources, or browse general web results.",
        description_zh="通过 AISA 网页搜索接口检索公开互联网，并返回结构化标题、链接和摘要。触发条件：当用户要求联网查找、收集近期来源或获取通用网页结果时使用。",
        script_path="scripts/search_client.py",
        feature_en=["Return fast structured web results for general online lookup tasks."],
        feature_zh=["为通用联网检索任务返回快速结构化网页结果。"],
        examples_en=['Search the web for the latest open-source browser automation tools.'],
        examples_zh=["搜索最新的开源浏览器自动化工具。"],
        notes_en=["This is the lightest-weight general search option in the bundle."],
        notes_zh=["这是整套包里最轻量的通用搜索选项。"],
    ),
    "stock-analysis-aisa-claude-skills-stock-analysis": SkillSpec(
        slug="stock-analysis",
        slug_zh="stock-analysis-zh",
        title="Stock Analysis",
        title_zh="股票与加密分析",
        description="Analyze stocks and cryptocurrencies with live AISA-backed scoring, signals, confidence, and risk flags. Use when: the user asks to analyze a ticker, compare investments, or review market positioning.",
        description_zh="通过 AISA 做股票和加密资产分析，输出评分、信号、置信度和风险提示。触发条件：当用户要求分析某个代码、比较投资标的或评估市场位置时使用。",
        script_path="scripts/analyze_stock.py",
        feature_en=[
            "Score stocks and crypto assets with live data-backed analysis.",
            "Return BUY HOLD SELL style signals, confidence, and key risks.",
        ],
        feature_zh=[
            "基于实时数据对股票和加密资产做评分分析。",
            "返回 BUY HOLD SELL 风格的信号、置信度和关键风险。",
        ],
        examples_en=['Analyze AAPL versus MSFT and summarize the stronger setup.'],
        examples_zh=["对比分析 AAPL 和 MSFT，并总结更强的一方。"],
        notes_en=["Informational only and not financial advice."],
        notes_zh=["仅供信息参考，不构成投资建议。"],
    ),
    "stock-analysis-aisa-claude-skills-stock-dividend": SkillSpec(
        slug="stock-dividend",
        slug_zh="stock-dividend-zh",
        title="Dividend Analysis",
        title_zh="股息分析",
        description="Evaluate dividend yield, payout safety, growth, and income quality for stocks through AISA. Use when: the user asks about dividend safety, income investing, dividend growth, or dividend aristocrat style screening.",
        description_zh="通过 AISA 评估股票的股息率、派息安全性、增长情况和收益质量。触发条件：当用户关心股息安全、收益型投资、股息增长或股息贵族筛选时使用。",
        script_path="scripts/dividends.py",
        feature_en=["Focus on dividend safety, coverage, growth, and income quality."],
        feature_zh=["重点分析股息安全性、覆盖率、增长和收益质量。"],
        examples_en=['Check whether JNJ and PG look safer for dividend income.'],
        examples_zh=["评估 JNJ 和 PG 哪个更适合做稳定分红配置。"],
        notes_en=["Informational only and not financial advice."],
        notes_zh=["仅供信息参考，不构成投资建议。"],
    ),
    "stock-analysis-aisa-claude-skills-stock-hot": SkillSpec(
        slug="stock-hot",
        slug_zh="stock-hot-zh",
        title="Hot Scanner",
        title_zh="热门标的扫描",
        description="Scan trending stocks and crypto movers with live AISA market signals. Use when: the user asks what is hot, what is moving, market momentum, top gainers, or news-driven movers right now.",
        description_zh="通过 AISA 扫描热门股票和加密资产的实时异动。触发条件：当用户想知道现在什么最热、什么在大幅波动、市场动量如何、涨幅榜或消息驱动异动时使用。",
        script_path="scripts/hot_scanner.py",
        feature_en=["Surface top movers, momentum names, and quick market summaries."],
        feature_zh=["找出涨跌幅居前标的、动量标的和快速市场总结。"],
        examples_en=['Show the hottest stocks and crypto movers right now.'],
        examples_zh=["展示当前最热门的股票和加密异动标的。"],
        notes_en=["Informational only and not financial advice."],
        notes_zh=["仅供信息参考，不构成投资建议。"],
    ),
    "stock-analysis-aisa-claude-skills-stock-portfolio": SkillSpec(
        slug="stock-portfolio",
        slug_zh="stock-portfolio-zh",
        title="Portfolio Management",
        title_zh="投资组合管理",
        description="Create and manage stock crypto portfolios with live AISA pricing and P&L tracking. Use when: the user wants to add holdings, inspect portfolio performance, rename portfolios, or review current profit and loss.",
        description_zh="通过 AISA 的实时价格与盈亏跟踪来创建和管理股票加密投资组合。触发条件：当用户想新增持仓、查看组合表现、重命名组合或审查当前盈亏时使用。",
        script_path="scripts/portfolio.py",
        feature_en=[
            "Create, update, list, rename, and delete portfolios from the command line.",
            "Track live P&L with repo-local state instead of default home-directory persistence.",
        ],
        feature_zh=[
            "在命令行中创建、更新、列出、重命名和删除投资组合。",
            "使用仓库内本地状态目录跟踪实时盈亏，而不是默认写入家目录。",
        ],
        examples_en=['Create a portfolio for AI stocks and show the current P&L.'],
        examples_zh=["创建一个 AI 股票组合并展示当前盈亏。"],
        notes_en=["Default state is stored in `./.clawdbot/skills/stock-analysis/portfolios.json` unless `CLAWDBOT_STATE_DIR` is set."],
        notes_zh=["除非显式设置 `CLAWDBOT_STATE_DIR`，默认状态保存在 `./.clawdbot/skills/stock-analysis/portfolios.json`。"],
    ),
    "stock-analysis-aisa-claude-skills-stock-rumors": SkillSpec(
        slug="stock-rumors",
        slug_zh="stock-rumors-zh",
        title="Rumor Scanner",
        title_zh="市场传闻扫描",
        description="Scan M&A, insider, analyst, social, and regulatory rumor signals through AISA. Use when: the user asks about early market signals, rumors, insider activity, analyst changes, or takeover chatter.",
        description_zh="通过 AISA 扫描并购、内幕、分析师、社交媒体和监管相关的市场传闻信号。触发条件：当用户关心早期市场信号、传闻、内幕活动、分析师变动或收购风声时使用。",
        script_path="scripts/rumor_scanner.py",
        feature_en=["Rank rumor-like signals by likely impact across several signal categories."],
        feature_zh=["按潜在影响对多种类型的传闻信号进行排序。"],
        examples_en=['Scan for the strongest takeover or insider signals this week.'],
        examples_zh=["扫描本周最强的收购或内幕信号。"],
        notes_en=["Rumors are unconfirmed and should be independently verified."],
        notes_zh=["传闻未被证实，建议独立核验。"],
    ),
    "stock-analysis-aisa-claude-skills-stock-watchlist": SkillSpec(
        slug="stock-watchlist",
        slug_zh="stock-watchlist-zh",
        title="Watchlist Management",
        title_zh="观察列表管理",
        description="Manage a stock crypto watchlist with target and stop alerts using live AISA price checks. Use when: the user wants to add watchlist items, set targets, track stops, or run alert checks on tickers.",
        description_zh="利用 AISA 的实时价格检查来管理股票加密观察列表，并设置目标位和止损提醒。触发条件：当用户想添加观察标的、设置目标价、跟踪止损或检查提醒触发情况时使用。",
        script_path="scripts/watchlist.py",
        feature_en=[
            "Add, remove, list, and check watchlist entries from the command line.",
            "Store watchlist state in a repo-local directory by default for safer publishing.",
        ],
        feature_zh=[
            "在命令行中添加、移除、列出和检查观察列表条目。",
            "默认把观察列表状态存放在仓库内目录中，便于更安全地发布。",
        ],
        examples_en=['Add NVDA to the watchlist with a target and a stop price.'],
        examples_zh=["把 NVDA 加入观察列表，并设置目标价和止损价。"],
        notes_en=["Default state is stored in `./.clawdbot/skills/stock-analysis/watchlist.json` unless `CLAWDBOT_STATE_DIR` is set."],
        notes_zh=["除非显式设置 `CLAWDBOT_STATE_DIR`，默认状态保存在 `./.clawdbot/skills/stock-analysis/watchlist.json`。"],
    ),
}


REMOVE_PATHS = {
    "openclaw.plugin.json",
    "package.json",
    "index.ts",
    "CHANGELOG.md",
    "LICENSE",
}


def parse_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    match = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not match:
        return {}, text
    raw, body = match.groups()
    meta: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip().strip('"')
    return meta, body.strip()


def ensure_clean_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def trim_tree(path: Path, archive_name: str) -> None:
    for node in sorted(path.rglob("*"), reverse=True):
        rel = node.relative_to(path).as_posix()
        parts = set(node.parts)
        if node.is_dir():
            if node.name in {"__pycache__", ".pytest_cache", ".git", ".github", "node_modules", "dist", "build"}:
                shutil.rmtree(node, ignore_errors=True)
            continue
        if node.suffix in {".pyc", ".pyo", ".log"}:
            node.unlink(missing_ok=True)
            continue
        if rel in REMOVE_PATHS:
            node.unlink(missing_ok=True)
            continue
        if archive_name == "Twitter-Skills-Hermes-Agent" and rel.startswith("references/"):
            node.unlink(missing_ok=True)


def patch_runtime_files(path: Path) -> None:
    replacements = {
        "scripts/portfolio.py": [
            (
                'Portfolio data stored locally in ~/.clawdbot/skills/stock-analysis/portfolios.json',
                'Portfolio data stored locally in ./.clawdbot/skills/stock-analysis/portfolios.json',
            ),
            (
                'state_dir = os.environ.get("CLAWDBOT_STATE_DIR", os.path.expanduser("~/.clawdbot"))',
                'state_dir = os.environ.get("CLAWDBOT_STATE_DIR", os.path.join(os.getcwd(), ".clawdbot"))',
            ),
        ],
        "scripts/watchlist.py": [
            (
                'Watchlist stored at: ~/.clawdbot/skills/stock-analysis/watchlist.json',
                'Watchlist stored at: ./.clawdbot/skills/stock-analysis/watchlist.json',
            ),
            (
                'state_dir = os.environ.get("CLAWDBOT_STATE_DIR", os.path.expanduser("~/.clawdbot"))',
                'state_dir = os.environ.get("CLAWDBOT_STATE_DIR", os.path.join(os.getcwd(), ".clawdbot"))',
            ),
        ],
    }
    for rel_path, pairs in replacements.items():
        file_path = path / rel_path
        if not file_path.exists():
            continue
        text = file_path.read_text(encoding="utf-8")
        for old, new in pairs:
            text = text.replace(old, new)
        file_path.write_text(text, encoding="utf-8")


def make_skill_markdown(spec: SkillSpec, version: str, license_name: str, lang: str) -> str:
    is_zh = lang == "zh"
    slug = spec.slug_zh if is_zh else spec.slug
    description = spec.description_zh if is_zh else spec.description
    title = spec.title_zh if is_zh else spec.title
    features = spec.feature_zh if is_zh else spec.feature_en
    examples = spec.examples_zh if is_zh else spec.examples_en
    notes = spec.notes_zh if is_zh else spec.notes_en
    entry_script = spec.script_path or ""

    if is_zh:
        body = [
            f"# {title}",
            "",
            "## 何时使用",
            "",
            f"- {description}",
            "",
            "## 不适用场景",
            "",
            "- 当用户明确要本地浏览器 Cookie、密码、Keychain 或其他本地敏感凭据时，不要使用这个 skill。",
            "- 当问题与该 skill 的主题无关时，优先选择更贴切的 skill。",
            "",
            "## 核心能力",
            "",
            *[f"- {item}" for item in features],
            "",
            "## 快速开始",
            "",
            "```bash",
            'export AISA_API_KEY="your-key"',
            "```",
            "",
            "## 运行方式",
            "",
            "首选运行路径是仓库内置的 Python 客户端：",
            "",
            "```bash",
            f"python3 {entry_script}" if entry_script else "python3 <script>",
            "```",
            "",
            "## 示例请求",
            "",
            *[f"- {item}" for item in examples],
            "",
            "## 说明",
            "",
            *[f"- {item}" for item in notes],
        ]
    else:
        body = [
            f"# {title}",
            "",
            "## When to Use",
            "",
            f"- {description}",
            "",
            "## When NOT to Use",
            "",
            "- Do not use this skill for browser-cookie extraction, passwords, Keychain access, or other local sensitive credential access.",
            "- Prefer a different skill when the user request is outside this skill's domain.",
            "",
            "## Capabilities",
            "",
            *[f"- {item}" for item in features],
            "",
            "## Quick Start",
            "",
            "```bash",
            'export AISA_API_KEY="your-key"',
            "```",
            "",
            "## Primary Runtime",
            "",
            "Use the bundled Python client as the canonical ClawHub runtime path:",
            "",
            "```bash",
            f"python3 {entry_script}" if entry_script else "python3 <script>",
            "```",
            "",
            "## Example Queries",
            "",
            *[f"- {item}" for item in examples],
            "",
            "## Notes",
            "",
            *[f"- {item}" for item in notes],
        ]

    frontmatter = "\n".join(
        [
            "---",
            f'name: {slug}',
            f'description: "{description}"',
            "author: aisa",
            f'version: "{version}"',
            f"license: {license_name}",
            "user-invocable: true",
            "primaryEnv: AISA_API_KEY",
            "requires:",
            "  env:",
            "    - AISA_API_KEY",
            "  bins:",
            "    - python3",
            "metadata:",
            "  openclaw:",
            "    primaryEnv: AISA_API_KEY",
            "    requires:",
            "      env:",
            "        - AISA_API_KEY",
            "      bins:",
            "        - python3",
            "---",
            "",
        ]
    )
    return frontmatter + "\n".join(body) + "\n"


def write_zip_from_dir(source_dir: Path, output_file: Path) -> int:
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_file, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for file_path in sorted(source_dir.rglob("*")):
            if file_path.is_dir():
                continue
            arcname = file_path.relative_to(source_dir).as_posix()
            zf.write(file_path, arcname)
    return output_file.stat().st_size


def convert_archive(item: dict, output_items: list[dict]) -> None:
    archive_path = ROOT / item["file"]
    archive_key = Path(item["file"]).name.replace(".tar.gz", "")
    spec = SPECS.get(archive_key)
    if spec is None:
        raise KeyError(f"No conversion spec for {archive_key}")

    with tempfile.TemporaryDirectory(prefix="github-to-clawhub-") as temp_dir:
        temp_root = Path(temp_dir)
        extract_root = temp_root / "extract"
        extract_root.mkdir(parents=True, exist_ok=True)

        with tarfile.open(archive_path, "r:gz") as tf:
            tf.extractall(extract_root)

        top_dirs = [child for child in extract_root.iterdir() if child.is_dir()]
        if len(top_dirs) != 1:
            raise RuntimeError(f"Unexpected extracted layout for {archive_path}")
        source_root = top_dirs[0]

        skill_text = (source_root / "SKILL.md").read_text(encoding="utf-8")
        frontmatter, _ = parse_frontmatter(skill_text)
        version = frontmatter.get("version", "1.0.0")
        license_name = frontmatter.get("license", "Apache-2.0")

        for lang in ("en", "zh"):
            stage_dir = temp_root / f"stage-{lang}"
            ensure_clean_dir(stage_dir)
            shutil.copytree(source_root, stage_dir, dirs_exist_ok=True)
            trim_tree(stage_dir, archive_key)
            patch_runtime_files(stage_dir)
            (stage_dir / "SKILL.md").write_text(
                make_skill_markdown(spec, version, license_name, lang),
                encoding="utf-8",
            )
            meta = {
                "source": "github",
                "owner": item["owner"],
                "repo": item["repo"],
                "githubUrl": item["githubUrl"],
                "convertedFrom": item["file"],
                "language": lang,
                "slug": spec.slug_zh if lang == "zh" else spec.slug,
                "version": version,
            }
            (stage_dir / "_meta.json").write_text(
                json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

            slug = spec.slug_zh if lang == "zh" else spec.slug
            out_file = OUTPUT_ROOT / item["owner"] / f"{slug}.zip"
            size = write_zip_from_dir(stage_dir, out_file)
            output_items.append(
                {
                    "owner": item["owner"],
                    "sourceRepo": item["repo"],
                    "language": lang,
                    "slug": slug,
                    "title": spec.title_zh if lang == "zh" else spec.title,
                    "githubUrl": item["githubUrl"],
                    "convertedFrom": item["file"],
                    "file": out_file.relative_to(ROOT).as_posix(),
                    "bytes": size,
                }
            )


def main() -> None:
    source_index = json.loads(INPUT_INDEX.read_text(encoding="utf-8"))
    ensure_clean_dir(OUTPUT_ROOT)
    output_items: list[dict] = []

    for item in source_index.get("items", []):
        convert_archive(item, output_items)

    summary = {
        "generatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "generatedFrom": INPUT_INDEX.relative_to(ROOT).as_posix(),
        "total": len(output_items),
        "languages": ["en", "zh"],
        "items": output_items,
    }
    OUTPUT_INDEX.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Converted {len(output_items)} ClawHub-ready skill bundles into {OUTPUT_ROOT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
