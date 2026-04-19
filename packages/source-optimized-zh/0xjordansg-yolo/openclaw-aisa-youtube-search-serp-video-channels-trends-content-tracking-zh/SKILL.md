---
name: openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking-zh
description: "通过 AISA YouTube SERP 客户端搜索 YouTube 视频、频道和趋势。触发条件：当用户需要内容研究、竞品频道追踪、趋势发现或中文搜索且不想管理 Google 凭证时使用。支持 curl 查询和内置 Python 客户端，并带地区语言过滤。"
metadata:
  aisa:
    emoji: "📺"
    requires:
      bins:
        - curl
        - python3
      env:
        - AISA_API_KEY
    primaryEnv: AISA_API_KEY
    compatibility:
      - openclaw
      - claude-code
      - hermes
---

# YouTube SERP 侦察台

高意图 YouTube 研究技能，用于通过 AISA relay 做选题验证、竞品频道扫描、趋势发现和区域对比。

## 适用场景

- 当用户想判断某个关键词在 YouTube 上到底是谁在占据结果页。
- 当团队要做内容选题、频道研究、竞品监控或趋势追踪。
- 当工作流需要内置 Python 客户端连续跑多次查询，而不想自己管理 Google 凭证。

## 不适用场景

- 不适合浏览器自动化、本地爬取或 YouTube 账号级操作。
- 不适合必须避免把搜索请求发送到 `api.aisa.one` 的场景。
- 不适合依赖本发布包之外文件的场景。

## 快速参考

- 必需环境变量：`AISA_API_KEY`
- 接口地址：`https://api.aisa.one/apis/v1/youtube/search`
- Python 客户端：`./scripts/youtube_client.py`

## 安装准备

```bash
export AISA_API_KEY="your-key"
```

## 常用命令

```bash
curl "https://api.aisa.one/apis/v1/youtube/search?engine=youtube&q=AI+agents+tutorial" \
  -H "Authorization: Bearer $AISA_API_KEY"

python3 {baseDir}/scripts/youtube_client.py search --query "AI agents tutorial"
python3 {baseDir}/scripts/youtube_client.py search --query "machine learning" --country us
python3 {baseDir}/scripts/youtube_client.py competitor --name "OpenAI" --topic "GPT tutorial"
```

## 核心能力

- 用 `q` 搜索视频、频道和播放列表
- 用 `gl` 按国家过滤、用 `hl` 按语言过滤
- 复用 `sp` token 做分页或 SERP 收窄
- 用内置 Python 客户端执行竞品研究和 top video 查询

## 高意图工作流

- 先搜一个主题，判断哪些视频和频道长期占位。
- 输入竞品名称和主题，快速判断对方重点覆盖了哪些内容方向。
- 对比不同国家和语言结果，验证是否值得本地化做内容。

## 示例请求

- “帮我搜索 AI agents，在 YouTube 上谁排得最靠前？”
- “研究 OpenAI 相关频道，看看它们主要靠哪些主题拿流量。”
- “比较美国和日本对同一个关键词的 YouTube 结果差异。”

## ClawHub Suspicious Review Notes

- 该包基于 relay：所有搜索请求都会发送到 `api.aisa.one`。
- 该包坚持 API key 方式：只需要 `AISA_API_KEY`，不要求密码、cookie、浏览器数据或其他 legacy secret。
- 发布包保持最小运行时结构：保留 `SKILL.md` 和 `scripts/youtube_client.py`，不包含 `README.md`、`_meta.json` 等非运行时文件。
- 包内不包含浏览器自动化、cache sync、home 目录持久化、cookie 提取或外部 agent CLI 包装器。

## Release Bundle Notes

- `scripts/youtube_client.py` 保留了原始包的运行逻辑。
- 搜索能力、竞品研究能力和命令面保持不变。
- 这次调整只涉及发布裁剪和更清晰的中文发布元数据。
