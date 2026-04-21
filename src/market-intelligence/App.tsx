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
  return value ?? 'n/a';
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

  const extendedExecutionLanes = [
    ...marketReport.combined.executionLanes,
    'AgentSkill 负责验证 quality/security/rating 驱动的技能与 plugin 分发面。',
    'AgentSkills.so 负责验证周下载、repo 信任和安全姿态对技能商品化的影响。',
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
            <a href={marketReport.sources.claudeSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              Claude Skills
            </a>
            <a href={marketReport.sources.hermesSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              Hermes Skills
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
            <span>ClawHub Top 200 可转 AISA</span>
            <strong>{metric(marketReport.clawhub.summary.top200ConvertibleCandidates, language)}</strong>
          </article>
          <article className="mi-stat-card tone-sea">
            <Layers3 size={18} />
            <span>Claude Skills / Markets</span>
            <strong>
              {metric(marketReport.claude.skills.summary.totalSkills, language)} / {metric(marketReport.claude.marketplaces.summary.totalMarketplaces, language)}
            </strong>
          </article>
          <article className="mi-stat-card tone-forest">
            <Rocket size={18} />
            <span>Hermes Bundled / Live</span>
            <strong>
              {metric(marketReport.hermes.summary.bundledSkills, language)} / {metric(marketReport.hermes.summary.advertisedBundledSkills, language)}
            </strong>
          </article>
          <article className="mi-stat-card tone-rust">
            <Target size={18} />
            <span>AgentSkill 样本</span>
            <strong>
              {metric(agentSkillReport?.summary.sampledSkills, language)} / {metric(agentSkillReport?.summary.sampledPlugins, language)}
            </strong>
          </article>
          <article className="mi-stat-card tone-sea">
            <ShieldCheck size={18} />
            <span>AgentSkills.so 样本</span>
            <strong>{metric(agentSkillsSoReport?.summary.sampledSkills, language)}</strong>
          </article>
          <article className="mi-stat-card tone-sand">
            <Sparkles size={18} />
            <span>Unified AISA Queue</span>
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
              title="ClawHub 现在给我们什么"
              eyebrow="ClawHub"
              lines={[
                `最强总榜 skill: ${marketReport.clawhub.summary.topSkillAcrossThreeLists.name}`,
                `下载榜主类目: ${marketReport.clawhub.summary.downloadsTopCategory}`,
                `现有 AISA skills 规划: ${metric(marketReport.clawhub.summary.existingAisaSkillsPlanned, language)}`,
              ]}
              bullets={marketReport.clawhub.viralPlaybook.keySuccessFactors.slice(0, 4)}
              link={`${import.meta.env.BASE_URL}clawhub-download-insights.html`}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title="Claude 市场给我们的增量"
              eyebrow="Claude"
              lines={[
                `Skills: ${metric(marketReport.claude.skills.summary.totalSkills, language)}`,
                `Top installs category: ${marketReport.claude.skills.summary.topCategory}`,
                `Marketplaces: ${metric(marketReport.claude.marketplaces.summary.totalMarketplaces, language)}`,
              ]}
              bullets={marketReport.claude.skills.commonPatterns.slice(0, 4)}
              link={marketReport.sources.claudeSkills}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title="Hermes 适合作为什么"
              eyebrow="Hermes"
              lines={[
                `Live guide ${metric(marketReport.hermes.summary.advertisedBundledSkills, language)} bundled skills`,
                `raw catalog ${metric(marketReport.hermes.summary.bundledSkills, language)} bundled rows`,
                `最强标签带: ${marketReport.hermes.tags.slice(0, 3).map((item) => item.name).join(' · ')}`,
              ]}
              bullets={marketReport.hermes.commonPatterns.slice(0, 4)}
              link={marketReport.sources.hermesSkills}
              linkLabel={copy.openSource}
            />
            {agentSkillReport ? (
              <DetailCard
                title="AgentSkill 的启发"
                eyebrow="AgentSkill"
                lines={[
                  `skills / plugins / creators: ${metric(agentSkillReport.summary.sampledSkills, language)} / ${metric(agentSkillReport.summary.sampledPlugins, language)} / ${metric(agentSkillReport.summary.sampledCreators, language)}`,
                  `owner pages fetched: ${metric(agentSkillReport.summary.ownerPagesFetched, language)}`,
                  `Top category: ${agentSkillReport.summary.topSkillCategory ?? 'n/a'}`,
                ]}
                bullets={mappedBullets(agentSkillReport.skills.commonPatterns.slice(0, 3), [agentSkillReport.sampleNotes.skills])}
                link={agentSkillReport.sources.skills}
                linkLabel={copy.openSource}
              />
            ) : (
              <LoadingBoard title="AgentSkill 的启发" message={copy.loadingSection} />
            )}
            {agentSkillsSoReport ? (
              <DetailCard
                title="AgentSkills.so 的启发"
                eyebrow="AgentSkills.so"
                lines={[
                  `sampled skills: ${metric(agentSkillsSoReport.summary.sampledSkills, language)}`,
                  `sampled authors: ${metric(agentSkillsSoReport.summary.sampledAuthors, language)}`,
                  `avg platform coverage: ${metric(agentSkillsSoReport.summary.avgPlatformCoverage, language)}`,
                ]}
                bullets={mappedBullets(
                  agentSkillsSoReport.skills.commonPatterns.slice(0, 2),
                  [
                    `Top category: ${agentSkillsSoReport.summary.topCategory ?? 'n/a'}`,
                    `分页抓取页数: ${agentSkillsSoReport.sampleNotes.pagesFetched.length}`,
                    `安全细分已解析样本: ${metric(agentSkillsSoReport.summary.resolvedSecuritySamples, language)}`,
                  ],
                )}
                link={agentSkillsSoReport.sources.listings[0]}
                linkLabel={copy.openSource}
              />
            ) : (
              <LoadingBoard title="AgentSkills.so 的启发" message={copy.loadingSection} />
            )}
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>跨平台最值得做的 AISA 机会</h2>
              <p>把五个平台合并以后，真正值得先抢的位置会进一步集中，而且“爆款”与“可发布”开始重叠。</p>
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
                    `机会分 ${metric(item.opportunityScore ?? item.aisaOpportunityScore, language)}`,
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
              <h2>ClawHub 爆款 Skill</h2>
              <p>看清当前真实榜单里最强 skill 的共同点，再决定 AISA 要抢哪条线。</p>
            </div>
            <AccordionBoard
              title={copy.topSkills}
              items={marketReport.clawhub.topSkills}
              activeKey={activeClawhubSkill}
              onSelect={setActiveClawhubSkill}
              getKey={(item) => item.slug}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${metric(item.downloads, language)} 下载 · ${metric(item.stars, language)} 星 · ${metric(item.installsCurrent, language)} 装`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={`@${item.author}`}
                  lines={[
                    `${metric(item.downloads, language)} 下载 · ${metric(item.stars, language)} 星 · ${metric(item.installsCurrent, language)} 装`,
                    `${item.theme} · 三榜出现 ${item.appearances} 次`,
                    `downloads #${item.ranks.downloads} · stars #${item.ranks.stars} · installs #${item.ranks.installs}`,
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
              <h2>ClawHub 爆款作者</h2>
              <p>把作者画像做清楚以后，复制打法会比只看单 skill 更稳。</p>
            </div>
            <AccordionBoard
              title={copy.topAuthors}
              items={marketReport.clawhub.topAuthorProfiles}
              activeKey={activeClawhubAuthor}
              onSelect={setActiveClawhubAuthor}
              getKey={(item) => item.author}
              renderTitle={(item) => `@${item.author}`}
              renderMeta={(item) => `${item.totalSkills} total skills · ${item.topSkills.length} top samples`}
              renderDetails={(item) => (
                <DetailCard
                  title={`@${item.author}`}
                  eyebrow="Author profile"
                  lines={[
                    `${item.totalSkills} total skills`,
                    item.topSkills.slice(0, 3).map((skill) => skill.name).join(' · '),
                    '更适合做平台词 + 高频工具词矩阵',
                  ]}
                  bullets={item.topSkills.slice(0, 5).map((skill) => `${skill.name} · ${metric(skill.downloads, language)} 下载 · ${skill.theme}`)}
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
              <h2>Claude Skills 爆款结构</h2>
              <p>这里更像是“GitHub 高星 repo 的 skill 分发层”，安装和信任高度绑定仓库本身。</p>
            </div>
            <AccordionBoard
              title={copy.topSkills}
              items={marketReport.claude.skills.topByInstalls}
              activeKey={activeClaudeSkill}
              onSelect={setActiveClaudeSkill}
              getKey={(item) => item.name}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${metric(item.installs, language)} 装 · ${metric(item.stars, language)} 星 · ${item.category}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={`@${item.owner}`}
                  lines={[
                    `${metric(item.installs, language)} installs · ${metric(item.stars, language)} stars`,
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
              <h2>Claude Skill 作者 / 仓库画像</h2>
              <p>能量产的往往不是单 skill，而是一整个 skill repo。</p>
            </div>
            <AccordionBoard
              title={copy.topOwners}
              items={marketReport.claude.skills.topOwners}
              activeKey={activeClaudeOwner}
              onSelect={setActiveClaudeOwner}
              getKey={(item) => item.owner}
              renderTitle={(item) => `@${item.owner}`}
              renderMeta={(item) => `${metric(item.totalStars, language)} stars · ${metric(item.totalInstalls, language)} installs`}
              renderDetails={(item) => (
                <DetailCard
                  title={`@${item.owner}`}
                  eyebrow="Skill repo profile"
                  lines={[
                    `${metric(item.skillCount, language)} skills · ${metric(item.repoCount, language)} repos`,
                    `${metric(item.totalInstalls, language)} installs · ${metric(item.totalStars, language)} stars`,
                    item.primaryCategories.join(' · '),
                  ]}
                  bullets={item.topSkills?.slice(0, 5).map((skill) => `${skill.name} · ${metric(skill.installs, language)} 装 · ${skill.category}`)}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>Claude Marketplaces</h2>
              <p>它们更像“矩阵化分发仓库”，适合学习旗舰仓库 + 多变体 skill 的运营方式。</p>
            </div>
            <AccordionBoard
              title={copy.topMarketplaces}
              items={marketReport.claude.marketplaces.topByStars}
              activeKey={activeMarketplace}
              onSelect={setActiveMarketplace}
              getKey={(item) => item.repo ?? item.name}
              renderTitle={(item) => item.repo ?? item.name}
              renderMeta={(item) => `${metric(item.stars, language)} 星 · ${metric(item.pluginCount, language)} plugins · ${item.category}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.repo ?? item.name}
                  eyebrow={`@${item.owner}`}
                  lines={[
                    `${metric(item.stars, language)} stars · ${metric(item.pluginCount, language)} plugins`,
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
              title="Hermes 当前口径"
              eyebrow="Official guide"
              lines={[
                `Live guide: ${metric(marketReport.hermes.summary.advertisedBundledSkills, language)} bundled skills`,
                `raw catalog: ${metric(marketReport.hermes.summary.bundledSkills, language)} bundled rows`,
                `categories: ${metric(marketReport.hermes.summary.advertisedSkillCategories, language)}`,
              ]}
              bullets={[marketReport.hermes.commonPatterns[4] ?? marketReport.hermes.commonPatterns[0]]}
              link={marketReport.sources.hermesSkills}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title="高频标签"
              eyebrow="Tags"
              lines={[marketReport.hermes.tags.slice(0, 6).map((item) => `${item.name} ${item.count}`).join(' · ')]}
              bullets={marketReport.hermes.categoryButtons.slice(0, 12).map((item) => `官方筛选按钮：${item}`)}
            />
            <DetailCard
              title="我们该怎么用 Hermes"
              eyebrow="Role"
              lines={['拿它做“官方工作流 atlas”', '不是单纯看热度榜', '更适合反推哪些能力值得 API 化']}
              bullets={marketReport.hermes.commonPatterns.slice(0, 4)}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>Hermes 最适合转 AISA 的 bundled skills</h2>
              <p>它没有公开下载榜，所以我们按工作流价值、可 API 化程度、是否适合矩阵化扩张来排序。</p>
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
                  lines={[`${item.category} · ${item.apiFamily}`, item.targetTitle, item.platformScope ?? 'cross-platform']}
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
                title="样本覆盖"
                eyebrow="Coverage"
                lines={[
                  `skills ${metric(agentSkillReport.summary.sampledSkills, language)} · plugins ${metric(agentSkillReport.summary.sampledPlugins, language)}`,
                  `creators ${metric(agentSkillReport.summary.sampledCreators, language)} · owner pages ${metric(agentSkillReport.summary.ownerPagesFetched, language)}`,
                  `Top skill category: ${agentSkillReport.summary.topSkillCategory ?? 'n/a'}`,
                ]}
                bullets={[agentSkillReport.sampleNotes.skills, agentSkillReport.sampleNotes.plugins]}
                link={agentSkillReport.sources.skills}
                linkLabel={copy.openSource}
              />
              <DetailCard
                title="质量与安全"
                eyebrow="Trust stack"
                lines={[
                  `avg quality ${metric(agentSkillReport.summary.avgQualityScore, language)}/100`,
                  `avg security ${metric(agentSkillReport.summary.avgSecurityScore, language)}/100`,
                  `GitHub stars ${metric(agentSkillReport.summary.totalSkillGithubStars, language)}`,
                ]}
                bullets={agentSkillReport.rankingFactors.slice(0, 4).map((item) => `${item.factor}: ${item.evidence}`)}
              />
              <DetailCard
                title="我们该怎么用 AgentSkill"
                eyebrow="Playbook"
                lines={['把 quality/security/rating 当作产品表面', 'owner factory 比单点 skill 更重要', 'plugin 层适合做大主题合集']}
                bullets={agentSkillReport.skills.commonPatterns.slice(0, 4)}
              />
            </section>

            <section className="mi-board">
              <div className="mi-section-top">
                <h2>AgentSkill 高机会 Skill</h2>
                <p>这一层最能验证“任务命名 + GitHub 信任 + quality/security review”是否一起推高转化。</p>
              </div>
              <AccordionBoard
                title={copy.topSkills}
                items={agentSkillReport.skills.topByOpportunity}
                activeKey={activeAgentSkill}
                onSelect={setActiveAgentSkill}
                getKey={(item) => item.name}
                renderTitle={(item) => item.name}
                renderMeta={(item) => `${metric(item.installs, language)} installs · ${metric(item.githubStars, language)} stars · ${metric(item.aisaOpportunityScore, language)}`}
                renderDetails={(item) => (
                  <DetailCard
                    title={item.name}
                    eyebrow={`@${item.owner}`}
                    lines={[`${metric(item.installs, language)} installs · ${metric(item.githubStars, language)} stars`, `${item.category} · ${item.apiFamily}`, item.targetTitle]}
                    bullets={[item.description, `quality ${metric(item.qualityScore, language)} · security ${metric(item.securityScore, language)}`]}
                    link={sourceLink(item.sourceUrl ?? `https://agentskill.sh${item.href ?? ''}`)}
                    linkLabel={copy.openSource}
                  />
                )}
              />
            </section>

            <section className="mi-board">
              <div className="mi-section-top">
                <h2>AgentSkill 作者工厂</h2>
                <p>最有价值的不是单次爆款，而是可以连续产出同主题高质 skill 的作者结构。</p>
              </div>
              <AccordionBoard
                title={copy.topCreators}
                items={agentSkillReport.creators.topCreators}
                activeKey={activeAgentCreator}
                onSelect={setActiveAgentCreator}
                getKey={(item) => item.owner}
                renderTitle={(item) => `@${item.owner}`}
                renderMeta={(item) => `${metric(item.sampledSkills, language)} skills · ${metric(item.sampledPlugins, language)} plugins`}
                renderDetails={(item) => (
                  <DetailCard
                    title={`@${item.owner}`}
                    eyebrow="Creator factory"
                    lines={[
                      `${item.sampledSkills} sampled skills · ${item.sampledPlugins} sampled plugins`,
                      `${metric(item.totalInstalls, language)} installs · ${metric(item.totalGithubStars, language)} stars`,
                      item.primaryCategories.join(' · '),
                    ]}
                    bullets={[`avg quality ${metric(item.avgQualityScore, language)} / avg security ${metric(item.avgSecurityScore, language)}`, '更适合做旗舰 skill + 窄变体 + 同主题 plugin ladder']}
                  />
                )}
              />
            </section>

            <section className="mi-board">
              <div className="mi-section-top">
                <h2>AgentSkill Plugin 结构</h2>
                <p>插件榜更适合看“主题打包能力”，它决定了我们以后怎么做 skill 家族和合集分发。</p>
              </div>
              <AccordionBoard
                title={copy.topPlugins}
                items={agentSkillReport.plugins.topByOpportunity}
                activeKey={activeAgentPlugin}
                onSelect={setActiveAgentPlugin}
                getKey={(item) => item.slug ?? item.name}
                renderTitle={(item) => item.slug ?? item.name}
                renderMeta={(item) => `${metric(item.listedSkillCount, language)} skills · ${metric(item.listedGithubStars, language)} stars · ${metric(item.aisaOpportunityScore, language)}`}
                renderDetails={(item) => (
                  <DetailCard
                    title={item.slug ?? item.name}
                    eyebrow={`@${item.owner}`}
                    lines={[
                      `${metric(item.listedSkillCount, language)} bundled skills`,
                      `${metric(item.listedGithubStars, language)} GitHub stars`,
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
              title="分页覆盖"
              eyebrow="Coverage"
              lines={[
                `skills ${metric(agentSkillsSoReport.summary.sampledSkills, language)} · authors ${metric(agentSkillsSoReport.summary.sampledAuthors, language)}`,
                `listing pages ${metric(agentSkillsSoReport.sampleNotes.pagesFetched.length, language)}`,
                `avg platform coverage ${metric(agentSkillsSoReport.summary.avgPlatformCoverage, language)}`,
              ]}
              bullets={[
                `Top category ${agentSkillsSoReport.summary.topCategory ?? 'n/a'}`,
                `listing count ${agentSkillsSoReport.sampleNotes.listingCount}`,
                `detail count ${agentSkillsSoReport.sampleNotes.detailCount}`,
              ]}
              link={agentSkillsSoReport.sources.listings[0]}
              linkLabel={copy.openSource}
            />
            <DetailCard
              title="信任与需求"
              eyebrow="Signals"
              lines={[
                `${metric(agentSkillsSoReport.summary.totalWeeklyDownloads, language)} weekly downloads`,
                `${metric(agentSkillsSoReport.summary.totalGithubStars, language)} repo stars`,
                `${metric(agentSkillsSoReport.summary.resolvedSecuritySamples, language)} security-resolved samples · avg ${metric(agentSkillsSoReport.summary.avgSecurityScore, language)}/100`,
              ]}
              bullets={agentSkillsSoReport.rankingFactors.slice(0, 5).map((item) => `${item.factor}: ${item.evidence}`)}
            />
            <DetailCard
              title="我们该怎么用 AgentSkills.so"
              eyebrow="Playbook"
              lines={['把周下载当需求强度', '把 repo、安全姿态、distribution 覆盖一起看', '更适合验证“技能商品化”而非泛目录曝光']}
              bullets={agentSkillsSoReport.skills.commonPatterns.slice(0, 3)}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>AgentSkills.so 高机会 Skill</h2>
              <p>这条线更适合验证“周下载 + repo 可信度 + 安全姿态”共同作用下，哪些能力最适合做 AISA 商品化。</p>
            </div>
            <AccordionBoard
              title={copy.topSkills}
              items={agentSkillsSoReport.skills.topByOpportunity}
              activeKey={activeAgentSoSkill}
              onSelect={setActiveAgentSoSkill}
              getKey={(item) => item.name}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${metric(item.weeklyDownloads, language)} /wk · ${metric(item.githubStars, language)} stars · ${metric(item.aisaOpportunityScore, language)}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={`@${item.owner}`}
                  lines={[
                    `${metric(item.weeklyDownloads, language)} weekly downloads · ${metric(item.githubStars, language)} stars`,
                    `${item.category} · ${item.apiFamily}`,
                    `${item.targetTitle} · ${metric(item.platformCoverageCount, language)} platforms`,
                  ]}
                  bullets={[
                    item.description,
                    `security ${metric(item.securityScore, language)} / 100 · trust ${metric(item.trustIdentityScore, language)} / 5 · behavior ${metric(item.behavioralMonitoringScore, language)} / 5 · vulnerability ${metric(item.vulnerabilityExposureScore, language)} / 5`,
                    `cross-distribution installs ${metric(item.totalDistributionInstalls, language)} · platform coverage score ${metric(item.platformCoverageScore, language)}`,
                  ]}
                  link={sourceLink(item.sourceUrl ?? `https://agentskills.so${item.href ?? ''}`)}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>AgentSkills.so 跨分发覆盖</h2>
              <p>这里专门看哪些技能已经被多个 agent distribution 接入，它们通常更适合做通用 API 层和平台复用型商品。</p>
            </div>
            <AccordionBoard
              title={copy.topPlatformCoverage}
              items={agentSkillsSoReport.skills.topByPlatformCoverage}
              activeKey={activeAgentSoSkill}
              onSelect={setActiveAgentSoSkill}
              getKey={(item) => item.name}
              renderTitle={(item) => item.name}
              renderMeta={(item) => `${metric(item.platformCoverageCount, language)} platforms · ${metric(item.totalDistributionInstalls, language)} installs · ${metric(item.platformCoverageScore, language)}`}
              renderDetails={(item) => (
                <DetailCard
                  title={item.name}
                  eyebrow={`@${item.owner}`}
                  lines={[
                    `${metric(item.platformCoverageCount, language)} distributions · ${metric(item.totalDistributionInstalls, language)} visible installs`,
                    `${item.category} · ${item.apiFamily}`,
                    `Opportunity ${metric(item.aisaOpportunityScore, language)} · Security ${metric(item.securityScore, language)}/100`,
                  ]}
                  bullets={[item.description, '多 distribution 可见性通常意味着命名更稳、边界更清楚、对不同 agent 的适配成本更低。']}
                  link={sourceLink(item.sourceUrl ?? `https://agentskills.so${item.href ?? ''}`)}
                  linkLabel={copy.openSource}
                />
              )}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>AgentSkills.so 作者画像</h2>
              <p>这一层让我们更容易看清“哪些 repo owner 已经形成技能商品化工厂”。</p>
            </div>
            <AccordionBoard
              title={copy.topAuthors}
              items={agentSkillsSoReport.authors.topAuthors}
              activeKey={activeAgentSoAuthor}
              onSelect={setActiveAgentSoAuthor}
              getKey={(item) => item.owner}
              renderTitle={(item) => `@${item.owner}`}
              renderMeta={(item) => `${metric(item.skillCount, language)} skills · ${metric(item.totalWeeklyDownloads, language)} /wk`}
              renderDetails={(item) => (
                <DetailCard
                  title={`@${item.owner}`}
                  eyebrow="Author factory"
                  lines={[
                    `${item.skillCount} sampled skills`,
                    `${metric(item.totalWeeklyDownloads, language)} weekly downloads · ${metric(item.totalGithubStars, language)} stars`,
                    item.primaryCategories.join(' · '),
                  ]}
                  bullets={[`avg security ${metric(item.avgSecurityScore, language)}`, '更适合把 skill 当成可持续上新和可持续分发的商品层']}
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
              title="统一设计原则"
              eyebrow="Design"
              lines={['先抢高意图搜索词', '先占旗舰包，再拆变体', '结果必须第一轮就显价值']}
              bullets={marketReport.combined.designPrinciples}
            />
            <DetailCard title="执行分工" eyebrow="Execution" lines={['ClawHub 验证转化', 'Claude 验证 repo 分发', 'Hermes 反推工作流边界']} bullets={extendedExecutionLanes} />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>现在最值得推进的改造清单</h2>
              <p>这里把五条线的机会压成一张可执行队列，你可以直接拿去排版本和排发布节奏。</p>
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
                    `机会分 ${metric(item.opportunityScore ?? item.aisaOpportunityScore, language)}`,
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
