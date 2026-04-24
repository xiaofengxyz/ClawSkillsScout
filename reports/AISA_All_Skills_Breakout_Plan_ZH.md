# AISA 全量 Skills 爆款改造计划

- 生成时间：2026-04-24T11:01:28.504783+00:00
- 规划范围：63 个现有 AISA skills / repo-local AISA 包

## 一、压缩结论
历史结论压缩摘要

1. 10K+ 系统报告已修正关键统计错误。
- `@ivangdavila` 原先被错误显示为 `10K+ 技能 0`，根因是作者作品集低下载数据覆盖了 10k 榜单高下载样本。
- 已在 `scripts/build-clawhub-10k-system-report.py` 修复为按 `slug` 合并并取更高下载量。
- 修复后 `@ivangdavila` 回正为多款 10K+ 技能作者，代表作包括 `Self-Improving + Proactive Agent`、`Word / DOCX`、`Excel / XLSX`。

2. `Unknown` API 家族不是“没有 API”，而是“当前脚本无法从标题/简介准确识别依赖家族”。

3. 本地 7 个 AISA runtime 包已完成第一轮爆款化包装升级。
- 已统一为 `metadata.aisa`
- 已补 `compatibility`
- 已去掉旧式 `${SKILL_ROOT}` 引用
- 已补 `High-Intent Workflows` 和 `Example Requests`
- 已同步到 `packages/source-optimized*` 和 `templates/source-optimized*`

4. `verify-source-optimized.mjs` 已增强。
- 现在会检查 `metadata.aisa`
- 会检查 `compatibility`
- 会拦旧式 `${SKILL_ROOT}` / `${LAST30DAYS_PYTHON}`

5. 本地 AISA 旗舰 skill 已明确。
- 第一优先：`aisa-twitter-api`
- 原因：本地 AISA 包里安装转化最强，品牌一致性最好，最适合做 AISA 官方旗舰包

## 二、总体判断
- 现有 AISA skills 的问题不是能力少，而是标题、入口分层、矩阵关系和首轮成功路径不够强。
- 需要把技能集从“平铺发布”改成“旗舰包 + 变体包 + 中文镜像包 + API 收益层”。
- 先做强入口，再做广覆盖；先拿安装和心智，再拿长尾变体。

## 三、按优先级看的全量改造顺序
| 优先级 | Owner | Skill | 分类 | 目标标题 | 作品集角色 |
| --- | --- | --- | --- | --- | --- |
| P0 | aisadocs | Web Search by Tavily | Search & Research | Multi-Source Search Command Center | flagship |
| P0 | 0xjordansg-yolo | X/Twitter Automation: 30+ APIs, OAuth Post, One Key | Social & Growth | Twitter API Command Center | flagship |
| P0 | aisapay | AIsa Twitter API (Search + Post) | Social & Growth | Twitter API Command Center | flagship |
| P0 | karensheng | X Intelligence Automation | Browser & Automation | Browser Automation Command Center | flagship |
| P0 | 0xjordansg-yolo | Generate images & videos with: Gemini 3 Pro Image (image) + Qwen Wan 2.6 (video) via one API key | Video & Creator Research | Image & Video Command Center | growth-variant |
| P0 | aisadocs | Images & videos generation with Gemini 3 Pro Image + Qwen Wan 2.6 (video) via one API key | Video & Creator Research | Image & Video Command Center | growth-variant |
| P1 | 0xjordansg-yolo | Query real-time and historical financial data across equities and crypto prices | Finance & Market Data | Market Data Command Center | growth-variant |
| P1 | 0xjordansg-yolo | Web Search Tavily | Search & Research | Multi-Source Search Command Center | supporting-variant |
| P1 | 0xjordansg-yolo | Multi-source retrieval with confidence scoring - web, academic, and Tavily in one unified API | Search & Research | Multi-Source Search Command Center | supporting-variant |
| P1 | aisapay | Financial Data | Finance & Market Data | Market Data Command Center | growth-variant |
| P1 | 0xjordansg-yolo | YouTube SERP Scout for agents. Search top-ranking videos, channels, and trends for content research and competitor tracking | Video & Creator Research | YouTube SERP Scout | supporting-variant |
| P1 | aisapay | AIsa Multi Source Search | Search & Research | Multi-Source Search Command Center | growth-variant |
| P1 | chaimengphp | Unified API for powerful image and video generation | Video & Creator Research | Image & Video Command Center | flagship |
| P1 | 0xjordansg-yolo | One API key for real time stock equity pricing data including crypto BTC ETH etc. | Finance & Market Data | Market Data Command Center | long-tail-experiment |
| P1 | 0xjordansg-yolo | US Stock Analyst by leading AI LLM models with Bloomberg Data, Twitter Sentiment and Wall Street Equity Research Reports | Social & Growth | Twitter API Command Center | long-tail-experiment |
| P1 | 0xjordansg-yolo | X Twitter Automataion (Search + Post) | Social & Growth | Twitter API Command Center | long-tail-experiment |
| P2 | aisapay | AIsa Media Gen | Media Generation | Image & Video Command Center | supporting-variant |
| P2 | aisapay | AIsa Youtube Search | Video & Creator Research | YouTube SERP Scout | supporting-variant |
| P2 | aisapay | AIsa Financial Data | Finance & Market Data | Market Data Command Center | supporting-variant |
| P2 | chaimengphp | X Twitter Command Center (Search + Post) | Social & Growth | Twitter API Command Center | growth-variant |
| P2 | chaimengphp | MarketPulse (Stocks + Crypto Data) | Finance & Market Data | Market Data Command Center | growth-variant |
| P2 | aisadocs | Intelligent search for agents. Multi-source retrieval with confidence scoring - web, academic, and Tavily in one unified API | Search & Research | Multi-Source Search Command Center | growth-variant |
| P2 | chaimengphp | YouTube SERP Scout (Rank + Discover) | Video & Creator Research | YouTube SERP Scout | supporting-variant |
| P2 | chaimengphp | Verified Research Engine (Web + Academic + Confidence Score) | Search & Research | Multi-Source Search Command Center | supporting-variant |
| P2 | aisadocs | Query real-time and historical financial data across equities and crypto prices, market moves, metrics, and trends for analysis, alerts, and reporting | Finance & Market Data | Market Data Command Center | supporting-variant |

## 四、按 Owner 的爆款改造策略

### @bibaofeng
- 当前纳入规划数量：19
- 最强入口：x-intelligence-automation-aisa -> Browser Automation Command Center
- 作品集判断：自动化价值高，适合高阶付费和团队套餐。
- 改造策略：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。
- 该 owner 的优先 skill：
  - x-intelligence-automation-aisa | Browser & Automation | P3 | 目标：Browser Automation Command Center
  - 预测市场数据 | Finance & Market Data | P3 | 目标：Market Data Command Center
  - 预测市场套利 | Finance & Market Data | P3 | 目标：Market Data Command Center
  - Prediction Market Arbitrage Api | Finance & Market Data | P3 | 目标：Market Data Command Center
  - Prediction Market Data | Finance & Market Data | P3 | 目标：Market Data Command Center

### @0xjordansg-yolo
- 当前纳入规划数量：13
- 最强入口：X/Twitter Automation: 30+ APIs, OAuth Post, One Key -> Twitter API Command Center
- 作品集判断：适合做研究、监控、发布、互动四层矩阵。
- 改造策略：
  - 把读、写、互动、增长拆成不同层级 skill。
  - 旗舰包负责研究 + 发布，变体包负责 engage 或监控。
  - 示例 prompt 要直接覆盖爆款选题、竞品研究和发帖链路。
- 该 owner 的优先 skill：
  - X/Twitter Automation: 30+ APIs, OAuth Post, One Key | Social & Growth | P0 | 目标：Twitter API Command Center
  - Generate images & videos with: Gemini 3 Pro Image (image) + Qwen Wan 2.6 (video) via one API key | Video & Creator Research | P0 | 目标：Image & Video Command Center
  - Query real-time and historical financial data across equities and crypto prices | Finance & Market Data | P1 | 目标：Market Data Command Center
  - Web Search Tavily | Search & Research | P1 | 目标：Multi-Source Search Command Center
  - Multi-source retrieval with confidence scoring - web, academic, and Tavily in one unified API | Search & Research | P1 | 目标：Multi-Source Search Command Center

### @aisadocs
- 当前纳入规划数量：13
- 最强入口：Web Search by Tavily -> Multi-Source Search Command Center
- 作品集判断：高频信息入口，最适合 API 化和多变体扩张。
- 改造策略：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。
- 该 owner 的优先 skill：
  - Web Search by Tavily | Search & Research | P0 | 目标：Multi-Source Search Command Center
  - Images & videos generation with Gemini 3 Pro Image + Qwen Wan 2.6 (video) via one API key | Video & Creator Research | P0 | 目标：Image & Video Command Center
  - Intelligent search for agents. Multi-source retrieval with confidence scoring - web, academic, and Tavily in one unified API | Search & Research | P2 | 目标：Multi-Source Search Command Center
  - Query real-time and historical financial data across equities and crypto prices, market moves, metrics, and trends for analysis, alerts, and reporting | Finance & Market Data | P2 | 目标：Market Data Command Center
  - Generate images & videos with: Gemini 3 Pro Image + Qwen Wan 2.6 (video) via one API key | Video & Creator Research | P2 | 目标：Image & Video Command Center

### @chaimengphp
- 当前纳入规划数量：11
- 最强入口：Unified API for powerful image and video generation -> Image & Video Command Center
- 作品集判断：内容研究、竞品研究、选题验证都适合变成 API 和工作流 skill。
- 改造策略：
  - 把快速搜索和深度研究拆成双层入口。
  - 强调选题、竞品、趋势三类场景。
  - 准备不同国家和语言的对比样例。
- 该 owner 的优先 skill：
  - Unified API for powerful image and video generation | Video & Creator Research | P1 | 目标：Image & Video Command Center
  - X Twitter Command Center (Search + Post) | Social & Growth | P2 | 目标：Twitter API Command Center
  - MarketPulse (Stocks + Crypto Data) | Finance & Market Data | P2 | 目标：Market Data Command Center
  - YouTube SERP Scout (Rank + Discover) | Video & Creator Research | P2 | 目标：YouTube SERP Scout
  - Verified Research Engine (Web + Academic + Confidence Score) | Search & Research | P2 | 目标：Multi-Source Search Command Center

### @aisapay
- 当前纳入规划数量：6
- 最强入口：AIsa Twitter API (Search + Post) -> Twitter API Command Center
- 作品集判断：适合做研究、监控、发布、互动四层矩阵。
- 改造策略：
  - 把读、写、互动、增长拆成不同层级 skill。
  - 旗舰包负责研究 + 发布，变体包负责 engage 或监控。
  - 示例 prompt 要直接覆盖爆款选题、竞品研究和发帖链路。
- 该 owner 的优先 skill：
  - AIsa Twitter API (Search + Post) | Social & Growth | P0 | 目标：Twitter API Command Center
  - Financial Data | Finance & Market Data | P1 | 目标：Market Data Command Center
  - AIsa Multi Source Search | Search & Research | P1 | 目标：Multi-Source Search Command Center
  - AIsa Media Gen | Media Generation | P2 | 目标：Image & Video Command Center
  - AIsa Youtube Search | Video & Creator Research | P2 | 目标：YouTube SERP Scout

### @karensheng
- 当前纳入规划数量：1
- 最强入口：X Intelligence Automation -> Browser Automation Command Center
- 作品集判断：自动化价值高，适合高阶付费和团队套餐。
- 改造策略：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。
- 该 owner 的优先 skill：
  - X Intelligence Automation | Browser & Automation | P0 | 目标：Browser Automation Command Center

## 五、全量 AISA skills 的共性改造动作
- 所有 skill 都要先重写成高意图任务名，而不是内部技术名。
- 所有 skill 都要明确旗舰包和变体包，不再全部用同一级别包装。
- 所有 skill 都要补充首轮成功样例、明显的升级路径和中文镜像。
- 相同家族要统一命名体系，避免互相抢搜索词。

## 六、附录：全部 AISA skills 改造表
| Owner | Skill | 下载 | 星标 | 安装 | 分类 | 优先级 | 目标标题 | 角色 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| aisadocs | Web Search by Tavily | 4294 | 9 | 19 | Search & Research | P0 | Multi-Source Search Command Center | flagship |
| 0xjordansg-yolo | X/Twitter Automation: 30+ APIs, OAuth Post, One Key | 3562 | 4 | 12 | Social & Growth | P0 | Twitter API Command Center | flagship |
| aisapay | AIsa Twitter API (Search + Post) | 3240 | 4 | 16 | Social & Growth | P0 | Twitter API Command Center | flagship |
| karensheng | X Intelligence Automation | 0 | 0 | 0 | Browser & Automation | P0 | Browser Automation Command Center | flagship |
| 0xjordansg-yolo | Generate images & videos with: Gemini 3 Pro Image (image) + Qwen Wan 2.6 (video) via one API key | 2223 | 11 | 11 | Video & Creator Research | P0 | Image & Video Command Center | growth-variant |
| aisadocs | Images & videos generation with Gemini 3 Pro Image + Qwen Wan 2.6 (video) via one API key | 1725 | 3 | 10 | Video & Creator Research | P0 | Image & Video Command Center | growth-variant |
| 0xjordansg-yolo | Query real-time and historical financial data across equities and crypto prices | 1559 | 5 | 6 | Finance & Market Data | P1 | Market Data Command Center | growth-variant |
| 0xjordansg-yolo | Web Search Tavily | 1276 | 0 | 6 | Search & Research | P1 | Multi-Source Search Command Center | supporting-variant |
| 0xjordansg-yolo | Multi-source retrieval with confidence scoring - web, academic, and Tavily in one unified API | 1280 | 4 | 2 | Search & Research | P1 | Multi-Source Search Command Center | supporting-variant |
| aisapay | Financial Data | 1454 | 0 | 6 | Finance & Market Data | P1 | Market Data Command Center | growth-variant |
| 0xjordansg-yolo | YouTube SERP Scout for agents. Search top-ranking videos, channels, and trends for content research and competitor tracking | 1518 | 3 | 4 | Video & Creator Research | P1 | YouTube SERP Scout | supporting-variant |
| aisapay | AIsa Multi Source Search | 1609 | 1 | 1 | Search & Research | P1 | Multi-Source Search Command Center | growth-variant |
| chaimengphp | Unified API for powerful image and video generation | 1183 | 1 | 6 | Video & Creator Research | P1 | Image & Video Command Center | flagship |
| 0xjordansg-yolo | One API key for real time stock equity pricing data including crypto BTC ETH etc. | 1297 | 1 | 4 | Finance & Market Data | P1 | Market Data Command Center | long-tail-experiment |
| 0xjordansg-yolo | US Stock Analyst by leading AI LLM models with Bloomberg Data, Twitter Sentiment and Wall Street Equity Research Reports | 1341 | 0 | 5 | Social & Growth | P1 | Twitter API Command Center | long-tail-experiment |
| 0xjordansg-yolo | X Twitter Automataion (Search + Post) | 1462 | 4 | 2 | Social & Growth | P1 | Twitter API Command Center | long-tail-experiment |
| aisapay | AIsa Media Gen | 1606 | 1 | 2 | Media Generation | P2 | Image & Video Command Center | supporting-variant |
| aisapay | AIsa Youtube Search | 1805 | 1 | 1 | Video & Creator Research | P2 | YouTube SERP Scout | supporting-variant |
| aisapay | AIsa Financial Data | 1327 | 0 | 2 | Finance & Market Data | P2 | Market Data Command Center | supporting-variant |
| chaimengphp | X Twitter Command Center (Search + Post) | 1253 | 0 | 3 | Social & Growth | P2 | Twitter API Command Center | growth-variant |
| chaimengphp | MarketPulse (Stocks + Crypto Data) | 1007 | 0 | 3 | Finance & Market Data | P2 | Market Data Command Center | growth-variant |
| aisadocs | Intelligent search for agents. Multi-source retrieval with confidence scoring - web, academic, and Tavily in one unified API | 918 | 0 | 0 | Search & Research | P2 | Multi-Source Search Command Center | growth-variant |
| chaimengphp | YouTube SERP Scout (Rank + Discover) | 1068 | 3 | 1 | Video & Creator Research | P2 | YouTube SERP Scout | supporting-variant |
| chaimengphp | Verified Research Engine (Web + Academic + Confidence Score) | 817 | 0 | 0 | Search & Research | P2 | Multi-Source Search Command Center | supporting-variant |
| aisadocs | Query real-time and historical financial data across equities and crypto prices, market moves, metrics, and trends for analysis, alerts, and reporting | 1113 | 0 | 1 | Finance & Market Data | P2 | Market Data Command Center | supporting-variant |
| aisadocs | Generate images & videos with: Gemini 3 Pro Image + Qwen Wan 2.6 (video) via one API key | 1057 | 2 | 0 | Video & Creator Research | P2 | Image & Video Command Center | supporting-variant |
| aisadocs | Youtube Search and Tracking API | 1296 | 0 | 0 | Video & Creator Research | P2 | YouTube SERP Scout | supporting-variant |
| chaimengphp | Perplexity Sonar Search | 209 | 0 | 0 | Search & Research | P2 | Multi-Source Search Command Center | supporting-variant |
| 0xjordansg-yolo | Search YouTube videos, channels, and playlists | 554 | 0 | 2 | Video & Creator Research | P2 | YouTube SERP Scout | long-tail-experiment |
| aisadocs | Perplexity Sonar | 97 | 0 | 0 | Search & Research | P2 | Research Command Center | long-tail-experiment |
| bibaofeng | x-intelligence-automation-aisa | 53 | 0 | 0 | Browser & Automation | P3 | Browser Automation Command Center | flagship |
| aisadocs | Twitter/X All-in-One — Search, Monitor & Publish Text & Media Posts | 223 | 1 | 0 | Social & Growth | P3 | Twitter API Command Center | long-tail-experiment |
| chaimengphp | Prediction markets data - Polymarket, Kalshi markets, prices, positions, and trades | 138 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| aisadocs | Polymarket Data | 123 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| aisadocs | Polymarket Spread Arbitrage | 122 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| bibaofeng | 预测市场数据 | 98 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | growth-variant |
| bibaofeng | 预测市场套利 | 97 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | growth-variant |
| bibaofeng | Prediction Market Arbitrage Api | 89 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | supporting-variant |
| chaimengphp | Find and analyze arbitrage opportunities across prediction markets like Polymarket and Kalshi | 85 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| bibaofeng | Prediction Market Data | 84 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | supporting-variant |
| aisadocs | Query real-time and historical financial data of equity prices, market moves, metrics, and trends for analysis, alerts, and reporting | 54 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| bibaofeng | Prediction Market | 0 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | supporting-variant |
| bibaofeng | Prediction Market Arbitrage | 0 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| bibaofeng | Prediction Market Arbitrage Zh | 0 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| bibaofeng | Prediction Market Zh | 0 | 0 | 0 | Finance & Market Data | P3 | Market Data Command Center | long-tail-experiment |
| bibaofeng | last30days | 128 | 0 | 0 | Social & Growth | P3 | Social Growth Command Center | long-tail-experiment |
| bibaofeng | last30days | 100 | 0 | 0 | Social & Growth | P3 | Social Growth Command Center | long-tail-experiment |
| chaimengphp | X Twitter Command Center (Search + Post + Interact) | 82 | 0 | 0 | Social & Growth | P3 | Twitter API Command Center | long-tail-experiment |
| bibaofeng | twitter-aisa | 79 | 0 | 0 | Social & Growth | P3 | Twitter API Command Center | long-tail-experiment |
| bibaofeng | twitter-aisa-api | 72 | 0 | 0 | Social & Growth | P3 | Twitter API Command Center | long-tail-experiment |
| bibaofeng | twitter-post-aisa | 72 | 0 | 0 | Social & Growth | P3 | Twitter API Command Center | long-tail-experiment |
| bibaofeng | aisa-twitter | 51 | 0 | 0 | Social & Growth | P3 | Twitter API Command Center | long-tail-experiment |
| bibaofeng | youtube-search-aisa | 127 | 0 | 0 | Video & Creator Research | P3 | YouTube SERP Scout | long-tail-experiment |
| bibaofeng | youtube-aisa | 122 | 0 | 0 | Video & Creator Research | P3 | YouTube SERP Scout | long-tail-experiment |
| bibaofeng | Aisa Twitter Api | 0 | 0 | 0 | Social & Growth | P3 | Twitter API Command Center | long-tail-experiment |
| bibaofeng | openclaw-aisa-youtube-aisa | 50 | 0 | 0 | Video & Creator Research | P3 | YouTube SERP Scout | long-tail-experiment |
| 0xjordansg-yolo | One API key for 70+ AI models. Route to GPT, Claude, Gemini, Qwen, Deepseek, Grok and more | 1495 | 5 | 4 | General Utility | P3 | Utility Command Center | long-tail-experiment |
| 0xjordansg-yolo | Save upto 50% for model tokens: OpenAI GPT, Claude, Gemini, Qwen, Deepseek, Grok and more with one single key | 1355 | 5 | 2 | General Utility | P3 | Utility Command Center | long-tail-experiment |
| aisadocs | Unified LLM Gateway - One API for 70+ AI models. Route to GPT, Claude, Gemini, Qwen, Deepseek, Grok and more | 1301 | 2 | 2 | General Utility | P3 | Utility Command Center | long-tail-experiment |
| 0xjordansg-yolo | Chinese LLM Models (Kimi 2.5, MiniMax 2.5, Qwen, DeepSeek) with One Key | 790 | 0 | 4 | General Utility | P3 | Utility Command Center | long-tail-experiment |
| chaimengphp | One API key for Chinese AI models. Route to Qwen, Deepseek | 1025 | 0 | 2 | General Utility | P3 | Utility Command Center | long-tail-experiment |
| chaimengphp | One API key for 70+ AI models. Route to GPT, Claude, Gemini, Grok and more | 873 | 2 | 0 | General Utility | P3 | Utility Command Center | long-tail-experiment |
| aisadocs | Chines LLM Models (MiniMax 2.5,Kimi 2.5, Qwen, Doubao, DeepSeek) with one key | 644 | 0 | 0 | General Utility | P3 | Utility Command Center | long-tail-experiment |
