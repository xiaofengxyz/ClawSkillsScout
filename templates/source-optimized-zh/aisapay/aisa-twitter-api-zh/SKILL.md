---
name: aisa-twitter-api-zh
description: "通过 AISA 官方 relay 执行 X/推特从研究到发帖的完整 API 工作流。触发条件：当用户需要用一个 AISA_API_KEY 完成资料查询、推文搜索、趋势追踪、线程上下文或 OAuth 发帖时使用。支持账号情报、市场监控、引用/回复准备和图文媒体发布。"
metadata:
  aisa:
    emoji: "🐦"
    requires:
      bins:
        - python3
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# AISA 推特 API 指挥台

AISA 官方优先的 X/推特工作台，用一个 API key 完成账号情报、实时对话研究与经授权的发帖。

## 何时使用

- 当你要用 AISA 官方旗舰 skill 处理 X/推特研究、监控和发帖。
- 当工作流需要先做账号或话题研究，再无缝进入授权发布。
- 当任务需要结构化 JSON 结果，用于搜索、趋势、资料查询、线程上下文或引用/回复准备。

## 不适用场景

- 不适合需要 cookie 提取、浏览器凭证抓取、直接密码登录的场景。
- 不适合必须避免把请求、OAuth 状态或媒体上传发送到 `api.aisa.one` 的场景。
- 不适合点赞、关注、刷互动等动作；这类需求不在本包范围内。

## 快速参考

- 必需环境变量：`AISA_API_KEY`
- 读客户端：`./scripts/twitter_client.py`
- OAuth 与发帖客户端：`./scripts/twitter_oauth_client.py`
- 发帖说明：`./references/post_twitter.md`

## 设置

```bash
export AISA_API_KEY="your-key"
```

默认所有网络调用都会发往 `https://api.aisa.one/apis/v1/...`。

## 能力范围

- 账号情报：资料查询、about 信息、推文、提及、粉丝、关注、认证粉丝与关注关系检查。
- 对话情报：高级搜索、推文详情、回复、引用、转推者、文章内容与完整线程上下文。
- 发现入口：趋势、用户搜索、列表、社区和 Spaces。
- 授权发帖：授权链接、文本发帖、媒体发帖、引用发帖、回复线程和长文自动拆分。

## 输入与输出

- 输入：用户名、搜索词、tweet ID 或 URL、可选本地媒体文件、明确的发帖文本。
- 读取输出：搜索、资料、趋势、线程和发现接口返回的 JSON 结果。
- 发帖输出：授权链接、relay 响应、tweet ID 和发布状态。

## 高意图工作流

- 在触达前研究创作者、创始人或竞品账号。
- 先扫描产品发布、品牌或主题讨论，再看线程上下文决定是否回应。
- 先查趋势和证据，再准备一条获批后可直接发出的内容。
- 用明确的 OAuth 批准和工作区媒体文件做引用或回复发帖。

## 常用命令

```bash
python3 {baseDir}/scripts/twitter_client.py user-info --username elonmusk
python3 {baseDir}/scripts/twitter_client.py search --query "AI agents" --type Latest
python3 {baseDir}/scripts/twitter_client.py thread --tweet-id 1888888888888888888
python3 {baseDir}/scripts/twitter_oauth_client.py authorize
python3 {baseDir}/scripts/twitter_oauth_client.py post --text "My take on this" --type quote --quote-tweet-url "https://x.com/example/status/1888888888888888888"
python3 {baseDir}/scripts/twitter_oauth_client.py post --text "Shipping day" --media-file ./workspace/launch.png
```

## 发帖工作流

当用户要求发送、发布、引用或回复 X/推特内容时，遵循 `./references/post_twitter.md`。

- 如果尚未完成授权，先返回授权链接。
- 仅在用户提供本地工作区文件时使用 `--media-file`。
- 引用发帖必须提供原 tweet URL；回复外部 tweet 必须提供目标 tweet ID。
- 未拿到 relay 成功返回前，不要宣称已经发出。

## 示例请求

- “研究这个 X 账号，告诉我他主要聊什么、经常和谁互动、值不值得回复。”
- “搜索过去 24 小时 AI agent launch 的讨论，给我高信号推文和线程上下文。”
- “看下全球 X 趋势，告诉我哪些和我们的产品类别有关。”
- “在 OAuth 完成后，用我的评论去引用这条 tweet。”
- “使用工作区里的本地图片，帮我发一条简短的上线推文。”

## ClawHub Suspicious 审核说明

- 该包基于 relay：读请求、OAuth 请求和已批准的媒体上传都会发送到 `api.aisa.one`。
- 该包坚持 `AISA_API_KEY` 方式：不要求密码、cookie、`CT0` 或其他旧式密钥。
- 发布包保持最小运行时结构：保留 `SKILL.md`、`scripts/` 和发帖参考文档，不包含 `README.md`、`_meta.json` 等非运行时文件。
- 包内不包含 cache sync、自安装、home 目录持久化、浏览器 cookie 提取或外部 agent CLI 包装器。
- 打开浏览器授权是可选能力，不是默认流程；默认优先返回授权链接给 OpenClaw 等宿主。

## 发布包说明

- `scripts/twitter_client.py` 保留了原始包的读接口能力。
- `scripts/twitter_oauth_client.py` 保留了原始包的 OAuth 和发帖能力。
- 本次优化只针对发布元数据与上传安全性，不改变运行逻辑。
