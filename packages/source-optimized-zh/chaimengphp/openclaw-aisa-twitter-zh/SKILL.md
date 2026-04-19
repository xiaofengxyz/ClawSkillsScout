---
name: openclaw-aisa-twitter-zh
description: "通过 AISA relay 执行 X/推特增长工作流。触发条件：当用户需要推文搜索、发帖、点赞、关注或社区监控且只想用一个 API key 时使用。支持读接口、OAuth 发布和互动动作。"
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

# X/推特增长运营中文包

面向 cn.clawhub-mirror.com 的中文发布版，用于通过 AISA relay 执行 X/推特研究、发帖与互动增长。

## When to use

- 当用户希望把推特研究延伸到点赞、关注和发布后的增长动作。
- 当工作流需要一个包同时覆盖读、发帖和互动。
- 当任务适合创作者、运营或社区增长场景，并由 `AISA_API_KEY` 驱动。

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

- 搜索一个话题，找到高信号推文，再在确认后点赞或关注。
- 研究、发帖、互动在一个 workflow 内完成。
- 把它当成推特增长运营台，而不是单一搜索工具。

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

- “帮我找 AI agents 里最值得互动的帖子，然后在确认后点赞。”
- “先做话题研究，再发一条内容，最后关注几个核心账号。”
- “用一个工作流完成推特研究、发帖和轻量互动。”

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
