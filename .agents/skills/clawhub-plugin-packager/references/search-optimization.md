# ClawHub 搜索与 OpenClaw 调用优化

本指南详细阐述了如何优化 ClawHub 插件（包括 Bundle Plugin 和 Code Plugin）的元数据，以提高其在 ClawHub 上的搜索可见性，并增加 OpenClaw Agent 调用该插件的几率。

## 1. ClawHub 搜索机制优化

ClawHub 的搜索机制结合了文本匹配、相关性评分和用户行为信号。优化策略应针对不同插件类型及其关键元数据字段。

### 1.1 搜索字段优先级与来源

| 优先级 | 字段 | 来源文件 | 影响 |
| :--- | :--- | :--- | :--- |
| 1 (最高) | `name` / `slug` | `package.json`, `.claude-plugin/plugin.json` (Bundle), `openclaw.plugin.json` (Code) | 精确匹配插件名称和 slug 排名最高 |
| 2 | `description` | `package.json`, `.claude-plugin/plugin.json` (Bundle), `openclaw.plugin.json` (Code) | 主要的文本搜索目标，应包含核心关键词 |
| 3 | `keywords` | `package.json` | 辅助关键词匹配，提高相关性 |
| 4 | `defaultPrompt` | `.claude-plugin/plugin.json` (Bundle), `openclaw.plugin.json` (Code) | 间接影响搜索，因为它定义了插件的核心用途 |
| 5 | `author` / `publisher` | `package.json` | 作者信息，用于作者筛选和品牌搜索 |
| 6 | 使用信号 | ClawHub 平台 | 下载量、星标数（次要影响） |

### 1.2 搜索优化规则

1.  **名称 (Name) 和 Slug 必须包含核心关键词**：
    *   `package.json` 中的 `name` 字段应简洁明了，包含插件的核心功能。
    *   ClawHub 会根据 `name` 生成 `slug`，确保 `slug` 具有辨识度。
    *   例如，如果插件是关于“语音通话”，`name` 应该是 `claw-voice-call`，而不是 `my-awesome-plugin`。

2.  **描述 (Description) 必须关键词密集且自然**：
    *   `package.json`、`.claude-plugin/plugin.json` (Bundle) 和 `openclaw.plugin.json` (Code) 中的 `description` 字段都非常重要。
    *   编写一个自然流畅的句子，其中包含所有重要的搜索词。
    *   对于 Bundle Plugin，由于 `.claude-plugin/plugin.json` 没有 `keywords` 字段，`description` 是放置搜索词的主要位置。

3.  **关键词 (Keywords) 数组的利用 (仅限 `package.json`)**：
    *   在 `package.json` 中添加一个 `keywords` 数组，包含与插件功能、领域和生态系统相关的词汇。
    *   **示例关键词**：`openclaw`, `clawhub`, `ai`, `automation`, `voice`, `call`, `telephony`, `communication`。

4.  **`defaultPrompt` 的间接影响**：
    *   `defaultPrompt` 定义了插件的默认行为或最常见的用途。虽然不直接用于搜索，但它有助于 ClawHub 更好地理解插件的语义，从而可能影响相关性排名。

5.  **ClawHub.ai 不支持中文搜索**：
    *   `clawhub.ai` 主站的搜索功能不完全支持中文关键词。请确保所有关键元数据字段（`name`, `description`, `keywords`）使用英文。
    *   对于中文用户，建议在 `cn.clawhub-mirror.com` 上发布单独的中文版本，或在英文描述中包含少量核心中文关键词。

### 1.3 关键词选择策略

*   **主要关键词**（插件做什么）：例如，`voice`, `phone`, `call`, `prediction market`, `data`, `API`。
*   **生态系统关键词**（在哪里运行）：例如，`openclaw`, `clawhub`, `agent`, `ai`。
*   **领域关键词**（服务什么领域）：例如，`telephony`, `communication`, `finance`, `betting`。

## 2. OpenClaw Agent 调用机制优化

OpenClaw Agent 在安装插件后，会根据其能力描述来决定何时调用。优化目标是让 Agent 更准确、更频繁地在用户意图匹配时调用插件。

### 2.1 Agent 决策信号优先级

| 优先级 | 信号 | 来源 | Agent 如何感知 |
| :--- | :--- | :--- | :--- |
| 1 (最高) | `SKILL.md` `frontmatter` `description` | `skills/<skill-name>/SKILL.md` | 在会话开始时，Agent 会看到所有可用 Skill 的 `name` 和 `description`，这是其初步决策的主要依据。 |
| 2 | `openclaw.plugin.json` `configSchema` | `openclaw.plugin.json` (Code Plugin) | 如果插件需要用户输入敏感配置（如 API Key），Agent 会优先考虑调用，因为它能引导用户完成配置。 |
| 3 | `openclaw.plugin.json` `defaultPrompt` | `openclaw.plugin.json` (Code Plugin) | 定义了插件的默认或推荐用途，有助于 Agent 理解插件的适用场景。 |
| 4 | `.claude-plugin/plugin.json` `defaultPrompt` | `.claude-plugin/plugin.json` (Bundle Plugin) | 与 Code Plugin 类似，但通常用于更简单的 Bundle 场景。 |
| 5 | MCP 工具描述 | `.mcp.optional.json` 或 `openclaw.plugin.json` 中的 `tools` | 如果插件注册了 MCP 工具，每个工具的 `description` 参数直接影响 LLM 是否调用它。 |

### 2.2 调用优化规则

1.  **`SKILL.md` `description` 是核心**：
    *   对于所有插件类型，`SKILL.md` 的 `frontmatter` 中的 `description` 字段是 Agent 决定是否调用该 Skill 的最重要因素。
    *   Agent 在会话开始时会看到这个描述，并将其与用户请求进行匹配。

2.  **必须包含明确的触发条件**：
    *   `description` 必须以“Use when:”开头，后跟具体的触发场景。
    *   **示例**：`[核心动作]. Use when: [具体触发场景]. 支持 [关键功能].`
    *   **错误示例**：`这是一个用于预测市场的插件。` (Agent 不知道何时使用)
    *   **正确示例**：`查询跨平台预测市场数据。Use when: 用户询问预测市场赔率、选举投注、事件概率、市场情绪、Polymarket 价格、Kalshi 价格等。`

3.  **必须使用动作动词开头**：
    *   `description` 应以插件执行的动作动词开头，而不是描述其“是什么”。
    *   **错误示例**：`预测市场数据工具。`
    *   **正确示例**：`查询预测市场数据。`

4.  **利用 `configSchema` 引导 Agent**：
    *   对于 Code Plugin，如果插件需要 API Key 或其他用户配置，务必在 `openclaw.plugin.json` 中定义 `configSchema`。
    *   Agent 会识别到这种需求，并在用户请求需要该配置时，优先调用插件以引导用户完成配置。
    *   **示例**：`s2-roots-remembrance` 插件通过 `configSchema` 引导用户输入 `S2_FAMILY_MESH_KEY`。

5.  **`defaultPrompt` 强化意图**：
    *   在 `openclaw.plugin.json` (Code Plugin) 或 `.claude-plugin/plugin.json` (Bundle Plugin) 中设置 `defaultPrompt`。
    *   `defaultPrompt` 应该是一个能直接触发插件核心功能的自然语言提示，它告诉 Agent 插件最典型的使用方式。
    *   **示例**：`defaultPrompt: 
