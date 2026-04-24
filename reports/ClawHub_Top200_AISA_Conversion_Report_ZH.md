# ClawHub 三榜 Top 200 AISA 改造机会报告

- 生成时间：2026-04-24T11:01:36.232779+00:00
- 数据来源：https://clawhub.ai/skills?sort=downloads&dir=desc、https://clawhub.ai/skills?sort=stars&dir=desc、https://clawhub.ai/skills?sort=installs&dir=desc
- 分析范围：downloads / stars / installs 各 Top 200

## 一、结论
- 三榜 Top 200 合并后共得到 312 个唯一 skill。
- 其中适合改造成非 AISA -> AISA 的候选共有 218 个。
- 最适合 AISA 的大类依次是：Search、Developer、Workspace、Office、Browser Automation、Finance、Social、Security。
- 真正值得优先做的不是所有热门 skill，而是那些既热门、又能被 API 化、还能拆成作品集矩阵的 skill。

## 二、分类结果
| 分类 | 三榜 Top 200 合并数 | 适合转 AISA 数 | 判断 |
| --- | --- | --- | --- |
| Search & Research | 42 | 42 | 高频信息入口，最适合 API 化和多变体扩张。 |
| Finance & Market Data | 32 | 32 | 决策价值高，付费意愿强，适合专业套餐。 |
| Media Generation | 30 | 30 | 展示强、传播强、按量收费自然。 |
| Browser & Automation | 23 | 23 | 自动化价值高，适合高阶付费和团队套餐。 |
| Productivity & Workspace | 20 | 20 | 团队协作与办公自动化适合做多席位和高客单价套餐。 |
| Developer | 18 | 18 | 开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。 |
| Office Documents | 17 | 17 | 文档办公场景清晰，容易切成 Word/Excel/PPT/PDF 多 SKU。 |
| Video & Creator Research | 14 | 14 | 内容研究、竞品研究、选题验证都适合变成 API 和工作流 skill。 |
| Security & Audit | 13 | 13 | 安装决策、风险治理、企业合规都适合高价。 |
| Social & Growth | 8 | 8 | 适合做研究、监控、发布、互动四层矩阵。 |
| Weather & Utility Data | 1 | 1 | 高频低门槛，适合做调用量和嵌入型产品。 |
| General Utility | 60 | 0 | 需重新定义更窄 JTBD 才更容易成为爆款。 |
| Agentic Systems | 34 | 0 | 更适合做上层系统能力和旗舰叙事入口，而不是单点 API 包。 |

## 三、最适合改造成 AISA 的前 100 个候选
| 排名 | Skill | 作者 | 分类 | 改造分 | 目标标题 | 目标 API 家族 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Github | steipete | Developer | 95.83 | GitHub Command Center | Developer Platform API |
| 2 | Multi Search Engine | gpyangyoujun | Search & Research | 95.46 | Multi-Source Search Command Center | Search API |
| 3 | Gog | steipete | Productivity & Workspace | 94.18 | Workspace Command Center | Workspace API |
| 4 | Tavily 搜索 | jacky1n7 | Search & Research | 93.58 | Multi-Source Search Command Center | Search API |
| 5 | Notion | steipete | Productivity & Workspace | 92.43 | Workspace Command Center | Workspace API |
| 6 | Baidu web search | ide-rea | Search & Research | 92.29 | Multi-Source Search Command Center | Search API |
| 7 | Skill Vetter | spclaudehome | Security & Audit | 92.12 | Security Audit Command Center | Security Audit API |
| 8 | API Gateway | byungkyu | Developer | 92.12 | Developer Command Center | Developer Platform API |
| 9 | Nano Pdf | steipete | Office Documents | 91.64 | Document Office Command Center | Document Office API |
| 10 | Brave Search | steipete | Search & Research | 91.5 | Multi-Source Search Command Center | Search API |
| 11 | Mcporter | steipete | Browser & Automation | 91.28 | Browser Automation Command Center | Browser Automation API |
| 12 | Agent Browser | matrixy | Browser & Automation | 91.24 | Browser Automation Command Center | Browser Automation API |
| 13 | Clawdbot Documentation Expert | nicholasspisak | Search & Research | 91.12 | Research Command Center | Search API |
| 14 | Model Usage | steipete | Developer | 90.67 | Developer Command Center | Developer Platform API |
| 15 | Humanizer | biostartechnology | Media Generation | 90.54 | Media Generation Command Center | Media Generation API |
| 16 | Nano Banana Pro | steipete | Media Generation | 90.54 | Media Generation Command Center | Media Generation API |
| 17 | Automation Workflows | jk-0001 | Browser & Automation | 90.53 | Browser Automation Command Center | Browser Automation API |
| 18 | Slack | steipete | Productivity & Workspace | 90.01 | Workspace Command Center | Workspace API |
| 19 | Skill Creator | chindden | Video & Creator Research | 89.79 | Video Research Command Center | Video Research API |
| 20 | News Summary | joargp | Search & Research | 89.71 | Multi-Source Search Command Center | Search API |
| 21 | Desktop Control | matagul | Browser & Automation | 89.41 | Browser Automation Command Center | Browser Automation API |
| 22 | Word / DOCX | ivangdavila | Office Documents | 89.35 | Document Office Command Center | Document Office API |
| 23 | Excel / XLSX | ivangdavila | Office Documents | 88.85 | Document Office Command Center | Document Office API |
| 24 | Stock Analysis | udiedrichsen | Finance & Market Data | 88.41 | Market Data Command Center | Market Data API |
| 25 | Himalaya | lamelas | Productivity & Workspace | 87.84 | Workspace Command Center | Workspace API |
| 26 | Tavily Search | matthew77 | Search & Research | 87.71 | Multi-Source Search Command Center | Search API |
| 27 | Playwright MCP | spiceman161 | Browser & Automation | 87.7 | Browser Automation Command Center | Browser Automation API |
| 28 | AdMapix | fly0pants | Finance & Market Data | 87.66 | Market Data Command Center | Market Data API |
| 29 | Video Frames | steipete | Video & Creator Research | 87.42 | Video Research Command Center | Video Research API |
| 30 | UI/UX Pro Max | xobi667 | Developer | 87.12 | Developer Command Center | Developer Platform API |
| 31 | imap-smtp-email | gzlicanyi | Productivity & Workspace | 86.97 | Workspace Command Center | Workspace API |
| 32 | YouTube Watcher | michaelgathara | Video & Creator Research | 86.92 | YouTube SERP Scout | Video Research API |
| 33 | Markdown Converter | steipete | Office Documents | 86.89 | Document Office Command Center | Document Office API |
| 34 | Browser Use | shawnpana | Browser & Automation | 86.28 | Browser Automation Command Center | Browser Automation API |
| 35 | Powerpoint / PPTX | ivangdavila | Office Documents | 85.64 | Document Office Command Center | Document Office API |
| 36 | Deep Research Pro | parags | Search & Research | 85.58 | Multi-Source Search Command Center | Search API |
| 37 | Weather | steipete | Weather & Utility Data | 85.45 | Weather Decision API | Weather / Utility API |
| 38 | Qmd | steipete | Browser & Automation | 85.45 | Browser Automation Command Center | Browser Automation API |
| 39 | Playwright (Automation + MCP + Scraper) | ivangdavila | Browser & Automation | 85.41 | Browser Automation Command Center | Browser Automation API |
| 40 | n8n workflow automation | kowl64 | Browser & Automation | 84.95 | Browser Automation Command Center | Browser Automation API |
| 41 | Session-logs | guogang1024 | Search & Research | 84.79 | Research Command Center | Search API |
| 42 | Data Analysis | ivangdavila | Productivity & Workspace | 84.76 | Workspace Command Center | Workspace API |
| 43 | Spotify Player | steipete | Search & Research | 84.67 | Research Command Center | Search API |
| 44 | Caldav Calendar | asleep123 | Productivity & Workspace | 84.59 | Workspace Command Center | Workspace API |
| 45 | Apple Notes | steipete | Productivity & Workspace | 84.55 | Workspace Command Center | Workspace API |
| 46 | Discord | steipete | Social & Growth | 84.48 | Social Growth Command Center | Social API |
| 47 | Xiaohongshu (小红书) Automation | borye | Social & Growth | 84.28 | Browser Automation Command Center | Social API |
| 48 | Browser Automation | peytoncasper | Browser & Automation | 84.12 | Browser Automation Command Center | Browser Automation API |
| 49 | Stock Watcher | robin797860 | Finance & Market Data | 83.95 | Market Data Command Center | Market Data API |
| 50 | Gmail | byungkyu | Productivity & Workspace | 83.72 | Workspace Command Center | Workspace API |
| 51 | Filesystem Management | gtrusler | Search & Research | 83.46 | Research Command Center | Search API |
| 52 | Find Skills Skill | fangkelvin | Media Generation | 83.04 | Media Generation Command Center | Media Generation API |
| 53 | Stock Market Pro | kys42 | Finance & Market Data | 82.91 | Market Data Command Center | Market Data API |
| 54 | AgentMail | adboio | Productivity & Workspace | 82.84 | Workspace Command Center | Workspace API |
| 55 | Tavily AI Search | bert-builder | Search & Research | 82.83 | Multi-Source Search Command Center | Search API |
| 56 | description: 将用户讲稿一键生成乔布斯风极简科技感竖屏HTML演示稿。当用户需要生成PPT、演示文稿、Slides、幻灯片，或要求科技风/极简风/乔布斯风格的演示时触发此技能。输出为单个可直接运行的HTML文件。 | wwlyzzyorg | Office Documents | 82.72 | Document Office Command Center | Document Office API |
| 57 | 1password | steipete | Office Documents | 82.6 | Document Office Command Center | Document Office API |
| 58 | Pdf | awspace | Office Documents | 82.47 | Document Office Command Center | Document Office API |
| 59 | Answer Overflow | rhyssullivan | Developer | 82.38 | Developer Command Center | Developer Platform API |
| 60 | Exa Web Search (Free) | whiteknight07 | Search & Research | 82.33 | Multi-Source Search Command Center | Search API |
| 61 | Polymarket | joelchance | Finance & Market Data | 82.24 | Market Data Command Center | Market Data API |
| 62 | Web Search | billyutw | Search & Research | 82.0 | Multi-Source Search Command Center | Search API |
| 63 | Goplaces | steipete | Search & Research | 81.62 | Research Command Center | Search API |
| 64 | Playwright Scraper Skill | waisimon | Browser & Automation | 81.28 | Browser Automation Command Center | Browser Automation API |
| 65 | Web Search Plus | robbyczgw-cla | Search & Research | 81.08 | Multi-Source Search Command Center | Search API |
| 66 | Performs web searches using DuckDuckGo to retrieve real-time information from the internet. Use when the user needs to search for current events, documentation, tutorials, or any information that requires web search capabilities. | 10e9928a | Search & Research | 80.5 | Multi-Source Search Command Center | Search API |
| 67 | Marketing Mode | thesethrose | Finance & Market Data | 80.45 | Market Data Command Center | Market Data API |
| 68 | Opencode-controller | karatla | Developer | 80.33 | Developer Command Center | Developer Platform API |
| 69 | DuckDuckGo Web Search | jakelin | Search & Research | 80.25 | Multi-Source Search Command Center | Search API |
| 70 | Academic Deep Research | kesslerio | Search & Research | 79.96 | Multi-Source Search Command Center | Search API |
| 71 | Code | ivangdavila | Developer | 79.75 | Developer Command Center | Developer Platform API |
| 72 | Baidu Wenku AIPPT | ide-rea | Office Documents | 79.6 | Document Office Command Center | Document Office API |
| 73 | Git Essentials | arnarsson | Developer | 79.46 | Developer Command Center | Developer Platform API |
| 74 | Humanizer | brandonwise | Media Generation | 79.25 | Media Generation Command Center | Media Generation API |
| 75 | Prismfy Web Search | uroboros1205 | Search & Research | 78.96 | Multi-Source Search Command Center | Search API |
| 76 | Baidu AI Map（百度地图官方AI SKills） | lbs-bmap | Search & Research | 78.79 | Research Command Center | Search API |
| 77 | Web Search by Exa | theishangoswami | Search & Research | 78.54 | Multi-Source Search Command Center | Search API |
| 78 | Market Research | ivangdavila | Finance & Market Data | 78.2 | Market Data Command Center | Market Data API |
| 79 | YouTube | byungkyu | Video & Creator Research | 78.0 | YouTube SERP Scout | Video Research API |
| 80 | Intelligent Stocks Screener | financial-ai-analyst | Finance & Market Data | 77.91 | Market Data Command Center | Market Data API |
| 81 | Openai Image Gen | steipete | Media Generation | 77.88 | Image & Video Command Center | Media Generation API |
| 82 | Shop | shopify | Search & Research | 77.75 | Research Command Center | Search API |
| 83 | Gifgrep | steipete | Productivity & Workspace | 77.51 | Workspace Command Center | Workspace API |
| 84 | Firecrawl Search | ashwingupy | Search & Research | 77.46 | Multi-Source Search Command Center | Search API |
| 85 | Frontend Design | michaelmonetized | Developer | 77.25 | Developer Command Center | Developer Platform API |
| 86 | MoltGuard - Security & Antivirus & Guardrails | thomas-security | Security & Audit | 77.24 | Security Audit Command Center | Security Audit API |
| 87 | Docker Essentials | arnarsson | Media Generation | 76.88 | Media Generation Command Center | Media Generation API |
| 88 | X Search | jaaneek | Search & Research | 76.83 | Multi-Source Search Command Center | Search API |
| 89 | EcomSeer | fly0pants | Finance & Market Data | 76.33 | Market Data Command Center | Market Data API |
| 90 | Oracle | steipete | Browser & Automation | 76.24 | Browser Automation Command Center | Browser Automation API |
| 91 | n8n | thomasansems | Browser & Automation | 76.2 | Browser Automation Command Center | Browser Automation API |
| 92 | Local Places | steipete | Search & Research | 76.17 | Research Command Center | Search API |
| 93 | Things Mac | steipete | Productivity & Workspace | 76.09 | Workspace Command Center | Workspace API |
| 94 | Home Assistant | iahmadzain | Browser & Automation | 76.03 | Browser Automation Command Center | Browser Automation API |
| 95 | Filesystem | amaofx | Search & Research | 75.96 | Research Command Center | Search API |
| 96 | All-Market Financial Data Hub | financial-ai-analyst | Finance & Market Data | 75.91 | Market Data Command Center | Market Data API |
| 97 | Bear Notes | steipete | Productivity & Workspace | 75.88 | Workspace Command Center | Workspace API |
| 98 | China Stock Analysis | paulshe | Finance & Market Data | 75.87 | Market Data Command Center | Market Data API |
| 99 | Security Auditor | jgarrison929 | Security & Audit | 75.7 | Security Audit Command Center | Security Audit API |
| 100 | Calendar | ndcccccc | Productivity & Workspace | 75.59 | Workspace Command Center | Workspace API |

## 四、Top 20 候选的爆款改造打法

### Github | @steipete
- 热度表现：appearances 3，downloads 163764，stars 535，installs 4077。
- 适合转 AISA 的原因：开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。
- 目标标题：GitHub Command Center
- 目标 JTBD：让开发者在一条工作流里完成仓库研究、代码决策、Issue/PR 处理或开发协作。
- 改造动作：
  - 先把 skill 名字改成开发者会搜索的平台词或任务词。
  - 旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。
  - 用示例仓库和真实输出样板强化首轮成功率。

### Multi Search Engine | @gpyangyoujun
- 热度表现：appearances 3，downloads 127456，stars 602，installs 1840。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Gog | @steipete
- 热度表现：appearances 3，downloads 161529，stars 849，installs 3352。
- 适合转 AISA 的原因：团队协作与办公自动化适合做多席位和高客单价套餐。
- 目标标题：Workspace Command Center
- 目标 JTBD：让用户把日常办公动作统一收进一个可复用的 command center。
- 改造动作：
  - 以 command center 方式整合办公动作。
  - 先做个人工作流，再扩团队协作和自动化套餐。
  - 发布页要强调每天都会用到的场景。

### Tavily 搜索 | @jacky1n7
- 热度表现：appearances 3，downloads 85966，stars 228，installs 1228。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Notion | @steipete
- 热度表现：appearances 3，downloads 79306，stars 235，installs 2224。
- 适合转 AISA 的原因：团队协作与办公自动化适合做多席位和高客单价套餐。
- 目标标题：Workspace Command Center
- 目标 JTBD：让用户把日常办公动作统一收进一个可复用的 command center。
- 改造动作：
  - 以 command center 方式整合办公动作。
  - 先做个人工作流，再扩团队协作和自动化套餐。
  - 发布页要强调每天都会用到的场景。

### Baidu web search | @ide-rea
- 热度表现：appearances 3，downloads 80997，stars 204，installs 843。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Skill Vetter | @spclaudehome
- 热度表现：appearances 3，downloads 219735，stars 960，installs 4073。
- 适合转 AISA 的原因：安装决策、风险治理、企业合规都适合高价。
- 目标标题：Security Audit Command Center
- 目标 JTBD：让用户在高风险决策前快速得到可执行的安全判断。
- 改造动作：
  - 让输出直接形成通过/警告/阻断决策。
  - 先占高风险安装前入口，再扩依赖、权限、合规变体。
  - 把风险解释和证据输出成结构化模板。

### API Gateway | @byungkyu
- 热度表现：appearances 3，downloads 71151，stars 358，installs 515。
- 适合转 AISA 的原因：开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。
- 目标标题：Developer Command Center
- 目标 JTBD：让开发者在一条工作流里完成仓库研究、代码决策、Issue/PR 处理或开发协作。
- 改造动作：
  - 先把 skill 名字改成开发者会搜索的平台词或任务词。
  - 旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。
  - 用示例仓库和真实输出样板强化首轮成功率。

### Nano Pdf | @steipete
- 热度表现：appearances 3，downloads 94785，stars 227，installs 2385。
- 适合转 AISA 的原因：文档办公场景清晰，容易切成 Word/Excel/PPT/PDF 多 SKU。
- 目标标题：Document Office Command Center
- 目标 JTBD：让文档和表格操作从零散工具变成可直接调用的办公能力层。
- 改造动作：
  - 先做 Word / Excel / PPT / PDF 的独立高意图入口。
  - 再做 Office 全家桶汇总包。
  - 突出结构化输出和批量处理能力。

### Brave Search | @steipete
- 热度表现：appearances 3，downloads 51853，stars 175，installs 707。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Mcporter | @steipete
- 热度表现：appearances 3，downloads 58228，stars 177，installs 1857。
- 适合转 AISA 的原因：自动化价值高，适合高阶付费和团队套餐。
- 目标标题：Browser Automation Command Center
- 目标 JTBD：让复杂网页操作变成可重复执行的自动化能力。
- 改造动作：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。

### Agent Browser | @matrixy
- 热度表现：appearances 3，downloads 96677，stars 350，installs 652。
- 适合转 AISA 的原因：自动化价值高，适合高阶付费和团队套餐。
- 目标标题：Browser Automation Command Center
- 目标 JTBD：让复杂网页操作变成可重复执行的自动化能力。
- 改造动作：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。

### Clawdbot Documentation Expert | @nicholasspisak
- 热度表现：appearances 3，downloads 36621，stars 286，installs 534。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Research Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Model Usage | @steipete
- 热度表现：appearances 3，downloads 33067，stars 105，installs 1482。
- 适合转 AISA 的原因：开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。
- 目标标题：Developer Command Center
- 目标 JTBD：让开发者在一条工作流里完成仓库研究、代码决策、Issue/PR 处理或开发协作。
- 改造动作：
  - 先把 skill 名字改成开发者会搜索的平台词或任务词。
  - 旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。
  - 用示例仓库和真实输出样板强化首轮成功率。

### Humanizer | @biostartechnology
- 热度表现：appearances 3，downloads 95552，stars 563，installs 1279。
- 适合转 AISA 的原因：展示强、传播强、按量收费自然。
- 目标标题：Media Generation Command Center
- 目标 JTBD：让用户用可展示、可复用的媒体生成入口快速出结果。
- 改造动作：
  - 把模型能力改写成用户目标，而不是模型名堆叠。
  - 拆出图片、视频、风格、商品图等多入口变体。
  - 通过结果展示强化传播和收藏。

### Nano Banana Pro | @steipete
- 热度表现：appearances 3，downloads 90000，stars 353，installs 1732。
- 适合转 AISA 的原因：展示强、传播强、按量收费自然。
- 目标标题：Media Generation Command Center
- 目标 JTBD：让用户用可展示、可复用的媒体生成入口快速出结果。
- 改造动作：
  - 把模型能力改写成用户目标，而不是模型名堆叠。
  - 拆出图片、视频、风格、商品图等多入口变体。
  - 通过结果展示强化传播和收藏。

### Automation Workflows | @jk-0001
- 热度表现：appearances 3，downloads 68487，stars 267，installs 978。
- 适合转 AISA 的原因：自动化价值高，适合高阶付费和团队套餐。
- 目标标题：Browser Automation Command Center
- 目标 JTBD：让复杂网页操作变成可重复执行的自动化能力。
- 改造动作：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。

### Slack | @steipete
- 热度表现：appearances 3，downloads 40233，stars 124，installs 1333。
- 适合转 AISA 的原因：团队协作与办公自动化适合做多席位和高客单价套餐。
- 目标标题：Workspace Command Center
- 目标 JTBD：让用户把日常办公动作统一收进一个可复用的 command center。
- 改造动作：
  - 以 command center 方式整合办公动作。
  - 先做个人工作流，再扩团队协作和自动化套餐。
  - 发布页要强调每天都会用到的场景。

### Skill Creator | @chindden
- 热度表现：appearances 3，downloads 74142，stars 255，installs 2223。
- 适合转 AISA 的原因：内容研究、竞品研究、选题验证都适合变成 API 和工作流 skill。
- 目标标题：Video Research Command Center
- 目标 JTBD：让创作者和研究者快速验证选题、竞品和内容趋势。
- 改造动作：
  - 把快速搜索和深度研究拆成双层入口。
  - 强调选题、竞品、趋势三类场景。
  - 准备不同国家和语言的对比样例。

### News Summary | @joargp
- 热度表现：appearances 3，downloads 38056，stars 120，installs 482。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

## 五、前 100 改造计划的实施顺序
- 第 1 波：前 10 名，做旗舰包和样板案例。
- 第 2 波：11-40 名，做同家族变体包和中文镜像。
- 第 3 波：41-100 名，按行业、地区、细分人群继续扩张。
- 每一波都要优先做可 API 化的高价值入口，再做长尾实验。
