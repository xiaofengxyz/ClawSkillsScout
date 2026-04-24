import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import type { ClawhubPluginReport, PluginAisaCandidate, PluginAuthorProfile, PluginCompositeRow, PluginSurfaceRow } from './types';
import { LanguageToggle, formatMetricValue, loadJsonCached, peekJsonCache, useAppLanguage, useDocumentTitle, warmJsonCache } from '../site';

const copyByLanguage = {
  zh: {
    pageTitle: 'ClawHub Plugin 情报页',
    loading: '正在加载 ClawHub Plugin 情报...',
    heroEyebrow: 'ClawHub Plugin Intelligence',
    heroTitle: '把 ClawHub plugin 的公开目录、过滤面和信任机制拆开看',
    heroDescription:
      '这页按当前真实公开可见的 plugin 目录顺序、Code / Bundle 过滤、Verified only / Executes code 过滤，以及验证、安全、runtime 信号来分析，不再把 plugin 错写成 `downloads / installs / stars` 三榜。',
    openMarketPage: '打开跨生态情报页',
    reportsIndex: '报告索引',
    sourcePage: '打开 ClawHub 来源页',
    dataJson: '查看 Plugin JSON',
    updatedAt: '更新于',
    currentSurface: '当前公开面',
    cachedSnapshot: '当前使用仓库快照回退',
    liveSnapshot: '当前基于 live 页面',
    totalPlugins: '插件总数',
    codeVsBundle: 'Code / Bundle',
    sourceLinked: 'Source-linked / Clean',
    suspicious: 'Suspicious / Executes code',
    publicStats: '公开零计数详情页',
    methodologyTitle: '这份页面怎么读',
    methodologyLead:
      '截至当前数据日期，ClawHub plugin 页公开可见的是目录顺序和过滤面，而不是像 skill 页那样的下载/星标/安装三榜。所以这里重点看可见曝光、类型边界、验证状态、安全扫描和作者工厂。',
    listingMechanics: '目录与过滤面',
    trustMechanics: '信任机制',
    breakoutMechanics: '爆款机制',
    publishMoves: '发布动作',
    catalogBoard: '当前目录前 10',
    codeBoard: 'Code plugins',
    bundleBoard: 'Bundle plugins',
    verifiedBoard: 'Verified only',
    executesBoard: 'Executes code',
    compositeBoard: '综合优先级',
    authorsBoard: '作者工厂',
    aisaBoard: 'AISA 改造机会',
    rank: '排序',
    catalogRank: '目录位次',
    plugin: 'Plugin',
    owner: '作者',
    family: '类型',
    signals: '信号',
    score: '分数',
    totalPluginsLabel: '插件数',
    codePluginsLabel: 'Code',
    bundlePluginsLabel: 'Bundle',
    cleanPluginsLabel: 'Clean',
    whyItFits: '为什么适合 AISA',
    opportunity: '机会分',
    code: 'Code',
    bundle: 'Bundle',
    surfaceSummaryPrefix: '当前公开可见的 surface：',
    topSummaryPrefix: '当前目录头部 plugin',
    themeSummaryPrefix: '头部主题',
    authorSummaryPrefix: '头部作者',
    signalsCatalogPrefix: '目录',
    signalExecutes: '执行代码',
    signalStatsHidden: '详情页公开计数缺失',
    signalUnknown: '未标明',
  },
  en: {
    pageTitle: 'ClawHub Plugin Intelligence',
    loading: 'Loading ClawHub plugin intelligence...',
    heroEyebrow: 'ClawHub Plugin Intelligence',
    heroTitle: 'See the real public plugin surfaces, filters, and trust mechanics separately',
    heroDescription:
      'This page analyzes the currently visible plugin catalog order, the Code / Bundle filters, the Verified only / Executes code filters, and the verification/security/runtime signals that actually shape conversion. It no longer frames plugins as `downloads / installs / stars` boards.',
    openMarketPage: 'Open market intelligence',
    reportsIndex: 'Report index',
    sourcePage: 'Open ClawHub source',
    dataJson: 'View plugin JSON',
    updatedAt: 'Updated',
    currentSurface: 'Current public surface',
    cachedSnapshot: 'Using repository snapshot fallback',
    liveSnapshot: 'Based on live pages',
    totalPlugins: 'Total plugins',
    codeVsBundle: 'Code / Bundle',
    sourceLinked: 'Source-linked / Clean',
    suspicious: 'Suspicious / Executes code',
    publicStats: 'Public zero-count detail pages',
    methodologyTitle: 'How to read this page',
    methodologyLead:
      'On the current ClawHub plugin page, the visible public surfaces are the listing order and the filters, not separate metric boards like the skill page. So this page emphasizes visible exposure, type boundaries, verification posture, scan outcomes, and author factories.',
    listingMechanics: 'Listing & Filters',
    trustMechanics: 'Trust Mechanics',
    breakoutMechanics: 'Breakout Mechanics',
    publishMoves: 'Publish Moves',
    catalogBoard: 'Current catalog top 10',
    codeBoard: 'Code plugins',
    bundleBoard: 'Bundle plugins',
    verifiedBoard: 'Verified only',
    executesBoard: 'Executes code',
    compositeBoard: 'Composite priority',
    authorsBoard: 'Author factories',
    aisaBoard: 'AISA conversion opportunities',
    rank: 'Rank',
    catalogRank: 'Catalog',
    plugin: 'Plugin',
    owner: 'Owner',
    family: 'Family',
    signals: 'Signals',
    score: 'Score',
    totalPluginsLabel: 'Plugins',
    codePluginsLabel: 'Code',
    bundlePluginsLabel: 'Bundle',
    cleanPluginsLabel: 'Clean',
    whyItFits: 'Why it fits AISA',
    opportunity: 'Opportunity',
    code: 'Code',
    bundle: 'Bundle',
    surfaceSummaryPrefix: 'Visible public surfaces:',
    topSummaryPrefix: 'Current top catalog plugin',
    themeSummaryPrefix: 'Leading theme',
    authorSummaryPrefix: 'Top author',
    signalsCatalogPrefix: 'catalog',
    signalExecutes: 'executes code',
    signalStatsHidden: 'public stats hidden',
    signalUnknown: 'undisclosed',
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

function surfaceName(surface: string, language: 'zh' | 'en') {
  const map =
    language === 'zh'
      ? {
          'all-types': 'All types',
          'code-plugins': 'Code plugins',
          'bundle-plugins': 'Bundle plugins',
          'verified-only': 'Verified only',
          'executes-code': 'Executes code',
        }
      : {
          'all-types': 'All types',
          'code-plugins': 'Code plugins',
          'bundle-plugins': 'Bundle plugins',
          'verified-only': 'Verified only',
          'executes-code': 'Executes code',
        };
  return map[surface as keyof typeof map] ?? surface;
}

function signalSummary(item: PluginSurfaceRow | PluginCompositeRow, copy: PluginCopy) {
  const labels = [`${copy.signalsCatalogPrefix} #${item.catalogRank}`];
  const verificationTier =
    item.verificationTier ?? ('verification' in item ? item.verification?.tier ?? null : null);
  labels.push(verificationTier ?? copy.signalUnknown);
  if (item.scanStatus) {
    labels.push(item.scanStatus);
  }
  if (item.executesCode) {
    labels.push(copy.signalExecutes);
  }
  if (item.publicStatsZero) {
    labels.push(copy.signalStatsHidden);
  }
  return labels.join(' / ');
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

  const primaryCards = useMemo(
    () =>
      report
        ? [
            {
              title: copy.catalogBoard,
              description: language === 'zh' ? '当前公开目录顺序前 10。' : 'Top 10 in the current public catalog order.',
              items: report.surfaces.catalogTop.slice(0, 10),
            },
            {
              title: copy.codeBoard,
              description: language === 'zh' ? '按当前目录顺序过滤出的 Code plugin 前 10。' : 'Top code plugins in the current catalog order.',
              items: report.surfaces.codePlugins.slice(0, 10),
            },
            {
              title: copy.bundleBoard,
              description: language === 'zh' ? '按当前目录顺序过滤出的 Bundle plugin 前 10。' : 'Top bundle plugins in the current catalog order.',
              items: report.surfaces.bundlePlugins.slice(0, 10),
            },
          ]
        : [],
    [copy.bundleBoard, copy.catalogBoard, copy.codeBoard, language, report],
  );

  const filterCards = useMemo(
    () =>
      report
        ? [
            {
              title: copy.verifiedBoard,
              description:
                language === 'zh'
                  ? '公开 `Verified only` 过滤面里最先可见的前 10。'
                  : 'Top 10 most visible plugins under the public `Verified only` filter.',
              items: report.surfaces.verifiedOnly.slice(0, 10),
            },
            {
              title: copy.executesBoard,
              description:
                language === 'zh'
                  ? '公开 `Executes code` 过滤面里最先可见的前 10。'
                  : 'Top 10 most visible plugins under the public `Executes code` filter.',
              items: report.surfaces.executesCode.slice(0, 10),
            },
          ]
        : [],
    [copy.executesBoard, copy.verifiedBoard, language, report],
  );

  const compositeItems = useMemo(
    () => (report ? report.surfaces.compositeTop.slice(0, 10).map((item, index) => ({ rank: index + 1, ...item })) : []),
    [report],
  );

  if (!report) {
    return <main className="plugin-shell plugin-loading">{copy.loading}</main>;
  }

  const surfaceColumns: Array<TableColumn<PluginSurfaceRow>> = [
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
    { key: 'catalogRank', title: copy.catalogRank, render: (item) => item.catalogRank },
    { key: 'signals', title: copy.signals, render: (item) => signalSummary(item, copy) },
  ];

  const compositeColumns: Array<TableColumn<PluginCompositeRow & { rank: number }>> = [
    { key: 'rank', title: copy.rank, render: (item) => item.rank },
    {
      key: 'plugin',
      title: copy.plugin,
      render: (item) => <PluginTitle name={item.displayName} owner={item.owner} theme={item.theme} url={item.url} />,
    },
    { key: 'score', title: copy.score, render: (item) => item.compositeScore },
    { key: 'catalogRank', title: copy.catalogRank, render: (item) => item.catalogRank },
    { key: 'signals', title: copy.signals, render: (item) => signalSummary(item, copy) },
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
            <span>{copy.currentSurface}: {report.methodology.explicitSortBoardsVisible ? 'boards' : 'catalog + filters'}</span>
            <span>{report.methodology.usedExistingSnapshot ? copy.cachedSnapshot : copy.liveSnapshot}</span>
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
            {copy.surfaceSummaryPrefix} {report.methodology.visiblePublicSurfaces.map((surface) => surfaceName(surface, language)).join(' / ')}
          </li>
          <li>
            {copy.topSummaryPrefix} {report.summary.topCatalogPlugin ?? 'n/a'}。{copy.themeSummaryPrefix} {report.summary.topTheme ?? 'n/a'}；{copy.authorSummaryPrefix} @{report.summary.topAuthor ?? 'n/a'}。
          </li>
        </ul>
      </section>

      <section className="plugin-grid plugin-grid-4">
        <MechanicPanel title={copy.listingMechanics} bullets={report.mechanics.listingMechanics} />
        <MechanicPanel title={copy.trustMechanics} bullets={report.mechanics.trustMechanics} />
        <MechanicPanel title={copy.breakoutMechanics} bullets={report.mechanics.breakoutMechanics} />
        <MechanicPanel title={copy.publishMoves} bullets={report.mechanics.publishMoves} />
      </section>

      <section className="plugin-table-grid">
        {primaryCards.map((card) => (
          <TableCard key={card.title} title={card.title} description={card.description} items={card.items} columns={surfaceColumns} />
        ))}
        <TableCard
          title={copy.compositeBoard}
          description={
            language === 'zh'
              ? '结合目录曝光、验证、扫描和版本成熟度后的综合优先级前 10。'
              : 'Top 10 after combining catalog exposure, verification, scan posture, and version maturity.'
          }
          items={compositeItems}
          columns={compositeColumns}
        />
      </section>

      <section className="plugin-table-grid">
        {filterCards.map((card) => (
          <TableCard key={card.title} title={card.title} description={card.description} items={card.items} columns={surfaceColumns} />
        ))}
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
