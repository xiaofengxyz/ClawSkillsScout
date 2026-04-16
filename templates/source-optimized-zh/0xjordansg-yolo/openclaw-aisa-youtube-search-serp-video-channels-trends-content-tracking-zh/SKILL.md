---
name: openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking-zh
description: 通过 AISA YouTube SERP 客户端搜索 YouTube 视频、频道和趋势。触发条件：当用户需要内容研究、竞品频道追踪、趋势发现或中文搜索且不想管理 Google 凭证时使用。支持 curl 查询和内置 Python 客户端，并带地区语言过滤。
homepage: https://openclaw.ai
version: "1.0.1"
author: 0xjordansg-yolo
license: MIT-0
user-invocable: true
primaryEnv: AISA_API_KEY
requires:
  bins:
    - curl
    - python3
  env:
    - AISA_API_KEY
metadata:
  openclaw:
    emoji: "📺"
    requires:
      bins:
        - curl
        - python3
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
---

# OpenClaw YouTube SERP 中文包

面向 cn.clawhub-mirror.com 的中文发布版，用于通过 AISA relay 执行 YouTube 搜索、竞品研究和趋势发现。

## When to use

- 当用户需要 YouTube 内容研究、频道发现、竞品跟踪或趋势监控。
- 当工作流希望复用内置 Python 客户端执行多次查询。
- 当任务可以接受使用 `AISA_API_KEY`，而不直接管理 Google API 凭证。

## When NOT to use

- 不适合浏览器自动化、本地爬取或 YouTube 账号级操作。
- 不适合必须避免把搜索请求发送到 `api.aisa.one` 的场景。
- 不适合依赖本发布包之外文件的场景。

## Quick Reference

- 必需环境变量：`AISA_API_KEY`
- 接口地址：`https://api.aisa.one/apis/v1/youtube/search`
- Python 客户端：`./scripts/youtube_client.py`

## Setup

```bash
export AISA_API_KEY="your-key"
```

## Common Commands

```bash
curl "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=AI+agents+tutorial" \
  -H "Authorization: Bearer $AISA_API_KEY"

python3 {baseDir}/scripts/youtube_client.py search --query "AI agents tutorial"
python3 {baseDir}/scripts/youtube_client.py search --query "machine learning" --country us
python3 {baseDir}/scripts/youtube_client.py competitor --name "OpenAI" --topic "GPT tutorial"
```

## Capabilities

- 用 `q` 搜索视频、频道和播放列表
- 用 `gl` 按国家过滤、用 `hl` 按语言过滤
- 复用 `sp` token 做分页或 SERP 收窄
- 用内置 Python 客户端执行竞品研究和 top video 查询

## ClawHub Suspicious Review Notes

- 该包基于 relay：所有搜索请求都会发送到 `api.aisa.one`。
- 该包坚持 API key 方式：只需要 `AISA_API_KEY`，不要求密码、cookie、浏览器数据或其他 legacy secret。
- 发布包保持最小运行时结构：保留 `SKILL.md` 和 `scripts/youtube_client.py`，不包含 `README.md`、`_meta.json` 等非运行时文件。
- 包内不包含浏览器自动化、cache sync、home 目录持久化、cookie 提取或外部 agent CLI 包装器。

## Release Bundle Notes

- `scripts/youtube_client.py` 保留了原始包的运行逻辑。
- 搜索能力、竞品研究能力和命令面保持不变。
- 这次调整只涉及发布裁剪和更清晰的中文发布元数据。
