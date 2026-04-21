# ClawHub Plugin 爆款报告

- 生成时间：2026-04-20T12:07:12.386Z
- 分析对象：ClawHub 插件目录（公开排序页 + 详情页 SSR 数据）
- 数据日期：2026-04-20

## 一句话结论

ClawHub 的 plugin 生态在 2026-04-20 仍然非常早期，公开 'downloads / installs / stars' 指标几乎全部为 '0'，所以真正能解释“谁更有爆款相”的，不是下载量，而是四件事：是否抓住强运营/强治理/强连接的刚需入口，是否是可验证的 source-linked 包，是否能把副作用和安装路径讲清楚，以及作者是否在连续推出同一主线下的多个相邻插件。

## 关键发现

1. 三个排序页目前公开顺序高度一致，说明 plugin 的数值指标还没有像 skill 那样形成成熟竞争面。
2. 真正占据榜首的，大多是 'Code Plugin'，而不是纯文案 bundle。
3. 爆款 plugin 的名字几乎都在直接说“连接哪一个系统”或“解决哪一个运维动作”，而不是抽象概念名。
4. 'source-linked + clean/benign' 的验证组合，已经成为 plugin 赛道里比“写得很花”更重要的信任资产。
5. 高产作者不是乱发插件，而是围绕一个平台或一个运维主线，连续堆出多个邻接插件。
6. 适合改造成 AISA API 的，不是最底层的记忆/路由内核，而是安全治理、业务增长、支付链路、存储物流、外部 SaaS 连接器。

## 为什么现在的 Plugin 爆款判断不能照搬 Skill

- Skill 爆款依赖下载、收藏、安装转化这些显性指标。
- Plugin 赛道当前公开数值面几乎空白，所以我们要把 '上榜顺序 + 插件家族类型 + 验证状态 + 版本成熟度 + 作者产能' 组合起来看。
- 这也是为什么本次沉淀到 packager skill 的，不只是“怎么打包”，而是“怎么把插件做得更像一个可信、可扩张、可持续上榜的商品”。

## Top 10 Plugin

| 排名 | Plugin | 作者 | 类型 | 主题 | 扫描 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | AxonFlow Governance | saurabhjain1592 | Code | Governance & Security | clean | source-linked |
| 2 | ClawVitals | bk-cm | Code | Governance & Security | clean | source-linked |
| 3 | Nowledge Mem for OpenClaw | wey-gu | Code | Memory & Knowledge | clean | source-linked |
| 4 | Intent Transfer Completion via LI.FI | merdikim | Code | Commerce, Storage & Chain | clean | source-linked |
| 5 | agentschatapp | unclek | Code | Channels & Messaging | clean | source-linked |
| 6 | Algorand Plugin | emg110 | Code | Commerce, Storage & Chain | clean | source-linked |
| 7 | Openclaw Interven Guard | boltyx0 | Code | Governance & Security | clean | source-linked |
| 8 | claw.cleaning | cnnrobrn | Code | Infrastructure & Utilities | clean | source-linked |
| 9 | Openclaw Session Bloat Warning | teodorarg | Code | Memory & Knowledge | clean | source-linked |
| 10 | Aigroup Financial Services Openclaw Release | jackdark425 | Bundle | Infrastructure & Utilities | pending | source-linked |

## 爆款 Plugin 共性

- 标题直接点系统、场景、结果，例如 channel、CRM、governance、security、parcel、payment，而不是抽象喊“agent upgrade”。
- 描述会把安装后真正发生的事情说清楚，例如写配置、重启 gateway、接入哪个后端、是否拉远程资源。
- 结构上优先是 'code-plugin'，因为 plugin 用户更愿意为“真实能力接入”而不是“提示词包装”买单。
- 能过 'source-linked' 验证的插件，冷启动信任成本明显更低。
- 安全/治理/通信/业务连接器最容易形成强需求入口。

## 爆款作者画像

| 排名 | 作者 | 插件数 | Code | Bundle | 主主题 |
| --- | --- | --- | --- | --- | --- |
| 1 | jackdark425 | 3 | 0 | 3 | Infrastructure & Utilities / Business Ops & Growth |
| 2 | omarshahine | 3 | 3 | 0 | Workspace & App Layer / Infrastructure & Utilities / Workflow & Integration |
| 3 | bk-cm | 1 | 1 | 0 | Governance & Security |
| 4 | saurabhjain1592 | 1 | 1 | 0 | Governance & Security |
| 5 | wey-gu | 1 | 1 | 0 | Memory & Knowledge |
| 6 | merdikim | 1 | 1 | 0 | Commerce, Storage & Chain |
| 7 | boltyx0 | 1 | 1 | 0 | Governance & Security |
| 8 | emg110 | 1 | 1 | 0 | Commerce, Storage & Chain |
| 9 | unclek | 1 | 1 | 0 | Channels & Messaging |
| 10 | cnnrobrn | 1 | 1 | 0 | Infrastructure & Utilities |

## 高产作者的方法论能不能复制

可以复制，但复制的是“主线工厂”，不是单个题材。

- 可复制部分：先选一个高频平台或高风险动作，连续发 3 到 5 个相邻插件，占住一个心智带。
- 不可直接照抄部分：如果插件依赖强本地状态、深度 OpenClaw 内核、复杂安装副作用，迁移成本会很高。
- 最优复制方式：优先复制外部系统连接器、治理护栏、运营动作插件，因为这些更容易 API 化，也更容易跨平台复用。

## AISA API 最值得切的 10 个方向

| 排名 | Plugin | 作者 | 主题 | 机会分 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 1 | Clarify.ai CRM | adawodu | Business Ops & Growth | 90.4 | 天然对应高价值垂直 API：CRM、销售线索、营销活动、外呼管道都可以被拆成付费接口。 |
| 2 | Product Marketing BytePlus | sqsge | Business Ops & Growth | 90.4 | 天然对应高价值垂直 API：CRM、销售线索、营销活动、外呼管道都可以被拆成付费接口。 |
| 3 | Starplast Operations | mzfshark | Business Ops & Growth | 90.4 | 天然对应高价值垂直 API：CRM、销售线索、营销活动、外呼管道都可以被拆成付费接口。 |
| 4 | Icpswap Plugin | onevroad-icp | Commerce, Storage & Chain | 89.5 | 链上、支付、存储、物流等能力更像稳定 API，而不是必须驻留本地的插件。 |
| 5 | Algorand Plugin | emg110 | Commerce, Storage & Chain | 88.15 | 链上、支付、存储、物流等能力更像稳定 API，而不是必须驻留本地的插件。 |
| 6 | AxonFlow Governance | saurabhjain1592 | Governance & Security | 85.75 | 安全审计、策略校验、批准门禁非常适合做高客单价 AISA 安全能力层。 |
| 7 | Magneto AI | rijuvashisht | Governance & Security | 85.75 | 安全审计、策略校验、批准门禁非常适合做高客单价 AISA 安全能力层。 |
| 8 | Openclaw Interven Guard | boltyx0 | Governance & Security | 85.75 | 安全审计、策略校验、批准门禁非常适合做高客单价 AISA 安全能力层。 |
| 9 | ClawVitals | bk-cm | Governance & Security | 83.05 | 安全审计、策略校验、批准门禁非常适合做高客单价 AISA 安全能力层。 |
| 10 | Delx Witness Protocol for OpenClaw | davidmosiah | Governance & Security | 83.05 | 安全审计、策略校验、批准门禁非常适合做高客单价 AISA 安全能力层。 |

## AISA API 怎么在 Plugin 赛道做爆款

1. 先做“远程价值最强、驻留依赖最弱”的能力。
2. 先上安全治理、销售增长、支付链路、物流/存储、SaaS 连接器，再考虑记忆内核。
3. 每个方向先发 1 个旗舰 command center，再拆 2 到 4 个单任务 SKU。
4. 对外页面必须把副作用、鉴权方式、远程数据流和验证来源写清楚，否则 plugin 用户不会信。
5. 同一个主线上要连续发作品，作者名本身也会变成分发资产。

## 选品安排

- 第一梯队：Governance & Security、Business Ops & Growth、Commerce / Storage / Chain。
- 第二梯队：Workflow & Integration、Channels & Messaging。
- 第三梯队：Workspace & App Layer。
- 暂缓：Memory & Knowledge、纯路由/协议内核，这些更适合做平台能力而不是第一波 API 爆款。

## 方法论如何内化到 Packager Skill

- 打包不再只是“结构正确”，而是要让插件在发布前就具备强标题、强验证、强边界感、强可信度。
- 平台通用层：名称必须是任务/系统词，描述必须直说安装后做什么，README 必须解释副作用和信任来源。
- ClawHub 特化层：强调 source-linked、scan coherence、capability/runtimeId 一致性，以及 bundle/code 两种模式的清晰边界。
- Claude / Hermes / AgentSkill 特化层：分别照顾 repo 信任、目录可读性、quality/security/rating 这些平台偏好的排序信号。

