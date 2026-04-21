# Claude AISA Report

- 生成时间：2026-04-21T12:44:52.271Z
- 数据日期：2026-04-21
- 来源：Claude Skills、Claude Marketplaces

## 一句话结论

Claude 的爆款更接近“高星仓库 + 高意图任务词 + 技能矩阵”的分发模式。真正可复制的不是某一个单品，而是围绕同一主线持续发布旗舰 skill、邻接变体和 marketplace 包，让 GitHub 信任、安装量、类目聚焦和命名策略相互放大。

## 爆款共同点

- 标题直接说任务、平台、系统或工作流，而不是抽象概念。
- 描述都在强调什么时候用、直接能产出什么。
- 高安装作者往往不是只做一个 skill，而是沿着一个主线连续扩张。
- GitHub repo、stars、安装量、结构完整度都会影响转化。
- 最适合 AISA 的，依然是外部 API 边界清晰、付费价值高、可复用性强的能力层。

## Claude Skills Top-200 合并观察

| 排名 | Skill | Owner | 类目 | 安装 | Stars | AISA机会分 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | find-skills | vercel-labs | General Utility | 1100000 | 14200 | - |
| 2 | vercel-react-best-practices | vercel-labs | Developer | 320400 | 25200 | - |
| 3 | frontend-design | anthropics | General Utility | 299900 | 118100 | - |
| 4 | remotion-best-practices | remotion-dev | Developer | 243300 | 2800 | - |
| 5 | agent-browser | vercel-labs | Browser & Automation | 186700 | 29300 | - |
| 6 | microsoft-foundry | microsoft | General Utility | 182700 | 633 | - |
| 7 | soultrace | soultrace-ai | General Utility | 129000 | 3 | - |
| 8 | ui-ux-pro-max | nextlevelbuilder | Developer | 118000 | 65700 | - |
| 9 | brainstorming | obra | Agentic Systems | 106400 | 154200 | - |
| 10 | azure-ai | microsoft | General Utility | 103700 | 160 | - |
| 11 | ai-image-generation | inferen-sh | Media Generation | 99700 | 173 | - |
| 12 | supabase-postgres-best-practices | supabase | Developer | 99300 | 2000 | - |
| 13 | shadcn | shadcn | General Utility | 88300 | 112400 | - |
| 14 | ai-elements | vercel | General Utility | 83500 | 1900 | - |
| 15 | seo-audit | coreyhaines31 | Security & Audit | 78700 | 21400 | - |

## Claude Marketplaces Top-200 合并观察

| 排名 | Marketplace | Owner | 类目 | Plugins | Stars |
| --- | --- | --- | --- | --- | --- |
| 1 | f/prompts.chat | f | Developer | 1 | 157647 |
| 2 | affaan-m/everything-claude-code | affaan-m | Security & Audit | 1 | 141890 |
| 3 | obra/superpowers | obra | Agentic Systems | 1 | 136990 |
| 4 | anthropics/skills | anthropics | Agentic Systems | 3 | 111395 |
| 5 | anthropics/claude-code | anthropics | Agentic Systems | 13 | 109692 |
| 6 | nextlevelbuilder/ui-ux-pro-max-skill | nextlevelbuilder | Developer | 1 | 59592 |
| 7 | upstash/context7 | upstash | General Utility | 1 | 51767 |
| 8 | ComposioHQ/awesome-claude-skills | ComposioHQ | Browser & Automation | 107 | 51515 |
| 9 | gsd-build/get-shit-done | gsd-build | Productivity & Workspace | 1 | 48255 |
| 10 | thedotmack/claude-mem | thedotmack | Agentic Systems | 1 | 45739 |
| 11 | payloadcms/payload | payloadcms | General Utility | 1 | 41629 |
| 12 | ChromeDevTools/chrome-devtools-mcp | ChromeDevTools | Browser & Automation | 1 | 33365 |

## Claude 高产作者画像

| 排名 | Owner | 技能数 | Repo数 | 总安装 | 总Stars |
| --- | --- | --- | --- | --- | --- |
| 1 | microsoft | 63 | 6 | 6188243 | 1608881 |
| 2 | vercel-labs | 23 | 9 | 2320946 | 404650 |
| 3 | github | 271 | 2 | 1861304 | 8073245 |
| 4 | inferen-sh | 78 | 1 | 1676500 | 13494 |
| 5 | coreyhaines31 | 35 | 1 | 1311500 | 749000 |
| 6 | pbakaus | 23 | 1 | 1230600 | 446200 |
| 7 | larksuite | 23 | 1 | 1202200 | 181700 |
| 8 | anthropics | 134 | 6 | 1171215 | 3587298 |
| 9 | googleworkspace | 113 | 1 | 999892 | 2802400 |
| 10 | wshobson | 148 | 1 | 960255 | 4987600 |

## 爆款方法论什么能复制，什么不能复制

能复制：

- 任务词命名
- 旗舰包 + 窄变体包
- 以 GitHub/source trust 为冷启动证明
- 按作者主线持续扩 SKU

不容易直接复制：

- 仅靠某个明星仓库历史 stars 获得的先发优势
- 强平台绑定、强本地环境绑定的运行时
- 需要大量隐性运营资源才能持续维护的重度工作流

## 高产作者通常怎么做

- 先占一个主线，例如开发者、研究、办公、自动化、文档。
- 再围绕这个主线连续发相邻技能，而不是随机换赛道。
- 让所有技能共享同一套信任信号：repo、结构、命名、文档风格、结果示例。

## AISA API 怎么在 Claude 做爆款

1. 先做高频、高价值、边界清晰的能力，例如 Research、Developer、Security、Workspace、Documents。
2. 先发一个旗舰 command center，再拆 2 到 4 个高意图 SKU。
3. 用 GitHub 证明和真实输出样例降低冷启动阻力。
4. 先把 repo、readme、真实 demo 做扎实，再扩大矩阵。

## 选品计划

- 第一梯队：Developer、Search & Research、Security、Productivity & Workspace、Office Documents。
- 第二梯队：Browser & Automation、Finance & Market Data、Social & Growth。
- 第三梯队：Media Generation、Weather & Utility、Agentic Systems。

## Claude Top 机会

| 排名 | 板块 | 名称 | 类目 | 机会分 |
| --- | --- | --- | --- | --- |
| 1 | Claude Marketplaces | orchestra-research-ai-research-skills | Search & Research | 96.8 |
| 2 | Claude Marketplaces | f-prompts.chat | Developer | 96.5 |
| 3 | Claude Marketplaces | nextlevelbuilder-ui-ux-pro-max-skill | Developer | 96.5 |
| 4 | Claude Marketplaces | yamadashy-repomix | Developer | 96.5 |
| 5 | Claude Marketplaces | dailydotdev-daily | Developer | 96.5 |
| 6 | Claude Marketplaces | anthropics-knowledge-work-plugins | Developer | 96.5 |
| 7 | Claude Marketplaces | backnotprop-plannotator | Developer | 96.5 |
| 8 | Claude Marketplaces | jasonxudeveloper-jengine | Developer | 96.5 |
| 9 | Claude Skills | lark-wiki | Search & Research | 96.1 |
| 10 | Claude Skills | firecrawl | Search & Research | 96.1 |
| 11 | Claude Skills | paper-context-resolver | Search & Research | 96.1 |
| 12 | Claude Skills | firecrawl-scrape | Search & Research | 96.1 |


