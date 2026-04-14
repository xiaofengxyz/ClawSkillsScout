# SKILL.md Body Structure

The body is loaded only after the agent selects the skill based on the frontmatter description. Structure it for fast agent parsing and correct execution.

## Design principle: Match structure to skill type

Do NOT force all skills into a single rigid template. Top-performing ClawHub skills use structures that match their purpose. Choose modules from the library below based on what your skill actually needs.

## Module library

### Module: When to use (Required)

Always include this. Expand on the frontmatter trigger conditions with 3-5 specific scenarios.

**English pattern:**
```markdown
## When to use
- When user asks about current weather conditions for a specific location
- When user wants to know if it will rain or snow in the coming days
- When user needs temperature, humidity, or wind information
```

**Chinese pattern:**
```markdown
## 什么时候使用
- 当用户查询某个城市的当前天气
- 当用户想知道未来几天会不会下雨
- 当用户需要了解气温、湿度或风力信息
```

### Module: When NOT to use (Recommended)

Include when similar skills exist. Helps agent avoid misuse when multiple skills compete.

```markdown
## When NOT to use
- Do NOT use for historical weather data older than 7 days
- Do NOT use for climate analysis or long-term weather patterns
```

### Module: Quick Reference (for CLI/command-based skills)

A concise table mapping situations to actions. This pattern is used by the #1 ranked skill (`self-improving-agent`).

```markdown
## Quick Reference

| Situation | Action |
| --- | --- |
| Get current weather | `curl -s "wttr.in/London?format=3"` |
| Full forecast | `curl -s "wttr.in/London?T"` |
| JSON data | `curl -s "https://api.open-meteo.com/v1/forecast?..."` |
```

### Module: Capabilities (for multi-function skills)

Verb-led action list. Each line = one specific capability.

```markdown
## Capabilities
- Get real-time temperature, humidity, and wind conditions
- Retrieve up to 7-day weather forecasts
- Look up weather by city name, coordinates, or zip code
```

### Module: Operations (for API-wrapper skills)

Function-style callable operations with parameter signatures:

```markdown
## Operations
- `get_current_weather(location)` — returns current conditions
- `get_forecast(location, days)` — returns multi-day forecast
```

### Module: Inputs (for skills with structured parameters)

Use when the skill accepts formal parameters:

**English:**
```markdown
## Inputs

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| location | string | Yes | City name, lat/lon, or zip code |
| days | number | No | Forecast days (1-7, default: 3) |
```

**Chinese:**
```markdown
## 输入

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| location | string | 是 | 城市名、经纬度或邮编 |
| days | number | 否 | 预报天数（1-7，默认3天） |
```

### Module: Outputs (for skills returning structured data)

```markdown
## Outputs
Returns JSON containing: temperature (Celsius), humidity (%), condition (string),
wind_speed (km/h), forecast (array of daily objects).
```

### Module: Example Queries (for search/query-based skills)

At least 4 examples per version. Mix direct queries and intent-based indirect queries.

**English examples:**
```markdown
## Example Queries
- "What's the weather like in Tokyo right now?"
- "Will it rain in New York this weekend?"
- "Show me the temperature forecast for London for the next 5 days"
- "I'm planning a trip to Paris next week, what should I pack?"
```

**Chinese examples (natural spoken Chinese, NOT translations):**
```markdown
## 示例查询
- "北京今天天气怎么样？"
- "上海这周末会下雨吗？"
- "帮我查一下深圳未来三天的气温"
- "我下周要去杭州出差，需要带伞吗？"
```

Chinese examples must use natural spoken patterns:
- Sentence-final particles: "吗", "呢", "怎么样"
- Colloquial verbs: "帮我查一下", "看看", "告诉我"
- Chinese-specific locations and contexts
- NEVER directly translate English examples

### Module: Setup/Installation (when environment config needed)

Include when the skill requires specific tools, API keys, or environment setup:

```markdown
## Setup

**Via ClawHub:**
    clawhub install skill-name

**Requirements:**
- `curl` (pre-installed on most systems)
- No API key required
```

## Recommended combinations by skill type

| Skill Type | Recommended Modules |
| :--- | :--- |
| CLI tool (e.g., Weather) | When to use + Quick Reference + code examples |
| API wrapper (e.g., Crypto Price) | When to use + When NOT to use + Operations + Inputs/Outputs |
| Workflow guide (e.g., Automation) | When to use + When NOT to use + Capabilities + Example Queries |
| Knowledge skill (e.g., Ontology) | When to use + Capabilities + Quick Reference |
| Agent enhancement (e.g., Self-Improving) | When to use + Quick Reference + Setup |
