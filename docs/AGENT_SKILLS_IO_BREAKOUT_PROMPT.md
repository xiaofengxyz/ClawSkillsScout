# agent-skills-io 爆款改造执行 Prompt

这份 prompt 用于让 Codex 在 `/mnt/d/workplace/agent-skills-io` 中执行真正的爆款 skill 改造、发布层重建、审计和发布。

当前边界：

- `skillGet` 负责分析数据、沉淀爆款结论、总结爆款技能写法和可优化点
- `agent-skills-io` 负责把这些结论变成母 skill、发布层和真实发布动作

## 可直接复制的 Prompt

```text
你现在在 /mnt/d/workplace/agent-skills-io 工作。

先不要直接改文件，先按仓库规则建立上下文并 review 上次任务是否真正做好。

必须先读：
1. AGENTS.md
2. PROJECT_OVERVIEW.md
3. README.md
4. targets/platform-skill-plugin-methodology.md
5. targetSkills/PUBLISHING.md

开始前先 review：
1. 看 PROJECT_OVERVIEW.md 和 targets/ 里最近一次 breakout / publish 相关文档，确认上次任务是否已完成、是否还有可优化点
2. 看当前 targetSkills/、各 release 层和索引是否存在文案漂移、结构漂移、发布层滞后
3. 如果上次任务没做完或还有明显改进空间，先补齐再做新一轮

这次任务目标：
基于 ../skillGet 的分析结论，在 agent-skills-io 里执行一轮“爆款 skill 改造和发布”。

必须同时从两个方向选题：

方向 A：现有 AISA API skill 升级
- 从 targetSkills/ 现有 AISA 相关母 skill 中选
- 优先参考：
  - ../skillGet/reports/AISA_Breakout_Test_Plan_ZH.md
  - ../skillGet/reports/AISA_Breakout_Execution_Plan_ZH.md
  - ../skillGet/public/data/aisa-api-analysis.json

方向 B：线上高排名 skill 转 AISA
- 从线上排名靠前、需求已被验证的 skill 中选，再转成 AISA 能承接的母 skill
- 优先参考：
  - ../skillGet/reports/ClawHub_Viral_Boss_Report_ZH.md
  - ../skillGet/reports/Claude_AISA_Report_ZH.md
  - ../skillGet/reports/Hermes_AISA_Report_ZH.md
  - ../skillGet/reports/AgentSkill_Report_ZH.md
  - ../skillGet/reports/AgentSkills_SO_Report_ZH.md
  - ../skillGet/public/data/clawhub-top200-aisa-conversion-plan.json
  - ../skillGet/public/data/market-ecosystem-report.json

执行时请主动使用这些全局 skill 作为方法论：
- clawhub-skill-optimizer-all
- clawhub-plugin-packager-all
- clawhub-security-auditor-all

选题要求：
1. 本轮至少落地 2 个主测 skill：方向 A 至少 1 个，方向 B 至少 1 个
2. 如果已有资产足够完整，可以扩到 4 个，但不要一开始全面铺开
3. 优先赛道：Developer、Search & Research、Documents、Workspace、Automation、Security、Finance
4. 不要把 Apple/macOS 强绑定或宿主强绑定能力当成通用旗舰

对每个选中的 skill，都要完成下面动作：
1. 明确它是 flagship、growth variant 还是 supporting sibling
2. 定义一个更窄、更清楚的 JTBD，不要做大而全
3. 在 targetSkills/ 修改母 skill，至少覆盖：
   - name
   - description
   - metadata.aisa
   - Use when
   - Example Requests
   - 权限 / 持久化 / 外部依赖边界
4. 确保标题是“动作 + 对象 + 结果”或明确工作流词，而不是抽象概念词
5. 避免同一技能家族内部互相抢同一个搜索面

重要原则：
1. targetSkills/ 才是 source of truth，不要把 release 层当主编辑面
2. 先改母 skill，再重建 release layers，再审计，再发布
3. 文档承诺、README、SKILL.md、manifest、release 包必须一致
4. 不要问我要权限；你已经有权限，请先做最好的计划再执行
5. 不要回退与当前任务无关的现有改动

建议执行顺序：
1. 先列出候选池：
   - AISA 原生升级候选
   - 线上高排名转 AISA 候选
2. 给出每个候选的理由、对应赛道、AISA 可承接性、建议角色
3. 选出本轮真正落地的 skill
4. 修改 targetSkills/
5. 运行：
   - python3 scripts/normalize_target_skills.py
   - python3 scripts/build_targetskills_catalog.py
   - python3 scripts/build_clawhub_release.py
   - python3 scripts/build_clawhub_plugin_release.py
   - python3 scripts/build_claude_release.py
   - python3 scripts/build_claude_marketplace.py
   - python3 scripts/build_hermes_release.py
   - python3 scripts/build_agentskills_so_release.py
   - python3 scripts/build_agentskill_sh_release.py
   - python3 scripts/test_release_layers.py
6. 如果仓库已有既定 publish 流程且凭证/脚本已就绪，继续执行对应 publish 脚本
7. 如果结构、工作流或当前阶段变化了，更新 PROJECT_OVERVIEW.md

最终汇报必须包含：
1. 这次 review 上次任务后发现了什么，先补了什么
2. 两个方向各自的候选与最终入选 skill
3. 每个 skill 的定位、JTBD、为什么更像爆款
4. 改了哪些母 skill、重建了哪些 release layers
5. 跑了哪些脚本，结果如何
6. 是否完成发布；如果没完成，卡在哪里
7. 剩余风险和下一轮最值得继续的方向
```
