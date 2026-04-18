import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { DownloadInsightAuthor, DownloadInsightsReport, DownloadInsightSkill } from './types';

function metricValue(value: number) {
  return value.toLocaleString('en-US');
}

function toneClass(value: string) {
  const normalized = value.toLowerCase();
  if (normalized === 'high') return 'is-high';
  if (normalized === 'medium') return 'is-medium';
  if (normalized === 'low') return 'is-low';
  return 'is-neutral';
}

function topApis(skills: DownloadInsightSkill[]) {
  const counts = new Map<string, number>();
  for (const skill of skills) {
    for (const api of skill.likelyApis) {
      counts.set(api, (counts.get(api) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6);
}

function TopSkillsTable({ skills }: { skills: DownloadInsightSkill[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Skill</th>
            <th>Author</th>
            <th>Downloads</th>
            <th>Category</th>
            <th>Input</th>
            <th>Output</th>
            <th>Monetization</th>
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
              <td>{metricValue(skill.downloads)}</td>
              <td>{skill.category}</td>
              <td>{skill.inputComplexity}</td>
              <td>{skill.outputValue}</td>
              <td>
                <span className={`status-pill ${toneClass(skill.monetizationPotential)}`}>{skill.monetizationPotential}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuthorTable({ authors }: { authors: DownloadInsightAuthor[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Author</th>
            <th>Total Skills</th>
            <th>10K+ Skills</th>
            <th>Top-sample Downloads</th>
            <th>API Reuse</th>
            <th>Template Usage</th>
            <th>Strategy</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((author) => (
            <tr key={author.author}>
              <td>
                <a href={author.profileUrl} target="_blank" rel="noreferrer">
                  @{author.author}
                </a>
                <div className="row-subtext">{author.apiFamilies.join(' · ') || 'Unknown'}</div>
              </td>
              <td>{author.totalSkills}</td>
              <td>{author.numberOf10kPlusSkills}</td>
              <td>{metricValue(author.totalDownloadsInTopSample)}</td>
              <td>
                <span className={`status-pill ${toneClass(author.apiReuseLikelihood)}`}>{author.apiReuseLikelihood}</span>
              </td>
              <td>
                <span className={`status-pill ${toneClass(author.templateUsage)}`}>{author.templateUsage}</span>
              </td>
              <td>{author.strategyLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [report, setReport] = useState<DownloadInsightsReport | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/clawhub-download-insights.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`clawhub-download-insights.json ${response.status}`);
        return response.json();
      })
      .then((json: DownloadInsightsReport) => setReport(json))
      .catch((error) => console.error('Failed to load clawhub download insights report', error));
  }, []);

  const apis = useMemo(() => (report ? topApis(report.skills) : []), [report]);

  if (!report) {
    return <main className="insights-shell loading">Loading ClawHub download insights...</main>;
  }

  return (
    <main className="insights-shell">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">ClawHub breakout analysis</div>
          <h1>下载榜爆款技能、作者打法、以及 AIsa API 变现入口</h1>
          <p>
            单独分析 ClawHub 实时下载榜，而不是本项目本地 skills。页面聚焦 5K 到 10K+ 下载技能、爆款又多产的作者，
            再把这些模式映射成可复制的 skill factory 和 AIsa 变现路线。
          </p>
          <div className="hero-actions">
            <a className="primary-link" href={`${import.meta.env.BASE_URL}`}>
              Back to AISA Atlas
            </a>
            <a className="secondary-link" href={report.source.skillsListUrl} target="_blank" rel="noreferrer">
              Open live downloads page
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}data/clawhub-download-insights.json`} target="_blank" rel="noreferrer">
              View JSON
            </a>
          </div>
        </div>

        <div className="hero-metrics">
          <article className="metric-card">
            <span>Sampled skills</span>
            <strong>{report.summary.sampledSkills}</strong>
          </article>
          <article className="metric-card">
            <span>5K+ skills</span>
            <strong>{report.summary.skills5kPlus}</strong>
          </article>
          <article className="metric-card">
            <span>10K+ skills</span>
            <strong>{report.summary.skills10kPlus}</strong>
          </article>
          <article className="metric-card">
            <span>Prolific hit authors</span>
            <strong>{report.summary.prolificHitAuthors}</strong>
          </article>
        </div>
      </section>

      <section className="notice-panel">
        <div className="panel-title">Snapshot notes</div>
        <div className="chip-row">
          <span className="chip">Updated {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}</span>
          <span className="chip">{report.source.sampleType}</span>
          <span className="chip">Top category: {report.summary.topCategory}</span>
          <span className="chip">Top downloads: {metricValue(report.summary.topSkillDownloads)}</span>
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

      <section className="spotlight-strip">
        <article className="spotlight-card">
          <div className="doc-kicker">Breakout authors</div>
          <h2>爆款又多产的作者</h2>
          <div className="card-stack compact">
            {report.documents.document2.viralProductiveAuthors.map((author) => (
              <a key={author.author} href={author.profileUrl} target="_blank" rel="noreferrer" className="sub-card anchor-card">
                <strong>@{author.author}</strong>
                <span>
                  {author.numberOf10kPlusSkills} skills above 10K · {author.totalSkills} total skills
                </span>
                <small>{author.strategyLabel}</small>
              </a>
            ))}
          </div>
        </article>

        <article className="spotlight-card">
          <div className="doc-kicker">Collection diagnostics</div>
          <h2>作者页抓取状态</h2>
          <div className="chip-row">
            {Object.entries(report.collectionDiagnostics.authorPageStatusCounts).map(([status, count]) => (
              <span key={status} className="chip">
                {status}: {count}
              </span>
            ))}
          </div>
          <p className="section-copy">
            优先尝试作者页公开查询；如果站点接口不稳定，则回退到搜索或样本重建，这样页面仍能持续产出策略洞察。
          </p>
        </article>
      </section>

      <section className="doc-grid">
        <article className="doc-card">
          <div className="doc-kicker">Document 1</div>
          <h2>{report.documents.document1.title}</h2>
          <p className="section-copy">看清下载榜头部技能的类别结构、标题模式、输入输出设计，以及为什么它们容易起量。</p>
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
          <TopSkillsTable skills={report.documents.document1.top20Skills} />
          <ul className="bullet-list">
            {report.documents.document1.keySuccessFactors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">Document 2</div>
          <h2>{report.documents.document2.title}</h2>
          <p className="section-copy">聚焦高表现作者的作品密度、10K+ 爆款数、API 复用概率，以及是否在做模板化量产。</p>
          <AuthorTable authors={report.documents.document2.top10Authors} />
          <ul className="bullet-list">
            {report.documents.document2.authorPatterns.map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="doc-grid lower-grid">
        <article className="doc-card">
          <div className="doc-kicker">Document 3</div>
          <h2>{report.documents.document3.title}</h2>
          <p className="section-copy">把爆款规律沉淀成一套可重复执行的生产打法，而不是一次性的爆款复盘。</p>
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
              <h3>Production rules</h3>
              <ul className="bullet-list">
                {report.documents.document3.productionSystem.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Naming rules</h3>
              <ul className="bullet-list">
                {report.documents.document3.namingPatterns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">Document 4</div>
          <h2>{report.documents.document4.title}</h2>
          <p className="section-copy">把头部技能的流量结构，翻译成 AIsa API 的替代路径、收费梯度和产品路线。</p>

          <div className="two-col-list">
            <div>
              <h3>Replaceable APIs</h3>
              <div className="card-stack compact">
                {report.documents.document4.replaceableApis.map((api) => (
                  <div key={api.apiFamily} className="sub-card">
                    <strong>
                      {api.apiFamily} · {api.skillCount}
                    </strong>
                    <p>{api.whyItMatters}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3>Free vs Pro</h3>
              <div className="card-stack compact">
                {report.documents.document4.freeVsPaidByCategory.map((tier) => (
                  <div key={tier.category} className="sub-card">
                    <strong>{tier.category}</strong>
                    <p>Free: {tier.freeTier}</p>
                    <small>Paid: {tier.paidTier}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h3>Top rebuild opportunities</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Why rebuild</th>
                  <th>AIsa angle</th>
                </tr>
              </thead>
              <tbody>
                {report.documents.document4.top10Rebuilds.map((item) => (
                  <tr key={`${item.author}-${item.skill}`}>
                    <td>{item.skill}</td>
                    <td>@{item.author}</td>
                    <td>{item.category}</td>
                    <td>{item.rationale}</td>
                    <td>{item.aisaAngle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="two-col-list">
            <div>
              <h3>System design</h3>
              <ul className="bullet-list">
                {report.documents.document4.skillFactorySystemDesign.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Roadmap</h3>
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
