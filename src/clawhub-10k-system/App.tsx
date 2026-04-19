import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { SystemAuthor, SystemReport, SystemSkill } from './types';

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

function topApis(skills: SystemSkill[]) {
  const counter = new Map<string, number>();
  for (const skill of skills) {
    for (const api of skill.likelyApis) {
      counter.set(api, (counter.get(api) ?? 0) + 1);
    }
  }
  return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function TopSkillsTable({ skills }: { skills: SystemSkill[] }) {
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

function TopAuthorsTable({ authors }: { authors: SystemAuthor[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Author</th>
            <th>Total Skills</th>
            <th>10K+ Skills</th>
            <th>Sample Downloads</th>
            <th>API Reuse</th>
            <th>Template</th>
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
              <td>{metricValue(author.totalDownloadsIn10kSample)}</td>
              <td>
                <span className={`status-pill ${toneClass(author.apiReuseLikelihood)}`}>{author.apiReuseLikelihood}</span>
              </td>
              <td>
                <span className={`status-pill ${toneClass(author.templateUsage)}`}>{author.templateUsage}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [report, setReport] = useState<SystemReport | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/clawhub-10k-system-report.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`clawhub-10k-system-report.json ${response.status}`);
        return response.json();
      })
      .then((json: SystemReport) => setReport(json))
      .catch((error) => console.error('Failed to load system report', error));
  }, []);

  const topApiEntries = useMemo(() => (report ? topApis(report.skills) : []), [report]);

  if (!report) {
    return <main className="system-shell loading">Loading 10k+ system report...</main>;
  }

  return (
    <main className="system-shell">
      <section className="hero">
        <div>
          <div className="eyebrow">ClawHub 10K+ systems</div>
          <h1>Repeatable Systems Behind Viral Skills</h1>
          <p>
            Focused on repeatable production and monetization systems, not one-off stories. This page analyzes all current 10k+ downloaded skills, prolific authors,
            and an AIsa API monetization operating model.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href={`${import.meta.env.BASE_URL}`}>
              Back to Atlas
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}data/clawhub-10k-system-report.json`} target="_blank" rel="noreferrer">
              Open JSON
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}reports/ClawHub_10K_System_Report.docx`} target="_blank" rel="noreferrer">
              Open Word Report
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}reports/ClawHub_10K_System_Report_ZH.docx`} target="_blank" rel="noreferrer">
              Open Chinese Report
            </a>
            <a className="secondary-link" href={`${import.meta.env.BASE_URL}reports/ClawHub_10K_Boss_Brief_ZH.docx`} target="_blank" rel="noreferrer">
              Open Boss Brief ZH
            </a>
          </div>
        </div>

        <div className="hero-metrics">
          <article className="metric-card">
            <span>10K+ skills</span>
            <strong>{report.summary.sampled10kSkills}</strong>
          </article>
          <article className="metric-card">
            <span>Authors</span>
            <strong>{report.summary.sampledAuthors}</strong>
          </article>
          <article className="metric-card">
            <span>Prolific authors</span>
            <strong>{report.summary.prolificAuthors}</strong>
          </article>
          <article className="metric-card">
            <span>Top downloads</span>
            <strong>{metricValue(report.summary.topSkillDownloads)}</strong>
          </article>
        </div>
      </section>

      <section className="notice-panel">
        <div className="panel-title">Snapshot</div>
        <div className="chip-row">
          <span className="chip">Updated {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm')}</span>
          <span className="chip">10K downloads threshold</span>
          <span className="chip">Downloaded 10K zips: {report.summary.downloaded10kSkills}</span>
          <span className="chip">Prolific portfolio zips: {report.summary.downloadedProlificPortfolioSkills}</span>
          {topApiEntries.map(([api, count]) => (
            <span key={api} className="chip">
              {api}: {count}
            </span>
          ))}
        </div>
      </section>

      <section className="doc-grid">
        <article className="doc-card">
          <div className="doc-kicker">Document 1</div>
          <h2>{report.documents.document1.title}</h2>
          <TopSkillsTable skills={report.documents.document1.top20Skills} />
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
          <div className="doc-kicker">Document 2</div>
          <h2>{report.documents.document2.title}</h2>
          <TopAuthorsTable authors={report.documents.document2.top10Authors} />
          <h3>Self-improving focus</h3>
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
          <div className="doc-kicker">Document 3</div>
          <h2>{report.documents.document3.title}</h2>
          <h3>Operating model</h3>
          <ul className="bullet-list">
            {report.documents.document3.operatingModel.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Ordinary to viral</h3>
          <ul className="bullet-list">
            {report.documents.document3.ordinaryToViralTransformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Checklist</h3>
          <ul className="bullet-list">
            {report.documents.document3.executionChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="doc-card">
          <div className="doc-kicker">Document 4</div>
          <h2>{report.documents.document4.title}</h2>
          <h3>Replaceable API families</h3>
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
          <h3>Monetization funnel</h3>
          <ul className="bullet-list">
            {report.documents.document4.monetizationFunnel.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Roadmap</h3>
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
