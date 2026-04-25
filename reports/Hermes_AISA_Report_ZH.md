# Hermes AISA Report

- 生成时间：2026-04-25T04:44:29.267Z
- 数据日期：2026-04-25
- 来源：Hermes Skills Guide、Hermes raw catalog

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
| 1 | godmode | red-teaming | Search & Research | 95.4 | cross-platform or mixed |
| 2 | arxiv | research | Search & Research | 95.4 | cross-platform or mixed |
| 3 | llm-wiki | research | Search & Research | 95.4 | cross-platform or mixed |
| 4 | research-paper-writing | research | Search & Research | 95.4 | cross-platform or mixed |
| 5 | evaluating-llms-harness | mlops/evaluation | Search & Research | 95.4 | cross-platform or mixed |
| 6 | apple-notes | apple | Search & Research | 95.4 | macOS-only / Apple-adjacent |
| 7 | github-auth | github | Developer | 95 | cross-platform or mixed |
| 8 | github-code-review | github | Developer | 95 | cross-platform or mixed |
| 9 | github-issues | github | Developer | 95 | cross-platform or mixed |
| 10 | github-pr-workflow | github | Developer | 95 | cross-platform or mixed |
| 11 | github-repo-management | github | Developer | 95 | cross-platform or mixed |
| 12 | codebase-inspection | github | Developer | 95 | cross-platform or mixed |
| 13 | himalaya | email | Productivity & Workspace | 92.75 | cross-platform or mixed |
| 14 | google-workspace | productivity | Productivity & Workspace | 92.75 | cross-platform or mixed |
| 15 | linear | productivity | Productivity & Workspace | 92.75 | cross-platform or mixed |

## Hermes Bundled 技能机会

| 排名 | Skill | Section | 类目 | 标签 | AISA机会分 |
| --- | --- | --- | --- | --- | --- |
| 1 | godmode | red-teaming | Search & Research | red, teaming, mlops | 95.4 |
| 2 | arxiv | research | Search & Research | research | 95.4 |
| 3 | llm-wiki | research | Search & Research | research, mlops | 95.4 |
| 4 | research-paper-writing | research | Search & Research | research, mlops | 95.4 |
| 5 | evaluating-llms-harness | mlops/evaluation | Search & Research | mlops, evaluation, github | 95.4 |
| 6 | apple-notes | apple | Search & Research | apple, macos | 95.4 |
| 7 | github-auth | github | Developer | github | 95 |
| 8 | github-code-review | github | Developer | github | 95 |
| 9 | github-issues | github | Developer | github | 95 |
| 10 | github-pr-workflow | github | Developer | github, automation | 95 |
| 11 | github-repo-management | github | Developer | github, automation | 95 |
| 12 | codebase-inspection | github | Developer | github | 95 |

## Hermes Optional 技能机会

| 排名 | Skill | Section | 类目 | 标签 | AISA机会分 |
| --- | --- | --- | --- | --- | --- |
| 1 | bioinformatics | research | Search & Research | research | 95.4 |
| 2 | qmd | research | Search & Research | research, apple, macos, mlops, automation | 95.4 |
| 3 | docker-management | devops | Developer | devops | 95 |
| 4 | openclaw-migration | migration | Developer | migration, github | 95 |
| 5 | telephony | productivity | Productivity & Workspace | productivity | 92.75 |
| 6 | blender-mcp | creative | Browser & Automation | creative, automation | 92.45 |
| 7 | touchdesigner-mcp | creative | Browser & Automation | creative, automation | 92.45 |
| 8 | neuroskill-bci | health | Browser & Automation | health | 92.45 |
| 9 | fastmcp | mcp | Browser & Automation | mcp, automation | 92.45 |
| 10 | 1password | security | Security & Audit | security | 89.35 |
| 11 | oss-forensics | security | Security & Audit | security, github | 89.35 |
| 12 | sherlock | security | Security & Audit | security | 89.35 |

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
| 1 | Hermes Bundled | godmode | Search & Research | 95.4 |
| 2 | Hermes Bundled | arxiv | Search & Research | 95.4 |
| 3 | Hermes Bundled | llm-wiki | Search & Research | 95.4 |
| 4 | Hermes Bundled | research-paper-writing | Search & Research | 95.4 |
| 5 | Hermes Bundled | evaluating-llms-harness | Search & Research | 95.4 |
| 6 | Hermes Bundled | apple-notes | Search & Research | 95.4 |
| 7 | Hermes Bundled | github-auth | Developer | 95 |
| 8 | Hermes Bundled | github-code-review | Developer | 95 |


