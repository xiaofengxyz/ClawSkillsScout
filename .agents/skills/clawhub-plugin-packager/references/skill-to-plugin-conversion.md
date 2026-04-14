# Converting a Skill to a ClawHub Plugin

This guide explains how to convert an existing OpenClaw skill (either a local directory or a GitHub repository) into a ClawHub Plugin.

## Step 1: Acquire the Source
If the user provides a local directory, start there.
If the user provides a GitHub URL (e.g., `https://github.com/AIsa-team/OpenClaw-Skills/tree/main/prediction-market`), you must first download or clone the specific directory into a temporary workspace.

## Step 2: Determine Mode and Establish Structure

Check if the source requires advanced OpenClaw features (e.g., a `configSchema` for user-configured secrets, custom TypeScript native tools, or a specific `openclaw.extensions` entry point).
- If YES: Use **Code Mode** (Native Plugin).
- If NO: Use **Bundle Mode** (Pure Skills).

### Structure for Bundle Mode (Pure Skills)

```text
your-plugin-slug/
├── .claude-plugin/
│   └── plugin.json
├── package.json
├── skills/
│   └── your-skill-name/
│       ├── SKILL.md
│       └── scripts/
└── README.md
```

### Structure for Code Mode (Native Plugin)

```text
your-plugin-slug/
├── openclaw.plugin.json
├── package.json
├── index.ts
├── skills/               # Optional
│   └── your-skill-name/
│       └── SKILL.md
└── README.md
```

## Step 3: Handle Filename Inconsistencies
OpenClaw requires the skill file to be named exactly `SKILL.md` (uppercase).
Many GitHub repositories use `skill.md` or `readme.md`.
**CRITICAL:** You MUST rename any lowercase `skill.md` to `SKILL.md` when copying it into the bundle structure.

## Step 4: Handle Auxiliary Files
If the original skill has a `scripts/` directory, a `templates/` directory, or any other auxiliary files, copy them into the `skills/<skill-name>/` directory alongside `SKILL.md`.
Do NOT change the relative paths within the skill's code, as they usually expect to be next to `SKILL.md`.

## Step 5: Optimize the SKILL.md Frontmatter
The original skill might have poor frontmatter. You must update it:
1. Ensure `name` is present and matches the directory name.
2. Ensure `description` follows the "Use when:" pattern (see `search-optimization.md`).

## Step 6: Create Manifests
Generate the required manifests according to the rules in `manifest-rules.md` based on the chosen mode.
- For **Bundle Mode**: Create `.claude-plugin/plugin.json` and `package.json`. Do NOT create `openclaw.plugin.json`.
- For **Code Mode**: Create `openclaw.plugin.json` and `package.json`. Do NOT create `.claude-plugin/` or `.codex-plugin/`.

## Step 7: Prepare the Release Zip
When the user asks to package or prepare the plugin for release, you MUST create a zip file where all contents are inside a `package/` subdirectory.

```bash
mkdir -p /tmp/release/package
cp -r your-plugin-slug/* /tmp/release/package/
cd /tmp/release
zip -r your-plugin-slug-1.0.0.zip package/
```
