# Claw Skills Scout

一个围绕 ClawHub / Claude / Hermes / AgentSkill / AgentSkills.so 生态做“采集、分析、优化包发布、方法沉淀”的仓库。

它当前承担 4 类核心工作：

- 采集 ClawHub skills / plugins 与重点作者组合，生成可搜索的静态情报站点。
- 分析多平台 skill / plugin 的排名机制、爆款机制、作者工厂结构与 AISA 改造机会。
- 对可疑 `Suspicious` 包做 runtime-preserving 的 source-optimized 重组、验证与发布。
- 沉淀可复用的 skill / plugin 发布知识、模板、Codex 全局技能资产，并供 `agent-skills-io` 复用。

## Start Here

在开始改代码、改脚本或改文档前，建议按这个顺序读：

1. [AGENTS.md](/mnt/d/workplace/skillget/AGENTS.md)
2. [docs/PROJECT_OVERVIEW_AI.md](/mnt/d/workplace/skillget/docs/PROJECT_OVERVIEW_AI.md)
3. [docs/project-map.json](/mnt/d/workplace/skillget/docs/project-map.json)
4. [docs/AI_PROJECT_MEMORY.md](/mnt/d/workplace/skillget/docs/AI_PROJECT_MEMORY.md)
5. [package.json](/mnt/d/workplace/skillget/package.json)
6. [scripts/README.md](/mnt/d/workplace/skillget/scripts/README.md)

项目级文档不需要每次任务都整体重写。只有在目录结构、核心产物、发布流程、推荐工作流或项目阶段变化时，才更新 `README.md`、`docs/PROJECT_OVERVIEW_AI.md` 和 `docs/project-map.json`。

## 项目总览

### 1. 情报采集

- 抓取 ClawHub 的 skills / plugins 公开目录与详情页。
- 跟踪 `config/accounts.json` 里的重点账号。
- 下载重点账号技能包到 `public/downloads/clawHub/`。
- 把 catalog owner 当作 GitHub 用户名，扫描公开仓库中的 `SKILL.md` 并打包到 `public/downloads/github/`。
- 从下载归档和页面内容里识别疑似 AISA API 使用。

### 2. 市场分析

- 输出主站 AISA 分析数据：`public/data/aisa-api-analysis.json`
- 输出 ClawHub 增长、下载榜、plugin 三榜、10k+ 系统、多榜综合、老板版报告。
- 输出 Claude、Hermes、AgentSkill、AgentSkills.so 的专项报告。
- 输出跨平台爆款结构、AISA 选品与改造机会队列。
- 不在本仓库直接做爆款 skill 改造发布，而是把分析结论沉淀为全局 Codex skill 与执行 prompt，供 `agent-skills-io` 执行。
- 自动同步 Markdown 报告对应的 `.docx` 文件。

### 3. 包装与发布

- 下载 `Suspicious` 原始 zip。
- 生成只保留运行时能力的 `source-optimized` 包。
- 做静态校验、命令 smoke test、AISA live smoke test。
- 发布英文 / 中文优化包到 `public/downloads/optimized/` 与 `public/downloads/optimized-zh/`。
- 将 GitHub 技能目录转换成 ClawHub 可发布 zip。

### 4. 前端与自动化

- 用 Vite + React 构建主站与多个独立分析页。
- 发布到 GitHub Pages。
- 通过 GitHub Action 在 push / 定时 / 手动触发时自动刷新数据和页面。

## 功能与产物

| 模块 | 主要能力 | 核心输出 |
| --- | --- | --- |
| 主站采集与 AISA 分析 | ClawHub 抓取、账号下载、GitHub 技能归档、接口识别 | `public/data/catalog.json`、`public/data/aisa-api-analysis.json` |
| ClawHub 专项分析 | 增长、下载榜、plugin 三榜、10k+、多榜综合、老板版 | `public/data/clawhub-*.json`、`reports/ClawHub_*.md/.docx` |
| 跨生态分析 | Claude、Hermes、AgentSkill、AgentSkills.so、统一机会池 | `public/data/market-ecosystem-report.json`、`public/data/agentskill-report.json`、`public/data/agentskills-so-report.json` |
| Source-optimized 流水线 | 原包下载、瘦身、校验、打包、发布 | `packages/source-optimized/`、`public/downloads/optimized/` |
| 中文优化包流水线 | 中文 `SKILL.md` 替换与 zip 输出 | `packages/source-optimized-zh/`、`public/downloads/optimized-zh/` |
| 站点展示 | 主站与独立策略页展示 JSON 结果和公开报告 | `dist/` |

## 主要页面

- `index.html`
  主站，查看 catalog、接口、技能与优化包索引。
- `clawhub-growth.html`
  ClawHub 商业增长分析页。
- `clawhub-download-insights.html`
  下载榜、爆款 skill、作者工厂分析页。
- `clawhub-plugins.html`
  plugin 的 downloads / installs / stars 三榜、综合榜、信任机制、AISA 机会页。
- `clawhub-10k-system.html`
  `10k+` 技能与作者的可复制生产系统页。
- `market-intelligence.html`
  ClawHub、Claude、Hermes、AgentSkill、AgentSkills.so 的统一跨平台情报页。
- `public/reports/index.html`
  浏览器内报告总目录。

## 快速开始

```bash
npm install
npm run scrape
npm run download:clawhub-account-skills
npm run download:github-account-skills
npm run analyze:aisa
npm run analyze:full-report-suite
npm run sync:report-docx
npm run dev
```

常用完整流程：

```bash
# 主站推荐刷新链路
npm run pipeline:aisa-analysis

# GitHub Pages / 全量报告刷新链路
npm run pipeline:pages

# 定时任务/全量报告刷新链路
npm run pipeline:scheduled-analysis
```

## 推荐工作流

| 场景 | 推荐命令 | 结果 |
| --- | --- | --- |
| 只刷新 ClawHub catalog | `npm run scrape` | 更新 `public/data/catalog.json` |
| 刷新主站 AISA 数据 | `npm run pipeline:aisa-analysis` | 下载归档、重建 `aisa-api-analysis.json`、重新构建站点 |
| 按 GitHub Pages 同款方式本地预演 | `npm run pipeline:pages` | 使用与 GitHub Pages 相同的全量分析 + 构建链路 |
| 刷新全部情报与报告 | `npm run pipeline:scheduled-analysis` | 主站 + 全报告链路 + 页面构建 |
| 单独重跑某类报告 | `npm run analyze:<name>` | 只刷新对应 JSON / Markdown / Word 报告 |
| 手工改过报告 Markdown 后补 Word | `npm run sync:report-docx` | 只回填对应 `.docx` |
| 做 source-optimized 发布 | `npm run build:source-optimized` 到 `npm run publish:optimized-downloads` | 生成并发布优化包 |
| 做爆款 skill 改造与发布 | 转到 `/mnt/d/workplace/agent-skills-io`，按 `mother skill -> release layers -> audit -> publish` 执行 | 当前仓库只负责分析和方法沉淀 |

详细操作规范见：[docs/AISA_ANALYSIS_WORKFLOW.md](/mnt/d/workplace/skillget/docs/AISA_ANALYSIS_WORKFLOW.md)

## npm 脚本总览

### 基础开发

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 先确保公开数据存在、再抓取、再重建 AISA 数据、最后构建站点 |
| `npm run preview` | 预览构建结果 |
| `npm run typecheck` | 运行 TypeScript 校验 |

### 采集与下载

| 命令 | 对应脚本 | 作用 |
| --- | --- | --- |
| `npm run scrape` | `scripts/scrape-clawhub.ts` | 抓取 ClawHub catalog 与详情数据 |
| `npm run download:clawhub-account-skills` | `scripts/download-clawhub-account-skills.mjs --scrape` | 下载重点 ClawHub 账号技能包 |
| `npm run download:github-account-skills` | `scripts/download-github-account-skills.mjs` | 下载 GitHub 技能归档 |
| `npm run convert:github-to-clawhub` | `scripts/convert-github-skills-to-clawhub.mjs` | 将 GitHub skill tar 包转换为 ClawHub zip |
| `npm run download:suspicious-zips` | `scripts/download-suspicious-zips.mjs` | 下载 `Suspicious` 原始 zip |
| `npm run refresh:clawhub-owner-seeds` | `extract_all_skills_correct.py` | 刷新重点账号的渲染 seed 页面 |

### 分析与报告

| 命令 | 对应脚本 | 作用 |
| --- | --- | --- |
| `npm run analyze:aisa` | `scripts/generate-aisa-api-analysis.py` | 扫描下载归档中的 AISA 接口使用 |
| `npm run analyze:clawhub-growth` | `scripts/generate-clawhub-growth-report.py` | 构建 ClawHub 增长分析 |
| `npm run analyze:clawhub-download-insights` | `scripts/generate-clawhub-download-insights.py` | 构建下载榜与爆款作者分析 |
| `npm run analyze:clawhub-plugins` | `scripts/build-clawhub-plugin-report.mjs` | 构建 plugin 三榜、综合榜、信任与 AISA 机会分析 |
| `npm run analyze:clawhub-10k-system` | `scripts/build-clawhub-10k-system-report.py` | 构建 `10k+` 系统分析 |
| `npm run analyze:clawhub-10k-followups` | `scripts/generate-clawhub-10k-followup-assets.py` | 生成中文版 / 老板版 follow-up 资产 |
| `npm run analyze:clawhub-multi-ranking` | `scripts/build-clawhub-multi-ranking-report.py` | 合并 downloads / stars / installs 多榜综合 |
| `npm run analyze:clawhub-viral-boss` | `scripts/build-clawhub-viral-boss-report.py` | 生成老板版长报告 |
| `npm run analyze:aisa-expansion-plans` | `scripts/build-aisa-expansion-plans.py` | 生成 AISA 扩张与转化计划 |
| `npm run analyze:market-ecosystem` | `scripts/build-market-ecosystem-report.mjs` | 生成跨平台生态分析与 Claude / Hermes 报告 |
| `npm run analyze:agentskill` | `scripts/build-agentskill-report.mjs` | 生成 AgentSkill 专项分析 |
| `npm run analyze:agentskills-so` | `scripts/build-agentskills-so-report.mjs` | 生成 AgentSkills.so 专项分析 |
| `npm run analyze:full-report-suite` | `scripts/run-full-report-suite.mjs` | 串行刷新全部核心报告，并在单个 live 报告失败但已有缓存产物时继续 |
| `npm run sync:report-docx` | `scripts/sync-report-docx.py` | 补齐或刷新 Markdown 报告对应的 `.docx` |

### 包装、验证、发布

| 命令 | 对应脚本 | 作用 |
| --- | --- | --- |
| `npm run build:source-optimized` | `scripts/build-source-optimized-packages.mjs` | 生成英文优化包目录 |
| `npm run build:source-optimized-zh` | `scripts/build-source-optimized-zh.mjs` | 生成中文优化包目录 |
| `npm run package:source-optimized` | `scripts/package-source-optimized.mjs` | 打包英文优化 zip |
| `npm run package:source-optimized-zh` | `scripts/package-source-optimized-zh.mjs` | 打包中文优化 zip |
| `npm run verify:source-optimized` | `scripts/verify-source-optimized.mjs` | 跑静态校验 |
| `npm run live-test:source-optimized` | `scripts/live-test-source-optimized.mjs` | 跑 AISA live smoke test |
| `npm run publish:optimized-downloads` | `scripts/publish-optimized-downloads.mjs` | 发布优化包下载索引 |

### 流水线与部署

| 命令 | 作用 |
| --- | --- |
| `npm run pipeline:aisa-analysis` | 主站推荐的一键刷新链路 |
| `npm run pipeline:pages` | GitHub Pages 部署使用的统一全量链路，本地要复现线上结果时优先使用 |
| `npm run pipeline:scheduled-analysis` | 保留的全量刷新链路，也是 `pipeline:pages` 当前调用的底层命令 |
| `npm run deploy:server` | 调用 `deploy/deploy-server.sh` 构建站点并把 `dist/` 同步到服务器静态目录 |

## 关键参数与环境变量

大多数分析脚本没有 CLI 参数，默认直接读取仓库里的固定路径。真正需要重点记住的参数主要是下面这些：

| 脚本 / 命令 | 参数 / 环境变量 | 说明 |
| --- | --- | --- |
| `scripts/download-clawhub-account-skills.mjs` | `--force` | 即使文件已存在也重新下载 |
| `scripts/download-clawhub-account-skills.mjs` | `--skip-refresh-seeds` | 跳过 `extract_all_skills_correct.py` 渲染 seed 刷新 |
| `scripts/download-clawhub-account-skills.mjs` | `--scrape` | 下载前先运行 `scripts/scrape-clawhub.ts` |
| `scripts/download-github-account-skills.mjs` | `--owner <name>` | 只扫描指定 GitHub owner，可重复传入 |
| `scripts/download-github-account-skills.mjs` | `--force` | 即使包已存在也重新打包 |
| `scripts/download-github-account-skills.mjs` | `GITHUB_TOKEN` / `GH_TOKEN` | GitHub API 认证，提升速率限制 |
| `scripts/sync-report-docx.py` | `[paths...]` | 只同步指定 Markdown 文件；省略时默认扫 `reports/` 和 `public/reports/` |
| `scripts/sync-report-docx.py` | `--force` | 即使 `.docx` 看起来是最新也强制重写 |
| `scripts/live-test-source-optimized.mjs` | `AISA_API_KEY` | 运行 live smoke test 必需 |

配置文件入口：

- `config/accounts.json`
  重点跟踪作者列表。
- `config/manual-seeds.json`
  手动补充的 catalog / 详情种子。

更完整的脚本说明、输入输出和参数备注见：[scripts/README.md](/mnt/d/workplace/skillget/scripts/README.md)

## 本地账号与密钥

- 示例模板：`example/accounts`
- 本地私有文件：`docs/accounts`
- `docs/accounts` 已在 `.gitignore` 中，适合放本机账号、密码、token、Python 路径等私有信息
- 新机器初始化时，先参考 `example/accounts` 填好本地 `docs/accounts`，不要把真实值回写到示例文件或其他已跟踪文档
- 对支持环境变量的脚本，仍优先使用环境变量注入密钥，例如 `AISA_API_KEY`、`GITHUB_TOKEN`、`GH_TOKEN`

## 文档地图

- [docs/PROJECT_MANUAL.md](/mnt/d/workplace/skillget/docs/PROJECT_MANUAL.md)
  人类阅读版项目手册，适合快速理解功能、页面、数据和操作入口。
- [scripts/README.md](/mnt/d/workplace/skillget/scripts/README.md)
  脚本与参数总表，适合查某个脚本该怎么跑、读写什么路径、有没有参数。
- [reports/README.md](/mnt/d/workplace/skillget/reports/README.md)
  仓库内报告索引。
- [public/reports/index.html](/mnt/d/workplace/skillget/public/reports/index.html)
  浏览器内报告总目录。
- [docs/AGENT_SKILLS_IO_BREAKOUT_PROMPT.md](/mnt/d/workplace/skillGet/docs/AGENT_SKILLS_IO_BREAKOUT_PROMPT.md)
  在 `agent-skills-io` 中执行爆款 skill 改造与发布的可复制 prompt。
- [docs/PROJECT_OVERVIEW_AI.md](/mnt/d/workplace/skillget/docs/PROJECT_OVERVIEW_AI.md)
  AI handoff 总览。
- [docs/AI_PROJECT_MEMORY.md](/mnt/d/workplace/skillget/docs/AI_PROJECT_MEMORY.md)
  最近完成事项、当前能力与下一步建议。

## 自动化与部署

- GitHub Action 位于 `.github/workflows/deploy.yml`
- `push master`、`schedule` 与 `workflow_dispatch` 都会跑 `npm run pipeline:pages`
- `npm run pipeline:pages` 当前等价于 `npm run pipeline:scheduled-analysis`
- 如果要在本地尽量复现 GitHub Pages 的生成结果，优先跑 `npm run pipeline:pages`
- 服务器端脚本在 `deploy/deploy-server.sh`
- 服务器部署时建议显式传 `DEPLOY_WEB_ROOT=/var/www/flyingeye.cn/ClawSkillsScout`
- 部署说明见 [docs/DEPLOYMENT.md](/mnt/d/workplace/skillget/docs/DEPLOYMENT.md)

## 备注

- AISA 检测是启发式识别，不是权威判定。
- 第三方站点字段可能存在延迟渲染、SSR 残缺或临时不可用。
- 部分 source-optimized 真机授权与写入测试仍需要人工确认。
- 当前仓库是活跃工作区，可能存在与当前任务无关的未提交改动。
