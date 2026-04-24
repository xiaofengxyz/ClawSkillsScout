# ClawHub Plugin 爆款报告

- 生成时间：2026-04-24T10:58:34.047Z
- 分析对象：ClawHub 插件目录（公开排序页 + 详情页 SSR 数据）
- 数据日期：2026-04-24

## 一句话结论

ClawHub 的 plugin 生态仍然非常早期，但公开目录已经明确把 plugin 放进 "downloads / installs / stars" 三个排序面来分发。也就是说，爆款判断不能只看 "Code / Bundle" 类型，而要同时看三榜排位、验证状态、安全扫描、能力边界、运行时一致性和作者是否在持续扩张同一主线。

## 关键发现

1. ClawHub 现在公开展示的 plugin 发现层，至少包含四个维度：三套排序榜单、"Code / Bundle" 类型过滤、"Verified only" 过滤、"Executes code" 风险过滤。
2. 真正占据榜首的，依然以 "Code Plugin" 为主；"Bundle Plugin" 更像在承接说明型或跨宿主分发，而不是当前的主流爆款形态。
3. 爆款 plugin 的名字几乎都在直接说“连接哪一个系统”或“解决哪一个运维动作”，而不是抽象概念名。
4. 插件详情页里的 "Security Scan"、"VirusTotal"、"OpenClaw verdict"、"Runtime ID"、"Compatibility"、"Capabilities"、"source-linked" 等信号，已经是 plugin 用户判断是否安装的核心表面。
5. 高产作者不是乱发插件，而是围绕一个平台或一个运维主线，连续堆出多个邻接插件。
6. 适合改造成 AISA API 的，不是最底层的记忆/路由内核，而是安全治理、业务增长、支付链路、存储物流、外部 SaaS 连接器。

## 为什么现在的 Plugin 爆款判断不能照搬 Skill

- Skill 爆款依赖下载、收藏、安装转化这些显性指标。
- Plugin 赛道当前虽然有三套公开排序，但详情页对大多数 plugin 没有直接暴露可读的公开数值，因此我们要把 '三榜顺序 + 插件家族类型 + 验证状态 + 版本成熟度 + 作者产能' 组合起来看。
- 这也是为什么本次沉淀到 packager skill 的，不只是“怎么打包”，而是“怎么把插件做得更像一个可信、可扩张、可持续上榜的商品”。

## Downloads 排行 Top 10

| 排名 | Plugin | 作者 | 类型 | 主题 | 验证 |
| --- | --- | --- | --- | --- | --- |
| 1 | Zalo Group Moderation | tuanminhhole | Code | Memory & Knowledge | source-linked |
| 2 | Package | ljqdh | Code | Infrastructure & Utilities | source-linked |
| 3 | Gralkor Memory (OpenClaw) | elimydlarz | Code | Memory & Knowledge | source-linked |
| 4 | Memnode Openclaw Plugin | pbudzik | Code | Memory & Knowledge | source-linked |
| 5 | Seedance Story Director | zuoanco | Code | Infrastructure & Utilities | source-linked |
| 6 | Openclaw | zc277584121 | Code | Memory & Knowledge | source-linked |
| 7 | Kichi Forwarder | xiaoxinshi001 | Code | Infrastructure & Utilities | source-linked |
| 8 | klodi | blackbak | Code | Workspace & App Layer | source-linked |
| 9 | Claw Recipes | rjdjohnston | Code | Workflow & Integration | source-linked |
| 10 | Plugin | dearken10 | Code | Channels & Messaging | source-linked |

## Installs 排行 Top 10

| 排名 | Plugin | 作者 | 类型 | 主题 | 验证 |
| --- | --- | --- | --- | --- | --- |
| 1 | Zalo Group Moderation | tuanminhhole | Code | Memory & Knowledge | source-linked |
| 2 | Package | ljqdh | Code | Infrastructure & Utilities | source-linked |
| 3 | Gralkor Memory (OpenClaw) | elimydlarz | Code | Memory & Knowledge | source-linked |
| 4 | Memnode Openclaw Plugin | pbudzik | Code | Memory & Knowledge | source-linked |
| 5 | Seedance Story Director | zuoanco | Code | Infrastructure & Utilities | source-linked |
| 6 | Openclaw | zc277584121 | Code | Memory & Knowledge | source-linked |
| 7 | Kichi Forwarder | xiaoxinshi001 | Code | Infrastructure & Utilities | source-linked |
| 8 | klodi | blackbak | Code | Workspace & App Layer | source-linked |
| 9 | Claw Recipes | rjdjohnston | Code | Workflow & Integration | source-linked |
| 10 | Plugin | dearken10 | Code | Channels & Messaging | source-linked |

## Stars 排行 Top 10

| 排名 | Plugin | 作者 | 类型 | 主题 | 验证 |
| --- | --- | --- | --- | --- | --- |
| 1 | Zalo Group Moderation | tuanminhhole | Code | Memory & Knowledge | source-linked |
| 2 | Package | ljqdh | Code | Infrastructure & Utilities | source-linked |
| 3 | Gralkor Memory (OpenClaw) | elimydlarz | Code | Memory & Knowledge | source-linked |
| 4 | Memnode Openclaw Plugin | pbudzik | Code | Memory & Knowledge | source-linked |
| 5 | Seedance Story Director | zuoanco | Code | Infrastructure & Utilities | source-linked |
| 6 | Openclaw | zc277584121 | Code | Memory & Knowledge | source-linked |
| 7 | Kichi Forwarder | xiaoxinshi001 | Code | Infrastructure & Utilities | source-linked |
| 8 | klodi | blackbak | Code | Workspace & App Layer | source-linked |
| 9 | Claw Recipes | rjdjohnston | Code | Workflow & Integration | source-linked |
| 10 | Plugin | dearken10 | Code | Channels & Messaging | source-linked |


## Top 10 Plugin

| 排名 | Plugin | 作者 | 类型 | 主题 | 扫描 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Package | ljqdh | Code | Infrastructure & Utilities | clean | source-linked |
| 2 | Zalo Group Moderation | tuanminhhole | Code | Memory & Knowledge | clean | source-linked |
| 3 | Gralkor Memory (OpenClaw) | elimydlarz | Code | Memory & Knowledge | pending | source-linked |
| 4 | Memnode Openclaw Plugin | pbudzik | Code | Memory & Knowledge | clean | source-linked |
| 5 | Openclaw | zc277584121 | Code | Memory & Knowledge | clean | source-linked |
| 6 | Kichi Forwarder | xiaoxinshi001 | Code | Infrastructure & Utilities | pending | source-linked |
| 7 | Seedance Story Director | zuoanco | Code | Infrastructure & Utilities | pending | source-linked |
| 8 | klodi | blackbak | Code | Workspace & App Layer | clean | source-linked |
| 9 | Plugin | dearken10 | Code | Channels & Messaging | clean | source-linked |
| 10 | Claw Recipes | rjdjohnston | Code | Workflow & Integration | pending | source-linked |

## 三榜差异最大的 Plugin


## 爆款 Plugin 共性

- 标题直接点系统、场景、结果，例如 channel、CRM、governance、security、parcel、payment，而不是抽象喊“agent upgrade”。
- 描述会把安装后真正发生的事情说清楚，例如写配置、重启 gateway、接入哪个后端、是否拉远程资源。
- 结构上优先是 "code-plugin"，因为 plugin 用户更愿意为“真实能力接入”而不是“提示词包装”买单。
- 能过 "source-linked" 验证的插件，冷启动信任成本明显更低。
- 安全/治理/通信/业务连接器最容易形成强需求入口。

## 平台排名机制

- 排名面：ClawHub 已公开提供 "downloads"、"installs"、"stars" 三套 plugin 排序入口，发布时必须默认自己会同时被这三种发现逻辑审视。
- 过滤面："Code / Bundle"、"Verified only"、"Executes code" 不只是展示选项，而是用户做预筛的高频入口。
- 信任面：详情页里的 "Security Scan"、"VirusTotal"、"OpenClaw verdict"、"source-linked"、"Runtime ID"、"Compatibility"、"Capabilities" 一起决定冷启动安装意愿。
- 转化面：标题是否任务化、README 是否说清副作用、manifest 是否与能力声明一致，都会直接影响安装前判断。

## 爆款机制与发布动作

- 先抢一个高价值系统边界，再围绕同一主线发布 3 到 5 个相邻插件，比随机发散更容易形成作者分发资产。
- "Code Plugin" 适合承接真实运行时能力，"Bundle Plugin" 更适合承接说明型内容、跨宿主技能包和轻运行时分发；不要混淆。
- 发布时要把副作用、鉴权、写配置、重启、远程资源下载这些动作写明，否则用户和扫描器都会提高警惕。
- 页面和包内容必须同构：标题、描述、manifest、README、能力标签、runtimeId、实际代码行为不能互相打架。

## 爆款作者画像

| 排名 | 作者 | 插件数 | Code | Bundle | 主主题 |
| --- | --- | --- | --- | --- | --- |
| 1 | bibaofeng | 5 | 5 | 0 | Workflow & Integration / Channels & Messaging / Infrastructure & Utilities |
| 2 | baofeng-tech | 4 | 4 | 0 | Infrastructure & Utilities / Channels & Messaging |
| 3 | pierrelouisevensmaxai-blip | 3 | 0 | 3 | Infrastructure & Utilities |
| 4 | aisadocs | 3 | 3 | 0 | Infrastructure & Utilities / Workflow & Integration |
| 5 | ljqdh | 1 | 1 | 0 | Infrastructure & Utilities |
| 6 | tuanminhhole | 1 | 1 | 0 | Memory & Knowledge |
| 7 | elimydlarz | 1 | 1 | 0 | Memory & Knowledge |
| 8 | pbudzik | 1 | 1 | 0 | Memory & Knowledge |
| 9 | zc277584121 | 1 | 1 | 0 | Memory & Knowledge |
| 10 | xiaoxinshi001 | 1 | 1 | 0 | Infrastructure & Utilities |

## 高产作者的方法论能不能复制

可以复制，但复制的是“主线工厂”，不是单个题材。

- 可复制部分：先选一个高频平台或高风险动作，连续发 3 到 5 个相邻插件，占住一个心智带。
- 不可直接照抄部分：如果插件依赖强本地状态、深度 OpenClaw 内核、复杂安装副作用，迁移成本会很高。
- 最优复制方式：优先复制外部系统连接器、治理护栏、运营动作插件，因为这些更容易 API 化，也更容易跨平台复用。

## AISA API 最值得切的 10 个方向

| 排名 | Plugin | 作者 | 主题 | 机会分 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 1 | AIsa Twitter API | bibaofeng | Workflow & Integration | 86.2 | 外部系统连接器和运营动作容易被抽象成 AISA command center。 |
| 2 | Twitter | bibaofeng | Workflow & Integration | 84.85 | 外部系统连接器和运营动作容易被抽象成 AISA command center。 |
| 3 | ZeroAPI Router | dorukardahan | Workflow & Integration | 82.9 | 外部系统连接器和运营动作容易被抽象成 AISA command center。 |
| 4 | Plugin | dearken10 | Channels & Messaging | 80.05 | 当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。 |
| 5 | Youtube Serp | bibaofeng | Channels & Messaging | 79.3 | 当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。 |
| 6 | agentschatapp | unclek | Channels & Messaging | 78.7 | 当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。 |
| 7 | Watcher Channel | orulink | Channels & Messaging | 78.7 | 当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。 |
| 8 | WTT Plugin | cecwxf | Channels & Messaging | 78.7 | 当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。 |
| 9 | klodi | blackbak | Workspace & App Layer | 76.9 | 当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。 |
| 10 | Openclaw Openmontage | itsuzef | Workspace & App Layer | 76.9 | 当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。 |

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
- ClawHub 特化层：强调三榜分发、source-linked、scan coherence、capability/runtimeId 一致性，以及 bundle/code 两种模式的清晰边界。
- Claude / Hermes / AgentSkill 特化层：分别照顾 repo 信任、目录可读性、quality/security/rating 这些平台偏好的排序信号。

