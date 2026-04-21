import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { GrowthAuthor, GrowthReport, GrowthSkill } from './types';
import {
  LanguageToggle,
  formatMetricValue,
  loadJsonCached,
  peekJsonCache,
  translateLevel,
  useAppLanguage,
  useDocumentTitle,
} from '../site';

const copyByLanguage = {
  zh: {
    pageTitle: 'ClawHub 增长报告',
    loading: '正在加载 ClawHub 增长报告...',
    heroEyebrow: 'ClawHub 增长情报',
    heroTitle: '爆款 Skill、爆款作者与 AISA 变现地图',
    heroDescription:
      '这页把当前 ClawHub 目录快照整理成四份可直接阅读的业务分析：爆款技能、爆款作者、skill factory 复制打法，以及 AISA 变现路径。',
    backToAtlas: '返回 AISA Atlas',
    sourcePage: '来源页面',
    sampledSkills: '采样技能',
    sampledAuthors: '采样作者',
    topDownloads: '最高下载量',
    highDownloadSkills: '快照内 5K+ 技能',
    snapshotNotes: '快照说明',
    updatedAt: '更新于',
    doc1Kicker: '文档 1',
    doc1Title: '爆款技能分析',
    doc1Description: '看清类目分布、头部 skill 的共同结构，以及为什么这些能力更容易持续放大下载。',
    doc2Kicker: '文档 2',
    doc2Title: '爆款作者分析',
    doc2Description: '识别哪些作者已经形成持续复用的产能系统，以及他们的作品组合在暗示什么。',
    doc3Kicker: '文档 3',
    doc3Title: 'Skill Factory 复制打法',
    doc3Description: '把小团队如何用共享模板、共享封装和命名规律做出连续上新的打法拆开来看。',
    doc4Kicker: '文档 4',
    doc4Title: 'AISA 变现地图',
    doc4Description: '把哪些外部 API 最值得替换、免费层/付费层如何拆、产品漏斗如何设计讲清楚。',
    productionRules: '生产规则',
    namingRules: '命名规则',
    replaceableApis: '可替换 API',
    funnelDesign: '变现漏斗',
    category: '类别',
    freeTier: '免费层',
    paidTier: '付费层',
    topRebuildOpportunities: '优先重构机会',
    factorySystemDesign: '工厂化系统设计',
    roadmap: '落地路线图',
    author: '作者',
    sampledSkillsHeader: '采样技能数',
    totalDownloads: '总下载量',
    apiReuse: 'API 复用',
    templateUsage: '模板复用',
    strategy: '策略',
    rank: '排名',
    skill: '技能',
    downloads: '下载量',
    input: '输入门槛',
    output: '输出价值',
    monetization: '变现潜力',
  },
  en: {
    pageTitle: 'ClawHub Growth Report',
    loading: 'Loading ClawHub growth report...',
    heroEyebrow: 'ClawHub Growth Intelligence',
    heroTitle: 'Top Skills, Top Authors, and the AISA Monetization Map',
    heroDescription:
      'This page turns the current ClawHub snapshot into four readable strategy documents: breakout skills, breakout authors, a reusable skill-factory playbook, and an AISA monetization path.',
    backToAtlas: 'Back to AISA Atlas',
    sourcePage: 'Source page',
    sampledSkills: 'Sampled skills',
    sampledAuthors: 'Sampled authors',
    topDownloads: 'Top downloads',
    highDownloadSkills: '5K+ skills in snapshot',
    snapshotNotes: 'Snapshot notes',
    updatedAt: 'Updated',
    doc1Kicker: 'Document 1',
    doc1Title: 'Top Skills Analysis',
    doc1Description: 'See the category mix, the repeated traits of top skills, and why those patterns keep compounding downloads.',
    doc2Kicker: 'Document 2',
    doc2Title: 'Top Authors Analysis',
    doc2Description: 'Identify which authors already operate reusable production systems and what their portfolio shape implies.',
    doc3Kicker: 'Document 3',
    doc3Title: 'Skill Factory Playbook',
    doc3Description: 'Break down how a small team can keep shipping by reusing templates, wrappers, and naming systems.',
    doc4Kicker: 'Document 4',
    doc4Title: 'AISA Monetization Map',
    doc4Description: 'Clarify which external APIs are most worth replacing, how free and paid tiers should split, and what funnel to build.',
    productionRules: 'Production rules',
    namingRules: 'Naming rules',
    replaceableApis: 'Replaceable APIs',
    funnelDesign: 'Funnel design',
    category: 'Category',
    freeTier: 'Free tier',
    paidTier: 'Paid tier',
    topRebuildOpportunities: 'Top rebuild opportunities',
    factorySystemDesign: 'Factory system design',
    roadmap: 'Roadmap',
    author: 'Author',
    sampledSkillsHeader: 'Sampled skills',
    totalDownloads: 'Total downloads',
    apiReuse: 'API reuse',
    templateUsage: 'Template usage',
    strategy: 'Strategy',
    rank: 'Rank',
    skill: 'Skill',
    downloads: 'Downloads',
    input: 'Input',
    output: 'Output',
    monetization: 'Monetization',
  },
} as const;

type GrowthCopy = (typeof copyByLanguage)[keyof typeof copyByLanguage];

function toneClass(value: string) {
  const normalized = value.toLowerCase();
  if (normalized === 'high') return 'is-high';
  if (normalized === 'medium') return 'is-medium';
  if (normalized === 'low') return 'is-low';
  return 'is-neutral';
}

function topApis(skills: GrowthSkill[]) {
  const counts = new Map<string, number>();
  for (const skill of skills) {
    for (const api of skill.likelyApis) {
      counts.set(api, (counts.get(api) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6);
}

function StrategyTable({
  authors,
  language,
  copy,
}: {
  authors: GrowthAuthor[];
  language: 'zh' | 'en';
  copy: GrowthCopy;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{copy.author}</th>
            <th>{copy.sampledSkillsHeader}</th>
            <th>{copy.totalDownloads}</th>
            <th>{copy.apiReuse}</th>
            <th>{copy.templateUsage}</th>
            <th>{copy.strategy}</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((author) => (
            <tr key={author.author}>
              <td>
                <a href={author.profileUrl} target="_blank" rel="noreferrer">
                  @{author.author}
                </a>
              </td>
              <td>{author.sampledTotalSkills}</td>
              <td>{formatMetricValue(author.totalDownloadsInSample, language)}</td>
              <td>
                <span className={`status-pill ${toneClass(author.apiReuseLikelihood)}`}>{translateLevel(author.apiReuseLikelihood, language)}</span>
              </td>
              <td>
                <span className={`status-pill ${toneClass(author.templateUsage)}`}>{translateLevel(author.templateUsage, language)}</span>
              </td>
              <td>{author.strategyLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopSkillsTable({
  skills,
  language,
  copy,
}: {
  skills: GrowthSkill[];
  language: 'zh' | 'en';
  copy: GrowthCopy;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{copy.rank}</th>
            <th>{copy.skill}</th>
            <th>{copy.author}</th>
            <th>{copy.downloads}</th>
            <th>{copy.category}</th>
            <th>{copy.input}</th>
            <th>{copy.output}</th>
            <th>{copy.monetization}</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.url}>
              <td>{skill.rank}</td>
              <td>
                <a href={skill.url} target="_blank" rel="noreferrer">
                  {skill.name}
                </a>
                <div className="row-subtext">{skill.likelyApis.join(' · ')}</div>
              </td>
              <td>@{skill.author}</td>
              <td>{formatMetricValue(skill.downloads, language)}</td>
              <td>{skill.category}</td>
              <td>{skill.inputComplexity}</td>
              <td>{skill.outputValue}</td>
              <td>
                <span className={`status-pill ${toneClass(skill.monetizationPotential)}`}>{translateLevel(skill.monetizationPotential, language)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const { language, setLanguage } = useAppLanguage();
  const copy = copyByLanguage[language];
  const [report, setReport] = useState<GrowthReport | null>(() => peekJsonCache<GrowthReport>('data/clawhub-growth-report.json'));

  useDocumentTitle(copy.pageTitle);

  useEffect(() => {
    loadJsonCached<GrowthReport>('data/clawhub-growth-report.json')
      .then((json) => setReport(json))
      .catch((error) => console.error('Failed to load clawhub growth report', error));
  }, []);

  const apis = useMemo(() => (report ? topApis(report.skills) : []), [report]);

  if (!report) {
    return <main className="growth-shell loading">{copy.loading}</main>;
  }

  return (
    <main className="growth-shell">
      <section className="page-toolbar">
        <LanguageToggle language={language} onChange={setLanguage} />
      </section>

      <section className="growth-hero">
        <div>
          <div className="eyebrow">{copy.heroEyebrow}</div>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroDescription}</p>
          <div className="hero-actions">
            <a className="primary-link" href={`${import.meta.env.BASE_URL}`}>
              {copy.backToAtlas}
            </a>
            <a className="secondary-link" href={report.source.skillsListUrl} target="_blank" rel="noreferrer">
              {copy.sourcePage}
            </a>
          </div>
        </div>
        <div className="hero-metrics">
          <article className="metric-card">
            <span>{copy.sampledSkills}</span>
            <strong>{report.summary.sampledSkills}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.sampledAuthors}</span>
            <strong>{report.summary.sampledAuthors}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.topDownloads}</span>
            <strong>{formatMetricValue(report.summary.topSkillDownloads, language)}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.highDownloadSkills}</span>
            <strong>{report.summary.highDownloadSkills}</strong>
          </article>
        </div>
      </section>

      <section className="notice-panel">
        <div className="panel-title">{copy.snapshotNotes}</div>
        <div className="chip-row">
          <span className="chip">
            {copy.updatedAt} {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}
          </span>
          <span className="chip">{report.source.sampleType}</span>
          {apis.map(([api, count]) => (
            <span key={api} className="chip">
              {api}: {count}
            </span>
          ))}
        </div>
        <ul className="bullet-list">
          {report.source.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="doc-grid">
        <article className="doc-card">
          <div className="doc-kicker">{copy.doc1Kicker}</div>
          <h2>{copy.doc1Title}</h2>
          <p className="section-copy">{copy.doc1Description}</p>
          <div className="mini-grid">
            {report.documents.document1.categoryDistribution.map((item) => (
              <div key={item.category} className="mini-stat">
                <strong>{item.count}</strong>
                <span>
                  {item.category} · {item.share}%
                </span>
              </div>
            ))}
          </div>
          <TopSkillsTable skills={report.documents.document1.top20Skills} language={language} copy={copy} />
          <ul className="bullet-list">
            {report.documents.document1.keySuccessFactors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">{copy.doc2Kicker}</div>
          <h2>{copy.doc2Title}</h2>
          <p className="section-copy">{copy.doc2Description}</p>
          <StrategyTable authors={report.documents.document2.top10Authors} language={language} copy={copy} />
          <ul className="bullet-list">
            {report.documents.document2.authorPatterns.map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="doc-grid lower-grid">
        <article className="doc-card">
          <div className="doc-kicker">{copy.doc3Kicker}</div>
          <h2>{copy.doc3Title}</h2>
          <p className="section-copy">{copy.doc3Description}</p>
          <div className="card-stack">
            {report.documents.document3.templates.map((template) => (
              <div key={template.name} className="sub-card">
                <h3>{template.name}</h3>
                <p>{template.bestFor}</p>
                <small>{template.structure}</small>
              </div>
            ))}
          </div>
          <div className="two-col-list">
            <div>
              <h3>{copy.productionRules}</h3>
              <ul className="bullet-list">
                {report.documents.document3.productionSystem.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{copy.namingRules}</h3>
              <ul className="bullet-list">
                {report.documents.document3.namingPatterns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">{copy.doc4Kicker}</div>
          <h2>{copy.doc4Title}</h2>
          <p className="section-copy">{copy.doc4Description}</p>

          <div className="two-col-list">
            <div>
              <h3>{copy.replaceableApis}</h3>
              <ul className="bullet-list">
                {report.documents.document4.replaceableApis.map((item) => (
                  <li key={item.apiFamily}>
                    <strong>{item.apiFamily}</strong> · {item.skillCount} skills · {item.whyItMatters}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{copy.funnelDesign}</h3>
              <ul className="bullet-list">
                {report.documents.document4.apiMonetizationFunnel.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="table-wrap compact-table">
            <table>
              <thead>
                <tr>
                  <th>{copy.category}</th>
                  <th>{copy.freeTier}</th>
                  <th>{copy.paidTier}</th>
                </tr>
              </thead>
              <tbody>
                {report.documents.document4.freeVsPaidByCategory.map((item) => (
                  <tr key={item.category}>
                    <td>{item.category}</td>
                    <td>{item.freeTier}</td>
                    <td>{item.paidTier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>{copy.topRebuildOpportunities}</h3>
          <div className="card-stack">
            {report.documents.document4.top10Rebuilds.map((item) => (
              <div key={`${item.skill}-${item.author}`} className="sub-card">
                <h3>{item.skill}</h3>
                <p>
                  @{item.author} · {item.category}
                </p>
                <small>{item.rationale}</small>
                <small>{item.aisaAngle}</small>
              </div>
            ))}
          </div>

          <div className="two-col-list">
            <div>
              <h3>{copy.factorySystemDesign}</h3>
              <ul className="bullet-list">
                {report.documents.document4.skillFactorySystemDesign.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{copy.roadmap}</h3>
              <ul className="bullet-list">
                {report.documents.document4.roadmap.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
