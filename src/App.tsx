import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Boxes,
  Check,
  Download,
  ExternalLink,
  FileCode2,
  Layers,
  Link2,
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
type InterfaceImplementationFilter = 'all' | 'implemented' | 'inferred_implementation' | 'documented_only';
type SkillImplementationFilter = 'all' | 'implemented' | 'documented_only' | 'not_found';
type CatalogTypeFilter = 'all' | 'skill' | 'plugin';

function makeCardId(kind: 'interface' | 'skill', value: string) {
  return `${kind}-card-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function jumpToCard(view: ViewMode, cardId: string, setView: (view: ViewMode) => void) {
  setView(view);
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${cardId}`);

  let attempts = 0;
  const tryScroll = () => {
    const element = document.getElementById(cardId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    attempts += 1;
    if (attempts < 12) {
      window.requestAnimationFrame(tryScroll);
    }
  };

  window.requestAnimationFrame(tryScroll);
}

function viewForCardId(cardId: string): ViewMode | null {
  if (cardId.startsWith('interface-card-')) return 'interfaces';
  if (cardId.startsWith('skill-card-')) return 'skills';
  return null;
}

function copyCardLink(cardId: string) {
  const url = new URL(window.location.href);
  url.hash = cardId;
  return navigator.clipboard.writeText(url.toString());
}

function splitSummary(summary: string) {
  return summary
    .split(/[、,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function SkillRefCard({
  skill,
  onJumpToSkill,
}: {
  skill: AisaAnalysisInterface['skills'][number] | AisaAnalysisGroup['skills'][number];
  onJumpToSkill: (skillId: string) => void;
}) {
  const externalLabel = 'sourceLabel' in skill && skill.sourceType === 'clawhub' ? 'ClawHub' : '来源';

  return (
    <div className="skill-ref-card">
      <button type="button" className="skill-ref jump-card" onClick={() => onJumpToSkill(skill.skillId)}>
        <span>{skill.skillName}</span>
        <small>
          @{skill.owner} · {'sourceLabel' in skill ? skill.sourceLabel : skill.sourceType === 'github' ? 'GitHub' : 'ClawHub'}
          {'status' in skill ? ` · ${skill.status}` : ''}
        </small>
      </button>
      <a className="skill-ref-link" href={skill.sourceUrl} target="_blank" rel="noreferrer">
        {externalLabel} <ExternalLink size={14} />
      </a>
    </div>
  );
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

function InterfaceTable({
  items,
  onJumpToSkill,
  copiedCardId,
  onCopyCard,
}: {
  items: AisaAnalysisInterface[];
  onJumpToSkill: (skillId: string) => void;
  copiedCardId: string | null;
  onCopyCard: (cardId: string) => void;
}) {
  const coverageLabel = (item: AisaAnalysisInterface) => {
    if (item.coverageStatus === 'implemented') return `${item.skillCount} skills`;
    if (item.coverageStatus === 'inferred_implementation') return '推断有实现';
    return '仅文档声明';
  };

  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>接口列表</h2>
        <p>以接口为主，展示 API、方法、入参出参摘要、技能实现和来源。</p>
      </div>
      <div className="table-list">
        {items.map((item) => (
          <article key={item.endpoint} id={makeCardId('interface', item.endpoint)} className="table-card">
            <div className="table-card-top">
              <div>
                {item.officialDocUrl ? (
                  <>
                    <a className="card-title-link" href={item.officialDocUrl} target="_blank" rel="noreferrer">
                      <h3>{item.name}</h3>
                      <ExternalLink size={16} />
                    </a>
                    <a className="card-subtitle-link" href={item.officialDocUrl} target="_blank" rel="noreferrer">
                      <code>{item.endpoint}</code>
                    </a>
                  </>
                ) : (
                  <>
                    <h3>{item.name}</h3>
                    <code>{item.endpoint}</code>
                  </>
                )}
              </div>
              <div className="table-card-badges">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onCopyCard(makeCardId('interface', item.endpoint))}
                  aria-label="Copy interface link"
                  title="复制接口卡片链接"
                >
                  {copiedCardId === makeCardId('interface', item.endpoint) ? <Check size={15} /> : <Link2 size={15} />}
                </button>
                <span className="pill pill-plugin">{item.method}</span>
                <span
                  className={clsx(
                    'pill',
                    item.coverageStatus === 'implemented'
                      ? 'pill-aisa'
                      : item.coverageStatus === 'inferred_implementation'
                        ? 'pill-plugin'
                        : 'pill-alert',
                  )}
                >
                  {coverageLabel(item)}
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
                  <span>推断实现 {item.inferredSkillCount}</span>
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
                  <SkillRefCard key={`${item.endpoint}-${skill.skillId}`} skill={skill} onJumpToSkill={onJumpToSkill} />
                ))
              ) : (
                <div className="empty-state small">当前下载包里没有识别到这个接口的同路径代码实现。</div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GroupTable({
  items,
  onJumpToSkill,
  onJumpToInterface,
}: {
  items: AisaAnalysisGroup[];
  onJumpToSkill: (skillId: string) => void;
  onJumpToInterface: (endpoint: string) => void;
}) {
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
                <button type="button" className="group-heading-link" onClick={() => onJumpToInterface(group.endpoint)}>
                  <h3>{group.name}</h3>
                  <code>{group.endpoint}</code>
                </button>
              </div>
              <span className="pill pill-aisa">{group.skills.length} skills</span>
            </div>
            <div className="skill-ref-list skill-ref-list-dense">
              {group.skills.map((skill) => (
                <SkillRefCard key={`${group.endpoint}-${skill.skillId}`} skill={skill} onJumpToSkill={onJumpToSkill} />
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
  onJumpToInterface,
  copiedCardId,
  onCopyCard,
}: {
  items: AisaAnalysisSkill[];
  relatedByEndpoint: Map<string, string[]>;
  onJumpToInterface: (endpoint: string) => void;
  copiedCardId: string | null;
  onCopyCard: (cardId: string) => void;
}) {
  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>技能列表</h2>
        <p>以技能为主，汇总来源、使用接口，以及同接口下的其它技能实现分组。</p>
      </div>
      <div className="table-list">
        {items.map((skill) => (
          <article key={skill.id} id={makeCardId('skill', skill.id)} className="table-card">
            <div className="table-card-top">
              <div>
                <h3>{skill.name}</h3>
                <div className="subtle-line">
                  @{skill.owner} · {skill.sourceLabel} · {skill.archiveType}
                </div>
              </div>
              <div className="table-card-badges">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onCopyCard(makeCardId('skill', skill.id))}
                  aria-label="Copy skill link"
                  title="复制技能卡片链接"
                >
                  {copiedCardId === makeCardId('skill', skill.id) ? <Check size={15} /> : <Link2 size={15} />}
                </button>
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
                      <button
                        key={`${skill.id}-${endpoint.endpoint}`}
                        type="button"
                        className="chip chip-button"
                        onClick={() => onJumpToInterface(endpoint.endpoint)}
                      >
                        {endpoint.name}
                      </button>
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
                        <button
                          key={`${skill.id}-${endpoint.endpoint}-group`}
                          type="button"
                          className="chip chip-muted chip-button"
                          onClick={() => onJumpToInterface(endpoint.endpoint)}
                        >
                          {endpoint.name} · {(relatedByEndpoint.get(endpoint.endpoint) ?? []).length} skills
                        </button>
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
  const [interfaceImplementationFilter, setInterfaceImplementationFilter] = useState<InterfaceImplementationFilter>('all');
  const [skillImplementationFilter, setSkillImplementationFilter] = useState<SkillImplementationFilter>('all');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<CatalogTypeFilter>('all');
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialView = params.get('view') as ViewMode | null;
    const initialQuery = params.get('q');
    const initialSource = params.get('source') as SourceFilter | null;
    const initialImplementation = params.get('impl');
    const initialCatalogType = params.get('catalogType') as CatalogTypeFilter | null;
    if (initialView && ['interfaces', 'skills', 'catalog'].includes(initialView)) setView(initialView);
    if (initialQuery) setQuery(initialQuery);
    if (initialSource && ['all', 'clawhub', 'github'].includes(initialSource)) setSourceFilter(initialSource);
    if (
      initialImplementation &&
      ['all', 'implemented', 'inferred_implementation', 'documented_only'].includes(initialImplementation) &&
      (!initialView || initialView === 'interfaces')
    ) {
      setInterfaceImplementationFilter(initialImplementation as InterfaceImplementationFilter);
    }
    if (initialImplementation && ['all', 'implemented', 'documented_only', 'not_found'].includes(initialImplementation) && initialView === 'skills') {
      setSkillImplementationFilter(initialImplementation as SkillImplementationFilter);
    }
    if (initialCatalogType && ['all', 'skill', 'plugin'].includes(initialCatalogType)) setCatalogTypeFilter(initialCatalogType);

    fetch(`${import.meta.env.BASE_URL}data/catalog.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`catalog.json ${response.status}`);
        return response.json();
      })
      .then((json: CatalogData) => setCatalog(json))
      .catch((error) => console.error('Failed to load catalog data', error));

    fetch(`${import.meta.env.BASE_URL}data/optimized-packages.json`)
      .then((response) => {
        if (!response.ok) {
          setOptimized({ generatedAt: new Date().toISOString(), items: [] });
          throw new Error(`optimized-packages.json ${response.status}`);
        }
        return response.json();
      })
      .then((json: OptimizedPackageIndex) => setOptimized(json))
      .catch((error) => console.error('Failed to load optimized package index', error));

    fetch(`${import.meta.env.BASE_URL}data/aisa-api-analysis.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`aisa-api-analysis.json ${response.status}`);
        return response.json();
      })
      .then((json: AisaApiAnalysisData) => setAnalysis(json))
      .catch((error) => console.error('Failed to load AISA API analysis data', error));
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const targetView = viewForCardId(hash);
    if (!targetView) return;
    jumpToCard(targetView, hash, setView);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', view);
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    if (sourceFilter !== 'all') params.set('source', sourceFilter);
    else params.delete('source');
    if (view === 'catalog') {
      if (catalogTypeFilter !== 'all') params.set('catalogType', catalogTypeFilter);
      else params.delete('catalogType');
      params.delete('impl');
    } else {
      const activeImplementationFilter = view === 'interfaces' ? interfaceImplementationFilter : skillImplementationFilter;
      if (activeImplementationFilter !== 'all') params.set('impl', activeImplementationFilter);
      else params.delete('impl');
      params.delete('catalogType');
    }
    const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    history.replaceState(null, '', next);
  }, [catalogTypeFilter, interfaceImplementationFilter, query, skillImplementationFilter, sourceFilter, view]);

  useEffect(() => {
    if (!copiedCardId) return;
    const timeout = window.setTimeout(() => setCopiedCardId(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [copiedCardId]);

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
      if (interfaceImplementationFilter !== 'all' && item.coverageStatus !== interfaceImplementationFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = `${item.name} ${item.endpoint} ${item.inputSummary} ${item.outputSummary} ${item.skills
        .map((skill) => `${skill.skillName} ${skill.owner}`)
        .join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [analysis, interfaceImplementationFilter, query, sourceFilter]);

  const filteredSkills = useMemo(() => {
    if (!analysis) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return analysis.skills.filter((skill) => {
      if (sourceFilter !== 'all' && skill.sourceType !== sourceFilter) return false;
      if (skillImplementationFilter !== 'all' && skill.implementationStatus !== skillImplementationFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = `${skill.name} ${skill.description} ${skill.owner} ${skill.sourceType} ${skill.endpoints
        .map((endpoint) => `${endpoint.name} ${endpoint.endpoint}`)
        .join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [analysis, query, skillImplementationFilter, sourceFilter]);

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

  const jumpToSkillCard = (skillId: string) => {
    setQuery('');
    setSourceFilter('all');
    setInterfaceImplementationFilter('all');
    setSkillImplementationFilter('all');
    jumpToCard('skills', makeCardId('skill', skillId), setView);
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
          <div className="hero-link-row">
            <a className="hero-link-button hero-link-button-primary" href={`${import.meta.env.BASE_URL}clawhub-growth.html`}>
              打开 ClawHub 商业分析页
            </a>
            <a className="hero-link-button" href={`${import.meta.env.BASE_URL}data/clawhub-growth-report.json`} target="_blank" rel="noreferrer">
              查看分析数据
            </a>
          </div>
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
          <StatCard icon={<Layers size={20} />} label="推断实现接口" value={analysis.summary.inferredImplementedInterfaces} tone="sky" />
          <StatCard icon={<AlertTriangle size={20} />} label="仅文档声明接口" value={analysis.summary.documentedOnlyInterfaces} tone="ember" />
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
          <>
            {view === 'interfaces' ? (
              <select
                value={interfaceImplementationFilter}
                onChange={(event) => setInterfaceImplementationFilter(event.target.value as InterfaceImplementationFilter)}
              >
                <option value="all">全部接口状态</option>
                <option value="implemented">已实现</option>
                <option value="inferred_implementation">推断实现</option>
                <option value="documented_only">仅文档声明</option>
              </select>
            ) : (
              <select
                value={skillImplementationFilter}
                onChange={(event) => setSkillImplementationFilter(event.target.value as SkillImplementationFilter)}
              >
                <option value="all">全部技能状态</option>
                <option value="implemented">已实现</option>
                <option value="documented_only">仅文档声明</option>
                <option value="not_found">未发现接口</option>
              </select>
            )}
          </>
        )}
      </section>

      <section className="notes">
        <div className="note">{analysis.comparisonBase.note}</div>
        <div className="note">接口表按 API 聚合；技能表已合并 GitHub 技能归档。</div>
        <div className="note">
          当前接口统计为 {analysis.summary.implementedInterfaces} 已实现 + {analysis.summary.inferredImplementedInterfaces} 推断实现 +{' '}
          {analysis.summary.documentedOnlyInterfaces} 仅文档声明 = {analysis.summary.totalInterfaces} 总接口。
        </div>
        <div className="note">
          “推断实现”表示当前没有抓到这条接口的完全同路径代码，但已经抓到它的子路径、父路径或同族通用路径实现，因此页面把它标记为大概率已被代码覆盖。
        </div>
        <div className="note">“仅文档声明”表示当前只在 SKILL/README 中识别到接口；“推断实现”表示代码里命中了它的子路径、动态路径或通用路径。</div>
      </section>

      {view === 'interfaces' ? (
        <InterfaceTable
          items={filteredInterfaces}
          onJumpToSkill={jumpToSkillCard}
          copiedCardId={copiedCardId}
          onCopyCard={(cardId) => {
            copyCardLink(cardId).then(() => setCopiedCardId(cardId)).catch((error) => console.error('Failed to copy interface link', error));
          }}
        />
      ) : null}
      {view === 'skills' ? (
        <SkillTable
          items={filteredSkills}
          relatedByEndpoint={relatedByEndpoint}
          onJumpToInterface={(endpoint) => jumpToCard('interfaces', makeCardId('interface', endpoint), setView)}
          copiedCardId={copiedCardId}
          onCopyCard={(cardId) => {
            copyCardLink(cardId).then(() => setCopiedCardId(cardId)).catch((error) => console.error('Failed to copy skill link', error));
          }}
        />
      ) : null}
      {view === 'skills' ? (
        <GroupTable
          items={filteredGroups.slice(0, 24)}
          onJumpToSkill={jumpToSkillCard}
          onJumpToInterface={(endpoint) => jumpToCard('interfaces', makeCardId('interface', endpoint), setView)}
        />
      ) : null}
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
