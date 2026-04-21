import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { SystemAuthor, SystemReport, SystemSkill } from './types';
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
    pageTitle: 'ClawHub 10K 系统报告',
    loading: '正在加载 10K+ 系统报告...',
    heroEyebrow: 'ClawHub 10K+ 系统',
    heroTitle: '爆款 Skill 背后的可复制系统',
    heroDescription:
      '这页聚焦的不是单个故事，而是 10K+ 下载技能背后的可复制生产系统、作者系统和 AISA API 变现模型。',
    backToAtlas: '返回 Atlas',
    openJson: '打开 JSON',
    openWordReport: '打开 Word 报告',
    openChineseReport: '打开中文报告',
    openBossBrief: '打开老板简报',
    skills10k: '10K+ 技能',
    authors: '作者',
    prolificAuthors: '高产作者',
    topDownloads: '最高下载量',
    snapshot: '快照',
    updatedAt: '更新于',
    downloaded10k: '已下载 10K 样本压缩包',
    downloadedPortfolios: '已下载高产作者作品集',
    doc1Kicker: '文档 1',
    doc1Title: '头部技能系统',
    doc2Kicker: '文档 2',
    doc2Title: '头部作者生产系统',
    doc3Kicker: '文档 3',
    doc3Title: '可复制运营模型',
    doc4Kicker: '文档 4',
    doc4Title: 'AISA 盈利系统',
    rank: '排名',
    skill: '技能',
    author: '作者',
    downloads: '下载量',
    category: '类别',
    input: '输入门槛',
    output: '输出价值',
    monetization: '变现潜力',
    totalSkills: '总技能数',
    skills10kHeader: '10K+ 技能数',
    sampleDownloads: '样本下载量',
    apiReuse: 'API 复用',
    template: '模板复用',
    selfImprovingFocus: '自增强作者重点',
    operatingModel: '操作模型',
    ordinaryToViral: '从普通到爆款',
    checklist: '执行清单',
    replaceableApis: '可替换 API 家族',
    monetizationFunnel: '变现漏斗',
    roadmap: '路线图',
  },
  en: {
    pageTitle: 'ClawHub 10K System Report',
    loading: 'Loading 10K+ system report...',
    heroEyebrow: 'ClawHub 10K+ Systems',
    heroTitle: 'Repeatable systems behind viral skills',
    heroDescription:
      'This page focuses on systems instead of one-off stories: the repeatable production model, the author model, and the AISA API monetization model behind 10K+ downloaded skills.',
    backToAtlas: 'Back to Atlas',
    openJson: 'Open JSON',
    openWordReport: 'Open Word report',
    openChineseReport: 'Open Chinese report',
    openBossBrief: 'Open boss brief',
    skills10k: '10K+ skills',
    authors: 'Authors',
    prolificAuthors: 'Prolific authors',
    topDownloads: 'Top downloads',
    snapshot: 'Snapshot',
    updatedAt: 'Updated',
    downloaded10k: 'Downloaded 10K sample zips',
    downloadedPortfolios: 'Downloaded prolific portfolios',
    doc1Kicker: 'Document 1',
    doc1Title: 'Top skill systems',
    doc2Kicker: 'Document 2',
    doc2Title: 'Top author production systems',
    doc3Kicker: 'Document 3',
    doc3Title: 'Repeatable operating model',
    doc4Kicker: 'Document 4',
    doc4Title: 'AISA monetization system',
    rank: 'Rank',
    skill: 'Skill',
    author: 'Author',
    downloads: 'Downloads',
    category: 'Category',
    input: 'Input',
    output: 'Output',
    monetization: 'Monetization',
    totalSkills: 'Total skills',
    skills10kHeader: '10K+ skills',
    sampleDownloads: 'Sample downloads',
    apiReuse: 'API reuse',
    template: 'Template use',
    selfImprovingFocus: 'Self-improving focus',
    operatingModel: 'Operating model',
    ordinaryToViral: 'Ordinary to viral',
    checklist: 'Checklist',
    replaceableApis: 'Replaceable API families',
    monetizationFunnel: 'Monetization funnel',
    roadmap: 'Roadmap',
  },
} as const;

type SystemCopy = (typeof copyByLanguage)[keyof typeof copyByLanguage];

function toneClass(value: string) {
  const normalized = value.toLowerCase();
  if (normalized === 'high') return 'is-high';
  if (normalized === 'medium') return 'is-medium';
  if (normalized === 'low') return 'is-low';
  return 'is-neutral';
}

function topApis(skills: SystemSkill[]) {
  const counter = new Map<string, number>();
  for (const skill of skills) {
    for (const api of skill.likelyApis) {
      counter.set(api, (counter.get(api) ?? 0) + 1);
    }
  }
  return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function TopSkillsTable({
  skills,
  language,
  copy,
}: {
  skills: SystemSkill[];
  language: 'zh' | 'en';
  copy: SystemCopy;
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

function TopAuthorsTable({
  authors,
  language,
  copy,
}: {
  authors: SystemAuthor[];
  language: 'zh' | 'en';
  copy: SystemCopy;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{copy.author}</th>
            <th>{copy.totalSkills}</th>
            <th>{copy.skills10kHeader}</th>
            <th>{copy.sampleDownloads}</th>
            <th>{copy.apiReuse}</th>
            <th>{copy.template}</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((author) => (
            <tr key={author.author}>
              <td>
                <a href={author.profileUrl} target="_blank" rel="noreferrer">
                  @{author.author}
                </a>
                <div className="row-subtext">{author.apiFamilies.join(' · ')}</div>
              </td>
              <td>{author.totalSkills}</td>
              <td>{author.numberOf10kPlusSkills}</td>
              <td>{formatMetricValue(author.totalDownloadsIn10kSample, language)}</td>
              <td>
                <span className={`status-pill ${toneClass(author.apiReuseLikelihood)}`}>{translateLevel(author.apiReuseLikelihood, language)}</span>
              </td>
              <td>
                <span className={`status-pill ${toneClass(author.templateUsage)}`}>{translateLevel(author.templateUsage, language)}</span>
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
  const [report, setReport] = useState<SystemReport | null>(() => peekJsonCache<SystemReport>('data/clawhub-10k-system-report.json'));

  useDocumentTitle(copy.pageTitle);

  useEffect(() => {
    loadJsonCached<SystemReport>('data/clawhub-10k-system-report.json')
      .then((json) => setReport(json))
      .catch((error) => console.error('Failed to load system report', error));
  }, []);

  const topApiEntries = useMemo(() => (report ? topApis(report.skills) : []), [report]);

  if (!report) {
    return <main className="system-shell loading">{copy.loading}</main>;
  }

  return (
    <main className="system-shell">
      <section className="page-toolbar">
        <LanguageToggle language={language} onChange={setLanguage} />
      </section>

      <section className="hero">
        <div>
          <div className="eyebrow">{copy.heroEyebrow}</div>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroDescription}</p>
          <div className="hero-actions">
            <a className="primary-link" href={`${import.meta.env.BASE_URL}`}>
              {copy.backToAtlas}
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}data/clawhub-10k-system-report.json`} target="_blank" rel="noreferrer">
              {copy.openJson}
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}reports/ClawHub_10K_System_Report.docx`} target="_blank" rel="noreferrer">
              {copy.openWordReport}
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}reports/ClawHub_10K_System_Report_ZH.docx`} target="_blank" rel="noreferrer">
              {copy.openChineseReport}
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}reports/ClawHub_10K_Boss_Brief_ZH.docx`} target="_blank" rel="noreferrer">
              {copy.openBossBrief}
            </a>
          </div>
        </div>

        <div className="hero-metrics">
          <article className="metric-card">
            <span>{copy.skills10k}</span>
            <strong>{report.summary.sampled10kSkills}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.authors}</span>
            <strong>{report.summary.sampledAuthors}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.prolificAuthors}</span>
            <strong>{report.summary.prolificAuthors}</strong>
          </article>
          <article className="metric-card">
            <span>{copy.topDownloads}</span>
            <strong>{formatMetricValue(report.summary.topSkillDownloads, language)}</strong>
          </article>
        </div>
      </section>

      <section className="notice-panel">
        <div className="panel-title">{copy.snapshot}</div>
        <div className="chip-row">
          <span className="chip">
            {copy.updatedAt} {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}
          </span>
          <span className="chip">10K downloads threshold</span>
          <span className="chip">
            {copy.downloaded10k}: {report.summary.downloaded10kSkills}
          </span>
          <span className="chip">
            {copy.downloadedPortfolios}: {report.summary.downloadedProlificPortfolioSkills}
          </span>
          {topApiEntries.map(([api, count]) => (
            <span key={api} className="chip">
              {api}: {count}
            </span>
          ))}
        </div>
      </section>

      <section className="doc-grid">
        <article className="doc-card">
          <div className="doc-kicker">{copy.doc1Kicker}</div>
          <h2>{copy.doc1Title}</h2>
          <TopSkillsTable skills={report.documents.document1.top20Skills} language={language} copy={copy} />
          <ul className="bullet-list">
            {report.documents.document1.systemLevelFindings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Repeatable systems</h3>
          <ul className="bullet-list">
            {report.documents.document1.repeatableSystem.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">{copy.doc2Kicker}</div>
          <h2>{copy.doc2Title}</h2>
          <TopAuthorsTable authors={report.documents.document2.top10Authors} language={language} copy={copy} />
          <h3>{copy.selfImprovingFocus}</h3>
          <div className="card-stack compact">
            {report.documents.document2.selfImprovingAuthorFocus.map((author) => (
              <a key={author.author} href={author.profileUrl} target="_blank" rel="noreferrer" className="sub-card anchor-card">
                <strong>@{author.author}</strong>
                <span>
                  total={author.totalSkills} · 10k+={author.numberOf10kPlusSkills}
                </span>
                <small>{author.topSkillNames.join(' · ')}</small>
              </a>
            ))}
          </div>
          <ul className="bullet-list">
            {report.documents.document2.productionSystemFindings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="doc-grid lower-grid">
        <article className="doc-card">
          <div className="doc-kicker">{copy.doc3Kicker}</div>
          <h2>{copy.doc3Title}</h2>
          <h3>{copy.operatingModel}</h3>
          <ul className="bullet-list">
            {report.documents.document3.operatingModel.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>{copy.ordinaryToViral}</h3>
          <ul className="bullet-list">
            {report.documents.document3.ordinaryToViralTransformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>{copy.checklist}</h3>
          <ul className="bullet-list">
            {report.documents.document3.executionChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">{copy.doc4Kicker}</div>
          <h2>{copy.doc4Title}</h2>
          <h3>{copy.replaceableApis}</h3>
          <div className="card-stack compact">
            {report.documents.document4.replaceableApis.map((item) => (
              <div key={item.apiFamily} className="sub-card">
                <strong>
                  {item.apiFamily} · {item.skillCount}
                </strong>
                <small>{item.systemPlay}</small>
              </div>
            ))}
          </div>
          <h3>{copy.monetizationFunnel}</h3>
          <ul className="bullet-list">
            {report.documents.document4.monetizationFunnel.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>{copy.roadmap}</h3>
          <ul className="bullet-list">
            {report.documents.document4.roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
