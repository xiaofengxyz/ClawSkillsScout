# AISA API Skills 爆款改造执行与发布计划

- 计划日期：2026-04-20
- 当前阶段：第一轮包装升级已完成，进入发布与真实验收阶段
- 旗舰 skill：`aisa-twitter-api`

## 1. 这轮已经完成的事

- 已完成仓库内 7 个 AISA runtime 包的 SKILL 改造，英文包与中文包都统一到了 `metadata.aisa`、`compatibility` 和 `{baseDir}` 规范。
- 已把改造后的 SKILL 文案同步回 `templates/source-optimized/` 与 `templates/source-optimized-zh/`，避免下次重建时被旧模板覆盖。
- 已把 `verify-source-optimized.mjs` 补强为会检查 `metadata.aisa`、`compatibility` 和 `${SKILL_ROOT}` 违规。
- 已生成多榜单分析产物：
  - `public/data/clawhub-multi-ranking-report.json`
  - `public/reports/ClawHub_Multi_Ranking_Report_ZH.md`
  - `public/reports/ClawHub_Multi_Ranking_Report_ZH.docx`

## 2. 先打哪个，为什么

先打 `aisa-twitter-api`，不要平均发力。

原因只有四个，但足够决定顺序：

1. 它在本地 AISA 包里安装转化最高，说明用户不只是下载，还愿意保留。
2. 它覆盖搜索、监控、发帖三个高频任务，天然适合做旗舰入口。
3. 它和 AISA 品牌绑定最强，最适合做“官方代表作”。
4. 同一底层 runtime 已经能拆出多个变体，不需要从零补能力。

## 3. 7 个 skill 的角色分工

| skill | 新定位 | 在组合里的角色 |
| --- | --- | --- |
| `aisa-twitter-api` | Twitter API Command Center | 官方旗舰入口，吃安装和品牌心智 |
| `openclaw-twitter` | X/Twitter Command Center | 面向 operator / growth 的高流量英文变体 |
| `openclaw-twitter-post-engage` | Twitter Growth Operator | 面向互动、增长、follow-up 的窄场景包 |
| `openclaw-aisa-twitter` | X/Twitter Growth Operator | 面向轻量搜索 + 互动的副入口 |
| `x-intelligence-automation` | X Intelligence Automation | 面向高阶用户、情报分析和自动化心智 |
| `openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking` | YouTube SERP Scout | YouTube 研究 / 竞品 / 选题旗舰包 |
| `openclaw-aisa-youtube` | YouTube Search API | 轻量、快速、低门槛的 YouTube 搜索入口 |

## 4. 发布顺序

不要 7 个一起发。建议分 3 波，在 2026-04-20 到 2026-05-10 完成。

### Wave 1：2026-04-20 到 2026-04-26

- 主推：`aisa-twitter-api`
- 同步镜像：`aisa-twitter-api-zh`
- 目标：先把 AISA 官方旗舰包打出去，拿到第一轮安装与评论反馈。

本周动作：

- 完成发布页标题、副标题、首屏示例 prompt。
- 用真实测试账号跑一轮 OAuth 授权和发帖验收。
- 准备 3 个真实样例：
  - 搜索某个热点关键词
  - 研究某个账号
  - 授权后发一条测试帖

### Wave 2：2026-04-27 到 2026-05-03

- 主推：`openclaw-twitter`、`openclaw-twitter-post-engage`、`openclaw-aisa-twitter`
- 目标：把 Twitter 家族从“一个包”扩成“一个矩阵”。

本周动作：

- 按角色拆文案，不要互相抢词。
- `openclaw-twitter` 主打 command center。
- `openclaw-twitter-post-engage` 主打 engage / growth / action。
- `openclaw-aisa-twitter` 主打轻量运营入口。

### Wave 3：2026-05-04 到 2026-05-10

- 主推：`openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking`、`openclaw-aisa-youtube`
- 补推：`x-intelligence-automation`
- 目标：建立第二个 API 家族样板，证明这不是单点成功。

本周动作：

- YouTube 双包分层：
  - `YouTube SERP Scout` 负责研究、竞品、趋势
  - `YouTube Search API` 负责快速、轻量、低门槛
- `x-intelligence-automation` 不和旗舰抢入口，主打高阶分析与自动化。

## 5. 每个 skill 上线前必须补齐的 6 件事

1. 标题必须是用户会搜的词，而不是内部命名。
2. 描述里必须有 `Use when:` 触发语句。
3. `High-Intent Workflows` 和 `Example Requests` 必须存在。
4. 必须至少准备 3 个真实输出样板，能直接贴到发布页或评论区。
5. 必须跑静态校验和 CLI smoke test。
6. 涉及 OAuth / 发帖 / 互动的包，必须跑真实账号验收。

## 6. 发布页文案策略

### `aisa-twitter-api`

- 主题词：Twitter API, X search, trend tracking, OAuth post, one key
- 卖点结构：
  - 一句话：一个 API key 完成 X/Twitter 搜索、监控与发帖
  - 第一价值：先搜，再看趋势，再发
  - 心智定位：AISA 官方 Twitter 指挥台

### YouTube 家族

- `YouTube SERP Scout` 卖“研究和选题”
- `YouTube Search API` 卖“快速和轻量”
- 这两个包不要共享同一套卖点，否则会互相吞量

## 7. 指标目标

用绝对日期看，不用“下周”“月底”这种模糊表述。

### 截止 2026-04-27

- `aisa-twitter-api` 安装数目标：30+
- `aisa-twitter-api` 收藏数目标：10+
- 至少拿到 3 条真实用户使用反馈

### 截止 2026-05-03

- Twitter 家族 4 包合计安装数目标：80+
- 旗舰包安装占比不低于 35%
- 至少识别出 2 个最有效标题词和 2 个无效标题词

### 截止 2026-05-10

- 7 个 AISA 包全部完成上线
- 至少 2 个包进入各自细分关键词的可见区
- 完成第二轮文案和示例 prompt 迭代

## 8. 当前阻塞

- `AISA_API_KEY` 未配置，导致真实 AISA 鉴权链路还不能在本地跑通。
- `GH_TOKEN` / `GITHUB_TOKEN` 未配置，因此像 `last30days` 这类 GitHub 联动链路无法做完整在线验收。

这两个阻塞不影响本轮包装、结构、报告和静态校验，但会影响“真实写入路径”最终签收。

## 9. 下一步最应该做的事

1. 给 `aisa-twitter-api` 配测试凭证，先把 OAuth 授权和发帖真实验收跑完。
2. 基于真实结果截图或输出，补 3 份发布样板。
3. 按三波节奏上线，不要再回到“所有 skill 平铺发布”的模式。
