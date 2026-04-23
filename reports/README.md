# Report Library

这里是仓库内的报告源目录，用来放项目生成的 Markdown 与 `.docx` 报告。

- 仓库内可编辑源文件：`reports/`
- 公开镜像副本：`public/reports/`
- 浏览器入口页：`public/reports/index.html`

## 如何选报告

| 你想回答的问题 | 先看哪份报告 | 为什么 |
| --- | --- | --- |
| 哪些 ClawHub plugin 真的在赢，靠的是 downloads、installs 还是 stars | `ClawHub_Plugin_Viral_Report_*` | 这是 plugin 三榜、综合榜、信任机制和 AISA 改造机会的总入口 |
| ClawHub 的 `10k+` 技能和高产作者为什么能持续放大 | `ClawHub_10K_System_Report*` | 这里聚焦可复制生产系统和作者工厂结构 |
| 如果只给管理层看结论，应该看什么 | `ClawHub_10K_Boss_Brief_*`、`ClawHub_Viral_Boss_Report_ZH` | 这两类报告更偏决策摘要而不是过程细节 |
| 哪些 ClawHub skill 最适合转成 AISA 产品 | `ClawHub_Top200_AISA_Conversion_Report_ZH`、`AISA_All_Skills_Breakout_Plan_ZH` | 一个给机会队列，一个给整体扩张计划 |
| Claude、Hermes、AgentSkill、AgentSkills.so 各自的爆款结构是什么 | `Claude_AISA_Report_*`、`Hermes_AISA_Report_*`、`AgentSkill_Report_*`、`AgentSkills_SO_Report_*` | 这些是平台专项报告，适合分平台深看 |
| AISA 爆款计划该怎么推进、怎么验收 | `AISA_Breakout_Execution_Plan_ZH`、`AISA_Breakout_Test_Evidence_ZH` | 一个讲执行顺序，一个讲验证证据 |

## 报告家族

### ClawHub

- `ClawHub_Plugin_Viral_Report_ZH.md/.docx` / `ClawHub_Plugin_Viral_Report_EN.md/.docx`
  内容：ClawHub plugin 的 downloads / installs / stars 三榜、综合榜、作者工厂、信任信号和 AISA 改造机会。
- `ClawHub_10K_System_Report.md/.docx` / `ClawHub_10K_System_Report_ZH.md/.docx`
  内容：ClawHub `10k+` 技能与高产作者的可复制生产系统。
- `ClawHub_10K_Boss_Brief_EN.md/.docx` / `ClawHub_10K_Boss_Brief_ZH.md/.docx`
  内容：从 10k 系统里抽出的老板版摘要。
- `ClawHub_Multi_Ranking_Report_ZH.md/.docx`
  内容：downloads / stars / installs 合并后的多榜综合分析。
- `ClawHub_Viral_Boss_Report_ZH.md/.docx`
  内容：ClawHub 爆款 skill 与作者策略的管理层摘要。
- `ClawHub_Top200_AISA_Conversion_Report_ZH.md/.docx`
  内容：最值得转成 AISA 产品的 Top 200 ClawHub skill 队列。

### Cross-Market

- `Claude_AISA_Report_ZH.md/.docx` / `Claude_AISA_Report_EN.md/.docx`
  内容：Claude 技能与 marketplace 的爆款结构、作者工厂和 AISA 选品建议。
- `Hermes_AISA_Report_ZH.md/.docx` / `Hermes_AISA_Report_EN.md/.docx`
  内容：Hermes workflow atlas、bundled / optional 机会位和 AISA 包装建议。
- `AgentSkill_Report_ZH.md/.docx` / `AgentSkill_Report_EN.md/.docx`
  内容：AgentSkill 的 skill / plugin / creator、评分、信任和 AISA 机会。
- `AgentSkills_SO_Report_ZH.md/.docx` / `AgentSkills_SO_Report_EN.md/.docx`
  内容：AgentSkills.so 的 weekly downloads、repo trust、安全姿态、分发覆盖与 AISA 机会。

### AISA Execution

- `AISA_All_Skills_Breakout_Plan_ZH.md/.docx`
  内容：当前 AISA skill 组合的扩张与包装总计划。
- `AISA_Breakout_Execution_Plan_ZH.md/.docx`
  内容：爆款计划的落地顺序与执行阶段。
- `AISA_Breakout_Test_Evidence_ZH.md/.docx`
  内容：验证输出、测试证据和验收记录。

## 格式说明

- `.md`
  适合仓库内继续编辑、对比 diff、复用段落或作为脚本再加工输入。
- `.docx`
  适合发给团队、老板、客户或外部合作方直接阅读。

如果只改了 `reports/*.md` 或 `public/reports/*.md`，运行下面命令即可补齐或刷新对应 Word 文件：

```bash
npm run sync:report-docx
```

## 使用建议

- 在仓库内找报告源文件时，从这里开始。
- 在浏览器里给别人看报告目录时，用 `public/reports/index.html`。
- 想直接看跨平台汇总页面，用站点根目录的 `market-intelligence.html`。
- 想直接看 ClawHub plugin 三榜页面，用 `clawhub-plugins.html`。
- 想看项目总手册和脚本入口，用 `README.md`、`docs/PROJECT_MANUAL.md`、`scripts/README.md`。
