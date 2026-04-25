import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import fetch from 'node-fetch';
import { syncMarkdownDocx } from './lib/report-docx.mjs';

const ROOT = process.cwd();
const OUTPUT_PATH = resolve(ROOT, 'public/data/market-ecosystem-report.json');
const CLAUDE_REPORT_ZH_PATH = resolve(ROOT, 'reports/Claude_AISA_Report_ZH.md');
const CLAUDE_REPORT_ZH_PUBLIC_PATH = resolve(ROOT, 'public/reports/Claude_AISA_Report_ZH.md');
const CLAUDE_REPORT_EN_PATH = resolve(ROOT, 'reports/Claude_AISA_Report_EN.md');
const CLAUDE_REPORT_EN_PUBLIC_PATH = resolve(ROOT, 'public/reports/Claude_AISA_Report_EN.md');
const HERMES_REPORT_ZH_PATH = resolve(ROOT, 'reports/Hermes_AISA_Report_ZH.md');
const HERMES_REPORT_ZH_PUBLIC_PATH = resolve(ROOT, 'public/reports/Hermes_AISA_Report_ZH.md');
const HERMES_REPORT_EN_PATH = resolve(ROOT, 'reports/Hermes_AISA_Report_EN.md');
const HERMES_REPORT_EN_PUBLIC_PATH = resolve(ROOT, 'public/reports/Hermes_AISA_Report_EN.md');

const CLAUDE_SKILLS_URL = 'https://claudemarketplaces.com/skills';
const CLAUDE_MARKETPLACES_URL = 'https://claudemarketplaces.com/marketplaces';
const HERMES_CATALOG_URL = 'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/website/docs/reference/skills-catalog.md';

function compactSpaces(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const text = value.replace(/,/g, '').trim();
    if (!text || text === '$undefined') return 0;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function detectCategory(name, description) {
  const lowerName = compactSpaces(name).toLowerCase();
  const text = `${name} ${description}`.toLowerCase();

  if (/(skill vetter|security|auditor|moltguard|safety|protect|guard|1password|password|secret|credential|vault)/.test(lowerName)) {
    return 'Security & Audit';
  }
  if (/(search|news|research|tavily|exa|duckduckgo|baidu|firecrawl|arxiv|wiki|retrieval|bm25|rerank|knowledge base|knowledgebase|transcript)/.test(lowerName)) {
    return 'Search & Research';
  }
  if (/(github|git essentials|api gateway|model usage|frontend design|developer|code review|pr|repo|docker|container|compose|devops|kubernetes|k8s)/.test(lowerName)) {
    return 'Developer';
  }
  if (/(self-improving|proactive agent|ontology|memory manager|second brain|jarvis)/.test(lowerName)) return 'Agentic Systems';
  if (/(notion|slack|gmail|calendar|workspace|apple notes|bear notes|email|himalaya|linear)/.test(lowerName)) {
    return 'Productivity & Workspace';
  }
  if (/(word|docx|excel|xlsx|powerpoint|ppt|pdf|markdown converter|slides|ocr|documents)/.test(lowerName)) {
    return 'Office Documents';
  }
  if (/(twitter|tweet|xiaohongshu|social|discord|linkedin|xurl)/.test(lowerName)) return 'Social & Growth';
  if (/(youtube|video frames|creator|video |gif-search|youtube-content)/.test(lowerName)) return 'Video & Creator Research';
  if (/(image gen|image generation|nano banana|media gen|humanizer|diagram|ascii-art|ascii-video|manim|p5js|illustration|render)/.test(lowerName)) {
    return 'Media Generation';
  }
  if (/(stock|market|finance|polymarket|kalshi|trading)/.test(lowerName)) return 'Finance & Market Data';
  if (/(weather|forecast|maps)/.test(lowerName)) return 'Weather & Utility Data';
  if (/(browser|playwright|desktop control|automation|workflow|mcp|webhook|spawn|subagent)/.test(lowerName)) return 'Browser & Automation';

  if (/(security|audit|vetter|antivirus|guardrails|risk|1password|password|secret|credential|vault)/.test(text)) {
    return 'Security & Audit';
  }
  if (/(search|research|news|tavily|serp|web |academic|paper|retrieval|bm25|rerank|knowledge base|knowledgebase|transcript)/.test(text)) {
    return 'Search & Research';
  }
  if (/(github|repo|pull request|issue|git |developer|codebase|docker|container|compose|devops|kubernetes|k8s|infrastructure)/.test(text)) {
    return 'Developer';
  }
  if (/(self-improving|proactive|agent|ontology|brain|memory|jarvis|delegate|orchestrat)/.test(text)) return 'Agentic Systems';
  if (/(twitter|tweet|social|community|spaces|engage|followers|messages)/.test(text)) return 'Social & Growth';
  if (/(youtube|video|channel|creator|content)/.test(text)) return 'Video & Creator Research';
  if (/(image generation|generate images|music generation|video generation|diagram|ascii|illustration|render|creative coding|visual art)/.test(text)) {
    return 'Media Generation';
  }
  if (/(stock|finance|market|crypto|equity|price|trading|polymarket|kalshi)/.test(text)) return 'Finance & Market Data';
  if (/(weather|forecast|timezone|location|directions)/.test(text)) return 'Weather & Utility Data';
  if (/(gmail|calendar|drive|docs|sheets|workspace|email|slack|notion|notes|contacts)/.test(text)) return 'Productivity & Workspace';
  if (/(word|docx|excel|xlsx|powerpoint|ppt|pdf|documents|slides|ocr)/.test(text)) return 'Office Documents';
  if (/(browser|playwright|scraper|automation|mcp|desktop|workflow|spawn|delegate|webhook)/.test(text)) return 'Browser & Automation';
  return 'General Utility';
}

function inferApiFamily(category) {
  return {
    Developer: 'Developer Platform API',
    'Search & Research': 'Search API',
    'Productivity & Workspace': 'Workspace API',
    'Office Documents': 'Document Office API',
    'Social & Growth': 'Social API',
    'Video & Creator Research': 'Video Research API',
    'Media Generation': 'Media Generation API',
    'Finance & Market Data': 'Market Data API',
    'Weather & Utility Data': 'Weather / Utility API',
    'Browser & Automation': 'Browser Automation API',
    'Security & Audit': 'Security Audit API',
    'Agentic Systems': 'Agent Orchestration Layer',
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
    'Video & Creator Research': 90,
    'Media Generation': 89,
    'Finance & Market Data': 90,
    'Weather & Utility Data': 84,
    'Browser & Automation': 91,
    'Security & Audit': 87,
    'Agentic Systems': 72,
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
    'Video & Creator Research': 88,
    'Media Generation': 91,
    'Finance & Market Data': 94,
    'Weather & Utility Data': 80,
    'Browser & Automation': 95,
    'Security & Audit': 94,
    'Agentic Systems': 78,
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
    'Video & Creator Research': 90,
    'Media Generation': 89,
    'Finance & Market Data': 91,
    'Weather & Utility Data': 80,
    'Browser & Automation': 92,
    'Security & Audit': 88,
    'Agentic Systems': 82,
    'General Utility': 65,
  }[category];
}

function targetTitle(category, name) {
  const lower = name.toLowerCase();
  if (lower.includes('github')) return 'GitHub Command Center';
  if (/(twitter|tweet|xurl|social)/.test(lower)) return 'Twitter API Command Center';
  if (lower.includes('youtube')) return 'YouTube SERP Scout';
  if (/(gmail|calendar|drive|workspace|notion|slack)/.test(lower)) return 'Workspace Command Center';
  if (/(word|docx|excel|xlsx|powerpoint|ppt|pdf|document)/.test(lower)) return 'Document Office Command Center';
  if (/(weather|maps)/.test(lower)) return 'Weather Decision API';
  if (/(finance|stock|market|trading|polymarket)/.test(lower)) return 'Market Data Command Center';
  if (/(search|research|news|tavily|arxiv|wiki)/.test(lower)) return 'Multi-Source Search Command Center';
  if (/(browser|playwright|automation|workflow|spawn|subagent|mcp)/.test(lower)) return 'Browser Automation Command Center';
  if (/(security|audit|vetter|guard)/.test(lower)) return 'Security Audit Command Center';
  if (/(image|video generation|music|media|ascii|diagram)/.test(lower)) return 'Image & Video Command Center';
  return {
    Developer: 'Developer Command Center',
    'Search & Research': 'Research Command Center',
    'Productivity & Workspace': 'Workspace Command Center',
    'Office Documents': 'Document Office Command Center',
    'Social & Growth': 'Social Growth Command Center',
    'Video & Creator Research': 'Video Research Command Center',
    'Media Generation': 'Media Generation Command Center',
    'Finance & Market Data': 'Market Data Command Center',
    'Weather & Utility Data': 'Utility Data Command Center',
    'Browser & Automation': 'Browser Automation Command Center',
    'Security & Audit': 'Security Audit Command Center',
    'Agentic Systems': 'Agent Upgrade Command Center',
    'General Utility': 'Utility Command Center',
  }[category];
}

function categorySummary(category) {
  return {
    Developer: '开发者工作流密度高、安装后留存强，适合做 command center 和垂直开发矩阵。',
    'Search & Research': '高频信息入口最适合 API 化，也最容易拆出新闻、学术、情报等多变体。',
    'Productivity & Workspace': '办公协作类更适合做团队席位、高客单价和长期复购。',
    'Office Documents': '文档类需求明确，最适合按 Word / Excel / PDF / PPT 做多 SKU。',
    'Social & Growth': '适合按研究、发布、互动、监控拆出不同深度的增长矩阵。',
    'Video & Creator Research': '创作者工作流天然适合做选题、竞品、趋势三类高意图入口。',
    'Media Generation': '展示力强、传播力强，按量收费路径自然。',
    'Finance & Market Data': '决策价值高，付费意愿普遍强于泛工具类。',
    'Weather & Utility Data': '高频低门槛，适合调用量付费和嵌入式能力。',
    'Browser & Automation': '自动化结果价值高，适合更高客单价与企业套餐。',
    'Security & Audit': '安装前决策和企业治理都适合高价产品化。',
    'Agentic Systems': '更适合作为旗舰叙事和系统层入口，而不是单点 API 包。',
    'General Utility': '需要继续压缩成更窄的 JTBD 才容易变成爆款。',
  }[category];
}

function conversionMoves(category) {
  return {
    Developer: ['标题优先用平台词或开发者任务词。', '旗舰包做 command center，再拆 repo research / PR review / issue triage 变体。', '首屏直接放真实仓库与真实输出样板。'],
    'Search & Research': ['先切一个最窄检索任务入口。', '同步准备通用搜索、新闻搜索、学术搜索多变体。', '结果直接给结论和来源，而不是原始链接堆叠。'],
    'Productivity & Workspace': ['把办公动作聚合成 command center。', '先做个人流程，再扩团队协作和自动化套餐。', '卖点围绕每天都会用到的具体动作展开。'],
    'Office Documents': ['先做 Word / Excel / PPT / PDF 的独立入口。', '再做 Office 全家桶。', '强调结构化输出和批量处理。'],
    'Social & Growth': ['把读、写、互动、监控拆成不同层级 skill。', '旗舰包负责研究+发布，变体包负责 engage 或监控。', '示例 prompt 覆盖选题、竞品、发帖链路。'],
    'Video & Creator Research': ['把快速搜索和深度研究拆成双层入口。', '强调选题、竞品、趋势三类场景。', '准备多语言和多地区样例。'],
    'Media Generation': ['把模型能力改写成用户目标。', '拆出图片、视频、风格、商品图等入口。', '通过结果展示强化传播和收藏。'],
    'Finance & Market Data': ['从最窄行情或研究入口切入。', '再扩成股票、加密、新闻、组合矩阵。', '突出实时性、可信度和专业价值。'],
    'Weather & Utility Data': ['一轮内给出明确答案。', '把实况、预报、建议拆分成变体。', '优先做调用量收费和嵌入式能力。'],
    'Browser & Automation': ['先定义最清晰的自动化任务，不要笼统叫 automation。', '用 command center + 单任务包组合发布。', '准备企业场景承接更高客单价。'],
    'Security & Audit': ['输出直接形成通过 / 警告 / 阻断决策。', '优先占安装前和高风险决策入口。', '把风险解释与证据做成结构化模板。'],
    'Agentic Systems': ['先把抽象愿景改成具体收益。', '同时配一组更实用的支撑技能承接流量。', '把“更聪明”改成“哪里更强”。'],
    'General Utility': ['先重写标题，让它更像任务。', '压缩范围，优先做一轮就见效的窄入口。', '用例子验证搜索词，再反推定位。'],
  }[category];
}

function scoreComposite(item, installsWeight = 0.55, starsWeight = 0.35, extraWeight = 0.1) {
  const installs = Math.log10((item.installs ?? item.installsCurrent ?? 0) + 10);
  const stars = Math.log10((item.stars ?? 0) + 10);
  const extra = Math.log10((item.pluginCount ?? item.voteCount ?? 0) + 10);
  return Number((installs * installsWeight + stars * starsWeight + extra * extraWeight).toFixed(3));
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

function topUnion(lists, selector, limit = 200) {
  return uniqueBy(lists.flat(), selector).slice(0, limit);
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

function readCachedOutput() {
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function categoryLeader(categories) {
  return sortByNumber(categories, (item) => toNumber(item.count))[0]?.name ?? null;
}

function extractNextFlightChunks(html) {
  const pushes = [];
  const context = { self: { __next_f: { push: (value) => pushes.push(value) } } };
  vm.createContext(context);
  const matcher = /<script>self\.__next_f\.push\((.*?)\)<\/script>/gs;
  for (const match of html.matchAll(matcher)) {
    vm.runInContext(`self.__next_f.push(${match[1]})`, context);
  }
  return pushes.flatMap((entry) => entry.filter((value) => typeof value === 'string'));
}

function findBalancedEnd(text, startIndex, openChar = '[', closeChar = ']') {
  let depth = 0;
  let inString = false;
  let escaping = false;
  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];
    if (escaping) {
      escaping = false;
      continue;
    }
    if (char === '\\') {
      escaping = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error(`Unable to find balanced ${closeChar} for content starting at ${startIndex}`);
}

function extractJsonArrayFromChunks(chunks, key) {
  const needle = `"${key}":[`;
  const chunk = chunks.find((value) => value.includes(needle));
  if (!chunk) throw new Error(`Could not find ${key} in Next flight payload`);
  const keyIndex = chunk.indexOf(needle);
  const arrayStart = chunk.indexOf('[', keyIndex);
  const arrayEnd = findBalancedEnd(chunk, arrayStart);
  return JSON.parse(chunk.slice(arrayStart, arrayEnd + 1));
}

async function fetchText(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/)',
          accept: 'text/html,application/json,text/plain;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`${url} -> ${response.status}`);
      }
      return response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 1200 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function fetchClaudeSkillsData() {
  try {
    const html = await fetchText(CLAUDE_SKILLS_URL);
    const chunks = extractNextFlightChunks(html);
    const skills = extractJsonArrayFromChunks(chunks, 'skills').map((item) => {
      const category = detectCategory(item.name, item.description || item.summary || '');
      const owner = compactSpaces(item.repo?.split('/')[0] ?? 'unknown');
      return {
        ...item,
        owner,
        stars: toNumber(item.stars),
        installs: toNumber(item.installs),
        voteCount: toNumber(item.voteCount),
        commentCount: toNumber(item.commentCount),
        category,
        apiFamily: inferApiFamily(category),
        aisaFitScore: fitScore(category),
        monetizationScore: monetizationScore(category),
        factoryScore: factoryScore(category),
        targetTitle: targetTitle(category, item.name),
        summary: categorySummary(category),
        moves: conversionMoves(category),
      };
    });

    const categories = extractJsonArrayFromChunks(chunks, 'categories');
    const skillsByInstalls = sortByNumber(skills, (item) => item.installs);
    const skillsByStars = sortByNumber(skills, (item) => item.stars);
    const skillsByComposite = sortByNumber(
      skills.map((item) => ({ ...item, compositeScore: scoreComposite(item, 0.6, 0.3, 0.1) })),
      (item) => item.compositeScore,
    );
    const topByInstalls = skillsByInstalls.slice(0, 20);
    const topByStars = skillsByStars.slice(0, 20);
    const topByComposite = skillsByComposite.slice(0, 20);
    const top200Union = topUnion(
      [skillsByInstalls.slice(0, 200), skillsByStars.slice(0, 200), skillsByComposite.slice(0, 200)],
      (item) => item.repo || `${item.owner}:${item.name}`,
      200,
    );

    const ownerProfiles = new Map();
    for (const skill of skills) {
      const current = ownerProfiles.get(skill.owner) ?? {
        owner: skill.owner,
        repoCount: new Set(),
        skillCount: 0,
        totalStars: 0,
        totalInstalls: 0,
        topSkills: [],
        categories: new Map(),
      };
      current.repoCount.add(skill.repo);
      current.skillCount += 1;
      current.totalStars += skill.stars;
      current.totalInstalls += skill.installs;
      current.topSkills.push({
        name: skill.name,
        repo: skill.repo,
        stars: skill.stars,
        installs: skill.installs,
        category: skill.category,
        targetTitle: skill.targetTitle,
      });
      current.categories.set(skill.category, (current.categories.get(skill.category) ?? 0) + 1);
      ownerProfiles.set(skill.owner, current);
    }

    const topOwners = [...ownerProfiles.values()]
      .map((item) => ({
        owner: item.owner,
        repoCount: item.repoCount.size,
        skillCount: item.skillCount,
        totalStars: item.totalStars,
        totalInstalls: item.totalInstalls,
        primaryCategories: [...item.categories.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name]) => name),
        topSkills: sortByNumber(item.topSkills, (skill) => skill.installs || skill.stars).slice(0, 5),
      }))
      .sort((a, b) => b.totalInstalls - a.totalInstalls || b.totalStars - a.totalStars)
      .slice(0, 15);

    const aisaCandidates = sortByNumber(
      skills.map((item) => ({
        ...item,
        aisaOpportunityScore: Number(
          (
            item.aisaFitScore * 0.45 +
            item.monetizationScore * 0.25 +
            item.factoryScore * 0.15 +
            Math.min(100, Math.log10(item.installs + 10) * 25 + Math.log10(item.stars + 10) * 20) * 0.15
          ).toFixed(2)
        ),
      })),
      (item) => item.aisaOpportunityScore,
    ).slice(0, 25);

    return {
      sourceUrl: CLAUDE_SKILLS_URL,
      summary: {
        totalSkills: skills.length,
        totalSkillInstalls: sumBy(skills, (item) => item.installs),
        totalSkillStars: sumBy(skills, (item) => item.stars),
        categoriesTracked: categories.length,
        topCategory: categoryLeader(categories),
      },
      categories,
      topByInstalls,
      topByStars,
      topByComposite,
      top200Union,
      topOwners,
      aisaCandidates,
      commonPatterns: [
        '头部技能几乎都把 skill 名字写成平台词、任务词，几乎不写抽象能力名。',
        '高安装 skill 普遍依附 GitHub 高星 repo 或强品牌 repo，冷启动信任成本低。',
        '热门技能大多是开发者高频动作，而不是偶发长流程。',
        '描述更强调“什么时候用”“直接做什么”，而不是宽泛技术说明。',
      ],
    };
  } catch (error) {
    const cached = readCachedOutput();
    if (cached?.claude?.skills) {
      console.warn('Claude skills refresh failed, reusing cached skills dataset from previous market-ecosystem-report.json');
      return cached.claude.skills;
    }
    throw error;
  }
}

async function fetchClaudeMarketplacesData() {
  try {
    const html = await fetchText(CLAUDE_MARKETPLACES_URL);
    const chunks = extractNextFlightChunks(html);
    const marketplaces = extractJsonArrayFromChunks(chunks, 'marketplaces').map((item) => {
      const description = item.description || '';
      const category = detectCategory(item.slug, description);
      const owner = compactSpaces(item.repo?.split('/')[0] ?? 'unknown');
      return {
        ...item,
        owner,
        stars: toNumber(item.stars),
        pluginCount: toNumber(item.pluginCount),
        voteCount: toNumber(item.voteCount),
        commentCount: toNumber(item.commentCount),
        category,
        apiFamily: inferApiFamily(category),
        aisaFitScore: fitScore(category),
        monetizationScore: monetizationScore(category),
        factoryScore: factoryScore(category),
        targetTitle: targetTitle(category, item.slug),
        summary: categorySummary(category),
        moves: conversionMoves(category),
        compositeScore: scoreComposite(item, 0.2, 0.45, 0.35),
      };
    });

    const categories = extractJsonArrayFromChunks(chunks, 'categories');
    const marketplacesByStars = sortByNumber(marketplaces, (item) => item.stars);
    const marketplacesByPluginCount = sortByNumber(marketplaces, (item) => item.pluginCount);
    const marketplacesByComposite = sortByNumber(marketplaces, (item) => item.compositeScore);
    const topByStars = marketplacesByStars.slice(0, 20);
    const topByPluginCount = marketplacesByPluginCount.slice(0, 20);
    const topByComposite = marketplacesByComposite.slice(0, 20);
    const top200Union = topUnion(
      [marketplacesByStars.slice(0, 200), marketplacesByPluginCount.slice(0, 200), marketplacesByComposite.slice(0, 200)],
      (item) => item.repo || item.slug,
      200,
    );

    const ownerProfiles = new Map();
    for (const marketplace of marketplaces) {
      const current = ownerProfiles.get(marketplace.owner) ?? {
        owner: marketplace.owner,
        marketplaceCount: 0,
        totalStars: 0,
        totalPlugins: 0,
        categories: new Map(),
        topRepos: [],
      };
      current.marketplaceCount += 1;
      current.totalStars += marketplace.stars;
      current.totalPlugins += marketplace.pluginCount;
      current.topRepos.push({
        repo: marketplace.repo,
        stars: marketplace.stars,
        pluginCount: marketplace.pluginCount,
        description: marketplace.description,
      });
      current.categories.set(marketplace.category, (current.categories.get(marketplace.category) ?? 0) + 1);
      ownerProfiles.set(marketplace.owner, current);
    }

    const topOwners = [...ownerProfiles.values()]
      .map((item) => ({
        owner: item.owner,
        marketplaceCount: item.marketplaceCount,
        totalStars: item.totalStars,
        totalPlugins: item.totalPlugins,
        primaryCategories: [...item.categories.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name]) => name),
        topRepos: sortByNumber(item.topRepos, (repo) => repo.pluginCount + repo.stars / 1000).slice(0, 5),
      }))
      .sort((a, b) => b.totalPlugins - a.totalPlugins || b.totalStars - a.totalStars)
      .slice(0, 15);

    const aisaCandidates = sortByNumber(
      marketplaces.map((item) => ({
        ...item,
        aisaOpportunityScore: Number(
          (
            item.aisaFitScore * 0.35 +
            item.monetizationScore * 0.2 +
            item.factoryScore * 0.15 +
            Math.min(100, Math.log10(item.pluginCount + 10) * 30 + Math.log10(item.stars + 10) * 25) * 0.3
          ).toFixed(2)
        ),
      })),
      (item) => item.aisaOpportunityScore,
    ).slice(0, 25);

    return {
      sourceUrl: CLAUDE_MARKETPLACES_URL,
      summary: {
        totalMarketplaces: marketplaces.length,
        totalMarketplaceStars: sumBy(marketplaces, (item) => item.stars),
        totalPluginsListed: sumBy(marketplaces, (item) => item.pluginCount),
        categoriesTracked: categories.length,
        topCategory: categoryLeader(categories),
      },
      categories,
      topByStars,
      topByPluginCount,
      topByComposite,
      top200Union,
      topOwners,
      aisaCandidates,
      commonPatterns: [
        '高势能 marketplace 往往不是单个 skill，而是一组按主题组织的命令、插件和工作流集合。',
        '高星 marketplace 本质上是“分发基础设施”，比单 skill 更适合承接矩阵化扩张。',
        '描述里经常直接点名目标框架、目标平台和目标任务，降低搜索歧义。',
        '插件数量多的 marketplace 往往覆盖 1 个清晰主线，再配 2 到 4 个邻接场景。',
      ],
    };
  } catch (error) {
    const cached = readCachedOutput();
    if (cached?.claude?.marketplaces) {
      console.warn('Claude marketplaces refresh failed, reusing cached marketplaces dataset from previous market-ecosystem-report.json');
      return cached.claude.marketplaces;
    }
    throw error;
  }
}

function normalizeHermesTag(skill) {
  const tags = new Set();
  const categoryPath = skill.path.split('/').slice(0, -1);
  for (const part of categoryPath) {
    part
      .split(/[/-]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => tags.add(item.toLowerCase()));
  }
  if (/macos|apple|imessage|findmy|notes|reminders/i.test(`${skill.name} ${skill.description} ${skill.path}`)) {
    tags.add('apple');
    tags.add('macos');
  }
  if (/github|git|pull request|repo/i.test(`${skill.name} ${skill.description}`)) tags.add('github');
  if (/ml|model|training|inference|llm|huggingface|trl|axolotl|vllm/i.test(`${skill.name} ${skill.description}`)) tags.add('mlops');
  if (/research|paper|arxiv|blog|market/i.test(`${skill.name} ${skill.description}`)) tags.add('research');
  if (/automation|workflow|subagent|spawn|mcp/i.test(`${skill.name} ${skill.description}`)) tags.add('automation');
  return [...tags];
}

function decorateHermesSkill(item) {
  const category = detectCategory(item.name, `${item.sectionTitle} ${item.sectionDescription} ${item.description}`);
  return {
    ...item,
    category,
    apiFamily: inferApiFamily(category),
    aisaFitScore: fitScore(category),
    monetizationScore: monetizationScore(category),
    factoryScore: factoryScore(category),
    targetTitle: targetTitle(category, item.name),
    summary: categorySummary(category),
    moves: conversionMoves(category),
    tags: normalizeHermesTag(item),
    platformScope: /apple|macos/i.test(`${item.sectionTitle} ${item.description} ${item.path}`) ? 'macOS-only / Apple-adjacent' : 'cross-platform or mixed',
  };
}

function scoreHermesSkills(items) {
  return sortByNumber(
    items.map((item) => ({
      ...item,
      aisaOpportunityScore: Number((item.aisaFitScore * 0.45 + item.monetizationScore * 0.3 + item.factoryScore * 0.25).toFixed(2)),
    })),
    (item) => item.aisaOpportunityScore,
  ).slice(0, 25);
}

function normalizeHermesCountRows(rows, nameKey = 'name') {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({
      name: compactSpaces(row?.[nameKey] ?? row?.name ?? row?.sectionTitle ?? row?.section ?? ''),
      count: toNumber(row?.count),
    }))
    .filter((row) => row.name && row.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function buildHermesSectionGroups(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.sectionTitle || 'misc';
    const current = groups.get(key) ?? {
      type: item.type,
      sectionTitle: key,
      sectionSlug: item.sectionSlug || key.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sectionDescription: item.sectionDescription || '',
      skillCount: 0,
      skills: [],
    };
    current.skillCount += 1;
    current.skills.push(item);
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => b.skillCount - a.skillCount || a.sectionTitle.localeCompare(b.sectionTitle));
}

function buildHermesLiveGuideSnapshot(liveGuide, fallback) {
  return {
    sourceUrl: liveGuide?.sourceUrl ?? fallback?.sourceUrl ?? 'https://hermes-agent.app/en/skills',
    advertisedSkillCategories:
      toNumber(liveGuide?.advertisedSkillCategories) || toNumber(fallback?.summary?.advertisedSkillCategories),
    advertisedBundledSkills:
      toNumber(liveGuide?.advertisedBundledSkills) || toNumber(fallback?.summary?.advertisedBundledSkills),
    categoryButtons: Array.isArray(liveGuide?.categoryButtons)
      ? liveGuide.categoryButtons
      : Array.isArray(fallback?.categoryButtons)
        ? fallback.categoryButtons
        : [],
    liveFetchError: compactSpaces(liveGuide?.liveFetchError ?? ''),
  };
}

function buildHermesRawCatalogSnapshot(rawCatalog, fallback, items, sections) {
  const bundledItems = items.filter((item) => item.type === 'bundled');
  const optionalItems = items.filter((item) => item.type === 'optional');
  const rawSectionBreakdown = normalizeHermesCountRows(rawCatalog?.sectionBreakdown, 'sectionTitle');
  const cachedSectionBreakdown = normalizeHermesCountRows(fallback?.sections);
  const sectionBreakdown = rawSectionBreakdown.length
    ? rawSectionBreakdown
    : cachedSectionBreakdown.length
      ? cachedSectionBreakdown
      : countBy(items, (item) => item.sectionTitle, 80);
  const rawBundledSectionBreakdown = normalizeHermesCountRows(rawCatalog?.bundledSectionBreakdown, 'sectionTitle');
  const bundledSectionBreakdown = rawBundledSectionBreakdown.length
    ? rawBundledSectionBreakdown
    : countBy(bundledItems, (item) => item.sectionTitle, 80);
  const rawOptionalSectionBreakdown = normalizeHermesCountRows(rawCatalog?.optionalSectionBreakdown, 'sectionTitle');
  const optionalSectionBreakdown = rawOptionalSectionBreakdown.length
    ? rawOptionalSectionBreakdown
    : countBy(optionalItems, (item) => item.sectionTitle, 80);
  const bundledSections =
    Array.isArray(rawCatalog?.bundledSections) && rawCatalog.bundledSections.length
      ? rawCatalog.bundledSections
      : buildHermesSectionGroups(bundledItems);
  const optionalSections =
    Array.isArray(rawCatalog?.optionalSections) && rawCatalog.optionalSections.length
      ? rawCatalog.optionalSections
      : buildHermesSectionGroups(optionalItems);

  return {
    sourceDocUrl: rawCatalog?.sourceDocUrl ?? fallback?.sourceDocUrl ?? HERMES_CATALOG_URL,
    parsedSkillRows: toNumber(rawCatalog?.parsedSkillRows) || items.length,
    bundledRows: toNumber(rawCatalog?.bundledRows) || toNumber(fallback?.summary?.bundledSkills) || bundledItems.length,
    optionalRows: toNumber(rawCatalog?.optionalRows) || toNumber(fallback?.summary?.optionalSkills) || optionalItems.length,
    totalSections:
      sectionBreakdown.length || toNumber(fallback?.summary?.sections) || new Set(items.map((item) => item.sectionTitle)).size,
    sectionBreakdown: sectionBreakdown.length ? sectionBreakdown : sections,
    bundledSectionBreakdown,
    optionalSectionBreakdown,
    bundledSections,
    optionalSections,
  };
}

function refreshCachedHermesDataset(cached, reason) {
  const compactReason = compactSpaces(String(reason ?? '')).slice(0, 240);
  const bundled = scoreHermesSkills((cached?.bundled ?? []).map(decorateHermesSkill));
  const optional = scoreHermesSkills((cached?.optional ?? []).map(decorateHermesSkill));
  const unionSource = [...bundled, ...optional];
  const cachedSections = normalizeHermesCountRows(cached?.sections);
  const sections = cachedSections.length ? cachedSections : countBy(unionSource, (item) => item.sectionTitle, 40);
  const tags = countBy(unionSource.flatMap((item) => item.tags.map((tag) => ({ tag }))), (item) => item.tag, 24);
  const liveGuide = buildHermesLiveGuideSnapshot(cached?.liveGuide, cached);
  const rawCatalog = buildHermesRawCatalogSnapshot(cached?.rawCatalog, cached, unionSource, sections);

  return {
    ...cached,
    sourceUrl: liveGuide.sourceUrl,
    sourceDocUrl: rawCatalog.sourceDocUrl,
    liveGuide,
    rawCatalog,
    summary: {
      ...(cached?.summary ?? {}),
      totalSkills: cached?.summary?.totalSkills ?? rawCatalog.parsedSkillRows,
      bundledSkills: rawCatalog.bundledRows,
      optionalSkills: rawCatalog.optionalRows,
      sections: rawCatalog.totalSections,
      topSection: rawCatalog.sectionBreakdown[0]?.name ?? cached?.summary?.topSection ?? null,
      advertisedBundledSkills: liveGuide.advertisedBundledSkills || rawCatalog.bundledRows,
      advertisedSkillCategories: liveGuide.advertisedSkillCategories || rawCatalog.totalSections,
    },
    categoryButtons: liveGuide.categoryButtons,
    sections: rawCatalog.sectionBreakdown.length ? rawCatalog.sectionBreakdown : sections,
    tags,
    bundled,
    optional,
    top200Union: topUnion([bundled, optional], (item) => item.path || item.name, 200),
    commonPatterns: [
      ...(cached?.commonPatterns ?? []).filter((line) => !line.includes('live guide') && !line.includes('Hermes live/raw')),
      `截至 ${new Date().toISOString().slice(0, 10)}，Hermes live/raw 直连刷新失败（${compactReason || 'remote fetch failed'}），本次结果已基于本地缓存重算分类与机会分。`,
    ],
  };
}

function hasHermesRows(hermes) {
  return (hermes?.bundled?.length ?? 0) > 0 || (hermes?.optional?.length ?? 0) > 0;
}

function readHeadMarketCache() {
  const result = spawnSync('git', ['show', 'HEAD:public/data/market-ecosystem-report.json'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 16,
  });
  if (result.status !== 0 || !result.stdout.trim()) {
    return null;
  }
  return JSON.parse(result.stdout);
}

async function fetchHermesData() {
  const helperPath = resolve(ROOT, 'scripts/parse-hermes-skill-atlas.py');
  const loadCachedHermes = (reason) => {
    const candidates = [];
    try {
      candidates.push(JSON.parse(readFileSync(OUTPUT_PATH, 'utf8')));
    } catch {
      // Ignore local cache read failures.
    }
    const headCache = readHeadMarketCache();
    if (headCache) {
      candidates.push(headCache);
    }

    for (const candidate of candidates) {
      if (hasHermesRows(candidate?.hermes)) {
        console.warn(`Hermes refresh fell back to cached dataset: ${reason}`);
        return refreshCachedHermesDataset(candidate.hermes, reason);
      }
    }
    return null;
  };
  const result = spawnSync('python3', [helperPath], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 16,
  });
  if (result.status !== 0) {
    try {
      const cached = loadCachedHermes(result.stderr || result.stdout || 'parse-hermes-skill-atlas.py failed');
      if (cached) return cached;
    } catch {
      // Ignore cache read failures and surface the original error below.
    }
    throw new Error(result.stderr || result.stdout || 'parse-hermes-skill-atlas.py failed');
  }
  const parsed = JSON.parse(result.stdout);
  const parsedLiveGuide = parsed.liveGuide ?? {};
  const parsedRawCatalog = parsed.rawCatalog ?? {};
  const rawItems = Array.isArray(parsedRawCatalog.items) ? parsedRawCatalog.items : Array.isArray(parsed.items) ? parsed.items : [];
  if (rawItems.length === 0) {
    try {
      const cached = loadCachedHermes('Hermes raw catalog parsed zero rows');
      if (cached) return cached;
    } catch {
      // Ignore cache read failures and fall through to the parsed empty dataset.
    }
  }
  const skills = rawItems.map(decorateHermesSkill);
  const bundled = skills.filter((item) => item.type === 'bundled');
  const optional = skills.filter((item) => item.type === 'optional');
  const rawSectionBreakdown = normalizeHermesCountRows(parsedRawCatalog.sectionBreakdown, 'sectionTitle');
  const sections = rawSectionBreakdown.length ? rawSectionBreakdown : countBy(skills, (item) => item.sectionTitle, 40);
  const tags = countBy(skills.flatMap((item) => item.tags.map((tag) => ({ tag }))), (item) => item.tag, 24);
  const topBundledByAisaFit = scoreHermesSkills(bundled);
  const topOptionalByAisaFit = scoreHermesSkills(optional);
  const top200Union = topUnion([topBundledByAisaFit, topOptionalByAisaFit], (item) => item.path || item.name, 200);
  const liveGuide = buildHermesLiveGuideSnapshot(parsedLiveGuide, null);
  const rawCatalog = buildHermesRawCatalogSnapshot(parsedRawCatalog, null, skills, sections);
  const liveSummaryNote = liveGuide.liveFetchError
    ? `截至 ${new Date().toISOString().slice(0, 10)}，本地直连 Hermes live guide 失败（${liveGuide.liveFetchError}），本次报告已继续使用 raw catalog 结构数据；在线总数和分类按钮建议在浏览器里复核。`
    : `截至 ${new Date().toISOString().slice(0, 10)}，live guide 标注 ${liveGuide.advertisedBundledSkills || 0} 个 bundled skills；raw catalog 当前能结构化提取 ${rawCatalog.bundledRows} 个 bundled rows、${rawCatalog.optionalRows} 个 optional rows。`;

  return {
    sourceUrl: liveGuide.sourceUrl,
    sourceDocUrl: rawCatalog.sourceDocUrl,
    liveGuide,
    rawCatalog,
    summary: {
      totalSkills: skills.length,
      bundledSkills: rawCatalog.bundledRows,
      optionalSkills: rawCatalog.optionalRows,
      sections: rawCatalog.totalSections,
      topSection: rawCatalog.sectionBreakdown[0]?.name ?? null,
      advertisedBundledSkills: liveGuide.advertisedBundledSkills || rawCatalog.bundledRows,
      advertisedSkillCategories: liveGuide.advertisedSkillCategories || rawCatalog.totalSections,
    },
    categoryButtons: liveGuide.categoryButtons,
    sections: rawCatalog.sectionBreakdown,
    tags,
    bundled: topBundledByAisaFit,
    optional: topOptionalByAisaFit,
    top200Union,
    commonPatterns: [
      'Hermes 官方 skill atlas 不是下载榜，而是“先看类别、再选具体 skill”的发现层。',
      '分类非常强调运行环境和工作流边界，例如 Apple / GitHub / MLOps / Research。',
      '高 AISA 适配项主要集中在 GitHub、Research、Productivity、Documents、Automation 这些高频外部工具边界。',
      'Apple / macOS 类 skill 价值高但平台限制强，更适合做专属 SKU 而不是旗舰总包。',
      liveSummaryNote,
    ],
  };
}

function buildClawhubSnapshot() {
  const multiRanking = JSON.parse(readFileSync(resolve(ROOT, 'public/data/clawhub-multi-ranking-report.json'), 'utf8'));
  const downloadInsights = JSON.parse(readFileSync(resolve(ROOT, 'public/data/clawhub-download-insights.json'), 'utf8'));
  const allAisaPlan = JSON.parse(readFileSync(resolve(ROOT, 'public/data/aisa-all-skills-breakout-plan.json'), 'utf8'));
  const top200Plan = JSON.parse(readFileSync(resolve(ROOT, 'public/data/clawhub-top200-aisa-conversion-plan.json'), 'utf8'));

  const topAuthorProfiles = Object.entries(multiRanking.crossRanking.topAuthorProfiles).map(([author, profile]) => ({
    author,
    ...profile,
  }));

  return {
    summary: {
      topSkillAcrossThreeLists: multiRanking.crossRanking.topSkills[0],
      downloadsTopCategory: downloadInsights.summary.topCategory,
      existingAisaSkillsPlanned: allAisaPlan.summary.totalAisaSkillsPlanned,
      top200ConvertibleCandidates: top200Plan.summary.suitableNonAisaCandidates,
    },
    topSkills: multiRanking.crossRanking.topSkills,
    topAuthors: multiRanking.crossRanking.topAuthors,
    topAuthorProfiles,
    viralPlaybook: {
      keySuccessFactors: downloadInsights.documents.document1.keySuccessFactors,
      authorPatterns: downloadInsights.documents.document2.authorPatterns,
      productionSystem: downloadInsights.documents.document3.productionSystem,
      roadmap: downloadInsights.documents.document4.roadmap,
    },
    flagshipAisaPriorities: allAisaPlan.summary.topPriorities,
    topAisaConversionCandidates: top200Plan.top100Candidates.slice(0, 25),
  };
}

function buildCombinedView({ clawhub, claude, hermes }) {
  const combinedOpportunities = [
    ...claude.skills.aisaCandidates.slice(0, 12).map((item) => ({ ecosystem: 'Claude Skills', ...item })),
    ...claude.marketplaces.aisaCandidates.slice(0, 8).map((item) => ({ ecosystem: 'Claude Marketplaces', ...item })),
    ...hermes.bundled.slice(0, 8).map((item) => ({ ecosystem: 'Hermes Bundled', ...item })),
    ...clawhub.topAisaConversionCandidates.slice(0, 12).map((item) => ({ ecosystem: 'ClawHub', ...item })),
  ]
    .map((item) => ({
      ecosystem: item.ecosystem,
      name: item.name ?? item.slug ?? item.repo,
      owner: item.owner ?? item.author ?? item.repo?.split('/')[0] ?? 'official',
      category: item.category,
      apiFamily: item.apiFamily,
      targetTitle: item.targetTitle,
      summary: item.summary,
      opportunityScore: Number(
        (
          item.aisaOpportunityScore ??
          item.aisaConversionScore ??
          item.priorityScore ??
          (item.aisaFitScore * 0.4 + item.monetizationScore * 0.35 + item.factoryScore * 0.25)
        ).toFixed(2)
      ),
      sourceUrl: item.url ?? (item.repo ? `https://github.com/${item.repo}` : null),
    }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 30);

  return {
    combinedOpportunities,
    designPrinciples: [
      '旗舰包先占平台词或高意图任务词，再拆 2 到 4 个窄变体包做矩阵扩张。',
      '首轮成功率比功能面更重要，页面和 skill 文案都要先展示真实输入与真实输出。',
      '跨市场的爆款都在卖“立即完成一个高频动作”，而不是卖抽象能力。',
      '作者/仓库信誉本身是转化资产，所以 GitHub 关联、真实 stars 和真实示例必须被前置展示。',
    ],
    executionLanes: [
      'ClawHub 负责验证下载、安装、付费转化最强的 AISA 方向。',
      'Claude Skills 负责验证 GitHub 高星 repo 上哪些技能词更容易自然获客。',
      'Claude Marketplaces 负责验证矩阵式分发和“旗舰仓库 + 多变体 skill”打法。',
      'Hermes 负责验证哪些内置工作流本身就适合抽成 AISA API 层。',
    ],
  };
}

function buildClaudeZhReport(report, datasetDate) {
  const claudeSkillRows = report.claude.skills.top200Union.slice(0, 15).map((item, index) => ({
    排名: index + 1,
    Skill: item.name,
    Owner: item.owner,
    类目: item.category,
    安装: item.installs,
    Stars: item.stars,
    AISA机会分: item.aisaOpportunityScore ?? '-',
  }));
  const claudeMarketplaceRows = report.claude.marketplaces.top200Union.slice(0, 12).map((item, index) => ({
    排名: index + 1,
    Marketplace: item.repo,
    Owner: item.owner,
    类目: item.category,
    Plugins: item.pluginCount,
    Stars: item.stars,
  }));
  const claudeCandidateRows = report.combined.combinedOpportunities
    .filter((item) => item.ecosystem.startsWith('Claude'))
    .slice(0, 12)
    .map((item, index) => ({
      排名: index + 1,
      板块: item.ecosystem,
      名称: item.name,
      类目: item.category,
      机会分: item.opportunityScore,
    }));
  const topOwnerRows = report.claude.skills.topOwners.slice(0, 10).map((item, index) => ({
    排名: index + 1,
    Owner: item.owner,
    技能数: item.skillCount,
    Repo数: item.repoCount,
    总安装: item.totalInstalls,
    总Stars: item.totalStars,
  }));

  return `# Claude AISA Report

- 生成时间：${report.generatedAt}
- 数据日期：${formatZhDatasetDate(datasetDate)}
- 来源：Claude Skills、Claude Marketplaces

## 一句话结论

Claude 的爆款更接近“高星仓库 + 高意图任务词 + 技能矩阵”的分发模式。真正可复制的不是某一个单品，而是围绕同一主线持续发布旗舰 skill、邻接变体和 marketplace 包，让 GitHub 信任、安装量、类目聚焦和命名策略相互放大。

## 爆款共同点

- 标题直接说任务、平台、系统或工作流，而不是抽象概念。
- 描述都在强调什么时候用、直接能产出什么。
- 高安装作者往往不是只做一个 skill，而是沿着一个主线连续扩张。
- GitHub repo、stars、安装量、结构完整度都会影响转化。
- 最适合 AISA 的，依然是外部 API 边界清晰、付费价值高、可复用性强的能力层。

## Claude 排名机制

- "Installs" 是最直观的公共需求信号，但它和 GitHub repo 信任是绑定出现的。
- "Stars"、安装量、任务命名、仓库品牌、示例可读性一起决定冷启动转化。
- marketplace 侧除了 stars，还要看 "pluginCount" 和主题聚焦度，因为它更像分发基础设施。
- 标题和简介必须先解释“是什么任务”，再解释“为什么这个 repo 值得信”。

## Claude 爆款机制

- 先用一个旗舰 skill 或 marketplace 占住主线，再用窄变体覆盖高意图搜索词。
- 高星 repo 会放大安装转化，但前提是 skill 名称和工作流边界足够清楚。
- 同一作者连续发布相邻技能，会让 repo 信任和目录发现互相强化。
- 真正可持续的，不是一个神奇单品，而是一个 "repo + flagship + sibling ladder" 的组合。

## Claude 发布动作

- 让 README、repo 目录、skill 标题、简介、安装说明指向同一件事。
- 用真实仓库和真实输出样例承接 listing 上的承诺。
- marketplace 仓库要明确主线，不要把无关技能硬塞到同一个分发入口里。
- 发布时优先考虑“用户能不能立刻理解怎么装、装完能做什么”，而不是把背景故事写长。

## Claude Skills Top-200 合并观察

${markdownTable(claudeSkillRows)}
## Claude Marketplaces Top-200 合并观察

${markdownTable(claudeMarketplaceRows)}
## Claude 高产作者画像

${markdownTable(topOwnerRows)}
## 爆款方法论什么能复制，什么不能复制

能复制：

- 任务词命名
- 旗舰包 + 窄变体包
- 以 GitHub/source trust 为冷启动证明
- 按作者主线持续扩 SKU

不容易直接复制：

- 仅靠某个明星仓库历史 stars 获得的先发优势
- 强平台绑定、强本地环境绑定的运行时
- 需要大量隐性运营资源才能持续维护的重度工作流

## 高产作者通常怎么做

- 先占一个主线，例如开发者、研究、办公、自动化、文档。
- 再围绕这个主线连续发相邻技能，而不是随机换赛道。
- 让所有技能共享同一套信任信号：repo、结构、命名、文档风格、结果示例。

## AISA API 怎么在 Claude 做爆款

1. 先做高频、高价值、边界清晰的能力，例如 Research、Developer、Security、Workspace、Documents。
2. 先发一个旗舰 command center，再拆 2 到 4 个高意图 SKU。
3. 用 GitHub 证明和真实输出样例降低冷启动阻力。
4. 先把 repo、readme、真实 demo 做扎实，再扩大矩阵。

## 选品计划

- 第一梯队：Developer、Search & Research、Security、Productivity & Workspace、Office Documents。
- 第二梯队：Browser & Automation、Finance & Market Data、Social & Growth。
- 第三梯队：Media Generation、Weather & Utility、Agentic Systems。

## Claude Top 机会

${markdownTable(claudeCandidateRows)}
`;
}

function buildClaudeEnReport(report, datasetDate) {
  const combinedRows = report.combined.combinedOpportunities
    .filter((item) => item.ecosystem.startsWith('Claude'))
    .slice(0, 15)
    .map((item, index) => ({
      Rank: index + 1,
      Surface: item.ecosystem,
      Name: item.name,
      Category: item.category,
      Opportunity: item.opportunityScore,
    }));
  const ownerRows = report.claude.skills.topOwners.slice(0, 12).map((item, index) => ({
    Rank: index + 1,
    Owner: item.owner,
    Skills: item.skillCount,
    Repos: item.repoCount,
    Installs: item.totalInstalls,
    Stars: item.totalStars,
  }));

  return `# Claude AISA Report

- Generated at: ${report.generatedAt}
- Dataset date: ${formatEnDatasetDate(datasetDate)}

## Executive Summary

Claude rewards the same breakout fundamentals that work on ClawHub, but with a stronger repo-distribution bias. High-performing entries cluster around sharp task naming, high-trust GitHub repos, repeated publishing inside one lane, and flagship-plus-variants packaging.

## Repeatable Playbook

1. Lead with a task, platform, or system in the title.
2. Publish a flagship skill plus a ladder of narrower siblings.
3. Use GitHub and real examples as cold-start trust anchors.
4. Keep the category lane narrow enough that adjacent variants still reinforce each other.
5. Build an author factory, not isolated one-off skills.

## Ranking Mechanics

- Installs are the clearest public demand signal, but they are tightly coupled with GitHub repo trust.
- Stars, installs, task naming, repository brand, and example readability all shape cold-start conversion together.
- On the marketplace side, plugin count and lane coherence matter alongside stars because the repo behaves like distribution infrastructure.
- Titles and descriptions need to answer the task first, then justify why the repo deserves trust.

## Publish Moves

- Align the README, repo layout, skill title, description, and install instructions around the same workflow.
- Use real repository proof and concrete outputs to back the listing promise.
- Keep a marketplace repo organized around one lane instead of cramming unrelated skills into the same entry point.
- Optimize for immediate install clarity before adding story or background context.

## Top Author Factories

${markdownTable(ownerRows)}
## Best Claude Opportunities

${markdownTable(combinedRows)}
`;
}

function buildHermesZhReport(report, datasetDate) {
  const hermesRows = report.hermes.top200Union.slice(0, 15).map((item, index) => ({
    排名: index + 1,
    Skill: item.name,
    Section: item.sectionTitle,
    类目: item.category,
    AISA机会分: item.aisaOpportunityScore,
    平台边界: item.platformScope,
  }));
  const bundledRows = report.hermes.bundled.slice(0, 12).map((item, index) => ({
    排名: index + 1,
    Skill: item.name,
    Section: item.sectionTitle,
    类目: item.category,
    标签: item.tags.join(', ') || '-',
    AISA机会分: item.aisaOpportunityScore,
  }));
  const optionalRows = report.hermes.optional.slice(0, 12).map((item, index) => ({
    排名: index + 1,
    Skill: item.name,
    Section: item.sectionTitle,
    类目: item.category,
    标签: item.tags.join(', ') || '-',
    AISA机会分: item.aisaOpportunityScore,
  }));
  const hermesCandidateRows = report.combined.combinedOpportunities
    .filter((item) => item.ecosystem.startsWith('Hermes'))
    .slice(0, 12)
    .map((item, index) => ({
      排名: index + 1,
      板块: item.ecosystem,
      名称: item.name,
      类目: item.category,
      机会分: item.opportunityScore,
    }));

  return `# Hermes AISA Report

- 生成时间：${report.generatedAt}
- 数据日期：${formatZhDatasetDate(datasetDate)}
- 来源：Hermes Skills Guide、Hermes raw catalog

## 数据口径

- live guide 当前显示 ${report.hermes.liveGuide.advertisedBundledSkills} 个 bundled skills、${report.hermes.liveGuide.advertisedSkillCategories} 个 categories。
- raw catalog 当前结构化提取 ${report.hermes.rawCatalog.bundledRows} 个 bundled rows、${report.hermes.rawCatalog.optionalRows} 个 optional rows，共 ${report.hermes.rawCatalog.totalSections} 个 sections。
- raw catalog 头部 sections：${report.hermes.rawCatalog.sectionBreakdown.slice(0, 5).map((item) => `${item.name} ${item.count}`).join(' · ')}。

## 一句话结论

Hermes 更像“内置工作流能力目录”，而不是公开下载榜。它的爆款逻辑不是谁更会包装 GitHub，而是谁更清楚地把某个工作流边界讲明白，并且放进正确的 section 里。适合 AISA 的仍然是 GitHub、Research、Documents、Workspace、Automation 这些可抽象成 API 的高频边界。

## Hermes 爆款共同点

- 先按工作流类别被发现，再按具体 skill 被选择。
- 类别名、section 文案、技能名共同定义了用户的预期边界。
- 高适配项普遍贴近真实外部系统，而不是只停留在抽象 agent 自增强。
- Apple / macOS 类能力价值高，但平台限制强，不适合作为通用旗舰。

## Hermes 排名机制

- Hermes 更像按 section / category 发现，而不是按下载榜发现。
- 类目按钮、section 文案、技能名、路径位置一起决定技能是否会被选中。
- 用户会先判断“这是不是我当前工作流的一部分”，再判断技能本身是否值得加载。
- 因为没有公开下载榜，边界清晰度和目录放置正确性会比营销文案更重要。

## Hermes 爆款机制

- 把 skill 写成一个明确工作流单元，而不是一个抽象能力标签。
- 优先占 GitHub、Research、Documents、Workspace、Automation 这些跨平台高频工作流。
- Apple / macOS 技能适合做高价值专属 SKU，但不适合扛旗舰总入口。
- 一条主线里按 section 连续补齐多个邻接技能，比做一个过大的万能技能更容易被采用。

## Hermes 发布动作

- 发布文案优先解释工作流边界、平台边界和使用前提。
- section、path、标题、描述必须同向，不要让目录归类和正文叙事冲突。
- 社区包要强调 runtime-only、安全边界和宿主要求，避免开发过程说明压过实际运行方式。
- 与其追求“看起来强大”，不如追求“用户一眼知道该什么时候调用它”。

## Hermes Top-200 合并观察

${markdownTable(hermesRows)}
## Hermes Bundled 技能机会

${markdownTable(bundledRows)}
## Hermes Optional 技能机会

${markdownTable(optionalRows)}
## 什么能复制，什么不能复制

能复制：

- section 优先的命名与分类策略
- 把技能边界写得非常具体
- 用 workflow 词而不是抽象概念词
- 优先做外部系统清晰、重复调用多的能力

不容易直接复制：

- 强 Apple / macOS / 本地设备耦合的运行时
- 依赖宿主能力或内置工具链的深耦合 skill
- 需要重度本地权限和持续维护的复杂系统能力

## AISA API 怎么在 Hermes 做爆款

1. 从 GitHub、Research、Workspace、Documents、Automation 五条线先做。
2. 技能标题和描述优先强调明确工作流，而不是“更聪明”“更强大”。
3. 用一个旗舰 skill 证明价值，再拆垂直窄入口。
4. 对 Apple / macOS 方向只做专属 SKU，不作为通用主线。

## Hermes Top 机会

${markdownTable(hermesCandidateRows)}
`;
}

function buildHermesEnReport(report, datasetDate) {
  const bundledRows = report.hermes.bundled.slice(0, 15).map((item, index) => ({
    Rank: index + 1,
    Skill: item.name,
    Section: item.sectionTitle,
    Category: item.category,
    Opportunity: item.aisaOpportunityScore,
    Scope: item.platformScope,
  }));
  const optionalRows = report.hermes.optional.slice(0, 15).map((item, index) => ({
    Rank: index + 1,
    Skill: item.name,
    Section: item.sectionTitle,
    Category: item.category,
    Opportunity: item.aisaOpportunityScore,
    Scope: item.platformScope,
  }));

  return `# Hermes AISA Report

- Generated at: ${report.generatedAt}
- Dataset date: ${formatEnDatasetDate(datasetDate)}

## Data scope

- Live guide currently advertises ${report.hermes.liveGuide.advertisedBundledSkills} bundled skills across ${report.hermes.liveGuide.advertisedSkillCategories} categories.
- Raw catalog currently parses ${report.hermes.rawCatalog.bundledRows} bundled rows and ${report.hermes.rawCatalog.optionalRows} optional rows across ${report.hermes.rawCatalog.totalSections} sections.
- Top raw sections: ${report.hermes.rawCatalog.sectionBreakdown.slice(0, 5).map((item) => `${item.name} ${item.count}`).join(' · ')}.

## Executive Summary

Hermes behaves more like a workflow atlas than a public install marketplace. Breakout leverage comes from section fit, operational clarity, and tightly scoped capability boundaries. The best AISA conversion targets are still the same practical surfaces: GitHub, research, documents, workspace tooling, and automation.

## Repeatable Playbook

1. Match the section before optimizing the title.
2. Describe an operational workflow, not an abstract capability.
3. Prefer portable external-system surfaces over deeply local-only runtime surfaces.
4. Treat Apple and macOS-heavy skills as premium niche SKUs, not the universal flagship.

## Ranking Mechanics

- Hermes is discovered section-first, not downloads-first.
- Category buttons, section copy, skill names, and path placement all influence whether a skill gets selected.
- Users first decide whether the skill belongs in their current workflow, then whether the skill itself is worth loading.
- Without a public popularity board, boundary clarity and correct catalog placement matter more than marketing language.

## Publish Moves

- Lead with workflow boundaries, platform boundaries, and prerequisites.
- Keep section, path, title, and description aligned around the same operational unit.
- Community bundles should foreground runtime-only scope, host requirements, and safe usage boundaries.
- Optimize for immediate recognizability rather than vague “more powerful agent” positioning.

## Best Bundled Opportunities

${markdownTable(bundledRows)}
## Best Optional Opportunities

${markdownTable(optionalRows)}
`;
}

async function buildReport() {
  const datasetDate = new Date();
  const [claudeSkills, claudeMarketplaces, hermes] = await Promise.all([
    fetchClaudeSkillsData(),
    fetchClaudeMarketplacesData(),
    fetchHermesData(),
  ]);
  const clawhub = buildClawhubSnapshot();
  const report = {
    generatedAt: new Date().toISOString(),
    sources: {
      clawhub: [
        'https://clawhub.ai/skills?sort=downloads&dir=desc',
        'https://clawhub.ai/skills?sort=stars&dir=desc',
        'https://clawhub.ai/skills?sort=installs&dir=desc',
      ],
      claudeSkills: CLAUDE_SKILLS_URL,
      claudeMarketplaces: CLAUDE_MARKETPLACES_URL,
      hermesSkills: 'https://hermes-agent.app/en/skills',
      hermesCatalog: HERMES_CATALOG_URL,
    },
    clawhub,
    claude: {
      skills: claudeSkills,
      marketplaces: claudeMarketplaces,
    },
    hermes,
  };
  report.combined = buildCombinedView(report);
  const outputs = [
    [CLAUDE_REPORT_ZH_PATH, buildClaudeZhReport(report, datasetDate)],
    [CLAUDE_REPORT_ZH_PUBLIC_PATH, buildClaudeZhReport(report, datasetDate)],
    [CLAUDE_REPORT_EN_PATH, buildClaudeEnReport(report, datasetDate)],
    [CLAUDE_REPORT_EN_PUBLIC_PATH, buildClaudeEnReport(report, datasetDate)],
    [HERMES_REPORT_ZH_PATH, buildHermesZhReport(report, datasetDate)],
    [HERMES_REPORT_ZH_PUBLIC_PATH, buildHermesZhReport(report, datasetDate)],
    [HERMES_REPORT_EN_PATH, buildHermesEnReport(report, datasetDate)],
    [HERMES_REPORT_EN_PUBLIC_PATH, buildHermesEnReport(report, datasetDate)],
  ];
  for (const output of [OUTPUT_PATH, ...outputs.map(([path]) => path)]) {
    await mkdir(dirname(output), { recursive: true });
  }
  await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  for (const [path, content] of outputs) {
    await writeFile(path, `${content}\n`, 'utf8');
  }
  syncMarkdownDocx(
    ROOT,
    outputs.map(([path]) => path),
  );
}

buildReport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
