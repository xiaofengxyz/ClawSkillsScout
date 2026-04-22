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
import {
  LanguageToggle,
  loadJsonCached,
  peekJsonCache,
  useAppLanguage,
  useDocumentTitle,
  warmJsonCache,
} from './site';

type ViewMode = 'interfaces' | 'skills' | 'catalog';
type SourceFilter = 'all' | 'clawhub' | 'github';
type InterfaceImplementationFilter = 'all' | 'implemented' | 'inferred_implementation' | 'documented_only';
type SkillImplementationFilter = 'all' | 'implemented' | 'documented_only' | 'not_found';
type CatalogTypeFilter = 'all' | 'skill' | 'plugin';

const copyByLanguage = {
  zh: {
    pageTitle: 'AISA Skill & API Atlas',
    loading: '正在加载 AISA 技能情报...',
    heroEyebrow: 'AISA 情报面板',
    heroTitle: 'AISA Skill & API Atlas',
    heroDescriptionPrefix: '扫描 `public/downloads` 下的 ClawHub 与 GitHub 技能包，提取 AISA API 使用情况，并对照',
    heroDescriptionSuffix: '文档展示接口覆盖与技能实现分组。',
    openMarketPage: '打开跨生态情报页',
    openGrowthPage: '打开 ClawHub 商业分析页',
    openDownloadsPage: '打开下载榜爆款分析页',
    open10kPage: '打开 10K+ 系统报告页',
    viewGrowthData: '查看分析数据',
    viewDownloadsJson: '查看下载榜 JSON',
    view10kJson: '查看 10K+ 系统 JSON',
    updatedAt: '更新于',
    interfaces: '接口列表',
    skills: '技能列表',
    catalog: 'ClawHub 目录',
    searchPlaceholder: '搜索接口、技能名、owner、描述...',
    allSources: '全部来源',
    allCatalogTypes: '全部目录类型',
    allInterfaceStates: '全部接口状态',
    allSkillStates: '全部技能状态',
    implemented: '已实现',
    inferred: '推断实现',
    documentedOnly: '仅文档声明',
    notFound: '未发现接口',
    note1: '接口表按 API 聚合；技能表已合并 GitHub 技能归档。',
    note2Prefix: '当前接口统计为',
    note2Middle: '已实现 +',
    note2Middle2: '推断实现 +',
    note2Middle3: '仅文档声明 =',
    note2Suffix: '总接口。',
    note3: '“推断实现”表示当前没有抓到完全同路径代码，但已抓到子路径、父路径或同族通用路径实现。',
    note4: '“仅文档声明”表示当前只在 SKILL/README 中识别到接口；“推断实现”表示代码里命中了子路径、动态路径或通用路径。',
    totalInterfaces: '接口总数',
    implementedInterfaces: '已实现接口',
    inferredInterfaces: '推断实现接口',
    documentedInterfaces: '仅文档声明接口',
    interfacesMeta: '个接口',
    skillsMeta: '个技能',
    githubArchivesMeta: '个 GitHub 归档',
    officialDocLinkLabel: '官方 `createchatcompletion`',
    sourceFallback: '来源',
    suspiciousDefault: '可疑',
    noDescription: '未找到描述。',
    unknownVersion: '未知版本',
    notAvailable: '暂无',
    optimizedRelease: '优化版本',
    automatedChecks: '自动校验',
    viewClawhub: '查看 ClawHub',
    originalZip: '原始压缩包',
    optimizedPassed: '已通过',
    interfaceSectionTitle: '接口列表',
    interfaceSectionDescription: '以接口为主，展示 API、方法、入参出参摘要、技能实现和来源。',
    coverageImplemented: '个技能',
    coverageInferred: '推断有实现',
    coverageDocumented: '仅文档声明',
    interfacePath: '接口路径',
    method: '方法',
    implementationCoverage: '实现覆盖',
    compareOfficial: '对比官方文档',
    officialReference: '官方参考',
    openDoc: '打开文档',
    noDocPage: '当前未绑定具体文档页',
    typicalInput: '典型入参',
    typicalOutput: '典型出参',
    noSamePathImpl: '当前下载包里没有识别到这个接口的同路径代码实现。',
    groupSectionTitle: '同接口技能分组',
    groupSectionDescription: '把实现了同一个接口的技能直接编成组，方便快速看重复实现、不同来源和可替代项。',
    skillSectionTitle: '技能列表',
    skillSectionDescription: '以技能为主，汇总来源、使用接口，以及同接口下的其它技能实现分组。',
    noInterfaceImpl: '未发现接口实现',
    useInterfaces: '使用接口',
    relatedGroups: '同接口分组',
    noEndpointFound: '未从代码或 SKILL 文档中提取到 AISA endpoint。',
    noGroupAvailable: '无可分组接口。',
    viewSource: '查看来源',
    downloadArchive: '下载归档',
    catalogSectionTitle: 'ClawHub 目录',
    catalogSectionDescription: '保留原始目录视图，方便回看抓取结果与优化包下载入口。',
    copyInterfaceLink: '复制接口卡片链接',
    copySkillLink: '复制技能卡片链接',
    implementedCount: '已实现',
    inferredCount: '推断实现',
    documentedCount: '仅文档',
    implementationCoverageSources: '来源分布',
  },
  en: {
    pageTitle: 'AISA Skill & API Atlas',
    loading: 'Loading AISA skill intelligence...',
    heroEyebrow: 'AISA Intelligence Dashboard',
    heroTitle: 'AISA Skill & API Atlas',
    heroDescriptionPrefix: 'Scan ClawHub and GitHub skill archives under `public/downloads`, extract AISA API usage, and compare them against the official',
    heroDescriptionSuffix: 'docs to show interface coverage and grouped skill implementations.',
    openMarketPage: 'Open market intelligence',
    openGrowthPage: 'Open ClawHub growth report',
    openDownloadsPage: 'Open downloads insights',
    open10kPage: 'Open 10K+ systems report',
    viewGrowthData: 'View growth data',
    viewDownloadsJson: 'View downloads JSON',
    view10kJson: 'View 10K+ JSON',
    updatedAt: 'Updated',
    interfaces: 'Interfaces',
    skills: 'Skills',
    catalog: 'Catalog',
    searchPlaceholder: 'Search interfaces, skills, owners, descriptions...',
    allSources: 'All sources',
    allCatalogTypes: 'All catalog types',
    allInterfaceStates: 'All interface states',
    allSkillStates: 'All skill states',
    implemented: 'Implemented',
    inferred: 'Inferred',
    documentedOnly: 'Documented only',
    notFound: 'Not found',
    note1: 'Interface view is API-centric; skill view merges GitHub archives into the same table.',
    note2Prefix: 'Current interface totals:',
    note2Middle: 'implemented +',
    note2Middle2: 'inferred +',
    note2Middle3: 'documented-only =',
    note2Suffix: 'total interfaces.',
    note3: '"Inferred" means we did not find the exact path, but we did detect a related child path, parent path, or family-level implementation.',
    note4: '"Documented only" means the endpoint appeared in SKILL/README text; "inferred" means code matched a related dynamic or shared path.',
    totalInterfaces: 'Total interfaces',
    implementedInterfaces: 'Implemented interfaces',
    inferredInterfaces: 'Inferred interfaces',
    documentedInterfaces: 'Documented-only interfaces',
    interfacesMeta: 'interfaces',
    skillsMeta: 'skills',
    githubArchivesMeta: 'GitHub archives',
    officialDocLinkLabel: 'official `createchatcompletion`',
    sourceFallback: 'Source',
    suspiciousDefault: 'Suspicious',
    noDescription: 'No description found.',
    unknownVersion: 'unknown',
    notAvailable: 'n/a',
    optimizedRelease: 'Optimized release',
    automatedChecks: 'Automated checks',
    viewClawhub: 'View ClawHub',
    originalZip: 'Original zip',
    optimizedPassed: 'passed',
    interfaceSectionTitle: 'Interface list',
    interfaceSectionDescription: 'API-first view of endpoints, methods, parameter summaries, skill implementations, and sources.',
    coverageImplemented: 'skills',
    coverageInferred: 'Likely implemented',
    coverageDocumented: 'Documented only',
    interfacePath: 'Interface path',
    method: 'Method',
    implementationCoverage: 'Coverage',
    compareOfficial: 'Compared with official docs',
    officialReference: 'Official reference',
    openDoc: 'Open docs',
    noDocPage: 'No specific doc page is linked yet.',
    typicalInput: 'Typical input',
    typicalOutput: 'Typical output',
    noSamePathImpl: 'No same-path code implementation was detected in the downloaded archives.',
    groupSectionTitle: 'Shared-interface groups',
    groupSectionDescription: 'Group skills that implement the same interface so repeated implementations and substitutes are easy to compare.',
    skillSectionTitle: 'Skill list',
    skillSectionDescription: 'Skill-first view of sources, interfaces used, and related implementation groups.',
    noInterfaceImpl: 'No interface implementation found',
    useInterfaces: 'Interfaces used',
    relatedGroups: 'Related groups',
    noEndpointFound: 'No AISA endpoints were extracted from code or SKILL docs.',
    noGroupAvailable: 'No related groups.',
    viewSource: 'View source',
    downloadArchive: 'Download archive',
    catalogSectionTitle: 'ClawHub catalog',
    catalogSectionDescription: 'Keep the raw catalog view for reviewing scraped items and optimized bundle entry points.',
    copyInterfaceLink: 'Copy interface card link',
    copySkillLink: 'Copy skill card link',
    implementedCount: 'Implemented',
    inferredCount: 'Inferred',
    documentedCount: 'Documented',
    implementationCoverageSources: 'Source mix',
  },
} as const;

type MainCopy = (typeof copyByLanguage)[keyof typeof copyByLanguage];

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
  copy,
}: {
  skill: AisaAnalysisInterface['skills'][number] | AisaAnalysisGroup['skills'][number];
  onJumpToSkill: (skillId: string) => void;
  copy: MainCopy;
}) {
  const externalLabel = 'sourceLabel' in skill && skill.sourceType === 'clawhub' ? 'ClawHub' : copy.sourceFallback;

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

function ItemCard({ item, optimizedPackage, copy }: { item: CatalogItem; optimizedPackage?: OptimizedPackage; copy: MainCopy }) {
  const staticChecksPassed = optimizedPackage?.verificationStatus === 'static_checks_passed';

  return (
    <article className="item-card">
      <div className="item-topline">
        <span className={clsx('pill', item.type === 'plugin' ? 'pill-plugin' : 'pill-skill')}>{item.type}</span>
        {item.usesAisaApi ? <span className="pill pill-aisa">AISA API</span> : null}
        {item.suspicious ? <span className="pill pill-alert">{item.suspiciousLabel ?? copy.suspiciousDefault}</span> : null}
      </div>
      <h3>{item.name}</h3>
      <p>{item.description || copy.noDescription}</p>
      <div className="item-meta">
        <span>@{item.owner}</span>
        <span>v{item.version || copy.unknownVersion}</span>
        <span>
          <Download size={14} />
          {item.downloads ?? copy.notAvailable}
        </span>
      </div>
      {item.suspiciousReason ? <div className="item-warning">{item.suspiciousReason}</div> : null}
      {optimizedPackage ? (
        <div className="item-release">
          <div className="item-release-title">{copy.optimizedRelease}</div>
          <div className="item-release-copy">
            {copy.automatedChecks}: {staticChecksPassed ? copy.optimizedPassed : optimizedPackage.verificationStatus}
          </div>
        </div>
      ) : null}
      <div className="item-actions">
        <a className="item-action item-action-secondary" href={item.clawhubUrl} target="_blank" rel="noreferrer">
          {copy.viewClawhub}
        </a>
        {item.downloadUrl ? (
          <a className="item-action item-action-primary" href={item.downloadUrl} target="_blank" rel="noreferrer">
            {copy.originalZip}
          </a>
        ) : null}
      </div>
    </article>
  );
}

function ViewTabs({
  view,
  setView,
  counts,
  labels,
}: {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  counts: Record<ViewMode, number>;
  labels: Record<ViewMode, string>;
}) {
  return (
    <section className="tabs">
      {(['interfaces', 'skills', 'catalog'] as ViewMode[]).map((value) => (
        <button
          key={value}
          type="button"
          className={clsx('tab-button', view === value && 'tab-button-active')}
          onClick={() => setView(value as ViewMode)}
        >
          <span>{labels[value]}</span>
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
  copy,
}: {
  items: AisaAnalysisInterface[];
  onJumpToSkill: (skillId: string) => void;
  copiedCardId: string | null;
  onCopyCard: (cardId: string) => void;
  copy: MainCopy;
}) {
  const coverageLabel = (item: AisaAnalysisInterface) => {
    if (item.coverageStatus === 'implemented') return `${item.skillCount} ${copy.coverageImplemented}`;
    if (item.coverageStatus === 'inferred_implementation') return copy.coverageInferred;
    return copy.coverageDocumented;
  };

  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>{copy.interfaceSectionTitle}</h2>
        <p>{copy.interfaceSectionDescription}</p>
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
                  title={copy.copyInterfaceLink}
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
                <div className="matrix-label">{copy.interfacePath}</div>
                <div className="field-stack">
                  <code>{item.endpoint}</code>
                  <span className="muted">
                    {copy.method}: {item.method}
                  </span>
                </div>
              </div>
              <div>
                <div className="matrix-label">{copy.implementationCoverage}</div>
                <div className="field-stack">
                  <span>
                    {copy.implementedCount} {item.implementedSkillCount}
                  </span>
                  <span>
                    {copy.inferredCount} {item.inferredSkillCount}
                  </span>
                  <span>
                    {copy.documentedCount} {item.documentedOnlySkillCount}
                  </span>
                  <span>ClawHub {item.skillsBySource.clawhub} / GitHub {item.skillsBySource.github}</span>
                </div>
              </div>
              <div>
                <div className="matrix-label">{copy.compareOfficial}</div>
                <div>{item.comparisonToCreateChatCompletion}</div>
              </div>
              <div>
                <div className="matrix-label">{copy.officialReference}</div>
                <div>
                  {item.officialDocUrl ? (
                    <a className="inline-link" href={item.officialDocUrl} target="_blank" rel="noreferrer">
                      {copy.openDoc} <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="muted">{copy.noDocPage}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="matrix matrix-dual">
              <div>
                <div className="matrix-label">{copy.typicalInput}</div>
                <div className="chip-wrap">
                  {splitSummary(item.inputSummary).map((part) => (
                    <span key={`${item.endpoint}-input-${part}`} className="chip">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="matrix-label">{copy.typicalOutput}</div>
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
                  <SkillRefCard key={`${item.endpoint}-${skill.skillId}`} skill={skill} onJumpToSkill={onJumpToSkill} copy={copy} />
                ))
              ) : (
                <div className="empty-state small">{copy.noSamePathImpl}</div>
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
  copy,
}: {
  items: AisaAnalysisGroup[];
  onJumpToSkill: (skillId: string) => void;
  onJumpToInterface: (endpoint: string) => void;
  copy: MainCopy;
}) {
  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>{copy.groupSectionTitle}</h2>
        <p>{copy.groupSectionDescription}</p>
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
                <SkillRefCard key={`${group.endpoint}-${skill.skillId}`} skill={skill} onJumpToSkill={onJumpToSkill} copy={copy} />
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
  copy,
}: {
  items: AisaAnalysisSkill[];
  relatedByEndpoint: Map<string, string[]>;
  onJumpToInterface: (endpoint: string) => void;
  copiedCardId: string | null;
  onCopyCard: (cardId: string) => void;
  copy: MainCopy;
}) {
  return (
    <section className="table-shell">
      <div className="section-title">
        <h2>{copy.skillSectionTitle}</h2>
        <p>{copy.skillSectionDescription}</p>
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
                  title={copy.copySkillLink}
                >
                  {copiedCardId === makeCardId('skill', skill.id) ? <Check size={15} /> : <Link2 size={15} />}
                </button>
                <span className={clsx('pill', skill.sourceType === 'github' ? 'pill-plugin' : 'pill-skill')}>
                  {skill.sourceLabel}
                </span>
                <span className={clsx('pill', skill.endpointCount > 0 ? 'pill-aisa' : 'pill-alert')}>
                  {skill.endpointCount > 0 ? `${skill.endpointCount} ${copy.interfacesMeta}` : copy.noInterfaceImpl}
                </span>
              </div>
            </div>
            <p className="skill-description">{skill.description || copy.noDescription}</p>
            <div className="matrix skill-matrix">
              <div>
                <div className="matrix-label">{copy.useInterfaces}</div>
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
                    <span className="muted">{copy.noEndpointFound}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="matrix-label">{copy.relatedGroups}</div>
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
                    <span className="muted">{copy.noGroupAvailable}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="item-actions">
              <a className="item-action item-action-secondary" href={skill.sourceUrl} target="_blank" rel="noreferrer">
                {copy.viewSource}
              </a>
              <a className="item-action item-action-primary" href={`${import.meta.env.BASE_URL}${skill.downloadPath}`} download>
                {copy.downloadArchive}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const { language, setLanguage } = useAppLanguage();
  const copy = copyByLanguage[language];
  const [catalog, setCatalog] = useState<CatalogData | null>(() => peekJsonCache<CatalogData>('data/catalog.json'));
  const [optimized, setOptimized] = useState<OptimizedPackageIndex | null>(() => peekJsonCache<OptimizedPackageIndex>('data/optimized-packages.json'));
  const [analysis, setAnalysis] = useState<AisaApiAnalysisData | null>(() => peekJsonCache<AisaApiAnalysisData>('data/aisa-api-analysis.json'));
  const [view, setView] = useState<ViewMode>('interfaces');
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [interfaceImplementationFilter, setInterfaceImplementationFilter] = useState<InterfaceImplementationFilter>('all');
  const [skillImplementationFilter, setSkillImplementationFilter] = useState<SkillImplementationFilter>('all');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState<CatalogTypeFilter>('all');
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  useDocumentTitle(copy.pageTitle);

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

    loadJsonCached<CatalogData>('data/catalog.json')
      .then((json) => setCatalog(json))
      .catch((error) => console.error('Failed to load catalog data', error));

    loadJsonCached<AisaApiAnalysisData>('data/aisa-api-analysis.json')
      .then((json) => setAnalysis(json))
      .catch((error) => console.error('Failed to load AISA API analysis data', error));
  }, []);

  useEffect(() => {
    if (!analysis) return;
    warmJsonCache([
      'data/clawhub-growth-report.json',
      'data/clawhub-download-insights.json',
      'data/clawhub-10k-system-report.json',
      'data/market-ecosystem-report.json',
    ]);
  }, [analysis]);

  useEffect(() => {
    if (optimized || view !== 'catalog') return;

    loadJsonCached<OptimizedPackageIndex>('data/optimized-packages.json')
      .then((json) => setOptimized(json))
      .catch((error) => {
        setOptimized({ generatedAt: new Date().toISOString(), items: [] });
        console.error('Failed to load optimized package index', error);
      });
  }, [optimized, view]);

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

  if (!catalog || !analysis || (view === 'catalog' && !optimized)) {
    return <main className="shell loading">{copy.loading}</main>;
  }

  return (
    <main className="shell">
      <section className="page-toolbar">
        <LanguageToggle language={language} onChange={setLanguage} />
      </section>

      <section className="hero hero-wide">
        <div className="hero-copy">
          <span className="eyebrow">{copy.heroEyebrow}</span>
          <h1>{copy.heroTitle}</h1>
          <p>
            {copy.heroDescriptionPrefix}
            <a href={analysis.comparisonBase.docUrl} target="_blank" rel="noreferrer">
              {copy.officialDocLinkLabel}
            </a>
            {copy.heroDescriptionSuffix}
          </p>
          <div className="hero-link-row">
            <a className="hero-link-button hero-link-button-primary" href={`${import.meta.env.BASE_URL}market-intelligence.html`}>
              {copy.openMarketPage}
            </a>
            <a className="hero-link-button hero-link-button-primary" href={`${import.meta.env.BASE_URL}clawhub-growth.html`}>
              {copy.openGrowthPage}
            </a>
            <a className="hero-link-button" href={`${import.meta.env.BASE_URL}clawhub-download-insights.html`}>
              {copy.openDownloadsPage}
            </a>
            <a className="hero-link-button" href={`${import.meta.env.BASE_URL}clawhub-10k-system.html`}>
              {copy.open10kPage}
            </a>
            <a className="hero-link-button" href={`${import.meta.env.BASE_URL}data/clawhub-growth-report.json`} target="_blank" rel="noreferrer">
              {copy.viewGrowthData}
            </a>
            <a className="hero-link-button" href={`${import.meta.env.BASE_URL}data/clawhub-download-insights.json`} target="_blank" rel="noreferrer">
              {copy.viewDownloadsJson}
            </a>
            <a className="hero-link-button" href={`${import.meta.env.BASE_URL}data/clawhub-10k-system-report.json`} target="_blank" rel="noreferrer">
              {copy.view10kJson}
            </a>
          </div>
          <div className="hero-meta">
            <span>
              {copy.updatedAt} {format(new Date(analysis.generatedAt), 'yyyy-MM-dd HH:mm')}
            </span>
            <span>
              {analysis.summary.totalInterfaces} {copy.interfacesMeta}
            </span>
            <span>
              {analysis.summary.totalSkills} {copy.skillsMeta}
            </span>
            <span>
              {analysis.summary.githubSkills} {copy.githubArchivesMeta}
            </span>
          </div>
        </div>
        <div className="hero-panel hero-panel-grid">
          <StatCard icon={<TableProperties size={20} />} label={copy.totalInterfaces} value={analysis.summary.totalInterfaces} tone="sand" />
          <StatCard icon={<FileCode2 size={20} />} label={copy.implementedInterfaces} value={analysis.summary.implementedInterfaces} tone="mint" />
          <StatCard icon={<Layers size={20} />} label={copy.inferredInterfaces} value={analysis.summary.inferredImplementedInterfaces} tone="sky" />
          <StatCard icon={<AlertTriangle size={20} />} label={copy.documentedInterfaces} value={analysis.summary.documentedOnlyInterfaces} tone="ember" />
        </div>
      </section>

      <ViewTabs
        view={view}
        setView={setView}
        counts={counts}
        labels={{ interfaces: copy.interfaces, skills: copy.skills, catalog: copy.catalog }}
      />

      <section className="controls controls-wide">
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} />
        </label>
        <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)}>
          <option value="all">{copy.allSources}</option>
          <option value="clawhub">ClawHub</option>
          <option value="github">GitHub</option>
        </select>
        {view === 'catalog' ? (
          <select value={catalogTypeFilter} onChange={(event) => setCatalogTypeFilter(event.target.value as CatalogTypeFilter)}>
            <option value="all">{copy.allCatalogTypes}</option>
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
                <option value="all">{copy.allInterfaceStates}</option>
                <option value="implemented">{copy.implemented}</option>
                <option value="inferred_implementation">{copy.inferred}</option>
                <option value="documented_only">{copy.documentedOnly}</option>
              </select>
            ) : (
              <select
                value={skillImplementationFilter}
                onChange={(event) => setSkillImplementationFilter(event.target.value as SkillImplementationFilter)}
              >
                <option value="all">{copy.allSkillStates}</option>
                <option value="implemented">{copy.implemented}</option>
                <option value="documented_only">{copy.documentedOnly}</option>
                <option value="not_found">{copy.notFound}</option>
              </select>
            )}
          </>
        )}
      </section>

      <section className="notes">
        <div className="note">{analysis.comparisonBase.note}</div>
        <div className="note">{copy.note1}</div>
        <div className="note">
          {copy.note2Prefix} {analysis.summary.implementedInterfaces} {copy.note2Middle} {analysis.summary.inferredImplementedInterfaces} {copy.note2Middle2}{' '}
          {analysis.summary.documentedOnlyInterfaces} {copy.note2Middle3} {analysis.summary.totalInterfaces} {copy.note2Suffix}
        </div>
        <div className="note">{copy.note3}</div>
        <div className="note">{copy.note4}</div>
      </section>

      {view === 'interfaces' ? (
        <InterfaceTable
          items={filteredInterfaces}
          onJumpToSkill={jumpToSkillCard}
          copiedCardId={copiedCardId}
          copy={copy}
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
          copy={copy}
          onCopyCard={(cardId) => {
            copyCardLink(cardId).then(() => setCopiedCardId(cardId)).catch((error) => console.error('Failed to copy skill link', error));
          }}
        />
      ) : null}
      {view === 'skills' ? (
        <GroupTable
          items={filteredGroups.slice(0, 24)}
          onJumpToSkill={jumpToSkillCard}
          copy={copy}
          onJumpToInterface={(endpoint) => jumpToCard('interfaces', makeCardId('interface', endpoint), setView)}
        />
      ) : null}
      {view === 'catalog' ? (
        <section className="table-shell">
          <div className="section-title">
            <h2>{copy.catalogSectionTitle}</h2>
            <p>{copy.catalogSectionDescription}</p>
          </div>
          <div className="catalog-grid">
            {filteredCatalog.map((item) => (
              <ItemCard key={item.id} item={item} optimizedPackage={optimizedByUrl.get(item.clawhubUrl)} copy={copy} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
