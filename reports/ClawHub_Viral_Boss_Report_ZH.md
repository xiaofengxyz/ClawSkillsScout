# ClawHub 爆款技能与爆款作者系统总报告（老板版）

- 生成时间：2026-04-24T11:01:21.740684+00:00
- 数据范围：ClawHub 当前 downloads / stars / installs 三榜 Top 100
- 数据来源：https://clawhub.ai/skills?sort=downloads&dir=desc、https://clawhub.ai/skills?sort=stars&dir=desc、https://clawhub.ai/skills?sort=installs&dir=desc

## 一、结论先行
- 真正的爆款 skill 不是单靠下载量冲起来的，而是同时具备被发现、被收藏、被长期留在工作流里的能力。
- 从三榜综合结果看，最强爆款集中在四类：agent 自进化、开发者工作流、搜索研究、日常高频工具。
- 爆款作者不是“偶尔碰运气的人”，而是在运营作品集的人。他们要么围绕一个能力核持续迭代，要么用多个高频入口铺成矩阵。
- 对 AISA 来说，最值得立即做的不是继续写更多普通 skill，而是围绕强需求 API 家族做旗舰包、窄场景包和中文镜像包。
- 现有本地 AISA 包里，`aisa-twitter-api` 最适合先打成旗舰；之后应该继续扩 Twitter 家族、YouTube 家族，再补 GitHub / Workspace / Search 这些更高收入方向。

## 二、方法说明
- 本报告同时看 downloads、stars、installs 三榜，而不是只看下载量。
- 下载代表被点开和被尝试，星标代表认可和传播，安装代表长期留存价值。
- 只有同时在两榜或三榜都强的 skill，才算真正值得模仿的爆款。

## 三、重点爆款 skill 总结
| Skill | 作者 | 上榜次数 | 综合分 | 下载/星标/安装 |
| --- | --- | --- | --- | --- |
| Skill Vetter | spclaudehome | 3 | 298 | 219735 / 960 / 4073 |
| Gog | steipete | 3 | 291 | 161529 / 849 / 3352 |
| Github | steipete | 3 | 290 | 163764 / 535 / 4077 |
| Proactive Agent | halthelobster | 3 | 288 | 147962 / 726 / 2721 |
| Self-Improving + Proactive Agent | ivangdavila | 3 | 288 | 171978 / 1004 / 1831 |
| Weather | steipete | 3 | 282 | 139283 / 366 / 3538 |
| Multi Search Engine | gpyangyoujun | 3 | 275 | 127456 / 602 / 1840 |
| Obsidian | steipete | 3 | 262 | 85459 / 349 / 2353 |
| ontology | oswalpalash | 3 | 261 | 170492 / 560 / 1184 |
| Humanizer | biostartechnology | 3 | 259 | 95552 / 563 / 1279 |

### 为什么这些 skill 会成为爆款
- 名字就等于用户任务，几乎不需要解释。
- 输出直接可用，用户第一次调用就能感知价值。
- 很多 skill 不是只为单次使用设计，而是为长期装着用设计。
- 爆款 skill 往往要么有强叙事，要么有强刚需，最好两者兼具。

### 有没有可复制的实操
- 有，而且非常明显：把抽象能力改写成高意图任务名。
- 用一个旗舰包吃搜索和品牌心智，再用多个窄场景包吃转化。
- 把输出做成决策结果、执行结果、或工作流结果，而不是单纯解释说明。
- 同一底层 API 不要只发 1 个包，要围绕不同工作流拆成矩阵。

### 这些爆款 skill 的共同点
- 标题短、直接、可搜索。
- 场景明确，不让用户猜什么时候用。
- 结果可验证、可复用、可沉淀到日常流程里。
- 很多都可以进一步产品化为 API 家族，而不是一次性 skill。

## 四、逐条拆解重点爆款 skill

### Skill Vetter | @spclaudehome
- 三榜表现：downloads 219735，stars 960，installs 4073。
- 核心任务：在安装任何 skill 前先做安全审查。
- 爆款原因：
  - 任务极窄，用户一眼知道什么时候用。
  - 安全是高风险决策点，所以天然转化强。
  - 输出是决策，不是描述，因此安装留存都高。
- 可复制打法：
  - 选一个高风险、高决策价值的入口。
  - 把结果做成通过/警告/阻断，而不是泛泛建议。
  - 后续可扩成插件审计、权限审计、依赖审计矩阵。
- 是否适合转成 AISA API：高。可转成统一安全扫描 API、风险解释 API、skill 审计 API。

### Gog | @steipete
- 三榜表现：downloads 161529，stars 849，installs 3352。
- 核心任务：统一调用 Gmail、Calendar、Drive、Docs 等 Google Workspace 工具。
- 爆款原因：
  - 一个入口覆盖多个高频办公动作。
  - 强日常性带来高安装。
  - 用户知道它会长期驻留，所以愿意保留。
- 可复制打法：
  - 做统一工作台，而不是只做一个点。
  - 先覆盖最常用的办公能力，再往团队协作扩。
  - 把多工具打包成一个 command center。
- 是否适合转成 AISA API：极高。适合做 Google Workspace unified API 和办公自动化套餐。

### Github | @steipete
- 三榜表现：downloads 163764，stars 535，installs 4077。
- 核心任务：用最短路径完成 GitHub 仓库与开发工作流操作。
- 爆款原因：
  - 标题就是平台名，搜索心智极强。
  - 开发者高频场景，安装后常驻。
  - 对 AI 编码用户来说几乎是刚需入口。
- 可复制打法：
  - 平台名 + 核心任务，是最稳的高意图命名。
  - 优先做开发者每天都碰到的入口。
  - 围绕 repo、PR、issue、release 拆分多个子 skill。
- 是否适合转成 AISA API：极高。可直接转成 GitHub research、PR review、issue triage、release watch API。

### Proactive Agent | @halthelobster
- 三榜表现：downloads 147962，stars 726，installs 2721。
- 核心任务：让 agent 不等命令，主动推进工作。
- 爆款原因：
  - 主动性是高价值用户最想要的特征。
  - 标题短且强，传播力很高。
  - 和 second brain 组合后形成长期陪伴型叙事。
- 可复制打法：
  - 围绕主动性、持续性、陪伴型价值做表达。
  - 功能不必极多，但叙事必须足够强。
  - 与知识管理、计划执行类能力天然互补。
- 是否适合转成 AISA API：中。更适合和通知、计划、记忆、执行 API 组合成上层产品。

### Self-Improving + Proactive Agent | @ivangdavila
- 三榜表现：downloads 171978，stars 1004，installs 1831。
- 核心任务：既能持续学习，又能主动帮用户推进任务。
- 爆款原因：
  - 把两个最能激发想象力的 agent 叙事叠在一起。
  - 既有强传播性，也有较强安装留存。
  - 作者又用大量实用工具 skill 放大整体作品集势能。
- 可复制打法：
  - 把能力叙事做成组合拳。
  - 用旗舰叙事 skill 吸量，再用实用工具承接。
  - 通过作者作品集放大单个 skill 的势能。
- 是否适合转成 AISA API：中。更适合做上层 agent 编排产品，而非单点底层 API。

### Weather | @steipete
- 三榜表现：downloads 139283，stars 366，installs 3538。
- 核心任务：快速查询天气并直接服务决策。
- 爆款原因：
  - 超级高频、超级低门槛。
  - 名字极短，用户没有理解成本。
  - 虽然不炫技，但安装留存非常强。
- 可复制打法：
  - 不要忽视低门槛高频工具。
  - 越常用、越简单，越容易留存。
  - 这种入口最适合作为 API 消耗型业务。
- 是否适合转成 AISA API：极高。可做天气 API、出行建议 API、通知 API 套餐。

### Multi Search Engine | @gpyangyoujun
- 三榜表现：downloads 127456，stars 602，installs 1840。
- 核心任务：一次性搜索多个来源并拿到更好的检索结果。
- 爆款原因：
  - 搜索本身就是高频需求。
  - 多源聚合让用户天然感知价值。
  - 对 agent 和研究类用户都通用。
- 可复制打法：
  - 一个聚合价值就能成为卖点。
  - 搜索类产品最适合做 API 家族。
  - 先做通用入口，再拆学术、新闻、地区搜索。
- 是否适合转成 AISA API：极高。可扩 Tavily、Serp、学术、新闻、本地搜索等整个家族。

### Obsidian | @steipete
- 三榜表现：downloads 85459，stars 349，installs 2353。
- 核心任务：把 AI 能力嵌进知识管理工作流。
- 爆款原因：
  - 绑定强工作流平台。
  - 安装后切换成本高。
  - 用户使用频率高，容易常驻。
- 可复制打法：
  - 优先绑定强平台。
  - 平台型入口适合长期安装。
  - 围绕知识管理可延展大量周边能力。
- 是否适合转成 AISA API：高。可转知识管理、笔记搜索、笔记生成、知识库同步 API。

### ontology | @oswalpalash
- 三榜表现：downloads 170492，stars 560，installs 1184。
- 核心任务：为 agent 和复杂工作流提供结构化知识图谱与约束。
- 爆款原因：
  - 服务的是高价值用户群。
  - 概念高级，带来收藏和传播。
  - 一旦接入流程，切换成本较高。
- 可复制打法：
  - 把复杂能力变成高级但具体的系统概念。
  - 重点服务高价值少数人群，而不是所有人。
  - 通过约束、结构、共享记忆形成粘性。
- 是否适合转成 AISA API：中高。适合做知识图谱、实体关系、记忆结构化 API。

## 五、爆款多产作者总结
| 作者 | 上榜次数 | 综合分 | 代表作品 | 为什么强 |
| --- | --- | --- | --- | --- |
| steipete | 91 | 5591 | Github, Gog, Weather | 以高频日常工具组成作品集矩阵，靠多入口、多场景长期收割安装量。 |
| ivangdavila | 19 | 950 | Self-Improving + Proactive Agent, Word / DOCX, Excel / XLSX | 一边做 agent 叙事，一边做文档/办公等高需求工具，把吸引力和实用性放在同一作品集里。 |
| byungkyu | 7 | 305 | API Gateway, Gmail, YouTube | 围绕 API/办公/获客等强业务场景批量铺开，是典型的 B2B 工具作者打法。 |
| ide-rea | 4 | 214 | Baidu web search, Baidu Wenku AIPPT, baidu baike search | 用本地化搜索和中文生态入口拿差异化市场，是区域型分发打法。 |
| spclaudehome | 3 | 298 | Skill Vetter, CrabNet | 抓住安全焦虑和安装前决策点，用极强的任务清晰度吃下高转化。 |
| halthelobster | 3 | 288 | Proactive Agent, PARA Second Brain | 作品少但定位极准，用更强的主动性叙事做高粘性技能。 |
| gpyangyoujun | 3 | 275 | Multi Search Engine, uniqlo(优衣库)-product-query | 抓住搜索和消费决策这类高需求入口，用简单名字换来直接下载。 |
| oswalpalash | 3 | 261 | ontology, Causal Inference | 围绕稳定能力核做作品集 |

### 为什么这些作者能多产，还能做出爆款
- 他们不是不停换方向，而是围绕一个能力核、一种用户群、一组工作流持续生产。
- 他们懂得区分旗舰包和辅助包，不会把所有能力都塞进一个 skill 里。
- 他们更像在经营产品组合，而不是在写孤立的脚本。

### 有没有可复制的作者级实操
- 先定一个能力核，再连续做 3 到 5 个变体，不要每个都重开世界。
- 旗舰包负责拿心智，窄场景包负责吃安装，展示型包负责拿星标和传播。
- 中文、本地化、行业化变体要尽快跟进，避免只做英文通用款。

### 爆款作者的共同点
- 作品集内部有明显主题，而不是完全随机。
- skill 命名高度贴近用户搜索词。
- 他们做的是“多入口系统”，不是“单入口豪华包”。
- 他们理解什么适合长期安装，什么适合传播收藏。

## 六、逐条拆解爆款多产作者

### @steipete
- 综合表现：上榜 91 次，综合分 5591。
- 代表作：Github, Gog, Weather, Nano Pdf, Nano Banana Pro
- 生产方法判断：以高频日常工具组成作品集矩阵，靠多入口、多场景长期收割安装量。
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - 一个作者名下同时运营 Github、Weather、PDF、Workspace、Media 等多入口技能。
  - 每个 skill 都是一个非常明确的高频任务，而不是泛平台说明。
  - 把日常工作流做成驻留型技能，安装后不容易删。

### @ivangdavila
- 综合表现：上榜 19 次，综合分 950。
- 代表作：Self-Improving + Proactive Agent, Word / DOCX, Excel / XLSX, Powerpoint / PPTX, Playwright (Automation + MCP + Scraper)
- 生产方法判断：一边做 agent 叙事，一边做文档/办公等高需求工具，把吸引力和实用性放在同一作品集里。
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - 旗舰 skill 负责拿关注和收藏。
  - 文档工具类 skill 负责吃持续需求和下载。
  - 围绕‘效率提升 + 自动执行’建立统一作者心智。

### @byungkyu
- 综合表现：上榜 7 次，综合分 305。
- 代表作：API Gateway, Gmail, YouTube, PDF.co, Netlify
- 生产方法判断：围绕 API/办公/获客等强业务场景批量铺开，是典型的 B2B 工具作者打法。
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - 把多个具体业务动作拆成独立 skill。
  - 覆盖邮件、YouTube、PDF、获客等明确职能任务。
  - 更像产品组合管理，而不是单点创意。

### @ide-rea
- 综合表现：上榜 4 次，综合分 214。
- 代表作：Baidu web search, Baidu Wenku AIPPT, baidu baike search, Baidu Wenku AIPictureBook, deepresearch
- 生产方法判断：用本地化搜索和中文生态入口拿差异化市场，是区域型分发打法。
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - 优先做被国际作者忽视的区域需求。
  - 围绕百度等本地入口建立护城河。
  - 用本地生态替代英文通用入口，降低竞争强度。

### @spclaudehome
- 综合表现：上榜 3 次，综合分 298。
- 代表作：Skill Vetter, CrabNet
- 生产方法判断：抓住安全焦虑和安装前决策点，用极强的任务清晰度吃下高转化。
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - skill 标题就是动作本身，用户不用猜。
  - 先占安装前入口，再扩展到周边审计能力。
  - 让输出直接变成决策，而不是仅提供信息。

### @halthelobster
- 综合表现：上榜 3 次，综合分 288。
- 代表作：Proactive Agent, PARA Second Brain
- 生产方法判断：作品少但定位极准，用更强的主动性叙事做高粘性技能。
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - 少做，不乱做，只做高辨识度入口。
  - 主动性和 second brain 都指向长期陪伴型能力。
  - 高星标背后是强世界观，而不只是单次功能。

### @gpyangyoujun
- 综合表现：上榜 3 次，综合分 275。
- 代表作：Multi Search Engine, uniqlo(优衣库)-product-query
- 生产方法判断：抓住搜索和消费决策这类高需求入口，用简单名字换来直接下载。
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - 搜索类入口天然高频，尤其适合 API 化。
  - 保持名字可检索，而不是追求酷炫表达。
  - 先用广需求技能吸量，再往垂直 SKU 扩展。

### @oswalpalash
- 综合表现：上榜 3 次，综合分 261。
- 代表作：ontology, Causal Inference
- 生产方法判断：围绕稳定能力核做作品集
- 为什么能多产：
  - 不是每次重新设计一切，而是在重复使用成熟的主题、结构和分发逻辑。
  - 作者名本身逐渐形成心智，带动后续 skill 更容易被尝试。
  - 一旦某个主题验证有效，就继续围绕它做更多相邻变体。
- 可复制实操：
  - 围绕一个能力核持续做矩阵。

## 七、AISA 应该怎么做，怎么落地
- AISA 不该继续平均发力，而要先做旗舰 skill，再做家族矩阵。
- 最优先做法是：Twitter 家族先拿下，再补 YouTube 家族，随后切入 GitHub、Workspace、Search 这些收入更强的方向。
- 现有本地 skill 已经完成第一轮包装升级，下一步重点不在重写代码，而在案例、分发、复盘和标题优化。

### 落地实施计划
- 第一阶段：把 `aisa-twitter-api` 作为官方旗舰包，对外统一成 `Twitter API Command Center` 口径。
- 第二阶段：Twitter 家族形成矩阵，分成 Command Center、Growth Operator、Automation 3 个入口。
- 第三阶段：YouTube 家族跟进，分成 `YouTube SERP Scout` 和 `YouTube Search API` 双层入口。
- 第四阶段：基于市场缺口做 GitHub、Search、Workspace、Document Office 等 AISA API 家族。
- 第五阶段：围绕真实使用数据继续做标题、示例请求、价格和套餐迭代。

## 八、哪些爆款 skill 最适合转成 AISA API，以及收益方向
| 参考爆款 skill | AISA 可做的 API/skill | 收益潜力 | 原因 |
| --- | --- | --- | --- |
| Github | GitHub Research / PR Review / Issue Triage API | 极高 | 开发者高频、留存强、适合团队付费 |
| Gog | Google Workspace Unified API | 极高 | 办公场景多、可卖团队席位和自动化额度 |
| Weather | Weather + Travel Decision API | 高 | 高频低门槛，适合按调用量收费 |
| Multi Search Engine | Search Aggregation API Family | 极高 | 天然 API 化，能做多层套餐 |
| Word / DOCX / Excel / PPTX | Document Office API Family | 高 | 办公文档场景明确，企业付费意愿高 |
| Playwright Automation | Browser Automation / MCP API | 高 | 自动化价值高，适合高阶套餐 |
| Skill Vetter | Security Audit API | 高 | 高风险决策场景，客单价可高 |
| Nano Banana Pro | Image / Video Generation API | 高 | 展示强，适合用量收费 |

### 收益判断
- 最值得做高客单价的，是 GitHub、Workspace、Browser Automation、Security Audit。
- 最适合做调用量收费的，是 Search、Weather、Media Generation。
- 最适合做旗舰流量入口的，是 Twitter/X、YouTube、GitHub。
- 最适合做企业套餐的，是文档办公、协作办公、浏览器自动化和安全审计。

## 九、测试与上线风险
- 本地 7 个 AISA runtime 包的静态校验和 CLI smoke test 已通过。
- 使用用户提供的凭证进行真实线上测试时，`twitter/trends`、`twitter/auth_twitter`、`youtube/search` 已成功返回真实数据，但 `twitter/user/info` 仍出现 timeout。
- 使用用户提供的 Python 3.12 和 GitHub Token 运行 `last30days` 时，已进入真实运行态，但 planner timeout、GitHub 查询 422、Reddit 公网抓取 timeout 仍然存在。
- 这说明当前最大上线风险不只是包装问题，而是不同远端链路的稳定性不一致，需要在上线前做健康检查和降级策略。

### 治理建议
- 给所有 AISA 客户端增加更明确的超时、重试和错误分类。
- 上线前至少为 Twitter、YouTube、Search 三条核心链路做独立健康检查。
- 发布页必须明确说明哪些动作是读接口，哪些动作仍需 OAuth / 手工授权。
- 把远端超时率纳入产品验收，而不是只看本地脚本是否能执行。

## 十、附录数据

### A. downloads Top 10
| 排名 | Skill | 作者 | 下载 | 星标 | 安装 |
| --- | --- | --- | --- | --- | --- |
| 1 | Skill Vetter | spclaudehome | 219735 | 960 | 4073 |
| 2 | Self-Improving + Proactive Agent | ivangdavila | 171978 | 1004 | 1831 |
| 3 | ontology | oswalpalash | 170492 | 560 | 1184 |
| 4 | Github | steipete | 163764 | 535 | 4077 |
| 5 | Gog | steipete | 161529 | 849 | 3352 |
| 6 | Proactive Agent | halthelobster | 147962 | 726 | 2721 |
| 7 | Weather | steipete | 139283 | 366 | 3538 |
| 8 | Polymarket | joelchance | 134026 | 93 | 28 |
| 9 | Multi Search Engine | gpyangyoujun | 127456 | 602 | 1840 |
| 10 | AdMapix | fly0pants | 106542 | 274 | 257 |

### B. stars Top 10
| 排名 | Skill | 作者 | 下载 | 星标 | 安装 |
| --- | --- | --- | --- | --- | --- |
| 1 | Self-Improving + Proactive Agent | ivangdavila | 171978 | 1004 | 1831 |
| 2 | Skill Vetter | spclaudehome | 219735 | 960 | 4073 |
| 3 | Gog | steipete | 161529 | 849 | 3352 |
| 4 | Proactive Agent | halthelobster | 147962 | 726 | 2721 |
| 5 | Multi Search Engine | gpyangyoujun | 127456 | 602 | 1840 |
| 6 | Humanizer | biostartechnology | 95552 | 563 | 1279 |
| 7 | ontology | oswalpalash | 170492 | 560 | 1184 |
| 8 | Github | steipete | 163764 | 535 | 4077 |
| 9 | Free Ride - Unlimited free AI | shaivpidadi | 58498 | 420 | 429 |
| 10 | Auto-Updater Skill | maximeprades | 76762 | 377 | 1292 |

### C. installs Top 10
| 排名 | Skill | 作者 | 下载 | 星标 | 安装 |
| --- | --- | --- | --- | --- | --- |
| 1 | Github | steipete | 163764 | 535 | 4077 |
| 2 | Skill Vetter | spclaudehome | 219735 | 960 | 4073 |
| 3 | Weather | steipete | 139283 | 366 | 3538 |
| 4 | Gog | steipete | 161529 | 849 | 3352 |
| 5 | Proactive Agent | halthelobster | 147962 | 726 | 2721 |
| 6 | Sonoscli | steipete | 79251 | 50 | 2588 |
| 7 | Nano Pdf | steipete | 94785 | 227 | 2385 |
| 8 | Obsidian | steipete | 85459 | 349 | 2353 |
| 9 | Skill Creator | chindden | 74142 | 255 | 2223 |
| 10 | Notion | steipete | 79306 | 235 | 2224 |

### D. 本地 AISA skill 优先级
| Skill | 作者 | 下载 | 星标 | 安装 | 优先级说明 |
| --- | --- | --- | --- | --- | --- |
| AIsa Twitter API (Search + Post) | aisapay | 3240 | 4 | 16 | 本地 AISA 包里安装转化最高，下载基础已被验证，AISA 品牌一致性最好，适合做旗舰包 |
| X/Twitter Automation: 30+ APIs, OAuth Post, One Key | 0xjordansg-yolo | 3562 | 4 | 12 | 下载基础已被验证 |
| YouTube SERP Scout for agents. Search top-ranking videos, channels, and trends for content research and competitor tracking | 0xjordansg-yolo | 1518 | 3 | 4 | 适合作为批量改造候选 |
| Search YouTube videos, channels, and playlists | 0xjordansg-yolo | 554 | 0 | 2 | 适合作为批量改造候选 |
| Twitter/X All-in-One — Search, Monitor & Publish Text & Media Posts | aisadocs | 223 | 1 | 0 | 适合作为批量改造候选 |
| Twitter Intelligence & Automation — Read, Search, Write & Post (Text & Media) | karensheng | 101 | 0 | 0 | 适合作为批量改造候选 |
| X Twitter Command Center (Search + Post + Interact) | chaimengphp | 82 | 0 | 0 | 适合作为批量改造候选 |

### E. 当前测试证据摘要
# AISA API Skills 改造测试证据

- 记录日期：2026-04-20
- 测试范围：本地 7 个 AISA runtime 包，以及新生成的多榜单分析数据

## 1. 已完成的真实验证

### 静态验证

- 命令：`npm run verify:source-optimized`
- 结果：通过
- 产物：`artifacts/source-optimized-verification.json`
- 说明：
  - 7 个英文优化包全部 `static_checks_passed`
  - 已检查 `metadata.aisa`
  - 已检查 `compatibility`
  - 已检查无 `${SKILL_ROOT}` / `${LAST30DAYS_PYTHON}` 残留
  - 已检查保留文件、删除文件、`py_compile` 和 CLI `--help`

### CLI smoke tests

- 命令：`python3 packages/source-optimized/aisapay/aisa-twitter-api/scripts/twitter_client.py --help`
- 结果：通过
- 命令：`python3 packages/source-optimized/aisapay/aisa-twitter-api/scripts/twitter_oauth_client.py --help`
- 结果：通过
- 命令：`python3 packages/source-optimized/aisadocs/openclaw-twitter-post-engage/scripts/twitter_engagement_client.py --help`
- 结果：通过
- 命令：`python3 packages/source-optimized/0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking/scripts/youtube_client.py --help`
- 结果：通过

### 真实线上数据验证

- 命令：`python3 scripts/build-clawhub-multi-ranking-report.py`
- 结果：通过
- 产物：
  - `public/data/clawhub-multi-ranking-report.json`
  - `reports/ClawHub_Multi_Ranking_Report_ZH.md`
  - `public/reports/ClawHub_Multi_Ranking_Report_ZH.md`
- 说明：
  - 已真实抓取 ClawHub 当前 downloads / stars / installs 三榜 Top 100
  - 已基于线上数据完成 skill、作者、综合三层分析
  - 已完成本地 AISA skill 优先级排序

### 使用提供凭证后的在线 smoke test

- 凭证来源：`docs/accounts`
- 使用方式：仅用于非破坏性读接口、授权链接、研究链路验证；未直接发帖、点赞、关注

已观察到的结果：

- 产物：`artifacts/aisa-live-smoke-2026-04-20.json`
- `twitter_user_info_openai`
  - 结果：`URLError timed out`
  - 说明：不是所有 Twitter 读接口都稳定
- `twitter_trends`
  - 结果：成功，HTTP 200
  - 说明：真实返回 30 条 worldwide trends
- `twitter_auth`
  - 结果：成功，HTTP 200
  - 说明：真实返回授权链接，OAuth 前置链路可用
