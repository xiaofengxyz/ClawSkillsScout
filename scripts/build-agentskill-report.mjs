import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import fetch from 'node-fetch';
import pLimit from 'p-limit';

const ROOT = process.cwd();
const OUTPUT_PATH = resolve(ROOT, 'public/data/agentskill-report.json');
const REPORT_ZH_PATH = resolve(ROOT, 'reports/AgentSkill_Report_ZH.md');
const REPORT_ZH_PUBLIC_PATH = resolve(ROOT, 'public/reports/AgentSkill_Report_ZH.md');
const REPORT_EN_PATH = resolve(ROOT, 'reports/AgentSkill_Report_EN.md');
const REPORT_EN_PUBLIC_PATH = resolve(ROOT, 'public/reports/AgentSkill_Report_EN.md');

const SITE_URL = 'https://agentskill.sh/';
const PLUGINS_URL = 'https://agentskill.sh/plugins';
const PLUGIN_PAGE_URLS = Array.from({ length: 4 }, (_, index) => (index === 0 ? PLUGINS_URL : `${PLUGINS_URL}?page=${index + 1}`));

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
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#x27;/g, "'"),
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
  if (/(security|audit|guard|risk|compliance)/.test(text)) return 'Security & Audit';
  if (/(github|git|pull request|repo|debug|test|review|code|ci|devops|developer)/.test(text)) return 'Developer';
  if (/(twitter|x |tweet|social|marketing|seo|growth|content)/.test(text)) return 'Social & Growth';
  if (/(search|research|news|arxiv|wiki|evidence)/.test(text)) return 'Search & Research';
  if (/(notion|slack|feishu|drive|workspace|calendar|email|docs)/.test(text)) return 'Productivity & Workspace';
  if (/(excel|word|powerpoint|ppt|pdf|document|docx|spreadsheet)/.test(text)) return 'Office Documents';
  if (/(browser|automation|workflow|agent|sub-agent|orchestration|mcp)/.test(text)) return 'Browser & Automation';
  if (/(image|video|audio|voice|tts|media)/.test(text)) return 'Media Generation';
  return 'General Utility';
}

function inferApiFamily(category) {
  return {
    Developer: 'Developer Platform API',
    'Search & Research': 'Search API',
    'Productivity & Workspace': 'Workspace API',
    'Office Documents': 'Document Office API',
    'Social & Growth': 'Social API',
    'Browser & Automation': 'Browser Automation API',
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
  if (lower.includes('github')) return 'GitHub Command Center';
  if (/(twitter|tweet|xurl|social)/.test(lower)) return 'Twitter API Command Center';
  if (/(feishu|workspace|calendar|drive|slack|notion)/.test(lower)) return 'Workspace Command Center';
  if (/(excel|word|powerpoint|pdf|document)/.test(lower)) return 'Document Office Command Center';
  if (/(search|research|arxiv|evidence)/.test(lower)) return 'Research Command Center';
  if (/(security|audit|guard)/.test(lower)) return 'Security Audit Command Center';
  if (/(browser|workflow|automation|agent)/.test(lower)) return 'Automation Command Center';
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
          'user-agent': 'Mozilla/5.0 (compatible; skillGet/1.0; +https://agentskill.sh/)',
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
      if (attempt < 4) await new Promise((resolveDelay) => setTimeout(resolveDelay, 1200 * (attempt + 1)));
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

function captureMetricFromHtml(html, label) {
  const escapedLabel = escapeRegex(label);
  const pattern = new RegExp(`${escapedLabel}[\\s\\S]{0,320}?>([0-9.,KMB]+)(?:<|\\s)`, 'i');
  const match = html.match(pattern);
  return match ? compactSpaces(match[1]) : null;
}

function parseSkillListingCards(html) {
  const cards = [];
  for (const match of html.matchAll(/<a[^>]+href="(\/@[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = match[1];
    const innerHtml = match[2];
    if (!/^\/@[^/]+\/[^/]+$/.test(href)) continue;
    const [owner, slug] = href.slice(2).split('/');
    const text = stripHtml(innerHtml);
    const headerText = compactSpaces(text.replace(new RegExp(`^${escapeRegex(owner)}\\s*\\/\\s*${escapeRegex(slug)}`, 'i'), ''));
    const headerMetrics = headerText.match(/^(.*?)\s+([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}|Routes|Facilitates|Automates|Manages|Enables|Provides|Creates|Builds|Helps|Supports|Researches|Reviews|Writes|Analyzes|Generates)/i);
    const metricArea = compactSpaces(headerMetrics?.[1] ?? headerText);
    const metricTokens = metricArea.split(' ').filter(Boolean);
    const listedInstallsToken = metricTokens.find((token) => /[KMB]$/i.test(token));
    const versionToken = metricTokens.find((token) => /^\d+\.\d+(?:\.\d+)?$/.test(token)) ?? null;
    const listedReviewCountToken =
      metricTokens.find((token) => /^\d+$/.test(token) && token !== '100' && token !== '99' && token !== '83' && token !== '75') ?? null;
    cards.push({
      href,
      owner,
      slug,
      listingText: text,
      version: versionToken,
      listedReviewCount: Number(listedReviewCountToken ?? 0),
      listedInstalls: normalizeMetricNumber(listedInstallsToken ?? '0'),
      qualityScore: Number(capture(text, /(\d+)\s+Quality Score/i) ?? 0),
      qualityLabel: capture(text, /Quality Score\s+([A-Za-z ]+?)\s+·/i),
      qualityDate: capture(text, /Quality Score\s+[A-Za-z ]+?\s+·\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i),
      discoveryScore: Number(capture(text, /Discovery\s+(\d+)/i) ?? 0),
      implementationScore: Number(capture(text, /Implementation\s+(\d+)/i) ?? 0),
      structureScore: Number(capture(text, /Structure\s+(\d+)/i) ?? 0),
      expertiseScore: Number(capture(text, /Expertise\s+(\d+)/i) ?? 0),
      qualityPattern: capture(text, /Expertise\s+\d+\s+(.+?)\s+Read full quality review/i),
      securityScore: Number(capture(text, /(\d+)\s+Security Score/i) ?? 0),
      securityDate: capture(text, /Security Score\s+Audited on\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i),
      securityIssues: capture(text, /Security Score[\s\S]*?\/100\s+(.+?)\s+Read full security audit/i),
    });
  }
  return uniqueBy(cards, (item) => item.href);
}

function parsePluginListing(html) {
  const matches = [...html.matchAll(/<a[^>]+href="(\/plugins\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  const cards = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const href = match[1];
    if (!/^\/plugins\/[^/]+\/[^/]+$/.test(href)) continue;
    const nextIndex = matches[index + 1]?.index ?? html.indexOf('#### How To');
    const block = stripHtml(html.slice(match.index, nextIndex > match.index ? nextIndex : undefined));
    const [, owner, slug] = href.match(/^\/plugins\/([^/]+)\/([^/]+)$/);
    const metricTokens = [...block.matchAll(/\b\d[\d,]*(?:\.\d+)?K?\b/g)].map((entry) => entry[0]);
    const versionMatch = block.match(/\bv\d+(?:\.\d+)+\b/);
    const version = versionMatch?.[0] ?? null;
    const category = capture(block, /\b([a-z][a-z-]+)\s+v\d+(?:\.\d+)+\b/i);
    let description = block;
    description = description.replace(new RegExp(`^${owner}\\s+`, 'i'), '');
    description = description.replace(new RegExp(`^${slug.replace(/-/g, '[- ]?')}\\s+`, 'i'), '');
    if (metricTokens[0]) description = description.replace(metricTokens[0], '');
    if (metricTokens[1]) description = description.replace(metricTokens[1], '');
    if (category && version) description = description.replace(`${category} ${version}`, '');
    if (version) description = description.replace(version, '');
    description = compactSpaces(description)
      .replace(new RegExp(`^${slug.replace(/-/g, ' ')}\\s*`, 'i'), '')
      .replace(new RegExp(`^${owner}\\s*`, 'i'), '');
    cards.push({
      href,
      owner,
      slug,
      name: slug,
      listedSkillCount: normalizeMetricNumber(metricTokens[0] ?? '0'),
      listedGithubStars: normalizeMetricNumber(metricTokens[1] ?? '0'),
      categoryLabel: category,
      version,
      description,
      listingText: block,
    });
  }
  return uniqueBy(cards, (item) => item.href).slice(0, 24);
}

function parseSkillDetail(html, listingCard) {
  const text = stripHtml(html);
  const title = capture(html, /<h1[^>]*>([^<]+)<\/h1>/i) ?? listingCard.slug;
  const description = extractMetaDescription(html) ?? capture(text, new RegExp(`${title}\\s+(.+?)\\s+Install this skill`, 'i')) ?? listingCard.listingText;
  const tagsBlock = capture(text, /Updated [A-Za-z]+\s+\d{1,2},\s+\d{4}\s+(.+?)\s+[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\s+github\.com/i);
  const tags = tagsBlock
    ? tagsBlock
        .split(' ')
        .map((item) => compactSpaces(item))
        .filter((item) => item && item !== listingCard.owner && item !== title)
        .slice(0, 16)
    : [];
  return {
    ...listingCard,
    name: title,
    description,
    installs: normalizeMetricNumber(captureMetricFromHtml(html, 'Installs') ?? capture(text, /Installs\s+([0-9.,KMB]+)/i) ?? String(listingCard.listedInstalls ?? 0)),
    githubStars: normalizeMetricNumber(captureMetricFromHtml(html, 'GitHub Stars') ?? capture(text, /GitHub Stars\s+([0-9.,KMB]+)/i) ?? '0'),
    rating: Number(captureMetricFromHtml(html, 'Rating') ?? capture(text, /Rating\s+([0-9.]+)/i) ?? 0),
    reviewCount: Number(capture(text, /Rating\s+[0-9.]+\s+([0-9]+)/i) ?? listingCard.listedReviewCount ?? 0),
    categoryLabel: capture(text, /Category\s+([A-Za-z -]+)/i),
    updatedDate: capture(text, /Updated ([A-Za-z]+\s+\d{1,2},\s+\d{4})/i),
    repo: capture(text, /([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\s+github\.com/i),
    fileCount: Number(capture(text, /\b(\d+)\s+files?\b/i) ?? 0),
    installApiUrl: capture(text, /(https:\/\/agentskill\.sh\/api\/agent\/skills\/[^\s]+)/i),
    tags,
  };
}

function decorateSkill(item) {
  const category = detectCategory(item.name, `${item.description} ${item.tags.join(' ')}`);
  const qualityBlend =
    item.qualityScore * 0.4 +
    item.securityScore * 0.25 +
    item.rating * 10 * 0.1 +
    Math.min(100, Math.log10(item.installs + 10) * 28 + Math.log10(item.githubStars + 10) * 18) * 0.25;
  const aisaOpportunityScore = Number(
    (
      fitScore(category) * 0.35 +
      monetizationScore(category) * 0.2 +
      factoryScore(category) * 0.15 +
      qualityBlend * 0.3
    ).toFixed(2)
  );
  return {
    ...item,
    category,
    apiFamily: inferApiFamily(category),
    targetTitle: targetTitle(category, item.name),
    aisaOpportunityScore,
  };
}

function parseOwnerSkillLinks(html, owner) {
  return uniqueBy(
    [...html.matchAll(new RegExp(`href="(\\/@${escapeRegex(owner)}\\/[^"]+)"`, 'g'))].map((match) => ({
      href: match[1],
      owner,
      slug: match[1].split('/').at(-1),
    })),
    (item) => item.href,
  );
}

function decoratePlugin(item) {
  const category = detectCategory(item.name, item.description);
  const momentum = Math.min(100, Math.log10(item.listedSkillCount + 10) * 30 + Math.log10(item.listedGithubStars + 10) * 25);
  return {
    ...item,
    category,
    apiFamily: inferApiFamily(category),
    targetTitle: targetTitle(category, item.name),
    aisaOpportunityScore: Number((fitScore(category) * 0.4 + monetizationScore(category) * 0.2 + factoryScore(category) * 0.15 + momentum * 0.25).toFixed(2)),
  };
}

function buildTopCreators(skills, plugins) {
  const creators = new Map();
  for (const skill of skills) {
    const current = creators.get(skill.owner) ?? {
      owner: skill.owner,
      sampledSkills: 0,
      sampledPlugins: 0,
      totalInstalls: 0,
      totalGithubStars: 0,
      avgQualityScore: 0,
      avgSecurityScore: 0,
      categories: [],
    };
    current.sampledSkills += 1;
    current.totalInstalls += skill.installs;
    current.totalGithubStars += skill.githubStars;
    current.avgQualityScore += skill.qualityScore;
    current.avgSecurityScore += skill.securityScore;
    current.categories.push(skill.category);
    creators.set(skill.owner, current);
  }
  for (const plugin of plugins) {
    const current = creators.get(plugin.owner) ?? {
      owner: plugin.owner,
      sampledSkills: 0,
      sampledPlugins: 0,
      totalInstalls: 0,
      totalGithubStars: 0,
      avgQualityScore: 0,
      avgSecurityScore: 0,
      categories: [],
    };
    current.sampledPlugins += 1;
    current.totalGithubStars += plugin.listedGithubStars;
    current.categories.push(plugin.category);
    creators.set(plugin.owner, current);
  }

  return [...creators.values()]
    .map((item) => ({
      owner: item.owner,
      sampledSkills: item.sampledSkills,
      sampledPlugins: item.sampledPlugins,
      totalInstalls: item.totalInstalls,
      totalGithubStars: item.totalGithubStars,
      avgQualityScore: item.sampledSkills ? Number((item.avgQualityScore / item.sampledSkills).toFixed(1)) : 0,
      avgSecurityScore: item.sampledSkills ? Number((item.avgSecurityScore / item.sampledSkills).toFixed(1)) : 0,
      primaryCategories: countBy(item.categories.map((name) => ({ name })), (entry) => entry.name, 3).map((entry) => entry.name),
    }))
    .sort((a, b) => b.totalInstalls - a.totalInstalls || b.totalGithubStars - a.totalGithubStars)
    .slice(0, 15);
}

function buildRankingFactors(skills, plugins) {
  const avgQuality = skills.length ? sumBy(skills, (item) => item.qualityScore) / skills.length : 0;
  const avgSecurity = skills.length ? sumBy(skills, (item) => item.securityScore) / skills.length : 0;
  const avgRating = skills.length ? sumBy(skills, (item) => item.rating) / skills.length : 0;
  const avgPluginSkillCount = plugins.length ? sumBy(plugins, (item) => item.listedSkillCount) / plugins.length : 0;
  return [
    {
      factor: 'Installs / weekly usage',
      importance: 'Very high',
      evidence: `Sampled skills total ${sumBy(skills, (item) => item.installs).toLocaleString()} installs`,
      whyItMatters: 'Adoption is the clearest public trust signal on detail pages.',
    },
    {
      factor: 'GitHub stars / repo trust',
      importance: 'Very high',
      evidence: `Sampled skills total ${sumBy(skills, (item) => item.githubStars).toLocaleString()} GitHub stars`,
      whyItMatters: 'Repo reputation reduces cold-start doubt and helps installs convert.',
    },
    {
      factor: 'Quality score',
      importance: 'High',
      evidence: `Average sampled quality ${avgQuality.toFixed(1)}/100`,
      whyItMatters: 'Quality review is surfaced directly on listing cards before click-through.',
    },
    {
      factor: 'Security score',
      importance: 'High',
      evidence: `Average sampled security ${avgSecurity.toFixed(1)}/100`,
      whyItMatters: 'Security audit badges visibly change install confidence, especially for tool wrappers.',
    },
    {
      factor: 'Rating and reviews',
      importance: 'Medium',
      evidence: `Average sampled rating ${avgRating.toFixed(2)}`,
      whyItMatters: 'Ratings appear on detail pages and reinforce trust after discovery.',
    },
    {
      factor: 'Plugin breadth',
      importance: 'Medium',
      evidence: `Visible plugin sample averages ${avgPluginSkillCount.toFixed(1)} bundled skills`,
      whyItMatters: 'Large bundles dominate plugin visibility when they package many skills under one theme.',
    },
    {
      factor: 'Naming and category clarity',
      importance: 'Very high',
      evidence: `${countBy(skills, (item) => item.category, 5)
        .map((item) => `${item.name} ${item.count}`)
        .join('; ')}`,
      whyItMatters: 'Task-first titles and narrow categories make both cards and plugins easier to rank and install.',
    },
  ];
}

function buildZhReport(report, datasetDate) {
  const skillRows = report.skills.topByOpportunity.slice(0, 15).map((item, index) => ({
    排名: index + 1,
    Skill: item.name,
    Owner: item.owner,
    类目: item.category,
    安装: item.installs,
    质量分: item.qualityScore,
    安全分: item.securityScore,
    AISA机会分: item.aisaOpportunityScore,
  }));
  const pluginRows = report.plugins.topByOpportunity.slice(0, 12).map((item, index) => ({
    排名: index + 1,
    Plugin: item.slug,
    Owner: item.owner,
    类目: item.category,
    技能数: item.listedSkillCount,
    GitHubStars: item.listedGithubStars,
    AISA机会分: item.aisaOpportunityScore,
  }));
  const creatorRows = report.creators.topCreators.slice(0, 12).map((item, index) => ({
    排名: index + 1,
    Creator: item.owner,
    样本技能: item.sampledSkills,
    样本插件: item.sampledPlugins,
    总安装: item.totalInstalls,
    平均质量分: item.avgQualityScore,
    平均安全分: item.avgSecurityScore,
  }));
  const factorRows = report.rankingFactors.map((item) => ({
    指标: item.factor,
    重要性: item.importance,
    观察证据: item.evidence,
    为什么重要: item.whyItMatters,
  }));

  return `# AgentSkill 爆款报告

- 生成时间：${report.generatedAt}
- 数据日期：${formatZhDatasetDate(datasetDate)}
- 采样范围：agentskill.sh 首页技能卡片 + plugin 多页列表 + owner 展开页 + 对应详情页指标

## 一句话结论

AgentSkill 的榜单不是只看一个数字，而是“安装 / GitHub 信任 / 质量分 / 安全分 / 任务命名 / 包装完整度”一起决定点击与安装。能复制的是高频任务词、可信 repo、持续矩阵化生产；不容易复制的是历史 stars、先发品牌与重运营资产。

## 重要排名因素

${markdownTable(factorRows)}
## 爆款 Skill 样本

${markdownTable(skillRows)}
## 爆款 Plugin 样本

${markdownTable(pluginRows)}
## 高产作者画像

${markdownTable(creatorRows)}
## 爆款共同点

- Skill 名称大多直接写任务、平台、系统或工作流。
- 详情页里最有说服力的不是“功能多”，而是安装量、GitHub Stars、质量审查和安全审查一起给出的可信组合。
- 高产作者通常会围绕一条主线持续发多个 skill，而不是随机切题。
- 插件榜更偏爱“大而清晰”的合集包，但前提仍然是主题统一、描述具体、目标人群明确。

## 哪些方法能复制，哪些不能复制

能复制：

- 用高意图任务词命名
- 先做旗舰 skill，再拆窄变体
- 把 GitHub 仓库、示例输出、质量/安全信号前置
- 围绕一个主线连续生产，形成作者品牌

不容易直接复制：

- 仓库历史 stars 带来的先发红利
- 平台官方或强社区品牌的天然背书
- 需要长期维护的大型合集包运营能力

## AISA API 如何在 AgentSkill 做爆款

1. 先做 Developer、Search & Research、Workspace、Documents、Security 五条高价值主线。
2. Skill 页面一定要把任务、输入、输出和真实结果写清楚，让质量分与安全分更容易拉高。
3. 旗舰包负责占大词，窄 skill 负责承接细分搜索词。
4. 插件层优先做“统一主题 + 多 skill”而不是泛合集。

## 当前最值得改成 AISA API 的样本

- 技术研发：GitHub / Debug / Review / Issues / CI / PR 自动化
- 搜索研究：Research / Evidence / Wiki / 文档检索
- 办公协作：Feishu / Workspace / 文档处理 / 权限管理
- 安全治理：Audit / Guard / Verification / Review Scoring
- 成长与内容：X/Twitter、Marketing、SEO、GTM 自动化
`;
}

function buildEnReport(report, datasetDate) {
  const skillRows = report.skills.topByOpportunity.slice(0, 15).map((item, index) => ({
    Rank: index + 1,
    Skill: item.name,
    Owner: item.owner,
    Category: item.category,
    Installs: item.installs,
    Quality: item.qualityScore,
    Security: item.securityScore,
    Opportunity: item.aisaOpportunityScore,
  }));
  const pluginRows = report.plugins.topByOpportunity.slice(0, 12).map((item, index) => ({
    Rank: index + 1,
    Plugin: item.slug,
    Owner: item.owner,
    Category: item.category,
    Skills: item.listedSkillCount,
    Stars: item.listedGithubStars,
    Opportunity: item.aisaOpportunityScore,
  }));

  return `# AgentSkill Breakout Report

- Generated at: ${report.generatedAt}
- Dataset date: ${formatEnDatasetDate(datasetDate)}
- Scope: homepage skills, multi-page plugin listings, expanded owner pages, and corresponding detail-page metrics

## Executive Summary

AgentSkill ranking is not driven by a single vanity number. The visible surfaces combine installs, GitHub trust, quality score, security score, task clarity, and package completeness into one trust stack. The repeatable part is the publishing system: sharp task naming, repo-backed credibility, and consistent production in one lane.

## Highest-Value Signals

${markdownTable(
    report.rankingFactors.map((item) => ({
      Factor: item.factor,
      Importance: item.importance,
      Evidence: item.evidence,
      Impact: item.whyItMatters,
    })),
  )}
## Best Skill Opportunities

${markdownTable(skillRows)}
## Best Plugin Opportunities

${markdownTable(pluginRows)}
`;
}

async function buildReport() {
  const datasetDate = new Date();
  const skillsHtml = await fetchText(SITE_URL);
  const pluginHtmls = (
    await Promise.allSettled(
      PLUGIN_PAGE_URLS.map(async (url) => ({
        url,
        html: await fetchText(url),
      })),
    )
  )
    .filter((item) => item.status === 'fulfilled')
    .map((item) => item.value);
  const homepageSkillCards = parseSkillListingCards(skillsHtml);
  const pluginCards = uniqueBy(pluginHtmls.flatMap((item) => parsePluginListing(item.html)), (item) => item.href);
  const sampledOwners = uniqueBy(
    [...homepageSkillCards.map((item) => ({ owner: item.owner })), ...pluginCards.map((item) => ({ owner: item.owner }))],
    (item) => item.owner,
  ).map((item) => item.owner);

  const limit = pLimit(5);
  const ownerPages = (
    await Promise.allSettled(
      sampledOwners.map((owner) =>
        limit(async () => ({
          owner,
          html: await fetchText(new URL(`/@${owner}`, SITE_URL).toString()),
        })),
      ),
    )
  )
    .filter((item) => item.status === 'fulfilled')
    .map((item) => item.value);
  const ownerExpandedLinks = ownerPages.flatMap((item) => parseOwnerSkillLinks(item.html, item.owner));
  const ownerExpandedSkillCards = ownerPages.flatMap((item) => parseSkillListingCards(item.html));
  const ownerExpandedCardMap = new Map(ownerExpandedSkillCards.map((item) => [item.href, item]));
  const skillCards = uniqueBy(
    [
      ...homepageSkillCards,
      ...ownerExpandedLinks.map((item) => ownerExpandedCardMap.get(item.href) ?? { ...item, listingText: `${item.owner} / ${item.slug}`, listedInstalls: 0, listedReviewCount: 0, qualityScore: 0, securityScore: 0, discoveryScore: 0, implementationScore: 0, structureScore: 0, expertiseScore: 0, qualityLabel: null, qualityDate: null, qualityPattern: null, securityDate: null, securityIssues: null, version: null }),
    ],
    (item) => item.href,
  );
  const skillDetails = await Promise.allSettled(
    skillCards.map((item) =>
      limit(async () => {
        const detailHtml = await fetchText(new URL(item.href, SITE_URL).toString());
        return parseSkillDetail(detailHtml, item);
      }),
    ),
  );

  const skills = sortByNumber(
    skillDetails
      .filter((item) => item.status === 'fulfilled')
      .map((item) => decorateSkill(item.value)),
    (item) => item.aisaOpportunityScore,
  );
  const plugins = sortByNumber(pluginCards.map(decoratePlugin), (item) => item.aisaOpportunityScore);
  const topCreators = buildTopCreators(skills, plugins);
  const rankingFactors = buildRankingFactors(skills, plugins);

  const report = {
    generatedAt: new Date().toISOString(),
    sources: {
      skills: SITE_URL,
      plugins: PLUGIN_PAGE_URLS,
    },
    sampleNotes: {
      skills: `Captured ${homepageSkillCards.length} homepage skill cards, expanded ${ownerPages.length} owner pages into ${skillCards.length} unique skills, resolved ${skills.length} detail pages successfully.`,
      plugins: `Captured ${pluginCards.length} plugin cards across ${pluginHtmls.length} plugin pages.`,
    },
    summary: {
      sampledSkills: skills.length,
      sampledPlugins: plugins.length,
      sampledCreators: new Set([...skills.map((item) => item.owner), ...plugins.map((item) => item.owner)]).size,
      ownerPagesFetched: ownerPages.length,
      totalSkillInstalls: sumBy(skills, (item) => item.installs),
      totalSkillGithubStars: sumBy(skills, (item) => item.githubStars),
      avgQualityScore: skills.length ? Number((sumBy(skills, (item) => item.qualityScore) / skills.length).toFixed(1)) : 0,
      avgSecurityScore: skills.length ? Number((sumBy(skills, (item) => item.securityScore) / skills.length).toFixed(1)) : 0,
      topSkillCategory: countBy(skills, (item) => item.category, 1)[0]?.name ?? null,
      topPluginCategory: countBy(plugins, (item) => item.category, 1)[0]?.name ?? null,
    },
    rankingFactors,
    skills: {
      items: skills,
      topByOpportunity: skills.slice(0, 20),
      topByInstalls: sortByNumber(skills, (item) => item.installs).slice(0, 20),
      topByQuality: sortByNumber(skills, (item) => item.qualityScore).slice(0, 20),
      topBySecurity: sortByNumber(skills, (item) => item.securityScore).slice(0, 20),
      topCategories: countBy(skills, (item) => item.category, 12),
      commonPatterns: [
        '任务词命名远比抽象能力名更容易拿到点击。',
        '质量分和安全分都直接暴露在可见卡片上，显著影响信任。',
        '高安装技能往往依附高星 repo 或已有作者品牌。',
        '工具包装型 skill 在 AgentSkill 上更容易规模化复制。',
      ],
    },
    plugins: {
      items: plugins,
      topByOpportunity: plugins.slice(0, 20),
      topBySkillCount: sortByNumber(plugins, (item) => item.listedSkillCount).slice(0, 20),
      topByGithubStars: sortByNumber(plugins, (item) => item.listedGithubStars).slice(0, 20),
      commonPatterns: [
        '首屏插件大多是围绕一个清晰主线打包的大合集。',
        '高技能数插件更容易占榜，但描述必须足够具体。',
        '开发、营销、文档、科研类合集都具备明显扩 SKU 潜力。',
      ],
    },
    creators: {
      topCreators,
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
}

buildReport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
