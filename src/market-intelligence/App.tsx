import { useEffect, useMemo, useState } from 'react';
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

type TabKey = 'overview' | 'clawhub' | 'claude' | 'hermes' | 'agentskill' | 'agentskillsso' | 'aisa';
type MergedOpportunity = MarketSkill & { ecosystem: string };

function metric(value: number | string | null | undefined) {
  if (typeof value === 'number') return value.toLocaleString('en-US');
  return value ?? 'n/a';
}

function sourceLink(value?: string | null) {
  if (!value) return null;
  return value.startsWith('http') ? value : null;
}

function opportunityKey(item: MergedOpportunity) {
  return `${item.ecosystem}:${item.name}`;
}

function SkillList<T extends MarketSkill | ClawhubTopSkill>({
  title,
  items,
  activeKey,
  onSelect,
  getKey,
  renderMeta,
}: {
  title: string;
  items: T[];
  activeKey: string | null;
  onSelect: (value: string) => void;
  getKey: (item: T) => string;
  renderMeta: (item: T) => string;
}) {
  return (
    <section className="mi-list-card">
      <div className="mi-card-top">
        <h3>{title}</h3>
        <span>{items.length}</span>
      </div>
      <div className="mi-list">
        {items.map((item) => {
          const key = getKey(item);
          const isActive = key === activeKey;
          return (
            <button key={key} type="button" className={`mi-list-item${isActive ? ' is-active' : ''}`} onClick={() => onSelect(key)}>
              <strong>{'name' in item ? item.name : key}</strong>
              <small>{renderMeta(item)}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DetailCard({
  title,
  eyebrow,
  lines,
  bullets,
  link,
}: {
  title: string;
  eyebrow: string;
  lines: string[];
  bullets?: string[];
  link?: string | null;
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
          打开来源 <ExternalLink size={14} />
        </a>
      ) : null}
    </article>
  );
}

function OwnerList({
  title,
  items,
  activeKey,
  onSelect,
}: {
  title: string;
  items: Array<MarketOwnerProfile | ClawhubAuthorProfile | AgentSkillCreatorProfile | AgentSkillsSoAuthorProfile>;
  activeKey: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="mi-list-card">
      <div className="mi-card-top">
        <h3>{title}</h3>
        <span>{items.length}</span>
      </div>
      <div className="mi-list">
        {items.map((item) => {
          const key = 'owner' in item ? item.owner : item.author;
          let subtitle = '';
          if ('author' in item) {
            subtitle = `${item.totalSkills} total skills`;
          } else if ('sampledPlugins' in item) {
            subtitle = `${item.sampledSkills} skills · ${item.sampledPlugins} plugins`;
          } else if ('totalWeeklyDownloads' in item) {
            subtitle = `${item.skillCount} skills · ${metric(item.totalWeeklyDownloads)} /wk`;
          } else {
            subtitle =
              `${metric(item.totalStars)} stars · ` +
              `${metric(item.totalInstalls ?? item.totalPlugins ?? item.skillCount ?? 0)} scale`;
          }
          return (
            <button key={key} type="button" className={`mi-list-item${key === activeKey ? ' is-active' : ''}`} onClick={() => onSelect(key)}>
              <strong>@{key}</strong>
              <small>{subtitle}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function mappedBullets(...groups: Array<Array<string | undefined> | undefined>) {
  return groups.flat().filter((value): value is string => Boolean(value));
}

export default function App() {
  const [marketReport, setMarketReport] = useState<MarketEcosystemReport | null>(null);
  const [agentSkillReport, setAgentSkillReport] = useState<AgentSkillReport | null>(null);
  const [agentSkillsSoReport, setAgentSkillsSoReport] = useState<AgentSkillsSoReport | null>(null);
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

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/market-ecosystem-report.json`).then((response) => {
        if (!response.ok) throw new Error(`market-ecosystem-report.json ${response.status}`);
        return response.json() as Promise<MarketEcosystemReport>;
      }),
      fetch(`${import.meta.env.BASE_URL}data/agentskill-report.json`).then((response) => {
        if (!response.ok) throw new Error(`agentskill-report.json ${response.status}`);
        return response.json() as Promise<AgentSkillReport>;
      }),
      fetch(`${import.meta.env.BASE_URL}data/agentskills-so-report.json`).then((response) => {
        if (!response.ok) throw new Error(`agentskills-so-report.json ${response.status}`);
        return response.json() as Promise<AgentSkillsSoReport>;
      }),
    ])
      .then(([market, agentSkill, agentSkillsSo]) => {
        setMarketReport(market);
        setAgentSkillReport(agentSkill);
        setAgentSkillsSoReport(agentSkillsSo);
        setActiveClawhubSkill(market.clawhub.topSkills[0]?.slug ?? null);
        setActiveClawhubAuthor(market.clawhub.topAuthorProfiles[0]?.author ?? null);
        setActiveClaudeSkill(market.claude.skills.topByInstalls[0]?.name ?? null);
        setActiveClaudeOwner(market.claude.skills.topOwners[0]?.owner ?? null);
        setActiveMarketplace(market.claude.marketplaces.topByStars[0]?.repo ?? null);
        setActiveHermesSkill(market.hermes.bundled[0]?.name ?? null);
        setActiveAgentSkill(agentSkill.skills.topByOpportunity[0]?.name ?? null);
        setActiveAgentCreator(agentSkill.creators.topCreators[0]?.owner ?? null);
        setActiveAgentPlugin(agentSkill.plugins.topByOpportunity[0]?.slug ?? null);
        setActiveAgentSoSkill(agentSkillsSo.skills.topByOpportunity[0]?.name ?? null);
        setActiveAgentSoAuthor(agentSkillsSo.authors.topAuthors[0]?.owner ?? null);
        const firstCombined = market.combined.combinedOpportunities[0];
        setActiveAisaOpportunity(firstCombined ? opportunityKey({ ...firstCombined, ecosystem: firstCombined.ecosystem ?? 'Market' }) : null);
      })
      .catch((error) => console.error('Failed to load market intelligence datasets', error));
  }, []);

  const mergedOpportunities = useMemo<MergedOpportunity[]>(() => {
    if (!marketReport || !agentSkillReport || !agentSkillsSoReport) return [];
    return [
      ...marketReport.combined.combinedOpportunities.map((item) => ({ ...item, ecosystem: item.ecosystem ?? 'Market' })),
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
      ...agentSkillsSoReport.skills.topByOpportunity.slice(0, 10).map((item) => ({
        ...item,
        ecosystem: 'AgentSkills.so',
        summary: item.summary ?? item.description,
        opportunityScore: item.aisaOpportunityScore ?? 0,
        sourceUrl: item.sourceUrl ?? `https://agentskills.so${item.href ?? ''}`,
      })),
    ]
      .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
      .slice(0, 36);
  }, [marketReport, agentSkillReport, agentSkillsSoReport]);

  const clawhubSkill = useMemo(
    () => marketReport?.clawhub.topSkills.find((item) => item.slug === activeClawhubSkill) ?? null,
    [marketReport, activeClawhubSkill],
  );
  const clawhubAuthor = useMemo(
    () => marketReport?.clawhub.topAuthorProfiles.find((item) => item.author === activeClawhubAuthor) ?? null,
    [marketReport, activeClawhubAuthor],
  );
  const claudeSkill = useMemo(
    () => marketReport?.claude.skills.topByInstalls.find((item) => item.name === activeClaudeSkill) ?? null,
    [marketReport, activeClaudeSkill],
  );
  const claudeOwner = useMemo(
    () => marketReport?.claude.skills.topOwners.find((item) => item.owner === activeClaudeOwner) ?? null,
    [marketReport, activeClaudeOwner],
  );
  const claudeMarketplace = useMemo(
    () => marketReport?.claude.marketplaces.topByStars.find((item) => item.repo === activeMarketplace) ?? null,
    [marketReport, activeMarketplace],
  );
  const hermesSkill = useMemo(
    () => marketReport?.hermes.bundled.find((item) => item.name === activeHermesSkill) ?? null,
    [marketReport, activeHermesSkill],
  );
  const agentSkill = useMemo(
    () => agentSkillReport?.skills.topByOpportunity.find((item) => item.name === activeAgentSkill) ?? null,
    [agentSkillReport, activeAgentSkill],
  );
  const agentCreator = useMemo(
    () => agentSkillReport?.creators.topCreators.find((item) => item.owner === activeAgentCreator) ?? null,
    [agentSkillReport, activeAgentCreator],
  );
  const agentPlugin = useMemo(
    () => agentSkillReport?.plugins.topByOpportunity.find((item) => item.slug === activeAgentPlugin) ?? null,
    [agentSkillReport, activeAgentPlugin],
  );
  const agentSoSkill = useMemo(
    () => agentSkillsSoReport?.skills.topByOpportunity.find((item) => item.name === activeAgentSoSkill) ?? null,
    [agentSkillsSoReport, activeAgentSoSkill],
  );
  const agentSoAuthor = useMemo(
    () => agentSkillsSoReport?.authors.topAuthors.find((item) => item.owner === activeAgentSoAuthor) ?? null,
    [agentSkillsSoReport, activeAgentSoAuthor],
  );
  const combinedOpportunity = useMemo(
    () => mergedOpportunities.find((item) => opportunityKey(item) === activeAisaOpportunity) ?? null,
    [mergedOpportunities, activeAisaOpportunity],
  );

  if (!marketReport || !agentSkillReport || !agentSkillsSoReport) {
    return <main className="mi-shell mi-loading">Loading market intelligence…</main>;
  }

  const extendedExecutionLanes = [
    ...marketReport.combined.executionLanes,
    'AgentSkill 负责验证 quality/security/rating 驱动的技能与 plugin 分发面。',
    'AgentSkills.so 负责验证周下载、repo 信任和安全姿态对技能商品化的影响。',
  ];

  return (
    <main className="mi-shell">
      <section className="mi-hero">
        <div className="mi-hero-copy">
          <div className="mi-eyebrow">Cross-Market Skill Intelligence</div>
          <h1>把五个平台放到同一张爆款地图里看</h1>
          <p>
            这页把已有 ClawHub、Claude、Hermes、AgentSkill、AgentSkills.so 的实时采样和爆款结构统一翻译成一套
            “什么会火、为什么会火、哪些最适合改造成 AISA API、发布时要避开什么坑”的实战视图。
          </p>
          <div className="mi-hero-links">
            <a href={`${import.meta.env.BASE_URL}clawhub-download-insights.html`} className="mi-primary-link">
              打开 ClawHub 详情页
            </a>
            <a href={marketReport.sources.claudeSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              Claude Skills
            </a>
            <a href={marketReport.sources.hermesSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              Hermes Skills
            </a>
            <a href={agentSkillReport.sources.skills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              AgentSkill
            </a>
            <a href={agentSkillsSoReport.sources.listings[0]} target="_blank" rel="noreferrer" className="mi-secondary-link">
              AgentSkills.so
            </a>
            <a href={`${import.meta.env.BASE_URL}reports/`} target="_blank" rel="noreferrer" className="mi-secondary-link">
              报告索引
            </a>
          </div>
          <div className="mi-chip-row">
            <span>Updated {format(new Date(marketReport.generatedAt), 'yyyy-MM-dd HH:mm')}</span>
            <span>ClawHub + Claude + Hermes + AgentSkill + AgentSkills.so</span>
            <span>爆款、风控、AISA 选品一张图</span>
          </div>
        </div>
        <div className="mi-stat-grid">
          <article className="mi-stat-card tone-sand">
            <Sparkles size={18} />
            <span>ClawHub Top 200 可转 AISA</span>
            <strong>{metric(marketReport.clawhub.summary.top200ConvertibleCandidates)}</strong>
          </article>
          <article className="mi-stat-card tone-sea">
            <Layers3 size={18} />
            <span>Claude Skills / Markets</span>
            <strong>
              {metric(marketReport.claude.skills.summary.totalSkills)} / {metric(marketReport.claude.marketplaces.summary.totalMarketplaces)}
            </strong>
          </article>
          <article className="mi-stat-card tone-forest">
            <Rocket size={18} />
            <span>Hermes Bundled / Live</span>
            <strong>
              {metric(marketReport.hermes.summary.bundledSkills)} / {metric(marketReport.hermes.summary.advertisedBundledSkills)}
            </strong>
          </article>
          <article className="mi-stat-card tone-rust">
            <Target size={18} />
            <span>AgentSkill 样本</span>
            <strong>
              {metric(agentSkillReport.summary.sampledSkills)} / {metric(agentSkillReport.summary.sampledPlugins)}
            </strong>
          </article>
          <article className="mi-stat-card tone-sea">
            <ShieldCheck size={18} />
            <span>AgentSkills.so 样本</span>
            <strong>{metric(agentSkillsSoReport.summary.sampledSkills)}</strong>
          </article>
          <article className="mi-stat-card tone-sand">
            <Sparkles size={18} />
            <span>Unified AISA Queue</span>
            <strong>{metric(mergedOpportunities.length)}</strong>
          </article>
        </div>
      </section>

      <section className="mi-tabs">
        {[
          ['overview', '总览'],
          ['clawhub', 'ClawHub'],
          ['claude', 'Claude'],
          ['hermes', 'Hermes'],
          ['agentskill', 'AgentSkill'],
          ['agentskillsso', 'AgentSkills.so'],
          ['aisa', 'AISA 改造'],
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
                `现有 AISA skills 规划: ${metric(marketReport.clawhub.summary.existingAisaSkillsPlanned)}`,
              ]}
              bullets={marketReport.clawhub.viralPlaybook.keySuccessFactors.slice(0, 4)}
              link={`${import.meta.env.BASE_URL}clawhub-download-insights.html`}
            />
            <DetailCard
              title="Claude 市场给我们的增量"
              eyebrow="Claude"
              lines={[
                `Skills: ${metric(marketReport.claude.skills.summary.totalSkills)}`,
                `Top installs category: ${marketReport.claude.skills.summary.topCategory}`,
                `Marketplaces: ${metric(marketReport.claude.marketplaces.summary.totalMarketplaces)}`,
              ]}
              bullets={marketReport.claude.skills.commonPatterns.slice(0, 4)}
              link={marketReport.sources.claudeSkills}
            />
            <DetailCard
              title="Hermes 适合作为什么"
              eyebrow="Hermes"
              lines={[
                `Live guide ${metric(marketReport.hermes.summary.advertisedBundledSkills)} bundled skills`,
                `raw catalog ${metric(marketReport.hermes.summary.bundledSkills)} bundled rows`,
                `最强标签带: ${marketReport.hermes.tags.slice(0, 3).map((item) => item.name).join(' · ')}`,
              ]}
              bullets={marketReport.hermes.commonPatterns.slice(0, 4)}
              link={marketReport.sources.hermesSkills}
            />
            <DetailCard
              title="AgentSkill 的启发"
              eyebrow="AgentSkill"
              lines={[
                `skills / plugins / creators: ${metric(agentSkillReport.summary.sampledSkills)} / ${metric(agentSkillReport.summary.sampledPlugins)} / ${metric(agentSkillReport.summary.sampledCreators)}`,
                `owner pages fetched: ${metric(agentSkillReport.summary.ownerPagesFetched)}`,
                `Top category: ${agentSkillReport.summary.topSkillCategory ?? 'n/a'}`,
              ]}
              bullets={mappedBullets(agentSkillReport.skills.commonPatterns.slice(0, 3), [agentSkillReport.sampleNotes.skills])}
              link={agentSkillReport.sources.skills}
            />
            <DetailCard
              title="AgentSkills.so 的启发"
              eyebrow="AgentSkills.so"
              lines={[
                `sampled skills: ${metric(agentSkillsSoReport.summary.sampledSkills)}`,
                `sampled authors: ${metric(agentSkillsSoReport.summary.sampledAuthors)}`,
                `avg platform coverage: ${metric(agentSkillsSoReport.summary.avgPlatformCoverage)}`,
              ]}
              bullets={mappedBullets(
                agentSkillsSoReport.skills.commonPatterns.slice(0, 2),
                [
                  `Top category: ${agentSkillsSoReport.summary.topCategory ?? 'n/a'}`,
                  `分页抓取页数: ${agentSkillsSoReport.sampleNotes.pagesFetched.length}`,
                  `安全细分已解析样本: ${metric(agentSkillsSoReport.summary.resolvedSecuritySamples)}`,
                ],
              )}
              link={agentSkillsSoReport.sources.listings[0]}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>跨平台最值得做的 AISA 机会</h2>
              <p>把五个平台合并以后，真正值得先抢的位置会进一步集中，而且“爆款”与“可发布”开始重叠。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Top opportunities"
                items={mergedOpportunities}
                activeKey={activeAisaOpportunity}
                onSelect={setActiveAisaOpportunity}
                getKey={opportunityKey}
                renderMeta={(item) => `${item.ecosystem} · ${item.category} · ${metric(item.opportunityScore ?? item.aisaOpportunityScore)}`}
              />
              {combinedOpportunity ? (
                <DetailCard
                  title={combinedOpportunity.name}
                  eyebrow={combinedOpportunity.ecosystem}
                  lines={[
                    combinedOpportunity.targetTitle,
                    `${combinedOpportunity.category} · ${combinedOpportunity.apiFamily}`,
                    `机会分 ${metric(combinedOpportunity.opportunityScore ?? combinedOpportunity.aisaOpportunityScore)}`,
                  ]}
                  bullets={mappedBullets([combinedOpportunity.summary ?? combinedOpportunity.description], combinedOpportunity.moves?.slice(0, 3))}
                  link={sourceLink(combinedOpportunity.sourceUrl ?? combinedOpportunity.url)}
                />
              ) : null}
            </div>
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
            <div className="mi-master-detail">
              <SkillList
                title="Top skills"
                items={marketReport.clawhub.topSkills}
                activeKey={activeClawhubSkill}
                onSelect={setActiveClawhubSkill}
                getKey={(item) => item.slug}
                renderMeta={(item) => `${metric(item.downloads)} 下载 · ${metric(item.stars)} 星 · ${metric(item.installsCurrent)} 装`}
              />
              {clawhubSkill ? (
                <DetailCard
                  title={clawhubSkill.name}
                  eyebrow={`@${clawhubSkill.author}`}
                  lines={[
                    `${metric(clawhubSkill.downloads)} 下载 · ${metric(clawhubSkill.stars)} 星 · ${metric(clawhubSkill.installsCurrent)} 装`,
                    `${clawhubSkill.theme} · 三榜出现 ${clawhubSkill.appearances} 次`,
                    `downloads #${clawhubSkill.ranks.downloads} · stars #${clawhubSkill.ranks.stars} · installs #${clawhubSkill.ranks.installs}`,
                  ]}
                  bullets={[clawhubSkill.description]}
                  link={clawhubSkill.url}
                />
              ) : null}
            </div>
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>ClawHub 爆款作者</h2>
              <p>把作者画像做清楚以后，复制打法会比只看单 skill 更稳。</p>
            </div>
            <div className="mi-master-detail">
              <OwnerList title="Top authors" items={marketReport.clawhub.topAuthorProfiles} activeKey={activeClawhubAuthor} onSelect={setActiveClawhubAuthor} />
              {clawhubAuthor ? (
                <DetailCard
                  title={`@${clawhubAuthor.author}`}
                  eyebrow="Author profile"
                  lines={[
                    `${clawhubAuthor.totalSkills} total skills`,
                    clawhubAuthor.topSkills.slice(0, 3).map((item) => item.name).join(' · '),
                    '更适合做平台词 + 高频工具词矩阵',
                  ]}
                  bullets={clawhubAuthor.topSkills.slice(0, 5).map((item) => `${item.name} · ${metric(item.downloads)} 下载 · ${item.theme}`)}
                />
              ) : null}
            </div>
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
            <div className="mi-master-detail">
              <SkillList
                title="Top installs"
                items={marketReport.claude.skills.topByInstalls}
                activeKey={activeClaudeSkill}
                onSelect={setActiveClaudeSkill}
                getKey={(item) => item.name}
                renderMeta={(item) => `${metric(item.installs)} 装 · ${metric(item.stars)} 星 · ${item.category}`}
              />
              {claudeSkill ? (
                <DetailCard
                  title={claudeSkill.name}
                  eyebrow={`@${claudeSkill.owner}`}
                  lines={[
                    `${metric(claudeSkill.installs)} installs · ${metric(claudeSkill.stars)} stars`,
                    `${claudeSkill.category} · ${claudeSkill.apiFamily}`,
                    claudeSkill.targetTitle,
                  ]}
                  bullets={mappedBullets([claudeSkill.summary ?? claudeSkill.description], claudeSkill.moves?.slice(0, 3))}
                  link={sourceLink(claudeSkill.repo ? `https://github.com/${claudeSkill.repo}` : null)}
                />
              ) : null}
            </div>
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>Claude Skill 作者 / 仓库画像</h2>
              <p>能量产的往往不是单 skill，而是一整个 skill repo。</p>
            </div>
            <div className="mi-master-detail">
              <OwnerList title="Top owners" items={marketReport.claude.skills.topOwners} activeKey={activeClaudeOwner} onSelect={setActiveClaudeOwner} />
              {claudeOwner ? (
                <DetailCard
                  title={`@${claudeOwner.owner}`}
                  eyebrow="Skill repo profile"
                  lines={[
                    `${metric(claudeOwner.skillCount)} skills · ${metric(claudeOwner.repoCount)} repos`,
                    `${metric(claudeOwner.totalInstalls)} installs · ${metric(claudeOwner.totalStars)} stars`,
                    claudeOwner.primaryCategories.join(' · '),
                  ]}
                  bullets={claudeOwner.topSkills?.slice(0, 5).map((item) => `${item.name} · ${metric(item.installs)} 装 · ${item.category}`)}
                />
              ) : null}
            </div>
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>Claude Marketplaces</h2>
              <p>它们更像“矩阵化分发仓库”，适合学习旗舰仓库 + 多变体 skill 的运营方式。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Top marketplaces"
                items={marketReport.claude.marketplaces.topByStars}
                activeKey={activeMarketplace}
                onSelect={setActiveMarketplace}
                getKey={(item) => item.repo ?? item.name}
                renderMeta={(item) => `${metric(item.stars)} 星 · ${metric(item.pluginCount)} plugins · ${item.category}`}
              />
              {claudeMarketplace ? (
                <DetailCard
                  title={claudeMarketplace.repo ?? claudeMarketplace.name}
                  eyebrow={`@${claudeMarketplace.owner}`}
                  lines={[
                    `${metric(claudeMarketplace.stars)} stars · ${metric(claudeMarketplace.pluginCount)} plugins`,
                    `${claudeMarketplace.category} · ${claudeMarketplace.apiFamily}`,
                    claudeMarketplace.targetTitle,
                  ]}
                  bullets={mappedBullets([claudeMarketplace.description], claudeMarketplace.moves?.slice(0, 3))}
                  link={sourceLink(claudeMarketplace.repo ? `https://github.com/${claudeMarketplace.repo}` : null)}
                />
              ) : null}
            </div>
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
                `Live guide: ${metric(marketReport.hermes.summary.advertisedBundledSkills)} bundled skills`,
                `raw catalog: ${metric(marketReport.hermes.summary.bundledSkills)} bundled rows`,
                `categories: ${metric(marketReport.hermes.summary.advertisedSkillCategories)}`,
              ]}
              bullets={[marketReport.hermes.commonPatterns[4] ?? marketReport.hermes.commonPatterns[0]]}
              link={marketReport.sources.hermesSkills}
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
            <div className="mi-master-detail">
              <SkillList
                title="Top bundled candidates"
                items={marketReport.hermes.bundled}
                activeKey={activeHermesSkill}
                onSelect={setActiveHermesSkill}
                getKey={(item) => item.name}
                renderMeta={(item) => `${item.sectionTitle} · ${item.category} · ${metric(item.aisaOpportunityScore)}`}
              />
              {hermesSkill ? (
                <DetailCard
                  title={hermesSkill.name}
                  eyebrow={hermesSkill.sectionTitle ?? 'Hermes'}
                  lines={[
                    `${hermesSkill.category} · ${hermesSkill.apiFamily}`,
                    hermesSkill.targetTitle,
                    hermesSkill.platformScope ?? 'cross-platform',
                  ]}
                  bullets={mappedBullets([hermesSkill.description], hermesSkill.moves?.slice(0, 3))}
                  link={marketReport.sources.hermesCatalog}
                />
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      {tab === 'agentskill' ? (
        <>
          <section className="mi-grid mi-grid-3">
            <DetailCard
              title="样本覆盖"
              eyebrow="Coverage"
              lines={[
                `skills ${metric(agentSkillReport.summary.sampledSkills)} · plugins ${metric(agentSkillReport.summary.sampledPlugins)}`,
                `creators ${metric(agentSkillReport.summary.sampledCreators)} · owner pages ${metric(agentSkillReport.summary.ownerPagesFetched)}`,
                `Top skill category: ${agentSkillReport.summary.topSkillCategory ?? 'n/a'}`,
              ]}
              bullets={[agentSkillReport.sampleNotes.skills, agentSkillReport.sampleNotes.plugins]}
              link={agentSkillReport.sources.skills}
            />
            <DetailCard
              title="质量与安全"
              eyebrow="Trust stack"
              lines={[
                `avg quality ${metric(agentSkillReport.summary.avgQualityScore)}/100`,
                `avg security ${metric(agentSkillReport.summary.avgSecurityScore)}/100`,
                `GitHub stars ${metric(agentSkillReport.summary.totalSkillGithubStars)}`,
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
            <div className="mi-master-detail">
              <SkillList
                title="Top skills"
                items={agentSkillReport.skills.topByOpportunity}
                activeKey={activeAgentSkill}
                onSelect={setActiveAgentSkill}
                getKey={(item) => item.name}
                renderMeta={(item) =>
                  `${metric(item.installs)} installs · ${metric(item.githubStars)} stars · ${metric(item.aisaOpportunityScore)}`
                }
              />
              {agentSkill ? (
                <DetailCard
                  title={agentSkill.name}
                  eyebrow={`@${agentSkill.owner}`}
                  lines={[
                    `${metric(agentSkill.installs)} installs · ${metric(agentSkill.githubStars)} stars`,
                    `${agentSkill.category} · ${agentSkill.apiFamily}`,
                    agentSkill.targetTitle,
                  ]}
                  bullets={[agentSkill.description, `quality ${metric(agentSkill.qualityScore)} · security ${metric(agentSkill.securityScore)}`]}
                  link={sourceLink(agentSkill.sourceUrl ?? `https://agentskill.sh${agentSkill.href ?? ''}`)}
                />
              ) : null}
            </div>
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>AgentSkill 作者工厂</h2>
              <p>最有价值的不是单次爆款，而是可以连续产出同主题高质 skill 的作者结构。</p>
            </div>
            <div className="mi-master-detail">
              <OwnerList title="Top creators" items={agentSkillReport.creators.topCreators} activeKey={activeAgentCreator} onSelect={setActiveAgentCreator} />
              {agentCreator ? (
                <DetailCard
                  title={`@${agentCreator.owner}`}
                  eyebrow="Creator factory"
                  lines={[
                    `${agentCreator.sampledSkills} sampled skills · ${agentCreator.sampledPlugins} sampled plugins`,
                    `${metric(agentCreator.totalInstalls)} installs · ${metric(agentCreator.totalGithubStars)} stars`,
                    agentCreator.primaryCategories.join(' · '),
                  ]}
                  bullets={[
                    `avg quality ${metric(agentCreator.avgQualityScore)} / avg security ${metric(agentCreator.avgSecurityScore)}`,
                    '更适合做旗舰 skill + 窄变体 + 同主题 plugin ladder',
                  ]}
                />
              ) : null}
            </div>
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>AgentSkill Plugin 结构</h2>
              <p>插件榜更适合看“主题打包能力”，它决定了我们以后怎么做 skill 家族和合集分发。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Top plugins"
                items={agentSkillReport.plugins.topByOpportunity}
                activeKey={activeAgentPlugin}
                onSelect={setActiveAgentPlugin}
                getKey={(item) => item.slug ?? item.name}
                renderMeta={(item) => `${metric(item.listedSkillCount)} skills · ${metric(item.listedGithubStars)} stars · ${metric(item.aisaOpportunityScore)}`}
              />
              {agentPlugin ? (
                <DetailCard
                  title={agentPlugin.slug ?? agentPlugin.name}
                  eyebrow={`@${agentPlugin.owner}`}
                  lines={[
                    `${metric(agentPlugin.listedSkillCount)} bundled skills`,
                    `${metric(agentPlugin.listedGithubStars)} GitHub stars`,
                    `${agentPlugin.category} · ${agentPlugin.targetTitle}`,
                  ]}
                  bullets={[agentPlugin.description, ...agentSkillReport.plugins.commonPatterns.slice(0, 2)]}
                  link={sourceLink(`https://agentskill.sh${agentPlugin.href ?? ''}`)}
                />
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      {tab === 'agentskillsso' ? (
        <>
          <section className="mi-grid mi-grid-3">
            <DetailCard
              title="分页覆盖"
              eyebrow="Coverage"
              lines={[
                `skills ${metric(agentSkillsSoReport.summary.sampledSkills)} · authors ${metric(agentSkillsSoReport.summary.sampledAuthors)}`,
                `listing pages ${metric(agentSkillsSoReport.sampleNotes.pagesFetched.length)}`,
                `avg platform coverage ${metric(agentSkillsSoReport.summary.avgPlatformCoverage)}`,
              ]}
              bullets={[
                `Top category ${agentSkillsSoReport.summary.topCategory ?? 'n/a'}`,
                `listing count ${agentSkillsSoReport.sampleNotes.listingCount}`,
                `detail count ${agentSkillsSoReport.sampleNotes.detailCount}`,
              ]}
              link={agentSkillsSoReport.sources.listings[0]}
            />
            <DetailCard
              title="信任与需求"
              eyebrow="Signals"
              lines={[
                `${metric(agentSkillsSoReport.summary.totalWeeklyDownloads)} weekly downloads`,
                `${metric(agentSkillsSoReport.summary.totalGithubStars)} repo stars`,
                `${metric(agentSkillsSoReport.summary.resolvedSecuritySamples)} security-resolved samples · avg ${metric(agentSkillsSoReport.summary.avgSecurityScore)}/100`,
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
            <div className="mi-master-detail">
              <SkillList
                title="Top skills"
                items={agentSkillsSoReport.skills.topByOpportunity}
                activeKey={activeAgentSoSkill}
                onSelect={setActiveAgentSoSkill}
                getKey={(item) => item.name}
                renderMeta={(item) => `${metric(item.weeklyDownloads)} /wk · ${metric(item.githubStars)} stars · ${metric(item.aisaOpportunityScore)}`}
              />
              {agentSoSkill ? (
                <DetailCard
                  title={agentSoSkill.name}
                  eyebrow={`@${agentSoSkill.owner}`}
                  lines={[
                    `${metric(agentSoSkill.weeklyDownloads)} weekly downloads · ${metric(agentSoSkill.githubStars)} stars`,
                    `${agentSoSkill.category} · ${agentSoSkill.apiFamily}`,
                    `${agentSoSkill.targetTitle} · ${metric(agentSoSkill.platformCoverageCount)} platforms`,
                  ]}
                  bullets={[
                    agentSoSkill.description,
                    `security ${metric(agentSoSkill.securityScore)} / 100 · trust ${metric(agentSoSkill.trustIdentityScore)} / 5 · behavior ${metric(agentSoSkill.behavioralMonitoringScore)} / 5 · vulnerability ${metric(agentSoSkill.vulnerabilityExposureScore)} / 5`,
                    `cross-distribution installs ${metric(agentSoSkill.totalDistributionInstalls)} · platform coverage score ${metric(agentSoSkill.platformCoverageScore)}`,
                  ]}
                  link={sourceLink(agentSoSkill.sourceUrl ?? `https://agentskills.so${agentSoSkill.href ?? ''}`)}
                />
              ) : null}
            </div>
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>AgentSkills.so 跨分发覆盖</h2>
              <p>这里专门看哪些技能已经被多个 agent distribution 接入，它们通常更适合做通用 API 层和平台复用型商品。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Top platform coverage"
                items={agentSkillsSoReport.skills.topByPlatformCoverage}
                activeKey={activeAgentSoSkill}
                onSelect={setActiveAgentSoSkill}
                getKey={(item) => item.name}
                renderMeta={(item) =>
                  `${metric(item.platformCoverageCount)} platforms · ${metric(item.totalDistributionInstalls)} installs · ${metric(item.platformCoverageScore)}`
                }
              />
              {agentSoSkill ? (
                <DetailCard
                  title={agentSoSkill.name}
                  eyebrow={`@${agentSoSkill.owner}`}
                  lines={[
                    `${metric(agentSoSkill.platformCoverageCount)} distributions · ${metric(agentSoSkill.totalDistributionInstalls)} visible installs`,
                    `${agentSoSkill.category} · ${agentSoSkill.apiFamily}`,
                    `Opportunity ${metric(agentSoSkill.aisaOpportunityScore)} · Security ${metric(agentSoSkill.securityScore)}/100`,
                  ]}
                  bullets={[
                    agentSoSkill.description,
                    '多 distribution 可见性通常意味着命名更稳、边界更清楚、对不同 agent 的适配成本更低。',
                  ]}
                  link={sourceLink(agentSoSkill.sourceUrl ?? `https://agentskills.so${agentSoSkill.href ?? ''}`)}
                />
              ) : null}
            </div>
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>AgentSkills.so 作者画像</h2>
              <p>这一层让我们更容易看清“哪些 repo owner 已经形成技能商品化工厂”。</p>
            </div>
            <div className="mi-master-detail">
              <OwnerList title="Top authors" items={agentSkillsSoReport.authors.topAuthors} activeKey={activeAgentSoAuthor} onSelect={setActiveAgentSoAuthor} />
              {agentSoAuthor ? (
                <DetailCard
                  title={`@${agentSoAuthor.owner}`}
                  eyebrow="Author factory"
                  lines={[
                    `${agentSoAuthor.skillCount} sampled skills`,
                    `${metric(agentSoAuthor.totalWeeklyDownloads)} weekly downloads · ${metric(agentSoAuthor.totalGithubStars)} stars`,
                    agentSoAuthor.primaryCategories.join(' · '),
                  ]}
                  bullets={[
                    `avg security ${metric(agentSoAuthor.avgSecurityScore)}`,
                    '更适合把 skill 当成可持续上新和可持续分发的商品层',
                  ]}
                />
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      {tab === 'aisa' ? (
        <>
          <section className="mi-grid mi-grid-2">
            <DetailCard title="统一设计原则" eyebrow="Design" lines={['先抢高意图搜索词', '先占旗舰包，再拆变体', '结果必须第一轮就显价值']} bullets={marketReport.combined.designPrinciples} />
            <DetailCard title="执行分工" eyebrow="Execution" lines={['ClawHub 验证转化', 'Claude 验证 repo 分发', 'Hermes 反推工作流边界']} bullets={extendedExecutionLanes} />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>现在最值得推进的改造清单</h2>
              <p>这里把五条线的机会压成一张可执行队列，你可以直接拿去排版本和排发布节奏。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Opportunity queue"
                items={mergedOpportunities}
                activeKey={activeAisaOpportunity}
                onSelect={setActiveAisaOpportunity}
                getKey={opportunityKey}
                renderMeta={(item) => `${item.ecosystem} · ${item.category} · ${metric(item.opportunityScore ?? item.aisaOpportunityScore)}`}
              />
              {combinedOpportunity ? (
                <DetailCard
                  title={combinedOpportunity.name}
                  eyebrow={combinedOpportunity.ecosystem}
                  lines={[
                    combinedOpportunity.targetTitle,
                    `${combinedOpportunity.category} · ${combinedOpportunity.apiFamily}`,
                    `机会分 ${metric(combinedOpportunity.opportunityScore ?? combinedOpportunity.aisaOpportunityScore)}`,
                  ]}
                  bullets={mappedBullets([combinedOpportunity.summary ?? combinedOpportunity.description], combinedOpportunity.moves?.slice(0, 4))}
                  link={sourceLink(combinedOpportunity.sourceUrl ?? combinedOpportunity.url)}
                />
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
