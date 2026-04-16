# AISA Analysis Workflow

这份文档定义 `public/downloads` 下 skill 归档的 AISA 接口分析流程、执行规范和验收标准。

目标：

- 把 ClawHub 与 GitHub skill 归档统一纳入分析
- 输出可搜索的“接口列表 / 技能列表 / 同接口技能分组”
- 保证 GitHub Pages 页面与 `public/data/aisa-api-analysis.json` 同步更新

## 1. 适用范围

当出现以下任一场景时，应该执行本流程：

- `public/downloads/clawHub/` 有新增或替换的 zip
- `public/downloads/github/` 有新增或替换的 tar.gz
- `scripts/generate-aisa-api-analysis.py` 的提取规则发生变化
- 前端接口表、技能表、分组视图发生变化
- README、项目概览、project-map 中涉及 AISA 分析的流程或口径发生变化

## 2. 标准执行入口

### 最小刷新

只重建分析数据，不重新下载归档：

```bash
npm run analyze:aisa
```

适用于：

- 只改了分析脚本
- 只改了页面展示
- 本地 `public/downloads/` 已经是最新

### 标准分析流水线

先刷新 ClawHub/GitHub 归档，再重建分析页面：

```bash
npm run pipeline:aisa-analysis
```

这个命令会依次执行：

1. `npm run download:clawhub-account-skills`
2. `npm run download:github-account-skills`
3. `npm run analyze:aisa`
4. `vite build`

GitHub Actions 也应该优先使用这条流水线，而不是只跑 `build`。

### 站点构建

如果只需要基于当前数据重建站点：

```bash
npm run build
```

说明：

- `build` 当前会执行 `scrape -> analyze:aisa -> vite build`
- `build` 不会主动刷新 GitHub skill 归档
- 需要完整刷新下载归档时，优先用 `pipeline:aisa-analysis`

## 2.1 GitHub Actions 行为

当前 `.github/workflows/deploy.yml` 已配置为执行：

```bash
npm run pipeline:aisa-analysis
```

这意味着 GitHub Actions 在每次触发时会：

1. 刷新 ClawHub skill 下载归档
2. 刷新 GitHub skill 归档
3. 重新生成 `public/data/aisa-api-analysis.json`
4. 构建 GitHub Pages 页面
5. 上传分析产物 artifact，便于失败排查和离线核对

结论：

- 会自己分析数据
- 也会自己刷新分析所依赖的归档
- 如果某一步因为外部网络失败，整个 workflow 可能失败
- 即使部署失败，只要 workflow 跑到上传步骤，仍可从 artifact 下载分析结果和索引

当前 CI 强化项：

- `build` job 设置了超时保护
- workflow 开启了 concurrency，避免同一分支的重复部署互相覆盖
- `pipeline:aisa-analysis` 在 CI 中会自动重试 3 次，缓解外部网络抖动
- 上传 `catalog.json`、`aisa-api-analysis.json`、下载索引和 `dist/` 作为 artifact

## 3. 输入与输出

### 输入

- `public/downloads/clawHub/index.json`
- `public/downloads/github/index.json`
- `public/downloads/clawHub/**/*.zip`
- `public/downloads/github/**/*.tar.gz`
- AISA 官方对比基线：`https://docs.aisa.one/reference/createchatcompletion`

### 主要输出

- `public/data/aisa-api-analysis.json`
- `dist/` 中新的 GitHub Pages 页面

### 页面消费关系

- `[src/App.tsx](/mnt/d/workplace/skillGet/src/App.tsx)` 读取 `aisa-api-analysis.json`
- `[src/types.ts](/mnt/d/workplace/skillGet/src/types.ts)` 定义接口/技能/分组数据结构
- 页面展示三块核心视图：
  - 接口列表
  - 技能列表
  - 同接口技能分组

## 4. 分析规则规范

### 接口识别范围

当前分析脚本重点提取以下两类 endpoint：

- OpenAI-compatible：如 `/v1/chat/completions`
- AISA 专用接口：如 `/apis/v1/twitter/*`、`/apis/v1/financial/*`、`/apis/v1/tavily/*`

### 状态判断规则

- `implemented`：在代码文件中发现接口引用
- `documented_only`：只在 `SKILL.md` 或其它文档中声明，没有发现代码实现
- `not_found`：技能归档中没有提取到 AISA endpoint

### 对比规则

所有接口都以 `createchatcompletion` 为官方基线做对比说明：

- 与 `/v1/chat/completions` 直接对应的，标记为“直接对应”
- 其它接口，标记为“该文档之外的 AISA 专用接口族”

### 结果分组规则

- 接口列表：按 endpoint 聚合
- 技能列表：按技能聚合
- 同接口技能分组：同一个 endpoint 下有多个技能实现时才成组

## 5. 执行步骤

### 步骤 1：确认下载源状态

检查这两个索引是否存在且可读：

- `public/downloads/clawHub/index.json`
- `public/downloads/github/index.json`

若缺失：

- 先执行 `npm run download:clawhub-account-skills`
- 再执行 `npm run download:github-account-skills`

### 步骤 2：生成分析数据

执行：

```bash
npm run analyze:aisa
```

期望结果：

- 成功生成 `public/data/aisa-api-analysis.json`
- JSON 中至少包含：
  - `summary`
  - `interfaces`
  - `skills`
  - `implementationGroups`

### 步骤 3：校验前端类型与构建

执行：

```bash
npm run typecheck
npx vite build
```

期望结果：

- TypeScript 无报错
- Vite 构建成功

### 步骤 4：页面抽查

至少抽查以下内容：

- 接口列表是否能搜索 endpoint / skill 名 / owner
- 技能列表是否显示来源、接口、下载入口
- 同接口技能分组是否出现多技能聚合
- GitHub 技能是否出现在技能列表中

## 6. 验收标准

一次合格的 AISA 分析更新，至少应满足：

- `public/data/aisa-api-analysis.json` 成功更新
- 页面能显示接口列表、技能列表、同接口技能分组
- GitHub skill 归档被纳入结果
- 对“无技能实现”的接口有明确标识
- README 或相关流程文档与当前命令入口一致

## 7. 异常处理规范

### 下载阶段异常

如果下载 ClawHub 或 GitHub 归档失败：

- 保留已有归档，不要清空 `public/downloads/`
- 优先记录是网络失败、源站失败还是单个 owner 失败
- 允许基于已有归档继续执行 `npm run analyze:aisa`
- CI 中会先做最多 3 次自动重试；重试后仍失败，才应视为真实失败

### 抓取阶段异常

如果 `npm run build` 中的 `scrape` 因外部网络失败：

- 可退回使用 `npx vite build` 验证纯前端改动
- 在结果说明中明确指出是抓取失败，不是页面或分析脚本失败

### 结果异常

如果某个 skill 明明使用了接口但未被识别：

1. 先确认接口是否写在代码还是只写在文档
2. 再检查 `scripts/generate-aisa-api-analysis.py` 的 endpoint 规则
3. 修复后重新执行 `npm run analyze:aisa`

## 8. 文档维护规范

当以下内容变化时，需要同步更新本文件与项目总览文档：

- 标准命令入口变化
- 页面视图结构变化
- 分析 JSON 结构变化
- 接口状态判断规则变化
- AISA 官方对比基线变化

最少需要同步检查这些文件：

- `[README.md](/mnt/d/workplace/skillGet/README.md)`
- `[docs/PROJECT_OVERVIEW_AI.md](/mnt/d/workplace/skillGet/docs/PROJECT_OVERVIEW_AI.md)`
- `[docs/project-map.json](/mnt/d/workplace/skillGet/docs/project-map.json)`

## 9. 推荐日常用法

### 开发页面时

```bash
npm run analyze:aisa
npm run dev
```

### 刷新完整分析站点时

```bash
npm run pipeline:aisa-analysis
```

### 只校验改动是否可发布时

```bash
npm run typecheck
npx vite build
```
