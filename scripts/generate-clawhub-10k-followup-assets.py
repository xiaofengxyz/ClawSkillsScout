#!/usr/bin/env python3
from __future__ import annotations

import json
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape


DATA_PATH = Path("public/data/clawhub-10k-system-report.json")
REPORT_DIR = Path("reports")
PUBLIC_REPORT_DIR = Path("public/reports")

ZH_MD = REPORT_DIR / "ClawHub_10K_System_Report_ZH.md"
ZH_DOCX = REPORT_DIR / "ClawHub_10K_System_Report_ZH.docx"
PUBLIC_ZH_MD = PUBLIC_REPORT_DIR / "ClawHub_10K_System_Report_ZH.md"
PUBLIC_ZH_DOCX = PUBLIC_REPORT_DIR / "ClawHub_10K_System_Report_ZH.docx"

BOSS_EN_MD = REPORT_DIR / "ClawHub_10K_Boss_Brief_EN.md"
BOSS_EN_DOCX = REPORT_DIR / "ClawHub_10K_Boss_Brief_EN.docx"
PUBLIC_BOSS_EN_MD = PUBLIC_REPORT_DIR / "ClawHub_10K_Boss_Brief_EN.md"
PUBLIC_BOSS_EN_DOCX = PUBLIC_REPORT_DIR / "ClawHub_10K_Boss_Brief_EN.docx"

BOSS_ZH_MD = REPORT_DIR / "ClawHub_10K_Boss_Brief_ZH.md"
BOSS_ZH_DOCX = REPORT_DIR / "ClawHub_10K_Boss_Brief_ZH.docx"
PUBLIC_BOSS_ZH_MD = PUBLIC_REPORT_DIR / "ClawHub_10K_Boss_Brief_ZH.md"
PUBLIC_BOSS_ZH_DOCX = PUBLIC_REPORT_DIR / "ClawHub_10K_Boss_Brief_ZH.docx"


def load_payload() -> dict:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


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


def build_chinese_report(payload: dict) -> str:
    d1 = payload["documents"]["document1"]
    d2 = payload["documents"]["document2"]
    d3 = payload["documents"]["document3"]
    d4 = payload["documents"]["document4"]
    summary = payload["summary"]

    lines: list[str] = []
    lines.append("# ClawHub 10K+ 爆款系统报告（中文版）")
    lines.append("")
    lines.append(f"- 生成时间：{payload['generatedAt']}")
    lines.append(f"- 10K+ 技能样本：{summary['sampled10kSkills']}")
    lines.append(f"- 作者样本：{summary['sampledAuthors']}")
    lines.append(f"- 高产作者：{summary['prolificAuthors']}")
    lines.append(f"- 10K+ 下载成功数：{summary['downloaded10kSkills']}")
    lines.append("")

    lines.append("## 一、头部技能系统分析")
    lines.append("")
    lines.append("### 核心发现")
    lines.extend(
        [
            "- 自动化类是 10K+ 技能里的主导方向，说明用户更愿意为可立即执行的能力买单，而不是为抽象概念停留。",
            "- 头部技能大多输入简单、输出明确，首轮就能让用户感知价值，极大降低试用成本。",
            "- 爆款标题不是讲技术架构，而是直接对应用户任务、对象或结果，例如 Github、Weather、Browser、Self-Improving。",
            "- 真正可复制的不是某个单点创意，而是“一个底层能力 + 多个高意图场景”的变体工厂。",
        ]
    )
    lines.append("")
    lines.append("### 可复制系统")
    for item in d1["repeatableSystem"]:
        mapping = {
            "System S1 - Demand-first packaging: start from narrow, explicit user job statements.": "系统 S1：需求先行。先定义窄而明确的用户任务，再做功能包装。",
            "System S2 - Fast value confirmation: make first successful output possible in one prompt.": "系统 S2：快速价值确认。第一次对话就要让用户看到结果。",
            "System S3 - Wrapper factory: reuse one API runtime across many vertical variants.": "系统 S3：包装器工厂。一个 API/运行时复用到多个垂直变体。",
            "System S4 - Discoverability loop: title, subtitle, and tags mirror user search intent terms.": "系统 S4：可发现性闭环。标题、描述、标签必须贴近用户搜索词。",
            "System S5 - Iteration cadence: release small variants weekly and promote the best performers.": "系统 S5：迭代节奏。持续发布小变体，让数据筛选赢家。",
        }
        lines.append(f"- {mapping.get(item, item)}")
    lines.append("")

    lines.append("## 二、作者高产与高爆款系统")
    lines.append("")
    lines.append("### Self-Improving 相关作者")
    for author in d2["selfImprovingAuthorFocus"]:
        lines.append(
            f"- @{author['author']}：总技能 {author['totalSkills']}，10K+ 技能 {author['numberOf10kPlusSkills']}，代表作 {', '.join(author['topSkillNames'])}"
        )
    lines.append("")
    lines.append("### 方法论结论")
    lines.extend(
        [
            "- 高产作者并不是反复从零开始做新产品，而是在运行一套作品集系统。",
            "- 他们通常复用同一套脚手架、同一个 API 能力或同一类内容模板，然后快速切换用户场景。",
            "- 作品越多，不代表越分散；真正厉害的是围绕一个能力核做密集变体生产。",
            "- Self-Improving 类型之所以容易出圈，是因为它天然带有“反馈、学习、纠错、持续变好”的叙事张力。",
        ]
    )
    lines.append("")

    lines.append("## 三、从 0 到 1 做出爆款的落地方案")
    lines.append("")
    lines.append("### 阶段 A：选方向")
    lines.extend(
        [
            "- 只选一个高频 API 家族切入：搜索、天气、金融、翻译、生产力、媒体生成。",
            "- 先写一句任务定义：这个 skill 为谁完成什么任务，第一次使用能得到什么结果。",
            "- 不从“大而全”开始，而是从一个窄场景开始，例如“查天气”“搜 Github 仓库”“浏览网页完成一步操作”。",
        ]
    )
    lines.append("")
    lines.append("### 阶段 B：做第一个能打的版本")
    lines.extend(
        [
            "- 标题必须是用户会搜的词，而不是内部技术名词。",
            "- 描述必须回答三件事：做什么、什么时候用、支持什么。",
            "- 让首轮调用的输入最少、输出最确定，尽量避免用户一开始就做复杂配置。",
        ]
    )
    lines.append("")
    lines.append("### 阶段 C：做成爆款")
    lines.extend(
        [
            "- 基于同一底层能力做 5 到 10 个变体，而不是只发一个技能就停。",
            "- 每周小步发布，看下载量、复用率、用户纠错点和高频 prompt 类型。",
            "- 把最有效的标题、示例、输出格式沉淀成模板，下一个 skill 不再重想。",
        ]
    )
    lines.append("")
    lines.append("### 阶段 D：做成系统")
    for item in d3["executionChecklist"]:
        zh_map = {
            "Define single-sentence job-to-be-done before coding.": "编码前先写出一句话版 job-to-be-done。",
            "Ensure first-run success path within one prompt.": "确保第一次使用在一轮 prompt 内成功。",
            "Instrument outcome metrics and log prompt class distribution.": "记录结果指标与 prompt 类型分布。",
            "Maintain reusable starter template for future variants.": "维护可复用 starter template，避免重复造轮子。",
            "Design pricing hooks from day one (limits, freshness, volume, automation depth).": "从第一天就设计价格钩子：限额、实时性、批量、自动化深度。",
        }
        lines.append(f"- {zh_map.get(item, item)}")
    lines.append("")

    lines.append("## 四、直接开做的选品方案")
    lines.append("")
    lines.append("### 我建议你现在就做：GitHub Repo Research")
    lines.extend(
        [
            "- 选它，不选更复杂的方向。理由很直接：GitHub / 搜索方向同时验证过高下载需求，用户任务明确，而且从 0 到 1 最容易快速做出可感知价值。",
            "- 它比“自进化 agent”更适合落地。Self-Improving 很吸睛，但实现和验收都更虚；GitHub Research 则能清楚回答用户问题，例如“这个仓库做什么”“值不值得参考”“有哪些 API/技术栈/风险点”。",
            "- 它天然适合变体工厂。同一底层能力可以继续拆出 Repo Summarizer、Issue Triage、PR Reviewer、README Writer、Competitor Scanner 等多个变体。",
        ]
    )
    lines.append("")
    lines.append("### 从头到尾怎么做")
    lines.extend(
        [
            "- 第 1 步：先做最小可用版。输入一个 GitHub 仓库 URL，输出仓库摘要、技术栈、目录结构、关键文件、是否值得继续阅读。",
            "- 第 2 步：把首轮成功做扎实。保证用户第一次只给一个链接，就能得到结构化结果，而不是还要补很多参数。",
            "- 第 3 步：用搜索词命名。标题不要抽象，直接叫 Github Repo Research、Github Repo Analyzer、Github Codebase Summary 这类用户会搜的词。",
            "- 第 4 步：设计付费钩子。免费版限制仓库大小、分析深度、调用频次；付费版开放多仓库对比、Issue/PR 分析、依赖风险检查、团队批量扫描。",
            "- 第 5 步：发布 3 到 5 个变体。先围绕同一底层能力发 Repo Research、Repo README、Repo PR Review、Repo Issue Triage、Repo Tech Stack Audit。",
        ]
    )
    lines.append("")
    lines.append("### 你现在就能抄的产品定义")
    lines.extend(
        [
            "- 用户是谁：开发者、独立黑客、技术运营、投研和 AI agent 使用者。",
            "- 一句话价值：给我一个 GitHub 链接，我在一轮内告诉你这个项目值不值得看、核心代码在哪、适合怎么继续用。",
            "- 为什么容易起量：搜索意图强、使用门槛低、结果可验证、适合反复使用，也适合内容传播。",
        ]
    )
    lines.append("")

    lines.append("## 五、AIsa API 盈利优化")
    lines.append("")
    lines.append("### 优化后的判断")
    lines.extend(
        [
            "- 当前最值得做成 AIsa 统一能力层的不是单个 skill，而是一组可被大量 skill 重复调用的 API 家族。",
            "- 搜索、媒体生成、生产力、金融和社交是最值得优先产品化的五大方向。",
            "- 最好的盈利方式不是一开始就卖单个 skill，而是通过免费 skill 获取安装与使用，再引导到付费 API 能力。",
        ]
    )
    lines.append("")
    lines.append("### 可替换 API 家族")
    for item in d4["replaceableApis"][:8]:
        api_family = item["apiFamily"]
        if api_family == "Unknown":
            api_family = "Unknown（当前仅表示脚本暂时无法从标题/简介里判断依赖，不代表真的没有 API）"
        lines.append(f"- {api_family}：{item['skillCount']} 个技能，系统打法：{item['systemPlay']}")
    lines.append("")
    lines.append("### 给老板的结论")
    lines.extend(
        [
            "- 这不是做几个爆款 skill 的问题，而是是否建立“选题 -> 模板 -> 发布 -> 数据反馈 -> 变体迭代”的生产系统。",
            "- 一旦系统建立，爆款会从偶然事件变成组合收益。",
            "- AIsa 最适合承担底层统一 API、计费、配额、日志和变体工厂中台的角色。",
        ]
    )
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def build_boss_brief_en(payload: dict) -> str:
    summary = payload["summary"]
    docs = payload["documents"]
    lines: list[str] = []
    lines.append("# Boss Brief: ClawHub 10K+ Repeatable Systems")
    lines.append("")
    lines.append("## Executive Summary")
    lines.append("")
    lines.append(f"- We analyzed {summary['sampled10kSkills']} skills with 10K+ downloads and {summary['sampledAuthors']} authors.")
    lines.append(f"- We identified {summary['prolificAuthors']} prolific authors and downloaded {summary['downloaded10kSkills']} top-sample archives.")
    lines.append("- The strongest conclusion is that viral skills are produced by repeatable systems, not isolated flashes of creativity.")
    lines.append("")
    lines.append("## What Actually Works")
    lines.extend(
        [
            "- Narrow, explicit user jobs outperform broad capability descriptions.",
            "- First-run value must be visible within one prompt.",
            "- One backend capability should be packaged into multiple high-intent variants.",
            "- Discoverability matters as much as functionality: names and descriptions mirror the exact terms users search for.",
            "- Release cadence and variation testing turn a creator into a portfolio operator.",
        ]
    )
    lines.append("")
    lines.append("## What To Improve From The First Report")
    lines.extend(
        [
            "- Move from descriptive analysis to an operational production system with weekly output targets.",
            "- Treat 'Unknown API' skills as a backlog for dependency clarification, not as a dead-end bucket.",
            "- Separate single-hit creators from system-builders; the latter are the real benchmark for replication.",
            "- Use the self-improving cluster as a model for narrative framing: users love skills that promise feedback, adaptation, and compounding improvement.",
        ]
    )
    lines.append("")
    lines.append("## 0-to-1 Launch Plan")
    lines.extend(
        [
            "- Pick one API family with durable demand.",
            "- Launch one narrow wrapper with obvious title, fast output, and one clean success path.",
            "- Ship 5-10 variants around adjacent jobs using the same engine.",
            "- Measure install velocity, repeat usage, prompt classes, and upgrade triggers.",
            "- Convert the winners into a factory template and monetize via AIsa APIs.",
        ]
    )
    lines.append("")
    lines.append("## Why This Matters For AIsa")
    lines.extend(
        [
            "- AIsa should become the shared monetization layer underneath many lightweight skills.",
            "- The best product strategy is not 'sell one premium skill'; it is 'use skills to acquire, APIs to monetize, and templates to scale.'",
            "- Search, media generation, productivity, finance, and social connectors are the best first API families to standardize.",
        ]
    )
    lines.append("")
    lines.append("## Key Authors To Watch")
    for author in docs["document2"]["top10Authors"][:5]:
        lines.append(
            f"- @{author['author']}: totalSkills={author['totalSkills']}, 10kPlus={author['numberOf10kPlusSkills']}, apiReuse={author['apiReuseLikelihood']}, templateUsage={author['templateUsage']}"
        )
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def build_boss_brief_zh(payload: dict) -> str:
    summary = payload["summary"]
    docs = payload["documents"]
    lines: list[str] = []
    lines.append("# 给老板看的简报：ClawHub 10K+ 可复制系统")
    lines.append("")
    lines.append("## 一页结论")
    lines.append("")
    lines.append(f"- 本次分析覆盖 {summary['sampled10kSkills']} 个 10K+ 技能、{summary['sampledAuthors']} 位作者。")
    lines.append(f"- 识别出 {summary['prolificAuthors']} 位高产作者，并完成 {summary['downloaded10kSkills']} 个头部样本包下载。")
    lines.append("- 真正值得学习的不是某个单点爆款，而是背后可复制的生产系统。")
    lines.append("")
    lines.append("## 爆款为什么会出现")
    lines.extend(
        [
            "- 用户只为清晰任务付费，不为模糊能力停留。",
            "- 爆款 skill 的第一价值必须在一轮对话内被感知。",
            "- 一个底层能力如果能被包装成多个高意图场景，就具备持续出爆款的概率。",
            "- 搜索发现性和功能本身同等重要，标题/描述必须贴近真实搜索词。",
            "- 高频发布 + 多变体测试，会把作者从“创作者”升级成“作品集经营者”。",
        ]
    )
    lines.append("")
    lines.append("## 现有结论还可以怎么优化")
    lines.extend(
        [
            "- 从“复盘爆款”升级为“设计爆款生产线”。",
            "- 把 Unknown API 技能当成待澄清依赖池，而不是简单忽略。",
            "- 区分偶发成功作者与系统化高产作者，后者才是真正可复制的标杆。",
            "- Self-Improving 方向值得强化，因为它同时满足功能价值和叙事价值。",
        ]
    )
    lines.append("")
    lines.append("## 从 0 到 1 的落地方案")
    lines.extend(
        [
            "- 先选一个确定有需求的 API 家族。",
            "- 先做一个极窄、极清晰、首轮可成功的 wrapper。",
            "- 再围绕相邻任务发布 5 到 10 个变体。",
            "- 用下载、复用、提示词类型和升级触发点做数据反馈。",
            "- 把赢家抽象成模板，再沉淀到 AIsa API 和技能工厂中台。",
        ]
    )
    lines.append("")
    lines.append("## 对 AIsa 的意义")
    lines.extend(
        [
            "- AIsa 最适合做多 skill 共用的底层盈利层，而不是只做单个技能的后端。",
            "- 最优策略是：用 skill 获取流量，用 API 完成变现，用模板提升复制效率。",
            "- 优先标准化搜索、媒体生成、生产力、金融、社交这五类 API 能力。",
        ]
    )
    lines.append("")
    lines.append("## 重点作者")
    for author in docs["document2"]["top10Authors"][:5]:
        lines.append(
            f"- @{author['author']}：总技能={author['totalSkills']}，10K+={author['numberOf10kPlusSkills']}，API复用={author['apiReuseLikelihood']}，模板化={author['templateUsage']}"
        )
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def write_outputs(md_path: Path, public_md_path: Path, docx_path: Path, public_docx_path: Path, content: str) -> None:
    md_path.parent.mkdir(parents=True, exist_ok=True)
    public_md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(content, encoding="utf-8")
    public_md_path.write_text(content, encoding="utf-8")
    lines = content.splitlines()
    write_docx(docx_path, lines)
    write_docx(public_docx_path, lines)


def main() -> None:
    payload = load_payload()
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_REPORT_DIR.mkdir(parents=True, exist_ok=True)

    zh_report = build_chinese_report(payload)
    write_outputs(ZH_MD, PUBLIC_ZH_MD, ZH_DOCX, PUBLIC_ZH_DOCX, zh_report)

    boss_en = build_boss_brief_en(payload)
    write_outputs(BOSS_EN_MD, PUBLIC_BOSS_EN_MD, BOSS_EN_DOCX, PUBLIC_BOSS_EN_DOCX, boss_en)

    boss_zh = build_boss_brief_zh(payload)
    write_outputs(BOSS_ZH_MD, PUBLIC_BOSS_ZH_MD, BOSS_ZH_DOCX, PUBLIC_BOSS_ZH_DOCX, boss_zh)

    print(f"Wrote {ZH_MD}")
    print(f"Wrote {ZH_DOCX}")
    print(f"Wrote {BOSS_EN_MD}")
    print(f"Wrote {BOSS_EN_DOCX}")
    print(f"Wrote {BOSS_ZH_MD}")
    print(f"Wrote {BOSS_ZH_DOCX}")


if __name__ == "__main__":
    main()
