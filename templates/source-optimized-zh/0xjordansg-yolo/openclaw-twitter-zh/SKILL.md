---
name: openclaw-twitter-zh
description: 通过 AISA relay 查询 X/推特资料、推文、趋势、列表、社区和 Spaces，并在 OAuth 授权后发布内容。触发条件：当用户需要推特搜索、监控、发帖且不想暴露密码时使用。支持读接口、授权链接和图文媒体发布。
homepage: https://openclaw.ai
author: 0xjordansg-yolo
user-invocable: true
requires:
  bins:
    - python3
  env:
    - AISA_API_KEY
metadata:
  openclaw:
    emoji: "🐦"
    requires:
      bins:
        - python3
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
    files:
      - "scripts/*"
      - "references/*"
---

# OpenClaw 推特中文包

面向 cn.clawhub-mirror.com 的中文发布版，用于通过 AISA relay 执行 X/推特检索与发帖。

## When to use

- 当用户要查询 X/推特账号资料、时间线、提及、粉丝、搜索结果、趋势、列表、社区或 Spaces。
- 当用户要在完成 OAuth 授权后发帖，但又不希望共享密码或 cookie。
- 当工作流需要使用 `AISA_API_KEY` 驱动的 Python 客户端重复执行推特研究与发帖任务。

## When NOT to use

- 不适合需要 cookie 提取、浏览器凭证抓取、直接密码登录的场景。
- 不适合必须避免把请求、OAuth 状态或媒体上传发送到 `api.aisa.one` 的场景。
- 不适合点赞、关注等互动操作；这类动作请改用带 engage 的包。

## Quick Reference

- 必需环境变量：`AISA_API_KEY`
- 读客户端：`./scripts/twitter_client.py`
- 发帖说明：`./references/post_twitter.md`

## Setup

```bash
export AISA_API_KEY="your-key"
```

默认所有网络调用都会发往 `https://api.aisa.one/apis/v1/...`。

## Capabilities

- 读取用户资料、时间线、提及、粉丝、关注、认证粉丝与关注关系。
- 搜索推文和用户，查看回复、引用、转推者、线程上下文与 Spaces。
- 在明确 OAuth 授权后发布文本、图片和视频推文。
- 当内容过长时，自动按线程拆分发布。

## Common Commands

```bash
python3 {baseDir}/scripts/twitter_client.py user-info --username elonmusk
python3 {baseDir}/scripts/twitter_client.py search --query "AI agents" --type Latest
python3 {baseDir}/scripts/twitter_client.py trends --woeid 1
python3 {baseDir}/scripts/twitter_oauth_client.py status
python3 {baseDir}/scripts/twitter_oauth_client.py authorize
python3 {baseDir}/scripts/twitter_oauth_client.py post --text "Hello from OpenClaw"
```

## Posting Workflow

当用户要求发送、发布、回复或引用 X/推特内容时，遵循 `./references/post_twitter.md`。

- 如果尚未完成授权，先返回授权链接。
- 仅在用户提供本地文件时使用 `--media-file`。
- 不要臆造文案、远程图片 URL 或额外媒体附件。

## ClawHub Suspicious Review Notes

- 该包基于 relay：读请求、OAuth 请求和已批准的媒体上传都会发送到 `api.aisa.one`。
- 该包坚持 API key 方式：只需要 `AISA_API_KEY`，不要求密码、cookie、`CT0` 或其他 legacy secret。
- 发布包保持最小运行时结构：保留 `SKILL.md`、`scripts/` 和发帖参考文档，不包含 `README.md`、`_meta.json` 等非运行时文件。
- 包内不包含 cache sync、自安装、home 目录持久化、浏览器 cookie 提取或外部 agent CLI 包装器。
- 打开浏览器授权是可选能力，不是默认流程；默认优先返回授权链接给上层工作流。

## Release Bundle Notes

- `scripts/twitter_client.py` 保留了原始包的读接口能力。
- `scripts/twitter_oauth_client.py` 保留了原始包的 OAuth 和发帖能力。
- 本次优化只针对发布元数据与上传安全性，不改变运行逻辑。
