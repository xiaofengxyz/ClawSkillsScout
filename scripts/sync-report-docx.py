#!/usr/bin/env python3
from __future__ import annotations

import argparse
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_REPORT_DIRS = [ROOT / "reports", ROOT / "public" / "reports"]
SKIP_FILES = {"README.md"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate simple .docx companions for Markdown reports."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Markdown files to sync. When omitted, sync reports/ and public/reports/.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Rewrite .docx outputs even when they appear up to date.",
    )
    return parser.parse_args()


def resolve_markdown_paths(raw_paths: list[str]) -> list[Path]:
    if raw_paths:
        resolved: list[Path] = []
        for raw_path in raw_paths:
            candidate = Path(raw_path)
            if not candidate.is_absolute():
                candidate = (Path.cwd() / candidate).resolve()
            resolved.append(candidate)
        return resolved

    discovered: list[Path] = []
    for directory in DEFAULT_REPORT_DIRS:
        if not directory.exists():
            continue
        for path in sorted(directory.glob("*.md")):
            if path.name in SKIP_FILES:
                continue
            discovered.append(path)
    return discovered


def should_write(markdown_path: Path, docx_path: Path, force: bool) -> bool:
    if force or not docx_path.exists():
        return True
    return markdown_path.stat().st_mtime > docx_path.stat().st_mtime


def build_paragraph_xml(line: str) -> str:
    text = line.replace("\t", "    ")
    if not text:
        return "<w:p/>"

    preserve = ' xml:space="preserve"' if text != text.strip() or "  " in text else ""
    escaped = escape(text, quote=False)
    return f"<w:p><w:r><w:t{preserve}>{escaped}</w:t></w:r></w:p>"


def write_simple_docx(path: Path, markdown_text: str) -> None:
    paragraphs = [build_paragraph_xml(line.rstrip("\n")) for line in markdown_text.splitlines()]
    if not paragraphs:
        paragraphs = ["<w:p/>"]

    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"""
    relationships = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""
    document = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {''.join(paragraphs)}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""

    path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(path, "w", compression=ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types)
        archive.writestr("_rels/.rels", relationships)
        archive.writestr("word/document.xml", document)


def main() -> None:
    args = parse_args()
    markdown_paths = resolve_markdown_paths(args.paths)
    if not markdown_paths:
        print("No Markdown reports found.")
        return

    written = 0
    skipped = 0
    for markdown_path in markdown_paths:
        if markdown_path.suffix.lower() != ".md":
            raise SystemExit(f"Expected a Markdown file, got: {markdown_path}")
        if not markdown_path.exists():
            raise SystemExit(f"Markdown file does not exist: {markdown_path}")
        if markdown_path.name in SKIP_FILES:
            skipped += 1
            continue

        docx_path = markdown_path.with_suffix(".docx")
        if not should_write(markdown_path, docx_path, args.force):
            skipped += 1
            continue

        write_simple_docx(docx_path, markdown_path.read_text(encoding="utf-8"))
        written += 1
        print(f"Wrote {docx_path.relative_to(ROOT)}")

    print(f"Report DOCX sync complete: wrote={written}, skipped={skipped}")


if __name__ == "__main__":
    main()
