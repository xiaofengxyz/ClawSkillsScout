import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import { syncMarkdownDocx } from './lib/report-docx.mjs';

const ROOT = process.cwd();
const OUTPUT_PATH = resolve(ROOT, 'public/data/agentskills-so-report.json');
const REPORT_ZH_PATH = resolve(ROOT, 'reports/AgentSkills_SO_Report_ZH.md');
const REPORT_ZH_PUBLIC_PATH = resolve(ROOT, 'public/reports/AgentSkills_SO_Report_ZH.md');
const REPORT_EN_PATH = resolve(ROOT, 'reports/AgentSkills_SO_Report_EN.md');
const REPORT_EN_PUBLIC_PATH = resolve(ROOT, 'public/reports/AgentSkills_SO_Report_EN.md');

const BASE_URL = 'https://agentskills.so';
const HOME_PAGE_URLS = Array.from({ length: 8 }, (_, index) => (index === 0 ? `${BASE_URL}/` : `${BASE_URL}/?page=${index + 1}`));
const SEARCH_PAGE_URLS = Array.from({ length: 8 }, (_, index) => `${BASE_URL}/skills/search${index === 0 ? '' : `?page=${index + 1}`}`);
const LIST_URLS = [...HOME_PAGE_URLS, ...SEARCH_PAGE_URLS];

function compactSpaces(value) {
  return String(value ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(html) {
  return compactSpaces(
    String(html ?? '')
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function normalizeMetricNumber(value) {
  const text = compactSpaces(value).replace(/,/g, '');
  if (!text) return 0;
  const match = text.match(/^([0-9]*\.?[0-9]+)([KMB])?$/i);
  if (!match) {
    const numeric = Number(text);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  const base = Number(match[1]);
  const suffix = (match[2] || '').toUpperCase();
  const multiplier = suffix === 'B' ? 1_000_000_000 : suffix === 'M' ? 1_000_000 : suffix === 'K' ? 1_000 : 1;
  return Math.round(base * multiplier);
}

function sumBy(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}

function sortByNumber(items, selector) {
  return [...items].sort((a, b) => selector(b) - selector(a));
}

function uniqueBy(items, selector) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = selector(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function countBy(items, selector, limit = 12) {
  const counter = new Map();
  for (const item of items) {
    const key = selector(item);
    if (!key) continue;
    counter.set(key, (counter.get(key) ?? 0) + 1);
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function markdownTable(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${headers.map((header) => String(row[header] ?? '')).join(' | ')} |`),
    '',
  ].join('\n');
}

function detectCategory(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  if (/(security|audit|guard|score|verification)/.test(text)) return 'Security & Audit';
  if (/(github|git|react|debug|review|test|developer|code)/.test(text)) return 'Developer';
  if (/(search|research|arxiv|evidence|news)/.test(text)) return 'Search & Research';
  if (/(document|excel|word|pdf|ppt|presentation|docx)/.test(text)) return 'Office Documents';
  if (/(slack|feishu|discord|calendar|workspace|integration|productivity)/.test(text)) return 'Productivity & Workspace';
  if (/(twitter|x |marketing|seo|content|social)/.test(text)) return 'Social & Growth';
  if (/(plugin|distribution|workflow|automation|agent)/.test(text)) return 'Browser & Automation';
  if (/(audio|voice|image|video|spectrogram|media)/.test(text)) return 'Media Generation';
  return 'General Utility';
}

function inferApiFamily(category) {
  return {
    Developer: 'Developer Platform API',
    'Search & Research': 'Search API',
    'Productivity & Workspace': 'Workspace API',
    'Office Documents': 'Document Office API',
    'Social & Growth': 'Social API',
    'Browser & Automation': 'Workflow Automation API',
    'Security & Audit': 'Security Audit API',
    'Media Generation': 'Media Generation API',
    'General Utility': 'General Utility API',
  }[category];
}

function fitScore(category) {
  return {
    Developer: 95,
    'Search & Research': 96,
    'Productivity & Workspace': 93,
    'Office Documents': 92,
    'Social & Growth': 90,
    'Browser & Automation': 91,
    'Security & Audit': 89,
    'Media Generation': 88,
    'General Utility': 60,
  }[category];
}

function monetizationScore(category) {
  return {
    Developer: 95,
    'Search & Research': 94,
    'Productivity & Workspace': 93,
    'Office Documents': 92,
    'Social & Growth': 88,
    'Browser & Automation': 95,
    'Security & Audit': 94,
    'Media Generation': 90,
    'General Utility': 68,
  }[category];
}

function factoryScore(category) {
  return {
    Developer: 95,
    'Search & Research': 96,
    'Productivity & Workspace': 92,
    'Office Documents': 90,
    'Social & Growth': 92,
    'Browser & Automation': 92,
    'Security & Audit': 88,
    'Media Generation': 88,
    'General Utility': 65,
  }[category];
}

function targetTitle(category, name) {
  const lower = name.toLowerCase();
  if (lower.includes('plugin')) return 'Plugin Command Center';
  if (lower.includes('github')) return 'GitHub Command Center';
  if (/(twitter|xurl|bird)/.test(lower)) return 'Twitter API Command Center';
  if (/(document|ppt|excel|pdf)/.test(lower)) return 'Document Office Command Center';
  if (/(search|research)/.test(lower)) return 'Research Command Center';
  if (/(security|score|review)/.test(lower)) return 'Security Audit Command Center';
  return {
    Developer: 'Developer Command Center',
    'Search & Research': 'Research Command Center',
    'Productivity & Workspace': 'Workspace Command Center',
    'Office Documents': 'Document Office Command Center',
    'Social & Growth': 'Social Growth Command Center',
    'Browser & Automation': 'Automation Command Center',
    'Security & Audit': 'Security Audit Command Center',
    'Media Generation': 'Media Generation Command Center',
    'General Utility': 'Utility Command Center',
  }[category];
}

async function fetchText(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; skillGet/1.0; +https://agentskills.so/)',
          accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`${url} -> ${response.status}`);
      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < 4) await new Promise((resolveDelay) => setTimeout(resolveDelay, 1500 * (attempt + 1)));
    }
  }
  throw lastError;
}

function capture(text, pattern) {
  const match = text.match(pattern);
  return match ? compactSpaces(match[1]) : null;
}

function extractMetaDescription(html) {
  const match = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
  return match ? compactSpaces(match[1]) : null;
}

function formatZhDatasetDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatEnDatasetDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function captureLabelValueFromHtml(html, label) {
  const escapedLabel = escapeRegex(label);
  const labelPattern = escapedLabel.replace(/\\&/g, '(?:&|&amp;)');
  const pattern = new RegExp(`${labelPattern}[\\s\\S]{0,2400}?>([0-9.,KMB]+)(?:<|\\s)`, 'i');
  const match = html.match(pattern);
  return match ? compactSpaces(match[1]) : null;
}

function captureFractionScore(text, label) {
  const pattern = new RegExp(`${escapeRegex(label)}[\\s\\S]{0,320}?([0-5])\\s*\\/\\s*5`, 'i');
  const match = text.match(pattern);
  return match ? Number(match[1]) : 0;
}

function captureEscapedString(html, key) {
  const marker = `${key}\\":\\"`;
  const start = html.indexOf(marker);
  if (start < 0) return null;

  const objectStart = html.indexOf('{', start + marker.length);
  if (objectStart < 0) return null;

  let value = '';
  let depth = 0;
  for (let index = objectStart; index < html.length; index += 1) {
    const char = html[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    value += char;
    if (depth === 0) return value;
  }

  return null;
}

function captureFractionScoreFromHtml(html, label) {
  const escapedLabel = escapeRegex(label);
  const labelPattern = escapedLabel.replace(/\\&/g, '(?:&|&amp;)');
  const pattern = new RegExp(`${labelPattern}[\\s\\S]{0,2400}?>([0-5])(?:<!--\\s*-->|\\s)*\\/(?:<!--\\s*-->|\\s)*5(?:<|\\s)`, 'i');
  const match = html.match(pattern);
  return match ? Number(match[1]) : 0;
}

function parseInstalledOnDistribution(html) {
  const anchoredMatch = html.match(/installedOnDistribution\\":\\"(\{[\s\S]*?\})\\",\\"t\\":\{\\"title\\":\\"Agent Distribution\\"/i);
  const raw = anchoredMatch?.[1] ?? captureEscapedString(html, 'installedOnDistribution');
  if (!raw) return {};
  try {
    return JSON.parse(raw.replace(/\\\\\"/g, '"'));
  } catch {
    try {
      return JSON.parse(raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    } catch {
      return {};
    }
  }
}

function parseListingPage(html) {
  const items = [];
  for (const match of html.matchAll(/<a[^>]+href="(\/skills\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = match[1];
    if (href === '/skills/search' || href === '/skills/categories') continue;
    if (!/^\/skills\/[^/]+$/.test(href)) continue;
    const text = stripHtml(match[2]);
    if (!text || !/@\s*[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/.test(text)) continue;
    const parsed =
      text.match(/^(.*?)\s+([0-9][0-9.,]*[KMB]?)\s+@\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\s+([\s\S]+)$/i) ??
      text.match(/^(.*?)\s+@\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\s+([\s\S]+)$/i);
    if (!parsed) continue;
    const slug = href.split('/').at(-1);
    if (parsed.length === 5) {
      items.push({
        href,
        slug,
        name: compactSpaces(parsed[1]),
        weeklyDownloads: normalizeMetricNumber(parsed[2]),
        repo: compactSpaces(parsed[3]),
        description: compactSpaces(parsed[4]),
      });
    } else {
      items.push({
        href,
        slug,
        name: compactSpaces(parsed[1]),
        weeklyDownloads: 0,
        repo: compactSpaces(parsed[2]),
        description: compactSpaces(parsed[3]),
      });
    }
  }
  return uniqueBy(items, (item) => item.href);
}

function parseDetailPage(html, listingItem) {
  const text = stripHtml(html);
  const name = capture(html, /<h1[^>]*>([^<]+)<\/h1>/i) ?? listingItem.name;
  const description = extractMetaDescription(html) ?? listingItem.description;
  const repo = capture(text, /Author\s+:?\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i) ?? listingItem.repo;
  const owner = repo.split('/')[0] ?? 'unknown';
  const trustIdentityScore = captureFractionScoreFromHtml(html, 'Trust & Identity') || Number(capture(text, /Trust & Identity\s+([0-5])\s*\/\s*5/i) ?? captureFractionScore(text, 'Trust & Identity') ?? 0);
  const behavioralMonitoringScore =
    captureFractionScoreFromHtml(html, 'Behavioral Monitoring') || Number(capture(text, /Behavioral Monitoring\s+([0-5])\s*\/\s*5/i) ?? captureFractionScore(text, 'Behavioral Monitoring') ?? 0);
  const vulnerabilityExposureScore =
    captureFractionScoreFromHtml(html, 'Vulnerability Exposure') || Number(capture(text, /Vulnerability Exposure\s+([0-5])\s*\/\s*5/i) ?? captureFractionScore(text, 'Vulnerability Exposure') ?? 0);
  const installedOnDistribution = parseInstalledOnDistribution(html);
  const platformCoverageCount = Object.keys(installedOnDistribution).length;
  const totalDistributionInstalls = Object.values(installedOnDistribution).reduce((total, value) => total + normalizeMetricNumber(String(value)), 0);
  return {
    ...listingItem,
    name,
    description,
    repo,
    owner,
    createdAt: capture(text, /Created At\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4}|\d{1,2}-[A-Za-z]{3}-\d{2})/i),
    weeklyDownloads: normalizeMetricNumber(captureLabelValueFromHtml(html, 'Weekly Downloads') ?? capture(text, /Weekly Downloads\s+([0-9.,KMB]+)/i) ?? String(listingItem.weeklyDownloads)),
    githubStars: normalizeMetricNumber(captureLabelValueFromHtml(html, 'Stars') ?? capture(text, /Stars\s+:?\s*([0-9.,KMB]+)/i) ?? '0'),
    trustIdentityScore,
    behavioralMonitoringScore,
    vulnerabilityExposureScore,
    installedOnDistribution,
    platformCoverageCount,
    totalDistributionInstalls,
    securitySignalsResolved: [trustIdentityScore, behavioralMonitoringScore, vulnerabilityExposureScore].some((value) => value > 0),
  };
}

function decorateItem(item) {
  const category = detectCategory(item.name, item.description);
  const securityScore = item.securitySignalsResolved
    ? Number((((item.trustIdentityScore + item.behavioralMonitoringScore + (5 - item.vulnerabilityExposureScore)) / 15) * 100).toFixed(1))
    : 0;
  const momentum = Math.min(100, Math.log10(item.weeklyDownloads + 10) * 28 + Math.log10(item.githubStars + 10) * 20);
  const platformCoverageScore = Math.min(100, item.platformCoverageCount * 14 + Math.log10(item.totalDistributionInstalls + 10) * 10);
  const aisaOpportunityScore = Number(
    (
      fitScore(category) * 0.35 +
      monetizationScore(category) * 0.2 +
      factoryScore(category) * 0.15 +
      securityScore * 0.1 +
      momentum * 0.15 +
      platformCoverageScore * 0.05
    ).toFixed(2)
  );
  return {
    ...item,
    category,
    apiFamily: inferApiFamily(category),
    targetTitle: targetTitle(category, item.name),
    securityScore,
    platformCoverageScore,
    aisaOpportunityScore,
  };
}

function buildTopAuthors(items) {
  const authors = new Map();
  for (const item of items) {
    const current = authors.get(item.owner) ?? {
      owner: item.owner,
      skillCount: 0,
      totalWeeklyDownloads: 0,
      totalGithubStars: 0,
      totalSecurityScore: 0,
      categories: [],
    };
    current.skillCount += 1;
    current.totalWeeklyDownloads += item.weeklyDownloads;
    current.totalGithubStars += item.githubStars;
    current.totalSecurityScore += item.securityScore;
    current.categories.push(item.category);
    authors.set(item.owner, current);
  }
  return [...authors.values()]
    .map((item) => ({
      owner: item.owner,
      skillCount: item.skillCount,
      totalWeeklyDownloads: item.totalWeeklyDownloads,
      totalGithubStars: item.totalGithubStars,
      avgSecurityScore: Number((item.totalSecurityScore / Math.max(item.skillCount, 1)).toFixed(1)),
      primaryCategories: countBy(item.categories.map((name) => ({ name })), (entry) => entry.name, 3).map((entry) => entry.name),
    }))
    .sort((a, b) => b.totalWeeklyDownloads - a.totalWeeklyDownloads || b.totalGithubStars - a.totalGithubStars)
    .slice(0, 15);
}

function buildRankingFactors(items) {
  const resolvedSecurityItems = items.filter((item) => item.securitySignalsResolved);
  const avgSecurity = resolvedSecurityItems.length ? sumBy(resolvedSecurityItems, (item) => item.securityScore) / resolvedSecurityItems.length : 0;
  const avgPlatformCoverage = items.length ? sumBy(items, (item) => item.platformCoverageCount ?? 0) / items.length : 0;
  return [
    {
      factor: 'Weekly downloads',
      importance: 'Very high',
      evidence: `Sampled total ${sumBy(items, (item) => item.weeklyDownloads).toLocaleString()} weekly downloads`,
      whyItMatters: 'The site surfaces weekly demand directly in cards and detail pages.',
    },
    {
      factor: 'GitHub stars',
      importance: 'High',
      evidence: `Sampled total ${sumBy(items, (item) => item.githubStars).toLocaleString()} repo stars`,
      whyItMatters: 'Repo trust is the strongest cross-platform cold-start asset.',
    },
    {
      factor: 'Security posture',
      importance: 'High',
      evidence: resolvedSecurityItems.length
        ? `Resolved security breakdown for ${resolvedSecurityItems.length}/${items.length} items, average ${avgSecurity.toFixed(1)}/100`
        : 'Security breakdown did not render consistently across the sampled pages, so security is treated as a partial signal.',
      whyItMatters: 'Trust & Identity, Behavioral Monitoring, and Vulnerability Exposure are explicit review surfaces.',
    },
    {
      factor: 'Category / use-case fit',
      importance: 'Very high',
      evidence: `${countBy(items, (item) => item.category, 5)
        .map((item) => `${item.name} ${item.count}`)
        .join('; ')}`,
      whyItMatters: 'The strongest skills describe a single job-to-be-done in plain language.',
    },
    {
      factor: 'Distribution / platform coverage',
      importance: 'Medium',
      evidence: `Average sampled platform coverage ${avgPlatformCoverage.toFixed(1)} distributions`,
      whyItMatters: 'Visible installation across multiple agent distributions reinforces portability and trust.',
    },
    {
      factor: 'Author factory effect',
      importance: 'Medium',
      evidence: `${buildTopAuthors(items)
        .slice(0, 3)
        .map((item) => `${item.owner} ${item.skillCount}`)
        .join('; ')}`,
      whyItMatters: 'Multi-skill repo owners compound trust and discovery over time.',
    },
  ];
}

function buildZhReport(report, datasetDate) {
  const skillRows = report.skills.topByOpportunity.slice(0, 15).map((item, index) => ({
    排名: index + 1,
    Skill: item.name,
    Repo: item.repo,
    类目: item.category,
    周下载: item.weeklyDownloads,
    GitHubStars: item.githubStars,
    安全分: item.securityScore,
    覆盖平台: item.platformCoverageCount,
    AISA机会分: item.aisaOpportunityScore,
  }));
  const authorRows = report.authors.topAuthors.slice(0, 12).map((item, index) => ({
    排名: index + 1,
    作者: item.owner,
    样本技能数: item.skillCount,
    周下载总和: item.totalWeeklyDownloads,
    GitHubStars总和: item.totalGithubStars,
    平均安全分: item.avgSecurityScore,
  }));
  const factorRows = report.rankingFactors.map((item) => ({
    指标: item.factor,
    重要性: item.importance,
    观察证据: item.evidence,
    为什么重要: item.whyItMatters,
  }));

  return `# AgentSkills.so 爆款报告

- 生成时间：${report.generatedAt}
- 数据日期：${formatZhDatasetDate(datasetDate)}
- 采样范围：首页分页 + skills/search 分页 + 技能详情页

## 一句话结论

AgentSkills.so 更强调“技能本身作为可复用资产”的商品化表达。周下载、GitHub Stars、安全信号、distribution 覆盖和任务边界清晰度共同决定排名潜力。最适合 AISA 的依然是高频外部系统边界和可复用工作流。

## 重要排名因素

${markdownTable(factorRows)}
## 排名机制

- AgentSkills.so 把 "Weekly Downloads" 放到了非常显眼的位置，因此需求强度会直接左右第一印象。
- 详情页里的 "Trust & Identity"、"Behavioral Monitoring"、"Vulnerability Exposure" 已经成为公开信任表面，不再只是安全附录。
- GitHub repo 和星标是冷启动最强证明，尤其适合解释“为什么这个 skill 值得装”。
- "Agent Distribution" 覆盖会放大跨平台可移植性的感知，适合做通用 API 和工作流商品。

## 爆款机制

- 周下载高的 skill，几乎都把任务边界写得很窄很清楚，而不是泛泛谈“提升效率”。
- repo 信任 + 安全姿态 + distribution 覆盖，比单个华丽标题更能支撑长期转化。
- 同一作者持续发布同一主线 skill，会更快积累搜索与收藏复利。
- 适合 AISA 的，仍然是外部系统边界清晰、可重复调用、可跨 agent 复用的技能面。

## 发布动作

- 标题先写动作，再写对象，再写结果，不要先写抽象愿景。
- 正文和 README 要说明依赖的外部系统、权限边界、持久化方式和典型输出。
- 如果 skill 可以跨 distribution 复用，就把这种可移植性写清楚，帮助用户理解“不是只能在一个宿主里用”。
- 安全姿态要具体：读什么、写什么、联网做什么、默认会不会落盘，都要写明白。

## 常见失分项

- 标题过泛，像内部助手而不是可复用商品。
- repo 与页面承诺不一致，或者技能范围大到让人无法判断风险。
- 安全姿态和持久化行为写得含糊，导致用户不敢装。
- 明明是单宿主技能，却把自己包装成跨平台万能组件。
## 爆款技能样本

${markdownTable(skillRows)}
## 高产作者画像

${markdownTable(authorRows)}
## 爆款共同点

- 技能名和描述非常贴近具体任务，而不是抽象能力。
- 高周下载技能通常也有强 repo 信任和更清晰的边界。
- 安全分高的技能更适合长期转化和企业采纳。
- 高产作者往往复用同一仓库或同一能力主线，形成稳定的发现入口。

## AISA API 在 AgentSkills.so 的打法

1. 优先做 Developer、Research、Documents、Workspace、Automation 五类。
2. 标题优先写“要完成的动作”，正文写“输入是什么、输出是什么”。
3. 尽量把技能依赖的外部系统讲清楚，让它更像一个可复用 API 包。
4. 对安全性、权限边界、输出稳定性要写得更明确，利于长期上榜。
`;
}

function buildEnReport(report, datasetDate) {
  const skillRows = report.skills.topByOpportunity.slice(0, 15).map((item, index) => ({
    Rank: index + 1,
    Skill: item.name,
    Repo: item.repo,
    Category: item.category,
    WeeklyDownloads: item.weeklyDownloads,
    Stars: item.githubStars,
    Security: item.securityScore,
    Platforms: item.platformCoverageCount,
    Opportunity: item.aisaOpportunityScore,
  }));

  return `# AgentSkills.so Breakout Report

- Generated at: ${report.generatedAt}
- Dataset date: ${formatEnDatasetDate(datasetDate)}
- Scope: paginated homepage listings, paginated search listings, and corresponding detail pages

## Executive Summary

AgentSkills.so behaves like a reusable skill catalog where weekly downloads, repo trust, security posture, distribution coverage, and scope clarity work together. The best AISA candidates are still practical external-system workflows that can be turned into portable command centers.

## Ranking Signals

${markdownTable(
    report.rankingFactors.map((item) => ({
      Factor: item.factor,
      Importance: item.importance,
      Evidence: item.evidence,
      Impact: item.whyItMatters,
    })),
  )}
## Ranking Mechanics

- AgentSkills.so makes weekly downloads a very visible demand signal, so perceived demand strongly shapes first-click behavior.
- "Trust & Identity", "Behavioral Monitoring", and "Vulnerability Exposure" are public trust surfaces, not hidden security metadata.
- GitHub repo trust and stars remain the strongest cold-start proof for why a skill deserves installation.
- Distribution coverage reinforces portability, which makes a skill feel more reusable across agent runtimes.

## Breakout Mechanics

- High-download skills usually describe one narrow job-to-be-done instead of vague productivity promises.
- Repo trust, security posture, and distribution coverage together sustain conversion better than branding alone.
- Authors who keep publishing inside one lane accumulate trust faster than broad generalists.
- The best AISA candidates remain reusable external-system workflows that can travel across agents.

## Publish Moves

- Lead with an action, target object, and result in the title.
- Use the body and README to explain external dependencies, permission boundaries, persistence, and typical outputs.
- If the skill is portable across distributions, make that portability explicit.
- Be concrete about security posture: reads, writes, network calls, and local persistence should all be stated clearly.

## Common Failure Modes

- Titles that feel like internal helpers instead of reusable products.
- Repo proof that does not match the page promise.
- Ambiguous security or persistence language that increases install doubt.
- Packaging a single-host workflow as if it were a universal multi-agent component.
## Best Opportunities

${markdownTable(skillRows)}
`;
}

async function buildReport() {
  const datasetDate = new Date();
  const listHtmls = (
    await Promise.allSettled(
      LIST_URLS.map(async (url) => ({
        url,
        html: await fetchText(url),
      })),
    )
  )
    .filter((item) => item.status === 'fulfilled')
    .map((item) => item.value);

  const listingItems = uniqueBy(listHtmls.flatMap((entry) => parseListingPage(entry.html)), (item) => item.href).slice(0, 96);
  const limit = pLimit(4);
  const detailResults = await Promise.allSettled(
    listingItems.map((item) =>
      limit(async () => {
        const detailHtml = await fetchText(new URL(item.href, BASE_URL).toString());
        return parseDetailPage(detailHtml, item);
      }),
    ),
  );

  const items = sortByNumber(
    detailResults
      .filter((item) => item.status === 'fulfilled')
      .map((item) => decorateItem(item.value)),
    (item) => item.aisaOpportunityScore,
  );
  const topAuthors = buildTopAuthors(items);
  const rankingFactors = buildRankingFactors(items);

  const report = {
    generatedAt: new Date().toISOString(),
    sources: {
      listings: LIST_URLS,
    },
    sampleNotes: {
      pagesFetched: listHtmls.map((item) => item.url),
      listingCount: listingItems.length,
      detailCount: items.length,
    },
    summary: {
      sampledSkills: items.length,
      sampledAuthors: new Set(items.map((item) => item.owner)).size,
      totalWeeklyDownloads: sumBy(items, (item) => item.weeklyDownloads),
      totalGithubStars: sumBy(items, (item) => item.githubStars),
      avgPlatformCoverage: items.length ? Number((sumBy(items, (item) => item.platformCoverageCount ?? 0) / items.length).toFixed(1)) : 0,
      resolvedSecuritySamples: items.filter((item) => item.securitySignalsResolved).length,
      avgSecurityScore: items.filter((item) => item.securitySignalsResolved).length
        ? Number(
            (
              sumBy(
                items.filter((item) => item.securitySignalsResolved),
                (item) => item.securityScore,
              ) / items.filter((item) => item.securitySignalsResolved).length
            ).toFixed(1),
          )
        : 0,
      topCategory: countBy(items, (item) => item.category, 1)[0]?.name ?? null,
    },
    rankingFactors,
    skills: {
      items,
      topByOpportunity: items.slice(0, 20),
      topByWeeklyDownloads: sortByNumber(items, (item) => item.weeklyDownloads).slice(0, 20),
      topByGithubStars: sortByNumber(items, (item) => item.githubStars).slice(0, 20),
      topBySecurity: sortByNumber(items, (item) => item.securityScore).slice(0, 20),
      topByPlatformCoverage: sortByNumber(items, (item) => item.platformCoverageCount ?? 0).slice(0, 20),
      topCategories: countBy(items, (item) => item.category, 12),
      commonPatterns: [
        '高周下载技能都非常强调任务边界和直接产出。',
        '强 repo 信任和清晰描述会显著提升冷启动效率。',
        '安全信号完整的技能更适合长期复用和企业采纳。',
      ],
    },
    authors: {
      topAuthors,
    },
  };

  const zhReport = buildZhReport(report, datasetDate);
  const enReport = buildEnReport(report, datasetDate);
  for (const output of [OUTPUT_PATH, REPORT_ZH_PATH, REPORT_ZH_PUBLIC_PATH, REPORT_EN_PATH, REPORT_EN_PUBLIC_PATH]) {
    await mkdir(dirname(output), { recursive: true });
  }
  await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(REPORT_ZH_PATH, `${zhReport}\n`, 'utf8');
  await writeFile(REPORT_ZH_PUBLIC_PATH, `${zhReport}\n`, 'utf8');
  await writeFile(REPORT_EN_PATH, `${enReport}\n`, 'utf8');
  await writeFile(REPORT_EN_PUBLIC_PATH, `${enReport}\n`, 'utf8');
  syncMarkdownDocx(ROOT, [REPORT_ZH_PATH, REPORT_ZH_PUBLIC_PATH, REPORT_EN_PATH, REPORT_EN_PUBLIC_PATH]);
}

buildReport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
