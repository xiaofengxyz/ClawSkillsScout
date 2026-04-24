import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import type { ClawhubPluginReport, PluginAisaCandidate, PluginAuthorProfile, PluginCompositeRow, PluginRankingRow } from './types';
import { LanguageToggle, formatMetricValue, loadJsonCached, peekJsonCache, useAppLanguage, useDocumentTitle, warmJsonCache } from '../site';

const copyByLanguage = {
  zh: {
    pageTitle: 'ClawHub Plugin 情报页',
    loading: '正在加载 ClawHub Plugin 情报...',
    heroEyebrow: 'ClawHub Plugin Intelligence',
    heroTitle: '把 ClawHub plugin 的三榜、信任机制和爆款套路拆开看',
    heroDescription:
      '这页专门分析 ClawHub plugin 目录的 `downloads / installs / stars` 三套排序、综合榜、作者工厂、AISA 机会以及发布时真正影响转化的验证与安全表面。',
    openMarketPage: '打开跨生态情报页',
    reportsIndex: '报告索引',
    sourcePage: 'ClawHub 来源页',
    dataJson: '查看 Plugin JSON',
    updatedAt: '更新于',
    methodologyTitle: '这份页面怎么读',
    methodologyLead:
      'ClawHub plugin 现在既有三套公开排序面，也有类型/验证/执行代码等过滤面。判断爆款时，要把榜单位置、验证状态、安全扫描、运行时边界和作者工厂一起看。',
    identicalRankingYes: '当前三榜顺序高度一致',
    identicalRankingNo: '当前三榜顺序已出现明显差异',
    totalPlugins: '插件总数',
    codeVsBundle: 'Code / Bundle',
    sourceLinked: 'Source-linked / Clean',
    suspicious: 'Suspicious / Executes code',
    publicStats: '公开零计数详情页',
    mechanicsTitle: '平台机制',
    rankingMechanics: '排名机制',
    trustMechanics: '信任机制',
    breakoutMechanics: '爆款机制',
    publishMoves: '发布动作',
    downloadsBoard: 'Downloads 排行',
    installsBoard: 'Installs 排行',
    starsBoard: 'Stars 排行',
    compositeBoard: '综合榜',
    divergenceBoard: '三榜差异最大',
    authorsBoard: '作者工厂',
    aisaBoard: 'AISA 改造机会',
    rank: '排名',
    plugin: 'Plugin',
    owner: '作者',
    family: '类型',
    theme: '主题',
    verification: '验证',
    score: '分数',
    spread: '跨度',
    bestBoard: '最强榜单',
    totalPluginsLabel: '插件数',
    codePluginsLabel: 'Code',
    bundlePluginsLabel: 'Bundle',
    cleanPluginsLabel: 'Clean',
    topThemesLabel: '主主题',
    whyItFits: '为什么适合 AISA',
    opportunity: '机会分',
    code: 'Code',
    bundle: 'Bundle',
  },
  en: {
    pageTitle: 'ClawHub Plugin Intelligence',
    loading: 'Loading ClawHub plugin intelligence...',
    heroEyebrow: 'ClawHub Plugin Intelligence',
    heroTitle: 'See the three plugin boards, trust surfaces, and breakout playbook separately',
    heroDescription:
      'This page focuses on the ClawHub plugin directory across the `downloads`, `installs`, and `stars` boards, the composite board, author factories, AISA opportunities, and the verification/security surfaces that actually affect conversion.',
    openMarketPage: 'Open market intelligence',
    reportsIndex: 'Report index',
    sourcePage: 'Open ClawHub source',
    dataJson: 'View plugin JSON',
    updatedAt: 'Updated',
    methodologyTitle: 'How to read this page',
    methodologyLead:
      'ClawHub plugins now have three public ranking surfaces plus filters for type, verification, and code execution. Breakout judgment should combine board position, verification status, scanner posture, runtime boundaries, and author factories.',
    identicalRankingYes: 'The 3 boards currently look highly aligned',
    identicalRankingNo: 'The 3 boards now show meaningful differences',
    totalPlugins: 'Total plugins',
    codeVsBundle: 'Code / Bundle',
    sourceLinked: 'Source-linked / Clean',
    suspicious: 'Suspicious / Executes code',
    publicStats: 'Public zero-count detail pages',
    mechanicsTitle: 'Platform Mechanics',
    rankingMechanics: 'Ranking mechanics',
    trustMechanics: 'Trust mechanics',
    breakoutMechanics: 'Breakout mechanics',
    publishMoves: 'Publish moves',
    downloadsBoard: 'Downloads board',
    installsBoard: 'Installs board',
    starsBoard: 'Stars board',
    compositeBoard: 'Composite board',
    divergenceBoard: 'Largest cross-board spread',
    authorsBoard: 'Author factories',
    aisaBoard: 'AISA conversion opportunities',
    rank: 'Rank',
    plugin: 'Plugin',
    owner: 'Owner',
    family: 'Family',
    theme: 'Theme',
    verification: 'Verification',
    score: 'Score',
    spread: 'Spread',
    bestBoard: 'Best board',
    totalPluginsLabel: 'Plugins',
    codePluginsLabel: 'Code',
    bundlePluginsLabel: 'Bundle',
    cleanPluginsLabel: 'Clean',
    topThemesLabel: 'Top themes',
    whyItFits: 'Why it fits AISA',
    opportunity: 'Opportunity',
    code: 'Code',
    bundle: 'Bundle',
  },
} as const;

type PluginCopy = (typeof copyByLanguage)[keyof typeof copyByLanguage];

type TableColumn<T> = {
  key: string;
  title: string;
  render: (item: T) => ReactNode;
};

function metric(value: number | null | undefined, language: 'zh' | 'en') {
  return formatMetricValue(value ?? 0, language);
}

function familyLabel(value: string, copy: PluginCopy) {
  return value === 'bundle-plugin' ? copy.bundle : copy.code;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function joinLabels(value: unknown, separator: string, fallback = 'n/a') {
  const labels = toStringArray(value);
  return labels.length ? labels.join(separator) : fallback;
}

function hasPluginDetailPage(url: string) {
  return /^https:\/\/clawhub\.ai\/plugins\/[^?#]+$/.test(url) && !url.toLowerCase().endsWith('.json');
}

function PluginTitle({
  name,
  owner,
  theme,
  url,
}: {
  name: string;
  owner: string;
  theme: string;
  url: string;
}) {
  const title = <strong>{name}</strong>;

  return (
    <>
      {hasPluginDetailPage(url) ? (
        <a href={url} target="_blank" rel="noreferrer">
          {title}
        </a>
      ) : (
        title
      )}
      <span className="plugin-subtext">
        @{owner} · {theme}
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

function MechanicPanel({ title, bullets }: { title: string; bullets: string[] }) {
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
  const [report, setReport] = useState<ClawhubPluginReport | null>(() => peekJsonCache<ClawhubPluginReport>('data/clawhub-plugin-report.json'));

  useDocumentTitle(copy.pageTitle);

  useEffect(() => {
    loadJsonCached<ClawhubPluginReport>('data/clawhub-plugin-report.json')
      .then((json) => {
        setReport(json);
        warmJsonCache(['data/market-ecosystem-report.json']);
      })
      .catch((error) => console.error('Failed to load ClawHub plugin report', error));
  }, []);

  const rankingCards = useMemo(
    () =>
      report
        ? [
            {
              title: copy.downloadsBoard,
              description: language === 'zh' ? '公开 downloads 排行前 10。' : 'Top 10 from the public downloads board.',
              items: report.rankings.downloads.slice(0, 10),
            },
            {
              title: copy.installsBoard,
              description: language === 'zh' ? '公开 installs 排行前 10。' : 'Top 10 from the public installs board.',
              items: report.rankings.installs.slice(0, 10),
            },
            {
              title: copy.starsBoard,
              description: language === 'zh' ? '公开 stars 排行前 10。' : 'Top 10 from the public stars board.',
              items: report.rankings.stars.slice(0, 10),
            },
          ]
        : [],
    [copy.downloadsBoard, copy.installsBoard, copy.starsBoard, language, report],
  );
  const compositeItems = useMemo(
    () => (report ? report.rankings.compositeTop.slice(0, 10).map((item, index) => ({ rank: index + 1, ...item })) : []),
    [report],
  );

  if (!report) {
    return <main className="plugin-shell plugin-loading">{copy.loading}</main>;
  }

  const rankingColumns: Array<TableColumn<PluginRankingRow>> = [
    { key: 'rank', title: copy.rank, render: (item) => item.rank },
    {
      key: 'plugin',
      title: copy.plugin,
      render: (item) => <PluginTitle name={item.name} owner={item.owner} theme={item.theme} url={item.url} />,
    },
    {
      key: 'family',
      title: copy.family,
      render: (item) => <span className="plugin-pill">{familyLabel(item.family, copy)}</span>,
    },
    {
      key: 'verification',
      title: copy.verification,
      render: (item) => item.verificationTier ?? 'n/a',
    },
  ];

  const compositeColumns: Array<TableColumn<PluginCompositeRow & { rank: number }>> = [
    { key: 'rank', title: copy.rank, render: (item) => item.rank },
    {
      key: 'plugin',
      title: copy.plugin,
      render: (item) => <PluginTitle name={item.displayName} owner={item.owner} theme={item.theme} url={item.url} />,
    },
    {
      key: 'score',
      title: copy.score,
      render: (item) => item.compositeScore,
    },
    {
      key: 'bestBoard',
      title: copy.bestBoard,
      render: (item) => joinLabels(item.bestSorts, ' / '),
    },
  ];

  const divergenceColumns: Array<TableColumn<PluginCompositeRow>> = [
    {
      key: 'plugin',
      title: copy.plugin,
      render: (item) => <PluginTitle name={item.displayName} owner={item.owner} theme={item.theme} url={item.url} />,
    },
    { key: 'spread', title: copy.spread, render: (item) => item.rankSpread },
    { key: 'bestBoard', title: copy.bestBoard, render: (item) => joinLabels(item.bestSorts, ' / ') },
  ];

  const authorColumns: Array<TableColumn<PluginAuthorProfile>> = [
    {
      key: 'owner',
      title: copy.owner,
      render: (item) => (
        <>
          <strong>@{item.author}</strong>
          <span className="plugin-subtext">{joinLabels(item.primaryThemes, ' · ')}</span>
        </>
      ),
    },
    { key: 'total', title: copy.totalPluginsLabel, render: (item) => item.totalPlugins },
    { key: 'code', title: copy.codePluginsLabel, render: (item) => item.codePlugins },
    { key: 'bundle', title: copy.bundlePluginsLabel, render: (item) => item.bundlePlugins },
    { key: 'clean', title: copy.cleanPluginsLabel, render: (item) => item.cleanPlugins },
  ];

  const candidateColumns: Array<TableColumn<PluginAisaCandidate>> = [
    {
      key: 'plugin',
      title: copy.plugin,
      render: (item) => <PluginTitle name={item.name} owner={item.owner} theme={item.theme} url={item.url} />,
    },
    { key: 'opportunity', title: copy.opportunity, render: (item) => item.opportunityScore },
    { key: 'why', title: copy.whyItFits, render: (item) => item.whyItFits },
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
            <a className="plugin-link-secondary" href={`${import.meta.env.BASE_URL}reports/index.html`}>
              {copy.reportsIndex}
            </a>
            <a className="plugin-link-secondary" href="https://clawhub.ai/plugins" target="_blank" rel="noreferrer">
              {copy.sourcePage}
            </a>
            <a className="plugin-link-secondary" href={`${import.meta.env.BASE_URL}data/clawhub-plugin-report.json`} target="_blank" rel="noreferrer">
              {copy.dataJson}
            </a>
          </div>
          <div className="plugin-chip-row">
            <span>
              {copy.updatedAt} {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}
            </span>
            <span>{report.methodology.dataDate}</span>
            <span>{report.methodology.identicalRankingOrders ? copy.identicalRankingYes : copy.identicalRankingNo}</span>
          </div>
        </div>

        <div className="plugin-hero-side">
          <div className="plugin-metric-grid">
            <article className="plugin-metric-card tone-gold">
              <span>{copy.totalPlugins}</span>
              <strong>{metric(report.summary.totalPlugins, language)}</strong>
            </article>
            <article className="plugin-metric-card tone-sea">
              <span>{copy.codeVsBundle}</span>
              <strong>
                {metric(report.summary.codePlugins, language)} / {metric(report.summary.bundlePlugins, language)}
              </strong>
            </article>
            <article className="plugin-metric-card tone-forest">
              <span>{copy.sourceLinked}</span>
              <strong>
                {metric(report.summary.sourceLinkedPlugins, language)} / {metric(report.summary.cleanPlugins, language)}
              </strong>
            </article>
            <article className="plugin-metric-card tone-rust">
              <span>{copy.suspicious}</span>
              <strong>
                {metric(report.summary.suspiciousPlugins, language)} / {metric(report.summary.executesCodePlugins, language)}
              </strong>
            </article>
          </div>
          <article className="plugin-metric-card tone-sea">
            <span>{copy.publicStats}</span>
            <strong>
              {metric(report.summary.publicStatsZeroPlugins, language)} / {metric(report.summary.totalPlugins, language)}
            </strong>
          </article>
        </div>
      </section>

      <section className="plugin-note-card">
        <h2>{copy.methodologyTitle}</h2>
        <p>{copy.methodologyLead}</p>
        <ul>
          <li>{report.methodology.note}</li>
          <li>
            {language === 'zh'
              ? `当前头部榜首分别是：downloads ${report.summary.topDownloadsPlugin ?? 'n/a'} / installs ${report.summary.topInstallsPlugin ?? 'n/a'} / stars ${report.summary.topStarsPlugin ?? 'n/a'}`
              : `Current board leaders: downloads ${report.summary.topDownloadsPlugin ?? 'n/a'} / installs ${report.summary.topInstallsPlugin ?? 'n/a'} / stars ${report.summary.topStarsPlugin ?? 'n/a'}`}
          </li>
          <li>
            {language === 'zh'
              ? `当前头部主题 ${report.summary.topTheme ?? 'n/a'}，头部作者 @${report.summary.topAuthor ?? 'n/a'}。`
              : `Current leading theme ${report.summary.topTheme ?? 'n/a'}, top author @${report.summary.topAuthor ?? 'n/a'}.`}
          </li>
        </ul>
      </section>

      <section className="plugin-grid plugin-grid-4">
        <MechanicPanel title={copy.rankingMechanics} bullets={report.mechanics.rankingMechanics} />
        <MechanicPanel title={copy.trustMechanics} bullets={report.mechanics.trustMechanics} />
        <MechanicPanel title={copy.breakoutMechanics} bullets={report.mechanics.breakoutMechanics} />
        <MechanicPanel title={copy.publishMoves} bullets={report.mechanics.publishMoves} />
      </section>

      <section className="plugin-table-grid">
        {rankingCards.map((card) => (
          <TableCard key={card.title} title={card.title} description={card.description} items={card.items} columns={rankingColumns} />
        ))}
        <TableCard
          title={copy.compositeBoard}
          description={
            language === 'zh'
              ? '综合三榜排位、验证、扫描与版本成熟度后的前 10。'
              : 'Top 10 after combining cross-board position, verification, scan status, and version maturity.'
          }
          items={compositeItems}
          columns={compositeColumns}
        />
      </section>

      <section className="plugin-table-grid">
        <TableCard
          title={copy.divergenceBoard}
          description={
            language === 'zh'
              ? '这些 plugin 在不同榜单里的名次差异更大，适合观察“哪种信号更偏向它”。'
              : 'These plugins show larger rank differences across boards, which helps reveal what kind of signal favors them.'
          }
          items={report.rankings.divergenceHighlights.slice(0, 10)}
          columns={divergenceColumns}
        />
        <TableCard
          title={copy.authorsBoard}
          description={
            language === 'zh'
              ? '作者工厂比单个 plugin 更能解释可复制的增长方式。'
              : 'Author factories explain repeatable growth better than any single plugin.'
          }
          items={report.authors.slice(0, 10)}
          columns={authorColumns}
        />
      </section>

      <section className="plugin-grid plugin-grid-2">
        <TableCard
          title={copy.aisaBoard}
          description={
            language === 'zh'
              ? '优先挑远程价值强、驻留依赖弱、可复用性高的 plugin 方向做 AISA API。'
              : 'Prioritize plugin lanes with strong remote value, weak residency requirements, and high repeatability for AISA APIs.'
          }
          items={report.aisaCandidates.slice(0, 12)}
          columns={candidateColumns}
        />
      </section>
    </main>
  );
}
