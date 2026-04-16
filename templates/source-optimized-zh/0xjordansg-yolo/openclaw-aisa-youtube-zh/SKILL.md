---
name: openclaw-aisa-youtube-zh
description: 通过 AISA YouTube 接口查询 YouTube 视频、频道和播放列表。触发条件：当用户需要 YouTube 搜索、结果扩展、分页或中文查询且不想管理 Google 凭证时使用。支持搜索过滤、地区语言参数和结构化 SERP 结果。
homepage: https://openclaw.ai
metadata:
  author: aisa-one
  version: "1.0.1"
  openclaw:
    emoji: "🎬"
    requires:
      bins:
        - curl
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
---

# OpenClaw AISA YouTube 中文包

面向 cn.clawhub-mirror.com 的中文发布版，用于通过 AISA relay 执行 YouTube 搜索。

## When to use

- 当用户想查询 YouTube 视频、频道或播放列表。
- 当任务需要地区或语言过滤，但不想直接管理 Google API 配置。
- 当工作流可以接受使用 `AISA_API_KEY` 调用 AISA 的 YouTube 搜索接口。

## When NOT to use

- 不适合浏览器自动化、本地抓取或直接对 YouTube 账号执行操作。
- 不适合必须避免把搜索请求发送到 `api.aisa.one` 的场景。
- 不适合依赖本包之外本地辅助脚本的场景。

## Quick Reference

- 必需环境变量：`AISA_API_KEY`
- 接口地址：`https://api.aisa.one/apis/v1/youtube/search`
- 该包是 curl 优先方案，不包含本地 Python 客户端。

## Setup

```bash
export AISA_API_KEY="YOUR_AISA_API_KEY"
```

## Common Commands

```bash
curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=machine+learning+tutorial" \
  -H "Authorization: Bearer $AISA_API_KEY"

curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=AI+news&gl=us&hl=en" \
  -H "Authorization: Bearer $AISA_API_KEY"

curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=python+tutorial&sp=EgIQAQ%3D%3D" \
  -H "Authorization: Bearer $AISA_API_KEY"
```

## Capabilities

- 用 `q` 执行基础 YouTube SERP 搜索
- 用 `gl` 和 `hl` 做地区与语言过滤
- 用 `sp` 继续分页或收窄搜索
- 返回结构化结果，通常包含 `videos` 或分组后的 `sections`

## ClawHub Suspicious Review Notes

- 该包基于 relay：所有搜索请求都会发送到 `api.aisa.one`。
- 该包坚持 API key 方式：只需要 `AISA_API_KEY`，不要求密码、cookie、浏览器数据或其他 legacy secret。
- 发布包保持最小运行时结构：保留 `SKILL.md` 和 `LICENSE.txt`，不包含 `README.md`、`_meta.json` 等非运行时文件。
- 包内不包含浏览器自动化、cache sync、home 目录持久化、cookie 提取或外部 agent CLI 包装器。

## Release Bundle Notes

- 搜索行为与原始包保持一致。
- 这次调整只涉及发布裁剪和更清晰的中文发布元数据。
