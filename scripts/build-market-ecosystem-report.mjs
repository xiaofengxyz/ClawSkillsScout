import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import fetch from 'node-fetch';

const ROOT = process.cwd();
const OUTPUT_PATH = resolve(ROOT, 'public/data/market-ecosystem-report.json');

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

  if (/(skill vetter|security|auditor|moltguard|safety|protect|guard)/.test(lowerName)) return 'Security & Audit';
  if (/(self-improving|proactive agent|ontology|memory manager|second brain|jarvis)/.test(lowerName)) return 'Agentic Systems';
  if (/(github|git essentials|api gateway|model usage|frontend design|developer|code review|pr|repo)/.test(lowerName)) return 'Developer';
  if (/(notion|slack|gmail|calendar|workspace|apple notes|bear notes|email|himalaya|linear)/.test(lowerName)) {
    return 'Productivity & Workspace';
  }
  if (/(word|docx|excel|xlsx|powerpoint|ppt|pdf|markdown converter|slides|ocr|documents)/.test(lowerName)) {
    return 'Office Documents';
  }
  if (/(twitter|tweet|xiaohongshu|social|discord|linkedin|xurl)/.test(lowerName)) return 'Social & Growth';
  if (/(youtube|video frames|creator|video |gif-search|youtube-content)/.test(lowerName)) return 'Video & Creator Research';
  if (/(image gen|nano banana|media gen|humanizer|diagram|ascii-art|ascii-video|manim|p5js)/.test(lowerName)) return 'Media Generation';
  if (/(stock|market|finance|polymarket|kalshi|trading)/.test(lowerName)) return 'Finance & Market Data';
  if (/(weather|forecast|maps)/.test(lowerName)) return 'Weather & Utility Data';
  if (/(browser|playwright|desktop control|automation|workflow|mcp|webhook|spawn|subagent)/.test(lowerName)) return 'Browser & Automation';
  if (/(search|news|research|tavily|exa|duckduckgo|baidu|firecrawl|arxiv|wiki)/.test(lowerName)) return 'Search & Research';

  if (/(security|audit|vetter|antivirus|guardrails|risk)/.test(text)) return 'Security & Audit';
  if (/(self-improving|proactive|agent|ontology|brain|memory|jarvis|delegate|orchestrat)/.test(text)) return 'Agentic Systems';
  if (/(twitter|tweet|social|community|spaces|engage|followers|messages)/.test(text)) return 'Social & Growth';
  if (/(youtube|video|channel|creator|content)/.test(text)) return 'Video & Creator Research';
  if (/(image|music generation|video generation|media|diagram|ascii|visual)/.test(text)) return 'Media Generation';
  if (/(stock|finance|market|crypto|equity|price|trading|polymarket|kalshi)/.test(text)) return 'Finance & Market Data';
  if (/(weather|forecast|timezone|location|directions)/.test(text)) return 'Weather & Utility Data';
  if (/(browser|playwright|scraper|automation|mcp|desktop|workflow|spawn|delegate|webhook)/.test(text)) return 'Browser & Automation';
  if (/(gmail|calendar|drive|docs|sheets|workspace|email|slack|notion|notes|contacts)/.test(text)) return 'Productivity & Workspace';
  if (/(word|docx|excel|xlsx|powerpoint|ppt|pdf|documents|slides|ocr)/.test(text)) return 'Office Documents';
  if (/(github|repo|pull request|issue|git |developer|codebase)/.test(text)) return 'Developer';
  if (/(search|research|news|tavily|serp|web |academic|paper)/.test(text)) return 'Search & Research';
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
    const timeoutId = setTimeout(() => controller.abort(), 25000);
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
  const topByInstalls = sortByNumber(skills, (item) => item.installs).slice(0, 20);
  const topByStars = sortByNumber(skills, (item) => item.stars).slice(0, 20);
  const topByComposite = sortByNumber(
    skills.map((item) => ({ ...item, compositeScore: scoreComposite(item, 0.6, 0.3, 0.1) })),
    (item) => item.compositeScore,
  ).slice(0, 20);

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
    topOwners,
    aisaCandidates,
    commonPatterns: [
      '头部技能几乎都把 skill 名字写成平台词、任务词，几乎不写抽象能力名。',
      '高安装 skill 普遍依附 GitHub 高星 repo 或强品牌 repo，冷启动信任成本低。',
      '热门技能大多是开发者高频动作，而不是偶发长流程。',
      '描述更强调“什么时候用”“直接做什么”，而不是宽泛技术说明。',
    ],
  };
}

async function fetchClaudeMarketplacesData() {
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
  const topByStars = sortByNumber(marketplaces, (item) => item.stars).slice(0, 20);
  const topByPluginCount = sortByNumber(marketplaces, (item) => item.pluginCount).slice(0, 20);
  const topByComposite = sortByNumber(marketplaces, (item) => item.compositeScore).slice(0, 20);

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
    topOwners,
    aisaCandidates,
    commonPatterns: [
      '高势能 marketplace 往往不是单个 skill，而是一组按主题组织的命令、插件和工作流集合。',
      '高星 marketplace 本质上是“分发基础设施”，比单 skill 更适合承接矩阵化扩张。',
      '描述里经常直接点名目标框架、目标平台和目标任务，降低搜索歧义。',
      '插件数量多的 marketplace 往往覆盖 1 个清晰主线，再配 2 到 4 个邻接场景。',
    ],
  };
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

async function fetchHermesData() {
  const helperPath = resolve(ROOT, 'scripts/parse-hermes-skill-atlas.py');
  const result = spawnSync('python3', [helperPath], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 16,
  });
  if (result.status !== 0) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
      if (existing?.hermes) {
        console.warn('Hermes refresh failed, reusing cached hermes dataset from previous market-ecosystem-report.json');
        return existing.hermes;
      }
    } catch {
      // Ignore cache read failures and surface the original error below.
    }
    throw new Error(result.stderr || result.stdout || 'parse-hermes-skill-atlas.py failed');
  }
  const parsed = JSON.parse(result.stdout);
  const skills = parsed.items.map((item) => {
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
  });
  const bundled = skills.filter((item) => item.type === 'bundled');
  const optional = skills.filter((item) => item.type === 'optional');
  const sections = countBy(skills, (item) => item.sectionTitle, 40);
  const tags = countBy(skills.flatMap((item) => item.tags.map((tag) => ({ tag }))), (item) => item.tag, 24);
  const topBundledByAisaFit = sortByNumber(
    bundled.map((item) => ({
      ...item,
      aisaOpportunityScore: Number((item.aisaFitScore * 0.45 + item.monetizationScore * 0.3 + item.factoryScore * 0.25).toFixed(2)),
    })),
    (item) => item.aisaOpportunityScore,
  ).slice(0, 25);
  const topOptionalByAisaFit = sortByNumber(
    optional.map((item) => ({
      ...item,
      aisaOpportunityScore: Number((item.aisaFitScore * 0.45 + item.monetizationScore * 0.3 + item.factoryScore * 0.25).toFixed(2)),
    })),
    (item) => item.aisaOpportunityScore,
  ).slice(0, 25);

  return {
    sourceUrl: parsed.sourceUrl,
    sourceDocUrl: parsed.sourceDocUrl || HERMES_CATALOG_URL,
    summary: {
      totalSkills: skills.length,
      bundledSkills: bundled.length,
      optionalSkills: optional.length,
      sections: new Set(skills.map((item) => item.sectionTitle)).size,
      topSection: sections[0]?.name ?? null,
      advertisedBundledSkills: parsed.advertisedBundledSkills ?? bundled.length,
      advertisedSkillCategories: parsed.advertisedSkillCategories ?? new Set(skills.map((item) => item.sectionTitle)).size,
    },
    categoryButtons: parsed.categoryButtons ?? [],
    sections,
    tags,
    bundled: topBundledByAisaFit,
    optional: topOptionalByAisaFit,
    commonPatterns: [
      'Hermes 官方 skill atlas 不是下载榜，而是“先看类别、再选具体 skill”的发现层。',
      '分类非常强调运行环境和工作流边界，例如 Apple / GitHub / MLOps / Research。',
      '高 AISA 适配项主要集中在 GitHub、Research、Productivity、Documents、Automation 这些高频外部工具边界。',
      'Apple / macOS 类 skill 价值高但平台限制强，更适合做专属 SKU 而不是旗舰总包。',
      `截至 ${new Date().toISOString().slice(0, 10)}，live guide 标注 ${parsed.advertisedBundledSkills ?? 0} 个 bundled skills，但官方 raw catalog 当前能结构化提取 ${bundled.length} 个 bundled rows，说明文档口径存在漂移。`,
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

async function buildReport() {
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
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

buildReport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
