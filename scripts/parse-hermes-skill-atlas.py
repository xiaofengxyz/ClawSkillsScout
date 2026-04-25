#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from collections import Counter

import requests
from bs4 import BeautifulSoup

LIVE_URLS = [
    "https://hermes-agent.app/skills",
    "https://hermes-agent.app/en/skills",
]
RAW_URLS = [
    "https://raw.githubusercontent.com/NousResearch/hermes-agent/main/website/docs/reference/skills-catalog.md",
    "https://github.com/NousResearch/hermes-agent/raw/main/website/docs/reference/skills-catalog.md",
]
HEADERS = {
    "user-agent": "Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/)",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
}
LOCAL_CURL = shutil.which("curl")
WINDOWS_CURL_HOST = "/mnt/c/WINDOWS/System32/curl.exe" if os.path.exists("/mnt/c/WINDOWS/System32/curl.exe") else None


def compact(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", compact(value).lower()).strip("-")


def text_of(node) -> str:
    if node is None:
        return ""
    return compact(node.get_text(" ", strip=True))


def decode_command_output(raw: bytes) -> str:
    return raw.decode("utf-8", errors="replace")


def fetch_via_local_curl(url: str, timeout: int) -> str:
    if not LOCAL_CURL:
        raise RuntimeError("curl not available")

    result = subprocess.run(
        [
            LOCAL_CURL,
            "-fsSL",
            "--connect-timeout",
            "10",
            "--max-time",
            str(timeout),
            "-H",
            f"user-agent: {HEADERS['user-agent']}",
            "-H",
            f"accept: {HEADERS['accept']}",
            url,
        ],
        capture_output=True,
        timeout=timeout + 10,
    )
    if result.returncode != 0:
        raise RuntimeError(compact(decode_command_output(result.stderr or result.stdout or b"curl failed")))
    return decode_command_output(result.stdout)


def fetch_via_windows_curl(url: str, timeout: int) -> str:
    if not WINDOWS_CURL_HOST:
        raise RuntimeError("Windows curl host not available")

    result = subprocess.run(
        [
            WINDOWS_CURL_HOST,
            "-fsSL",
            "--connect-timeout",
            "10",
            "--max-time",
            str(timeout),
            url,
        ],
        capture_output=True,
        timeout=timeout + 10,
    )
    if result.returncode != 0:
        raise RuntimeError(compact(decode_command_output(result.stderr or result.stdout or b"Windows host curl fetch failed")))
    return decode_command_output(result.stdout)


def fetch_text(urls: list[str], timeout: int) -> tuple[str, str, str]:
    attempts: list[str] = []

    for url in urls:
        if LOCAL_CURL:
            try:
                return fetch_via_local_curl(url, timeout), url, "curl"
            except Exception as error:  # noqa: BLE001
                attempts.append(f"curl:{url}:{compact(str(error))}")

        try:
            response = requests.get(
                url,
                timeout=(10, timeout),
                headers=HEADERS,
            )
            response.raise_for_status()
            return response.text, url, "requests"
        except Exception as error:  # noqa: BLE001
            attempts.append(f"requests:{url}:{compact(str(error))}")

        if WINDOWS_CURL_HOST:
            try:
                return fetch_via_windows_curl(url, timeout), url, "windows-curl-host"
            except Exception as error:  # noqa: BLE001
                attempts.append(f"windows-curl-host:{url}:{compact(str(error))}")

    raise RuntimeError(" | ".join(attempts))


def parse_live_page() -> dict:
    try:
        html, source_url, transport = fetch_text(LIVE_URLS, 20)
    except Exception as error:  # noqa: BLE001
        return {
            "sourceUrl": LIVE_URLS[0],
            "advertisedSkillCategories": 0,
            "advertisedBundledSkills": 0,
            "categoryButtons": [],
            "fetchTransport": None,
            "liveFetchError": compact(str(error)),
        }

    soup = BeautifulSoup(html, "html.parser")

    category_button_texts = [compact(button.get_text(" ", strip=True)) for button in soup.find_all("button")]
    category_buttons: list[str] = []
    seen_buttons: set[str] = set()
    for text in category_button_texts:
        lower = text.lower()
        if not text or text in {"All categories", "Expand all", "Collapse to top 3"}:
            continue
        if text in {"Open Memory", "Open MCP"}:
            continue
        # The new page structure renders verbose expanded cards that repeat the simple
        # category buttons. Keep the short filter labels for downstream UI use.
        if "bundled skill" in lower or len(text) > 40:
            continue
        if text in seen_buttons:
            continue
        seen_buttons.add(text)
        category_buttons.append(text)

    summary_numbers = {}
    for label in ("Skill categories", "Bundled skills"):
        node = soup.find(string=lambda value, target=label: isinstance(value, str) and target in value)
        if not node:
            continue
        card = node.find_parent("article")
        count_node = card.find("p", class_=lambda value: value and "text-3xl" in value) if card else None
        summary_numbers[label] = int(compact(count_node.get_text()) or "0") if count_node else 0

    return {
        "sourceUrl": source_url,
        "advertisedSkillCategories": summary_numbers.get("Skill categories", 0),
        "advertisedBundledSkills": summary_numbers.get("Bundled skills", 0),
        "categoryButtons": category_buttons,
        "fetchTransport": transport,
        "liveFetchError": "",
    }


def extract_cell_value(cell: str) -> str:
    text = compact(cell)
    if not text:
        return ""

    link_match = re.fullmatch(r"\[`([^`]+)`\]\([^)]*\)", text)
    if link_match:
        return compact(link_match.group(1))

    markdown_link_match = re.fullmatch(r"\[([^\]]+)\]\([^)]*\)", text)
    if markdown_link_match:
        return compact(markdown_link_match.group(1).strip("`"))

    code_match = re.fullmatch(r"`([^`]+)`", text)
    if code_match:
        return compact(code_match.group(1))

    return compact(text.strip("`"))


def split_markdown_table_row(line: str) -> list[str]:
    stripped = line.strip()
    if not stripped.startswith("|"):
        return []

    body = stripped[1:]
    if body.endswith("|"):
        body = body[:-1]

    cells: list[str] = []
    current: list[str] = []
    in_backticks = False
    escaping = False

    for char in body:
        if escaping:
            current.append(char)
            escaping = False
            continue
        if char == "\\":
            escaping = True
            current.append(char)
            continue
        if char == "`":
            in_backticks = not in_backticks
            current.append(char)
            continue
        if char == "|" and not in_backticks:
            cells.append("".join(current).strip())
            current = []
            continue
        current.append(char)

    cells.append("".join(current).strip())
    return cells


def is_table_separator(cells: list[str]) -> bool:
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)


def normalize_table_cells(cells: list[str]) -> tuple[str, str, str] | None:
    if len(cells) < 3:
        return None
    name = extract_cell_value(cells[0])
    path = extract_cell_value(cells[-1])
    description = compact(" | ".join(cells[1:-1]))
    if not name or not path:
        return None
    return name, description, path


def counts_to_rows(counter: Counter[str]) -> list[dict[str, int | str]]:
    return [
        {"sectionTitle": name, "count": count}
        for name, count in sorted(counter.items(), key=lambda entry: (-entry[1], entry[0]))
    ]


def parse_raw_catalog() -> dict:
    try:
        text, source_url, transport = fetch_text(RAW_URLS, 30)
    except Exception as error:  # noqa: BLE001
        raise RuntimeError(f"unable to fetch Hermes raw catalog: {compact(str(error))}") from error

    items: list[dict] = []
    section_type = "bundled"
    current_section = None
    current_description: list[str] = []
    in_frontmatter = False
    frontmatter_closed = False
    grouped_sections = {
        "bundled": [],
        "optional": [],
    }

    def flush_section() -> None:
        nonlocal current_section, current_description
        if not current_section:
            return

        section_items = [item for item in items if item["type"] == section_type and item["sectionTitle"] == current_section]
        grouped_sections[section_type].append(
            {
                "type": section_type,
                "sectionTitle": current_section,
                "sectionSlug": slugify(current_section),
                "sectionDescription": compact(" ".join(current_description)),
                "skillCount": len(section_items),
                "skills": section_items,
            }
        )
        current_section = None
        current_description = []

    for line in text.splitlines():
        stripped = line.strip()

        if not frontmatter_closed and stripped == "---":
            in_frontmatter = not in_frontmatter
            if not in_frontmatter:
                frontmatter_closed = True
            continue
        if in_frontmatter:
            continue
        if stripped == "---":
            continue

        if stripped.startswith("# Optional Skills"):
            flush_section()
            section_type = "optional"
            continue

        if stripped.startswith("## "):
            flush_section()
            current_section = compact(stripped[3:])
            current_description = []
            continue

        if not current_section:
            continue

        cells = split_markdown_table_row(stripped)
        if cells:
            if cells == ["Skill", "Description", "Path"] or is_table_separator(cells):
                continue

            normalized = normalize_table_cells(cells)
            if normalized:
                name, description, path = normalized
                items.append(
                    {
                        "type": section_type,
                        "sectionTitle": current_section,
                        "sectionSlug": slugify(current_section),
                        "sectionDescription": compact(" ".join(current_description)),
                        "name": name,
                        "slug": slugify(name),
                        "path": path,
                        "description": description,
                    }
                )
                continue

        if compact(line):
            current_description.append(line.strip())

    flush_section()

    bundled_sections = grouped_sections["bundled"]
    optional_sections = grouped_sections["optional"]

    return {
        "sourceDocUrl": source_url,
        "fetchTransport": transport,
        "parsedSkillRows": len(items),
        "bundledRows": sum(1 for item in items if item["type"] == "bundled"),
        "optionalRows": sum(1 for item in items if item["type"] == "optional"),
        "sectionBreakdown": counts_to_rows(Counter(item["sectionTitle"] for item in items)),
        "bundledSectionBreakdown": counts_to_rows(Counter(item["sectionTitle"] for item in items if item["type"] == "bundled")),
        "optionalSectionBreakdown": counts_to_rows(Counter(item["sectionTitle"] for item in items if item["type"] == "optional")),
        "bundledSections": bundled_sections,
        "optionalSections": optional_sections,
        "items": items,
    }


def main() -> None:
    live = parse_live_page()
    raw = parse_raw_catalog()
    print(
        json.dumps(
            {
                "liveGuide": live,
                "rawCatalog": raw,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        raise
