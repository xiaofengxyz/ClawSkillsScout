---
name: clawhub-plugin-packager
description: "Package OpenClaw skills into ClawHub plugins. Use when: converting a skill into a plugin, generating plugin manifests like package.json, .claude-plugin/plugin.json, or openclaw.plugin.json, and assembling a release-ready plugin directory. Not for SKILL.md search optimization or standalone Suspicious-risk auditing."
---

# ClawHub Plugin Packager

Convert existing OpenClaw skills into standard, highly-optimized **ClawHub Plugins** (Bundle or Code). This skill supports **Dual-Mode Packaging**: it determines the required plugin architecture based on the source's capabilities (Pure Skill Bundle vs. Native Code Plugin requiring config schemas or extensions), and generates the correct directory structure, manifests, and optimized metadata.

## When to use

- When converting an existing OpenClaw skill (from local directory or GitHub URL) into a ClawHub Plugin
- When generating or fixing bundle plugin manifests (`package.json`, `.claude-plugin/plugin.json`)
- When optimizing a skill's metadata for better OpenClaw agent invocation
- When creating the final `package/` zip structure for upload to ClawHub
- When the target artifact is a plugin rather than a raw skill bundle

## When NOT to use

- When the deliverable is only a `SKILL.md` skill package; use `clawhub-skill-optimizer`
- When the main task is investigating why a bundle was flagged `Suspicious`; use `clawhub-security-auditor`
- When the user only wants metadata rewrites and not plugin manifests

## Scope boundary

This skill owns:

- plugin directory structure
- plugin manifests
- release bundle layout
- plugin packaging validation

This skill does not own:

- rewriting source skill semantics
- primary search wording optimization for standalone skills
- standalone security auditing as the main deliverable

## Core Mechanisms & Strategy

ClawHub supports two types of plugins: **Code Plugins** (Native Plugins) and **Bundle Plugins** (Skill collections). This skill supports **Dual-Mode Packaging** based on the source content:

1. **Bundle Mode (Pure Skills)**: Used for standard OpenClaw Skills (Markdown + basic scripts). Creates a `.claude-plugin/plugin.json` manifest and a minimal `package.json`. This is the most lightweight format for skill collections.
2. **Code Mode (Native Plugin)**: Used when the source requires advanced OpenClaw features (e.g., a `configSchema` for API keys, custom TypeScript extensions, or specific runtime entries like a Python engine). Creates `openclaw.plugin.json` and a `package.json` with `openclaw.extensions` set to `["./openclaw.plugin.json"]` (self-referential). If the original skill includes an `index.js` or `index.ts` file, it should be included in the root of the plugin package, and its path should be added to `openclaw.extensions` (e.g., `["./openclaw.plugin.json", "./index.js"]`). No `.claude-plugin` directory is needed.

## Packaging Workflow

When asked to package or optimize a ClawHub plugin, follow these exact steps:

1. **Analyze the Source Skill**: Understand its core functionality. If the source is a GitHub URL, clone or download the specific directory first.
2. **Establish the Bundle Structure**: Set up the standard directory layout. Ensure any lowercase `skill.md` from external sources is renamed to `SKILL.md`.
3. **Determine Packaging Mode**: Check if the source requires advanced OpenClaw features (like `configSchema` for secrets, or has a specific code entry point). If yes, use Code Mode (Native Plugin); otherwise, use Bundle Mode (Pure Skills).
4. **Generate Manifests**:
   - **Bundle Mode**: Create `.claude-plugin/plugin.json` (4 fields) and a minimal `package.json`.
   - **Code Mode**: Create `openclaw.plugin.json` and a complex `package.json` with `openclaw.extensions`.
5. **Preserve Core Skill Content**: The content within `skills/<skill-name>/` (including `SKILL.md`) MUST NOT be modified during packaging. Optimization for agent invocation (e.g., "Use when:" triggers) should be handled at the source skill level, not by the packager. This ensures the integrity of the original skill definition.
6. **Validate the Plugin**: Run the validation script to ensure all requirements are met.
7. **Create the Release Zip**: Package the plugin into the strict `package/` subdirectory format required by ClawHub.

### Packaging Safety Lessons From Real Suspicious Flags

Recent real ClawHub uploads were flagged `Suspicious` for these concrete reasons:

1. **External CLI execution inside shipped helper scripts**
   - Examples: `claude -p --dangerously-skip-permissions`
   - Risk: looks like privileged local-agent execution

2. **Self-install or cache-sync behavior**
   - Examples: copying into `~/.claude/plugins/cache`, `~/.openclaw/skills`, `~/.agents/skills`
   - Risk: looks like persistence or self-modifying install behavior

3. **Default writes into user-home data locations**
   - Examples: `~/.local/share/<tool>`, `~/Documents/...`
   - Risk: looks like persistent local data collection

4. **Version-swapping or repo-mutation helpers**
   - Examples: `git show upstream/main`, scripts that overwrite local `SKILL.md`
   - Risk: looks like code mutation or repo rewriting

5. **Shipping non-runtime test/compare/sync utilities**
   - Examples: compare harnesses, local sync scripts, migration helpers, packaging-only scripts
   - Risk: they often contain one or more of the flagged behaviors above

6. **Aggressive data-retention wording or unconditional dump helpers**
   - Examples: “always save the FULL dump to disk”
   - Risk: scanners may interpret this as suspicious storage behavior

7. **Browser cookie / Keychain / local credential access helpers**
   - Examples: `chrome_cookies.py`, `cookie_extract.py`, `safari_cookies.py`
   - Risk: scanners map these to `cookie extraction`, `Keychain access`, or `local sensitive credentials`
   - Typical indicators include reading browser cookie databases or invoking macOS `security` / `openssl`

8. **Legacy secret inputs left in runtime config**
   - Examples: `AUTH_TOKEN`, `CT0`, `FROM_BROWSER`, `XAI_API_KEY`, `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `SCRAPECREATORS_API_KEY`
   - Risk: even if deprecated, these expand the visible secret surface and can trigger suspicion during upload scans
   - If the published artifact is supposed to be AISA-only or API-key-only, these compatibility env vars should not be present in the release bundle

Required packager behavior:

- Bundle only runtime-essential files by default.
- Exclude helper scripts that invoke external CLIs, mutate local installs, or sync into cache directories unless the user explicitly requests a developer bundle.
- If persistence is required, prefer repo-local paths over user-home defaults.
- Do not include `.pytest_cache`, `__pycache__`, logs, debug artifacts, or non-text binaries in release zips.
- Exclude browser-cookie, Keychain, and local-credential extraction helpers from release bundles.
- Exclude deprecated multi-provider auth paths and browser-derived credential inputs from release bundles when packaging an API-key-only runtime.
- If both EN and ZH variants are published, apply the same safety trimming to both; a re-uploaded language variant may be rescanned independently.

---

### Step 1 & 2: Establish the Plugin Structure

**Bundle Mode (Default) — Pure Skills:**
```text
plugin-name/
├── .claude-plugin/
│   └── plugin.json       # Minimal bundle manifest (name, description, version, skills)
├── package.json          # Minimal package metadata (NO openclaw field)
├── skills/
│   └── skill-name/
│       ├── SKILL.md      # MUST be optimized with "Use when:" trigger
│       └── ...
└── README.md
```

**Code Mode (Advanced) — Native Plugin (TS/Python/etc.):**
```text
plugin-name/
├── openclaw.plugin.json  # Native plugin config schema
├── package.json          # Complex metadata WITH openclaw.extensions: ["./openclaw.plugin.json"]

├── skills/               # Optional
│   └── skill-name/
│       └── SKILL.md
└── README.md
```

See `references/skill-to-plugin-conversion.md` for detailed conversion instructions.

---

### Step 3 & 4: Generate Manifests based on Mode

**Mode A: Bundle Plugin (Pure Skills - Default)**
- Create `.claude-plugin/plugin.json` with exactly 4 fields: `name`, `description`, `version`, `skills`.
- Create a minimal `package.json` with NO `openclaw` field.
- See `references/manifest-rules.md` for exact JSON structures.

**Mode B: Code Plugin (TypeScript Native Tools)**
- Create `openclaw.plugin.json` defining the plugin `id`, `name`, `description`, and `configSchema`.
- Create a complex `package.json` including the `openclaw.extensions`, `openclaw.compat`, and `openclaw.build` fields.
- Do NOT create `.claude-plugin` or `.codex-plugin` directories.
- See `references/manifest-rules.md` for exact JSON structures.

---

### Step 5: Preserve Core Skill Content Integrity

It is critical that the content within the `skills/<skill-name>/` directory, especially `SKILL.md`, remains unchanged during the packaging process. Any optimization for OpenClaw agent invocation (e.g., adding "Use when:" triggers to the `description` in the YAML frontmatter) should be performed on the original source skill before packaging. The packager's role is to package, not to modify the skill's core content.

Exception for safety packaging:

- You may remove non-runtime helper scripts, caches, logs, and packaging utilities from the final release bundle if they are not required for the skill's end-user functionality.
- You should not alter the semantics of the core skill, but you should aggressively exclude packaging-only or test-only files from the upload artifact.

---

### Step 6: Validate the Plugin

Use the provided validation script to ensure the plugin meets all Bundle Plugin requirements:

```bash
python3 /home/ubuntu/skills/clawhub-plugin-packager/scripts/validate_plugin.py <path-to-plugin-dir>
```

---

### Step 7: Create the Release Zip

#### **v1.0.1 到 v1.0.5 的关键改进总结：**

| 特性             | v1.0.1 版本 (旧)                                  | v1.0.5 版本 (当前)                                        |
| :--------------- | :------------------------------------------------ | :-------------------------------------------------------- |
| **`index.js` 文件** | 可能被错误生成或包含，导致冗余。                  | **按需处理**：仅当原始 Skill 包含 `index.js` 或 `index.ts` 时才复制并包含，否则不生成。|
| **`openclaw.extensions`** | 可能为空或指向不存在的 `index.js`，导致上传失败。 | **正确且按需配置**：对于纯 Skill 插件，指向 `["./openclaw.plugin.json"]`；对于包含原生代码的插件，会包含其入口文件（如 `["./openclaw.plugin.json", "./index.js"]`）。|
| **打包结构**     | 可能存在 `package/` 嵌套目录，导致 ClawHub 上传失败。| **标准化根目录结构**：所有核心文件直接位于 `.zip` 根目录，符合 ClawHub 上传要求。|
| **元数据完整性** | 缺少 `openclaw.compat`、`openclaw.build` 和 `repository` 等字段。| **已补全**：包含所有 ClawHub 要求的元数据字段，并支持 `repository` 自动预填。|
| **Skill 内容修改** | 脚本可能自动修改 `SKILL.md` 的 `description` 字段。| **严格禁止修改**：打包过程不再对 `skills/<skill-name>/` 目录下的任何文件进行内容修改，确保原始 Skill 的完整性。|

ClawHub's web upload system expects the plugin's root files (e.g., `package.json`, `openclaw.plugin.json`, `skills/`) to be directly at the root of the `.zip` file, NOT nested inside a `package/` subdirectory.

    To create the release zip:
    ```bash
    # Assuming you are in the parent directory of your plugin (e.g., /home/ubuntu/work/plugins)
    cd plugin-name
    zip -r ../plugin-name-1.0.0.zip ./*
    ```
    Deliver this `.zip` file to the user.

    **重要提示：** 在 ClawHub 网页上传 `.zip` 包时，`Source commit` 和 `Source ref (tag or branch)` 字段通常需要**手动填写**。`Source repo` 字段会根据 `package.json` 中的 `repository` 字段自动预填。
