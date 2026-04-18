#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import tarfile
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
DATA_DIR = PUBLIC_DIR / "data"
DOWNLOADS_DIR = PUBLIC_DIR / "downloads"
CLAWHUB_INDEX_PATH = DOWNLOADS_DIR / "clawHub" / "index.json"
GITHUB_INDEX_PATH = DOWNLOADS_DIR / "github" / "index.json"
OUTPUT_PATH = DATA_DIR / "aisa-api-analysis.json"

OFFICIAL_CHAT_DOC = "https://docs.aisa.one/reference/createchatcompletion"
OFFICIAL_CHAT_ENDPOINT = "/v1/chat/completions"

TEXT_EXTENSIONS = {
    ".md",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".yaml",
    ".yml",
    ".sh",
    ".txt",
    ".toml",
}

FULL_URL_PATTERN = re.compile(r"https://api\.aisa\.one(?P<path>/(?:apis/)?v1/[A-Za-z0-9_./:{}?=&%-]+)")
RELATIVE_PATH_PATTERN = re.compile(r"(?<![A-Za-z0-9])(/(?:(?:apis/)?v1/)?[A-Za-z0-9][A-Za-z0-9_./:{}-]*)(?![A-Za-z0-9])")
OPENAI_AISA_BASE_URL_PATTERN = re.compile(r"https://api\.aisa\.one(?:/(?:apis/)?v1)?/?")
CHAT_COMPLETIONS_CALL_PATTERN = re.compile(r"\bchat\s*\.\s*completions\s*\.\s*create\s*\(")
FRONTMATTER_NAME_PATTERN = re.compile(r'^\s*name:\s*["\']?(?P<name>[^\n"\']+)["\']?\s*$', re.MULTILINE)
FRONTMATTER_DESCRIPTION_PATTERN = re.compile(
    r'^\s*description:\s*["\']?(?P<description>[^\n"\']+)["\']?\s*$',
    re.MULTILINE,
)


@dataclass(frozen=True)
class EndpointRule:
    prefix: str
    name: str
    method: str
    input_summary: str
    output_summary: str
    comparison: str
    doc_url: str | None = None


ENDPOINT_RULES: list[EndpointRule] = [
    EndpointRule(
        prefix="/v1/chat/completions",
        name="OpenAI Chat Completions",
        method="POST",
        input_summary="model, messages, stream, functions/function_call",
        output_summary="choices[].message, usage, finish_reason",
        comparison="与官方 createchatcompletion 文档直接对应",
        doc_url=OFFICIAL_CHAT_DOC,
    ),
    EndpointRule(
        prefix="/v1/models",
        name="OpenAI-Compatible Models",
        method="GET",
        input_summary="可选 model id / provider 过滤",
        output_summary="可用模型列表、能力信息",
        comparison="不在 createchatcompletion 单页内，属于同一 OpenAI-compatible 家族",
    ),
    EndpointRule(
        prefix="/apis/v1/scholar/search/web",
        name="Scholar Web Search",
        method="POST",
        input_summary="query、count、搜索过滤条件",
        output_summary="results[]、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/scholar/search/scholar",
        name="Scholar Academic Search",
        method="POST",
        input_summary="query、年份过滤、结果数",
        output_summary="papers/results[]、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/scholar/search/smart",
        name="Scholar Smart Search",
        method="POST",
        input_summary="query、count、混合检索参数",
        output_summary="results[]、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/scholar/explain",
        name="Scholar Explain",
        method="POST",
        input_summary="query、检索结果、解释/置信度参数",
        output_summary="explanation、confidence、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/tavily/search",
        name="Tavily Search",
        method="POST",
        input_summary="query、topic、time_range、domains、depth",
        output_summary="results[]、answer/summary、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/tavily/extract",
        name="Tavily Extract",
        method="POST",
        input_summary="urls[]、抽取配置",
        output_summary="results[]、cleaned content、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/tavily/crawl",
        name="Tavily Crawl",
        method="POST",
        input_summary="url、爬取深度/范围参数",
        output_summary="pages/results[]、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/tavily/map",
        name="Tavily Map",
        method="POST",
        input_summary="url、站点映射参数",
        output_summary="mapped pages、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用搜索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/perplexity/sonar",
        name="Perplexity Sonar",
        method="POST",
        input_summary="query、model、可选 citations 参数",
        output_summary="answer、citations、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用推理/研究接口",
    ),
    EndpointRule(
        prefix="/apis/v1/perplexity/sonar-pro",
        name="Perplexity Sonar Pro",
        method="POST",
        input_summary="query、model、可选 citations 参数",
        output_summary="answer、citations、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用推理/研究接口",
    ),
    EndpointRule(
        prefix="/apis/v1/perplexity/sonar-reasoning-pro",
        name="Perplexity Sonar Reasoning Pro",
        method="POST",
        input_summary="query、推理模型参数",
        output_summary="answer、citations、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用推理/研究接口",
    ),
    EndpointRule(
        prefix="/apis/v1/perplexity/sonar-deep-research",
        name="Perplexity Sonar Deep Research",
        method="POST",
        input_summary="query、深度研究参数",
        output_summary="answer、citations、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA 专用推理/研究接口",
    ),
    EndpointRule(
        prefix="/apis/v1/services/aigc/video-generation/video-synthesis",
        name="AIGC Video Synthesis",
        method="POST",
        input_summary="prompt、model、媒体生成参数",
        output_summary="task_id、status、usage",
        comparison="不在 createchatcompletion 单页内，属于 AISA AIGC 服务接口",
    ),
    EndpointRule(
        prefix="/apis/v1/services/aigc/tasks",
        name="AIGC Task Status",
        method="GET",
        input_summary="task_id",
        output_summary="task status、result url、error info",
        comparison="不在 createchatcompletion 单页内，属于 AISA AIGC 服务接口",
    ),
    EndpointRule(
        prefix="/apis/v1/youtube/search",
        name="YouTube Search",
        method="GET",
        input_summary="q/query、engine、channel/video filters",
        output_summary="videos/channels/playlists results",
        comparison="不在 createchatcompletion 单页内，属于 AISA 媒体检索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/search/full",
        name="Search Full",
        method="GET",
        input_summary="query、排序/过滤参数",
        output_summary="全量搜索结果",
        comparison="不在 createchatcompletion 单页内，属于 AISA 检索接口",
    ),
    EndpointRule(
        prefix="/apis/v1/search/smart",
        name="Search Smart",
        method="GET",
        input_summary="query、智能搜索参数",
        output_summary="智能聚合搜索结果",
        comparison="不在 createchatcompletion 单页内，属于 AISA 检索接口",
    ),
]

FAMILY_RULES: list[EndpointRule] = [
    EndpointRule(
        prefix="/apis/v1/twitter/",
        name="Twitter API",
        method="GET",
        input_summary="userName、tweetId、query、list/community ids、分页参数",
        output_summary="tweets/users/lists/community data",
        comparison="不在 createchatcompletion 单页内，属于 AISA Twitter 专用接口",
    ),
    EndpointRule(
        prefix="/apis/v1/financial/",
        name="Financial API",
        method="GET",
        input_summary="ticker、date range、interval、market filters",
        output_summary="prices/fundamentals/news/ownership data",
        comparison="不在 createchatcompletion 单页内，属于 AISA 金融数据接口",
    ),
    EndpointRule(
        prefix="/apis/v1/polymarket/",
        name="Polymarket API",
        method="GET",
        input_summary="market_slug、token_id、wallet、search 参数",
        output_summary="markets/orderbooks/activity/positions data",
        comparison="不在 createchatcompletion 单页内，属于 AISA 预测市场接口",
    ),
    EndpointRule(
        prefix="/apis/v1/kalshi/",
        name="Kalshi API",
        method="GET",
        input_summary="ticker、search 参数",
        output_summary="markets/orderbooks/trades data",
        comparison="不在 createchatcompletion 单页内，属于 AISA 预测市场接口",
    ),
    EndpointRule(
        prefix="/apis/v1/matching-markets/",
        name="Market Matching API",
        method="GET",
        input_summary="kalshi_event_ticker、polymarket_market_slug、date",
        output_summary="跨市场匹配结果",
        comparison="不在 createchatcompletion 单页内，属于 AISA 预测市场接口",
    ),
]

TWITTER_POST_ENDPOINTS = {
    "/apis/v1/twitter/auth_twitter": "POST",
    "/apis/v1/twitter/post_twitter": "POST",
}


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def is_text_member(name: str) -> bool:
    lower = name.lower()
    if any(lower.endswith(ext) for ext in TEXT_EXTENSIONS):
        return True
    base = Path(name).name
    return "." not in base and base.upper() in {"SKILL", "README", "LICENSE"}


def read_archive_texts(archive_path: Path) -> list[tuple[str, str]]:
    texts: list[tuple[str, str]] = []
    if archive_path.suffix == ".zip":
        with zipfile.ZipFile(archive_path) as archive:
            for member_name in archive.namelist():
                if not is_text_member(member_name):
                    continue
                try:
                    text = archive.read(member_name).decode("utf-8", "ignore")
                except Exception:
                    continue
                texts.append((member_name, text))
        return texts

    with tarfile.open(archive_path, "r:gz") as archive:
        for member in archive.getmembers():
            if not member.isfile() or not is_text_member(member.name):
                continue
            try:
                extracted = archive.extractfile(member)
                if extracted is None:
                    continue
                text = extracted.read().decode("utf-8", "ignore")
            except Exception:
                continue
            texts.append((member.name, text))
    return texts


def normalize_endpoint(path: str) -> str | None:
    cleaned = path.strip().strip('\'"`').rstrip(").,;")
    cleaned = cleaned.split("?", 1)[0]
    cleaned = cleaned.replace("https://api.aisa.one", "")
    cleaned = re.sub(r"/\{[^}]+\}", "", cleaned)
    if cleaned.endswith("/"):
        cleaned = cleaned[:-1]
    if not cleaned.startswith("/"):
        cleaned = f"/{cleaned}"

    if cleaned.startswith("/v1/"):
        return cleaned
    if cleaned.startswith("/apis/v1/"):
        return cleaned
    if cleaned.startswith("/scholar/") or cleaned.startswith("/tavily/") or cleaned.startswith("/twitter/"):
        return f"/apis/v1{cleaned}"
    if cleaned.startswith("/financial/") or cleaned.startswith("/youtube/") or cleaned.startswith("/perplexity/"):
        return f"/apis/v1{cleaned}"
    if cleaned.startswith("/services/") or cleaned.startswith("/search/"):
        return f"/apis/v1{cleaned}"
    if cleaned.startswith("/polymarket/") or cleaned.startswith("/kalshi/") or cleaned.startswith("/matching-markets/"):
        return f"/apis/v1{cleaned}"
    return None


def is_known_endpoint(path: str) -> bool:
    for rule in ENDPOINT_RULES:
        if path == rule.prefix:
            return True
    for rule in FAMILY_RULES:
        if path.startswith(rule.prefix):
            return True
    return False


def extract_endpoints_from_text(text: str) -> list[str]:
    raw_paths: list[str] = []
    for match in FULL_URL_PATTERN.finditer(text):
        raw_paths.append(match.group("path"))

    if "api.aisa.one" in text or "AISA API" in text or "AIsa API" in text or "/apis/v1/" in text:
        for match in RELATIVE_PATH_PATTERN.finditer(text):
            raw = match.group(1)
            if raw.startswith("/docs.") or raw.startswith("/workspace/") or raw.startswith("/usr/") or raw.startswith("/mnt/"):
                continue
            raw_paths.append(raw)

    normalized = []
    for raw in raw_paths:
        endpoint = normalize_endpoint(raw)
        if endpoint and is_known_endpoint(endpoint):
            normalized.append(endpoint)
    return sorted(set(normalized))


def infer_sdk_endpoints_from_text(text: str) -> list[str]:
    inferred: set[str] = set()

    uses_aisa_base_url = bool(OPENAI_AISA_BASE_URL_PATTERN.search(text)) and "base_url" in text
    if uses_aisa_base_url and CHAT_COMPLETIONS_CALL_PATTERN.search(text):
        inferred.add(OFFICIAL_CHAT_ENDPOINT)

    return sorted(inferred)


def parse_skill_metadata(texts: Iterable[tuple[str, str]]) -> tuple[str | None, str | None]:
    name = None
    description = None
    for member_name, text in texts:
        if Path(member_name).name != "SKILL.md":
            continue
        name_match = FRONTMATTER_NAME_PATTERN.search(text)
        description_match = FRONTMATTER_DESCRIPTION_PATTERN.search(text)
        if name_match:
            name = name_match.group("name").strip()
        if description_match:
            description = description_match.group("description").strip()
        break
    return name, description


def classify_file_kind(member_name: str) -> str:
    suffix = Path(member_name).suffix.lower()
    if suffix in {".py", ".js", ".ts", ".tsx", ".jsx", ".sh", ".mjs", ".cjs"}:
        return "code"
    if suffix in {".md", ".txt"} or Path(member_name).name.upper() == "SKILL.MD":
        return "doc"
    return "config"


def endpoint_descriptor(endpoint: str) -> EndpointRule:
    for rule in ENDPOINT_RULES:
        if endpoint == rule.prefix:
            return rule
    for rule in FAMILY_RULES:
        if endpoint.startswith(rule.prefix):
            method = rule.method
            if endpoint in TWITTER_POST_ENDPOINTS:
                method = TWITTER_POST_ENDPOINTS[endpoint]
            path_tail = endpoint[len(rule.prefix) :].strip("/")
            pretty_tail = path_tail.replace("_", " ").replace("-", " ").replace("/", " / ").title() or "Root"
            return EndpointRule(
                prefix=endpoint,
                name=f"{rule.name}: {pretty_tail}",
                method=method,
                input_summary=rule.input_summary,
                output_summary=rule.output_summary,
                comparison=rule.comparison,
                doc_url=rule.doc_url,
            )
    return EndpointRule(
        prefix=endpoint,
        name=endpoint.split("/")[-1].replace("-", " ").replace("_", " ").title(),
        method="未知",
        input_summary="待从实现中补充",
        output_summary="待从实现中补充",
        comparison="未匹配到已知规则",
    )


def source_label(source_type: str) -> str:
    return "GitHub" if source_type == "github" else "ClawHub"


def build_skill_record(item: dict, source_type: str) -> dict:
    archive_path = ROOT / item["file"]
    texts = read_archive_texts(archive_path)
    extracted_name, extracted_description = parse_skill_metadata(texts)
    occurrences: dict[str, dict[str, set[str]]] = {}

    for member_name, text in texts:
        endpoints = sorted(set(extract_endpoints_from_text(text) + infer_sdk_endpoints_from_text(text)))
        if not endpoints:
            continue
        kind = classify_file_kind(member_name)
        for endpoint in endpoints:
            bucket = occurrences.setdefault(endpoint, {"files": set(), "code_files": set(), "doc_files": set()})
            bucket["files"].add(member_name)
            if kind == "code":
                bucket["code_files"].add(member_name)
            elif kind == "doc":
                bucket["doc_files"].add(member_name)

    endpoints = []
    for endpoint, details in sorted(occurrences.items()):
        descriptor = endpoint_descriptor(endpoint)
        if details["code_files"]:
            status = "implemented"
        elif details["doc_files"]:
            status = "documented_only"
        else:
            status = "referenced_only"
        endpoints.append(
            {
                "endpoint": endpoint,
                "name": descriptor.name,
                "method": descriptor.method,
                "status": status,
                "files": sorted(details["files"]),
                "codeFiles": sorted(details["code_files"]),
                "docFiles": sorted(details["doc_files"]),
                "comparisonToCreateChatCompletion": descriptor.comparison,
                "officialDocUrl": descriptor.doc_url,
            }
        )

    name = item.get("name") or extracted_name or item.get("repo") or item.get("slug")
    if source_type == "github" and extracted_name:
        name = extracted_name
    description = item.get("description") or extracted_description or ""
    source_url = item.get("githubUrl") or item.get("clawhubUrl") or item.get("downloadUrl")
    display_source = source_label(source_type)

    primary_group = sorted({endpoint["endpoint"] for endpoint in endpoints})[0] if endpoints else "none"
    family_groups = sorted({endpoint["endpoint"] for endpoint in endpoints})

    skill_dir = item.get("skillDir")
    repo = item.get("repo")
    if skill_dir and skill_dir != "." and repo:
        unique_id = f"{repo}:{skill_dir}"
    else:
        unique_id = item.get("slug") or repo or skill_dir or archive_path.name

    return {
        "id": f"{source_type}:{item.get('owner', 'unknown')}:{unique_id}",
        "name": name,
        "description": description,
        "owner": item.get("owner", ""),
        "sourceType": source_type,
        "sourceLabel": display_source,
        "sourceUrl": source_url,
        "downloadFile": item["file"],
        "downloadPath": item["file"].replace("public/", "", 1),
        "repo": item.get("repo"),
        "skillDir": item.get("skillDir"),
        "archiveType": item.get("archiveType") or archive_path.suffix.lstrip("."),
        "endpoints": endpoints,
        "endpointCount": len(endpoints),
        "implementedEndpointCount": sum(1 for endpoint in endpoints if endpoint["status"] == "implemented"),
        "documentedOnlyEndpointCount": sum(1 for endpoint in endpoints if endpoint["status"] == "documented_only"),
        "hasOfficialChatCompletion": any(endpoint["endpoint"] == OFFICIAL_CHAT_ENDPOINT for endpoint in endpoints),
        "implementationStatus": "implemented" if any(endpoint["status"] == "implemented" for endpoint in endpoints) else "documented_only" if endpoints else "not_found",
        "primaryInterfaceGroup": primary_group,
        "interfaceGroups": family_groups,
    }


def main() -> None:
    clawhub_index = read_json(CLAWHUB_INDEX_PATH)
    github_index = read_json(GITHUB_INDEX_PATH)

    skills = [build_skill_record(item, "clawhub") for item in clawhub_index["items"]]
    skills.extend(build_skill_record(item, "github") for item in github_index["items"])
    skills.sort(key=lambda item: (item["sourceType"], item["owner"].lower(), item["name"].lower()))

    interface_map: dict[str, dict] = {}

    seeded = endpoint_descriptor(OFFICIAL_CHAT_ENDPOINT)
    interface_map[OFFICIAL_CHAT_ENDPOINT] = {
        "endpoint": OFFICIAL_CHAT_ENDPOINT,
        "name": seeded.name,
        "method": seeded.method,
        "inputSummary": seeded.input_summary,
        "outputSummary": seeded.output_summary,
        "comparisonToCreateChatCompletion": seeded.comparison,
        "officialDocUrl": seeded.doc_url,
        "skills": [],
        "skillsBySource": {"clawhub": 0, "github": 0},
        "implementedSkillCount": 0,
        "inferredSkillCount": 0,
        "documentedOnlySkillCount": 0,
        "hasImplementation": False,
    }

    for skill in skills:
        for endpoint in skill["endpoints"]:
            descriptor = endpoint_descriptor(endpoint["endpoint"])
            interface_entry = interface_map.setdefault(
                endpoint["endpoint"],
                {
                    "endpoint": endpoint["endpoint"],
                    "name": descriptor.name,
                    "method": descriptor.method,
                    "inputSummary": descriptor.input_summary,
                    "outputSummary": descriptor.output_summary,
                    "comparisonToCreateChatCompletion": descriptor.comparison,
                    "officialDocUrl": descriptor.doc_url,
                    "skills": [],
                    "skillsBySource": {"clawhub": 0, "github": 0},
                    "implementedSkillCount": 0,
                    "inferredSkillCount": 0,
                    "documentedOnlySkillCount": 0,
                    "hasImplementation": False,
                },
            )

            interface_entry["skills"].append(
                {
                    "skillId": skill["id"],
                    "skillName": skill["name"],
                    "owner": skill["owner"],
                    "sourceType": skill["sourceType"],
                    "sourceLabel": skill["sourceLabel"],
                    "sourceUrl": skill["sourceUrl"],
                    "downloadPath": skill["downloadPath"],
                    "status": endpoint["status"],
                }
            )
            interface_entry["skillsBySource"][skill["sourceType"]] += 1
            if endpoint["status"] == "implemented":
                interface_entry["implementedSkillCount"] += 1
                interface_entry["hasImplementation"] = True
            elif endpoint["status"] == "documented_only":
                interface_entry["documentedOnlySkillCount"] += 1

    implemented_endpoints = {interface["endpoint"] for interface in interface_map.values() if interface["implementedSkillCount"] > 0}
    interfaces = sorted(interface_map.values(), key=lambda item: item["endpoint"])
    for interface in interfaces:
        interface["skills"].sort(key=lambda item: (item["status"], item["sourceType"], item["owner"].lower(), item["skillName"].lower()))
        interface["skillCount"] = len(interface["skills"])
        inferred_count = 0
        if not interface["hasImplementation"]:
            for endpoint in implemented_endpoints:
                if endpoint.startswith(f"{interface['endpoint']}/") or interface["endpoint"].startswith(f"{endpoint}/"):
                    inferred_count += 1
            interface["inferredSkillCount"] = inferred_count

        if interface["hasImplementation"]:
            interface["coverageStatus"] = "implemented"
        elif interface["inferredSkillCount"] > 0:
            interface["coverageStatus"] = "inferred_implementation"
        else:
            interface["coverageStatus"] = "documented_only"

    grouped_implementations = {}
    for interface in interfaces:
        if interface["skillCount"] <= 1:
            continue
        grouped_implementations[interface["endpoint"]] = {
            "endpoint": interface["endpoint"],
            "name": interface["name"],
            "skills": [
                {
                    "skillId": skill["skillId"],
                    "skillName": skill["skillName"],
                    "owner": skill["owner"],
                    "sourceType": skill["sourceType"],
                    "sourceUrl": skill["sourceUrl"],
                }
                for skill in interface["skills"]
            ],
        }

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "comparisonBase": {
            "name": "AISA createChatCompletion",
            "endpoint": OFFICIAL_CHAT_ENDPOINT,
            "docUrl": OFFICIAL_CHAT_DOC,
            "note": "本分析以 createchatcompletion 文档作为官方对比基线；其它 AISA 专用接口会标记为该文档之外的专用接口族。",
        },
        "summary": {
            "totalSkills": len(skills),
            "clawhubSkills": sum(1 for skill in skills if skill["sourceType"] == "clawhub"),
            "githubSkills": sum(1 for skill in skills if skill["sourceType"] == "github"),
            "skillsWithEndpoints": sum(1 for skill in skills if skill["endpointCount"] > 0),
            "skillsWithoutEndpoints": sum(1 for skill in skills if skill["endpointCount"] == 0),
            "totalInterfaces": len(interfaces),
            "implementedInterfaces": sum(1 for interface in interfaces if interface["coverageStatus"] == "implemented"),
            "unimplementedDocumentedInterfaces": sum(1 for interface in interfaces if interface["coverageStatus"] != "implemented"),
        },
        "interfaces": interfaces,
        "skills": skills,
        "implementationGroups": list(grouped_implementations.values()),
    }

    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
