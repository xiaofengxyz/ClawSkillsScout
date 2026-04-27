# Hermes AISA Report

- 生成时间：2026-04-26T04:22:48.821Z
- 数据日期：2026-04-26
- 来源：Hermes Skills Guide、Hermes raw catalog

## 数据口径

- live guide 当前显示 97 个 bundled skills、28 个 categories，抓取通道为 curl。
- raw catalog 当前结构化提取 74 个 bundled rows、0 个 optional rows，共 19 个 sections，抓取通道为 curl。
- raw catalog 头部 sections：creative 13 · mlops 13 · productivity 7 · github 6 · software-development 6。

## 一句话结论

Hermes 更像“内置工作流能力目录”，而不是公开下载榜。它的爆款逻辑不是谁更会包装 GitHub，而是谁更清楚地把某个工作流边界讲明白，并且放进正确的 section 里。适合 AISA 的仍然是 GitHub、Research、Documents、Workspace、Automation 这些可抽象成 API 的高频边界。

## Hermes 爆款共同点

- 先按工作流类别被发现，再按具体 skill 被选择。
- 类别名、section 文案、技能名共同定义了用户的预期边界。
- 高适配项普遍贴近真实外部系统，而不是只停留在抽象 agent 自增强。
- Apple / macOS 类能力价值高，但平台限制强，不适合作为通用旗舰。

## Hermes 排名机制

- Hermes 更像按 section / category 发现，而不是按下载榜发现。
- 类目按钮、section 文案、技能名、路径位置一起决定技能是否会被选中。
- 用户会先判断“这是不是我当前工作流的一部分”，再判断技能本身是否值得加载。
- 因为没有公开下载榜，边界清晰度和目录放置正确性会比营销文案更重要。

## Hermes 爆款机制

- 把 skill 写成一个明确工作流单元，而不是一个抽象能力标签。
- 优先占 GitHub、Research、Documents、Workspace、Automation 这些跨平台高频工作流。
- Apple / macOS 技能适合做高价值专属 SKU，但不适合扛旗舰总入口。
- 一条主线里按 section 连续补齐多个邻接技能，比做一个过大的万能技能更容易被采用。

## Hermes 发布动作

- 发布文案优先解释工作流边界、平台边界和使用前提。
- section、path、标题、描述必须同向，不要让目录归类和正文叙事冲突。
- 社区包要强调 runtime-only、安全边界和宿主要求，避免开发过程说明压过实际运行方式。
- 与其追求“看起来强大”，不如追求“用户一眼知道该什么时候调用它”。

## Hermes Top-200 合并观察

| 排名 | Skill | Section | 类目 | AISA机会分 | 平台边界 |
| --- | --- | --- | --- | --- | --- |
| 1 | apple-notes | apple | Search & Research | 95.4 | macOS-only / Apple-adjacent |
| 2 | dogfood | dogfood | Search & Research | 95.4 | cross-platform or mixed |
| 3 | gif-search | media | Search & Research | 95.4 | cross-platform or mixed |
| 4 | spotify | media | Search & Research | 95.4 | cross-platform or mixed |
| 5 | huggingface-hub | mlops | Search & Research | 95.4 | cross-platform or mixed |
| 6 | evaluating-llms-harness | mlops | Search & Research | 95.4 | cross-platform or mixed |
| 7 | arxiv | research | Search & Research | 95.4 | cross-platform or mixed |
| 8 | blogwatcher | research | Search & Research | 95.4 | cross-platform or mixed |
| 9 | llm-wiki | research | Search & Research | 95.4 | cross-platform or mixed |
| 10 | research-paper-writing | research | Search & Research | 95.4 | cross-platform or mixed |
| 11 | codex | autonomous-ai-agents | Developer | 95 | cross-platform or mixed |
| 12 | codebase-inspection | github | Developer | 95 | cross-platform or mixed |
| 13 | github-auth | github | Developer | 95 | cross-platform or mixed |
| 14 | github-code-review | github | Developer | 95 | cross-platform or mixed |
| 15 | github-issues | github | Developer | 95 | cross-platform or mixed |

## Hermes Bundled 技能机会

| 排名 | Skill | Section | 类目 | 标签 | AISA机会分 |
| --- | --- | --- | --- | --- | --- |
| 1 | apple-notes | apple | Search & Research | apple, macos | 95.4 |
| 2 | dogfood | dogfood | Search & Research | github | 95.4 |
| 3 | gif-search | media | Search & Research | media | 95.4 |
| 4 | spotify | media | Search & Research | media | 95.4 |
| 5 | huggingface-hub | mlops | Search & Research | mlops, github | 95.4 |
| 6 | evaluating-llms-harness | mlops | Search & Research | mlops, evaluation, github | 95.4 |
| 7 | arxiv | research | Search & Research | research | 95.4 |
| 8 | blogwatcher | research | Search & Research | research | 95.4 |
| 9 | llm-wiki | research | Search & Research | research, mlops | 95.4 |
| 10 | research-paper-writing | research | Search & Research | research, mlops | 95.4 |
| 11 | codex | autonomous-ai-agents | Developer | autonomous, ai, agents, github | 95 |
| 12 | codebase-inspection | github | Developer | github | 95 |

## Hermes Optional 技能机会


## 什么能复制，什么不能复制

能复制：

- section 优先的命名与分类策略
- 把技能边界写得非常具体
- 用 workflow 词而不是抽象概念词
- 优先做外部系统清晰、重复调用多的能力

不容易直接复制：

- 强 Apple / macOS / 本地设备耦合的运行时
- 依赖宿主能力或内置工具链的深耦合 skill
- 需要重度本地权限和持续维护的复杂系统能力

## AISA API 怎么在 Hermes 做爆款

1. 从 GitHub、Research、Workspace、Documents、Automation 五条线先做。
2. 技能标题和描述优先强调明确工作流，而不是“更聪明”“更强大”。
3. 用一个旗舰 skill 证明价值，再拆垂直窄入口。
4. 对 Apple / macOS 方向只做专属 SKU，不作为通用主线。

## Hermes Top 机会

| 排名 | 板块 | 名称 | 类目 | 机会分 |
| --- | --- | --- | --- | --- |
| 1 | Hermes Bundled | apple-notes | Search & Research | 95.4 |
| 2 | Hermes Bundled | dogfood | Search & Research | 95.4 |
| 3 | Hermes Bundled | gif-search | Search & Research | 95.4 |
| 4 | Hermes Bundled | spotify | Search & Research | 95.4 |
| 5 | Hermes Bundled | huggingface-hub | Search & Research | 95.4 |
| 6 | Hermes Bundled | evaluating-llms-harness | Search & Research | 95.4 |
| 7 | Hermes Bundled | arxiv | Search & Research | 95.4 |
| 8 | Hermes Bundled | blogwatcher | Search & Research | 95.4 |


