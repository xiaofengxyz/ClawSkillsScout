# ClawHub 三榜 Top 200 AISA 改造机会报告

- 生成时间：2026-04-20T05:43:46.268573+00:00
- 数据来源：https://clawhub.ai/skills?sort=downloads&dir=desc、https://clawhub.ai/skills?sort=stars&dir=desc、https://clawhub.ai/skills?sort=installs&dir=desc
- 分析范围：downloads / stars / installs 各 Top 200

## 一、结论
- 三榜 Top 200 合并后共得到 309 个唯一 skill。
- 其中适合改造成非 AISA -> AISA 的候选共有 218 个。
- 最适合 AISA 的大类依次是：Search、Developer、Workspace、Office、Browser Automation、Finance、Social、Security。
- 真正值得优先做的不是所有热门 skill，而是那些既热门、又能被 API 化、还能拆成作品集矩阵的 skill。

## 二、分类结果
| 分类 | 三榜 Top 200 合并数 | 适合转 AISA 数 | 判断 |
| --- | --- | --- | --- |
| Search & Research | 42 | 42 | 高频信息入口，最适合 API 化和多变体扩张。 |
| Finance & Market Data | 31 | 31 | 决策价值高，付费意愿强，适合专业套餐。 |
| Media Generation | 30 | 30 | 展示强、传播强、按量收费自然。 |
| Browser & Automation | 23 | 23 | 自动化价值高，适合高阶付费和团队套餐。 |
| Productivity & Workspace | 23 | 23 | 团队协作与办公自动化适合做多席位和高客单价套餐。 |
| Office Documents | 17 | 17 | 文档办公场景清晰，容易切成 Word/Excel/PPT/PDF 多 SKU。 |
| Developer | 15 | 15 | 开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。 |
| Security & Audit | 14 | 14 | 安装决策、风险治理、企业合规都适合高价。 |
| Video & Creator Research | 14 | 14 | 内容研究、竞品研究、选题验证都适合变成 API 和工作流 skill。 |
| Social & Growth | 8 | 8 | 适合做研究、监控、发布、互动四层矩阵。 |
| Weather & Utility Data | 1 | 1 | 高频低门槛，适合做调用量和嵌入型产品。 |
| General Utility | 56 | 0 | 需重新定义更窄 JTBD 才更容易成为爆款。 |
| Agentic Systems | 35 | 0 | 更适合做上层系统能力和旗舰叙事入口，而不是单点 API 包。 |

## 三、最适合改造成 AISA 的前 100 个候选
| 排名 | Skill | 作者 | 分类 | 改造分 | 目标标题 | 目标 API 家族 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Github | steipete | Developer | 95.71 | GitHub Command Center | Developer Platform API |
| 2 | Multi Search Engine | gpyangyoujun | Search & Research | 95.33 | Multi-Source Search Command Center | Search API |
| 3 | Gog | steipete | Productivity & Workspace | 94.05 | Workspace Command Center | Workspace API |
| 4 | Tavily 搜索 | jacky1n7 | Search & Research | 93.54 | Multi-Source Search Command Center | Search API |
| 5 | Notion | steipete | Productivity & Workspace | 92.34 | Workspace Command Center | Workspace API |
| 6 | Baidu web search | ide-rea | Search & Research | 92.29 | Multi-Source Search Command Center | Search API |
| 7 | Skill Vetter | spclaudehome | Security & Audit | 91.99 | Security Audit Command Center | Security Audit API |
| 8 | API Gateway | byungkyu | Developer | 91.96 | Developer Command Center | Developer Platform API |
| 9 | Nano Pdf | steipete | Office Documents | 91.72 | Document Office Command Center | Document Office API |
| 10 | Brave Search | steipete | Search & Research | 91.42 | Multi-Source Search Command Center | Search API |
| 11 | Clawdbot Documentation Expert | nicholasspisak | Search & Research | 91.25 | Research Command Center | Search API |
| 12 | Mcporter | steipete | Browser & Automation | 91.16 | Browser Automation Command Center | Browser Automation API |
| 13 | Agent Browser | matrixy | Browser & Automation | 90.95 | Browser Automation Command Center | Browser Automation API |
| 14 | Model Usage | steipete | Developer | 90.58 | Developer Command Center | Developer Platform API |
| 15 | Nano Banana Pro | steipete | Media Generation | 90.5 | Media Generation Command Center | Media Generation API |
| 16 | Humanizer | biostartechnology | Media Generation | 90.46 | Media Generation Command Center | Media Generation API |
| 17 | Automation Workflows | jk-0001 | Browser & Automation | 90.37 | Browser Automation Command Center | Browser Automation API |
| 18 | Slack | steipete | Productivity & Workspace | 89.84 | Workspace Command Center | Workspace API |
| 19 | Skill Creator | chindden | Video & Creator Research | 89.67 | Video Research Command Center | Video Research API |
| 20 | News Summary | joargp | Search & Research | 89.58 | Multi-Source Search Command Center | Search API |
| 21 | Desktop Control | matagul | Browser & Automation | 89.28 | Browser Automation Command Center | Browser Automation API |
| 22 | Word / DOCX | ivangdavila | Office Documents | 89.14 | Document Office Command Center | Document Office API |
| 23 | Excel / XLSX | ivangdavila | Office Documents | 88.6 | Document Office Command Center | Document Office API |
| 24 | Stock Analysis | udiedrichsen | Finance & Market Data | 88.37 | Market Data Command Center | Market Data API |
| 25 | Himalaya | lamelas | Productivity & Workspace | 87.72 | Workspace Command Center | Workspace API |
| 26 | Tavily Search | matthew77 | Search & Research | 87.54 | Multi-Source Search Command Center | Search API |
| 27 | Playwright MCP | spiceman161 | Browser & Automation | 87.53 | Browser Automation Command Center | Browser Automation API |
| 28 | Video Frames | steipete | Video & Creator Research | 87.29 | Video Research Command Center | Video Research API |
| 29 | UI/UX Pro Max | xobi667 | Developer | 87.08 | Developer Command Center | Developer Platform API |
| 30 | imap-smtp-email | gzlicanyi | Productivity & Workspace | 86.76 | Workspace Command Center | Workspace API |
| 31 | YouTube Watcher | michaelgathara | Video & Creator Research | 86.75 | YouTube SERP Scout | Video Research API |
| 32 | Markdown Converter | steipete | Office Documents | 86.72 | Document Office Command Center | Document Office API |
| 33 | Browser Use | shawnpana | Browser & Automation | 86.37 | Browser Automation Command Center | Browser Automation API |
| 34 | AdMapix | fly0pants | Finance & Market Data | 86.28 | Market Data Command Center | Market Data API |
| 35 | Deep Research Pro | parags | Search & Research | 85.5 | Multi-Source Search Command Center | Search API |
| 36 | Qmd | steipete | Browser & Automation | 85.45 | Browser Automation Command Center | Browser Automation API |
| 37 | Weather | steipete | Weather & Utility Data | 85.33 | Weather Decision API | Weather / Utility API |
| 38 | Powerpoint / PPTX | ivangdavila | Office Documents | 85.27 | Document Office Command Center | Document Office API |
| 39 | Playwright (Automation + MCP + Scraper) | ivangdavila | Browser & Automation | 85.2 | Browser Automation Command Center | Browser Automation API |
| 40 | n8n workflow automation | kowl64 | Browser & Automation | 84.91 | Browser Automation Command Center | Browser Automation API |
| 41 | Data Analysis | ivangdavila | Productivity & Workspace | 84.68 | Workspace Command Center | Workspace API |
| 42 | Spotify Player | steipete | Search & Research | 84.67 | Research Command Center | Search API |
| 43 | Session-logs | guogang1024 | Search & Research | 84.62 | Research Command Center | Search API |
| 44 | Caldav Calendar | asleep123 | Productivity & Workspace | 84.51 | Workspace Command Center | Workspace API |
| 45 | Discord | steipete | Social & Growth | 84.4 | Social Growth Command Center | Social API |
| 46 | Apple Notes | steipete | Productivity & Workspace | 84.38 | Workspace Command Center | Workspace API |
| 47 | Xiaohongshu (小红书) Automation | borye | Social & Growth | 84.19 | Browser Automation Command Center | Social API |
| 48 | Browser Automation | peytoncasper | Browser & Automation | 84.12 | Browser Automation Command Center | Browser Automation API |
| 49 | Stock Watcher | robin797860 | Finance & Market Data | 83.99 | Market Data Command Center | Market Data API |
| 50 | Gmail | byungkyu | Productivity & Workspace | 83.68 | Workspace Command Center | Workspace API |
| 51 | Filesystem Management | gtrusler | Search & Research | 83.42 | Research Command Center | Search API |
| 52 | Tavily AI Search | bert-builder | Search & Research | 82.96 | Multi-Source Search Command Center | Search API |
| 53 | Stock Market Pro | kys42 | Finance & Market Data | 82.87 | Market Data Command Center | Market Data API |
| 54 | Find Skills Skill | fangkelvin | Media Generation | 82.75 | Media Generation Command Center | Media Generation API |
| 55 | AgentMail | adboio | Productivity & Workspace | 82.72 | Workspace Command Center | Workspace API |
| 56 | 1password | steipete | Office Documents | 82.35 | Document Office Command Center | Document Office API |
| 57 | description: 将用户讲稿一键生成乔布斯风极简科技感竖屏HTML演示稿。当用户需要生成PPT、演示文稿、Slides、幻灯片，或要求科技风/极简风/乔布斯风格的演示时触发此技能。输出为单个可直接运行的HTML文件。 | wwlyzzyorg | Office Documents | 82.35 | Document Office Command Center | Document Office API |
| 58 | Exa Web Search (Free) | whiteknight07 | Search & Research | 82.29 | Multi-Source Search Command Center | Search API |
| 59 | Pdf | awspace | Office Documents | 82.22 | Document Office Command Center | Document Office API |
| 60 | Answer Overflow | rhyssullivan | Developer | 82.17 | Developer Command Center | Developer Platform API |
| 61 | Web Search | billyutw | Search & Research | 82.04 | Multi-Source Search Command Center | Search API |
| 62 | Polymarket | joelchance | Finance & Market Data | 81.78 | Market Data Command Center | Market Data API |
| 63 | Goplaces | steipete | Search & Research | 81.62 | Research Command Center | Search API |
| 64 | Playwright Scraper Skill | waisimon | Browser & Automation | 81.24 | Browser Automation Command Center | Browser Automation API |
| 65 | Web Search Plus | robbyczgw-cla | Search & Research | 80.96 | Multi-Source Search Command Center | Search API |
| 66 | Performs web searches using DuckDuckGo to retrieve real-time information from the internet. Use when the user needs to search for current events, documentation, tutorials, or any information that requires web search capabilities. | 10e9928a | Search & Research | 80.58 | Multi-Source Search Command Center | Search API |
| 67 | Opencode-controller | karatla | Developer | 80.38 | Developer Command Center | Developer Platform API |
| 68 | Marketing Mode | thesethrose | Finance & Market Data | 80.28 | Market Data Command Center | Market Data API |
| 69 | DuckDuckGo Web Search | jakelin | Search & Research | 80.17 | Multi-Source Search Command Center | Search API |
| 70 | Academic Deep Research | kesslerio | Search & Research | 79.79 | Multi-Source Search Command Center | Search API |
| 71 | Baidu Wenku AIPPT | ide-rea | Office Documents | 79.72 | Document Office Command Center | Document Office API |
| 72 | Git Essentials | arnarsson | Developer | 79.54 | Developer Command Center | Developer Platform API |
| 73 | Code | ivangdavila | Developer | 79.25 | Developer Command Center | Developer Platform API |
| 74 | Prismfy Web Search | uroboros1205 | Search & Research | 78.96 | Multi-Source Search Command Center | Search API |
| 75 | Humanizer | brandonwise | Media Generation | 78.83 | Media Generation Command Center | Media Generation API |
| 76 | Web Search by Exa | theishangoswami | Search & Research | 78.58 | Multi-Source Search Command Center | Search API |
| 77 | Baidu AI Map（百度地图官方AI SKills） | lbs-bmap | Search & Research | 78.5 | Research Command Center | Search API |
| 78 | YouTube | byungkyu | Video & Creator Research | 78.0 | YouTube SERP Scout | Video Research API |
| 79 | Intelligent Stocks Screener | financial-ai-analyst | Finance & Market Data | 77.91 | Market Data Command Center | Market Data API |
| 80 | Market Research | ivangdavila | Finance & Market Data | 77.78 | Market Data Command Center | Market Data API |
| 81 | Shop | shopify | Search & Research | 77.75 | Research Command Center | Search API |
| 82 | Openai Image Gen | steipete | Media Generation | 77.54 | Image & Video Command Center | Media Generation API |
| 83 | Gifgrep | steipete | Productivity & Workspace | 77.47 | Workspace Command Center | Workspace API |
| 84 | Firecrawl Search | ashwingupy | Search & Research | 77.29 | Multi-Source Search Command Center | Search API |
| 85 | MoltGuard - Security & Antivirus & Guardrails | thomas-security | Security & Audit | 77.28 | Security Audit Command Center | Security Audit API |
| 86 | Docker Essentials | arnarsson | Media Generation | 76.83 | Media Generation Command Center | Media Generation API |
| 87 | X Search | jaaneek | Search & Research | 76.75 | Multi-Source Search Command Center | Search API |
| 88 | Frontend Design | michaelmonetized | Developer | 76.46 | Developer Command Center | Developer Platform API |
| 89 | EcomSeer | fly0pants | Finance & Market Data | 76.41 | Market Data Command Center | Market Data API |
| 90 | Oracle | steipete | Browser & Automation | 76.28 | Browser Automation Command Center | Browser Automation API |
| 91 | n8n | thomasansems | Browser & Automation | 76.2 | Browser Automation Command Center | Browser Automation API |
| 92 | Local Places | steipete | Search & Research | 76.12 | Research Command Center | Search API |
| 93 | Things Mac | steipete | Productivity & Workspace | 76.05 | Workspace Command Center | Workspace API |
| 94 | Filesystem | amaofx | Search & Research | 75.92 | Research Command Center | Search API |
| 95 | Bear Notes | steipete | Productivity & Workspace | 75.88 | Workspace Command Center | Workspace API |
| 96 | All-Market Financial Data Hub | financial-ai-analyst | Finance & Market Data | 75.87 | Market Data Command Center | Market Data API |
| 97 | Home Assistant | iahmadzain | Browser & Automation | 75.62 | Browser Automation Command Center | Browser Automation API |
| 98 | Financial Search Engine | financial-ai-analyst | Search & Research | 75.5 | Multi-Source Search Command Center | Search API |
| 99 | tushare-finance | stanleychanh | Finance & Market Data | 75.33 | Market Data Command Center | Market Data API |
| 100 | Calendar | ndcccccc | Productivity & Workspace | 75.3 | Workspace Command Center | Workspace API |

## 四、Top 20 候选的爆款改造打法

### Github | @steipete
- 热度表现：appearances 3，downloads 160565，stars 522，installs 4031。
- 适合转 AISA 的原因：开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。
- 目标标题：GitHub Command Center
- 目标 JTBD：让开发者在一条工作流里完成仓库研究、代码决策、Issue/PR 处理或开发协作。
- 改造动作：
  - 先把 skill 名字改成开发者会搜索的平台词或任务词。
  - 旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。
  - 用示例仓库和真实输出样板强化首轮成功率。

### Multi Search Engine | @gpyangyoujun
- 热度表现：appearances 3，downloads 123109，stars 572，installs 1802。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Gog | @steipete
- 热度表现：appearances 3，downloads 158561，stars 841，installs 3323。
- 适合转 AISA 的原因：团队协作与办公自动化适合做多席位和高客单价套餐。
- 目标标题：Workspace Command Center
- 目标 JTBD：让用户把日常办公动作统一收进一个可复用的 command center。
- 改造动作：
  - 以 command center 方式整合办公动作。
  - 先做个人工作流，再扩团队协作和自动化套餐。
  - 发布页要强调每天都会用到的场景。

### Tavily 搜索 | @jacky1n7
- 热度表现：appearances 3，downloads 83755，stars 218，installs 1203。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Notion | @steipete
- 热度表现：appearances 3，downloads 78020，stars 231，installs 2201。
- 适合转 AISA 的原因：团队协作与办公自动化适合做多席位和高客单价套餐。
- 目标标题：Workspace Command Center
- 目标 JTBD：让用户把日常办公动作统一收进一个可复用的 command center。
- 改造动作：
  - 以 command center 方式整合办公动作。
  - 先做个人工作流，再扩团队协作和自动化套餐。
  - 发布页要强调每天都会用到的场景。

### Baidu web search | @ide-rea
- 热度表现：appearances 3，downloads 79929，stars 204，installs 829。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Skill Vetter | @spclaudehome
- 热度表现：appearances 3，downloads 213898，stars 922，installs 4002。
- 适合转 AISA 的原因：安装决策、风险治理、企业合规都适合高价。
- 目标标题：Security Audit Command Center
- 目标 JTBD：让用户在高风险决策前快速得到可执行的安全判断。
- 改造动作：
  - 让输出直接形成通过/警告/阻断决策。
  - 先占高风险安装前入口，再扩依赖、权限、合规变体。
  - 把风险解释和证据输出成结构化模板。

### API Gateway | @byungkyu
- 热度表现：appearances 3，downloads 69901，stars 350，installs 504。
- 适合转 AISA 的原因：开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。
- 目标标题：Developer Command Center
- 目标 JTBD：让开发者在一条工作流里完成仓库研究、代码决策、Issue/PR 处理或开发协作。
- 改造动作：
  - 先把 skill 名字改成开发者会搜索的平台词或任务词。
  - 旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。
  - 用示例仓库和真实输出样板强化首轮成功率。

### Nano Pdf | @steipete
- 热度表现：appearances 3，downloads 92831，stars 222，installs 2355。
- 适合转 AISA 的原因：文档办公场景清晰，容易切成 Word/Excel/PPT/PDF 多 SKU。
- 目标标题：Document Office Command Center
- 目标 JTBD：让文档和表格操作从零散工具变成可直接调用的办公能力层。
- 改造动作：
  - 先做 Word / Excel / PPT / PDF 的独立高意图入口。
  - 再做 Office 全家桶汇总包。
  - 突出结构化输出和批量处理能力。

### Brave Search | @steipete
- 热度表现：appearances 3，downloads 51135，stars 175，installs 702。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Multi-Source Search Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Clawdbot Documentation Expert | @nicholasspisak
- 热度表现：appearances 3，downloads 36201，stars 282，installs 524。
- 适合转 AISA 的原因：高频信息入口，最适合 API 化和多变体扩张。
- 目标标题：Research Command Center
- 目标 JTBD：让用户用一个入口更快得到可决策的检索与研究结果。
- 改造动作：
  - 先把能力聚焦成一个更窄的检索任务入口。
  - 同时准备通用搜索、新闻搜索、学术搜索、本地搜索多变体。
  - 输出要直接给结论和来源，不要只返回原始结果。

### Mcporter | @steipete
- 热度表现：appearances 3，downloads 57101，stars 174，installs 1834。
- 适合转 AISA 的原因：自动化价值高，适合高阶付费和团队套餐。
- 目标标题：Browser Automation Command Center
- 目标 JTBD：让复杂网页操作变成可重复执行的自动化能力。
- 改造动作：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。

### Agent Browser | @matrixy
- 热度表现：appearances 3，downloads 92280，stars 334，installs 632。
- 适合转 AISA 的原因：自动化价值高，适合高阶付费和团队套餐。
- 目标标题：Browser Automation Command Center
- 目标 JTBD：让复杂网页操作变成可重复执行的自动化能力。
- 改造动作：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。

### Model Usage | @steipete
- 热度表现：appearances 3，downloads 32565，stars 101，installs 1468。
- 适合转 AISA 的原因：开发者工作流、高频、留存强，适合做 command center 和垂直开发工具矩阵。
- 目标标题：Developer Command Center
- 目标 JTBD：让开发者在一条工作流里完成仓库研究、代码决策、Issue/PR 处理或开发协作。
- 改造动作：
  - 先把 skill 名字改成开发者会搜索的平台词或任务词。
  - 旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。
  - 用示例仓库和真实输出样板强化首轮成功率。

### Nano Banana Pro | @steipete
- 热度表现：appearances 3，downloads 88193，stars 348，installs 1720。
- 适合转 AISA 的原因：展示强、传播强、按量收费自然。
- 目标标题：Media Generation Command Center
- 目标 JTBD：让用户用可展示、可复用的媒体生成入口快速出结果。
- 改造动作：
  - 把模型能力改写成用户目标，而不是模型名堆叠。
  - 拆出图片、视频、风格、商品图等多入口变体。
  - 通过结果展示强化传播和收藏。

### Humanizer | @biostartechnology
- 热度表现：appearances 3，downloads 92931，stars 544，installs 1259。
- 适合转 AISA 的原因：展示强、传播强、按量收费自然。
- 目标标题：Media Generation Command Center
- 目标 JTBD：让用户用可展示、可复用的媒体生成入口快速出结果。
- 改造动作：
  - 把模型能力改写成用户目标，而不是模型名堆叠。
  - 拆出图片、视频、风格、商品图等多入口变体。
  - 通过结果展示强化传播和收藏。

### Automation Workflows | @jk-0001
- 热度表现：appearances 3，downloads 66850，stars 263，installs 960。
- 适合转 AISA 的原因：自动化价值高，适合高阶付费和团队套餐。
- 目标标题：Browser Automation Command Center
- 目标 JTBD：让复杂网页操作变成可重复执行的自动化能力。
- 改造动作：
  - 先定义最清晰的自动化任务，不要笼统叫 automation。
  - 用 command center 包 + 单任务包组合发布。
  - 准备企业和高级用户场景，承接更高客单价。

### Slack | @steipete
- 热度表现：appearances 3，downloads 39515，stars 118，installs 1319。
- 适合转 AISA 的原因：团队协作与办公自动化适合做多席位和高客单价套餐。
- 目标标题：Workspace Command Center
- 目标 JTBD：让用户把日常办公动作统一收进一个可复用的 command center。
- 改造动作：
  - 以 command center 方式整合办公动作。
  - 先做个人工作流，再扩团队协作和自动化套餐。
  - 发布页要强调每天都会用到的场景。

### Skill Creator | @chindden
- 热度表现：appearances 3，downloads 72416，stars 249，installs 2190。
- 适合转 AISA 的原因：内容研究、竞品研究、选题验证都适合变成 API 和工作流 skill。
- 目标标题：Video Research Command Center
- 目标 JTBD：让创作者和研究者快速验证选题、竞品和内容趋势。
- 改造动作：
  - 把快速搜索和深度研究拆成双层入口。
  - 强调选题、竞品、趋势三类场景。
  - 准备不同国家和语言的对比样例。

### News Summary | @joargp
- 热度表现：appearances 3，downloads 37255，stars 116，installs 472。
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
