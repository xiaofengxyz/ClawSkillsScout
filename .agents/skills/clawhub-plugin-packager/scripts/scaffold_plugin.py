import argparse
import json
import os
import sys


def create_scaffold(plugin_name: str, output_dir: str) -> None:
    """Create the standard Claude Bundle Plugin directory structure."""
    plugin_dir = os.path.join(output_dir, plugin_name)

    if os.path.exists(plugin_dir):
        print(f"Error: Directory '{plugin_dir}' already exists.", file=sys.stderr)
        sys.exit(1)

    # Create directories
    skill_name = plugin_name.replace("-plugin", "").replace("-openclaw", "")
    dirs = [
        os.path.join(plugin_dir, ".claude-plugin"),
        os.path.join(plugin_dir, "skills", skill_name),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # .claude-plugin/plugin.json
    claude_manifest = {
        "name": plugin_name,
        "description": "TODO: 80-150 chars. Core action with search keywords.",
        "version": "1.0.0",
        "skills": "skills"
    }
    with open(os.path.join(plugin_dir, ".claude-plugin", "plugin.json"), "w") as f:
        json.dump(claude_manifest, f, indent=2)
        f.write("\n")

    # package.json
    package_json = {
        "name": plugin_name,
        "version": "1.0.0",
        "private": False,
        "description": "TODO: Same as .claude-plugin/plugin.json description.",
        "license": "Apache-2.0",
        "type": "module"
    }
    with open(os.path.join(plugin_dir, "package.json"), "w") as f:
        json.dump(package_json, f, indent=2)
        f.write("\n")

    # skills/<skill-name>/SKILL.md
    # 不再自动生成带有 "Use when:" 的 SKILL.md，而是生成一个空的模板，由用户手动填写
    skill_md = f"""---
name: {skill_name}
description: "TODO: Core action. Use when: specific trigger scenario."
---

# {skill_name}

TODO: Write the skill instructions here.

## When to use

- TODO: Describe when this skill should be invoked.

## When NOT to use

- TODO: Describe when this skill should NOT be invoked.
"""
    with open(os.path.join(plugin_dir, "skills", skill_name, "SKILL.md"), "w") as f:
        f.write(skill_md)

    # README.md
    readme = f"""# {plugin_name}

A ClawHub Bundle Plugin for OpenClaw.

## Installation

```bash
openclaw bundles install {plugin_name}
```

## Description

TODO: Describe what this plugin does.

## License

Apache-2.0
"""
    with open(os.path.join(plugin_dir, "README.md"), "w") as f:
        f.write(readme)

    print(f"Bundle Plugin scaffold created at: {plugin_dir}")
    print(f"Files created:")
    for root, dirs_list, files in os.walk(plugin_dir):
        level = root.replace(plugin_dir, "").count(os.sep)
        indent = " " * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        sub_indent = " " * 2 * (level + 1)
        for file in files:
            print(f"{sub_indent}{file}")


def main():
    parser = argparse.ArgumentParser(description="Generate ClawHub Bundle Plugin scaffold")
    parser.add_argument("plugin_name", help="Name/slug of the plugin (e.g., claw-voice-call)")
    parser.add_argument("--output-dir", default=".", help="Parent directory for the plugin (default: current dir)")
    args = parser.parse_args()

    create_scaffold(args.plugin_name, args.output_dir)


if __name__ == "__main__":
    main()
