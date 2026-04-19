---
name: openclaw-aisa-youtube-zh
description: "通过 AISA YouTube 接口查询 YouTube 视频、频道和播放列表。触发条件：当用户需要 YouTube 搜索、结果扩展、分页或中文查询且不想管理 Google 凭证时使用。支持搜索过滤、地区语言参数和结构化 SERP 结果。"
metadata:
  aisa:
    emoji: "🎬"
    requires:
      bins:
        - curl
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# YouTube 搜索 API

轻量级 YouTube 搜索技能，用一个 AISA API key 就能完成视频、频道、播放列表和地区语言过滤查询。

## 适用场景

- 当用户需要快速查一个主题在 YouTube 上的搜索结果。
- 当任务重点是地区、语言、分页过滤，而不是深入竞品研究。
- 当工作流希望用 curl 直接拿结构化结果，不想额外维护 Google 凭证。

## 不适用场景

- 不适合浏览器自动化、本地抓取或直接对 YouTube 账号执行操作。
- 不适合必须避免把搜索请求发送到 `api.aisa.one` 的场景。
- 不适合依赖本包之外本地辅助脚本的场景。

## 快速参考

- 必需环境变量：`AISA_API_KEY`
- 接口地址：`https://api.aisa.one/apis/v1/youtube/search`
- 该包是 curl 优先方案，不包含本地 Python 客户端。

## 安装准备

```bash
export AISA_API_KEY="YOUR_AISA_API_KEY"
```

## 常用命令

```bash
curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=machine+learning+tutorial" \
  -H "Authorization: Bearer $AISA_API_KEY"

curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=AI+news&gl=us&hl=en" \
  -H "Authorization: Bearer $AISA_API_KEY"

curl -s "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=python+tutorial&sp=EgIQAQ%3D%3D" \
  -H "Authorization: Bearer $AISA_API_KEY"
```

## 核心能力

- 用 `q` 执行基础 YouTube SERP 搜索
- 用 `gl` 和 `hl` 做地区与语言过滤
- 用 `sp` 继续分页或收窄搜索
- 返回结构化结果，通常包含 `videos` 或分组后的 `sections`

## 高意图工作流

- 快速验证某个关键词是否值得继续做视频或投放。
- 先查一个国家结果，再切另一个国家看差异。
- 作为更大研究链路里的“第一跳搜索 API”。

## 示例请求

- “查一下 AI coding tutorials 在 YouTube 上的结果。”
- “把同一个关键词在美国和日本的搜索结果各给我一份。”
- “我只想快速看结构化结果，不需要竞品分析流程。”

## ClawHub Suspicious Review Notes

- 该包基于 relay：所有搜索请求都会发送到 `api.aisa.one`。
- 该包坚持 API key 方式：只需要 `AISA_API_KEY`，不要求密码、cookie、浏览器数据或其他 legacy secret。
- 发布包保持最小运行时结构：保留 `SKILL.md` 和 `LICENSE.txt`，不包含 `README.md`、`_meta.json` 等非运行时文件。
- 包内不包含浏览器自动化、cache sync、home 目录持久化、cookie 提取或外部 agent CLI 包装器。

## Release Bundle Notes

- 搜索行为与原始包保持一致。
- 这次调整只涉及发布裁剪和更清晰的中文发布元数据。
