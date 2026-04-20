import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowRight, ExternalLink, Layers3, Rocket, Sparkles, Target } from 'lucide-react';
import type {
  ClawhubAuthorProfile,
  ClawhubTopSkill,
  MarketEcosystemReport,
  MarketOwnerProfile,
  MarketSkill,
} from './types';

type TabKey = 'overview' | 'clawhub' | 'claude' | 'hermes' | 'aisa';

function metric(value: number | string | null | undefined) {
  if (typeof value === 'number') return value.toLocaleString('en-US');
  return value ?? 'n/a';
}

function sourceLink(value?: string | null) {
  if (!value) return null;
  return value.startsWith('http') ? value : null;
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

function OwnerList<T extends MarketOwnerProfile | ClawhubAuthorProfile>({
  title,
  items,
  activeKey,
  onSelect,
}: {
  title: string;
  items: T[];
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
          const subtitle =
            'owner' in item
              ? `${metric(item.totalStars)} stars · ${metric(item.totalInstalls ?? item.totalPlugins ?? item.skillCount ?? 0)} scale`
              : `${item.totalSkills} total skills`;
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

export default function App() {
  const [report, setReport] = useState<MarketEcosystemReport | null>(null);
  const [tab, setTab] = useState<TabKey>('overview');
  const [activeClawhubSkill, setActiveClawhubSkill] = useState<string | null>(null);
  const [activeClawhubAuthor, setActiveClawhubAuthor] = useState<string | null>(null);
  const [activeClaudeSkill, setActiveClaudeSkill] = useState<string | null>(null);
  const [activeClaudeOwner, setActiveClaudeOwner] = useState<string | null>(null);
  const [activeMarketplace, setActiveMarketplace] = useState<string | null>(null);
  const [activeHermesSkill, setActiveHermesSkill] = useState<string | null>(null);
  const [activeAisaOpportunity, setActiveAisaOpportunity] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/market-ecosystem-report.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`market-ecosystem-report.json ${response.status}`);
        return response.json();
      })
      .then((json: MarketEcosystemReport) => {
        setReport(json);
        setActiveClawhubSkill(json.clawhub.topSkills[0]?.slug ?? null);
        setActiveClawhubAuthor(json.clawhub.topAuthorProfiles[0]?.author ?? null);
        setActiveClaudeSkill(json.claude.skills.topByInstalls[0]?.name ?? null);
        setActiveClaudeOwner(json.claude.skills.topOwners[0]?.owner ?? null);
        setActiveMarketplace(json.claude.marketplaces.topByStars[0]?.repo ?? null);
        setActiveHermesSkill(json.hermes.bundled[0]?.name ?? null);
        setActiveAisaOpportunity(json.combined.combinedOpportunities[0]?.name ?? null);
      })
      .catch((error) => console.error('Failed to load market ecosystem report', error));
  }, []);

  const clawhubSkill = useMemo(
    () => report?.clawhub.topSkills.find((item) => item.slug === activeClawhubSkill) ?? null,
    [report, activeClawhubSkill],
  );
  const clawhubAuthor = useMemo(
    () => report?.clawhub.topAuthorProfiles.find((item) => item.author === activeClawhubAuthor) ?? null,
    [report, activeClawhubAuthor],
  );
  const claudeSkill = useMemo(
    () => report?.claude.skills.topByInstalls.find((item) => item.name === activeClaudeSkill) ?? null,
    [report, activeClaudeSkill],
  );
  const claudeOwner = useMemo(
    () => report?.claude.skills.topOwners.find((item) => item.owner === activeClaudeOwner) ?? null,
    [report, activeClaudeOwner],
  );
  const claudeMarketplace = useMemo(
    () => report?.claude.marketplaces.topByStars.find((item) => item.repo === activeMarketplace) ?? null,
    [report, activeMarketplace],
  );
  const hermesSkill = useMemo(
    () => report?.hermes.bundled.find((item) => item.name === activeHermesSkill) ?? null,
    [report, activeHermesSkill],
  );
  const combinedOpportunity = useMemo(
    () => report?.combined.combinedOpportunities.find((item) => item.name === activeAisaOpportunity) ?? null,
    [report, activeAisaOpportunity],
  );

  if (!report) {
    return <main className="mi-shell mi-loading">Loading market intelligence…</main>;
  }

  return (
    <main className="mi-shell">
      <section className="mi-hero">
        <div className="mi-hero-copy">
          <div className="mi-eyebrow">Cross-Market Skill Intelligence</div>
          <h1>把 ClawHub、Claude、Hermes 放到同一张爆款地图里看</h1>
          <p>
            这页把已有 ClawHub 爆款分析、Claude Marketplaces 实时目录、Hermes 官方 skills atlas，统一翻译成一套“什么会火、为什么会火、
            哪些最适合改造成 AISA API、我们下一步该怎么做”的实战视图。
          </p>
          <div className="mi-hero-links">
            <a href={`${import.meta.env.BASE_URL}clawhub-download-insights.html`} className="mi-primary-link">
              打开 ClawHub 详情页
            </a>
            <a href={report.sources.claudeSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              Claude Skills 源站
            </a>
            <a href={report.sources.hermesSkills} target="_blank" rel="noreferrer" className="mi-secondary-link">
              Hermes Skills 源站
            </a>
          </div>
          <div className="mi-chip-row">
            <span>Updated {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}</span>
            <span>ClawHub + Claude + Hermes</span>
            <span>老板看得懂的爆款与 AISA 路线图</span>
          </div>
        </div>
        <div className="mi-stat-grid">
          <article className="mi-stat-card tone-sand">
            <Sparkles size={18} />
            <span>ClawHub Top 200 可转 AISA</span>
            <strong>{metric(report.clawhub.summary.top200ConvertibleCandidates)}</strong>
          </article>
          <article className="mi-stat-card tone-sea">
            <Layers3 size={18} />
            <span>Claude Skills</span>
            <strong>{metric(report.claude.skills.summary.totalSkills)}</strong>
          </article>
          <article className="mi-stat-card tone-forest">
            <Rocket size={18} />
            <span>Claude Marketplaces</span>
            <strong>{metric(report.claude.marketplaces.summary.totalMarketplaces)}</strong>
          </article>
          <article className="mi-stat-card tone-rust">
            <Target size={18} />
            <span>Hermes Bundled / Live</span>
            <strong>
              {metric(report.hermes.summary.bundledSkills)} / {metric(report.hermes.summary.advertisedBundledSkills)}
            </strong>
          </article>
        </div>
      </section>

      <section className="mi-tabs">
        {[
          ['overview', '总览'],
          ['clawhub', 'ClawHub'],
          ['claude', 'Claude'],
          ['hermes', 'Hermes'],
          ['aisa', 'AISA 改造'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`mi-tab${tab === value ? ' is-active' : ''}`}
            onClick={() => setTab(value as TabKey)}
          >
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
                `最强总榜 skill: ${report.clawhub.summary.topSkillAcrossThreeLists.name}`,
                `下载榜主类目: ${report.clawhub.summary.downloadsTopCategory}`,
                `现有 AISA skills 规划: ${metric(report.clawhub.summary.existingAisaSkillsPlanned)}`,
              ]}
              bullets={report.clawhub.viralPlaybook.keySuccessFactors.slice(0, 4)}
              link={`${import.meta.env.BASE_URL}clawhub-download-insights.html`}
            />
            <DetailCard
              title="Claude 市场给我们的增量"
              eyebrow="Claude"
              lines={[
                `Skills: ${metric(report.claude.skills.summary.totalSkills)}`,
                `Top installs category: ${report.claude.skills.summary.topCategory}`,
                `Marketplaces: ${metric(report.claude.marketplaces.summary.totalMarketplaces)}`,
              ]}
              bullets={report.claude.skills.commonPatterns.slice(0, 4)}
              link={report.sources.claudeSkills}
            />
            <DetailCard
              title="Hermes 适合作为什么"
              eyebrow="Hermes"
              lines={[
                `Live guide 宣称 ${metric(report.hermes.summary.advertisedBundledSkills)} bundled skills`,
                `raw catalog 当前可结构化 ${metric(report.hermes.summary.bundledSkills)} 个 bundled rows`,
                `最强标签带: ${report.hermes.tags.slice(0, 3).map((item) => item.name).join(' · ')}`,
              ]}
              bullets={report.hermes.commonPatterns.slice(0, 4)}
              link={report.sources.hermesSkills}
            />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>跨生态最值得做的 AISA 机会</h2>
              <p>把三条市场线合并以后，最值得先抢的位置会非常集中。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Top opportunities"
                items={report.combined.combinedOpportunities}
                activeKey={activeAisaOpportunity}
                onSelect={setActiveAisaOpportunity}
                getKey={(item) => item.name}
                renderMeta={(item) => `${item.ecosystem ?? 'Market'} · ${item.category} · ${metric(item.opportunityScore)}`}
              />
              {combinedOpportunity ? (
                <DetailCard
                  title={combinedOpportunity.name}
                  eyebrow={combinedOpportunity.ecosystem ?? 'Opportunity'}
                  lines={[
                    combinedOpportunity.targetTitle,
                    `${combinedOpportunity.category} · ${combinedOpportunity.apiFamily}`,
                    `机会分 ${metric(combinedOpportunity.opportunityScore)}`,
                  ]}
                  bullets={[combinedOpportunity.summary]}
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
                items={report.clawhub.topSkills}
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
              <OwnerList title="Top authors" items={report.clawhub.topAuthorProfiles} activeKey={activeClawhubAuthor} onSelect={setActiveClawhubAuthor} />
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

          <section className="mi-grid mi-grid-2">
            <DetailCard title="ClawHub 可复制打法" eyebrow="Playbook" lines={['先做平台词旗舰包', '再拆 2 到 4 个窄变体', '输出一定要首轮见效']} bullets={report.clawhub.viralPlaybook.productionSystem.slice(0, 6)} />
            <DetailCard title="现有 AISA 优先升级包" eyebrow="Flagship" lines={report.clawhub.flagshipAisaPriorities.slice(0, 3).map((item) => `${item.name} · ${item.priorityScore ?? item.aisaFitScore}`)} bullets={report.clawhub.flagshipAisaPriorities.slice(0, 5).map((item) => `${item.name}: ${item.summary}`)} />
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
                items={report.claude.skills.topByInstalls}
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
                  bullets={[claudeSkill.summary, ...(claudeSkill.moves ?? []).slice(0, 3)]}
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
              <OwnerList title="Top owners" items={report.claude.skills.topOwners} activeKey={activeClaudeOwner} onSelect={setActiveClaudeOwner} />
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
              <p>它们更像“矩阵化分发仓库”，适合我们学习旗舰仓库 + 多变体 skill 的运营方式。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Top marketplaces"
                items={report.claude.marketplaces.topByStars}
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
                  bullets={[claudeMarketplace.description, ...(claudeMarketplace.moves ?? []).slice(0, 3)]}
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
                `Live guide: ${metric(report.hermes.summary.advertisedBundledSkills)} bundled skills`,
                `raw catalog: ${metric(report.hermes.summary.bundledSkills)} bundled rows`,
                `categories: ${metric(report.hermes.summary.advertisedSkillCategories)}`,
              ]}
              bullets={[report.hermes.commonPatterns[4] ?? report.hermes.commonPatterns[0]]}
              link={report.sources.hermesSkills}
            />
            <DetailCard
              title="高频标签"
              eyebrow="Tags"
              lines={[report.hermes.tags.slice(0, 6).map((item) => `${item.name} ${item.count}`).join(' · ')]}
              bullets={report.hermes.categoryButtons.slice(0, 12).map((item) => `官方筛选按钮：${item}`)}
            />
            <DetailCard
              title="我们该怎么用 Hermes"
              eyebrow="Role"
              lines={['拿它做“官方工作流 atlas”', '不是单纯看热度榜', '更适合反推哪些能力值得 API 化']}
              bullets={report.hermes.commonPatterns.slice(0, 4)}
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
                items={report.hermes.bundled}
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
                  bullets={[hermesSkill.description, ...(hermesSkill.moves ?? []).slice(0, 3)]}
                  link={report.sources.hermesCatalog}
                />
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      {tab === 'aisa' ? (
        <>
          <section className="mi-grid mi-grid-2">
            <DetailCard title="统一设计原则" eyebrow="Design" lines={['先抢高意图搜索词', '先占旗舰包，再拆变体', '结果必须第一轮就显价值']} bullets={report.combined.designPrinciples} />
            <DetailCard title="执行分工" eyebrow="Execution" lines={['ClawHub 验证转化', 'Claude 验证 repo 分发', 'Hermes 反推工作流边界']} bullets={report.combined.executionLanes} />
          </section>

          <section className="mi-board">
            <div className="mi-section-top">
              <h2>现在最值得推进的改造清单</h2>
              <p>这里把三条线的机会压成一张可执行队列，你可以直接拿去排版本和排发布节奏。</p>
            </div>
            <div className="mi-master-detail">
              <SkillList
                title="Opportunity queue"
                items={report.combined.combinedOpportunities}
                activeKey={activeAisaOpportunity}
                onSelect={setActiveAisaOpportunity}
                getKey={(item) => item.name}
                renderMeta={(item) => `${item.ecosystem ?? 'Market'} · ${item.category} · ${metric(item.opportunityScore)}`}
              />
              {combinedOpportunity ? (
                <DetailCard
                  title={combinedOpportunity.name}
                  eyebrow={combinedOpportunity.ecosystem ?? 'Queue'}
                  lines={[
                    combinedOpportunity.targetTitle,
                    `${combinedOpportunity.category} · ${combinedOpportunity.apiFamily}`,
                    `机会分 ${metric(combinedOpportunity.opportunityScore)}`,
                  ]}
                  bullets={[combinedOpportunity.summary]}
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
