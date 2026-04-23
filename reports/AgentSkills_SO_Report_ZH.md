# AgentSkills.so 爆款报告

- 生成时间：2026-04-23T05:48:01.743Z
- 数据日期：2026-04-23
- 采样范围：首页分页 + skills/search 分页 + 技能详情页

## 一句话结论

AgentSkills.so 更强调“技能本身作为可复用资产”的商品化表达。周下载、GitHub Stars、安全信号、distribution 覆盖和任务边界清晰度共同决定排名潜力。最适合 AISA 的依然是高频外部系统边界和可复用工作流。

## 重要排名因素

| 指标 | 重要性 | 观察证据 | 为什么重要 |
| --- | --- | --- | --- |
| Weekly downloads | Very high | Sampled total 1,288,146 weekly downloads | The site surfaces weekly demand directly in cards and detail pages. |
| GitHub stars | High | Sampled total 6,063,095 repo stars | Repo trust is the strongest cross-platform cold-start asset. |
| Security posture | High | Resolved security breakdown for 43/44 items, average 68.5/100 | Trust & Identity, Behavioral Monitoring, and Vulnerability Exposure are explicit review surfaces. |
| Category / use-case fit | Very high | Developer 16; General Utility 13; Productivity & Workspace 3; Browser & Automation 3; Office Documents 3 | The strongest skills describe a single job-to-be-done in plain language. |
| Distribution / platform coverage | Medium | Average sampled platform coverage 0.0 distributions | Visible installation across multiple agent distributions reinforces portability and trust. |
| Author factory effect | Medium | vercel-labs 5; microsoft 5; anthropics 13 | Multi-skill repo owners compound trust and discovery over time. |

## 排名机制

- AgentSkills.so 把 "Weekly Downloads" 放到了非常显眼的位置，因此需求强度会直接左右第一印象。
- 详情页里的 "Trust & Identity"、"Behavioral Monitoring"、"Vulnerability Exposure" 已经成为公开信任表面，不再只是安全附录。
- GitHub repo 和星标是冷启动最强证明，尤其适合解释“为什么这个 skill 值得装”。
- "Agent Distribution" 覆盖会放大跨平台可移植性的感知，适合做通用 API 和工作流商品。

## 爆款机制

- 周下载高的 skill，几乎都把任务边界写得很窄很清楚，而不是泛泛谈“提升效率”。
- repo 信任 + 安全姿态 + distribution 覆盖，比单个华丽标题更能支撑长期转化。
- 同一作者持续发布同一主线 skill，会更快积累搜索与收藏复利。
- 适合 AISA 的，仍然是外部系统边界清晰、可重复调用、可跨 agent 复用的技能面。

## 发布动作

- 标题先写动作，再写对象，再写结果，不要先写抽象愿景。
- 正文和 README 要说明依赖的外部系统、权限边界、持久化方式和典型输出。
- 如果 skill 可以跨 distribution 复用，就把这种可移植性写清楚，帮助用户理解“不是只能在一个宿主里用”。
- 安全姿态要具体：读什么、写什么、联网做什么、默认会不会落盘，都要写明白。

## 常见失分项

- 标题过泛，像内部助手而不是可复用商品。
- repo 与页面承诺不一致，或者技能范围大到让人无法判断风险。
- 安全姿态和持久化行为写得含糊，导致用户不敢装。
- 明明是单宿主技能，却把自己包装成跨平台万能组件。
## 爆款技能样本

| 排名 | Skill | Repo | 类目 | 周下载 | GitHubStars | 安全分 | 覆盖平台 | AISA机会分 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | remotion-best-practices | remotion-dev/skills | Developer | 111000 | 1700 | 100 | 0 | 92 |
| 2 | algorithmic-art | anthropics/skills | Developer | 9300 | 74800 | 100 | 0 | 92 |
| 3 | review-pr | steipete/clawdis | Developer | 18 | 298200 | 100 | 0 | 92 |
| 4 | gh-issues | steipete/clawdis | Developer | 101 | 298200 | 93.3 | 0 | 91.33 |
| 5 | discord | steipete/clawdis | Productivity & Workspace | 130 | 298200 | 100 | 0 | 90.45 |
| 6 | find-skills | vercel-labs/skills | Browser & Automation | 320300 | 6800 | 100 | 0 | 90.15 |
| 7 | azure-aigateway | microsoft/github-copilot-for-azure | Browser & Automation | 51200 | 119 | 100 | 0 | 90.15 |
| 8 | agent-browser | vercel-labs/agent-browser | Browser & Automation | 58500 | 15300 | 93.3 | 0 | 89.48 |
| 9 | bird | steipete/clawdis | Search & Research | 19 | 298200 | 66.7 | 0 | 88.97 |
| 10 | vercel-react-best-practices | vercel-labs/agent-skills | Developer | 149100 | 21100 | 66.7 | 0 | 88.67 |
| 11 | vercel-composition-patterns | vercel-labs/agent-skills | Developer | 56900 | 21100 | 66.7 | 0 | 88.67 |
| 12 | web-artifacts-builder | anthropics/skills | Developer | 8600 | 74800 | 66.7 | 0 | 88.67 |
| 13 | webapp-testing | anthropics/skills | Developer | 14400 | 74800 | 66.7 | 0 | 88.67 |
| 14 | feature-flags | facebook/react | Developer | 448 | 243300 | 66.7 | 0 | 88.67 |
| 15 | verify | facebook/react | Developer | 476 | 243300 | 66.7 | 0 | 88.67 |

## 高产作者画像

| 排名 | 作者 | 样本技能数 | 周下载总和 | GitHubStars总和 | 平均安全分 |
| --- | --- | --- | --- | --- | --- |
| 1 | vercel-labs | 5 | 698700 | 85400 | 85.3 |
| 2 | microsoft | 5 | 256000 | 595 | 80 |
| 3 | anthropics | 13 | 218200 | 897600 | 71.8 |
| 4 | remotion-dev | 1 | 111000 | 1700 | 100 |
| 5 | facebook | 7 | 3470 | 1703100 | 53.3 |
| 6 | steipete | 13 | 776 | 3374700 | 54.9 |

## 爆款共同点

- 技能名和描述非常贴近具体任务，而不是抽象能力。
- 高周下载技能通常也有强 repo 信任和更清晰的边界。
- 安全分高的技能更适合长期转化和企业采纳。
- 高产作者往往复用同一仓库或同一能力主线，形成稳定的发现入口。

## AISA API 在 AgentSkills.so 的打法

1. 优先做 Developer、Research、Documents、Workspace、Automation 五类。
2. 标题优先写“要完成的动作”，正文写“输入是什么、输出是什么”。
3. 尽量把技能依赖的外部系统讲清楚，让它更像一个可复用 API 包。
4. 对安全性、权限边界、输出稳定性要写得更明确，利于长期上榜。

