# ClawHub 多榜单爆款系统报告（AISA 机会版）

- 生成时间：2026-04-24T11:01:21.740684+00:00
- 数据样本：downloads / stars / installs 各取 Top 100
- 数据来源：https://clawhub.ai/skills?sort=downloads&dir=desc、https://clawhub.ai/skills?sort=stars&dir=desc、https://clawhub.ai/skills?sort=installs&dir=desc

## 一、老板先看这 6 句
- 下载榜、星标榜、安装榜的头部技能高度重合，说明真正的爆款不是“偶发标题党”，而是兼具被发现、被收藏、被长期装着用三种能力。
- 头部名字几乎都在直接说任务或结果，例如 Github、Weather、Browser、Skill Vetter、Self-Improving；用户一眼就知道为什么装。
- 下载榜更偏“宽需求入口”，星标榜更偏“方法论和身份感”，安装榜更偏“持续复用的日常工具”。
- 头部作者并不是靠单个 skill 爆，而是在运营作品集：一个能力核，多个高意图变体，持续迭代。
- 仓库里的 7 个 AISA runtime 包目前整体不在三榜 Top 100，问题不在 API 能力缺失，而在包装、选题、分层和命名没有进入主流搜索心智。
- 本地第一优先旗舰包应该先打 `aisa-twitter-api`：它在本地 AISA 包里安装转化最强，也最适合做成 AISA 官方代表作。

## 二、三张榜分别说明了什么

### 1. 下载榜：谁最容易被点进来
- 前三名分别是 `Skill Vetter`、`Self-Improving + Proactive Agent`、`ontology`。
- 下载榜 Top 20 的主题集中在：Utility / Other 7个, Self-Improving / Agentic 6个, Search / Research 6个, Developer / GitHub 1个。
- 结论：下载靠的是清晰标题、通用入口、低试错成本，不一定最深，但一定最容易第一次装。

| 下载榜 Top 10 | 作者 | 下载 | 星标 | 安装 |
| --- | --- | --- | --- | --- |
| 1. Skill Vetter | spclaudehome | 219735 | 960 | 4073 |
| 2. Self-Improving + Proactive Agent | ivangdavila | 171978 | 1004 | 1831 |
| 3. ontology | oswalpalash | 170492 | 560 | 1184 |
| 4. Github | steipete | 163764 | 535 | 4077 |
| 5. Gog | steipete | 161529 | 849 | 3352 |
| 6. Proactive Agent | halthelobster | 147962 | 726 | 2721 |
| 7. Weather | steipete | 139283 | 366 | 3538 |
| 8. Polymarket | joelchance | 134026 | 93 | 28 |
| 9. Multi Search Engine | gpyangyoujun | 127456 | 602 | 1840 |
| 10. AdMapix | fly0pants | 106542 | 274 | 257 |

### 2. 星标榜：谁最容易让人觉得“这东西有方法论”
- 前三名分别是 `Self-Improving + Proactive Agent`、`Skill Vetter`、`Gog`。
- 星标榜 Top 20 的主题集中在：Utility / Other 9个, Self-Improving / Agentic 5个, Search / Research 4个, Developer / GitHub 2个。
- 结论：星标榜奖励的是“愿景 + 方法 + 可信度”，因此带有 agent、自进化、工具哲学感的 skill 更容易被收藏。

| 星标榜 Top 10 | 作者 | 下载 | 星标 | 安装 |
| --- | --- | --- | --- | --- |
| 1. Self-Improving + Proactive Agent | ivangdavila | 171978 | 1004 | 1831 |
| 2. Skill Vetter | spclaudehome | 219735 | 960 | 4073 |
| 3. Gog | steipete | 161529 | 849 | 3352 |
| 4. Proactive Agent | halthelobster | 147962 | 726 | 2721 |
| 5. Multi Search Engine | gpyangyoujun | 127456 | 602 | 1840 |
| 6. Humanizer | biostartechnology | 95552 | 563 | 1279 |
| 7. ontology | oswalpalash | 170492 | 560 | 1184 |
| 8. Github | steipete | 163764 | 535 | 4077 |
| 9. Free Ride - Unlimited free AI | shaivpidadi | 58498 | 420 | 429 |
| 10. Auto-Updater Skill | maximeprades | 76762 | 377 | 1292 |

### 3. 安装榜：谁最容易留下来
- 前三名分别是 `Github`、`Skill Vetter`、`Weather`。
- 安装榜 Top 20 的主题集中在：Utility / Other 12个, Self-Improving / Agentic 3个, Search / Research 3个, Developer / GitHub 2个。
- 结论：安装榜最接近“长期驻留价值”。用户愿意长期保留的 skill，往往是低配置、高复用、每天都可能碰到的工具。

| 安装榜 Top 10 | 作者 | 下载 | 星标 | 安装 |
| --- | --- | --- | --- | --- |
| 1. Github | steipete | 163764 | 535 | 4077 |
| 2. Skill Vetter | spclaudehome | 219735 | 960 | 4073 |
| 3. Weather | steipete | 139283 | 366 | 3538 |
| 4. Gog | steipete | 161529 | 849 | 3352 |
| 5. Proactive Agent | halthelobster | 147962 | 726 | 2721 |
| 6. Sonoscli | steipete | 79251 | 50 | 2588 |
| 7. Nano Pdf | steipete | 94785 | 227 | 2385 |
| 8. Obsidian | steipete | 85459 | 349 | 2353 |
| 9. Skill Creator | chindden | 74142 | 255 | 2223 |
| 10. Notion | steipete | 79306 | 235 | 2224 |

## 三、综合起来，真正的爆款长什么样
- 真爆款往往同时上三榜，至少也会稳定出现在其中两榜。
- 它们共有三个特征：标题直接对准任务、第一次使用几乎不需要解释、用户能想象出复用场景。
- 另外一个明显规律是：爆款 skill 大多不靠大而全取胜，而是靠一个能力核拆出多个不同入口。

| 综合强势技能 | 作者 | 上榜次数 | 综合分 | 排名分布 |
| --- | --- | --- | --- | --- |
| Skill Vetter | spclaudehome | 3 | 298 | downloads:1, stars:2, installs:2 |
| Gog | steipete | 3 | 291 | downloads:5, stars:3, installs:4 |
| Github | steipete | 3 | 290 | downloads:4, stars:8, installs:1 |
| Proactive Agent | halthelobster | 3 | 288 | downloads:6, stars:4, installs:5 |
| Self-Improving + Proactive Agent | ivangdavila | 3 | 288 | downloads:2, stars:1, installs:12 |
| Weather | steipete | 3 | 282 | downloads:7, stars:11, installs:3 |
| Multi Search Engine | gpyangyoujun | 3 | 275 | downloads:9, stars:5, installs:14 |
| Obsidian | steipete | 3 | 262 | downloads:18, stars:15, installs:8 |
| ontology | oswalpalash | 3 | 261 | downloads:3, stars:7, installs:32 |
| Humanizer | biostartechnology | 3 | 259 | downloads:13, stars:6, installs:25 |

## 四、作者角度：谁在运营作品集，而不是只做一个 skill
- 头部作者的共同点不是“写得多”，而是“围绕某个能力核有稳定产出”。
- 他们的运营方式更像产品矩阵：旗舰入口包负责吸量，窄场景包负责吃转化，强概念包负责拿星标。

| 作者 | 上榜次数 | 综合分 | 最佳名次 | 作品集样本 |
| --- | --- | --- | --- | --- |
| steipete | 91 | 5591 | downloads:4, stars:3, installs:1 | Github, Gog, Weather |
| ivangdavila | 19 | 950 | downloads:2, stars:1, installs:12 | Self-Improving + Proactive Agent, Word / DOCX, Excel / XLSX |
| byungkyu | 7 | 305 | downloads:27, stars:12, installs:63 | API Gateway, Gmail, YouTube |
| ide-rea | 4 | 214 | downloads:19, stars:32, installs:53 | Baidu web search, Baidu Wenku AIPPT, baidu baike search |
| spclaudehome | 3 | 298 | downloads:1, stars:2, installs:2 | Skill Vetter, CrabNet |
| halthelobster | 3 | 288 | downloads:6, stars:4, installs:5 | Proactive Agent, PARA Second Brain |
| gpyangyoujun | 3 | 275 | downloads:9, stars:5, installs:14 | Multi Search Engine, uniqlo(优衣库)-product-query |
| oswalpalash | 3 | 261 | downloads:3, stars:7, installs:32 | ontology, Causal Inference |
| biostartechnology | 3 | 259 | downloads:13, stars:6, installs:25 |  |
| maximeprades | 3 | 249 | downloads:23, stars:10, installs:21 |  |

## 五、AISA 现有 runtime 包现状
- 本地 7 个 AISA runtime 包全部完成了新一轮 SKILL 改造：统一成 `metadata.aisa`、加了 compatibility、补了高意图工作流和示例请求，并同步到模板层。
- 但从市场位置看，它们整体距离三榜头部还有明显差距，说明下一步必须从“包装系统”继续推进到“选题分层 + 发布节奏 + 样板案例”。

| 本地 AISA skill | 作者 | 下载 | 星标 | 安装 | 优先级说明 |
| --- | --- | --- | --- | --- | --- |
| AIsa Twitter API (Search + Post) | aisapay | 3240 | 4 | 16 | 本地 AISA 包里安装转化最高，下载基础已被验证，AISA 品牌一致性最好，适合做旗舰包 |
| X/Twitter Automation: 30+ APIs, OAuth Post, One Key | 0xjordansg-yolo | 3562 | 4 | 12 | 下载基础已被验证 |
| YouTube SERP Scout for agents. Search top-ranking videos, channels, and trends for content research and competitor tracking | 0xjordansg-yolo | 1518 | 3 | 4 | 适合作为批量改造候选 |
| Search YouTube videos, channels, and playlists | 0xjordansg-yolo | 554 | 0 | 2 | 适合作为批量改造候选 |
| Twitter/X All-in-One — Search, Monitor & Publish Text & Media Posts | aisadocs | 223 | 1 | 0 | 适合作为批量改造候选 |
| Twitter Intelligence & Automation — Read, Search, Write & Post (Text & Media) | karensheng | 101 | 0 | 0 | 适合作为批量改造候选 |
| X Twitter Command Center (Search + Post + Interact) | chaimengphp | 82 | 0 | 0 | 适合作为批量改造候选 |

## 六、为什么先打 `aisa-twitter-api`
- 它是本地 AISA 包里安装转化最强的一个，说明用户不只点进去看过，还愿意留下来。
- Twitter/X 同时覆盖搜索、监控、发帖三种高频任务，天然适合做旗舰指挥台。
- 它的品牌归属最清晰，适合直接作为 AISA 官方代表 skill；同 runtime 的其他包再承担细分场景和变体角色。
- 这次已经把它改造成 `Twitter API Command Center` 口径，下一步只差真实案例、发布物料和持续迭代节奏。

## 七、AISA 爆款系统结论
- AISA 不该再把每个 skill 当作平级孤岛，而应该按 API 家族做“旗舰包 + 窄场景包 + 中文镜像包”的作品集。
- Twitter 家族和 YouTube 家族已经具备第一波改造基础，接下来重点不是继续写代码，而是持续用标题、案例、发布节奏去放大现有能力。
- 如果执行得当，AISA 的目标不是做出一个爆款，而是建立一个能够持续复制爆款的发布系统。
