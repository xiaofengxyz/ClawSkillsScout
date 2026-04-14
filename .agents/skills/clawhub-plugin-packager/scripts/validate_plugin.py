#!/usr/bin/env python3
"""
Validate a ClawHub Plugin package structure and metadata (Dual-Mode).
Usage: python validate_plugin.py <plugin-directory>
"""

import json
import os
import sys
import re


def load_json(path: str) -> dict | None:
    """Load and parse a JSON file. Returns None on failure."""
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        return None


def validate_plugin(plugin_dir: str) -> tuple[list[str], list[str]]:
    """Validate plugin structure based on detected mode and return errors and warnings."""
    errors = []
    warnings = []

    # Determine Mode based on Native Plugin markers
    has_openclaw_plugin_json = os.path.exists(os.path.join(plugin_dir, 'openclaw.plugin.json'))
    
    has_extensions = False
    package_json_path = os.path.join(plugin_dir, 'package.json')
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                pkg = json.load(f)
                if 'openclaw' in pkg and 'extensions' in pkg['openclaw']:
                    has_extensions = True
        except:
            pass
            
    is_code_mode = has_openclaw_plugin_json or has_extensions

    if is_code_mode:
        print("Detected Native Plugin markers. Validating as Code Plugin (Mode B).")
        validate_code_mode(plugin_dir, errors, warnings)
    else:
        print("No Native Plugin markers detected. Validating as Bundle Plugin (Mode A).")
        validate_bundle_mode(plugin_dir, errors, warnings)

    return errors, warnings


def validate_bundle_mode(plugin_dir: str, errors: list, warnings: list):
    """Validate pure skill collections."""
    claude_path = os.path.join(plugin_dir, ".claude-plugin", "plugin.json")
    pkg_path = os.path.join(plugin_dir, "package.json")
    oc_path = os.path.join(plugin_dir, "openclaw.plugin.json")
    skills_dir = os.path.join(plugin_dir, "skills")

    if not os.path.exists(claude_path):
        errors.append("[S1-Bundle] MISSING: .claude-plugin/plugin.json is required for Bundle Plugins")
    if not os.path.exists(pkg_path):
        errors.append("[S2-Bundle] MISSING: package.json is required for publishing")
    if os.path.exists(oc_path):
        errors.append("[S3-Bundle] INVALID: openclaw.plugin.json should NOT exist in a Bundle Plugin")
    if not os.path.isdir(skills_dir):
        errors.append("[S4-Bundle] MISSING: skills/ directory is required for Bundle Plugins")

    # Check for conflicting formats
    for conflict in [".codex-plugin", ".cursor-plugin"]:
        if os.path.exists(os.path.join(plugin_dir, conflict)):
            errors.append(f"[S5-Bundle] CONFLICT: Found {conflict}/ directory. Only .claude-plugin is allowed for Bundle Plugins.")

    # Metadata Checks
    claude = load_json(claude_path) if os.path.exists(claude_path) else None
    pkg = load_json(pkg_path) if os.path.exists(pkg_path) else None

    if claude_path and claude is None and os.path.exists(claude_path):
        errors.append("[M1-Bundle] INVALID: .claude-plugin/plugin.json is not valid JSON")
    if pkg_path and pkg is None and os.path.exists(pkg_path):
        errors.append("[M2-Bundle] INVALID: package.json is not valid JSON")

    # Package.json fields
    if pkg:
        if "openclaw" in pkg:
            errors.append("[M-PKG-Bundle] INVALID: package.json must NOT have 'openclaw' field for Bundle Plugins")
        if "dependencies" in pkg:
            warnings.append("[M-PKG-Bundle] WARNING: Bundle Plugins typically shouldn't have npm dependencies")

    # Claude manifest checks
    if claude:
        desc = claude.get("description", "")
        if not desc or "TODO" in desc:
            errors.append("[M3-Bundle] INCOMPLETE: .claude-plugin/plugin.json description contains TODO or is empty")
        elif len(desc) < 30:
            warnings.append(f"[M3-Bundle] WARNING: description is very short ({len(desc)} chars). Aim for 80-150.")
        
        if "interface" in claude or "keywords" in claude or "defaultPrompt" in claude:
            errors.append("[M4-Bundle] INVALID: .claude-plugin/plugin.json has Code Plugin fields. It must be minimal.")
        if claude.get("skills") != "skills":
            errors.append("[M5-Bundle] INVALID: .claude-plugin/plugin.json must have 'skills': 'skills'")

    validate_skills_dir(skills_dir, errors, warnings)


def validate_code_mode(plugin_dir: str, errors: list, warnings: list):
    """Validate native plugins with TypeScript code."""
    oc_path = os.path.join(plugin_dir, "openclaw.plugin.json")
    pkg_path = os.path.join(plugin_dir, "package.json")
    skills_dir = os.path.join(plugin_dir, "skills")

    if not os.path.exists(oc_path):
        errors.append("[S1-Code] MISSING: openclaw.plugin.json is required for Code Plugins")
    if not os.path.exists(pkg_path):
        errors.append("[S2-Code] MISSING: package.json is required for Code Plugins")

    # Check for forbidden bundle directories
    if os.path.exists(os.path.join(plugin_dir, ".claude-plugin")):
        errors.append("[S3-Code] INVALID: .claude-plugin/ directory should NOT exist in a Code Plugin")
    if os.path.exists(os.path.join(plugin_dir, ".codex-plugin")):
        warnings.append("[S4-Code] WARNING: .codex-plugin/ found. This is optional and only used for ClawHub UI enhancements.")

    # Metadata Checks
    oc = load_json(oc_path) if os.path.exists(oc_path) else None
    pkg = load_json(pkg_path) if os.path.exists(pkg_path) else None

    if oc_path and oc is None and os.path.exists(oc_path):
        errors.append("[M1-Code] INVALID: openclaw.plugin.json is not valid JSON")
    if pkg_path and pkg is None and os.path.exists(pkg_path):
        errors.append("[M2-Code] INVALID: package.json is not valid JSON")

    # Package.json fields
    if pkg:
        if "openclaw" not in pkg:
            errors.append("[M-PKG-Code] INVALID: package.json MUST have 'openclaw' field for Code Plugins")
        else:
            oc_field = pkg.get("openclaw", {})
            if "extensions" not in oc_field:
                errors.append("[M-PKG-Code] INVALID: package.json 'openclaw' field MUST have 'extensions' array")
            if "compat" not in oc_field or "pluginApi" not in oc_field["compat"]:
                errors.append("[M-PKG-Code] INVALID: package.json 'openclaw' field MUST have 'compat.pluginApi' (e.g., '^1.0.0')")
            if "build" not in oc_field or "openclawVersion" not in oc_field["build"]:
                errors.append("[M-PKG-Code] INVALID: package.json 'openclaw' field MUST have 'build.openclawVersion' (e.g., '^1.0.0')")
        
        if "repository" not in pkg:
            warnings.append("[M-PKG-Code] WARNING: package.json is missing 'repository' field. Adding it enables auto-filling 'Source repo' on ClawHub.")

    # OpenClaw manifest checks
    if oc:
        required_keys = {"id", "name", "description"}
        actual_keys = set(oc.keys())
        if not required_keys.issubset(actual_keys):
            missing = required_keys - actual_keys
            errors.append(f"[M3-Code] INVALID: openclaw.plugin.json is missing required fields: {missing}")

    if os.path.isdir(skills_dir):
        validate_skills_dir(skills_dir, errors, warnings)


def validate_skills_dir(skills_dir: str, errors: list, warnings: list):
    """Common validation for skills directory if it exists."""
    skill_files = []
    for root, _, files in os.walk(skills_dir):
        if "SKILL.md" in files:
            skill_files.append(os.path.join(root, "SKILL.md"))
        if "skill.md" in files:
            errors.append(f"[I0] INVALID FILENAME: Found lowercase 'skill.md' in {root}. It MUST be renamed to 'SKILL.md' (uppercase).")

    for skill_md_path in skill_files:
        with open(skill_md_path, "r") as f:
            content = f.read()

        fm_match = re.search(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
        if fm_match:
            fm = fm_match.group(1)
            if "Use when:" not in fm and "Use when :" not in fm:
                warnings.append(f"[I2] WARNING: {os.path.basename(os.path.dirname(skill_md_path))}/SKILL.md frontmatter description should contain 'Use when:' trigger")
            if "TODO" in fm:
                errors.append(f"[I2] INCOMPLETE: {os.path.basename(os.path.dirname(skill_md_path))}/SKILL.md frontmatter contains TODO placeholders")
        else:
            errors.append(f"[I2] MISSING: {os.path.basename(os.path.dirname(skill_md_path))}/SKILL.md has no YAML frontmatter")


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_plugin.py <plugin-directory>", file=sys.stderr)
        sys.exit(1)

    plugin_dir = sys.argv[1]
    if not os.path.isdir(plugin_dir):
        print(f"Error: '{plugin_dir}' is not a directory.", file=sys.stderr)
        sys.exit(1)

    errors, warnings = validate_plugin(plugin_dir)

    if warnings:
        print("\n--- WARNINGS ---")
        for w in warnings:
            print(f"  ⚠️  {w}")

    if errors:
        print("\n--- ERRORS ---")
        for e in errors:
            print(f"  ❌ {e}")
        print(f"\n❌ Validation FAILED with {len(errors)} error(s) and {len(warnings)} warning(s).")
        sys.exit(1)
    else:
        if warnings:
            print(f"\n✅ Validation PASSED with {len(warnings)} warning(s).")
        else:
            print("\n✅ Validation PASSED. Plugin is ready for packaging.")
        sys.exit(0)


if __name__ == "__main__":
    main()
