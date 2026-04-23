# AgentSkill 爆款报告

- 生成时间：2026-04-23T05:38:36.602Z
- 数据日期：2026-04-23
- 采样范围：agentskill.sh 首页技能卡片 + plugin 多页列表 + owner 展开页 + 对应详情页指标

## 一句话结论

AgentSkill 的榜单不是只看一个数字，而是“安装 / GitHub 信任 / 质量分 / 安全分 / 任务命名 / 包装完整度”一起决定点击与安装。能复制的是高频任务词、可信 repo、持续矩阵化生产；不容易复制的是历史 stars、先发品牌与重运营资产。

## 重要排名因素

| 指标 | 重要性 | 观察证据 | 为什么重要 |
| --- | --- | --- | --- |
| Installs / weekly usage | Very high | Sampled skills total 5,021,111 installs | Adoption is the clearest public trust signal on detail pages. |
| GitHub stars / repo trust | Very high | Sampled skills total 5,919,505 GitHub stars | Repo reputation reduces cold-start doubt and helps installs convert. |
| Quality score | High | Average sampled quality 87.8/100 | Quality review is surfaced directly on listing cards before click-through. |
| Security score | High | Average sampled security 89.7/100 | Security audit badges visibly change install confidence, especially for tool wrappers. |
| Rating and reviews | Medium | Average sampled rating 0.52 | Ratings appear on detail pages and reinforce trust after discovery. |
| Plugin breadth | Medium | Visible plugin sample averages 343.5 bundled skills | Large bundles dominate plugin visibility when they package many skills under one theme. |
| Naming and category clarity | Very high | Developer 106; General Utility 30; Security & Audit 24; Social & Growth 9; Productivity & Workspace 4 | Task-first titles and narrow categories make both cards and plugins easier to rank and install. |

## 排名机制

- AgentSkill 公开把安装量、GitHub Stars、Quality Score、Security Score、Rating 都放到了用户可见决策面。
- "Discovery / Implementation / Structure / Expertise" 这组质量分拆项，会直接影响“看起来像不像一个成熟 skill”。
- 高安装 skill 往往不是只靠标题，而是标题、repo 信任、评分审查、示例输出一起协同。
- Plugin 页则更像主题分发层，会放大“同主题多 skill 打包”的优势。

## 爆款机制

- 先用高意图任务词拿点击，再用 GitHub repo 和质量/安全信号拿安装。
- 作者页和 plugin 家族会放大同一作者的复利，所以旗舰 skill + 窄变体 + 同主题 plugin 比单点爆款更稳。
- 最容易重复获客的是 Developer、Research、Workspace、Documents、Security 这些高频工作面。
- 细分类目的 skill，如果能把输入、输出、真实结果写得更具体，往往更容易提升质量感知。

## 发布动作

- 标题、简介、README、SKILL.md 首段必须同时说清任务、触发条件、输入和输出。
- GitHub 仓库要能支撑 listing 上的承诺，避免“页面很强、包里很空”的落差。
- 旗舰包负责占大词，窄 skill 负责承接细分需求，plugin 负责承接合集和主题打包。
- 质量分和安全分是产品表面，发布时要像经营商品详情页一样经营它们。

## 常见失分项

- 标题太抽象，搜索词和任务词不够明确。
- README / SKILL / 示例输出不能证明它真的解决了页面承诺的问题。
- 质量评分拆项里 "Implementation" 或 "Structure" 太弱，导致看起来像“提示词片段”而不是成品。
- plugin 打包主题过大但边界不清，反而会压低信任和安装转化。
## 爆款 Skill 样本

| 排名 | Skill | Owner | 类目 | 安装 | 质量分 | 安全分 | AISA机会分 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | receiving-code-review | obra | Developer | 1 | 100 | 100 | 95 |
| 2 | longevity | openclaw | Developer | 2200 | 100 | 100 | 95 |
| 3 | research-paper-writer | openclaw | Developer | 2200 | 100 | 100 | 95 |
| 4 | manim-composer | openclaw | Developer | 2200 | 100 | 100 | 94.7 |
| 5 | video-editing | affaan-m | Developer | 78900 | 100 | 93 | 94.47 |
| 6 | casely | openclaw | Developer | 2200 | 92 | 100 | 94.04 |
| 7 | investor-materials | affaan-m | Developer | 78900 | 100 | 100 | 93.8 |
| 8 | verification-before-completion | obra | Developer | 87300 | 100 | 100 | 93.5 |
| 9 | finishing-a-development-branch | obra | Developer | 87300 | 100 | 100 | 93.5 |
| 10 | frontend-slides | affaan-m | Developer | 78900 | 100 | 100 | 93.5 |
| 11 | claude-api | affaan-m | Developer | 78900 | 100 | 99 | 93.42 |
| 12 | crosspost | affaan-m | Developer | 78900 | 100 | 99 | 93.42 |
| 13 | deep-research | affaan-m | Developer | 78900 | 100 | 95 | 93.13 |
| 14 | using-git-worktrees | obra | Developer | 87300 | 100 | 92 | 92.9 |
| 15 | writing-plans | obra | Developer | 1 | 83 | 100 | 92.81 |

## 爆款 Plugin 样本

| 排名 | Plugin | Owner | 类目 | 技能数 | GitHubStars | AISA机会分 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | everything-claude-code | haniakrim21 | Developer | 1080 | 10 | 96.25 |
| 2 | amplihack | rysweet | Developer | 389 | 18 | 96.25 |
| 3 | acc | dykyi-roman | Developer | 283 | 29 | 96.25 |
| 4 | x-cmd-git | x-cmd | Developer | 199 | 9 | 96.25 |
| 5 | scientific-skills | k-dense-ai | Developer | 145 | 8961 | 96.25 |
| 6 | alpha-engineer | rnavarych | Developer | 192 | 4 | 95.7 |
| 7 | goodvibes | mgd34msu | Developer | 173 | 3 | 95.18 |
| 8 | arxiv-paper-publication-polish | homericintelligence | Developer | 182 | 2 | 95.12 |
| 9 | gtm-skills | manojbajaj95 | Developer | 166 | 1 | 94.6 |
| 10 | scientific-skills | yezez9 | Developer | 174 | 0 | 94.49 |
| 11 | agent-skills | tyler-r-kendrick | Browser & Automation | 413 | 0 | 94.2 |
| 12 | claude-craft | thebeardedbearsas | Browser & Automation | 257 | 84 | 94.2 |

## 高产作者画像

| 排名 | Creator | 样本技能 | 样本插件 | 总安装 | 平均质量分 | 平均安全分 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | openclaw | 20 | 0 | 2510101 | 78 | 83.7 |
| 2 | affaan-m | 20 | 1 | 1499101 | 92.2 | 91.7 |
| 3 | obra | 14 | 0 | 611107 | 84.6 | 97.9 |
| 4 | google-gemini | 6 | 0 | 387202 | 30.5 | 99.8 |
| 5 | k-dense-ai | 1 | 1 | 13600 | 67 | 85 |
| 6 | a5c-ai | 20 | 1 | 0 | 92.8 | 96.3 |
| 7 | alirezarezvani | 0 | 1 | 0 | 0 | 0 |
| 8 | xu-xiang | 20 | 1 | 0 | 81.3 | 93.9 |
| 9 | dnyoussef | 0 | 1 | 0 | 0 | 0 |
| 10 | thebeardedbearsas | 1 | 1 | 0 | 42 | 100 |
| 11 | rnavarych | 20 | 1 | 0 | 88.2 | 99.8 |
| 12 | plurigrid | 20 | 1 | 0 | 100 | 93.5 |

## 爆款共同点

- Skill 名称大多直接写任务、平台、系统或工作流。
- 详情页里最有说服力的不是“功能多”，而是安装量、GitHub Stars、质量审查和安全审查一起给出的可信组合。
- 高产作者通常会围绕一条主线持续发多个 skill，而不是随机切题。
- 插件榜更偏爱“大而清晰”的合集包，但前提仍然是主题统一、描述具体、目标人群明确。

## 哪些方法能复制，哪些不能复制

能复制：

- 用高意图任务词命名
- 先做旗舰 skill，再拆窄变体
- 把 GitHub 仓库、示例输出、质量/安全信号前置
- 围绕一个主线连续生产，形成作者品牌

不容易直接复制：

- 仓库历史 stars 带来的先发红利
- 平台官方或强社区品牌的天然背书
- 需要长期维护的大型合集包运营能力

## AISA API 如何在 AgentSkill 做爆款

1. 先做 Developer、Search & Research、Workspace、Documents、Security 五条高价值主线。
2. Skill 页面一定要把任务、输入、输出和真实结果写清楚，让质量分与安全分更容易拉高。
3. 旗舰包负责占大词，窄 skill 负责承接细分搜索词。
4. 插件层优先做“统一主题 + 多 skill”而不是泛合集。

## 当前最值得改成 AISA API 的样本

- 技术研发：GitHub / Debug / Review / Issues / CI / PR 自动化
- 搜索研究：Research / Evidence / Wiki / 文档检索
- 办公协作：Feishu / Workspace / 文档处理 / 权限管理
- 安全治理：Audit / Guard / Verification / Review Scoring
- 成长与内容：X/Twitter、Marketing、SEO、GTM 自动化

