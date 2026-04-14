# ClawHub Manifest Generation Rules

ClawHub supports two primary packaging modes. You **MUST** choose the correct mode based on the source content.

---

## Mode A: Bundle Plugin (Default)

**When to use:** For pure OpenClaw Skills (Markdown + Scripts). This is the most lightweight and secure format.

**Required Files:**
1. `.claude-plugin/plugin.json`
2. `package.json`

### 1. `.claude-plugin/plugin.json`

This file **MUST** contain exactly 4 fields. Do not add any other fields.

```json
{
  "name": "your-plugin-slug",
  "description": "80-150 chars. Core action with search keywords.",
  "version": "1.0.0",
  "skills": "skills"
}
```

### 2. `package.json`

This file is required for publishing but **MUST NOT** contain npm dependencies or `openclaw` fields.

```json
{
  "name": "your-plugin-slug",
  "version": "1.0.0",
  "private": false,
  "description": "Same description as .claude-plugin/plugin.json",
  "license": "Apache-2.0",
  "type": "module"
}
```

---

## Mode B: Code Plugin (Advanced)

#### **v1.0.1 到 v1.0.5 的关键改进总结 (Manifest 相关)：**

| 特性             | v1.0.1 版本 (旧)                                  | v1.0.5 版本 (当前)                                        |
| :--------------- | :------------------------------------------------ | :-------------------------------------------------------- |
| **`index.js` 文件** | 可能被错误生成或包含，导致冗余。                  | **按需处理**：仅当原始 Skill 包含 `index.js` 或 `index.ts` 时才复制并包含，否则不生成。|
| **`openclaw.extensions`** | 可能为空或指向不存在的 `index.js`，导致上传失败。 | **正确且按需配置**：对于纯 Skill 插件，指向 `["./openclaw.plugin.json"]`；对于包含原生代码的插件，会包含其入口文件（如 `["./openclaw.plugin.json", "./index.js"]`）。|
| **元数据完整性** | 缺少 `openclaw.compat`、`openclaw.build` 和 `repository` 等字段。| **已补全**：包含所有 ClawHub 要求的元数据字段，并支持 `repository` 自动预填。|



**WhWhen to use: If the source contains native code (e.g., TypeScript/JavaScript with an `index.ts` or `index.js` entry point that imports `openclaw/plugin-sdk/plugin-entry`), or if it's a pure skill plugin requiring `configSchema`.

**Required Files:**
1. `openclaw.plugin.json`
2. `package.json` (with `openclaw` extensions)

**Forbidden Files:**
- Do NOT create `.claude-plugin` or `.codex-plugin` directories. They are unnecessary for Code Plugins.

### 1. `openclaw.plugin.json`

This file defines the runtime configuration schema for the native plugin.

```json
{
  "id": "your-plugin-slug",
  "name": "Human Readable Name",
  "description": "Core action with search keywords.",
  "version": "1.0.0",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "api_key": {
        "type": "string",
        "description": "API key for the service"
      }
    }
  },
  "uiHints": {
    "api_key": { "label": "API Key", "sensitive": true }
  }
}
```

### 2. `package.json`

This file MUST contain the `openclaw` field to be recognized as a Native Plugin.

```json
{
  "name": "your-plugin-slug",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js", # 仅当原始技能包含 JS/TS 代码时才需要此字段和文件

  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "node-fetch": "^3.3.2"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/your-repo"
  },
  "openclaw": {
    "extensions": ["./openclaw.plugin.json"], # 对于纯技能插件，指向 openclaw.plugin.json 自身以满足校验；对于包含 JS/TS 代码的插件，此处应包含其入口文件（如 "./dist/index.js"）
    "compat": {
      "pluginApi": "^1.0.0"
    },
    "build": {
      "openclawVersion": "^1.0.0"
    }
  }
}
```
