import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Boxes,
  Download,
  ExternalLink,
  FileCode2,
  Github,
  Layers,
  Package2,
  Search,
  ShieldAlert,
  TableProperties,
} from 'lucide-react';
import clsx from 'clsx';
import type {
  AisaApiAnalysisData,
  AisaAnalysisGroup,
  AisaAnalysisInterface,
  AisaAnalysisSkill,
  CatalogData,
  CatalogItem,
  OptimizedPackage,
  OptimizedPackageIndex,
} from './types';

type ViewMode = 'interfaces' | 'skills' | 'catalog';
type SourceFilter = 'all' | 'clawhub' | 'github';
type ImplementationFilter = 'all' | 'implemented' | 'documented_only' | 'not_found';
type CatalogTypeFilter = 'all' | 'skill' | 'plugin';

function splitSummary(summary: string) {
  return summary
    .split(/[、,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone: 'sand' | 'mint' | 'ember' | 'sky';
}) {
  return (
    <div className={clsx('stat-card', `tone-${tone}`)}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function ItemCard({ item, optimizedPackage }: { item: CatalogItem; optimizedPackage?: OptimizedPackage }) {
  const staticChecksPassed = optimizedPackage?.verificationStatus === 'static_checks_passed';

  return (
    <article className="item-card">
      <div className="item-topline">
        <span className={clsx('pill', item.type === 'plugin' ? 'pill-plugin' : 'pill-skill')}>{item.type}</span>
        {item.usesAisaApi ? <span className="pill pill-aisa">AISA API</span> : null}
        {item.suspicious ? <span className="pill pill-alert">{item.suspiciousLabel ?? 'Suspicious'}</span> : null}
      </div>
      <h3>{item.name}</h3>
      <p>{item.description || 'No description found.'}</p>
      <div className="item-meta">
        <span>@{item.owner}</span>
        <span>v{item.version || 'unknown'}</span>
        <span>
          <Download size={14} />
          {item.downloads ?? 'n/a'}
        </span>
      </div>
      {item.suspiciousReason ? <div className="item-warning">{item.suspiciousReason}</div> : null}
      {optimizedPackage ? (
        <div className="item-release">
          <div className="item-release-title">Optimized release</div>
          <div className="item-release-copy">Automated checks: {staticChecksPassed ? 'passed' : optimizedPackage.verificationStatus}</div>
        </div>
      ) : null}
      <div className="item-actions">
        <a className="item-action item-action-secondary" href={item.clawhubUrl} target="_blank" rel="noreferrer">
          View ClawHub
        </a>
        {item.downloadUrl ? (
          <a className="item-action item-action-primary" href={item.downloadUrl} target="_blank" rel="noreferrer">
            Original zip
          </a>
        ) : null}
      </div>
    </article>
  );
}

function ViewTabs({ view, setView, counts }: { view: ViewMode; setView: (view: ViewMode) => void; counts: Record<ViewMode, number> }) {
  return (
    <section className="tabs">
      {[
        ['interfaces', '接口列表'],
        ['skills', '技能列表'],
        ['catalog', 'ClawHub 目录'],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={clsx('tab-button', view === value && 'tab-button-active')}
          onClick={() => setView(value as ViewMode)}
        >
          <span>{label}</span>
          <strong>{counts[value as ViewMode]}</strong>
        </button>
      ))}
    </section>
  );
}

function InterfaceTable({ items }: { items: AisaAnalysisInterface[] }) {
  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>接口列表</h2>
        <p>以接口为主，展示 API、方法、入参出参摘要、技能实现和来源。</p>
      </div>
      <div className="table-list">
        {items.map((item) => (
          <article key={item.endpoint} className="table-card">
            <div className="table-card-top">
              <div>
                <h3>{item.name}</h3>
                <code>{item.endpoint}</code>
              </div>
              <div className="table-card-badges">
                <span className="pill pill-plugin">{item.method}</span>
                <span className={clsx('pill', item.coverageStatus === 'implemented' ? 'pill-aisa' : 'pill-alert')}>
                  {item.coverageStatus === 'implemented' ? `${item.skillCount} skills` : '无技能实现'}
                </span>
              </div>
            </div>
            <div className="matrix matrix-compact">
              <div>
                <div className="matrix-label">接口路径</div>
                <div className="field-stack">
                  <code>{item.endpoint}</code>
                  <span className="muted">Method: {item.method}</span>
                </div>
              </div>
              <div>
                <div className="matrix-label">实现覆盖</div>
                <div className="field-stack">
                  <span>已实现 {item.implementedSkillCount}</span>
                  <span>仅文档 {item.documentedOnlySkillCount}</span>
                  <span>ClawHub {item.skillsBySource.clawhub} / GitHub {item.skillsBySource.github}</span>
                </div>
              </div>
              <div>
                <div className="matrix-label">对比官方文档</div>
                <div>{item.comparisonToCreateChatCompletion}</div>
              </div>
              <div>
                <div className="matrix-label">官方参考</div>
                <div>
                  {item.officialDocUrl ? (
                    <a className="inline-link" href={item.officialDocUrl} target="_blank" rel="noreferrer">
                      打开文档 <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="muted">当前未绑定具体文档页</span>
                  )}
                </div>
              </div>
            </div>
            <div className="matrix matrix-dual">
              <div>
                <div className="matrix-label">典型入参</div>
                <div className="chip-wrap">
                  {splitSummary(item.inputSummary).map((part) => (
                    <span key={`${item.endpoint}-input-${part}`} className="chip">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="matrix-label">典型出参</div>
                <div className="chip-wrap">
                  {splitSummary(item.outputSummary).map((part) => (
                    <span key={`${item.endpoint}-output-${part}`} className="chip chip-muted">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="skill-ref-list">
              {item.skills.length > 0 ? (
                item.skills.map((skill) => (
                  <a key={`${item.endpoint}-${skill.skillId}`} className="skill-ref" href={skill.sourceUrl} target="_blank" rel="noreferrer">
                    <span>{skill.skillName}</span>
                    <small>
                      @{skill.owner} · {skill.sourceLabel} · {skill.status}
                    </small>
                  </a>
                ))
              ) : (
                <div className="empty-state small">当前下载包里没有发现这个接口的技能实现。</div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GroupTable({ items }: { items: AisaAnalysisGroup[] }) {
  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>同接口技能分组</h2>
        <p>把实现了同一个接口的技能直接编成组，方便快速看重复实现、不同来源和可替代项。</p>
      </div>
      <div className="group-grid">
        {items.map((group) => (
          <article key={group.endpoint} className="group-card">
            <div className="table-card-top">
              <div>
                <h3>{group.name}</h3>
                <code>{group.endpoint}</code>
              </div>
              <span className="pill pill-aisa">{group.skills.length} skills</span>
            </div>
            <div className="skill-ref-list skill-ref-list-dense">
              {group.skills.map((skill) => (
                <a key={`${group.endpoint}-${skill.skillId}`} className="skill-ref" href={skill.sourceUrl} target="_blank" rel="noreferrer">
                  <span>{skill.skillName}</span>
                  <small>
                    @{skill.owner} · {skill.sourceType === 'github' ? 'GitHub' : 'ClawHub'}
                  </small>
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SkillTable({
  items,
  relatedByEndpoint,
}: {
  items: AisaAnalysisSkill[];
  relatedByEndpoint: Map<string, string[]>;
}) {
  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>技能列表</h2>
        <p>以技能为主，汇总来源、使用接口，以及同接口下的其它技能实现分组。</p>
      </div>
      <div className="table-list">
        {items.map((skill) => (
          <article key={skill.id} className="table-card">
            <div className="table-card-top">
              <div>
                <h3>{skill.name}</h3>
                <div className="subtle-line">
                  @{skill.owner} · {skill.sourceLabel} · {skill.archiveType}
                </div>
              </div>
              <div className="table-card-badges">
                <span className={clsx('pill', skill.sourceType === 'github' ? 'pill-plugin' : 'pill-skill')}>
                  {skill.sourceLabel}
                </span>
                <span className={clsx('pill', skill.endpointCount > 0 ? 'pill-aisa' : 'pill-alert')}>
                  {skill.endpointCount > 0 ? `${skill.endpointCount} interfaces` : '未发现接口实现'}
                </span>
              </div>
            </div>
            <p className="skill-description">{skill.description || 'No description found.'}</p>
            <div className="matrix skill-matrix">
              <div>
                <div className="matrix-label">使用接口</div>
                <div className="chip-wrap">
                  {skill.endpoints.length > 0 ? (
                    skill.endpoints.map((endpoint) => (
                      <span key={`${skill.id}-${endpoint.endpoint}`} className="chip">
                        {endpoint.name}
                      </span>
                    ))
                  ) : (
                    <span className="muted">未从代码或 SKILL 文档中提取到 AISA endpoint。</span>
                  )}
                </div>
              </div>
              <div>
                <div className="matrix-label">同接口分组</div>
                <div className="chip-wrap">
                  {skill.endpoints.length > 0 ? (
                    skill.endpoints
                      .filter((endpoint) => (relatedByEndpoint.get(endpoint.endpoint) ?? []).length > 1)
                      .slice(0, 5)
                      .map((endpoint) => (
                        <span key={`${skill.id}-${endpoint.endpoint}-group`} className="chip chip-muted">
                          {endpoint.name} · {(relatedByEndpoint.get(endpoint.endpoint) ?? []).length} skills
                        </span>
                      ))
                  ) : (
                    <span className="muted">无可分组接口。</span>
                  )}
                </div>
              </div>
            </div>
            <div className="item-actions">
              <a className="item-action item-action-secondary" href={skill.sourceUrl} target="_blank" rel="noreferrer">
                查看来源
              </a>
              <a className="item-action item-action-primary" href={`${import.meta.env.BASE_URL}${skill.downloadPath}`} download>
                下载归档
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [optimized, setOptimized] = useState<OptimizedPackageIndex | null>(null);
  const [analysis, setAnalysis] = useState<AisaApiAnalysisData | null>(null);
  const [view, setView] = useState<ViewMode>('interfaces');
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [implementationFilter, setImplementationFilter] = useState<ImplementationFilter>('all');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<CatalogTypeFilter>('all');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/catalog.json`)
      .then((response) => response.json())
      .then((json: CatalogData) => setCatalog(json))
      .catch((error) => console.error('Failed to load catalog data', error));

    fetch(`${import.meta.env.BASE_URL}data/optimized-packages.json`)
      .then((response) => response.json())
      .then((json: OptimizedPackageIndex) => setOptimized(json))
      .catch((error) => console.error('Failed to load optimized package index', error));

    fetch(`${import.meta.env.BASE_URL}data/aisa-api-analysis.json`)
      .then((response) => response.json())
      .then((json: AisaApiAnalysisData) => setAnalysis(json))
      .catch((error) => console.error('Failed to load AISA API analysis data', error));
  }, []);

  const optimizedByUrl = useMemo(() => {
    const entries = optimized?.items ?? [];
    return new Map(entries.filter((item) => item.clawhubUrl).map((item) => [item.clawhubUrl as string, item]));
  }, [optimized]);

  const relatedByEndpoint = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const group of analysis?.implementationGroups ?? []) {
      map.set(
        group.endpoint,
        group.skills.map((skill) => skill.skillName),
      );
    }
    return map;
  }, [analysis]);

  const filteredInterfaces = useMemo(() => {
    if (!analysis) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return analysis.interfaces.filter((item) => {
      if (sourceFilter !== 'all') {
        if (sourceFilter === 'clawhub' && item.skillsBySource.clawhub === 0) return false;
        if (sourceFilter === 'github' && item.skillsBySource.github === 0) return false;
      }
      if (implementationFilter === 'implemented' && item.coverageStatus !== 'implemented') return false;
      if (implementationFilter === 'not_found' && item.coverageStatus !== 'no_skill_implementation') return false;
      if (implementationFilter === 'documented_only' && item.documentedOnlySkillCount === 0) return false;
      if (!normalizedQuery) return true;
      const haystack = `${item.name} ${item.endpoint} ${item.inputSummary} ${item.outputSummary} ${item.skills
        .map((skill) => `${skill.skillName} ${skill.owner}`)
        .join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [analysis, implementationFilter, query, sourceFilter]);

  const filteredSkills = useMemo(() => {
    if (!analysis) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return analysis.skills.filter((skill) => {
      if (sourceFilter !== 'all' && skill.sourceType !== sourceFilter) return false;
      if (implementationFilter !== 'all' && skill.implementationStatus !== implementationFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = `${skill.name} ${skill.description} ${skill.owner} ${skill.sourceType} ${skill.endpoints
        .map((endpoint) => `${endpoint.name} ${endpoint.endpoint}`)
        .join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [analysis, implementationFilter, query, sourceFilter]);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (analysis?.implementationGroups ?? [])
      .filter((group) => {
        const sourceFilteredSkills =
          sourceFilter === 'all'
            ? group.skills
            : group.skills.filter((skill) => skill.sourceType === sourceFilter);
        if (sourceFilteredSkills.length < 2) return false;
        if (!normalizedQuery) return true;
        const haystack = `${group.name} ${group.endpoint} ${sourceFilteredSkills
          .map((skill) => `${skill.skillName} ${skill.owner}`)
          .join(' ')}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => b.skills.length - a.skills.length || a.name.localeCompare(b.name));
  }, [analysis, query, sourceFilter]);

  const filteredCatalog = useMemo(() => {
    if (!catalog) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return catalog.items.filter((item) => {
      if (catalogTypeFilter !== 'all' && item.type !== catalogTypeFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = `${item.name} ${item.description} ${item.owner} ${item.tags.join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [catalog, catalogTypeFilter, query]);

  const counts = {
    interfaces: filteredInterfaces.length,
    skills: filteredSkills.length,
    catalog: filteredCatalog.length,
  };

  if (!catalog || !optimized || !analysis) {
    return <main className="shell loading">Loading AISA skill intelligence...</main>;
  }

  return (
    <main className="shell">
      <section className="hero hero-wide">
        <div className="hero-copy">
          <span className="eyebrow">AISA intelligence dashboard</span>
          <h1>AISA Skill & API Atlas</h1>
          <p>
            扫描 `public/downloads` 下的 ClawHub 与 GitHub 技能包，提取 AISA API 使用情况，并对照
            <a href={analysis.comparisonBase.docUrl} target="_blank" rel="noreferrer">
              官方 `createchatcompletion`
            </a>
            文档展示接口覆盖与技能实现分组。
          </p>
          <div className="hero-meta">
            <span>Updated {format(new Date(analysis.generatedAt), 'yyyy-MM-dd HH:mm')}</span>
            <span>{analysis.summary.totalInterfaces} interfaces</span>
            <span>{analysis.summary.totalSkills} skills</span>
            <span>{analysis.summary.githubSkills} GitHub archives</span>
          </div>
        </div>
        <div className="hero-panel hero-panel-grid">
          <StatCard icon={<TableProperties size={20} />} label="接口总数" value={analysis.summary.totalInterfaces} tone="sand" />
          <StatCard icon={<FileCode2 size={20} />} label="已实现接口" value={analysis.summary.implementedInterfaces} tone="mint" />
          <StatCard icon={<Github size={20} />} label="GitHub 技能" value={analysis.summary.githubSkills} tone="sky" />
          <StatCard icon={<AlertTriangle size={20} />} label="无接口实现技能" value={analysis.summary.skillsWithoutEndpoints} tone="ember" />
        </div>
      </section>

      <ViewTabs view={view} setView={setView} counts={counts} />

      <section className="controls controls-wide">
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索接口、技能名、owner、描述..." />
        </label>
        <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)}>
          <option value="all">全部来源</option>
          <option value="clawhub">ClawHub</option>
          <option value="github">GitHub</option>
        </select>
        {view === 'catalog' ? (
          <select value={catalogTypeFilter} onChange={(event) => setCatalogTypeFilter(event.target.value as CatalogTypeFilter)}>
            <option value="all">全部目录类型</option>
            <option value="skill">Skills</option>
            <option value="plugin">Plugins</option>
          </select>
        ) : (
          <select value={implementationFilter} onChange={(event) => setImplementationFilter(event.target.value as ImplementationFilter)}>
            <option value="all">全部实现状态</option>
            <option value="implemented">已实现</option>
            <option value="documented_only">仅文档声明</option>
            <option value="not_found">未发现实现</option>
          </select>
        )}
      </section>

      <section className="notes">
        <div className="note">{analysis.comparisonBase.note}</div>
        <div className="note">接口表按 API 聚合；技能表已合并 GitHub 技能归档。</div>
        <div className="note">“无技能实现”表示在当前下载包中未找到对应代码实现，或仅发现文档声明。</div>
      </section>

      {view === 'interfaces' ? <InterfaceTable items={filteredInterfaces} /> : null}
      {view === 'skills' ? <SkillTable items={filteredSkills} relatedByEndpoint={relatedByEndpoint} /> : null}
      {view === 'skills' ? <GroupTable items={filteredGroups.slice(0, 24)} /> : null}
      {view === 'catalog' ? (
        <section className="table-shell">
          <div className="section-title">
            <h2>ClawHub 目录</h2>
            <p>保留原始目录视图，方便回看抓取结果与优化包下载入口。</p>
          </div>
          <div className="catalog-grid">
            {filteredCatalog.map((item) => (
              <ItemCard key={item.id} item={item} optimizedPackage={optimizedByUrl.get(item.clawhubUrl)} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
