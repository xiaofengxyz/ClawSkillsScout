import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type { DownloadInsightAuthor, DownloadInsightsReport, DownloadInsightSkill } from './types';
import {
  LanguageToggle,
  formatMetricValue,
  loadJsonCached,
  peekJsonCache,
  useAppLanguage,
  useDocumentTitle,
  warmJsonCache,
} from '../site';

const copyByLanguage = {
  zh: {
    pageTitle: 'ClawHub 下载洞察',
    loading: '正在加载 ClawHub 下载洞察...',
    heroEyebrow: 'ClawHub 爆款分析',
    heroTitle: '把爆款 Skill、爆款作者、复制打法放到一页看清楚',
    heroDescription:
      '这页直接把当前下载榜里最重要的爆款 skill、爆款作者、可复制打法和 AISA 变现入口拆成清晰的展开卡片，让你快速知道谁在赢、为什么赢、我们该怎么做。',
    openMarketPage: '打开跨生态情报页',
    openLivePage: '打开实时下载榜',
    openJson: '查看 JSON',
    sampledSkills: '采样技能',
    skills5kPlus: '5K+ 技能',
    skills10kPlus: '10K+ 技能',
    prolificHitAuthors: '连续爆款作者',
    snapshotNotes: '快照说明',
    updatedAt: '更新于',
    topCategory: '头部类目',
    topDownloads: '最高下载量',
    skillDetails: '爆款 Skill 详情',
    authorDetails: '爆款作者详情',
    openSource: '打开来源',
    howViral: '为什么会火',
    howViralTitle: '爆款是怎么被做出来的',
    howToCopy: '怎么复制',
    howToCopyTitle: '怎么复制，而不是只复盘',
    productionRules: '生产规则',
    namingRules: '命名规则',
    aisaMoves: 'AISA 动作',
    aisaMovesTitle: '最值得改造成 AISA API 的方向',
    roadmap: '路线图',
    roadmapTitle: '接下来怎么落地',
    factoryFunnel: '工厂化漏斗',
    downloads: '下载',
    whyEasy: '为什么容易起量',
    apiClues: 'API 线索',
    repeatableTags: '可复制标签',
    topSampleDownloads: '头部样本下载量',
    apiFamilies: 'API 家族',
    signatureSkills: '代表作',
    portfolioShape: '作品结构',
    unknown: '未知',
    totalSkillsLabel: '总技能数',
    totalLabel: '总数',
    sampleDownloadsLabel: '样本下载',
  },
  en: {
    pageTitle: 'ClawHub Download Insights',
    loading: 'Loading ClawHub download insights...',
    heroEyebrow: 'ClawHub Breakout Analysis',
    heroTitle: 'See breakout skills, breakout authors, and repeatable playbooks on one page',
    heroDescription:
      'This page turns the live downloads leaderboard into expandable cards for breakout skills, breakout authors, repeatable production moves, and the clearest AISA monetization entries.',
    openMarketPage: 'Open market intelligence',
    openLivePage: 'Open live downloads page',
    openJson: 'View JSON',
    sampledSkills: 'Sampled skills',
    skills5kPlus: '5K+ skills',
    skills10kPlus: '10K+ skills',
    prolificHitAuthors: 'Prolific hit authors',
    snapshotNotes: 'Snapshot notes',
    updatedAt: 'Updated',
    topCategory: 'Top category',
    topDownloads: 'Top downloads',
    skillDetails: 'Breakout skill details',
    authorDetails: 'Breakout author details',
    openSource: 'Open source',
    howViral: 'How Viral',
    howViralTitle: 'How breakout skills are made',
    howToCopy: 'How To Copy',
    howToCopyTitle: 'How to copy the playbook instead of only reviewing it',
    productionRules: 'Production rules',
    namingRules: 'Naming rules',
    aisaMoves: 'AISA Moves',
    aisaMovesTitle: 'Best directions to rebuild into AISA APIs',
    roadmap: 'Roadmap',
    roadmapTitle: 'What to do next',
    factoryFunnel: 'Factory funnel',
    downloads: 'downloads',
    whyEasy: 'Why it scales',
    apiClues: 'API clues',
    repeatableTags: 'Repeatable tags',
    topSampleDownloads: 'Top sample downloads',
    apiFamilies: 'API families',
    signatureSkills: 'Signature skills',
    portfolioShape: 'Portfolio shape',
    unknown: 'Unknown',
    totalSkillsLabel: 'total skills',
    totalLabel: 'total',
    sampleDownloadsLabel: 'sample downloads',
  },
} as const;

type InsightsCopy = (typeof copyByLanguage)[keyof typeof copyByLanguage];

function topApis(skills: DownloadInsightSkill[]) {
  const counts = new Map<string, number>();
  for (const skill of skills) {
    for (const api of skill.likelyApis) {
      counts.set(api, (counts.get(api) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6);
}

function SkillBoard({
  skills,
  activeSlug,
  onSelect,
  language,
  copy,
}: {
  skills: DownloadInsightSkill[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
  language: 'zh' | 'en';
  copy: InsightsCopy;
}) {
  return (
    <section className="insight-board-card">
      <div className="board-top">
        <h3>{copy.skillDetails}</h3>
        <span>{skills.length}</span>
      </div>
      <div className="detail-list">
        {skills.map((skill) => {
          const isActive = skill.slug === activeSlug;
          return (
            <div key={skill.slug} className={`detail-item-shell${isActive ? ' is-active' : ''}`}>
              <button
                type="button"
                className={`detail-item${isActive ? ' is-active' : ''}`}
                onClick={() => onSelect(isActive ? null : skill.slug)}
                aria-expanded={isActive}
              >
                <strong>{skill.name}</strong>
                <small>
                  @{skill.author} · {formatMetricValue(skill.downloads, language)} {copy.downloads} · {skill.category}
                </small>
              </button>
              {isActive ? (
                <div className="accordion-body">
                  <div className="chip-row">
                    {[
                      `${formatMetricValue(skill.downloads, language)} ${copy.downloads}`,
                      skill.category,
                      skill.monetizationPotential,
                      skill.apiDependency,
                    ].map((chip) => (
                      <span key={chip} className="chip">
                        {chip}
                      </span>
                    ))}
                  </div>
                  <ul className="bullet-list detail-bullets">
                    <li>{skill.description}</li>
                    <li>
                      {copy.whyEasy}：{language === 'zh' ? '输入门槛' : 'input complexity'} {skill.inputComplexity}
                      {language === 'zh' ? '，输出价值' : ', output value'} {skill.outputValue}。
                    </li>
                    <li>
                      {copy.apiClues}：{skill.likelyApis.join(' · ') || copy.unknown}。
                    </li>
                    <li>
                      {copy.repeatableTags}：{skill.repeatablePatternFlags.join(' · ') || (language === 'zh' ? '暂无' : 'n/a')}。
                    </li>
                  </ul>
                  <a className="secondary-link inline-link" href={skill.url} target="_blank" rel="noreferrer">
                    {copy.openSource} <ExternalLink size={14} />
                  </a>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AuthorBoard({
  authors,
  activeAuthor,
  onSelect,
  language,
  copy,
}: {
  authors: DownloadInsightAuthor[];
  activeAuthor: string | null;
  onSelect: (author: string | null) => void;
  language: 'zh' | 'en';
  copy: InsightsCopy;
}) {
  return (
    <section className="insight-board-card">
      <div className="board-top">
        <h3>{copy.authorDetails}</h3>
        <span>{authors.length}</span>
      </div>
      <div className="detail-list">
        {authors.map((author) => {
          const isActive = author.author === activeAuthor;
          return (
            <div key={author.author} className={`detail-item-shell${isActive ? ' is-active' : ''}`}>
              <button
                type="button"
                className={`detail-item${isActive ? ' is-active' : ''}`}
                onClick={() => onSelect(isActive ? null : author.author)}
                aria-expanded={isActive}
              >
                <strong>@{author.author}</strong>
                <small>
                  {author.totalSkills} {copy.totalLabel} · 10K+ {author.numberOf10kPlusSkills} · {formatMetricValue(author.totalDownloadsInTopSample, language)} {copy.sampleDownloadsLabel}
                </small>
              </button>
              {isActive ? (
                <div className="accordion-body">
                  <div className="chip-row">
                    {[
                      `${author.totalSkills} ${copy.totalSkillsLabel}`,
                      `10K+ ${author.numberOf10kPlusSkills}`,
                      author.strategyLabel,
                      author.authorPageStatus,
                    ].map((chip) => (
                      <span key={chip} className="chip">
                        {chip}
                      </span>
                    ))}
                  </div>
                  <ul className="bullet-list detail-bullets">
                    <li>
                      {copy.topSampleDownloads}: {formatMetricValue(author.totalDownloadsInTopSample, language)}。
                    </li>
                    <li>
                      {copy.apiFamilies}: {author.apiFamilies.join(' · ') || copy.unknown}。
                    </li>
                    <li>
                      {copy.signatureSkills}：{author.topSkillNames.join(' · ') || (language === 'zh' ? '暂无' : 'n/a')}。
                    </li>
                    <li>
                      {copy.portfolioShape}：{author.skills.slice(0, 5).map((item) => item.name).join(' · ')}。
                    </li>
                  </ul>
                  {author.profileUrl ? (
                    <a className="secondary-link inline-link" href={author.profileUrl} target="_blank" rel="noreferrer">
                      {copy.openSource} <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function App() {
  const { language, setLanguage } = useAppLanguage();
  const copy = copyByLanguage[language];
  const [report, setReport] = useState<DownloadInsightsReport | null>(() => peekJsonCache<DownloadInsightsReport>('data/clawhub-download-insights.json'));
  const [activeSkillSlug, setActiveSkillSlug] = useState<string | null>(null);
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);

  useDocumentTitle(copy.pageTitle);

  useEffect(() => {
    loadJsonCached<DownloadInsightsReport>('data/clawhub-download-insights.json')
      .then((json) => {
        setReport(json);
        warmJsonCache(['data/clawhub-growth-report.json', 'data/market-ecosystem-report.json']);
      })
      .catch((error) => console.error('Failed to load clawhub download insights report', error));
  }, []);

  const apis = useMemo(() => (report ? topApis(report.skills) : []), [report]);

  if (!report) {
    return <main className="insights-shell loading">{copy.loading}</main>;
  }

  return (
    <main className="insights-shell">
      <section className="page-toolbar">
        <LanguageToggle language={language} onChange={setLanguage} />
      </section>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">{copy.heroEyebrow}</div>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroDescription}</p>
          <div className="hero-actions">
            <a className="primary-link" href={`${import.meta.env.BASE_URL}market-intelligence.html`}>
              {copy.openMarketPage} <ArrowRight size={16} />
            </a>
            <a className="secondary-link" href={report.source.skillsListUrl} target="_blank" rel="noreferrer">
              {copy.openLivePage}
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}data/clawhub-download-insights.json`} target="_blank" rel="noreferrer">
              {copy.openJson}
            </a>
          </div>
        </div>

        <div className="hero-metrics">
          <article className="metric-card">
            <span>{copy.sampledSkills}</span>
            <strong>{report.summary.sampledSkills}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.skills5kPlus}</span>
            <strong>{report.summary.skills5kPlus}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.skills10kPlus}</span>
            <strong>{report.summary.skills10kPlus}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.prolificHitAuthors}</span>
            <strong>{report.summary.prolificHitAuthors}</strong>
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
          <span className="chip">
            {copy.topCategory}: {report.summary.topCategory}
          </span>
          <span className="chip">
            {copy.topDownloads}: {formatMetricValue(report.summary.topSkillDownloads, language)}
          </span>
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

      <section className="detail-grid detail-grid-single">
        <SkillBoard skills={report.documents.document1.top20Skills} activeSlug={activeSkillSlug} onSelect={setActiveSkillSlug} language={language} copy={copy} />
      </section>

      <section className="detail-grid detail-grid-single">
        <AuthorBoard authors={report.documents.document2.top10Authors} activeAuthor={activeAuthor} onSelect={setActiveAuthor} language={language} copy={copy} />
      </section>

      <section className="doc-grid">
        <article className="doc-card">
          <div className="doc-kicker">{copy.howViral}</div>
          <h2>{copy.howViralTitle}</h2>
          <div className="card-stack compact">
            {report.documents.document1.top20Skills.slice(0, 6).map((skill) => (
              <a key={skill.slug} href={skill.url} target="_blank" rel="noreferrer" className="sub-card anchor-card">
                <strong>{skill.name}</strong>
                <span>
                  {formatMetricValue(skill.downloads, language)} {copy.downloads} · {skill.category}
                </span>
                <small>{skill.likelyApis.join(' · ') || copy.unknown}</small>
              </a>
            ))}
          </div>
          <ul className="bullet-list">
            {report.documents.document1.keySuccessFactors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">{copy.howToCopy}</div>
          <h2>{copy.howToCopyTitle}</h2>
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
      </section>

      <section className="doc-grid lower-grid">
        <article className="doc-card">
          <div className="doc-kicker">{copy.aisaMoves}</div>
          <h2>{copy.aisaMovesTitle}</h2>
          <div className="card-stack compact">
            {report.documents.document4.top10Rebuilds.slice(0, 6).map((item) => (
              <div key={item.skill} className="sub-card">
                <strong>
                  {item.skill} · @{item.author}
                </strong>
                <span>{item.category}</span>
                <p>{item.rationale}</p>
                <small>{item.aisaAngle}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">{copy.roadmap}</div>
          <h2>{copy.roadmapTitle}</h2>
          <ul className="bullet-list">
            {report.documents.document4.roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>{copy.factoryFunnel}</h3>
          <ul className="bullet-list">
            {report.documents.document4.apiMonetizationFunnel.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
