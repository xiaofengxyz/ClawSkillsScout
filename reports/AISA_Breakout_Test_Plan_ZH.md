# AISA Breakout Test Plan

- 生成时间：2026-04-24
- 范围：双路线爆款测试
- 依据：`reports/Hermes_AISA_Report_ZH.md`、`public/data/aisa-all-skills-breakout-plan.json`、`public/data/clawhub-top200-aisa-conversion-plan.json`
- 发布方法：参考 `/mnt/d/workplace/agent-skills-io` 的 `optimize -> package -> audit -> release` 顺序

## 一句话结论

首轮不要铺太多。最合适的是 `6 个主测 skill + 2 个备用 skill`：一条线从现有 AISA skill 里挑 `3 主测 + 1 备用`，另一条线从线上高排名、适合转 AISA 的 skill 里挑 `3 主测 + 1 备用`。这样既能覆盖高需求主赛道，也不会把发布、验证、文案和数据回收摊得太散。

## 方向一：从现有 AISA skill 里选

### 主测 3 个

| 优先级 | Skill | 理由 | 角色 |
| --- | --- | --- | --- |
| P0 | Web Search by Tavily | 当前现有 AISA 队列里机会分最高，且直接对齐 ClawHub 热门的 `Multi Search Engine / Tavily / Brave Search / News Summary` 需求面 | 旗舰 |
| P0 | AIsa Twitter API (Search + Post) | 社交流量、研究、发帖、互动可拆成矩阵，且仓库与 `agent-skills-io` 已有较成熟发布资产 | 旗舰 |
| P1 | Query real-time and historical financial data across equities and crypto prices | 付费价值高，适合测试“高意图专业数据”赛道，不和搜索线内耗 | 增长变体 |

### 备用 1 个

| Skill | 理由 |
| --- | --- |
| YouTube SERP Scout for agents | 内容研究赛道更利于做案例演示，但当前优先级略低于金融数据，先作为备用位 |

## 方向二：从线上高排名 skill 里选，再转成 AISA API skill

### 主测 3 个

| 优先级 | 线上 Skill | 当前指标 | 计划转化方向 | 理由 |
| --- | --- | --- | --- | --- |
| P0 | Github | `160565 downloads / 522 stars / 4031 installs` | GitHub Command Center | 当前综合机会分最高，开发者赛道强、复用率高、能衍生 repo research / PR review / issue triage 矩阵 |
| P0 | Multi Search Engine | `123109 downloads / 572 stars / 1802 installs` | Multi-Source Search Command Center | 与现有 AISA 搜索能力强共振，最适合做“同赛道正面对照测试” |
| P0 | Nano Pdf | `92831 downloads / 222 stars / 2355 installs` | Document Office Command Center | 文档处理需求稳定，标题和 JTBD 清晰，适合快速打出一个高转化窄入口 |

### 备用 1 个

| 线上 Skill | 当前指标 | 计划转化方向 | 理由 |
| --- | --- | --- | --- |
| Skill Vetter | `213898 downloads / 922 stars / 4002 installs` | Security Audit Command Center | 热度极高，但安全审计类文案、证据模板和信任包装要求更高，放在第二批更稳 |

## 为什么是这 6 个主测

1. 赛道分布够开：搜索、社交、金融、开发者、文档 五条线不会互相打架。
2. 同时保留“现有能力验证”和“新赛道转化验证”两种实验类型。
3. 能直接复用 `/mnt/d/workplace/agent-skills-io/targetSkills/` 里的现成资产与发布脚本，减少从零造轮子。
4. Hermes 报告里的高适配赛道是 `GitHub / Research / Documents / Workspace / Automation`，这次主测已经覆盖其中三条核心主线。

## 执行表

| 阶段 | 动作 | 目标产物 |
| --- | --- | --- |
| 第 1 步 | 修正服务器部署，让线上真正发布 `dist/` | `clawhub-plugins.html` 恢复可打开 |
| 第 2 步 | 先做方向一的 3 个现有 AISA skill 文案与发布层对齐 | 每个 skill 的标题、描述、Use when、示例请求统一 |
| 第 3 步 | 用 `agent-skills-io` 的母 skill 思路给方向二产出 3 个新 AISA 母 skill 草案 | `GitHub / Multi-Source Search / Document Office` 三个母 skill 目录 |
| 第 4 步 | 对 6 个主测 skill 依次走 `optimize -> package -> audit` | 6 组可发布 release 产物 |
| 第 5 步 | 优先发布 2 个旗舰：`Web Search by Tavily` 与 `GitHub Command Center` | 第一批线上测试样本 |
| 第 6 步 | 第二批发布剩余 4 个主测 skill | 双路线并行验证结果 |
| 第 7 步 | 观察安装、收藏、转化、复用请求，再决定是否启用两个备用位 | 第二轮扩张计划 |

## 复用 `agent-skills-io` 的方式

### 1. Optimizer

- 用 `/mnt/d/workplace/agent-skills-io/targets/platform-skill-plugin-methodology.md` 的规则重写 `name / description / metadata.aisa / Use when`
- 先稳定母 skill 叙事，再生成发布层

### 2. Packager

- 参考 `targetSkills/aisa-multi-search-engine`
- 参考 `targetSkills/aisa-twitter-command-center`
- 参考 `targetSkills/market`
- 新增的 GitHub / Document Office 走同样的母 skill 到发布层流程，不直接手工堆发布目录

### 3. Auditor

- 发布前检查 runtime-only 文件集
- 检查 README、`SKILL.md`、示例命令是否一致
- 检查是否残留开发调试文件、无关依赖和高风险默认行为

## 立即执行顺序

1. 先修复服务器部署链路，保证 `https://flyingeye.cn/ClawSkillsScout/clawhub-plugins.html` 指向构建后的静态文件。
2. 先从方向一启动 `Web Search by Tavily` 和 `AIsa Twitter API (Search + Post)`，因为这两条已有资产最完整。
3. 同时起草方向二里的 `GitHub Command Center` 和 `Document Office Command Center`，把它们做成第二批。
4. 金融数据与 `Nano Pdf` 作为同批补位，YouTube 与 `Skill Vetter` 作为备用。
