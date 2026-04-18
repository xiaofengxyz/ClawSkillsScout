import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { GrowthAuthor, GrowthReport, GrowthSkill } from './types';

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

function topApis(skills: GrowthSkill[]) {
  const counts = new Map<string, number>();
  for (const skill of skills) {
    for (const api of skill.likelyApis) {
      counts.set(api, (counts.get(api) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6);
}

function StrategyTable({ authors }: { authors: GrowthAuthor[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Author</th>
            <th>Sampled Skills</th>
            <th>Total Downloads</th>
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
              </td>
              <td>{author.sampledTotalSkills}</td>
              <td>{metricValue(author.totalDownloadsInSample)}</td>
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

function TopSkillsTable({ skills }: { skills: GrowthSkill[] }) {
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

export default function App() {
  const [report, setReport] = useState<GrowthReport | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/clawhub-growth-report.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`clawhub-growth-report.json ${response.status}`);
        return response.json();
      })
      .then((json: GrowthReport) => setReport(json))
      .catch((error) => console.error('Failed to load clawhub growth report', error));
  }, []);

  const apis = useMemo(() => (report ? topApis(report.skills) : []), [report]);

  if (!report) {
    return <main className="growth-shell loading">Loading ClawHub growth report...</main>;
  }

  return (
    <main className="growth-shell">
      <section className="growth-hero">
        <div>
          <div className="eyebrow">ClawHub growth intelligence</div>
          <h1>Top Skills, Top Authors, and the AIsa Monetization Map</h1>
          <p>
            A standalone strategy page that turns the current ClawHub catalog snapshot into four business documents:
            skills analysis, author analysis, a skill factory playbook, and an AIsa monetization strategy.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href={`${import.meta.env.BASE_URL}`}>
              Back to AISA Atlas
            </a>
            <a className="secondary-link" href={report.source.skillsListUrl} target="_blank" rel="noreferrer">
              Source page
            </a>
          </div>
        </div>
        <div className="hero-metrics">
          <article className="metric-card">
            <span>Sampled skills</span>
            <strong>{report.summary.sampledSkills}</strong>
          </article>
          <article className="metric-card">
            <span>Sampled authors</span>
            <strong>{report.summary.sampledAuthors}</strong>
          </article>
          <article className="metric-card">
            <span>Top downloads</span>
            <strong>{metricValue(report.summary.topSkillDownloads)}</strong>
          </article>
          <article className="metric-card">
            <span>5K+ skills in snapshot</span>
            <strong>{report.summary.highDownloadSkills}</strong>
          </article>
        </div>
      </section>

      <section className="notice-panel">
        <div className="panel-title">Snapshot notes</div>
        <div className="chip-row">
          <span className="chip">Updated {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}</span>
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
          <div className="doc-kicker">Document 1</div>
          <h2>{report.documents.document1.title}</h2>
          <p className="section-copy">Category mix, top-skill breakdown, and the repeatable traits behind the strongest current catalog entries.</p>
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
          <p className="section-copy">Which authors are compounding fastest inside the snapshot and what their portfolios suggest about repeatable production behavior.</p>
          <StrategyTable authors={report.documents.document2.top10Authors} />
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
          <p className="section-copy">A practical operating model for launching many high-clarity skills from a small set of shared wrappers and templates.</p>
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
          <p className="section-copy">The monetization map for AIsa: where to replace external APIs, what to give away for free, and how to structure a scalable API funnel.</p>

          <div className="two-col-list">
            <div>
              <h3>Replaceable APIs</h3>
              <ul className="bullet-list">
                {report.documents.document4.replaceableApis.map((item) => (
                  <li key={item.apiFamily}>
                    <strong>{item.apiFamily}</strong> · {item.skillCount} skills · {item.whyItMatters}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Funnel design</h3>
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
                  <th>Category</th>
                  <th>Free Tier</th>
                  <th>Paid Tier</th>
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

          <h3>Top rebuild opportunities</h3>
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
              <h3>Factory system design</h3>
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
