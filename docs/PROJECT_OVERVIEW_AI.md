# Project Overview For AI

机器可读索引见：[docs/project-map.json](/mnt/d/workplace/skillGet/docs/project-map.json)

## 操作规则

开始任务前先读：

1. [AGENTS.md](/mnt/d/workplace/skillGet/AGENTS.md)
2. [README.md](/mnt/d/workplace/skillGet/README.md)
3. [docs/project-map.json](/mnt/d/workplace/skillGet/docs/project-map.json)

结束任务时不需要每次都回写全部项目文档。只有在以下情况发生时，才更新 `README.md`、本文件或 `docs/project-map.json`：

- 新增或删除目录
- 新增或删除核心产物
- 发布流程变化
- 正式仓库或分支变化
- 推荐工作流变化
- 项目阶段变化

如果需要更新，只改受影响的最小部分，不重写全部文档。

与 AISA 接口分析相关的标准流程和验收规范见：

- [docs/AISA_ANALYSIS_WORKFLOW.md](/mnt/d/workplace/skillGet/docs/AISA_ANALYSIS_WORKFLOW.md)

## 1. 项目一句话说明

这是一个围绕 ClawHub 生态做“采集、识别、筛选、优化、发布”的仓库，核心目标有两条：

1. 抓取 ClawHub 上的 skills/plugins，识别哪些项目疑似使用 AISA API，并生成一个可搜索的静态情报站点。
2. 针对被 ClawHub 标记为 `Suspicious`、但功能上仍值得保留的技能包，做“尽量不改运行时能力”的瘦身优化、验证和再打包，产出可重新分发的 release bundle。

仓库里另外还放了一个相对独立的技能样例 `sucess/last30days`，它不是主站抓取逻辑的一部分，但体现了作者正在沉淀“可发布到 ClawHub / 可供 AI 调用的技能包”能力。

## 2. 这个项目能做什么

### 2.1 ClawHub 情报采集

- 扫描 `config/accounts.json` 中的重点账号。
- 读取公开 catalog 页面，补充发现 skills 和 plugins。
- 抓取单个项目页面并提取：
  - 名称、描述、版本
  - owner、ClawHub 链接、下载链接
  - 下载量、星标数
  - 是否 suspicious
  - suspicious 原因摘要
  - 是否疑似使用 AISA API
  - README 片段
  - 针对 SKILL.md 的优化建议

### 2.2 生成静态目录站

- 产出 `public/data/catalog.json`
- 产出 `public/data/aisa-api-analysis.json`
- 前端读取 `catalog.json` 和 `optimized-packages.json`
- 前端也读取 `aisa-api-analysis.json`，展示“接口列表 / 技能列表 / ClawHub 目录”三视图
- 另有独立的 ClawHub 增长分析页，读取 `public/data/clawhub-growth-report.json` 输出 4 份商业分析文档
- 另有独立的 ClawHub 下载榜爆款分析页，读取 `public/data/clawhub-download-insights.json` 输出技能/作者/skill factory/AIsa 变现分析
- 另有独立的 ClawHub 10k+ 系统分析页，读取 `public/data/clawhub-10k-system-report.json` 输出“可复制生产系统 + AIsa API 盈利系统”报告，并同步生成 Word 文档
- 另有 10k+ 报告的后处理脚本，会输出中文版系统报告、老板版 EN/ZH 简报，以及公开下载的 Word/Markdown 文档
- 用 Vite + React 构建静态页面
- 发布到 GitHub Pages 或服务器目录

### 2.3 对 Suspicious 包做“source-optimized”再包装

- 下载原始 zip 到 `artifacts/original-zips/`
- 解包后的原始目录放到 `artifacts/original-unpacked/`
- 从原包里只保留运行所需文件
- 用 `templates/source-optimized/` 中的 SKILL 模板替换或覆盖说明文件
- 对生成包做静态校验、命令可执行性校验、Python 编译校验
- 再打包成 zip，发布到 `public/downloads/optimized/`
- 同时生成中文版本 `source-optimized-zh`

### 2.4 作为技能仓库原型

- `packages/`、`templates/`、`sucess/last30days/` 说明这个仓库不只是“站点项目”，也是一个技能包整理和发布实验场。
- `last30days` 展示了一个完整的 AI skill 如何组织 `SKILL.md`、脚本、运行入口和发布内容。

## 3. 这个项目已经做了什么

根据当前仓库内容，已经落地的部分包括：

### 已完成的主线

- 已有可运行的 ClawHub 抓取脚本：[scripts/scrape-clawhub.ts](/mnt/d/workplace/skillGet/scripts/scrape-clawhub.ts)
- 已有按 `config/accounts.json` 下载账号下全部 skills 到 `public/downloads/clawHub/` 的脚本：[scripts/download-clawhub-account-skills.mjs](/mnt/d/workplace/skillGet/scripts/download-clawhub-account-skills.mjs)，会先尝试刷新渲染后的 owner 页面种子，下载时优先尝试中文镜像，再回退到 ClawHub 原始下载地址
- 已有按 `public/data/catalog.json` 中 owner 视作 GitHub 用户名，扫描公开仓库里的 `SKILL.md` 并打包到 `public/downloads/github/` 的脚本：[scripts/download-github-account-skills.mjs](/mnt/d/workplace/skillGet/scripts/download-github-account-skills.mjs)
- 已有把 GitHub skill tar 包转换成 ClawHub 可发布 zip 包的脚本：[scripts/convert-github-skills-to-clawhub.py](/mnt/d/workplace/skillGet/scripts/convert-github-skills-to-clawhub.py)，输出到 `public/downloads/clawHub-github/`，并生成 EN/ZH 两套 `SKILL.md`
- 已有扫描 `public/downloads/clawHub/` 与 `public/downloads/github/` 全部归档、提取 AISA 接口并生成分析数据的脚本：[scripts/generate-aisa-api-analysis.py](/mnt/d/workplace/skillGet/scripts/generate-aisa-api-analysis.py)
- 已有推荐的一键分析流水线：`npm run pipeline:aisa-analysis`
- 已有静态站前端：[src/App.tsx](/mnt/d/workplace/skillGet/src/App.tsx)
- 已有独立增长分析页入口：`clawhub-growth.html` + `src/clawhub-growth/*`
- 已有独立下载榜爆款分析页入口：`clawhub-download-insights.html` + `src/clawhub-download-insights/*`
- 已有独立 10k+ 系统分析页入口：`clawhub-10k-system.html` + `src/clawhub-10k-system/*`
- 已有 downloads / stars / installs 三榜综合分析脚本：[scripts/build-clawhub-multi-ranking-report.py](/mnt/d/workplace/skillGet/scripts/build-clawhub-multi-ranking-report.py)
- 已有老板版总报告脚本：[scripts/build-clawhub-viral-boss-report.py](/mnt/d/workplace/skillGet/scripts/build-clawhub-viral-boss-report.py)
- 已有构建结果目录：`dist/`
- 已有公开数据目录：`public/data/catalog.json`、`public/data/aisa-api-analysis.json`、`public/data/clawhub-growth-report.json`、`public/data/clawhub-download-insights.json`、`public/data/clawhub-10k-system-report.json`、`public/data/clawhub-multi-ranking-report.json`
- 已有公开报告目录：`public/reports/ClawHub_10K_System_Report*.md/.docx`、`public/reports/ClawHub_10K_Boss_Brief_*.md/.docx`、`public/reports/ClawHub_Multi_Ranking_Report_ZH.md/.docx`、`public/reports/ClawHub_Viral_Boss_Report_ZH.md/.docx`、`public/reports/AISA_Breakout_*.md`
- 已有可复用技能样板：`sucess/clawhub-hit-factory/*`
- 已有 GitHub Pages / 服务器部署说明：[docs/DEPLOYMENT.md](/mnt/d/workplace/skillGet/docs/DEPLOYMENT.md)

### 已完成的优化打包流水线

- 已有原始 suspicious zip 下载脚本：[scripts/download-suspicious-zips.mjs](/mnt/d/workplace/skillGet/scripts/download-suspicious-zips.mjs)
- 已有 source-optimized 构建脚本：[scripts/build-source-optimized-packages.mjs](/mnt/d/workplace/skillGet/scripts/build-source-optimized-packages.mjs)
- 已有静态校验脚本：[scripts/verify-source-optimized.mjs](/mnt/d/workplace/skillGet/scripts/verify-source-optimized.mjs)
- 该静态校验脚本现在还会检查 `metadata.aisa`、`compatibility` 和 `${SKILL_ROOT}` 违规，避免优化包退回旧 frontmatter 规范
- 已有 live smoke test 脚本：[scripts/live-test-source-optimized.mjs](/mnt/d/workplace/skillGet/scripts/live-test-source-optimized.mjs)
- 已有发布 optimized 下载索引脚本：[scripts/publish-optimized-downloads.mjs](/mnt/d/workplace/skillGet/scripts/publish-optimized-downloads.mjs)
- 已有中文优化包构建/打包脚本：
  - [scripts/build-source-optimized-zh.mjs](/mnt/d/workplace/skillGet/scripts/build-source-optimized-zh.mjs)
  - [scripts/package-source-optimized-zh.mjs](/mnt/d/workplace/skillGet/scripts/package-source-optimized-zh.mjs)

### 已有的优化包资产

- `packages/source-optimized/` 下已有多组 Twitter / YouTube 相关技能包
- `packages/source-optimized-zh/` 下已有对应中文版本
- `templates/source-optimized/` 和 `templates/source-optimized-zh/` 已沉淀模板化的 SKILL 文案
- `public/downloads/optimized-zh/` 已存在中文 zip 产物

### 已有的独立技能样例

- [sucess/last30days/SKILL.md](/mnt/d/workplace/skillGet/sucess/last30days/SKILL.md)
- [sucess/last30days/README.md](/mnt/d/workplace/skillGet/sucess/last30days/README.md)
- `sucess/last30days/scripts/lib/` 下已包含较完整的多源研究检索与融合逻辑

## 4. 顶层架构

可以把仓库理解成 4 个子系统。

### 子系统 A：采集与识别

职责：从 ClawHub 页面抓数据，生成标准化目录数据。

关键文件：

- [scripts/scrape-clawhub.ts](/mnt/d/workplace/skillGet/scripts/scrape-clawhub.ts)
- `config/accounts.json`
- `config/manual-seeds.json`
- `extract_all_skills_correct.py`
- 多个 csv/json 中间数据文件

输出：

- `public/data/catalog.json`
- `public/data/aisa-api-analysis.json`

### 子系统 B：展示与发布

职责：把采集结果变成可搜索站点。

关键文件：

- [src/App.tsx](/mnt/d/workplace/skillGet/src/App.tsx)
- `src/clawhub-growth/App.tsx`
- `src/clawhub-download-insights/App.tsx`
- `src/clawhub-10k-system/App.tsx`
- `scripts/generate-clawhub-10k-followup-assets.py`
- [src/types.ts](/mnt/d/workplace/skillGet/src/types.ts)
- `src/styles.css`
- `vite.config.ts`

输出：

- `dist/`

能力补充：

- 以接口为主汇总 AISA API 使用情况
- 以技能为主汇总来源、接口与同接口分组
- 在页面中同时展示 ClawHub 与 GitHub 归档技能
- 以独立页面输出 ClawHub 热门技能/作者/变现机会分析
- 以独立页面输出 ClawHub 下载榜爆款技能/作者/skill factory/AIsa 变现分析
- 以独立页面输出 ClawHub 10k+ 技能/作者的可复制生产系统与 AIsa API 盈利系统
- 以 Markdown / Word 双格式输出中文系统报告和老板版中英文简报

### 子系统 C：可疑包优化与再发布

职责：对 Suspicious 原包做“保留运行时、裁剪非运行时风险”的重组。

关键文件：

- [scripts/download-suspicious-zips.mjs](/mnt/d/workplace/skillGet/scripts/download-suspicious-zips.mjs)
- [scripts/build-source-optimized-packages.mjs](/mnt/d/workplace/skillGet/scripts/build-source-optimized-packages.mjs)
- [scripts/verify-source-optimized.mjs](/mnt/d/workplace/skillGet/scripts/verify-source-optimized.mjs)
- [scripts/live-test-source-optimized.mjs](/mnt/d/workplace/skillGet/scripts/live-test-source-optimized.mjs)
- [scripts/package-source-optimized.mjs](/mnt/d/workplace/skillGet/scripts/package-source-optimized.mjs)
- [scripts/publish-optimized-downloads.mjs](/mnt/d/workplace/skillGet/scripts/publish-optimized-downloads.mjs)
- `packages/source-optimized/`
- `templates/source-optimized/`
- `artifacts/original-zips/`
- `artifacts/original-unpacked/`
- `artifacts/optimized-release-zips/`

### 子系统 D：技能研发样板

职责：沉淀可直接发布/调用的 AI skill。

关键文件：

- [sucess/last30days/SKILL.md](/mnt/d/workplace/skillGet/sucess/last30days/SKILL.md)
- `sucess/last30days/scripts/*.py`
- `sucess/last30days/scripts/lib/*.py`

## 5. 数据流和执行流

### 5.1 主站数据流

```text
config/accounts.json + public catalog pages
  -> scripts/scrape-clawhub.ts
  -> public/data/catalog.json
  -> scripts/generate-aisa-api-analysis.py
  -> public/data/aisa-api-analysis.json
  -> src/App.tsx
  -> vite build
  -> dist/
  -> GitHub Pages / server
```

### 5.1.1 AISA 接口分析标准操作流

```text
download:clawhub-account-skills
  -> public/downloads/clawHub/
download:github-account-skills
  -> public/downloads/github/
analyze:aisa
  -> public/data/aisa-api-analysis.json
vite build
  -> dist/
```

推荐命令：

```bash
npm run pipeline:aisa-analysis
```

GitHub Pages 的 Action 也已经切到这条流水线，因此会自动刷新下载归档并重新分析数据，而不只是复用仓库里已有的旧分析结果。
同时 workflow 会把 `catalog.json`、`aisa-api-analysis.json`、下载索引和 `dist/` 上传为 artifact，便于定位失败原因。
另外还开启了并发保护和最多 3 次自动重试，用来降低源站或网络抖动带来的偶发失败。

### 5.2 优化包流水线

```text
catalog.json 中筛出的 suspicious skills
  -> download-suspicious-zips.mjs
  -> artifacts/original-zips/
  -> 手动或外部步骤解包到 artifacts/original-unpacked/
  -> build-source-optimized-packages.mjs
  -> packages/source-optimized/
  -> verify-source-optimized.mjs
  -> live-test-source-optimized.mjs
  -> package-source-optimized.mjs
  -> artifacts/optimized-release-zips/
  -> publish-optimized-downloads.mjs
  -> public/downloads/optimized/ + public/data/optimized-packages.json
```

### 5.3 中文包流水线

```text
packages/source-optimized/
  -> build-source-optimized-zh.mjs
  -> packages/source-optimized-zh/
  -> package-source-optimized-zh.mjs
  -> artifacts/optimized-release-zips-zh/
  -> public/downloads/optimized-zh/
```

### 5.4 账号技能下载流水线

```text
config/accounts.json
  -> extract_all_skills_correct.py
  -> clawhub-hash-format-urls.csv
  -> scripts/scrape-clawhub.ts
  -> public/data/catalog.json
  -> download-clawhub-account-skills.mjs
  -> 优先 https://skills.volces.com/api/v1/download?slug={slug}
  -> 失败后回退 item.downloadUrl
  -> public/downloads/clawHub/<owner>/*.zip + public/downloads/clawHub/index.json
```

### 5.5 GitHub 账号技能归档流水线

```text
public/data/catalog.json 中的 owner
  -> scripts/download-github-account-skills.mjs
  -> GitHub users/{owner}/repos
  -> 查找仓库内包含 SKILL.md 的目录
  -> 下载 repo tarball 并裁出 skill 目录
  -> public/downloads/github/<owner>/*.tar.gz + public/downloads/github/index.json
```

## 6. 目录速查

### 核心源码

- `src/`：静态站前端
- `scripts/`：采集、接口分析、构建、校验、打包、发布脚本
- `config/`：扫描账号和手工种子配置

### 数据与产物

- `public/data/`：前端消费的数据 JSON（含 catalog 与 AISA 接口分析）
- `public/downloads/`：前端提供下载的 zip
- `dist/`：Vite 构建产物
- `artifacts/`：构建中间产物、原始 zip、打包 zip、报告

### 技能包相关

- `packages/source-optimized/`：英文优化包
- `packages/source-optimized-zh/`：中文优化包
- `templates/`：模板化 SKILL 文本来源
- `sucess/last30days/`：独立技能样例

### 历史/辅助资产

- `*.csv`、`skills.json`：抓取结果、历史整理数据、辅助输入
- `extract_all_skills_correct.py`、`use_html_slugs.py`：早期或辅助处理脚本

## 7. 前端当前行为

前端并不是“展示所有 ClawHub 项目”的通用目录，而是一个有明确筛选策略的情报面板。

当前页面会：

- 读取 `catalog.json`
- 读取 `optimized-packages.json`
- 默认只展示“来自 AISA owner 的项目”
- 支持按 type、flag、owner、关键字过滤
- 在卡片里展示 suspicious 状态、AISA 标记、优化建议、原始下载链接、优化包下载链接、checklist 链接

换句话说，这个站点的目标不是通用市场浏览，而是“围绕 AISA 生态和风险包优化”的专题目录。

## 8. `scrape-clawhub.ts` 的职责拆解

这个脚本是全仓库最关键的入口之一，负责：

- 访问 ClawHub 页面并带重试
- 解析 account 页面、catalog 页面和详情页面
- 抽取 readme、下载链接、suspicious 原因、版本、下载量等字段
- 用启发式规则判断 `usesAisaApi`
- 根据 readme/suspicious 文案给出 `optimizationAdvice`
- 生成统一的 `CatalogItem` 结构
- 最终写出 `public/data/catalog.json`

它是整个项目的数据源头，后面的前端展示和优化包发布都依赖它的输出。

## 9. source-optimized 设计理念

从现有脚本可以看出，这个项目对可疑包不是简单“删掉不用”，而是尝试做一层折中：

- 保留核心 runtime 文件
- 去掉 README、`_meta.json`、缓存、日志、非必要打包痕迹
- 用新的 SKILL 模板替换说明，增强用途说明、触发条件和依赖声明
- 用静态验证和少量 live smoke test 确认“包还活着”

这说明作者的真实目标不是单纯审计，而是“把可疑包变成更容易被平台接受、也更容易被 AI 使用的运行时包”。

## 10. `last30days` 在仓库中的定位

`sucess/last30days` 更像一个独立的高级技能项目，被放进这个仓库作为：

- 可发布 skill 的参考实现
- AISA 驱动多源检索/融合能力的展示样本
- 未来可能继续打包、上架或移植的技能资产

它当前已经具备：

- 完整的 `SKILL.md`
- shell 入口脚本
- Python 主程序
- 多平台 provider/normalize/fusion/render/planner 模块

所以它不是“文档示例”，而是一个有实际运行结构的技能包。

## 11. 当前完成度判断

如果从工程成熟度看，我会这样判断：

### 已经比较成熟

- 抓取与静态站生成主线
- optimized package 的英文流水线
- 中文优化包的复制与打包
- GitHub Pages / server 部署说明
- `last30days` 技能主体代码

### 仍然偏半自动或依赖人工

- suspicious 原包解包到 `artifacts/original-unpacked/` 的环节没有在当前脚本里闭环展示
- live runtime test 依赖真实 `AISA_API_KEY`
- OAuth / 发帖 / 点赞 / 关注等写操作仍需人工验收
- `CHECKLIST.md` 在多个优化包里似乎被移除或尚未补齐，和文档中的“手工验收门禁”存在一点落差

### 存在的项目特征

- 这是一个“产品 + 工具链 + 资产仓库”混合体，不是单一 Node 项目
- 仓库里有明显的迭代痕迹，包含历史 csv、辅助脚本、已构建产物和待整理资产
- 当前工作树不是干净状态，说明项目仍在持续演进

## 12. AI 接手时最该先看的文件

如果是另一个 AI 账号接手，建议按这个顺序建立上下文：

1. [README.md](/mnt/d/workplace/skillGet/README.md)
2. [package.json](/mnt/d/workplace/skillGet/package.json)
3. [scripts/scrape-clawhub.ts](/mnt/d/workplace/skillGet/scripts/scrape-clawhub.ts)
4. [src/App.tsx](/mnt/d/workplace/skillGet/src/App.tsx)
5. [scripts/build-source-optimized-packages.mjs](/mnt/d/workplace/skillGet/scripts/build-source-optimized-packages.mjs)
6. [scripts/verify-source-optimized.mjs](/mnt/d/workplace/skillGet/scripts/verify-source-optimized.mjs)
7. [scripts/publish-optimized-downloads.mjs](/mnt/d/workplace/skillGet/scripts/publish-optimized-downloads.mjs)
8. [sucess/last30days/SKILL.md](/mnt/d/workplace/skillGet/sucess/last30days/SKILL.md)

## 13. 一句话总结给 AI

这个仓库的本质是：

> 一个面向 ClawHub 生态的技能情报与再发布工作台。前半段负责抓取并展示 AISA 相关 skills/plugins，后半段负责把可疑但有价值的技能包做运行时保真式优化、验证和再打包；同时仓库中还沉淀了可直接发布的 AI 技能样例。

## 14. 后续建议

如果后续要继续整理这个仓库，优先级最高的优化方向是：

1. 补一份“从原始 zip 到 original-unpacked”的明确自动化脚本或说明，补全 source-optimized 流水线缺口。
2. 在仓库根目录 README 中显式说明“主站系统”和“技能资产系统”是两个并行目标，减少接手误解。
3. 增加一份机器可读的架构索引，例如 `docs/project-map.json`，让 AI 可以直接消费目录职责和入口脚本。
4. 统一 `CHECKLIST.md` 的存在策略，避免文档要求与包内容不一致。
