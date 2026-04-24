import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import type {
  AisaPrioritySkill,
  ClawhubMultiRankingReport,
  CrossRankAuthor,
  CrossRankSkill,
  MultiRankingSkill,
} from './types';
import { LanguageToggle, formatMetricValue, loadJsonCached, peekJsonCache, useAppLanguage, useDocumentTitle, warmJsonCache } from '../site';

const copyByLanguage = {
  zh: {
    pageTitle: 'ClawHub Skill 三榜综合',
    loading: '正在加载 ClawHub Skill 三榜综合...',
    heroEyebrow: 'ClawHub Skill Intelligence',
    heroTitle: '把 downloads / stars / installs 三榜放到一页看',
    heroDescription:
      '这页直接读取 ClawHub skill 的真实公开三榜数据，拆开看各榜 top 10、跨榜综合强势 skill、作者工厂，以及本地 AISA 包在这套市场里的优先级。',
    openMarketPage: '打开跨生态情报页',
    openDownloadsPage: '打开下载榜分析页',
    reportsIndex: '报告索引',
    dataJson: '查看三榜 JSON',
    updatedAt: '更新于',
    sampleSize: '每榜样本',
    crossHits: '跨榜强势 skill',
    topAuthor: '头部作者',
    flagship: '当前旗舰候选',
    methodologyTitle: '这份页面怎么读',
    methodologyLead:
      'ClawHub skill 页当前公开展示 `Most downloaded / Most starred / Most installed` 三套排序。这页先分开看三榜，再看跨榜重合度、作者矩阵和 AISA 的真实切入顺序。',
    rankingMechanics: '三榜机制',
    breakoutMechanics: '爆款机制',
    authorMechanics: '作者工厂',
    aisaMoves: 'AISA 动作',
    downloadsBoard: 'Downloads 排行',
    starsBoard: 'Stars 排行',
    installsBoard: 'Installs 排行',
    crossSkillsBoard: '三榜综合强势 Skill',
    authorsBoard: '作者工厂',
    aisaBoard: '本地 AISA 优先级',
    rank: '排名',
    skill: 'Skill',
    metrics: '数据',
    appearances: '上榜次数',
    score: '综合分',
    ranks: '排名分布',
    author: '作者',
    portfolio: '作品样本',
    priority: '优先级',
    reason: '理由',
    downloads: '下载',
    stars: '星标',
    installs: '安装',
    themeSummary: 'Top 20 主题分布',
    summaryPrefix: '当前真实公开三榜入口：',
    boardLeaders: '当前榜首',
    authorMatrixLead: '头部作者不是单个 skill 在赢，而是在运营作品集。',
    rankingBullets: [
      '下载榜更偏宽需求入口和第一次点开率。',
      '星标榜更偏方法论认同、品牌感和收藏意愿。',
      '安装榜最接近长期驻留价值和复用频率。',
      '能同时在两榜或三榜都强的 skill，才更像可复制的真爆款。',
    ],
    breakoutBullets: [
      '爆款名字几乎都在直接说任务、对象或结果，而不是抽象概念词。',
      '高频工具、搜索研究、开发者工作流和 agent 自进化仍是最强主线。',
      '一个能力核拆多个高意图变体，比大而全更容易持续上榜。',
      '第一次使用成本越低，跨榜重合度通常越高。',
    ],
    authorBullets: [
      '作者优势来自能力核连续扩张，不是单次爆款偶然命中。',
      '旗舰入口包负责吸量，窄场景变体负责转化，概念包负责拿星标。',
      '持续迭代和统一命名口径，会把作者名本身变成分发资产。',
    ],
    aisaBullets: [
      'AISA 要优先切已经在真实三榜里被验证过需求的技能方向。',
      '先做旗舰包，再拆支持性 siblings，而不是把所有 skill 当平级孤岛。',
      'Twitter / YouTube / Search / Documents / Developer 这类高频线更适合继续推进。',
    ],
  },
  en: {
    pageTitle: 'ClawHub Skill Multi-Ranking',
    loading: 'Loading ClawHub skill multi-ranking...',
    heroEyebrow: 'ClawHub Skill Intelligence',
    heroTitle: 'See the downloads / stars / installs boards on one page',
    heroDescription:
      'This page reads the real public ClawHub skill boards, separates each top 10, then shows cross-board breakout skills, author factories, and how the local AISA packages compare inside that market.',
    openMarketPage: 'Open market intelligence',
    openDownloadsPage: 'Open downloads insights',
    reportsIndex: 'Report index',
    dataJson: 'View multi-ranking JSON',
    updatedAt: 'Updated',
    sampleSize: 'Sample size',
    crossHits: 'Cross-board skills',
    topAuthor: 'Top author',
    flagship: 'Current flagship',
    methodologyTitle: 'How to read this page',
    methodologyLead:
      'The ClawHub skill page currently exposes public `Most downloaded / Most starred / Most installed` boards. This page first separates the three boards, then looks at overlap, author portfolios, and the real AISA entry order.',
    rankingMechanics: 'Board Mechanics',
    breakoutMechanics: 'Breakout Mechanics',
    authorMechanics: 'Author Factories',
    aisaMoves: 'AISA Moves',
    downloadsBoard: 'Downloads board',
    starsBoard: 'Stars board',
    installsBoard: 'Installs board',
    crossSkillsBoard: 'Cross-board breakout skills',
    authorsBoard: 'Author factories',
    aisaBoard: 'Local AISA priorities',
    rank: 'Rank',
    skill: 'Skill',
    metrics: 'Metrics',
    appearances: 'Appearances',
    score: 'Score',
    ranks: 'Rank spread',
    author: 'Author',
    portfolio: 'Portfolio',
    priority: 'Priority',
    reason: 'Reason',
    downloads: 'downloads',
    stars: 'stars',
    installs: 'installs',
    themeSummary: 'Top-20 theme mix',
    summaryPrefix: 'Current public skill-board entry points:',
    boardLeaders: 'Current board leaders',
    authorMatrixLead: 'Top authors are not winning with one skill. They are operating portfolios.',
    rankingBullets: [
      'Downloads reward broad demand and first-click clarity.',
      'Stars reward methodology, identity, and save-worthiness.',
      'Installs are the closest public signal to long-term retained value.',
      'Skills that stay strong on two or three boards are the most repeatable breakout models.',
    ],
    breakoutBullets: [
      'The strongest names directly state the job, object, or outcome.',
      'High-frequency tools, search/research, developer workflows, and self-improving agents remain the strongest lanes.',
      'One capability core plus multiple high-intent variants outperforms one bloated all-in-one skill.',
      'Lower first-use friction usually raises cross-board overlap.',
    ],
    authorBullets: [
      'Author advantage comes from expanding one capability core across adjacent skills.',
      'Flagship packages pull traffic, narrower variants convert, and concept-heavy entries capture stars.',
      'Consistent naming and steady iteration turn the author name into a distribution asset.',
    ],
    aisaBullets: [
      'AISA should prioritize skill directions already validated by the real public boards.',
      'Ship one flagship first, then narrower siblings, instead of treating every skill as a flat island.',
      'Twitter, YouTube, Search, Documents, and Developer lanes remain the best next moves.',
    ],
  },
} as const;

type MultiCopy = (typeof copyByLanguage)[keyof typeof copyByLanguage];

type TableColumn<T> = {
  key: string;
  title: string;
  render: (item: T) => ReactNode;
};

function metric(value: number | null | undefined, language: 'zh' | 'en') {
  return formatMetricValue(value ?? 0, language);
}

function ranksLabel(value: Record<string, number>) {
  return Object.entries(value)
    .map(([key, rank]) => `${key}:${rank}`)
    .join(', ');
}

function topThemeLabel(themes: Array<{ theme: string; count: number }>, language: 'zh' | 'en') {
  if (!themes.length) return language === 'zh' ? '暂无' : 'n/a';
  return themes
    .slice(0, 3)
    .map((item) => `${item.theme} ${item.count}${language === 'zh' ? '个' : ''}`)
    .join(' / ');
}

function SkillTitle({
  name,
  author,
  theme,
  url,
}: {
  name: string;
  author: string;
  theme: string;
  url: string;
}) {
  return (
    <>
      <a href={url} target="_blank" rel="noreferrer">
        <strong>{name}</strong>
      </a>
      <span className="plugin-subtext">
        @{author} · {theme}
      </span>
    </>
  );
}

function TableCard<T>({
  title,
  description,
  items,
  columns,
}: {
  title: string;
  description: string;
  items: T[];
  columns: Array<TableColumn<T>>;
}) {
  return (
    <section className="plugin-table-card">
      <h2>{title}</h2>
      <p className="plugin-subcopy">{description}</p>
      <div className="plugin-table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MechanicPanel({ title, bullets }: { title: string; bullets: readonly string[] }) {
  return (
    <article className="plugin-panel">
      <h2>{title}</h2>
      <ul>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}

export default function App() {
  const { language, setLanguage } = useAppLanguage();
  const copy = copyByLanguage[language];
  const [report, setReport] = useState<ClawhubMultiRankingReport | null>(() =>
    peekJsonCache<ClawhubMultiRankingReport>('data/clawhub-multi-ranking-report.json'),
  );

  useDocumentTitle(copy.pageTitle);

  useEffect(() => {
    loadJsonCached<ClawhubMultiRankingReport>('data/clawhub-multi-ranking-report.json')
      .then((json) => {
        setReport(json);
        warmJsonCache(['data/clawhub-download-insights.json', 'data/market-ecosystem-report.json']);
      })
      .catch((error) => console.error('Failed to load ClawHub multi-ranking report', error));
  }, []);

  const boardCards = useMemo(
    () =>
      report
        ? [
            {
              title: copy.downloadsBoard,
              description:
                `${copy.themeSummary}: ${topThemeLabel(report.rankings.downloads.top20ThemeSummary, language)}.` +
                (language === 'zh' ? ' 代表第一次点开与宽需求入口。' : ' Strongest signal for first-click breadth.'),
              items: report.rankings.downloads.top10,
            },
            {
              title: copy.starsBoard,
              description:
                `${copy.themeSummary}: ${topThemeLabel(report.rankings.stars.top20ThemeSummary, language)}.` +
                (language === 'zh' ? ' 更偏方法论认同与收藏意愿。' : ' More about methodology identity and save-worthiness.'),
              items: report.rankings.stars.top10,
            },
            {
              title: copy.installsBoard,
              description:
                `${copy.themeSummary}: ${topThemeLabel(report.rankings.installs.top20ThemeSummary, language)}.` +
                (language === 'zh' ? ' 最接近长期驻留价值。' : ' Closest visible signal to retained value.'),
              items: report.rankings.installs.top10,
            },
          ]
        : [],
    [copy.downloadsBoard, copy.installsBoard, copy.starsBoard, copy.themeSummary, language, report],
  );

  if (!report) {
    return <main className="plugin-shell plugin-loading">{copy.loading}</main>;
  }

  const topAuthor = report.crossRanking.topAuthors[0]?.author ?? 'n/a';
  const boardLeaders = [
    `downloads ${report.rankings.downloads.top10[0]?.name ?? 'n/a'}`,
    `stars ${report.rankings.stars.top10[0]?.name ?? 'n/a'}`,
    `installs ${report.rankings.installs.top10[0]?.name ?? 'n/a'}`,
  ].join(' / ');

  const boardColumns: Array<TableColumn<MultiRankingSkill>> = [
    { key: 'rank', title: copy.rank, render: (item) => item.rank },
    {
      key: 'skill',
      title: copy.skill,
      render: (item) => <SkillTitle name={item.name} author={item.author} theme={item.theme} url={item.url} />,
    },
    {
      key: 'metrics',
      title: copy.metrics,
      render: (item) => (
        <>
          <strong>
            {metric(item.downloads, language)} / {metric(item.stars, language)} / {metric(item.installsCurrent, language)}
          </strong>
          <span className="plugin-subtext">
            {copy.downloads} / {copy.stars} / {copy.installs}
          </span>
        </>
      ),
    },
  ];

  const crossSkillColumns: Array<TableColumn<CrossRankSkill>> = [
    {
      key: 'skill',
      title: copy.skill,
      render: (item) => <SkillTitle name={item.name} author={item.author} theme={item.theme} url={item.url} />,
    },
    { key: 'appearances', title: copy.appearances, render: (item) => item.appearances },
    { key: 'score', title: copy.score, render: (item) => item.compositeScore },
    { key: 'ranks', title: copy.ranks, render: (item) => ranksLabel(item.ranks) },
  ];

  const authorColumns: Array<TableColumn<CrossRankAuthor>> = [
    {
      key: 'author',
      title: copy.author,
      render: (item) => (
        <>
          <strong>@{item.author}</strong>
          <span className="plugin-subtext">
            {metric(item.distinctSkills, language)} skills · {metric(item.appearances, language)} appearances
          </span>
        </>
      ),
    },
    { key: 'score', title: copy.score, render: (item) => item.score },
    { key: 'ranks', title: copy.ranks, render: (item) => ranksLabel(item.bestRanks) },
    {
      key: 'portfolio',
      title: copy.portfolio,
      render: (item) =>
        report.crossRanking.topAuthorProfiles[item.author]?.topSkills
          .slice(0, 3)
          .map((skill) => skill.name)
          .join(' / ') || 'n/a',
    },
  ];

  const aisaColumns: Array<TableColumn<AisaPrioritySkill>> = [
    {
      key: 'skill',
      title: copy.skill,
      render: (item) => <SkillTitle name={item.name} author={item.owner} theme={item.theme} url={`https://clawhub.ai/${item.owner}/${item.slug}`} />,
    },
    { key: 'priority', title: copy.priority, render: (item) => item.priorityScore.toFixed(4) },
    {
      key: 'metrics',
      title: copy.metrics,
      render: (item) => (
        <>
          <strong>
            {metric(item.downloads, language)} / {metric(item.stars, language)} / {metric(item.installsCurrent, language)}
          </strong>
          <span className="plugin-subtext">
            {copy.downloads} / {copy.stars} / {copy.installs}
          </span>
        </>
      ),
    },
    { key: 'reason', title: copy.reason, render: (item) => item.reason },
  ];

  return (
    <main className="plugin-shell">
      <section className="page-toolbar">
        <LanguageToggle language={language} onChange={setLanguage} />
      </section>

      <section className="plugin-hero">
        <div>
          <span className="plugin-eyebrow">{copy.heroEyebrow}</span>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroDescription}</p>
          <div className="plugin-link-row">
            <a className="plugin-link-primary" href={`${import.meta.env.BASE_URL}market-intelligence.html`}>
              {copy.openMarketPage}
            </a>
            <a className="plugin-link-secondary" href={`${import.meta.env.BASE_URL}clawhub-download-insights.html`}>
              {copy.openDownloadsPage}
            </a>
            <a className="plugin-link-secondary" href={`${import.meta.env.BASE_URL}reports/index.html`}>
              {copy.reportsIndex}
            </a>
            <a className="plugin-link-secondary" href={`${import.meta.env.BASE_URL}data/clawhub-multi-ranking-report.json`} target="_blank" rel="noreferrer">
              {copy.dataJson}
            </a>
          </div>
          <div className="plugin-chip-row">
            <span>
              {copy.updatedAt} {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}
            </span>
            <span>
              {copy.summaryPrefix} downloads / stars / installs
            </span>
            <span>
              {copy.boardLeaders}: {boardLeaders}
            </span>
          </div>
        </div>

        <div className="plugin-hero-side">
          <div className="plugin-metric-grid">
            <article className="plugin-metric-card tone-gold">
              <span>{copy.sampleSize}</span>
              <strong>{metric(report.sources.sampleSizePerRanking, language)}</strong>
            </article>
            <article className="plugin-metric-card tone-sea">
              <span>{copy.crossHits}</span>
              <strong>{metric(report.crossRanking.topSkills.length, language)}</strong>
            </article>
            <article className="plugin-metric-card tone-forest">
              <span>{copy.topAuthor}</span>
              <strong>@{topAuthor}</strong>
            </article>
            <article className="plugin-metric-card tone-rust">
              <span>{copy.flagship}</span>
              <strong>{report.aisaSnapshot.primaryFlagshipSlug ?? 'n/a'}</strong>
            </article>
          </div>
          <article className="plugin-metric-card tone-sea">
            <span>{copy.authorMatrixLead}</span>
            <strong>{metric(report.crossRanking.topAuthors[0]?.distinctSkills ?? 0, language)}</strong>
          </article>
        </div>
      </section>

      <section className="plugin-note-card">
        <h2>{copy.methodologyTitle}</h2>
        <p>{copy.methodologyLead}</p>
        <ul>
          <li>
            {copy.summaryPrefix} {Object.values(report.sources.rankingPages).join(' / ')}
          </li>
          <li>
            {copy.boardLeaders}: {boardLeaders}
          </li>
          <li>{copy.authorMatrixLead}</li>
        </ul>
      </section>

      <section className="plugin-grid plugin-grid-4">
        <MechanicPanel title={copy.rankingMechanics} bullets={copy.rankingBullets} />
        <MechanicPanel title={copy.breakoutMechanics} bullets={copy.breakoutBullets} />
        <MechanicPanel title={copy.authorMechanics} bullets={copy.authorBullets} />
        <MechanicPanel title={copy.aisaMoves} bullets={copy.aisaBullets} />
      </section>

      <section className="plugin-table-grid">
        {boardCards.map((card) => (
          <TableCard key={card.title} title={card.title} description={card.description} items={card.items} columns={boardColumns} />
        ))}
      </section>

      <section className="plugin-table-grid">
        <TableCard
          title={copy.crossSkillsBoard}
          description={
            language === 'zh'
              ? '这些 skill 同时在两榜或三榜里表现强，最接近可复制的真爆款。'
              : 'These skills stay strong on two or three boards and are the closest thing to repeatable true breakouts.'
          }
          items={report.crossRanking.topSkills.slice(0, 12)}
          columns={crossSkillColumns}
        />
        <TableCard
          title={copy.authorsBoard}
          description={
            language === 'zh'
              ? '头部作者更像在运营 skill 作品集，而不是单个标题偶发命中。'
              : 'Top authors behave more like portfolio operators than one-off lucky hits.'
          }
          items={report.crossRanking.topAuthors.slice(0, 10)}
          columns={authorColumns}
        />
      </section>

      <section className="plugin-grid plugin-grid-2">
        <TableCard
          title={copy.aisaBoard}
          description={
            language === 'zh'
              ? '基于本地 AISA 包当前下载、星标、安装表现给出的优先级。'
              : 'Priority order for the local AISA packages based on current downloads, stars, and installs.'
          }
          items={report.aisaSnapshot.priorityOrder}
          columns={aisaColumns}
        />
      </section>
    </main>
  );
}
