# Bilingual Rules

Always generate both English and Chinese versions for every skill. They are published as separate skills targeting different ClawHub sites with fundamentally different search mechanisms.

## Critical platform difference

| Platform | Search mechanism | Language support | Description source |
| :--- | :--- | :--- | :--- |
| clawhub.ai | Text filter on name/slug/summary | English only — Chinese chars return zero results | Frontmatter `description` |
| cn.clawhub-mirror.com | Localized search supporting Chinese | Chinese + English | Localized Chinese description field |

This means: a skill with only Chinese text in name/slug/description is **completely invisible** on clawhub.ai.

## Slug naming

| Language | Format | Rule | Examples |
| :--- | :--- | :--- | :--- |
| English | `[core-function]` or `[core-function]-[qualifier]` | kebab-case; use concise, searchable terms; NO mandatory `-api` suffix | `weather`, `crypto-price`, `multi-search-engine`, `baidu-search` |
| Chinese | `[function]-zh` or `[chinese-pinyin]` | Include `-zh` suffix or use pinyin for Chinese-specific skills | `weather-zh`, `tianqi-weather`, `amap-weather` |

**Slug best practices** (based on Top 25 analysis — none use `-api` suffix):
- Keep slugs short and keyword-rich
- Use the most common English term for the function
- For Chinese versions, mixing English function words with `-zh` suffix works well

## Name (display title)

**English**: Use concise, keyword-rich names. Core function keywords must appear in the name. The name is the highest-weight field in ClawHub search.

Good examples from Top 25:
- "Weather" (simple, direct)
- "Multi Search Engine" (descriptive)
- "Baidu Search" (specific)
- "Nano Banana Pro" (branded but clear)

**Chinese**: Use natural Chinese expressions. Focus on words Chinese users actually search for on cn.clawhub-mirror.com.

| English Name | Good Chinese Name | Bad Chinese Name |
| :--- | :--- | :--- |
| Weather | 天气查询 | 天气 API |
| Crypto Price | 加密货币行情查询 | 加密价格 API |
| Multi Search Engine | 多引擎搜索 | Multi 搜索引擎 |
| Stock Market | 股票行情 - 实时股价与K线数据 | 股票市场 API |

## Search optimization strategy

### For clawhub.ai (English version)

Since the main site uses text-based filtering on name/slug/summary:
1. **Name must contain primary search keywords** — "Weather", "Search", "PDF" etc.
2. **Slug must be searchable** — users may search by slug directly
3. **Description must include exact terms users type** — not just semantic synonyms
4. **Chinese characters in description are useless** on the main site

### For cn.clawhub-mirror.com (Chinese version)

The Chinese site has its own localized descriptions and supports Chinese search:
1. **Use natural, conversational Chinese** in descriptions
2. **Include high-frequency Chinese search terms**: 查询, 获取, 分析, 搜索, 监控, 数据, 价格, 趋势
3. **Keep core English terms** (API names, tool names) alongside Chinese text for users who search in English
4. **Match the tone of top Chinese skills**: "帮你查询全球城市的天气", "通过高德API帮你查询中国各地实时天气"

### Chinese description style guide

Chinese descriptions on cn.clawhub-mirror.com use a distinctive conversational style:

**Good (matches platform style):**
```
帮你查询全球城市的天气、气温、降雨信息，还能给出实用的出行参考建议
通过高德API帮你查询中国各地实时天气和未来4天天气预报，提供准确天气信息
帮你查询指定城市天气信息，支持实时天气和未来多日预报查询
```

**Bad (too formal/technical):**
```
查询全球任意地点的实时天气和多日预报。触发条件：当用户询问天气时使用。
一个强大的天气查询工具，可以获取天气数据。
```

### Example query requirements (for SKILL.md body)

Chinese examples must reflect how Chinese users actually ask questions:
- Use sentence-final particles: "吗", "呢", "怎么样"
- Use colloquial expressions: "帮我查一下", "看看", "告诉我"
- Use Chinese-specific locations, platforms, and contexts
- NEVER directly translate English examples

**Good Chinese examples:**
```
- "北京今天天气怎么样？"
- "帮我查一下比特币现在多少钱"
- "最近A股走势怎么看？"
- "上海这周末会下雨吗？"
```

**Bad Chinese examples (literal translations):**
```
- "东京现在的天气是什么样的？" (too formal)
- "向我展示伦敦的温度预报" (unnatural)
```

### Name localization

Use the most familiar Chinese terms for the domain:
- "加密货币" not "Crypto"
- "推特" or "X/推特" not "Twitter"
- "股票" not "Stock"
- "人工智能" not "AI" (though "AI" is acceptable in tech contexts)
