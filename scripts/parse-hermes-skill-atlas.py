#!/usr/bin/env python3
from __future__ import annotations

import json
import re
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


def compact(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def text_of(node) -> str:
    if node is None:
        return ""
    return compact(node.get_text(" ", strip=True))


def parse_live_page() -> dict:
    response = None
    source_url = LIVE_URLS[0]
    last_error = None
    for url in LIVE_URLS:
        source_url = url
        try:
            response = requests.get(
                url,
                timeout=20,
                headers={
                    "user-agent": "Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/)",
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
            )
            response.raise_for_status()
            break
        except Exception as error:  # noqa: BLE001
            last_error = error
            response = None

    if response is None:
        return {
            "sourceUrl": source_url,
            "advertisedSkillCategories": 0,
            "advertisedBundledSkills": 0,
            "categoryButtons": [],
            "liveFetchError": compact(str(last_error)),
        }

    soup = BeautifulSoup(response.text, "html.parser")

    category_button_texts = [compact(button.get_text(" ", strip=True)) for button in soup.find_all("button")]
    category_buttons: list[str] = []
    seen_buttons: set[str] = set()
    for text in category_button_texts:
        if not text or text in {"All categories", "Expand all", "Collapse to top 3"}:
            continue
        if text in {"Open Memory", "Open MCP"}:
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
        "liveFetchError": "",
    }


def parse_raw_catalog() -> dict:
    text = None
    source_url = None
    last_error = None
    for url in RAW_URLS:
        try:
            response = requests.get(
                url,
                timeout=30,
                headers={"user-agent": "Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/)"},
            )
            response.raise_for_status()
            text = response.text
            source_url = url
            break
        except Exception as error:  # noqa: BLE001
            last_error = error
    if text is None:
        raise RuntimeError(f"unable to fetch Hermes raw catalog: {last_error}")
    items = []
    section_type = "bundled"
    current_section = None
    current_description: list[str] = []

    for line in text.splitlines():
        if line.startswith("# Optional Skills"):
            section_type = "optional"
            current_section = None
            current_description = []
            continue

        if line.startswith("## "):
            current_section = compact(line[3:])
            current_description = []
            continue

        if not current_section:
            continue

        row_match = re.match(r"^\|\s*`([^`]+)`\s*\|\s*(.*?)\s*\|\s*`([^`]+)`\s*\|$", line.strip())
        if row_match:
            items.append(
                {
                    "type": section_type,
                    "sectionTitle": current_section,
                    "sectionSlug": current_section.lower().replace(" ", "-"),
                    "sectionDescription": compact(" ".join(current_description)),
                    "name": compact(row_match.group(1)),
                    "slug": compact(row_match.group(1)),
                    "path": compact(row_match.group(3)),
                    "description": compact(row_match.group(2)),
                }
            )
            continue

        if line.startswith("| Skill | Description | Path |") or line.startswith("|-------"):
            continue

        if compact(line):
            current_description.append(line.strip())

    return {
        "sourceDocUrl": source_url,
        "parsedSkillRows": len(items),
        "bundledRows": sum(1 for item in items if item["type"] == "bundled"),
        "optionalRows": sum(1 for item in items if item["type"] == "optional"),
        "sectionBreakdown": Counter(item["sectionTitle"] for item in items),
        "items": items,
    }


def main() -> None:
    live = parse_live_page()
    raw = parse_raw_catalog()
    print(json.dumps({**live, **raw}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        raise
