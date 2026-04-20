import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type { DownloadInsightAuthor, DownloadInsightsReport, DownloadInsightSkill } from './types';

function metricValue(value: number) {
  return value.toLocaleString('en-US');
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

function SkillBoard({
  skills,
  activeSlug,
  onSelect,
}: {
  skills: DownloadInsightSkill[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <section className="insight-board-card">
      <div className="board-top">
        <h3>爆款 Skill 详情</h3>
        <span>{skills.length}</span>
      </div>
      <div className="detail-list">
        {skills.map((skill) => (
          <button
            key={skill.slug}
            type="button"
            className={`detail-item${skill.slug === activeSlug ? ' is-active' : ''}`}
            onClick={() => onSelect(skill.slug)}
          >
            <strong>{skill.name}</strong>
            <small>
              @{skill.author} · {metricValue(skill.downloads)} 下载 · {skill.category}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function AuthorBoard({
  authors,
  activeAuthor,
  onSelect,
}: {
  authors: DownloadInsightAuthor[];
  activeAuthor: string | null;
  onSelect: (author: string) => void;
}) {
  return (
    <section className="insight-board-card">
      <div className="board-top">
        <h3>爆款作者详情</h3>
        <span>{authors.length}</span>
      </div>
      <div className="detail-list">
        {authors.map((author) => (
          <button
            key={author.author}
            type="button"
            className={`detail-item${author.author === activeAuthor ? ' is-active' : ''}`}
            onClick={() => onSelect(author.author)}
          >
            <strong>@{author.author}</strong>
            <small>
              {author.totalSkills} total · 10K+ {author.numberOf10kPlusSkills} · {metricValue(author.totalDownloadsInTopSample)} sample downloads
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function DetailPanel({
  title,
  eyebrow,
  chips,
  bullets,
  link,
}: {
  title: string;
  eyebrow: string;
  chips: string[];
  bullets: string[];
  link?: string;
}) {
  return (
    <article className="insight-detail-card">
      <div className="doc-kicker">{eyebrow}</div>
      <h3>{title}</h3>
      <div className="chip-row">
        {chips.map((chip) => (
          <span key={chip} className="chip">
            {chip}
          </span>
        ))}
      </div>
      <ul className="bullet-list detail-bullets">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {link ? (
        <a className="secondary-link inline-link" href={link} target="_blank" rel="noreferrer">
          打开来源 <ExternalLink size={14} />
        </a>
      ) : null}
    </article>
  );
}

export default function App() {
  const [report, setReport] = useState<DownloadInsightsReport | null>(null);
  const [activeSkillSlug, setActiveSkillSlug] = useState<string | null>(null);
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/clawhub-download-insights.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`clawhub-download-insights.json ${response.status}`);
        return response.json();
      })
      .then((json: DownloadInsightsReport) => {
        setReport(json);
        setActiveSkillSlug(json.documents.document1.top20Skills[0]?.slug ?? null);
        setActiveAuthor(json.documents.document2.top10Authors[0]?.author ?? null);
      })
      .catch((error) => console.error('Failed to load clawhub download insights report', error));
  }, []);

  const apis = useMemo(() => (report ? topApis(report.skills) : []), [report]);
  const activeSkill = useMemo(
    () => report?.documents.document1.top20Skills.find((skill) => skill.slug === activeSkillSlug) ?? null,
    [report, activeSkillSlug],
  );
  const activeAuthorProfile = useMemo(
    () => report?.documents.document2.top10Authors.find((author) => author.author === activeAuthor) ?? null,
    [report, activeAuthor],
  );

  if (!report) {
    return <main className="insights-shell loading">Loading ClawHub download insights...</main>;
  }

  return (
    <main className="insights-shell">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">ClawHub breakout analysis</div>
          <h1>把爆款 Skill、爆款作者、复制打法放到一页看清楚</h1>
          <p>
            这页不再只给大表格，而是直接把当前下载榜里最重要的爆款 skill、爆款作者、可复制打法和 AIsa 变现入口拆成清晰的详情面板。
            这样你看一眼就知道“谁在赢、为什么赢、我们该怎么做”。
          </p>
          <div className="hero-actions">
            <a className="primary-link" href={`${import.meta.env.BASE_URL}market-intelligence.html`}>
              打开跨生态情报页 <ArrowRight size={16} />
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

      <section className="detail-grid">
        <SkillBoard skills={report.documents.document1.top20Skills} activeSlug={activeSkillSlug} onSelect={setActiveSkillSlug} />
        {activeSkill ? (
          <DetailPanel
            title={activeSkill.name}
            eyebrow={`@${activeSkill.author}`}
            chips={[
              `${metricValue(activeSkill.downloads)} 下载`,
              activeSkill.category,
              activeSkill.monetizationPotential,
              activeSkill.apiDependency,
            ]}
            bullets={[
              activeSkill.description,
              `为什么容易起量：输入门槛 ${activeSkill.inputComplexity}，输出价值 ${activeSkill.outputValue}。`,
              `API 线索：${activeSkill.likelyApis.join(' · ') || 'Unknown'}。`,
              `可复制标签：${activeSkill.repeatablePatternFlags.join(' · ') || '暂无'}。`,
            ]}
            link={activeSkill.url}
          />
        ) : null}
      </section>

      <section className="detail-grid">
        <AuthorBoard authors={report.documents.document2.top10Authors} activeAuthor={activeAuthor} onSelect={setActiveAuthor} />
        {activeAuthorProfile ? (
          <DetailPanel
            title={`@${activeAuthorProfile.author}`}
            eyebrow="Author profile"
            chips={[
              `${activeAuthorProfile.totalSkills} total skills`,
              `10K+ ${activeAuthorProfile.numberOf10kPlusSkills}`,
              activeAuthorProfile.strategyLabel,
              activeAuthorProfile.authorPageStatus,
            ]}
            bullets={[
              `Top sample downloads: ${metricValue(activeAuthorProfile.totalDownloadsInTopSample)}。`,
              `API families: ${activeAuthorProfile.apiFamilies.join(' · ') || 'Unknown'}。`,
              `代表作：${activeAuthorProfile.topSkillNames.join(' · ') || '暂无'}。`,
              `作品结构：${activeAuthorProfile.skills.slice(0, 5).map((item) => item.name).join(' · ')}。`,
            ]}
            link={activeAuthorProfile.profileUrl}
          />
        ) : null}
      </section>

      <section className="doc-grid">
        <article className="doc-card">
          <div className="doc-kicker">How Viral</div>
          <h2>爆款是怎么被做出来的</h2>
          <div className="card-stack compact">
            {report.documents.document1.top20Skills.slice(0, 6).map((skill) => (
              <a key={skill.slug} href={skill.url} target="_blank" rel="noreferrer" className="sub-card anchor-card">
                <strong>{skill.name}</strong>
                <span>
                  {metricValue(skill.downloads)} 下载 · {skill.category}
                </span>
                <small>{skill.likelyApis.join(' · ') || 'Unknown'}</small>
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
          <div className="doc-kicker">How To Copy</div>
          <h2>怎么复制，而不是只复盘</h2>
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
      </section>

      <section className="doc-grid lower-grid">
        <article className="doc-card">
          <div className="doc-kicker">AIsa Moves</div>
          <h2>最值得改造成 AIsa API 的方向</h2>
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
          <div className="doc-kicker">Roadmap</div>
          <h2>接下来怎么落地</h2>
          <ul className="bullet-list">
            {report.documents.document4.roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Factory funnel</h3>
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
