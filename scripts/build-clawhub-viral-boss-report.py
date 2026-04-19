#!/usr/bin/env python3
from __future__ import annotations

import json
import zipfile
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape


DATA_PATH = Path("public/data/clawhub-multi-ranking-report.json")
TEST_EVIDENCE_PATH = Path("reports/AISA_Breakout_Test_Evidence_ZH.md")
OUTPUT_MD = Path("reports/ClawHub_Viral_Boss_Report_ZH.md")
OUTPUT_DOCX = Path("reports/ClawHub_Viral_Boss_Report_ZH.docx")
PUBLIC_MD = Path("public/reports/ClawHub_Viral_Boss_Report_ZH.md")
PUBLIC_DOCX = Path("public/reports/ClawHub_Viral_Boss_Report_ZH.docx")

RANKING_URLS = [
    "https://clawhub.ai/skills?sort=downloads&dir=desc",
    "https://clawhub.ai/skills?sort=stars&dir=desc",
    "https://clawhub.ai/skills?sort=installs&dir=desc",
]

AUTHOR_NOTES = {
    "pskoett": {
        "thesis": "用单一强叙事把抽象 agent 能力包装成强身份认同产品。",
        "copy": [
            "把 skill 做成一个方法论符号，而不是一个普通工具名。",
            "持续围绕同一能力核迭代，而不是频繁换赛道。",
            "把“失败后更强、纠错后更强”这种用户感知极强的价值讲透。",
        ],
    },
    "spclaudehome": {
        "thesis": "抓住安全焦虑和安装前决策点，用极强的任务清晰度吃下高转化。",
        "copy": [
            "skill 标题就是动作本身，用户不用猜。",
            "先占安装前入口，再扩展到周边审计能力。",
            "让输出直接变成决策，而不是仅提供信息。",
        ],
    },
    "steipete": {
        "thesis": "以高频日常工具组成作品集矩阵，靠多入口、多场景长期收割安装量。",
        "copy": [
            "一个作者名下同时运营 Github、Weather、PDF、Workspace、Media 等多入口技能。",
            "每个 skill 都是一个非常明确的高频任务，而不是泛平台说明。",
            "把日常工作流做成驻留型技能，安装后不容易删。",
        ],
    },
    "ivangdavila": {
        "thesis": "一边做 agent 叙事，一边做文档/办公等高需求工具，把吸引力和实用性放在同一作品集里。",
        "copy": [
            "旗舰 skill 负责拿关注和收藏。",
            "文档工具类 skill 负责吃持续需求和下载。",
            "围绕‘效率提升 + 自动执行’建立统一作者心智。",
        ],
    },
    "halthelobster": {
        "thesis": "作品少但定位极准，用更强的主动性叙事做高粘性技能。",
        "copy": [
            "少做，不乱做，只做高辨识度入口。",
            "主动性和 second brain 都指向长期陪伴型能力。",
            "高星标背后是强世界观，而不只是单次功能。",
        ],
    },
    "gpyangyoujun": {
        "thesis": "抓住搜索和消费决策这类高需求入口，用简单名字换来直接下载。",
        "copy": [
            "搜索类入口天然高频，尤其适合 API 化。",
            "保持名字可检索，而不是追求酷炫表达。",
            "先用广需求技能吸量，再往垂直 SKU 扩展。",
        ],
    },
    "byungkyu": {
        "thesis": "围绕 API/办公/获客等强业务场景批量铺开，是典型的 B2B 工具作者打法。",
        "copy": [
            "把多个具体业务动作拆成独立 skill。",
            "覆盖邮件、YouTube、PDF、获客等明确职能任务。",
            "更像产品组合管理，而不是单点创意。",
        ],
    },
    "ide-rea": {
        "thesis": "用本地化搜索和中文生态入口拿差异化市场，是区域型分发打法。",
        "copy": [
            "优先做被国际作者忽视的区域需求。",
            "围绕百度等本地入口建立护城河。",
            "用本地生态替代英文通用入口，降低竞争强度。",
        ],
    },
}

SKILL_NOTES = {
    "self-improving-agent": {
        "job": "把失败、纠错、反馈变成持续学习能力。",
        "why": ["名字直接命中 agent 圈最强叙事。", "下载、星标、安装三榜全第一，说明传播、认可、留存同时成立。", "用户安装它不是为了单次任务，而是为了让整个 agent 系统变强。"],
        "copy": ["先做一个超级清晰的方法论入口。", "让 skill 成为‘系统升级器’，而不是工具箱。", "围绕失败纠错、记忆、改进沉淀周边变体。"],
        "aisa": "中。更适合做 AISA 的编排层、记忆层、评分层，而不是单一 API 包装器。",
    },
    "Skill Vetter": {
        "job": "在安装任何 skill 前先做安全审查。",
        "why": ["任务极窄，用户一眼知道什么时候用。", "安全是高风险决策点，所以天然转化强。", "输出是决策，不是描述，因此安装留存都高。"],
        "copy": ["选一个高风险、高决策价值的入口。", "把结果做成通过/警告/阻断，而不是泛泛建议。", "后续可扩成插件审计、权限审计、依赖审计矩阵。"],
        "aisa": "高。可转成统一安全扫描 API、风险解释 API、skill 审计 API。",
    },
    "ontology": {
        "job": "为 agent 和复杂工作流提供结构化知识图谱与约束。",
        "why": ["服务的是高价值用户群。", "概念高级，带来收藏和传播。", "一旦接入流程，切换成本较高。"],
        "copy": ["把复杂能力变成高级但具体的系统概念。", "重点服务高价值少数人群，而不是所有人。", "通过约束、结构、共享记忆形成粘性。"],
        "aisa": "中高。适合做知识图谱、实体关系、记忆结构化 API。",
    },
    "Self-Improving + Proactive Agent": {
        "job": "既能持续学习，又能主动帮用户推进任务。",
        "why": ["把两个最能激发想象力的 agent 叙事叠在一起。", "既有强传播性，也有较强安装留存。", "作者又用大量实用工具 skill 放大整体作品集势能。"],
        "copy": ["把能力叙事做成组合拳。", "用旗舰叙事 skill 吸量，再用实用工具承接。", "通过作者作品集放大单个 skill 的势能。"],
        "aisa": "中。更适合做上层 agent 编排产品，而非单点底层 API。",
    },
    "Github": {
        "job": "用最短路径完成 GitHub 仓库与开发工作流操作。",
        "why": ["标题就是平台名，搜索心智极强。", "开发者高频场景，安装后常驻。", "对 AI 编码用户来说几乎是刚需入口。"],
        "copy": ["平台名 + 核心任务，是最稳的高意图命名。", "优先做开发者每天都碰到的入口。", "围绕 repo、PR、issue、release 拆分多个子 skill。"],
        "aisa": "极高。可直接转成 GitHub research、PR review、issue triage、release watch API。",
    },
    "Gog": {
        "job": "统一调用 Gmail、Calendar、Drive、Docs 等 Google Workspace 工具。",
        "why": ["一个入口覆盖多个高频办公动作。", "强日常性带来高安装。", "用户知道它会长期驻留，所以愿意保留。"],
        "copy": ["做统一工作台，而不是只做一个点。", "先覆盖最常用的办公能力，再往团队协作扩。", "把多工具打包成一个 command center。"],
        "aisa": "极高。适合做 Google Workspace unified API 和办公自动化套餐。",
    },
    "Proactive Agent": {
        "job": "让 agent 不等命令，主动推进工作。",
        "why": ["主动性是高价值用户最想要的特征。", "标题短且强，传播力很高。", "和 second brain 组合后形成长期陪伴型叙事。"],
        "copy": ["围绕主动性、持续性、陪伴型价值做表达。", "功能不必极多，但叙事必须足够强。", "与知识管理、计划执行类能力天然互补。"],
        "aisa": "中。更适合和通知、计划、记忆、执行 API 组合成上层产品。",
    },
    "Weather": {
        "job": "快速查询天气并直接服务决策。",
        "why": ["超级高频、超级低门槛。", "名字极短，用户没有理解成本。", "虽然不炫技，但安装留存非常强。"],
        "copy": ["不要忽视低门槛高频工具。", "越常用、越简单，越容易留存。", "这种入口最适合作为 API 消耗型业务。"],
        "aisa": "极高。可做天气 API、出行建议 API、通知 API 套餐。",
    },
    "Multi Search Engine": {
        "job": "一次性搜索多个来源并拿到更好的检索结果。",
        "why": ["搜索本身就是高频需求。", "多源聚合让用户天然感知价值。", "对 agent 和研究类用户都通用。"],
        "copy": ["一个聚合价值就能成为卖点。", "搜索类产品最适合做 API 家族。", "先做通用入口，再拆学术、新闻、地区搜索。"],
        "aisa": "极高。可扩 Tavily、Serp、学术、新闻、本地搜索等整个家族。",
    },
    "Obsidian": {
        "job": "把 AI 能力嵌进知识管理工作流。",
        "why": ["绑定强工作流平台。", "安装后切换成本高。", "用户使用频率高，容易常驻。"],
        "copy": ["优先绑定强平台。", "平台型入口适合长期安装。", "围绕知识管理可延展大量周边能力。"],
        "aisa": "高。可转知识管理、笔记搜索、笔记生成、知识库同步 API。",
    },
    "Nano Banana Pro": {
        "job": "快速生成高质量图像/媒体内容。",
        "why": ["媒体生成仍然具备天然传播性。", "结果可见，容易做展示。", "高频创作人群愿意持续使用。"],
        "copy": ["可见结果最容易传播。", "同一模型能力可拆出多个内容场景包。", "需要用样例和展示强化转化。"],
        "aisa": "高。媒体生成一直是 AISA 强变现方向。",
    },
}

AISA_TRANSFORM = [
    ("Github", "GitHub Research / PR Review / Issue Triage API", "极高", "开发者高频、留存强、适合团队付费"),
    ("Gog", "Google Workspace Unified API", "极高", "办公场景多、可卖团队席位和自动化额度"),
    ("Weather", "Weather + Travel Decision API", "高", "高频低门槛，适合按调用量收费"),
    ("Multi Search Engine", "Search Aggregation API Family", "极高", "天然 API 化，能做多层套餐"),
    ("Word / DOCX / Excel / PPTX", "Document Office API Family", "高", "办公文档场景明确，企业付费意愿高"),
    ("Playwright Automation", "Browser Automation / MCP API", "高", "自动化价值高，适合高阶套餐"),
    ("Skill Vetter", "Security Audit API", "高", "高风险决策场景，客单价可高"),
    ("Nano Banana Pro", "Image / Video Generation API", "高", "展示强，适合用量收费"),
]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


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


def ranking_item(payload: dict[str, Any], sort_key: str, rank: int) -> dict[str, Any]:
    return next(item for item in payload["rankings"][sort_key]["top10"] if item["rank"] == rank)


def build_markdown(payload: dict[str, Any], test_evidence: str) -> str:
    lines: list[str] = []
    lines.append("# ClawHub 爆款技能与爆款作者系统总报告（老板版）")
    lines.append("")
    lines.append(f"- 生成时间：{payload['generatedAt']}")
    lines.append("- 数据范围：ClawHub 当前 downloads / stars / installs 三榜 Top 100")
    lines.append(f"- 数据来源：{'、'.join(RANKING_URLS)}")
    lines.append("")
    lines.append("## 一、结论先行")
    lines.extend(
        [
            "- 真正的爆款 skill 不是单靠下载量冲起来的，而是同时具备被发现、被收藏、被长期留在工作流里的能力。",
            "- 从三榜综合结果看，最强爆款集中在四类：agent 自进化、开发者工作流、搜索研究、日常高频工具。",
            "- 爆款作者不是“偶尔碰运气的人”，而是在运营作品集的人。他们要么围绕一个能力核持续迭代，要么用多个高频入口铺成矩阵。",
            "- 对 AISA 来说，最值得立即做的不是继续写更多普通 skill，而是围绕强需求 API 家族做旗舰包、窄场景包和中文镜像包。",
            "- 现有本地 AISA 包里，`aisa-twitter-api` 最适合先打成旗舰；之后应该继续扩 Twitter 家族、YouTube 家族，再补 GitHub / Workspace / Search 这些更高收入方向。",
        ]
    )
    lines.append("")

    lines.append("## 二、方法说明")
    lines.extend(
        [
            "- 本报告同时看 downloads、stars、installs 三榜，而不是只看下载量。",
            "- 下载代表被点开和被尝试，星标代表认可和传播，安装代表长期留存价值。",
            "- 只有同时在两榜或三榜都强的 skill，才算真正值得模仿的爆款。",
        ]
    )
    lines.append("")

    lines.append("## 三、重点爆款 skill 总结")
    top_skills = payload["crossRanking"]["topSkills"][:10]
    lines.extend(
        md_table(
            ["Skill", "作者", "上榜次数", "综合分", "下载/星标/安装"],
            [
                [
                    item["name"],
                    item["author"],
                    str(item["appearances"]),
                    str(item["compositeScore"]),
                    f"{item['downloads']} / {item['stars']} / {item['installsCurrent']}",
                ]
                for item in top_skills
            ],
        )
    )
    lines.append("")
    lines.append("### 为什么这些 skill 会成为爆款")
    lines.extend(
        [
            "- 名字就等于用户任务，几乎不需要解释。",
            "- 输出直接可用，用户第一次调用就能感知价值。",
            "- 很多 skill 不是只为单次使用设计，而是为长期装着用设计。",
            "- 爆款 skill 往往要么有强叙事，要么有强刚需，最好两者兼具。",
        ]
    )
    lines.append("")
    lines.append("### 有没有可复制的实操")
    lines.extend(
        [
            "- 有，而且非常明显：把抽象能力改写成高意图任务名。",
            "- 用一个旗舰包吃搜索和品牌心智，再用多个窄场景包吃转化。",
            "- 把输出做成决策结果、执行结果、或工作流结果，而不是单纯解释说明。",
            "- 同一底层 API 不要只发 1 个包，要围绕不同工作流拆成矩阵。",
        ]
    )
    lines.append("")
    lines.append("### 这些爆款 skill 的共同点")
    lines.extend(
        [
            "- 标题短、直接、可搜索。",
            "- 场景明确，不让用户猜什么时候用。",
            "- 结果可验证、可复用、可沉淀到日常流程里。",
            "- 很多都可以进一步产品化为 API 家族，而不是一次性 skill。",
        ]
    )
    lines.append("")

    lines.append("## 四、逐条拆解重点爆款 skill")
    for item in top_skills:
        note = SKILL_NOTES.get(item["name"], SKILL_NOTES.get(item["slug"], None))
        if note is None:
            continue
        lines.append("")
        lines.append(f"### {item['name']} | @{item['author']}")
        lines.append(f"- 三榜表现：downloads {item['downloads']}，stars {item['stars']}，installs {item['installsCurrent']}。")
        lines.append(f"- 核心任务：{note['job']}")
        lines.append("- 爆款原因：")
        lines.extend(f"  - {point}" for point in note["why"])
        lines.append("- 可复制打法：")
        lines.extend(f"  - {point}" for point in note["copy"])
        lines.append(f"- 是否适合转成 AISA API：{note['aisa']}")

    lines.append("")
    lines.append("## 五、爆款多产作者总结")
    top_authors = payload["crossRanking"]["topAuthors"][:8]
    lines.extend(
        md_table(
            ["作者", "上榜次数", "综合分", "代表作品", "为什么强"],
            [
                [
                    item["author"],
                    str(item["appearances"]),
                    str(item["score"]),
                    ", ".join(skill["name"] for skill in payload["crossRanking"]["topAuthorProfiles"].get(item["author"], {}).get("topSkills", [])[:3]),
                    AUTHOR_NOTES.get(item["author"], {}).get("thesis", "围绕稳定能力核做作品集"),
                ]
                for item in top_authors
            ],
        )
    )
    lines.append("")
    lines.append("### 为什么这些作者能多产，还能做出爆款")
    lines.extend(
        [
            "- 他们不是不停换方向，而是围绕一个能力核、一种用户群、一组工作流持续生产。",
            "- 他们懂得区分旗舰包和辅助包，不会把所有能力都塞进一个 skill 里。",
            "- 他们更像在经营产品组合，而不是在写孤立的脚本。",
        ]
    )
    lines.append("")
    lines.append("### 有没有可复制的作者级实操")
    lines.extend(
        [
            "- 先定一个能力核，再连续做 3 到 5 个变体，不要每个都重开世界。",
            "- 旗舰包负责拿心智，窄场景包负责吃安装，展示型包负责拿星标和传播。",
            "- 中文、本地化、行业化变体要尽快跟进，避免只做英文通用款。",
        ]
    )
    lines.append("")
    lines.append("### 爆款作者的共同点")
    lines.extend(
        [
            "- 作品集内部有明显主题，而不是完全随机。",
            "- skill 命名高度贴近用户搜索词。",
            "- 他们做的是“多入口系统”，不是“单入口豪华包”。",
            "- 他们理解什么适合长期安装，什么适合传播收藏。",
        ]
    )
    lines.append("")

    lines.append("## 六、逐条拆解爆款多产作者")
    for item in top_authors:
        author = item["author"]
        profile = payload["crossRanking"]["topAuthorProfiles"].get(author, {})
        note = AUTHOR_NOTES.get(author, {"thesis": "围绕稳定能力核做作品集", "copy": ["围绕一个能力核持续做矩阵。"]})
        lines.append("")
        lines.append(f"### @{author}")
        lines.append(f"- 综合表现：上榜 {item['appearances']} 次，综合分 {item['score']}。")
        lines.append(f"- 代表作：{', '.join(skill['name'] for skill in profile.get('topSkills', [])[:5])}")
        lines.append(f"- 生产方法判断：{note['thesis']}")
        lines.append("- 为什么能多产：")
        lines.extend(
            [
                "  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。",
                "  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。",
                "  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。",
            ]
        )
        lines.append("- 可复制实操：")
        lines.extend(f"  - {point}" for point in note["copy"])

    lines.append("")
    lines.append("## 七、AISA 应该怎么做，怎么落地")
    lines.extend(
        [
            "- AISA 不该继续平均发力，而要先做旗舰 skill，再做家族矩阵。",
            "- 最优先做法是：Twitter 家族先拿下，再补 YouTube 家族，随后切入 GitHub、Workspace、Search 这些收入更强的方向。",
            "- 现有本地 skill 已经完成第一轮包装升级，下一步重点不在重写代码，而在案例、分发、复盘和标题优化。",
        ]
    )
    lines.append("")
    lines.append("### 落地实施计划")
    lines.extend(
        [
            "- 第一阶段：把 `aisa-twitter-api` 作为官方旗舰包，对外统一成 `Twitter API Command Center` 口径。",
            "- 第二阶段：Twitter 家族形成矩阵，分成 Command Center、Growth Operator、Automation 3 个入口。",
            "- 第三阶段：YouTube 家族跟进，分成 `YouTube SERP Scout` 和 `YouTube Search API` 双层入口。",
            "- 第四阶段：基于市场缺口做 GitHub、Search、Workspace、Document Office 等 AISA API 家族。",
            "- 第五阶段：围绕真实使用数据继续做标题、示例请求、价格和套餐迭代。",
        ]
    )
    lines.append("")

    lines.append("## 八、哪些爆款 skill 最适合转成 AISA API，以及收益方向")
    lines.extend(
        md_table(
            ["参考爆款 skill", "AISA 可做的 API/skill", "收益潜力", "原因"],
            [[a, b, c, d] for a, b, c, d in AISA_TRANSFORM],
        )
    )
    lines.append("")
    lines.append("### 收益判断")
    lines.extend(
        [
            "- 最值得做高客单价的，是 GitHub、Workspace、Browser Automation、Security Audit。",
            "- 最适合做调用量收费的，是 Search、Weather、Media Generation。",
            "- 最适合做旗舰流量入口的，是 Twitter/X、YouTube、GitHub。",
            "- 最适合做企业套餐的，是文档办公、协作办公、浏览器自动化和安全审计。",
        ]
    )
    lines.append("")

    lines.append("## 九、测试与上线风险")
    lines.extend(
        [
            "- 本地 7 个 AISA runtime 包的静态校验和 CLI smoke test 已通过。",
            "- 使用用户提供的凭证进行真实线上测试时，`twitter/trends`、`twitter/auth_twitter`、`youtube/search` 已成功返回真实数据，但 `twitter/user/info` 仍出现 timeout。",
            "- 使用用户提供的 Python 3.12 和 GitHub Token 运行 `last30days` 时，已进入真实运行态，但 planner timeout、GitHub 查询 422、Reddit 公网抓取 timeout 仍然存在。",
            "- 这说明当前最大上线风险不只是包装问题，而是不同远端链路的稳定性不一致，需要在上线前做健康检查和降级策略。",
        ]
    )
    lines.append("")
    lines.append("### 治理建议")
    lines.extend(
        [
            "- 给所有 AISA 客户端增加更明确的超时、重试和错误分类。",
            "- 上线前至少为 Twitter、YouTube、Search 三条核心链路做独立健康检查。",
            "- 发布页必须明确说明哪些动作是读接口，哪些动作仍需 OAuth / 手工授权。",
            "- 把远端超时率纳入产品验收，而不是只看本地脚本是否能执行。",
        ]
    )
    lines.append("")

    lines.append("## 十、附录数据")
    lines.append("")
    lines.append("### A. downloads Top 10")
    lines.extend(
        md_table(
            ["排名", "Skill", "作者", "下载", "星标", "安装"],
            [
                [str(item["rank"]), item["name"], item["author"], str(item["downloads"]), str(item["stars"]), str(item["installsCurrent"])]
                for item in payload["rankings"]["downloads"]["top10"]
            ],
        )
    )
    lines.append("")
    lines.append("### B. stars Top 10")
    lines.extend(
        md_table(
            ["排名", "Skill", "作者", "下载", "星标", "安装"],
            [
                [str(item["rank"]), item["name"], item["author"], str(item["downloads"]), str(item["stars"]), str(item["installsCurrent"])]
                for item in payload["rankings"]["stars"]["top10"]
            ],
        )
    )
    lines.append("")
    lines.append("### C. installs Top 10")
    lines.extend(
        md_table(
            ["排名", "Skill", "作者", "下载", "星标", "安装"],
            [
                [str(item["rank"]), item["name"], item["author"], str(item["downloads"]), str(item["stars"]), str(item["installsCurrent"])]
                for item in payload["rankings"]["installs"]["top10"]
            ],
        )
    )
    lines.append("")
    lines.append("### D. 本地 AISA skill 优先级")
    lines.extend(
        md_table(
            ["Skill", "作者", "下载", "星标", "安装", "优先级说明"],
            [
                [item["name"], item["owner"], str(item["downloads"]), str(item["stars"]), str(item["installsCurrent"]), item["reason"]]
                for item in payload["aisaSnapshot"]["priorityOrder"]
            ],
        )
    )
    lines.append("")
    lines.append("### E. 当前测试证据摘要")
    lines.extend(test_evidence.strip().splitlines()[:60])
    lines.append("")
    return "\n".join(lines).strip() + "\n"


def main() -> None:
    payload = load_json(DATA_PATH)
    test_evidence = TEST_EVIDENCE_PATH.read_text(encoding="utf-8") if TEST_EVIDENCE_PATH.exists() else ""
    markdown = build_markdown(payload, test_evidence)
    OUTPUT_MD.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_MD.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_MD.write_text(markdown, encoding="utf-8")
    PUBLIC_MD.write_text(markdown, encoding="utf-8")
    write_docx(OUTPUT_DOCX, markdown.splitlines())
    write_docx(PUBLIC_DOCX, markdown.splitlines())
    print(f"Wrote {OUTPUT_MD} and public copies.")


if __name__ == "__main__":
    main()
