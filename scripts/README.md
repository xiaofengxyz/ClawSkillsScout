# Scripts Reference

这份文档是仓库内脚本的总索引，回答 4 个问题：

- 哪个脚本负责哪条链路
- 推荐通过哪个 `npm` 命令触发
- 主要读写哪些目录或数据文件
- 是否有 CLI 参数、环境变量或前置依赖

## 使用约定

- 默认从仓库根目录运行。
- 优先使用 `package.json` 中的 `npm run ...` 别名，除非你就是要传额外参数。
- 大多数分析脚本没有 CLI 参数，默认读取固定仓库路径。
- 真正需要记参数的脚本主要是下载类脚本、报告 Word 同步脚本和 live smoke test 脚本。
- 私有账号与密钥模板放在 `example/accounts`，本机实际值放在 `.gitignore` 中的 `docs/accounts`。
- 当脚本行为、输入输出或参数变化时，这份文档也应该同步更新。

## 参数总表

| 脚本 | 推荐入口 | 参数 / 环境变量 | 说明 |
| --- | --- | --- | --- |
| `scripts/download-clawhub-account-skills.mjs` | `npm run download:clawhub-account-skills` | `--force` | 即使 zip 已存在也重新下载 |
| `scripts/download-clawhub-account-skills.mjs` | `npm run download:clawhub-account-skills` | `--skip-refresh-seeds` | 跳过 `extract_all_skills_correct.py` 的账号页 seed 刷新 |
| `scripts/download-clawhub-account-skills.mjs` | `npm run download:clawhub-account-skills` | `--scrape` | 下载前先执行 `scripts/scrape-clawhub.ts` |
| `scripts/download-github-account-skills.mjs` | `npm run download:github-account-skills` | `--owner <name>` | 只扫描指定 GitHub owner，可重复传参 |
| `scripts/download-github-account-skills.mjs` | `npm run download:github-account-skills` | `--force` | 即使 tar 包已存在也重新打包 |
| `scripts/download-github-account-skills.mjs` | `npm run download:github-account-skills` | `GITHUB_TOKEN` / `GH_TOKEN` | 可选，提升 GitHub API 访问额度 |
| `scripts/sync-report-docx.py` | `npm run sync:report-docx` | `[paths...]` | 指定要同步的 Markdown 报告；省略时默认扫描 `reports/` 和 `public/reports/` |
| `scripts/sync-report-docx.py` | `npm run sync:report-docx` | `--force` | 即使 `.docx` 更新时间较新也强制重写 |
| `scripts/live-test-source-optimized.mjs` | `npm run live-test:source-optimized` | `AISA_API_KEY` | 必需，用于 live smoke test |

## npm 命令到脚本的映射

| npm 命令 | 直接脚本 | 用途 |
| --- | --- | --- |
| `npm run scrape` | `scripts/scrape-clawhub.ts` | 刷新 ClawHub catalog |
| `npm run analyze:aisa` | `scripts/generate-aisa-api-analysis.py` | 重建 AISA 接口分析 |
| `npm run analyze:clawhub-growth` | `scripts/generate-clawhub-growth-report.py` | 生成 ClawHub 增长报告 |
| `npm run analyze:clawhub-download-insights` | `scripts/generate-clawhub-download-insights.py` | 生成下载榜与爆款分析 |
| `npm run analyze:clawhub-plugins` | `scripts/build-clawhub-plugin-report.mjs` | 生成 plugin 三榜与信任分析 |
| `npm run analyze:clawhub-10k-system` | `scripts/build-clawhub-10k-system-report.py` | 生成 `10k+` 系统报告 |
| `npm run analyze:clawhub-10k-followups` | `scripts/generate-clawhub-10k-followup-assets.py` | 生成后续中文版与老板版资产 |
| `npm run analyze:clawhub-multi-ranking` | `scripts/build-clawhub-multi-ranking-report.py` | 合并多榜结果 |
| `npm run analyze:clawhub-viral-boss` | `scripts/build-clawhub-viral-boss-report.py` | 生成老板版报告 |
| `npm run analyze:aisa-expansion-plans` | `scripts/build-aisa-expansion-plans.py` | 生成 AISA 扩张计划 |
| `npm run analyze:market-ecosystem` | `scripts/build-market-ecosystem-report.mjs` | 生成跨生态报告 |
| `npm run analyze:agentskill` | `scripts/build-agentskill-report.mjs` | 生成 AgentSkill 报告 |
| `npm run analyze:agentskills-so` | `scripts/build-agentskills-so-report.mjs` | 生成 AgentSkills.so 报告 |
| `npm run analyze:full-report-suite` | `scripts/run-full-report-suite.mjs` | 串行刷新全部核心报告，并在单个 live 报告失败但已有缓存产物时继续 |
| `npm run pipeline:pages` | `npm run pipeline:scheduled-analysis` | GitHub Pages 部署使用的统一全量刷新链路，本地要复现线上结果时优先使用 |
| `npm run sync:report-docx` | `scripts/sync-report-docx.py` | 同步 `.md` 到 `.docx` |
| `npm run build:source-optimized` | `scripts/build-source-optimized-packages.mjs` | 构建英文优化包目录 |
| `npm run build:source-optimized-zh` | `scripts/build-source-optimized-zh.mjs` | 构建中文优化包目录 |
| `npm run package:source-optimized` | `scripts/package-source-optimized.mjs` | 打包英文优化 zip |
| `npm run package:source-optimized-zh` | `scripts/package-source-optimized-zh.mjs` | 打包中文优化 zip |
| `npm run verify:source-optimized` | `scripts/verify-source-optimized.mjs` | 静态校验优化包 |
| `npm run live-test:source-optimized` | `scripts/live-test-source-optimized.mjs` | AISA live smoke test |
| `npm run publish:optimized-downloads` | `scripts/publish-optimized-downloads.mjs` | 发布优化包索引和 zip |
| `npm run download:suspicious-zips` | `scripts/download-suspicious-zips.mjs` | 下载原始 suspicious zip |
| `npm run download:clawhub-account-skills` | `scripts/download-clawhub-account-skills.mjs --scrape` | 下载重点作者 ClawHub 技能包 |
| `npm run download:github-account-skills` | `scripts/download-github-account-skills.mjs` | 下载 GitHub 技能归档 |
| `npm run convert:github-to-clawhub` | `scripts/convert-github-skills-to-clawhub.mjs` | 转换 GitHub 技能为 ClawHub zip |
| `npm run refresh:clawhub-owner-seeds` | `extract_all_skills_correct.py` | 刷新重点账号 seed |
| `npm run deploy:server` | `deploy/deploy-server.sh` | 服务器端部署 |

## 采集与下载脚本

| 脚本 | 推荐入口 | 作用 | 主要输入 | 主要输出 | 参数 |
| --- | --- | --- | --- | --- | --- |
| `scripts/scrape-clawhub.ts` | `npm run scrape` | 抓取 ClawHub skills / plugins 目录与详情页，产出标准化 catalog | `config/accounts.json`、`config/manual-seeds.json`、ClawHub 页面 | `public/data/catalog.json` | 无 |
| `scripts/download-clawhub-account-skills.mjs` | `npm run download:clawhub-account-skills` | 下载重点账号 skill zip，支持镜像优先、原站回退 | `public/data/catalog.json`、`config/accounts.json` | `public/downloads/clawHub/`、`public/downloads/clawHub/index.json` | `--force`、`--skip-refresh-seeds`、`--scrape` |
| `scripts/download-github-account-skills.mjs` | `npm run download:github-account-skills` | 把 catalog owner 当作 GitHub 用户，扫描公开仓库中的 `SKILL.md` 并打包 | `public/data/catalog.json`、GitHub API / tarball | `public/downloads/github/`、`public/downloads/github/index.json` | `--owner <name>`、`--force`、`GITHUB_TOKEN` / `GH_TOKEN` |
| `scripts/convert-github-skills-to-clawhub.mjs` | `npm run convert:github-to-clawhub` | Node 包装器，调用 Python 转换器 | `public/downloads/github/` | `public/downloads/clawHub-github/` | 无 |
| `scripts/convert-github-skills-to-clawhub.py` | `npm run convert:github-to-clawhub` 间接调用 | 将 GitHub tar 包转成 ClawHub 可发布 zip，并重写发布元数据 | `public/downloads/github/`、模板与归档内容 | `public/downloads/clawHub-github/` | 无独立 CLI 约定 |
| `scripts/ensure-public-data.mjs` | `npm run build`、`npm run pipeline:*` 自动调用 | 确保 `public/data/optimized-packages.json` 等公开数据入口存在 | 仓库现有 `public/data/` | 缺失时补空数据文件 | 无 |

## 分析与报告脚本

| 脚本 | 推荐入口 | 作用 | 主要输入 | 主要输出 | 参数 |
| --- | --- | --- | --- | --- | --- |
| `scripts/generate-aisa-api-analysis.py` | `npm run analyze:aisa` | 扫描下载归档中的接口调用、技能来源和同接口聚合 | `public/downloads/clawHub/`、`public/downloads/github/` | `public/data/aisa-api-analysis.json` | 无 |
| `scripts/generate-clawhub-growth-report.py` | `npm run analyze:clawhub-growth` | 构建 ClawHub 商业增长与竞争格局报告 | live ClawHub 数据、repo 模板 | `public/data/clawhub-growth-report.json`、`reports/`、`public/reports/` | 无 |
| `scripts/generate-clawhub-download-insights.py` | `npm run analyze:clawhub-download-insights` | 构建下载榜、爆款 skill、作者工厂与变现机会分析 | live ClawHub 排行 | `public/data/clawhub-download-insights.json`、报告文件 | 无 |
| `scripts/build-clawhub-plugin-report.mjs` | `npm run analyze:clawhub-plugins` | 采集 plugin downloads / installs / stars 三榜、综合榜、作者工厂、信任机制与 AISA 机会 | ClawHub plugin 列表与详情页 | `public/data/clawhub-plugin-report.json`、`reports/ClawHub_Plugin_Viral_Report_*.md/.docx`、`public/reports/` | 无 |
| `scripts/build-clawhub-10k-system-report.py` | `npm run analyze:clawhub-10k-system` | 抓取 `10k+` 技能和高产作者组合，抽象可复制系统 | ClawHub 10k+ 列表与详情页 | `public/data/clawhub-10k-system-report.json`、系统报告 | 无 |
| `scripts/generate-clawhub-10k-followup-assets.py` | `npm run analyze:clawhub-10k-followups` | 将 10k 系统报告转成中文版与老板版简报 | `public/data/clawhub-10k-system-report.json`、已有报告 | `reports/`、`public/reports/` follow-up 文件 | 无 |
| `scripts/build-clawhub-multi-ranking-report.py` | `npm run analyze:clawhub-multi-ranking` | 合并 downloads / stars / installs 多榜，构造综合排名与优先级 | ClawHub 多榜数据 | `public/data/clawhub-multi-ranking-report.json`、多榜报告 | 无 |
| `scripts/build-clawhub-viral-boss-report.py` | `npm run analyze:clawhub-viral-boss` | 将多榜与市场观察整理成老板版长文档 | 多榜 JSON、已有分析结果 | 老板版 Markdown / Word 报告 | 无 |
| `scripts/build-aisa-expansion-plans.py` | `npm run analyze:aisa-expansion-plans` | 生成 AISA 当前技能扩张计划与 Top 200 转化计划 | 主站 AISA 数据、ClawHub 多榜数据 | `public/data/aisa-all-skills-breakout-plan.json`、`public/data/clawhub-top200-aisa-conversion-plan.json`、报告 | 无 |
| `scripts/build-market-ecosystem-report.mjs` | `npm run analyze:market-ecosystem` | 横向比较 ClawHub、Claude、Hermes 的爆款结构，并产出 Claude / Hermes 专项报告 | live 公开市场页、repo 模板 | `public/data/market-ecosystem-report.json`、`reports/Claude_AISA_Report_*`、`reports/Hermes_AISA_Report_*`、`public/reports/` | 无 |
| `scripts/build-agentskill-report.mjs` | `npm run analyze:agentskill` | 采集 AgentSkill 的 skill / plugin / creator / 评分 / 信任信号并生成专项报告 | AgentSkill 列表与详情页 | `public/data/agentskill-report.json`、`reports/AgentSkill_Report_*`、`public/reports/` | 无 |
| `scripts/build-agentskills-so-report.mjs` | `npm run analyze:agentskills-so` | 采集 AgentSkills.so 的下载、仓库、安全和分发信号并生成专项报告 | AgentSkills.so 列表与详情页 | `public/data/agentskills-so-report.json`、`reports/AgentSkills_SO_Report_*`、`public/reports/` | 无 |
| `scripts/parse-hermes-skill-atlas.py` | 直接运行或被分析链路复用 | 解析 Hermes skill atlas / catalog 结构 | Hermes 文档源 | 中间分析数据或报告素材 | 无 |
| `scripts/sync-report-docx.py` | `npm run sync:report-docx` | 为 Markdown 报告补齐或刷新 `.docx` 文件 | `reports/*.md`、`public/reports/*.md` 或显式路径 | 同名 `.docx` 文件 | `[paths...]`、`--force` |

## 打包、校验与发布脚本

共享辅助模块：

- `scripts/lib/source-optimized-manifest.mjs` 统一维护 source-optimized 包清单、保留文件、命令 smoke test 和 EN/ZH 模板映射，避免构建/校验/中文复制三处漂移。
- `scripts/lib/skill-frontmatter.mjs` 统一解析本仓库 source-optimized 包里的 `SKILL.md` frontmatter，供校验和发布索引脚本读取 `metadata.aisa.requires`、`primaryEnv`、`compatibility`；它会兼容历史 / 公共命名空间做读取，但不把这里的约束外推成 `agent-skills-io` 或全局 skill 的统一规范。

| 脚本 | 推荐入口 | 作用 | 主要输入 | 主要输出 | 参数 |
| --- | --- | --- | --- | --- | --- |
| `scripts/download-suspicious-zips.mjs` | `npm run download:suspicious-zips` | 根据 catalog 下载 `Suspicious` 原始 zip | `public/data/catalog.json` | `artifacts/original-zips/` | 无 |
| `scripts/build-source-optimized-packages.mjs` | `npm run build:source-optimized` | 从 `artifacts/original-unpacked/` 中提取运行时必须文件，构建英文优化包目录 | `artifacts/original-unpacked/`、`templates/source-optimized/` | `packages/source-optimized/` | 无 |
| `scripts/build-source-optimized-zh.mjs` | `npm run build:source-optimized-zh` | 从英文优化包复制并替换中文 `SKILL.md` | `packages/source-optimized/`、`templates/source-optimized-zh/` | `packages/source-optimized-zh/` | 无 |
| `scripts/package-source-optimized.mjs` | `npm run package:source-optimized` | 打包英文优化 zip 并生成制品索引 | `packages/source-optimized/` | `artifacts/optimized-release-zips/` | 无 |
| `scripts/package-source-optimized-zh.mjs` | `npm run package:source-optimized-zh` | 打包中文优化 zip 并生成制品索引 | `packages/source-optimized-zh/` | `artifacts/optimized-release-zips-zh/`、`public/downloads/optimized-zh/` | 无 |
| `scripts/verify-source-optimized.mjs` | `npm run verify:source-optimized` | 做 frontmatter、运行命令、Python 编译与结构校验 | `packages/source-optimized/` | `artifacts/source-optimized-verification.json` | 无 |
| `scripts/live-test-source-optimized.mjs` | `npm run live-test:source-optimized` | 对选定优化包做联网 smoke test | `packages/source-optimized/`、AISA API | `artifacts/live-test-source-optimized.json` | `AISA_API_KEY` |
| `scripts/publish-optimized-downloads.mjs` | `npm run publish:optimized-downloads` | 发布优化包 zip 和索引到公开下载目录 | `artifacts/optimized-release-zips/` | `public/downloads/optimized/`、`public/data/optimized-packages.json` | 无 |

## 相关辅助脚本

这些脚本不在 `scripts/` 目录里，但它们直接参与主流程，查问题时也经常需要一起看。

| 脚本 | 推荐入口 | 作用 | 参数 |
| --- | --- | --- | --- |
| `extract_all_skills_correct.py` | `npm run refresh:clawhub-owner-seeds` | 用 Playwright 渲染重点作者页，刷新 owner seed 列表 | 无 |
| `deploy/deploy-server.sh` | `npm run deploy:server` | 服务器端构建与部署辅助脚本 | 无公开 CLI 约定 |
| `.github/workflows/deploy.yml` | GitHub Actions | push / 定时 / 手动触发的自动刷新与部署工作流 | 通过 workflow 触发，不走 CLI |

## 典型执行链路

### 1. 主站刷新

```bash
npm run pipeline:aisa-analysis
```

链路：

`ensure-public-data` -> `download:clawhub-account-skills` -> `download:github-account-skills` -> `analyze:aisa` -> `vite build`

### 2. 全报告定时刷新

```bash
npm run pipeline:scheduled-analysis
```

链路：

`ensure-public-data` -> 下载链路 -> `analyze:aisa` -> `analyze:full-report-suite` -> `vite build`

### 2.1 GitHub Pages 同款刷新

```bash
npm run pipeline:pages
```

链路：

当前与 `pipeline:scheduled-analysis` 相同，但它是 GitHub Pages 部署使用的统一命令入口。

### 2.2 全报告 wrapper 容错

`npm run analyze:full-report-suite` 现在由 `scripts/run-full-report-suite.mjs` 统一调度。

规则：

- 单个 live 报告步骤成功时，正常覆盖更新产物
- 单个 live 报告步骤失败时，如果仓库里已经有该步骤的关键缓存产物，则记录 warning 并继续
- 只有当步骤失败且关键产物不存在时，才会让整条全报告链路失败

### 3. 优化包发布

```bash
npm run download:suspicious-zips
npm run build:source-optimized
npm run verify:source-optimized
npm run live-test:source-optimized
npm run package:source-optimized
npm run publish:optimized-downloads
```

## 修改脚本时的文档同步规则

- 如果新增了脚本文件，更新这份文档和 `docs/project-map.json`。
- 如果只是改了脚本实现、没有改输入输出或参数，通常不需要改项目总览文档。
- 如果改了推荐工作流、核心产物或发布链路，除了这里，还要同步 `README.md`、`docs/PROJECT_OVERVIEW_AI.md` 和 `docs/AI_PROJECT_MEMORY.md`。
