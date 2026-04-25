import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import { ExternalLink, Layers3, Rocket, ShieldCheck, Sparkles, Target } from 'lucide-react';
import type {
  AgentSkillCreatorProfile,
  AgentSkillReport,
  AgentSkillsSoAuthorProfile,
  AgentSkillsSoReport,
  ClawhubAuthorProfile,
  ClawhubTopSkill,
  MarketEcosystemReport,
  MarketOwnerProfile,
  MarketSkill,
} from './types';
import {
  LanguageToggle,
  formatMetricValue,
  loadJsonCached,
  peekJsonCache,
  useAppLanguage,
  useDocumentTitle,
  warmJsonCache,
} from '../site';

type TabKey = 'overview' | 'clawhub' | 'claude' | 'hermes' | 'agentskill' | 'agentskillsso' | 'aisa';
type MergedOpportunity = MarketSkill & { ecosystem: string };

const copyByLanguage = {
  zh: {
    pageTitle: '跨市场情报',
    loading: '正在加载跨市场情报...',
    loadingSection: '相关数据正在后台加载...',
    heroEyebrow: 'Cross-Market Skill Intelligence',
    heroTitle: '把五个平台放到同一张爆款地图里看',
    heroDescription:
      '这页把 ClawHub、Claude、Hermes、AgentSkill、AgentSkills.so 的实时采样和爆款结构统一翻译成一套“什么会火、为什么会火、哪些最适合改造成 AISA API、发布时要避开什么坑”的实战视图。',
    openClawhubPage: '打开 ClawHub 详情页',
    openPluginPage: 'Plugin 三榜页',
    reportsIndex: '报告索引',
    updatedAt: '更新于',
    topSourceLine: '爆款、风控、AISA 选品一张图',
    tabs: {
      overview: '总览',
      clawhub: 'ClawHub',
      claude: 'Claude',
      hermes: 'Hermes',
      agentskill: 'AgentSkill',
      agentskillsso: 'AgentSkills.so',
      aisa: 'AISA 改造',
    },
    openSource: '打开来源',
    topOpportunities: 'Top opportunities',
    topSkills: 'Top skills',
    topAuthors: 'Top authors',
    topOwners: 'Top owners',
    topMarketplaces: 'Top marketplaces',
    topBundledCandidates: 'Top bundled candidates',
    topCreators: 'Top creators',
    topPlugins: 'Top plugins',
    topPlatformCoverage: 'Top platform coverage',
    opportunityQueue: 'Opportunity queue',
  },
  en: {
    pageTitle: 'Market Intelligence',
    loading: 'Loading market intelligence...',
    loadingSection: 'Related datasets are still loading in the background...',
    heroEyebrow: 'Cross-Market Skill Intelligence',
    heroTitle: 'See five ecosystems on one breakout map',
    heroDescription:
      'This page translates live samples and breakout structures from ClawHub, Claude, Hermes, AgentSkill, and AgentSkills.so into one operating view: what breaks out, why it breaks out, what should become an AISA API, and what release risks to avoid.',
    openClawhubPage: 'Open ClawHub details',
    openPluginPage: 'Plugin boards',
    reportsIndex: 'Report index',
    updatedAt: 'Updated',
    topSourceLine: 'One map for breakout picks, trust signals, and AISA conversion',
    tabs: {
      overview: 'Overview',
      clawhub: 'ClawHub',
      claude: 'Claude',
      hermes: 'Hermes',
      agentskill: 'AgentSkill',
      agentskillsso: 'AgentSkills.so',
      aisa: 'AISA Conversion',
    },
    openSource: 'Open source',
    topOpportunities: 'Top opportunities',
    topSkills: 'Top skills',
    topAuthors: 'Top authors',
    topOwners: 'Top owners',
    topMarketplaces: 'Top marketplaces',
    topBundledCandidates: 'Top bundled candidates',
    topCreators: 'Top creators',
    topPlugins: 'Top plugins',
    topPlatformCoverage: 'Top platform coverage',
    opportunityQueue: 'Opportunity queue',
  },
} as const;

function metric(value: number | string | null | undefined, language: 'zh' | 'en' = 'en') {
  if (typeof value === 'number') return formatMetricValue(value, language);
  return value ?? (language === 'zh' ? '暂无' : 'n/a');
}

function sourceLink(value?: string | null) {
  if (!value) return null;
  return value.startsWith('http') ? value : null;
}

function opportunityKey(item: MergedOpportunity) {
  return `${item.ecosystem}:${item.name}`;
}

function DetailCard({
  title,
  eyebrow,
  lines,
  bullets,
  link,
  linkLabel,
}: {
  title: string;
  eyebrow: string;
  lines: string[];
  bullets?: string[];
  link?: string | null;
  linkLabel?: string;
}) {
  return (
    <article className="mi-detail-card">
      <div className="mi-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <div className="mi-detail-meta">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      {bullets && bullets.length > 0 ? (
        <ul className="mi-bullets">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {link ? (
        <a className="mi-inline-link" href={link} target="_blank" rel="noreferrer">
          {linkLabel ?? 'Open source'} <ExternalLink size={14} />
        </a>
      ) : null}
    </article>
  );
}

function AccordionBoard<T>({
  title,
  items,
  activeKey,
  onSelect,
  getKey,
  renderTitle,
  renderMeta,
  renderDetails,
}: {
  title: string;
  items: T[];
  activeKey: string | null;
  onSelect: (value: string | null) => void;
  getKey: (item: T) => string;
  renderTitle: (item: T) => string;
  renderMeta: (item: T) => string;
  renderDetails: (item: T) => ReactNode;
}) {
  return (
    <section className="mi-list-card">
      <div className="mi-card-top">
        <h3>{title}</h3>
        <span>{items.length}</span>
      </div>
      <div className="mi-list mi-accordion-list">
        {items.map((item) => {
          const key = getKey(item);
          const isActive = key === activeKey;
          return (
            <div key={key} className={`mi-accordion-item${isActive ? ' is-active' : ''}`}>
              <button
                type="button"
                className={`mi-list-item${isActive ? ' is-active' : ''}`}
                onClick={() => onSelect(isActive ? null : key)}
                aria-expanded={isActive}
              >
                <strong>{renderTitle(item)}</strong>
                <small>{renderMeta(item)}</small>
              </button>
              {isActive ? <div className="mi-accordion-body">{renderDetails(item)}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function mappedBullets(...groups: Array<Array<string | undefined> | undefined>) {
  return groups.flat().filter((value): value is string => Boolean(value));
}

function LoadingBoard({ title, message }: { title: string; message: string }) {
  return (
    <section className="mi-list-card">
      <div className="mi-card-top">
        <h3>{title}</h3>
      </div>
      <p className="mi-loading-copy">{message}</p>
    </section>
  );
}

export default function App() {
  const { language, setLanguage } = useAppLanguage();
  const isZh = language === 'zh';
  const copy = copyByLanguage[language];
  const [marketReport, setMarketReport] = useState<MarketEcosystemReport | null>(() => peekJsonCache<MarketEcosystemReport>('data/market-ecosystem-report.json'));
  const [agentSkillReport, setAgentSkillReport] = useState<AgentSkillReport | null>(() => peekJsonCache<AgentSkillReport>('data/agentskill-report.json'));
  const [agentSkillsSoReport, setAgentSkillsSoReport] = useState<AgentSkillsSoReport | null>(() => peekJsonCache<AgentSkillsSoReport>('data/agentskills-so-report.json'));
  const [tab, setTab] = useState<TabKey>('overview');
  const [activeClawhubSkill, setActiveClawhubSkill] = useState<string | null>(null);
  const [activeClawhubAuthor, setActiveClawhubAuthor] = useState<string | null>(null);
  const [activeClaudeSkill, setActiveClaudeSkill] = useState<string | null>(null);
  const [activeClaudeOwner, setActiveClaudeOwner] = useState<string | null>(null);
  const [activeMarketplace, setActiveMarketplace] = useState<string | null>(null);
  const [activeHermesSkill, setActiveHermesSkill] = useState<string | null>(null);
  const [activeHermesOptionalSkill, setActiveHermesOptionalSkill] = useState<string | null>(null);
  const [activeAgentSkill, setActiveAgentSkill] = useState<string | null>(null);
  const [activeAgentCreator, setActiveAgentCreator] = useState<string | null>(null);
  const [activeAgentPlugin, setActiveAgentPlugin] = useState<string | null>(null);
  const [activeAgentSoSkill, setActiveAgentSoSkill] = useState<string | null>(null);
  const [activeAgentSoAuthor, setActiveAgentSoAuthor] = useState<string | null>(null);
  const [activeAisaOpportunity, setActiveAisaOpportunity] = useState<string | null>(null);

  useDocumentTitle(copy.pageTitle);

  useEffect(() => {
    loadJsonCached<MarketEcosystemReport>('data/market-ecosystem-report.json')
      .then((market) => {
        setMarketReport(market);
        warmJsonCache(['data/agentskill-report.json', 'data/agentskills-so-report.json']);
      })
      .catch((error) => console.error('Failed to load market intelligence dataset', error));
  }, []);

  useEffect(() => {
    if (agentSkillReport) return;
    if (!['overview', 'agentskill', 'aisa'].includes(tab)) return;

    loadJsonCached<AgentSkillReport>('data/agentskill-report.json')
      .then((report) => setAgentSkillReport(report))
      .catch((error) => console.error('Failed to load AgentSkill report', error));
  }, [agentSkillReport, tab]);

  useEffect(() => {
    if (agentSkillsSoReport) return;
    if (!['overview', 'agentskillsso', 'aisa'].includes(tab)) return;

    loadJsonCached<AgentSkillsSoReport>('data/agentskills-so-report.json')
      .then((report) => setAgentSkillsSoReport(report))
      .catch((error) => console.error('Failed to load AgentSkills.so report', error));
  }, [agentSkillsSoReport, tab]);

  const mergedOpportunities = useMemo<MergedOpportunity[]>(() => {
    if (!marketReport) return [];

    const opportunities: MergedOpportunity[] = [
      ...marketReport.combined.combinedOpportunities.map((item) => ({ ...item, ecosystem: item.ecosystem ?? 'Market' })),
    ];

    if (agentSkillReport) {
      opportunities.push(
        ...agentSkillReport.skills.topByOpportunity.slice(0, 10).map((item) => ({
          ...item,
          ecosystem: 'AgentSkill Skill',
          summary: item.summary ?? item.description,
          opportunityScore: item.aisaOpportunityScore ?? 0,
          sourceUrl: item.sourceUrl ?? `${agentSkillReport.sources.skills}${item.href ?? ''}`,
        })),
        ...agentSkillReport.plugins.topByOpportunity.slice(0, 8).map((item) => ({
          ...item,
          ecosystem: 'AgentSkill Plugin',
          summary: item.summary ?? item.description,
          opportunityScore: item.aisaOpportunityScore ?? 0,
          sourceUrl: item.sourceUrl ?? `https://agentskill.sh${item.href ?? ''}`,
        })),
      );
    }

    if (agentSkillsSoReport) {
      opportunities.push(
        ...agentSkillsSoReport.skills.topByOpportunity.slice(0, 10).map((item) => ({
          ...item,
          ecosystem: 'AgentSkills.so',
          summary: item.summary ?? item.description,
          opportunityScore: item.aisaOpportunityScore ?? 0,
          sourceUrl: item.sourceUrl ?? `https://agentskills.so${item.href ?? ''}`,
        })),
      );
    }

    return opportunities
      .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
      .slice(0, 36);
  }, [marketReport, agentSkillReport, agentSkillsSoReport]);

  if (!marketReport) {
    return <main className="mi-shell mi-loading">{copy.loading}</main>;
  }

  const notAvailable = isZh ? '暂无' : 'n/a';
  const hermesLiveGuide = marketReport.hermes.liveGuide ?? {
    sourceUrl: marketReport.hermes.sourceUrl,
    advertisedSkillCategories: marketReport.hermes.summary.advertisedSkillCategories,
    advertisedBundledSkills: marketReport.hermes.summary.advertisedBundledSkills,
    categoryButtons: marketReport.hermes.categoryButtons ?? [],
    liveFetchError: '',
  };
  const hermesRawCatalog = marketReport.hermes.rawCatalog ?? {
    sourceDocUrl: marketReport.hermes.sourceDocUrl,
    parsedSkillRows: marketReport.hermes.summary.totalSkills,
    bundledRows: marketReport.hermes.summary.bundledSkills,
    optionalRows: marketReport.hermes.summary.optionalSkills,
    totalSections: marketReport.hermes.summary.sections,
    sectionBreakdown: marketReport.hermes.sections ?? [],
    bundledSectionBreakdown: marketReport.hermes.sections ?? [],
    optionalSectionBreakdown: [],
    bundledSections: [],
    optionalSections: [],
  };
  const hermesTopSections = (hermesRawCatalog.sectionBreakdown ?? []).slice(0, 5).map((item) => `${item.name} ${item.count}`);
  const hermesTopTags = marketReport.hermes.tags.slice(0, 6).map((item) => `${item.name} ${item.count}`);
  const extendedExecutionLanes = [
    ...marketReport.combined.executionLanes,
    isZh
      ? 'AgentSkill 负责验证 quality / security / rating 驱动的技能与 plugin 分发表现。'
      : 'Use AgentSkill to validate how quality, security, and rating drive skill and plugin distribution.',
    isZh
      ? 'AgentSkills.so 负责验证周下载、repo 信任和安全姿态对技能商品化的影响。'
      : 'Use AgentSkills.so to validate how weekly downloads, repo trust, and security posture shape skill productization.',
  ];

  return (
    <main className="mi-shell">
      <section className="page-toolbar">
        <LanguageToggle language={language} onChange={setLanguage} />
      </section>

      <section className="mi-hero">
        <div className="mi-hero-copy">
          <div className="mi-eyebrow">{copy.heroEyebrow}</div>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroDescription}</p>
          <div className="mi-hero-links">
            <a href={`${import.meta.env.BASE_URL}clawhub-download-insights.html`} className="mi-primary-link">
              {copy.openClawhubPage}
            </a>
            <a href={`${import.meta.env.BASE_URL}clawhub-plugins.html`} className="mi-secondary-link">
              {copy.openPluginPage}
            </a>
            <a href={marketReport.sources.claudeSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              {isZh ? 'Claude 技能' : 'Claude Skills'}
            </a>
            <a href={marketReport.sources.hermesSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              {isZh ? 'Hermes 技能' : 'Hermes Skills'}
            </a>
            {agentSkillReport ? (
              <a href={agentSkillReport.sources.skills} target="_blank" rel="noreferrer" className="mi-secondary-link">
                AgentSkill
              </a>
            ) : null}
            {agentSkillsSoReport ? (
              <a href={agentSkillsSoReport.sources.listings[0]} target="_blank" rel="noreferrer" className="mi-secondary-link">
                AgentSkills.so
              </a>
            ) : null}
            <a href={`${import.meta.env.BASE_URL}reports/`} target="_blank" rel="noreferrer" className="mi-secondary-link">
              {copy.reportsIndex}
            </a>
          </div>
          <div className="mi-chip-row">
            <span>
              {copy.updatedAt} {format(new Date(marketReport.generatedAt), 'yyyy-MM-dd HH:mm')}
            </span>
            <span>ClawHub + Claude + Hermes + AgentSkill + AgentSkills.so</span>
            <span>{copy.topSourceLine}</span>
          </div>
        </div>
        <div className="mi-stat-grid">
          <article className="mi-stat-card tone-sand">
            <Sparkles size={18} />
            <span>{isZh ? 'ClawHub Top 200 可转 AISA' : 'ClawHub Top 200 convertible to AISA'}</span>
            <strong>{metric(marketReport.clawhub.summary.top200ConvertibleCandidates, language)}</strong>
          </article>
          <article className="mi-stat-card tone-sea">
            <Layers3 size={18} />
            <span>{isZh ? 'Claude 技能 / 市场' : 'Claude Skills / Markets'}</span>
            <strong>
              {metric(marketReport.claude.skills.summary.totalSkills, language)} / {metric(marketReport.claude.marketplaces.summary.totalMarketplaces, language)}
            </strong>
          </article>
          <article className="mi-stat-card tone-forest">
            <Rocket size={18} />
            <span>{isZh ? 'Hermes raw / live' : 'Hermes raw / live'}</span>
            <strong>
              {metric(hermesRawCatalog.bundledRows, language)} / {metric(hermesLiveGuide.advertisedBundledSkills, language)}
            </strong>
          </article>
          <article className="mi-stat-card tone-rust">
            <Target size={18} />
            <span>{isZh ? 'AgentSkill 样本' : 'AgentSkill sample'}</span>
            <strong>
              {metric(agentSkillReport?.summary.sampledSkills, language)} / {metric(agentSkillReport?.summary.sampledPlugins, language)}
            </strong>
          </article>
          <article className="mi-stat-card tone-sea">
            <ShieldCheck size={18} />
            <span>{isZh ? 'AgentSkills.so 样本' : 'AgentSkills.so sample'}</span>
            <strong>{metric(agentSkillsSoReport?.summary.sampledSkills, language)}</strong>
          </article>
          <article className="mi-stat-card tone-sand">
            <Sparkles size={18} />
            <span>{isZh ? '统一 AISA 队列' : 'Unified AISA Queue'}</span>
            <strong>{metric(mergedOpportunities.length, language)}</strong>
          </article>
        </div>
      </section>

      <section className="mi-tabs">
        {[
          ['overview', copy.tabs.overview],
          ['clawhub', copy.tabs.clawhub],
          ['claude', copy.tabs.claude],
          ['hermes', copy.tabs.hermes],
          ['agentskill', copy.tabs.agentskill],
          ['agentskillsso', copy.tabs.agentskillsso],
          ['aisa', copy.tabs.aisa],
        ].map(([value, label]) => (
          <button key={value} type="button" className={`mi-tab${tab === value ? ' is-active' : ''}`} onClick={() => setTab(value as TabKey)}>
            {label}
          </button>
        ))}
      </section>

      {tab === 'overview' ? (
        <>
          <section className="mi-grid mi-grid-3">
            <DetailCard
              title={isZh ? 'ClawHub 现在给我们什么' : 'What ClawHub gives us now'}
              eyebrow="ClawHub"
              lines={[
                isZh
                  ? `最强总榜 skill: ${marketReport.clawhub.summary.topSkillAcrossThreeLists.name}`
                  : `Top all-list skill: ${marketReport.clawhub.summary.topSkillAcrossThreeLists.name}`,
                isZh
                  ? `下载榜主类目: ${marketReport.clawhub.summary.downloadsTopCategory}`
                  : `Top downloads category: ${marketReport.clawhub.summary.downloadsTopCategory}`,
                isZh
                  ? `现有 AISA skills 规划: ${metric(marketReport.clawhub.summary.existingAisaSkillsPlanned, language)}`
                  : `Existing AISA skills planned: ${metric(marketReport.clawhub.summary.existingAisaSkillsPlanned, language)}`,
              ]}
              bullets={marketReport.clawhub.viralPlaybook.keySuccessFactors.slice(0, 4)}
              link={`${import.meta.env.BASE_URL}clawhub-download-insights.html`}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title={isZh ? 'Claude 市场给我们的增量' : 'What Claude adds'}
              eyebrow="Claude"
              lines={[
                `${isZh ? '技能数' : 'Skills'}: ${metric(marketReport.claude.skills.summary.totalSkills, language)}`,
                `${isZh ? '安装榜主类目' : 'Top installs category'}: ${marketReport.claude.skills.summary.topCategory}`,
                `${isZh ? '市场数' : 'Marketplaces'}: ${metric(marketReport.claude.marketplaces.summary.totalMarketplaces, language)}`,
              ]}
              bullets={marketReport.claude.skills.commonPatterns.slice(0, 4)}
              link={marketReport.sources.claudeSkills}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title={isZh ? 'Hermes 适合作为什么' : 'What Hermes is best for'}
              eyebrow="Hermes"
              lines={[
                isZh
                  ? `live guide ${metric(hermesLiveGuide.advertisedBundledSkills, language)} 个 bundled skills`
                  : `Live guide ${metric(hermesLiveGuide.advertisedBundledSkills, language)} bundled skills`,
                isZh
                  ? `raw catalog ${metric(hermesRawCatalog.bundledRows, language)} 个 bundled + ${metric(hermesRawCatalog.optionalRows, language)} 个 optional`
                  : `Raw catalog ${metric(hermesRawCatalog.bundledRows, language)} bundled + ${metric(hermesRawCatalog.optionalRows, language)} optional`,
                isZh
                  ? `头部 sections: ${hermesTopSections.slice(0, 3).join(' · ')}`
                  : `Top raw sections: ${hermesTopSections.slice(0, 3).join(' · ')}`,
              ]}
              bullets={marketReport.hermes.commonPatterns.slice(0, 4)}
              link={marketReport.sources.hermesCatalog}
              linkLabel={copy.openSource}
            />
            {agentSkillReport ? (
              <DetailCard
                title={isZh ? 'AgentSkill 的启发' : 'What AgentSkill teaches us'}
                eyebrow="AgentSkill"
                lines={[
                  `${isZh ? '技能 / 插件 / 作者' : 'skills / plugins / creators'}: ${metric(agentSkillReport.summary.sampledSkills, language)} / ${metric(agentSkillReport.summary.sampledPlugins, language)} / ${metric(agentSkillReport.summary.sampledCreators, language)}`,
                  `${isZh ? '抓取到的 owner 页' : 'Owner pages fetched'}: ${metric(agentSkillReport.summary.ownerPagesFetched, language)}`,
                  `${isZh ? '头部类目' : 'Top category'}: ${agentSkillReport.summary.topSkillCategory ?? notAvailable}`,
                ]}
                bullets={mappedBullets(agentSkillReport.skills.commonPatterns.slice(0, 3), [agentSkillReport.sampleNotes.skills])}
                link={agentSkillReport.sources.skills}
                linkLabel={copy.openSource}
              />
            ) : (
              <LoadingBoard title={isZh ? 'AgentSkill 的启发' : 'AgentSkill insights'} message={copy.loadingSection} />
            )}
            {agentSkillsSoReport ? (
              <DetailCard
                title={isZh ? 'AgentSkills.so 的启发' : 'What AgentSkills.so teaches us'}
                eyebrow="AgentSkills.so"
                lines={[
                  `${isZh ? '采样技能数' : 'Sampled skills'}: ${metric(agentSkillsSoReport.summary.sampledSkills, language)}`,
                  `${isZh ? '采样作者数' : 'Sampled authors'}: ${metric(agentSkillsSoReport.summary.sampledAuthors, language)}`,
                  `${isZh ? '平均平台覆盖' : 'Avg platform coverage'}: ${metric(agentSkillsSoReport.summary.avgPlatformCoverage, language)}`,
                ]}
                bullets={mappedBullets(
                  agentSkillsSoReport.skills.commonPatterns.slice(0, 2),
                  [
                    `${isZh ? '头部类目' : 'Top category'}: ${agentSkillsSoReport.summary.topCategory ?? notAvailable}`,
                    `${isZh ? '分页抓取页数' : 'Listing pages fetched'}: ${agentSkillsSoReport.sampleNotes.pagesFetched.length}`,
                    `${isZh ? '安全细分已解析样本' : 'Resolved security samples'}: ${metric(agentSkillsSoReport.summary.resolvedSecuritySamples, language)}`,
                  ],
                )}
                link={agentSkillsSoReport.sources.listings[0]}
                linkLabel={copy.openSource}
              />
            ) : (
              <LoadingBoard title={isZh ? 'AgentSkills.so 的启发' : 'AgentSkills.so insights'} message={copy.loadingSection} />
            )}
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? '跨平台最值得做的 AISA 机会' : 'Best cross-platform AISA opportunities'}</h2>
              <p>
                {isZh
                  ? '把五个平台合并以后，真正值得先抢的位置会进一步集中，而且“爆款”与“可发布”开始重叠。'
                  : 'Once the five ecosystems are combined, the best positions become more concentrated and breakout demand starts overlapping with publishable formats.'}
              </p>
            </div>
            <AccordionBoard
              title={copy.topOpportunities}
              items={mergedOpportunities}
              activeKey={activeAisaOpportunity}
              onSelect={setActiveAisaOpportunity}
              getKey={opportunityKey}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${item.ecosystem} · ${item.category} · ${metric(item.opportunityScore ?? item.aisaOpportunityScore, language)}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={item.ecosystem}
                  lines={[
                    item.targetTitle,
                    `${item.category} · ${item.apiFamily}`,
                    `${isZh ? '机会分' : 'Opportunity score'} ${metric(item.opportunityScore ?? item.aisaOpportunityScore, language)}`,
                  ]}
                  bullets={mappedBullets([item.summary ?? item.description], item.moves?.slice(0, 3))}
                  link={sourceLink(item.sourceUrl ?? item.url)}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>
        </>
      ) : null}

      {tab === 'clawhub' ? (
        <>
          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'ClawHub 爆款 Skill' : 'ClawHub breakout skills'}</h2>
              <p>{isZh ? '看清当前真实榜单里最强 skill 的共同点，再决定 AISA 要抢哪条线。' : 'See the strongest shared traits in the real leaderboard before deciding which AISA line to take.'}</p>
            </div>
            <AccordionBoard
              title={copy.topSkills}
              items={marketReport.clawhub.topSkills}
              activeKey={activeClawhubSkill}
              onSelect={setActiveClawhubSkill}
              getKey={(item) => item.slug}
              renderTitle={(item) => item.name}
              renderMeta={(item) =>
                isZh
                  ? `${metric(item.downloads, language)} 下载 · ${metric(item.stars, language)} 星 · ${metric(item.installsCurrent, language)} 装`
                  : `${metric(item.downloads, language)} downloads · ${metric(item.stars, language)} stars · ${metric(item.installsCurrent, language)} installs`
              }
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={`@${item.author}`}
                  lines={[
                    isZh
                      ? `${metric(item.downloads, language)} 下载 · ${metric(item.stars, language)} 星 · ${metric(item.installsCurrent, language)} 装`
                      : `${metric(item.downloads, language)} downloads · ${metric(item.stars, language)} stars · ${metric(item.installsCurrent, language)} installs`,
                    isZh ? `${item.theme} · 三榜出现 ${item.appearances} 次` : `${item.theme} · appeared ${item.appearances} times across the 3 lists`,
                    isZh
                      ? `下载榜 #${item.ranks.downloads} · 星标榜 #${item.ranks.stars} · 安装榜 #${item.ranks.installs}`
                      : `downloads #${item.ranks.downloads} · stars #${item.ranks.stars} · installs #${item.ranks.installs}`,
                  ]}
                  bullets={[item.description]}
                  link={item.url}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'ClawHub 爆款作者' : 'ClawHub breakout authors'}</h2>
              <p>{isZh ? '把作者画像做清楚以后，复制打法会比只看单 skill 更稳。' : 'A clear author profile makes the repeatable playbook more reliable than studying a single skill.'}</p>
            </div>
            <AccordionBoard
              title={copy.topAuthors}
              items={marketReport.clawhub.topAuthorProfiles}
              activeKey={activeClawhubAuthor}
              onSelect={setActiveClawhubAuthor}
              getKey={(item) => item.author}
              renderTitle={(item) => `@${item.author}`}
              renderMeta={(item) =>
                isZh ? `${item.totalSkills} 个技能 · ${item.topSkills.length} 个头部样本` : `${item.totalSkills} total skills · ${item.topSkills.length} top samples`
              }
              renderDetails={(item) => (
                <DetailCard
                  title={`@${item.author}`}
                  eyebrow={isZh ? '作者画像' : 'Author profile'}
                  lines={[
                    isZh ? `${item.totalSkills} 个技能` : `${item.totalSkills} total skills`,
                    item.topSkills.slice(0, 3).map((skill) => skill.name).join(' · '),
                    isZh ? '更适合做平台词 + 高频工具词矩阵' : 'Best suited to platform keywords plus high-frequency tool keyword matrices',
                  ]}
                  bullets={item.topSkills.slice(0, 5).map((skill) =>
                    isZh ? `${skill.name} · ${metric(skill.downloads, language)} 下载 · ${skill.theme}` : `${skill.name} · ${metric(skill.downloads, language)} downloads · ${skill.theme}`,
                  )}
                />
              )}
            />
          </section>
        </>
      ) : null}

      {tab === 'claude' ? (
        <>
          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'Claude Skills 爆款结构' : 'Claude Skills breakout structure'}</h2>
              <p>{isZh ? '这里更像是“GitHub 高星 repo 的 skill 分发层”，安装和信任高度绑定仓库本身。' : 'This behaves more like a skill distribution layer for high-star GitHub repos, where installs and trust are tightly bound to the repo itself.'}</p>
            </div>
            <AccordionBoard
              title={copy.topSkills}
              items={marketReport.claude.skills.topByInstalls}
              activeKey={activeClaudeSkill}
              onSelect={setActiveClaudeSkill}
              getKey={(item) => item.name}
              renderTitle={(item) => item.name}
              renderMeta={(item) =>
                isZh ? `${metric(item.installs, language)} 装 · ${metric(item.stars, language)} 星 · ${item.category}` : `${metric(item.installs, language)} installs · ${metric(item.stars, language)} stars · ${item.category}`
              }
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={`@${item.owner}`}
                  lines={[
                    isZh
                      ? `${metric(item.installs, language)} 装 · ${metric(item.stars, language)} 星`
                      : `${metric(item.installs, language)} installs · ${metric(item.stars, language)} stars`,
                    `${item.category} · ${item.apiFamily}`,
                    item.targetTitle,
                  ]}
                  bullets={mappedBullets([item.summary ?? item.description], item.moves?.slice(0, 3))}
                  link={sourceLink(item.repo ? `https://github.com/${item.repo}` : null)}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'Claude Skill 作者 / 仓库画像' : 'Claude skill owner / repo profile'}</h2>
              <p>{isZh ? '能量产的往往不是单 skill，而是一整个 skill repo。' : 'The scalable asset is usually not a single skill but an entire skill repo.'}</p>
            </div>
            <AccordionBoard
              title={copy.topOwners}
              items={marketReport.claude.skills.topOwners}
              activeKey={activeClaudeOwner}
              onSelect={setActiveClaudeOwner}
              getKey={(item) => item.owner}
              renderTitle={(item) => `@${item.owner}`}
              renderMeta={(item) =>
                isZh
                  ? `${metric(item.totalStars, language)} 星 · ${metric(item.totalInstalls, language)} 装`
                  : `${metric(item.totalStars, language)} stars · ${metric(item.totalInstalls, language)} installs`
              }
              renderDetails={(item) => (
                <DetailCard
                  title={`@${item.owner}`}
                  eyebrow={isZh ? 'Skill 仓库画像' : 'Skill repo profile'}
                  lines={[
                    isZh
                      ? `${metric(item.skillCount, language)} 个技能 · ${metric(item.repoCount, language)} 个仓库`
                      : `${metric(item.skillCount, language)} skills · ${metric(item.repoCount, language)} repos`,
                    isZh
                      ? `${metric(item.totalInstalls, language)} 装 · ${metric(item.totalStars, language)} 星`
                      : `${metric(item.totalInstalls, language)} installs · ${metric(item.totalStars, language)} stars`,
                    item.primaryCategories.join(' · '),
                  ]}
                  bullets={item.topSkills?.slice(0, 5).map((skill) =>
                    isZh ? `${skill.name} · ${metric(skill.installs, language)} 装 · ${skill.category}` : `${skill.name} · ${metric(skill.installs, language)} installs · ${skill.category}`,
                  )}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'Claude 市场仓库' : 'Claude marketplaces'}</h2>
              <p>{isZh ? '它们更像“矩阵化分发仓库”，适合学习旗舰仓库 + 多变体 skill 的运营方式。' : 'These behave more like matrix distribution repos, useful for learning flagship-repo plus multi-variant skill operations.'}</p>
            </div>
            <AccordionBoard
              title={copy.topMarketplaces}
              items={marketReport.claude.marketplaces.topByStars}
              activeKey={activeMarketplace}
              onSelect={setActiveMarketplace}
              getKey={(item) => item.repo ?? item.name}
              renderTitle={(item) => item.repo ?? item.name}
              renderMeta={(item) =>
                isZh ? `${metric(item.stars, language)} 星 · ${metric(item.pluginCount, language)} 个插件 · ${item.category}` : `${metric(item.stars, language)} stars · ${metric(item.pluginCount, language)} plugins · ${item.category}`
              }
              renderDetails={(item) => (
                <DetailCard
                  title={item.repo ?? item.name}
                  eyebrow={`@${item.owner}`}
                  lines={[
                    isZh
                      ? `${metric(item.stars, language)} 星 · ${metric(item.pluginCount, language)} 个插件`
                      : `${metric(item.stars, language)} stars · ${metric(item.pluginCount, language)} plugins`,
                    `${item.category} · ${item.apiFamily}`,
                    item.targetTitle,
                  ]}
                  bullets={mappedBullets([item.description], item.moves?.slice(0, 3))}
                  link={sourceLink(item.repo ? `https://github.com/${item.repo}` : null)}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>
        </>
      ) : null}

      {tab === 'hermes' ? (
        <>
          <section className="mi-grid mi-grid-3">
            <DetailCard
              title={isZh ? 'Hermes live guide' : 'Hermes live guide'}
              eyebrow={isZh ? '在线指南' : 'Live guide'}
              lines={[
                isZh
                  ? `bundled：${metric(hermesLiveGuide.advertisedBundledSkills, language)}`
                  : `Bundled skills: ${metric(hermesLiveGuide.advertisedBundledSkills, language)}`,
                isZh
                  ? `categories：${metric(hermesLiveGuide.advertisedSkillCategories, language)}`
                  : `Categories: ${metric(hermesLiveGuide.advertisedSkillCategories, language)}`,
                isZh
                  ? `筛选按钮：${metric(hermesLiveGuide.categoryButtons.length, language)}`
                  : `Filter buttons: ${metric(hermesLiveGuide.categoryButtons.length, language)}`,
              ]}
              bullets={hermesLiveGuide.categoryButtons.slice(0, 12).map((item) => (isZh ? `官方筛选：${item}` : `Official filter: ${item}`))}
              link={marketReport.sources.hermesSkills}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title={isZh ? 'Hermes raw catalog' : 'Hermes raw catalog'}
              eyebrow={isZh ? '原始目录' : 'Raw catalog'}
              lines={[
                isZh
                  ? `bundled ${metric(hermesRawCatalog.bundledRows, language)} · optional ${metric(hermesRawCatalog.optionalRows, language)}`
                  : `bundled ${metric(hermesRawCatalog.bundledRows, language)} · optional ${metric(hermesRawCatalog.optionalRows, language)}`,
                isZh
                  ? `sections ${metric(hermesRawCatalog.totalSections, language)}`
                  : `sections ${metric(hermesRawCatalog.totalSections, language)}`,
                hermesTopSections.slice(0, 4).join(' · '),
              ]}
              bullets={hermesRawCatalog.sectionBreakdown.slice(0, 8).map((item) =>
                isZh ? `${item.name}：${metric(item.count, language)}` : `${item.name}: ${metric(item.count, language)}`,
              )}
              link={marketReport.sources.hermesCatalog}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title={isZh ? '我们该怎么用 Hermes' : 'How we should use Hermes'}
              eyebrow={isZh ? '角色' : 'Role'}
              lines={
                isZh
                  ? ['拿它做“官方工作流 atlas”', '不是单纯看热度榜', '更适合反推哪些能力值得 API 化']
                  : ['Use it as an official workflow atlas', 'Not just as a popularity board', 'Best for inferring which capabilities deserve API packaging']
              }
              bullets={[...hermesTopTags.slice(0, 3), ...marketReport.hermes.commonPatterns.slice(0, 3)]}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'Hermes 最适合转 AISA 的打包技能' : 'Hermes bundled skills most suited for AISA'}</h2>
              <p>{isZh ? '它没有公开下载榜，所以我们按工作流价值、可 API 化程度、是否适合矩阵化扩张来排序。' : 'Hermes has no public download leaderboard, so these are ranked by workflow value, API-ability, and matrix expansion fit.'}</p>
            </div>
            <AccordionBoard
              title={copy.topBundledCandidates}
              items={marketReport.hermes.bundled}
              activeKey={activeHermesSkill}
              onSelect={setActiveHermesSkill}
              getKey={(item) => item.name}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${item.sectionTitle} · ${item.category} · ${metric(item.aisaOpportunityScore, language)}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={item.sectionTitle ?? 'Hermes'}
                  lines={[`${item.category} · ${item.apiFamily}`, item.targetTitle, item.platformScope ?? (isZh ? '跨平台' : 'cross-platform')]}
                  bullets={mappedBullets([item.description], item.moves?.slice(0, 3))}
                  link={marketReport.sources.hermesCatalog}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'Hermes optional 技能机会' : 'Hermes optional skills worth watching'}</h2>
              <p>
                {isZh
                  ? 'raw catalog 现在已经把 optional skills 单独成层，页面也单独展示，方便区分“内置默认能力”和“可额外安装能力”。'
                  : 'The raw catalog now exposes optional skills as a distinct layer, so the page shows them separately from bundled defaults.'}
              </p>
            </div>
            <AccordionBoard
              title={isZh ? 'Top optional candidates' : 'Top optional candidates'}
              items={marketReport.hermes.optional}
              activeKey={activeHermesOptionalSkill}
              onSelect={setActiveHermesOptionalSkill}
              getKey={(item) => item.name}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${item.sectionTitle} · ${item.category} · ${metric(item.aisaOpportunityScore, language)}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={item.sectionTitle ?? 'Hermes'}
                  lines={[`${item.category} · ${item.apiFamily}`, item.targetTitle, item.platformScope ?? (isZh ? '跨平台' : 'cross-platform')]}
                  bullets={mappedBullets([item.description], item.moves?.slice(0, 3))}
                  link={marketReport.sources.hermesCatalog}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>
        </>
      ) : null}

      {tab === 'agentskill' ? (
        agentSkillReport ? (
          <>
            <section className="mi-grid mi-grid-3">
              <DetailCard
                title={isZh ? '样本覆盖' : 'Coverage'}
                eyebrow={isZh ? '覆盖面' : 'Coverage'}
                lines={[
                  isZh
                    ? `技能 ${metric(agentSkillReport.summary.sampledSkills, language)} · 插件 ${metric(agentSkillReport.summary.sampledPlugins, language)}`
                    : `skills ${metric(agentSkillReport.summary.sampledSkills, language)} · plugins ${metric(agentSkillReport.summary.sampledPlugins, language)}`,
                  isZh
                    ? `作者 ${metric(agentSkillReport.summary.sampledCreators, language)} · 作者页 ${metric(agentSkillReport.summary.ownerPagesFetched, language)}`
                    : `creators ${metric(agentSkillReport.summary.sampledCreators, language)} · owner pages ${metric(agentSkillReport.summary.ownerPagesFetched, language)}`,
                  `${isZh ? '头部技能类目' : 'Top skill category'}: ${agentSkillReport.summary.topSkillCategory ?? notAvailable}`,
                ]}
                bullets={[agentSkillReport.sampleNotes.skills, agentSkillReport.sampleNotes.plugins]}
                link={agentSkillReport.sources.skills}
                linkLabel={copy.openSource}
              />
              <DetailCard
                title={isZh ? '质量与安全' : 'Quality and security'}
                eyebrow={isZh ? '信任层' : 'Trust stack'}
                lines={[
                  isZh ? `平均质量 ${metric(agentSkillReport.summary.avgQualityScore, language)}/100` : `avg quality ${metric(agentSkillReport.summary.avgQualityScore, language)}/100`,
                  isZh ? `平均安全 ${metric(agentSkillReport.summary.avgSecurityScore, language)}/100` : `avg security ${metric(agentSkillReport.summary.avgSecurityScore, language)}/100`,
                  isZh ? `GitHub 星标 ${metric(agentSkillReport.summary.totalSkillGithubStars, language)}` : `GitHub stars ${metric(agentSkillReport.summary.totalSkillGithubStars, language)}`,
                ]}
                bullets={agentSkillReport.rankingFactors.slice(0, 4).map((item) => `${item.factor}: ${item.evidence}`)}
              />
              <DetailCard
                title={isZh ? '我们该怎么用 AgentSkill' : 'How we should use AgentSkill'}
                eyebrow={isZh ? '打法' : 'Playbook'}
                lines={
                  isZh
                    ? ['把 quality/security/rating 当作产品表面', 'owner factory 比单点 skill 更重要', 'plugin 层适合做大主题合集']
                    : ['Treat quality, security, and rating as the product surface', 'Owner factories matter more than single skills', 'The plugin layer fits large thematic bundles']
                }
                bullets={agentSkillReport.skills.commonPatterns.slice(0, 4)}
              />
            </section>

            <section className="mi-board">
              <div className="mi-section-top">
                <h2>{isZh ? 'AgentSkill 高机会 Skill' : 'High-opportunity AgentSkill skills'}</h2>
                <p>{isZh ? '这一层最能验证“任务命名 + GitHub 信任 + quality/security review”是否一起推高转化。' : 'This layer is best for validating whether task naming, GitHub trust, and quality/security review lift conversion together.'}</p>
              </div>
              <AccordionBoard
                title={copy.topSkills}
                items={agentSkillReport.skills.topByOpportunity}
                activeKey={activeAgentSkill}
                onSelect={setActiveAgentSkill}
                getKey={(item) => item.name}
                renderTitle={(item) => item.name}
                renderMeta={(item) =>
                  isZh
                    ? `${metric(item.installs, language)} 装 · ${metric(item.githubStars, language)} 星 · ${metric(item.aisaOpportunityScore, language)}`
                    : `${metric(item.installs, language)} installs · ${metric(item.githubStars, language)} stars · ${metric(item.aisaOpportunityScore, language)}`
                }
                renderDetails={(item) => (
                  <DetailCard
                    title={item.name}
                    eyebrow={`@${item.owner}`}
                    lines={[
                      isZh ? `${metric(item.installs, language)} 装 · ${metric(item.githubStars, language)} 星` : `${metric(item.installs, language)} installs · ${metric(item.githubStars, language)} stars`,
                      `${item.category} · ${item.apiFamily}`,
                      item.targetTitle,
                    ]}
                    bullets={[
                      item.description,
                      isZh
                        ? `质量 ${metric(item.qualityScore, language)} · 安全 ${metric(item.securityScore, language)}`
                        : `quality ${metric(item.qualityScore, language)} · security ${metric(item.securityScore, language)}`,
                    ]}
                    link={sourceLink(item.sourceUrl ?? `https://agentskill.sh${item.href ?? ''}`)}
                    linkLabel={copy.openSource}
                  />
                )}
              />
            </section>

            <section className="mi-board">
              <div className="mi-section-top">
                <h2>{isZh ? 'AgentSkill 作者工厂' : 'AgentSkill creator factories'}</h2>
                <p>{isZh ? '最有价值的不是单次爆款，而是可以连续产出同主题高质 skill 的作者结构。' : 'The highest-value asset is not a single hit, but a creator structure that can keep shipping high-quality skills in one theme.'}</p>
              </div>
              <AccordionBoard
                title={copy.topCreators}
                items={agentSkillReport.creators.topCreators}
                activeKey={activeAgentCreator}
                onSelect={setActiveAgentCreator}
                getKey={(item) => item.owner}
                renderTitle={(item) => `@${item.owner}`}
                renderMeta={(item) =>
                  isZh
                    ? `${metric(item.sampledSkills, language)} 个技能 · ${metric(item.sampledPlugins, language)} 个插件`
                    : `${metric(item.sampledSkills, language)} skills · ${metric(item.sampledPlugins, language)} plugins`
                }
                renderDetails={(item) => (
                  <DetailCard
                    title={`@${item.owner}`}
                    eyebrow={isZh ? '作者工厂' : 'Creator factory'}
                    lines={[
                      isZh
                        ? `${item.sampledSkills} 个采样技能 · ${item.sampledPlugins} 个采样插件`
                        : `${item.sampledSkills} sampled skills · ${item.sampledPlugins} sampled plugins`,
                      isZh
                        ? `${metric(item.totalInstalls, language)} 装 · ${metric(item.totalGithubStars, language)} 星`
                        : `${metric(item.totalInstalls, language)} installs · ${metric(item.totalGithubStars, language)} stars`,
                      item.primaryCategories.join(' · '),
                    ]}
                    bullets={[
                      isZh
                        ? `平均质量 ${metric(item.avgQualityScore, language)} / 平均安全 ${metric(item.avgSecurityScore, language)}`
                        : `avg quality ${metric(item.avgQualityScore, language)} / avg security ${metric(item.avgSecurityScore, language)}`,
                      isZh ? '更适合做旗舰 skill + 窄变体 + 同主题 plugin ladder' : 'Best suited to a flagship skill plus narrow variants plus a same-theme plugin ladder',
                    ]}
                  />
                )}
              />
            </section>

            <section className="mi-board">
              <div className="mi-section-top">
                <h2>{isZh ? 'AgentSkill Plugin 结构' : 'AgentSkill plugin structure'}</h2>
                <p>{isZh ? '插件榜更适合看“主题打包能力”，它决定了我们以后怎么做 skill 家族和合集分发。' : 'The plugin board is better for understanding thematic packaging ability, which shapes how we build skill families and bundle distribution later.'}</p>
              </div>
              <AccordionBoard
                title={copy.topPlugins}
                items={agentSkillReport.plugins.topByOpportunity}
                activeKey={activeAgentPlugin}
                onSelect={setActiveAgentPlugin}
                getKey={(item) => item.slug ?? item.name}
                renderTitle={(item) => item.slug ?? item.name}
                renderMeta={(item) =>
                  isZh
                    ? `${metric(item.listedSkillCount, language)} 个技能 · ${metric(item.listedGithubStars, language)} 星 · ${metric(item.aisaOpportunityScore, language)}`
                    : `${metric(item.listedSkillCount, language)} skills · ${metric(item.listedGithubStars, language)} stars · ${metric(item.aisaOpportunityScore, language)}`
                }
                renderDetails={(item) => (
                  <DetailCard
                    title={item.slug ?? item.name}
                    eyebrow={`@${item.owner}`}
                    lines={[
                      isZh ? `${metric(item.listedSkillCount, language)} 个打包技能` : `${metric(item.listedSkillCount, language)} bundled skills`,
                      isZh ? `${metric(item.listedGithubStars, language)} 个 GitHub 星标` : `${metric(item.listedGithubStars, language)} GitHub stars`,
                      `${item.category} · ${item.targetTitle}`,
                    ]}
                    bullets={[item.description, ...agentSkillReport.plugins.commonPatterns.slice(0, 2)]}
                    link={sourceLink(`https://agentskill.sh${item.href ?? ''}`)}
                    linkLabel={copy.openSource}
                  />
                )}
              />
            </section>
          </>
        ) : (
          <section className="mi-board">
            <LoadingBoard title="AgentSkill" message={copy.loadingSection} />
          </section>
        )
      ) : null}

      {tab === 'agentskillsso' ? (
        agentSkillsSoReport ? (
          <>
          <section className="mi-grid mi-grid-3">
            <DetailCard
              title={isZh ? '分页覆盖' : 'Paginated coverage'}
              eyebrow={isZh ? '覆盖面' : 'Coverage'}
              lines={[
                isZh
                  ? `技能 ${metric(agentSkillsSoReport.summary.sampledSkills, language)} · 作者 ${metric(agentSkillsSoReport.summary.sampledAuthors, language)}`
                  : `skills ${metric(agentSkillsSoReport.summary.sampledSkills, language)} · authors ${metric(agentSkillsSoReport.summary.sampledAuthors, language)}`,
                isZh
                  ? `列表页 ${metric(agentSkillsSoReport.sampleNotes.pagesFetched.length, language)}`
                  : `listing pages ${metric(agentSkillsSoReport.sampleNotes.pagesFetched.length, language)}`,
                isZh
                  ? `平均平台覆盖 ${metric(agentSkillsSoReport.summary.avgPlatformCoverage, language)}`
                  : `avg platform coverage ${metric(agentSkillsSoReport.summary.avgPlatformCoverage, language)}`,
              ]}
              bullets={[
                isZh ? `头部类目 ${agentSkillsSoReport.summary.topCategory ?? notAvailable}` : `Top category ${agentSkillsSoReport.summary.topCategory ?? notAvailable}`,
                isZh ? `列表项 ${agentSkillsSoReport.sampleNotes.listingCount}` : `listing count ${agentSkillsSoReport.sampleNotes.listingCount}`,
                isZh ? `详情页 ${agentSkillsSoReport.sampleNotes.detailCount}` : `detail count ${agentSkillsSoReport.sampleNotes.detailCount}`,
              ]}
              link={agentSkillsSoReport.sources.listings[0]}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title={isZh ? '信任与需求' : 'Trust and demand'}
              eyebrow={isZh ? '信号' : 'Signals'}
              lines={[
                isZh
                  ? `${metric(agentSkillsSoReport.summary.totalWeeklyDownloads, language)} 周下载`
                  : `${metric(agentSkillsSoReport.summary.totalWeeklyDownloads, language)} weekly downloads`,
                isZh
                  ? `${metric(agentSkillsSoReport.summary.totalGithubStars, language)} 仓库星标`
                  : `${metric(agentSkillsSoReport.summary.totalGithubStars, language)} repo stars`,
                isZh
                  ? `${metric(agentSkillsSoReport.summary.resolvedSecuritySamples, language)} 个已解析安全样本 · 平均 ${metric(agentSkillsSoReport.summary.avgSecurityScore, language)}/100`
                  : `${metric(agentSkillsSoReport.summary.resolvedSecuritySamples, language)} security-resolved samples · avg ${metric(agentSkillsSoReport.summary.avgSecurityScore, language)}/100`,
              ]}
              bullets={agentSkillsSoReport.rankingFactors.slice(0, 5).map((item) => `${item.factor}: ${item.evidence}`)}
            />
            <DetailCard
              title={isZh ? '我们该怎么用 AgentSkills.so' : 'How we should use AgentSkills.so'}
              eyebrow={isZh ? '打法' : 'Playbook'}
              lines={
                isZh
                  ? ['把周下载当需求强度', '把 repo、安全姿态、distribution 覆盖一起看', '更适合验证“技能商品化”而非泛目录曝光']
                  : ['Treat weekly downloads as demand intensity', 'Look at repo trust, security posture, and distribution coverage together', 'Better for validating skill productization than generic directory exposure']
              }
              bullets={agentSkillsSoReport.skills.commonPatterns.slice(0, 3)}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'AgentSkills.so 高机会 Skill' : 'High-opportunity AgentSkills.so skills'}</h2>
              <p>{isZh ? '这条线更适合验证“周下载 + repo 可信度 + 安全姿态”共同作用下，哪些能力最适合做 AISA 商品化。' : 'This track is best for validating which capabilities are most suitable for AISA productization when weekly downloads, repo trust, and security posture work together.'}</p>
            </div>
              <AccordionBoard
                title={copy.topSkills}
                items={agentSkillsSoReport.skills.topByOpportunity}
                activeKey={activeAgentSoSkill}
                onSelect={setActiveAgentSoSkill}
                getKey={(item) => item.name}
                renderTitle={(item) => item.name}
                renderMeta={(item) =>
                  isZh
                    ? `${metric(item.weeklyDownloads, language)} /周 · ${metric(item.githubStars, language)} 星 · ${metric(item.aisaOpportunityScore, language)}`
                    : `${metric(item.weeklyDownloads, language)} /wk · ${metric(item.githubStars, language)} stars · ${metric(item.aisaOpportunityScore, language)}`
                }
                renderDetails={(item) => (
                  <DetailCard
                    title={item.name}
                    eyebrow={`@${item.owner}`}
                    lines={[
                      isZh
                        ? `${metric(item.weeklyDownloads, language)} 周下载 · ${metric(item.githubStars, language)} 星`
                        : `${metric(item.weeklyDownloads, language)} weekly downloads · ${metric(item.githubStars, language)} stars`,
                      `${item.category} · ${item.apiFamily}`,
                      isZh
                        ? `${item.targetTitle} · ${metric(item.platformCoverageCount, language)} 个平台`
                        : `${item.targetTitle} · ${metric(item.platformCoverageCount, language)} platforms`,
                    ]}
                    bullets={[
                      item.description,
                      isZh
                        ? `安全 ${metric(item.securityScore, language)} / 100 · 信任 ${metric(item.trustIdentityScore, language)} / 5 · 行为 ${metric(item.behavioralMonitoringScore, language)} / 5 · 漏洞 ${metric(item.vulnerabilityExposureScore, language)} / 5`
                        : `security ${metric(item.securityScore, language)} / 100 · trust ${metric(item.trustIdentityScore, language)} / 5 · behavior ${metric(item.behavioralMonitoringScore, language)} / 5 · vulnerability ${metric(item.vulnerabilityExposureScore, language)} / 5`,
                      isZh
                        ? `跨分发安装 ${metric(item.totalDistributionInstalls, language)} · 平台覆盖分 ${metric(item.platformCoverageScore, language)}`
                        : `cross-distribution installs ${metric(item.totalDistributionInstalls, language)} · platform coverage score ${metric(item.platformCoverageScore, language)}`,
                    ]}
                    link={sourceLink(item.sourceUrl ?? `https://agentskills.so${item.href ?? ''}`)}
                    linkLabel={copy.openSource}
                />
              )}
            />
          </section>

            <section className="mi-board">
              <div className="mi-section-top">
              <h2>{isZh ? 'AgentSkills.so 跨分发覆盖' : 'AgentSkills.so cross-distribution coverage'}</h2>
              <p>{isZh ? '这里专门看哪些技能已经被多个 agent distribution 接入，它们通常更适合做通用 API 层和平台复用型商品。' : 'This view focuses on skills already adopted by multiple agent distributions, which usually makes them better candidates for reusable API layers and platform-spanning products.'}</p>
              </div>
              <AccordionBoard
              title={copy.topPlatformCoverage}
              items={agentSkillsSoReport.skills.topByPlatformCoverage}
              activeKey={activeAgentSoSkill}
              onSelect={setActiveAgentSoSkill}
              getKey={(item) => item.name}
              renderTitle={(item) => item.name}
              renderMeta={(item) =>
                isZh
                  ? `${metric(item.platformCoverageCount, language)} 个平台 · ${metric(item.totalDistributionInstalls, language)} 安装 · ${metric(item.platformCoverageScore, language)}`
                  : `${metric(item.platformCoverageCount, language)} platforms · ${metric(item.totalDistributionInstalls, language)} installs · ${metric(item.platformCoverageScore, language)}`
              }
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={`@${item.owner}`}
                  lines={[
                    isZh
                      ? `${metric(item.platformCoverageCount, language)} 个分发面 · ${metric(item.totalDistributionInstalls, language)} 可见安装`
                      : `${metric(item.platformCoverageCount, language)} distributions · ${metric(item.totalDistributionInstalls, language)} visible installs`,
                    `${item.category} · ${item.apiFamily}`,
                    isZh
                      ? `机会分 ${metric(item.aisaOpportunityScore, language)} · 安全 ${metric(item.securityScore, language)}/100`
                      : `Opportunity ${metric(item.aisaOpportunityScore, language)} · Security ${metric(item.securityScore, language)}/100`,
                  ]}
                  bullets={[
                    item.description,
                    isZh
                      ? '多 distribution 可见性通常意味着命名更稳、边界更清楚、对不同 agent 的适配成本更低。'
                      : 'Visibility across distributions usually means naming is more stable, boundaries are clearer, and adaptation costs across agents are lower.',
                  ]}
                  link={sourceLink(item.sourceUrl ?? `https://agentskills.so${item.href ?? ''}`)}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? 'AgentSkills.so 作者画像' : 'AgentSkills.so author profiles'}</h2>
              <p>{isZh ? '这一层让我们更容易看清“哪些 repo owner 已经形成技能商品化工厂”。' : 'This layer makes it easier to see which repo owners have already formed skill productization factories.'}</p>
            </div>
              <AccordionBoard
                title={copy.topAuthors}
                items={agentSkillsSoReport.authors.topAuthors}
                activeKey={activeAgentSoAuthor}
                onSelect={setActiveAgentSoAuthor}
                getKey={(item) => item.owner}
                renderTitle={(item) => `@${item.owner}`}
                renderMeta={(item) =>
                  isZh
                    ? `${metric(item.skillCount, language)} 个技能 · ${metric(item.totalWeeklyDownloads, language)} /周`
                    : `${metric(item.skillCount, language)} skills · ${metric(item.totalWeeklyDownloads, language)} /wk`
                }
                renderDetails={(item) => (
                  <DetailCard
                    title={`@${item.owner}`}
                    eyebrow={isZh ? '作者工厂' : 'Author factory'}
                    lines={[
                    isZh
                      ? `${item.skillCount} 个采样技能`
                      : `${item.skillCount} sampled skills`,
                    isZh
                      ? `${metric(item.totalWeeklyDownloads, language)} 周下载 · ${metric(item.totalGithubStars, language)} 星`
                      : `${metric(item.totalWeeklyDownloads, language)} weekly downloads · ${metric(item.totalGithubStars, language)} stars`,
                    item.primaryCategories.join(' · '),
                  ]}
                  bullets={[
                    isZh ? `平均安全 ${metric(item.avgSecurityScore, language)}` : `avg security ${metric(item.avgSecurityScore, language)}`,
                    isZh ? '更适合把 skill 当成可持续上新和可持续分发的商品层' : 'Better suited to treating skills as a continuously refreshed, continuously distributed product layer',
                  ]}
                />
              )}
            />
          </section>
          </>
        ) : (
          <section className="mi-board">
            <LoadingBoard title="AgentSkills.so" message={copy.loadingSection} />
          </section>
        )
      ) : null}

      {tab === 'aisa' ? (
        <>
          <section className="mi-grid mi-grid-2">
            <DetailCard
              title={isZh ? '统一设计原则' : 'Unified design principles'}
              eyebrow={isZh ? '设计' : 'Design'}
              lines={
                isZh
                  ? ['先抢高意图搜索词', '先占旗舰包，再拆变体', '结果必须第一轮就显价值']
                  : ['Own high-intent keywords first', 'Win the flagship package before splitting variants', 'The result must show value in the first run']
              }
              bullets={marketReport.combined.designPrinciples}
            />
            <DetailCard
              title={isZh ? '执行分工' : 'Execution lanes'}
              eyebrow={isZh ? '执行' : 'Execution'}
              lines={isZh ? ['ClawHub 验证转化', 'Claude 验证 repo 分发', 'Hermes 反推工作流边界'] : ['Validate conversion on ClawHub', 'Validate repo distribution on Claude', 'Use Hermes to infer workflow boundaries']}
              bullets={extendedExecutionLanes}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>{isZh ? '现在最值得推进的改造清单' : 'Most actionable conversion queue right now'}</h2>
              <p>{isZh ? '这里把五条线的机会压成一张可执行队列，你可以直接拿去排版本和排发布节奏。' : 'This compresses opportunities from all five tracks into one executable queue you can use for release planning immediately.'}</p>
            </div>
            <AccordionBoard
              title={copy.opportunityQueue}
              items={mergedOpportunities}
              activeKey={activeAisaOpportunity}
              onSelect={setActiveAisaOpportunity}
              getKey={opportunityKey}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${item.ecosystem} · ${item.category} · ${metric(item.opportunityScore ?? item.aisaOpportunityScore, language)}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={item.ecosystem}
                  lines={[
                    item.targetTitle,
                    `${item.category} · ${item.apiFamily}`,
                    `${isZh ? '机会分' : 'Opportunity score'} ${metric(item.opportunityScore ?? item.aisaOpportunityScore, language)}`,
                  ]}
                  bullets={mappedBullets([item.summary ?? item.description], item.moves?.slice(0, 4))}
                  link={sourceLink(item.sourceUrl ?? item.url)}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>
        </>
      ) : null}
    </main>
  );
}
