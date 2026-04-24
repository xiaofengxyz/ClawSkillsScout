# ClawHub Plugin 情报报告

- 生成时间：2026-04-24T14:12:55.243Z
- 分析对象：ClawHub plugin 目录（公开目录页 + plugin 详情页 SSR 数据）
- 数据日期：2026-04-24

## 一句话结论

截至 2026-04-24，ClawHub 的 plugin 页面公开可见的是目录顺序、`All types / Code plugins / Bundle plugins` 过滤，以及 `Verified only / Executes code` 过滤；没有像 skill 页面那样明确公开 `downloads / stars / installs` 三套排序。因此 plugin 爆款判断应该回到真实可见面：目录曝光、类型过滤、验证状态、安全扫描、运行时边界和作者工厂。

## 关键发现

1. 当前 plugin 页面最强的公开分发表面不是“三榜”，而是目录曝光位次加上类型/信任过滤。
2. Code plugin 仍然是主流形态，但 Bundle plugin 适合承接说明型、跨宿主或低运行时耦合的分发层。
3. 能过 source-linked、scan clean、README/manifest/runtime 一致性的插件，冷启动信任成本明显更低。
4. `Executes code` 并不是坏事本身，但它会提高用户审查阈值，所以副作用、权限和远程依赖必须写清楚。
5. 高产作者的优势仍然来自“围绕一个系统边界连续发相邻插件”，而不是随机发散。
6. 最适合继续做 AISA API 的方向，依然是安全治理、业务增长、支付链路、存储物流和外部 SaaS 连接器。

## 公开目录前 10

| 排名 | Plugin | 作者 | 类型 | 信号 |
| --- | --- | --- | --- | --- |
| 1 | Seedance Story Director | zuoanco | Code | #1 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 2 | Zalo Group Moderation | tuanminhhole | Code | #2 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 3 | Package | ljqdh | Code | #3 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 4 | Gralkor Memory (OpenClaw) | elimydlarz | Code | #4 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 5 | Memnode Openclaw Plugin | pbudzik | Code | #5 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 6 | Openclaw | zc277584121 | Code | #6 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 7 | Kichi Forwarder | xiaoxinshi001 | Code | #7 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 8 | klodi | blackbak | Code | #8 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 9 | Claw Recipes | rjdjohnston | Code | #9 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 10 | Plugin | dearken10 | Code | #10 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |

## Code plugins 过滤面前 10

| 排名 | Plugin | 作者 | 类型 | 信号 |
| --- | --- | --- | --- | --- |
| 1 | Seedance Story Director | zuoanco | Code | #1 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 2 | Zalo Group Moderation | tuanminhhole | Code | #2 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 3 | Package | ljqdh | Code | #3 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 4 | Gralkor Memory (OpenClaw) | elimydlarz | Code | #4 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 5 | Memnode Openclaw Plugin | pbudzik | Code | #5 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 6 | Openclaw | zc277584121 | Code | #6 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 7 | Kichi Forwarder | xiaoxinshi001 | Code | #7 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 8 | klodi | blackbak | Code | #8 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 9 | Claw Recipes | rjdjohnston | Code | #9 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 10 | Plugin | dearken10 | Code | #10 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |

## Bundle plugins 过滤面前 10

| 排名 | Plugin | 作者 | 类型 | 信号 |
| --- | --- | --- | --- | --- |
| 1 | appstore-skill | rainsunsun | Bundle | #12 / pending / 详情页公开计数缺失 |
| 2 | pskoettselfimproving | pierrelouisevensmaxai-blip | Bundle | #14 / source-linked / pending / 详情页公开计数缺失 |
| 3 | summitentertainmentstudio | pierrelouisevensmaxai-blip | Bundle | #17 / source-linked / pending / 详情页公开计数缺失 |
| 4 | Install Hirey Hi on OpenClaw | yzlee | Bundle | #18 / source-linked / pending / 详情页公开计数缺失 |
| 5 | pierrelouisevensmaxai-blip | pierrelouisevensmaxai-blip | Bundle | #34 / pending / 详情页公开计数缺失 |
| 6 | AI Image Generator & Editor — Nanobanana, GPT Image, ComfyUI | jau123 | Bundle | #46 / source-linked / pending / 详情页公开计数缺失 |
| 7 | Aaron SEO GEO | aaron-he-zhu | Bundle | #47 / source-linked / clean / 详情页公开计数缺失 |

## Verified only 过滤面前 10

| 排名 | Plugin | 作者 | 类型 | 信号 |
| --- | --- | --- | --- | --- |
| 1 | Seedance Story Director | zuoanco | Code | #1 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 2 | Zalo Group Moderation | tuanminhhole | Code | #2 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 3 | Package | ljqdh | Code | #3 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 4 | Gralkor Memory (OpenClaw) | elimydlarz | Code | #4 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 5 | Memnode Openclaw Plugin | pbudzik | Code | #5 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 6 | Openclaw | zc277584121 | Code | #6 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 7 | Kichi Forwarder | xiaoxinshi001 | Code | #7 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 8 | klodi | blackbak | Code | #8 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 9 | Claw Recipes | rjdjohnston | Code | #9 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 10 | Plugin | dearken10 | Code | #10 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |

## Executes code 过滤面前 10

| 排名 | Plugin | 作者 | 类型 | 信号 |
| --- | --- | --- | --- | --- |
| 1 | Seedance Story Director | zuoanco | Code | #1 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 2 | Zalo Group Moderation | tuanminhhole | Code | #2 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 3 | Package | ljqdh | Code | #3 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 4 | Gralkor Memory (OpenClaw) | elimydlarz | Code | #4 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 5 | Memnode Openclaw Plugin | pbudzik | Code | #5 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 6 | Openclaw | zc277584121 | Code | #6 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 7 | Kichi Forwarder | xiaoxinshi001 | Code | #7 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 8 | klodi | blackbak | Code | #8 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 9 | Claw Recipes | rjdjohnston | Code | #9 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 10 | Plugin | dearken10 | Code | #10 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |

## 综合优先级 Top 10

| 排名 | Plugin | 作者 | 分数 | 信号 |
| --- | --- | --- | --- | --- |
| 1 | Package | ljqdh | 138 | #3 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 2 | Zalo Group Moderation | tuanminhhole | 135 | #2 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 3 | Openclaw | zc277584121 | 134 | #6 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 4 | Plugin | dearken10 | 130 | #10 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 5 | Memnode Openclaw Plugin | pbudzik | 129 | #5 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 6 | klodi | blackbak | 129 | #8 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 7 | Hivemind | kaghni | 125 | #16 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 8 | Watcher Channel | orulink | 124 | #11 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |
| 9 | Thunder Openclaw Plugin | joshuawatkins04 | 119 | #15 / source-linked / pending / 执行代码 / 详情页公开计数缺失 |
| 10 | AIsa Twitter API | bibaofeng | 116 | #19 / source-linked / clean / 执行代码 / 详情页公开计数缺失 |

## 爆款作者画像

| 排名 | 作者 | 插件数 | Code | Bundle | 主主题 |
| --- | --- | --- | --- | --- | --- |
| 1 | bibaofeng | 5 | 5 | 0 | Workflow & Integration / Channels & Messaging / Infrastructure & Utilities |
| 2 | baofeng-tech | 4 | 4 | 0 | Infrastructure & Utilities / Channels & Messaging |
| 3 | aisadocs | 3 | 3 | 0 | Infrastructure & Utilities / Workflow & Integration |
| 4 | pierrelouisevensmaxai-blip | 3 | 0 | 3 | Infrastructure & Utilities |
| 5 | ljqdh | 1 | 1 | 0 | Infrastructure & Utilities |
| 6 | tuanminhhole | 1 | 1 | 0 | Memory & Knowledge |
| 7 | zc277584121 | 1 | 1 | 0 | Memory & Knowledge |
| 8 | dearken10 | 1 | 1 | 0 | Channels & Messaging |
| 9 | blackbak | 1 | 1 | 0 | Workspace & App Layer |
| 10 | pbudzik | 1 | 1 | 0 | Memory & Knowledge |

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

## 平台机制

- 当前公开可验证的 plugin 分发表面：目录顺序、Code / Bundle、Verified only、Executes code。
- 详情页信任表面：source-linked、Security Scan、VirusTotal、OpenClaw verdict、runtimeId、capability tags、compatibility。
- 组合判断时，目录顺序只是一层；真正影响安装的是验证、扫描、副作用说明和能力边界是否一致。
- 本次输出基于 live 页面抓取完成。

## 发布动作

- 不要再把 plugin 包装成“冲三榜”，而要围绕真实过滤面优化：类型边界清楚、验证来源清楚、副作用清楚。
- 标题必须直接点系统、动作或结果，例如 channel、security、parcel、payment，而不是抽象概念名。
- Code plugin 和 Bundle plugin 要按真实运行时边界拆，不要为方便打包而混淆类型。
- 同一作者主线上持续发相邻插件，比单次爆款更容易积累分发资产。
