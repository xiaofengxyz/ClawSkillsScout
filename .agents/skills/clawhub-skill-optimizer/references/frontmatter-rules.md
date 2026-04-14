# Frontmatter Rules

## Why frontmatter matters

OpenClaw agent sees only `name` + `description` from frontmatter in the system prompt XML:

```xml
<available_skills>
  <skill>
    <name>skill-name</name>
    <description>skill description</description>
    <location>/path/to/SKILL.md</location>
  </skill>
</available_skills>
```

Agent decision logic: "If exactly one skill clearly applies: read its SKILL.md. If multiple could apply: choose the most specific one."

ClawHub search indexes `name`, `slug`, and `summary` (= `description`) using hybrid text matching + relevance scoring. Exact keyword matches in name/slug rank highest in search results.

**Token cost per skill**: ~97 chars fixed overhead + len(name) + len(description) + len(location). At ~4 chars/token, a 200-char description costs ~75 tokens.

## Validation constraints (enforced by quick_validate.py)

These are hard constraints that MUST be met:

| Field | Constraint |
| :--- | :--- |
| `name` | Required; hyphen-case only (`[a-z0-9-]`); max 64 chars; no leading/trailing/consecutive hyphens |
| `description` | Required; string type; no angle brackets (`<` or `>`); max 1024 chars |
| Allowed top-level keys | `name`, `description`, `license`, `allowed-tools`, `metadata` only |

## English frontmatter template

```yaml
---
name: [concise-descriptive-slug]
description: >-
  [Core functionality description].
  Use when: [specific trigger condition 1], [trigger condition 2].
  Supports [key feature 1], [key feature 2], and [key feature 3].
metadata:
  {
    "openclaw":
      {
        "emoji": "[relevant-emoji]",
        "primaryEnv": "[PRIMARY_API_KEY_NAME]",
        "requires": {
          "bins": ["[required_binary]"],
          "env": ["[REQUIRED_ENV_VAR]"]
        }
      }
  }
---
```

## Chinese frontmatter template

```yaml
---
name: [function-zh]
description: >-
  [核心功能描述]，支持[关键特性]。
  触发条件：当用户需要[具体场景1]或[具体场景2]时使用。
  适用于[应用领域1]、[应用领域2]。
metadata:
  {
    "openclaw":
      {
        "emoji": "[relevant-emoji]",
        "primaryEnv": "[PRIMARY_API_KEY_NAME]",
        "requires": {
          "bins": ["[required_binary]"],
          "env": ["[REQUIRED_ENV_VAR]"]
        }
      }
  }
---
```

## Five description writing laws

### Law 1: Lead with core functionality

Prefer starting with an action verb, but noun/adjective phrases are also effective if they clearly convey the skill's purpose.

**Effective verb openings**: "Generate", "Analyze", "Query", "Retrieve", "Search", "Extract", "Convert" / "生成", "分析", "查询", "获取", "搜索", "提取", "转换"

**Also effective**: "Security-first skill vetting for...", "Typed knowledge graph for...", "Multi search engine integration with..."

The key criterion is clarity, not grammatical form.

### Law 2: Explicit trigger embedding

**Should** include "Use when:" (EN) or "触发条件：" (ZH) in the description itself. This pattern appears in 56% of ClawHub's top 25 skills and directly helps the agent determine "exactly one skill clearly applies."

Variants that also work: "Use for:", "Use before:", "This skill should be used when..."

### Law 3: Exact keyword coverage

ClawHub search uses hybrid text matching + relevance scoring. Exact keyword matches in name/slug/description rank highest. Include the specific words users will type when searching.

**Example for a weather skill:**
- Critical: "weather", "forecast" (exact search terms)
- Helpful: "temperature", "conditions" (related terms)
- Less important: semantic synonyms that users rarely type

**Chinese example (for cn.clawhub-mirror.com):**
- Critical: "天气", "预报", "查询" (exact search terms)
- Helpful: "气温", "降水" (related terms)

### Law 4: Length flexibility (50-200 characters recommended)

The optimal length depends on the skill's complexity:

| Skill type | Recommended length | Example |
| :--- | :--- | :--- |
| Single-function tool | 50-80 chars | "Get current weather and forecasts (no API key required)." |
| Multi-function tool | 100-150 chars | "Query Polymarket prediction markets - check odds, trending markets, search events, track prices and momentum." |
| Complex workflow | 150-200 chars | Full description with "Use when:" triggers and feature list |

Hard limits: minimum 10 chars (practical), maximum 1024 chars (validator enforced). Avoid exceeding 250 chars as it wastes token budget.

### Law 5: No marketing language

Never use: "powerful", "best", "amazing", "ultimate", "强大的", "最好的", "终极"

Agent does not respond to subjective evaluations. Use factual, functional language only.

## Before/after examples

**Weather skill:**

| Version | Before | After |
| :--- | :--- | :--- |
| EN | "A powerful weather tool that gets weather data." | "Get current weather and forecasts for any location. Use when: user asks about weather, temperature, or forecast. Supports city name, coordinates, and zip code." |
| ZH | "一个强大的天气工具，可以获取天气数据。" | "查询全球任意地点的实时天气和多日预报。触发条件：当用户询问天气、气温或未来天气时使用。支持城市名和经纬度查询。" |

**Crypto price skill:**

| Version | Before | After |
| :--- | :--- | :--- |
| EN | "Get crypto prices" | "Query real-time cryptocurrency prices, market cap, and trading volume. Use when: user asks about Bitcoin price, token market data, or crypto trends. Supports 5000+ tokens." |
| ZH | "获取加密货币价格" | "查询实时加密货币价格、市值和交易量。触发条件：当用户询问比特币价格、代币行情或加密货币趋势时使用。支持BTC、ETH、SOL等5000+代币。" |

**Concise style (also effective):**

| Skill | Description | Length |
| :--- | :--- | :--- |
| Weather | "Get current weather and forecasts (no API key required)." | 56 chars |
| Nano Pdf | "Edit PDFs with natural-language instructions using the nano-pdf CLI." | 69 chars |
| Obsidian | "Work with Obsidian vaults (plain Markdown notes) and automate via obsidian-cli." | 80 chars |
