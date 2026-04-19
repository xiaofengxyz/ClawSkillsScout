---
name: x-intelligence-automation-zh
description: "通过 AISA relay 执行 X/推特情报与增长工作流。触发条件：当用户需要推文搜索、监控、发帖、点赞、关注或市场情报且只想用一个 API key 时使用。支持读接口、OAuth 发布和互动动作。"
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

# X 推特情报与自动化中文包

面向 cn.clawhub-mirror.com 的中文发布版，用于通过 AISA relay 执行 X/推特监控、情报研究、发帖与互动。

## When to use

- 当用户更关注监控、情报研究和竞品追踪，而不只是单次搜索。
- 当工作流需要一个包同时覆盖读、发帖和互动。
- 当任务适合分析师、运营或竞品监控场景，并由 `AISA_API_KEY` 驱动。

## When NOT to use

- 不适合需要 cookie 提取、密码登录或完全本地化推特客户端的场景。
- 不适合必须避免 relay 网络调用或避免通过 `api.aisa.one` 上传媒体的场景。
- 不适合依赖未文档化 secret 或浏览器导出凭证的场景。

## Quick Reference

- 必需环境变量：`AISA_API_KEY`
- 读客户端：`./scripts/twitter_client.py`
- 发帖客户端：`./scripts/twitter_oauth_client.py`
- 互动客户端：`./scripts/twitter_engagement_client.py`
- 参考文档：`./references/post_twitter.md`、`./references/engage_twitter.md`

## Setup

```bash
export AISA_API_KEY="your-key"
```

默认所有网络调用都会发往 `https://api.aisa.one/apis/v1/...`。

## Capabilities

- 读取用户、推文、趋势、列表、社区和 Spaces 数据。
- 在明确 OAuth 授权后发布文本、图片和视频推文。
- 通过互动客户端执行点赞、取消点赞、关注和取消关注。
- 优先复用 OpenClaw 上下文，而不是依赖本地持久化会话文件。

## 高意图工作流

- 监控创作者、竞品和趋势后再采取行动。
- 搜索一个赛道，找出关键账号，再在确认后关注或互动。
- 把它当成 X/Twitter 情报台来用。

## Common Commands

```bash
python3 {baseDir}/scripts/twitter_client.py search --query "AI agents" --type Latest
python3 {baseDir}/scripts/twitter_oauth_client.py authorize
python3 {baseDir}/scripts/twitter_oauth_client.py post --text "Hello from OpenClaw"
python3 {baseDir}/scripts/twitter_engagement_client.py like-latest --user "@elonmusk"
python3 {baseDir}/scripts/twitter_engagement_client.py follow-user --user "@elonmusk"
```

## Posting and Engagement Workflow

- 发帖、回复、引用、媒体上传遵循 `./references/post_twitter.md`。
- 点赞、取消点赞、关注、取消关注遵循 `./references/engage_twitter.md`。
- 任意写操作前都必须先完成 OAuth 授权。

## 示例请求

- “帮我监控 X 上 AI coding 赛道，找出最值得跟踪的账号。”
- “搜索一个垂类并总结讨论，再关注几个关键操盘手。”
- “把 X 情报自动化作为研究和行动的一体化 workflow。”

## ClawHub Suspicious Review Notes

- 该包基于 relay：读请求、OAuth 请求、互动动作和已批准的媒体上传都会发送到 `api.aisa.one`。
- 该包坚持 API key 方式：只需要 `AISA_API_KEY`，不要求密码、cookie、`CT0` 或其他 legacy secret。
- 发布包保持最小运行时结构：保留 `SKILL.md`、`scripts/` 和必要参考文档，不包含 `README.md`、`_meta.json` 等非运行时文件。
- 包内不包含 cache sync、自安装、home 目录持久化、浏览器 cookie 提取或外部 agent CLI 包装器。
- 打开浏览器授权是可选能力，不是默认流程；默认优先返回授权链接给上层工作流。

## Release Bundle Notes

- `scripts/twitter_client.py` 保留了原始包的读接口能力。
- `scripts/twitter_oauth_client.py` 保留了原始包的 OAuth 和发帖能力。
- `scripts/twitter_engagement_client.py` 保留了原始包的点赞、取消点赞、关注与取消关注能力。
- 本次优化只针对发布元数据与上传安全性，不改变运行逻辑。
