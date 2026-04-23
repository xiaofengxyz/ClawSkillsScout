import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import { syncMarkdownDocx } from './lib/report-docx.mjs';

const ROOT = process.cwd();
const BASE_URL = 'https://clawhub.ai';
const USER_AGENT = 'Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/xiaofengxyz/ClawSkillsScout)';
const SORTS = ['downloads', 'stars', 'installs'];
const DETAIL_CONCURRENCY = 5;

const OUTPUT_JSON = resolve(ROOT, 'public/data/clawhub-plugin-report.json');
const OUTPUT_ZH = resolve(ROOT, 'reports/ClawHub_Plugin_Viral_Report_ZH.md');
const OUTPUT_ZH_PUBLIC = resolve(ROOT, 'public/reports/ClawHub_Plugin_Viral_Report_ZH.md');
const OUTPUT_EN = resolve(ROOT, 'reports/ClawHub_Plugin_Viral_Report_EN.md');
const OUTPUT_EN_PUBLIC = resolve(ROOT, 'public/reports/ClawHub_Plugin_Viral_Report_EN.md');

function compactSpaces(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeJsString(value) {
  return String(value ?? '')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

function parseBoolToken(value) {
  return value === '!0';
}

function parseStringArray(fragment) {
  if (!fragment) return [];
  return [...String(fragment).matchAll(/"([^"]+)"/g)].map((match) => decodeJsString(match[1]));
}

function matchGroup(regex, text, group = 1) {
  const match = regex.exec(text);
  return match?.[group] ?? null;
}

async function fetchText(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`${url} -> ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 900 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

function listUrl(sort) {
  return `${BASE_URL}/plugins?sort=${sort}&dir=desc`;
}

function extractListHrefs(html) {
  const hrefs = [...html.matchAll(/href="(\/plugins\/[^"]+)"/g)].map((match) => match[1]);
  const unique = [];
  const seen = new Set();
  for (const href of hrefs) {
    if (seen.has(href)) continue;
    seen.add(href);
    unique.push(href);
  }
  return unique;
}

function extractListItems(html) {
  const pattern =
    /displayName:"([^"]+)"[\s\S]*?family:"([^"]+)"[\s\S]*?latestVersion:"([^"]+)"[\s\S]*?name:"([^"]+)"[\s\S]*?ownerHandle:"([^"]+)"[\s\S]*?summary:"([^"]*)"/g;
  return [...html.matchAll(pattern)].map((match) => ({
    displayName: decodeJsString(match[1]),
    family: match[2],
    latestVersion: match[3],
    packageName: decodeJsString(match[4]),
    owner: match[5],
    summary: decodeJsString(match[6]),
  }));
}

function inferTheme(name, summary) {
  const text = `${name} ${summary}`.toLowerCase();
  if (/(guard|security|govern|vital|policy|approval|compliance|witness|biometric)/.test(text)) return 'Governance & Security';
  if (/(memory|session|knowledge|episodic|openviking|nowledge|gralkor|soul)/.test(text)) return 'Memory & Knowledge';
  if (/(channel|message|chat|whatsapp|wtt|comment|agent protocol|switchboard|primeta|imclaw)/.test(text)) return 'Channels & Messaging';
  if (/(crm|sales|marketing|lead|campaign|signalpipe|starplast|clarify)/.test(text)) return 'Business Ops & Growth';
  if (/(pay|payment|lifi|swap|algorand|icpswap|blockchain|token|storj)/.test(text)) return 'Commerce, Storage & Chain';
  if (/(router|workflow|parcel|recipes|mcp apps|plugin repo|tool plugin|openagent|delivery)/.test(text)) return 'Workflow & Integration';
  if (/(frontend|suite|app|workspace|base)/.test(text)) return 'Workspace & App Layer';
  return 'Infrastructure & Utilities';
}

function inferAisaFit(theme, name, summary) {
  const text = `${name} ${summary}`.toLowerCase();
  const base = {
    'Business Ops & Growth': 95,
    'Commerce, Storage & Chain': 94,
    'Governance & Security': 90,
    'Workflow & Integration': 89,
    'Channels & Messaging': 82,
    'Workspace & App Layer': 80,
    'Infrastructure & Utilities': 72,
    'Memory & Knowledge': 58,
  }[theme];
  let score = base;
  if (/(api|crm|sales|marketing|delivery|storage|swap|tracking|campaign|lead)/.test(text)) score += 3;
  if (/(memory|session|config|gateway|router|agent protocol)/.test(text)) score -= 6;
  return Math.max(30, Math.min(99, score));
}

function inferFactoryScore(theme, ownerPluginCount) {
  const base = {
    'Business Ops & Growth': 92,
    'Commerce, Storage & Chain': 91,
    'Governance & Security': 89,
    'Workflow & Integration': 88,
    'Channels & Messaging': 84,
    'Workspace & App Layer': 82,
    'Infrastructure & Utilities': 74,
    'Memory & Knowledge': 66,
  }[theme];
  return Math.max(45, Math.min(99, base + Math.min(6, ownerPluginCount - 1)));
}

function inferMonetizationScore(theme) {
  return {
    'Business Ops & Growth': 95,
    'Commerce, Storage & Chain': 94,
    'Governance & Security': 93,
    'Workflow & Integration': 90,
    'Channels & Messaging': 84,
    'Workspace & App Layer': 82,
    'Infrastructure & Utilities': 70,
    'Memory & Knowledge': 62,
  }[theme];
}

function normalizeRankings(rankingsBySort) {
  const byHref = new Map();
  for (const [sort, items] of Object.entries(rankingsBySort)) {
    items.forEach((item, index) => {
      const current = byHref.get(item.href) ?? {
        href: item.href,
        url: `${BASE_URL}${item.href}`,
        displayName: item.displayName,
        packageName: item.packageName,
        owner: item.owner,
        latestVersion: item.latestVersion,
        summary: item.summary,
        family: item.family,
        ranks: {},
      };
      current.ranks[sort] = index + 1;
      byHref.set(item.href, current);
    });
  }

  return [...byHref.values()].map((item) => {
    const presentSorts = SORTS.filter((sort) => item.ranks[sort]);
    const appearances = presentSorts.length;
    const sortedRanks = presentSorts.map((sort) => item.ranks[sort]).sort((left, right) => left - right);
    const bestRank = sortedRanks[0] ?? null;
    const worstRank = sortedRanks.at(-1) ?? null;
    const rankSpread = bestRank && worstRank ? worstRank - bestRank : 0;
    const bestSorts = presentSorts.filter((sort) => item.ranks[sort] === bestRank);
    const compositeScore = SORTS.reduce((total, sort) => total + (item.ranks[sort] ? 101 - item.ranks[sort] : 0), 0);
    return {
      ...item,
      appearances,
      bestRank,
      worstRank,
      rankSpread,
      bestSorts,
      compositeScore,
    };
  });
}

function parseDetail(html, fallback) {
  const ownerMatch = html.match(/owner:\$R\[\d+\]={handle:"([^"]+)",displayName:"([^"]*)"/);
  const staticMatch = html.match(/source:"([^"]+)",status:"([^"]+)",verdict:"([^"]+)"},llmAnalysis:/s);
  const llmMatch = html.match(/llmAnalysis:\$R\[\d+\]={checkedAt:\d+,confidence:"([^"]+)"[\s\S]*?model:"([^"]+)",status:"([^"]+)",summary:"([^"]+)"/s);
  const bundleSkillsRaw = matchGroup(/bundledSkills:\$R\[\d+\]=\[(.*?)\],capabilityTags:/s, html);
  const capabilityTagsRaw = matchGroup(/capabilityTags:\$R\[\d+\]=\[(.*?)\],channels:/s, html);
  const channelsRaw = matchGroup(/channels:\$R\[\d+\]=\[(.*?)\],commandNames:/s, html);
  const commandNamesRaw = matchGroup(/commandNames:\$R\[\d+\]=\[(.*?)\],configSchema:/s, html);
  const hooksRaw = matchGroup(/hooks:\$R\[\d+\]=\[(.*?)\],httpRouteCount:/s, html);
  const providersRaw = matchGroup(/providers:\$R\[\d+\]=\[(.*?)\],runtimeId:/s, html);
  const serviceNamesRaw = matchGroup(/serviceNames:\$R\[\d+\]=\[(.*?)\],setupEntry:/s, html);
  const toolNamesRaw = matchGroup(/toolNames:\$R\[\d+\]=\[(.*?)\]},channel:/s, html);
  const configSchema = matchGroup(/configSchema:(!0|!1),configUiHints:/, html);
  const configUiHints = matchGroup(/configUiHints:(!0|!1),executesCode:/, html);
  const executesCode = matchGroup(/executesCode:(!0|!1),hooks:/, html);
  const httpRouteCount = matchGroup(/httpRouteCount:(\d+),materializesDependencies:/, html);
  const materializesDependencies = matchGroup(/materializesDependencies:(!0|!1),providers:/, html);
  const setupEntry = matchGroup(/setupEntry:(!0|!1),toolNames:/, html);
  const channel = matchGroup(/},channel:"([^"]+)",compatibility:/, html);
  const builtWithOpenClawVersion = matchGroup(/builtWithOpenClawVersion:"([^"]+)"/, html);
  const pluginApiRange = matchGroup(/pluginApiRange:"([^"]+)"/, html);
  const displayName = matchGroup(/displayName:"([^"]+)",family:/, html);
  const family = matchGroup(/family:"([^"]+)",isOfficial:/, html);
  const isOfficial = matchGroup(/isOfficial:(!0|!1),latestReleaseId:/, html);
  const latestReleaseId = matchGroup(/latestReleaseId:"([^"]+)"/, html);
  const latestVersion = matchGroup(/latestVersion:"([^"]+)"/, html);
  const packageName = matchGroup(/latestVersion:"[^"]+",name:"([^"]+)"/, html);
  const runtimeId = matchGroup(/name:"[^"]+",runtimeId:"([^"]+)"/, html);
  const scanStatus = matchGroup(/runtimeId:"[^"]+",scanStatus:"([^"]+)"/, html);
  const statsMatch = html.match(/stats:\$R\[\d+\]={downloads:(\d+),installs:(\d+),stars:(\d+),versions:(\d+)}/);
  const summary = matchGroup(/stats:\$R\[\d+\]={downloads:\d+,installs:\d+,stars:\d+,versions:\d+},summary:"([^"]*)",tags:/, html);
  const releaseTag = matchGroup(/tags:\$R\[\d+\]={latest:"([^"]+)"}/, html);
  const verificationMatch = html.match(
    /verification:\$R\[\d+\]={hasProvenance:(!0|!1),scanStatus:"([^"]+)",scope:"([^"]+)",sourceCommit:"([^"]*)",sourceRepo:"([^"]*)",sourceTag:"([^"]*)",summary:"([^"]*)",tier:"([^"]+)"/,
  );

  if (!displayName || !family || !packageName) {
    return {
      ...fallback,
      detailStatus: 'partial',
      capabilityTags: [],
      channels: [],
      commandNames: [],
      hooks: [],
      providers: [],
      serviceNames: [],
      toolNames: [],
      bundledSkills: [],
      configSchema: false,
      configUiHints: false,
      executesCode: false,
      httpRouteCount: 0,
      materializesDependencies: false,
      setupEntry: false,
      builtWithOpenClawVersion: null,
      pluginApiRange: null,
      isOfficial: false,
      scanStatus: null,
      stats: { downloads: 0, installs: 0, stars: 0, versions: 0 },
      verification: null,
      ownerDisplayName: ownerMatch?.[2] ? decodeJsString(ownerMatch[2]) : fallback.owner,
      staticScan: staticMatch
        ? { source: staticMatch[1], status: staticMatch[2], verdict: staticMatch[3] }
        : null,
      llmAnalysis: llmMatch
        ? {
            confidence: llmMatch[1],
            model: llmMatch[2],
            status: llmMatch[3],
            summary: decodeJsString(llmMatch[4]),
          }
        : null,
    };
  }

  return {
    href: fallback.href,
    url: fallback.url,
    owner: ownerMatch?.[1] ?? fallback.owner,
    ownerDisplayName: ownerMatch?.[2] ? decodeJsString(ownerMatch[2]) : fallback.owner,
    displayName: decodeJsString(displayName),
    family,
    packageName: decodeJsString(packageName),
    summary: decodeJsString(summary ?? fallback.summary),
    latestVersion,
    releaseTag: releaseTag || latestVersion,
    runtimeId,
    detailStatus: 'full',
    bundledSkills: parseStringArray(bundleSkillsRaw),
    capabilityTags: parseStringArray(capabilityTagsRaw),
    channels: parseStringArray(channelsRaw),
    commandNames: parseStringArray(commandNamesRaw),
    configSchema: parseBoolToken(configSchema),
    configUiHints: parseBoolToken(configUiHints),
    executesCode: parseBoolToken(executesCode),
    hooks: parseStringArray(hooksRaw),
    httpRouteCount: Number(httpRouteCount ?? 0),
    materializesDependencies: parseBoolToken(materializesDependencies),
    providers: parseStringArray(providersRaw),
    serviceNames: parseStringArray(serviceNamesRaw),
    setupEntry: parseBoolToken(setupEntry),
    toolNames: parseStringArray(toolNamesRaw),
    channel,
    builtWithOpenClawVersion,
    pluginApiRange,
    isOfficial: parseBoolToken(isOfficial),
    latestReleaseId,
    scanStatus,
    stats: {
      downloads: Number(statsMatch?.[1] ?? 0),
      installs: Number(statsMatch?.[2] ?? 0),
      stars: Number(statsMatch?.[3] ?? 0),
      versions: Number(statsMatch?.[4] ?? 0),
    },
    verification: verificationMatch
      ? {
          hasProvenance: parseBoolToken(verificationMatch[1]),
          scanStatus: verificationMatch[2],
          scope: verificationMatch[3],
          sourceCommit: verificationMatch[4] || null,
          sourceRepo: verificationMatch[5] || null,
          sourceTag: verificationMatch[6] || null,
          summary: decodeJsString(verificationMatch[7]),
          tier: verificationMatch[8],
        }
      : null,
    staticScan: staticMatch
      ? { source: staticMatch[1], status: staticMatch[2], verdict: staticMatch[3] }
      : null,
    llmAnalysis: llmMatch
      ? {
          confidence: llmMatch[1],
          model: llmMatch[2],
          status: llmMatch[3],
          summary: decodeJsString(llmMatch[4]),
        }
      : null,
  };
}

function countBy(items, selector, limit = 12) {
  const counts = new Map();
  for (const item of items) {
    const key = selector(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || String(left[0]).localeCompare(String(right[0])))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function ownerProfiles(plugins) {
  const grouped = new Map();
  for (const plugin of plugins) {
    const current = grouped.get(plugin.owner) ?? {
      author: plugin.owner,
      ownerDisplayName: plugin.ownerDisplayName,
      totalPlugins: 0,
      codePlugins: 0,
      bundlePlugins: 0,
      cleanPlugins: 0,
      sourceLinkedPlugins: 0,
      averageCompositeScore: 0,
      themes: new Map(),
      topPlugins: [],
    };
    current.totalPlugins += 1;
    if (plugin.family === 'code-plugin') current.codePlugins += 1;
    if (plugin.family === 'bundle-plugin') current.bundlePlugins += 1;
    if (plugin.scanStatus === 'clean' || plugin.llmAnalysis?.status === 'clean') current.cleanPlugins += 1;
    if (plugin.verification?.tier === 'source-linked') current.sourceLinkedPlugins += 1;
    current.averageCompositeScore += plugin.compositeScore;
    current.themes.set(plugin.theme, (current.themes.get(plugin.theme) ?? 0) + 1);
    current.topPlugins.push({
      href: plugin.href,
      name: plugin.displayName,
      family: plugin.family,
      theme: plugin.theme,
      compositeScore: plugin.compositeScore,
      scanStatus: plugin.scanStatus,
      url: plugin.url,
    });
    grouped.set(plugin.owner, current);
  }

  return [...grouped.values()]
    .map((item) => ({
      author: item.author,
      ownerDisplayName: item.ownerDisplayName,
      totalPlugins: item.totalPlugins,
      codePlugins: item.codePlugins,
      bundlePlugins: item.bundlePlugins,
      cleanPlugins: item.cleanPlugins,
      sourceLinkedPlugins: item.sourceLinkedPlugins,
      averageCompositeScore: Number((item.averageCompositeScore / item.totalPlugins).toFixed(2)),
      primaryThemes: [...item.themes.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
      topPlugins: item.topPlugins
        .sort((a, b) => b.compositeScore - a.compositeScore || a.name.localeCompare(b.name))
        .slice(0, 5),
    }))
    .sort((a, b) => b.totalPlugins - a.totalPlugins || b.averageCompositeScore - a.averageCompositeScore || a.author.localeCompare(b.author));
}

function buildAisaCandidates(plugins, authorCounts) {
  return plugins
    .map((plugin) => {
      const aisaFitScore = inferAisaFit(plugin.theme, plugin.displayName, plugin.summary);
      const factoryScore = inferFactoryScore(plugin.theme, authorCounts.get(plugin.owner) ?? 1);
      const monetizationScore = inferMonetizationScore(plugin.theme);
      const riskPenalty = plugin.scanStatus === 'suspicious' || plugin.llmAnalysis?.status === 'suspicious' ? 12 : 0;
      const infraPenalty = plugin.theme === 'Memory & Knowledge' ? 10 : 0;
      const verificationBoost = plugin.verification?.tier === 'source-linked' ? 4 : 0;
      const opportunityScore = Number(
        (aisaFitScore * 0.45 + monetizationScore * 0.3 + factoryScore * 0.15 + verificationBoost - riskPenalty - infraPenalty).toFixed(2),
      );
      return {
        href: plugin.href,
        url: plugin.url,
        owner: plugin.owner,
        name: plugin.displayName,
        summary: plugin.summary,
        family: plugin.family,
        theme: plugin.theme,
        scanStatus: plugin.scanStatus,
        verificationTier: plugin.verification?.tier ?? null,
        aisaFitScore,
        monetizationScore,
        factoryScore,
        opportunityScore,
        whyItFits:
          plugin.theme === 'Business Ops & Growth'
            ? '天然对应高价值垂直 API：CRM、销售线索、营销活动、外呼管道都可以被拆成付费接口。'
            : plugin.theme === 'Governance & Security'
              ? '安全审计、策略校验、批准门禁非常适合做高客单价 AISA 安全能力层。'
              : plugin.theme === 'Commerce, Storage & Chain'
                ? '链上、支付、存储、物流等能力更像稳定 API，而不是必须驻留本地的插件。'
                : plugin.theme === 'Workflow & Integration'
                  ? '外部系统连接器和运营动作容易被抽象成 AISA command center。'
                  : '当前更像插件而不是 API，但其中有部分动作可以拆成可收费的远程能力。',
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore || a.name.localeCompare(b.name))
    .slice(0, 20);
}

function table(rows) {
  if (!rows.length) return '';
  const header = Object.keys(rows[0]);
  const lines = [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
  ];
  for (const row of rows) {
    lines.push(`| ${header.map((key) => String(row[key] ?? '')).join(' | ')} |`);
  }
  return `${lines.join('\n')}\n`;
}

function formatDatasetDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDatasetDateEn(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

function buildRankingTable(items, labels) {
  return items.map((item) => ({
    [labels.rank]: item.rank,
    [labels.plugin]: item.name,
    [labels.owner]: item.owner,
    [labels.family]: item.family === 'bundle-plugin' ? labels.bundle : labels.code,
    [labels.theme]: item.theme,
    [labels.verification]: item.verificationTier ?? 'n/a',
  }));
}

function buildZhReport(report, datasetDate) {
  const top10 = report.rankings.compositeTop.slice(0, 10).map((item, index) => ({
    排名: index + 1,
    Plugin: item.displayName,
    作者: item.owner,
    类型: item.family === 'bundle-plugin' ? 'Bundle' : 'Code',
    主题: item.theme,
    扫描: item.scanStatus ?? 'unknown',
    验证: item.verification?.tier ?? 'n/a',
  }));
  const authors = report.authors.slice(0, 10).map((item, index) => ({
    排名: index + 1,
    作者: item.author,
    插件数: item.totalPlugins,
    Code: item.codePlugins,
    Bundle: item.bundlePlugins,
    主主题: item.primaryThemes.join(' / '),
  }));
  const candidates = report.aisaCandidates.slice(0, 10).map((item, index) => ({
    排名: index + 1,
    Plugin: item.name,
    作者: item.owner,
    主题: item.theme,
    机会分: item.opportunityScore,
    说明: item.whyItFits,
  }));
  const topDownloads = buildRankingTable(report.rankings.downloads.slice(0, 10), {
    rank: '排名',
    plugin: 'Plugin',
    owner: '作者',
    family: '类型',
    theme: '主题',
    verification: '验证',
    bundle: 'Bundle',
    code: 'Code',
  });
  const topInstalls = buildRankingTable(report.rankings.installs.slice(0, 10), {
    rank: '排名',
    plugin: 'Plugin',
    owner: '作者',
    family: '类型',
    theme: '主题',
    verification: '验证',
    bundle: 'Bundle',
    code: 'Code',
  });
  const topStars = buildRankingTable(report.rankings.stars.slice(0, 10), {
    rank: '排名',
    plugin: 'Plugin',
    owner: '作者',
    family: '类型',
    theme: '主题',
    verification: '验证',
    bundle: 'Bundle',
    code: 'Code',
  });
  const divergence = report.rankings.divergenceHighlights.slice(0, 10).map((item, index) => ({
    排名: index + 1,
    Plugin: item.displayName,
    作者: item.owner,
    最佳榜位: item.bestRank,
    最差榜位: item.worstRank,
    排名跨度: item.rankSpread,
    最强榜单: item.bestSorts.join(' / '),
  }));

  return `# ClawHub Plugin 爆款报告

- 生成时间：${report.generatedAt}
- 分析对象：ClawHub 插件目录（公开排序页 + 详情页 SSR 数据）
- 数据日期：${formatDatasetDate(datasetDate)}

## 一句话结论

ClawHub 的 plugin 生态仍然非常早期，但公开目录已经明确把 plugin 放进 "downloads / installs / stars" 三个排序面来分发。也就是说，爆款判断不能只看 "Code / Bundle" 类型，而要同时看三榜排位、验证状态、安全扫描、能力边界、运行时一致性和作者是否在持续扩张同一主线。

## 关键发现

1. ClawHub 现在公开展示的 plugin 发现层，至少包含四个维度：三套排序榜单、"Code / Bundle" 类型过滤、"Verified only" 过滤、"Executes code" 风险过滤。
2. 真正占据榜首的，依然以 "Code Plugin" 为主；"Bundle Plugin" 更像在承接说明型或跨宿主分发，而不是当前的主流爆款形态。
3. 爆款 plugin 的名字几乎都在直接说“连接哪一个系统”或“解决哪一个运维动作”，而不是抽象概念名。
4. 插件详情页里的 "Security Scan"、"VirusTotal"、"OpenClaw verdict"、"Runtime ID"、"Compatibility"、"Capabilities"、"source-linked" 等信号，已经是 plugin 用户判断是否安装的核心表面。
5. 高产作者不是乱发插件，而是围绕一个平台或一个运维主线，连续堆出多个邻接插件。
6. 适合改造成 AISA API 的，不是最底层的记忆/路由内核，而是安全治理、业务增长、支付链路、存储物流、外部 SaaS 连接器。

## 为什么现在的 Plugin 爆款判断不能照搬 Skill

- Skill 爆款依赖下载、收藏、安装转化这些显性指标。
- Plugin 赛道当前虽然有三套公开排序，但详情页对大多数 plugin 没有直接暴露可读的公开数值，因此我们要把 '三榜顺序 + 插件家族类型 + 验证状态 + 版本成熟度 + 作者产能' 组合起来看。
- 这也是为什么本次沉淀到 packager skill 的，不只是“怎么打包”，而是“怎么把插件做得更像一个可信、可扩张、可持续上榜的商品”。

## Downloads 排行 Top 10

${table(topDownloads)}
## Installs 排行 Top 10

${table(topInstalls)}
## Stars 排行 Top 10

${table(topStars)}

## Top 10 Plugin

${table(top10)}
## 三榜差异最大的 Plugin

${table(divergence)}
## 爆款 Plugin 共性

- 标题直接点系统、场景、结果，例如 channel、CRM、governance、security、parcel、payment，而不是抽象喊“agent upgrade”。
- 描述会把安装后真正发生的事情说清楚，例如写配置、重启 gateway、接入哪个后端、是否拉远程资源。
- 结构上优先是 "code-plugin"，因为 plugin 用户更愿意为“真实能力接入”而不是“提示词包装”买单。
- 能过 "source-linked" 验证的插件，冷启动信任成本明显更低。
- 安全/治理/通信/业务连接器最容易形成强需求入口。

## 平台排名机制

- 排名面：ClawHub 已公开提供 "downloads"、"installs"、"stars" 三套 plugin 排序入口，发布时必须默认自己会同时被这三种发现逻辑审视。
- 过滤面："Code / Bundle"、"Verified only"、"Executes code" 不只是展示选项，而是用户做预筛的高频入口。
- 信任面：详情页里的 "Security Scan"、"VirusTotal"、"OpenClaw verdict"、"source-linked"、"Runtime ID"、"Compatibility"、"Capabilities" 一起决定冷启动安装意愿。
- 转化面：标题是否任务化、README 是否说清副作用、manifest 是否与能力声明一致，都会直接影响安装前判断。

## 爆款机制与发布动作

- 先抢一个高价值系统边界，再围绕同一主线发布 3 到 5 个相邻插件，比随机发散更容易形成作者分发资产。
- "Code Plugin" 适合承接真实运行时能力，"Bundle Plugin" 更适合承接说明型内容、跨宿主技能包和轻运行时分发；不要混淆。
- 发布时要把副作用、鉴权、写配置、重启、远程资源下载这些动作写明，否则用户和扫描器都会提高警惕。
- 页面和包内容必须同构：标题、描述、manifest、README、能力标签、runtimeId、实际代码行为不能互相打架。

## 爆款作者画像

${table(authors)}
## 高产作者的方法论能不能复制

可以复制，但复制的是“主线工厂”，不是单个题材。

- 可复制部分：先选一个高频平台或高风险动作，连续发 3 到 5 个相邻插件，占住一个心智带。
- 不可直接照抄部分：如果插件依赖强本地状态、深度 OpenClaw 内核、复杂安装副作用，迁移成本会很高。
- 最优复制方式：优先复制外部系统连接器、治理护栏、运营动作插件，因为这些更容易 API 化，也更容易跨平台复用。

## AISA API 最值得切的 10 个方向

${table(candidates)}
## AISA API 怎么在 Plugin 赛道做爆款

1. 先做“远程价值最强、驻留依赖最弱”的能力。
2. 先上安全治理、销售增长、支付链路、物流/存储、SaaS 连接器，再考虑记忆内核。
3. 每个方向先发 1 个旗舰 command center，再拆 2 到 4 个单任务 SKU。
4. 对外页面必须把副作用、鉴权方式、远程数据流和验证来源写清楚，否则 plugin 用户不会信。
5. 同一个主线上要连续发作品，作者名本身也会变成分发资产。

## 选品安排

- 第一梯队：Governance & Security、Business Ops & Growth、Commerce / Storage / Chain。
- 第二梯队：Workflow & Integration、Channels & Messaging。
- 第三梯队：Workspace & App Layer。
- 暂缓：Memory & Knowledge、纯路由/协议内核，这些更适合做平台能力而不是第一波 API 爆款。

## 方法论如何内化到 Packager Skill

- 打包不再只是“结构正确”，而是要让插件在发布前就具备强标题、强验证、强边界感、强可信度。
- 平台通用层：名称必须是任务/系统词，描述必须直说安装后做什么，README 必须解释副作用和信任来源。
- ClawHub 特化层：强调三榜分发、source-linked、scan coherence、capability/runtimeId 一致性，以及 bundle/code 两种模式的清晰边界。
- Claude / Hermes / AgentSkill 特化层：分别照顾 repo 信任、目录可读性、quality/security/rating 这些平台偏好的排序信号。
`;
}

function buildEnReport(report, datasetDate) {
  const top10 = report.rankings.compositeTop.slice(0, 10).map((item, index) => ({
    Rank: index + 1,
    Plugin: item.displayName,
    Owner: item.owner,
    Family: item.family,
    Theme: item.theme,
    Scan: item.scanStatus ?? 'unknown',
    Verification: item.verification?.tier ?? 'n/a',
  }));
  const candidates = report.aisaCandidates.slice(0, 10).map((item, index) => ({
    Rank: index + 1,
    Plugin: item.name,
    Owner: item.owner,
    Theme: item.theme,
    Opportunity: item.opportunityScore,
  }));
  const topDownloads = buildRankingTable(report.rankings.downloads.slice(0, 10), {
    rank: 'Rank',
    plugin: 'Plugin',
    owner: 'Owner',
    family: 'Family',
    theme: 'Theme',
    verification: 'Verification',
    bundle: 'Bundle',
    code: 'Code',
  });
  const topInstalls = buildRankingTable(report.rankings.installs.slice(0, 10), {
    rank: 'Rank',
    plugin: 'Plugin',
    owner: 'Owner',
    family: 'Family',
    theme: 'Theme',
    verification: 'Verification',
    bundle: 'Bundle',
    code: 'Code',
  });
  const topStars = buildRankingTable(report.rankings.stars.slice(0, 10), {
    rank: 'Rank',
    plugin: 'Plugin',
    owner: 'Owner',
    family: 'Family',
    theme: 'Theme',
    verification: 'Verification',
    bundle: 'Bundle',
    code: 'Code',
  });
  const divergence = report.rankings.divergenceHighlights.slice(0, 10).map((item, index) => ({
    Rank: index + 1,
    Plugin: item.displayName,
    Owner: item.owner,
    BestRank: item.bestRank,
    WorstRank: item.worstRank,
    Spread: item.rankSpread,
    BestBoards: item.bestSorts.join(' / '),
  }));

  return `# ClawHub Plugin Viral Report

- Generated at: ${report.generatedAt}
- Dataset date: ${formatDatasetDateEn(datasetDate)}
- Source: public ClawHub plugin ranking pages plus plugin detail SSR payloads

## Executive Summary

The ClawHub plugin market is still early, but the public directory now clearly exposes three discovery boards for plugins: "downloads", "installs", and "stars". That means plugin breakout analysis should not stop at "code vs bundle". It has to combine board position, verification quality, scanner posture, manifest/runtime coherence, and repeatable author-lane production.

## What Actually Wins

1. Public discovery already happens across separate downloads, installs, and stars sort surfaces.
2. Code plugins still dominate the top of the market, while bundle plugins work better as lighter distribution shells.
3. Strong plugin names describe the system or operational job directly.
4. Source-linked verification plus coherent security scan outputs are major trust accelerators.
5. The best authors ship adjacent plugins in one clear lane instead of random one-offs.
6. Security, governance, growth ops, payments, storage, and workflow connectors are the best AISA-conversion lanes.

## Downloads Board

${table(topDownloads)}
## Installs Board

${table(topInstalls)}
## Stars Board

${table(topStars)}

## Top Plugins

${table(top10)}
## Biggest Board Spread

${table(divergence)}
## Best AISA Conversion Targets

${table(candidates)}
## Repeatable Playbook

- Publish for all three ClawHub boards, not just one list view.
- Ship plugins that connect to a concrete external system or decision surface.
- Explain side effects and setup paths clearly.
- Keep plugin scope tight enough that verification reads as coherent.
- Turn one high-value lane into a multi-plugin factory.
- Package for trust, not just for parser correctness.
`;
}

async function main() {
  const datasetDate = new Date();
  const rankingsBySort = {};

  for (const sort of SORTS) {
    const html = await fetchText(listUrl(sort));
    const hrefs = extractListHrefs(html);
    const items = extractListItems(html);
    if (hrefs.length !== items.length) {
      throw new Error(`Plugin list parse mismatch for ${sort}: hrefs=${hrefs.length}, items=${items.length}`);
    }
    rankingsBySort[sort] = items.map((item, index) => ({
      ...item,
      href: hrefs[index],
    }));
  }

  const rankedPlugins = normalizeRankings(rankingsBySort);
  const detailLimit = pLimit(DETAIL_CONCURRENCY);
  let completedDetails = 0;
  const detailedPlugins = await Promise.all(
    rankedPlugins.map((plugin) =>
      detailLimit(async () => {
        try {
          const html = await fetchText(plugin.url);
          completedDetails += 1;
          if (completedDetails % 10 === 0 || completedDetails === rankedPlugins.length) {
            console.log(`Parsed plugin details: ${completedDetails}/${rankedPlugins.length}`);
          }
          return parseDetail(html, plugin);
        } catch (error) {
          completedDetails += 1;
          console.warn(`Falling back to partial plugin detail for ${plugin.href}: ${error instanceof Error ? error.message : String(error)}`);
          if (completedDetails % 10 === 0 || completedDetails === rankedPlugins.length) {
            console.log(`Parsed plugin details: ${completedDetails}/${rankedPlugins.length}`);
          }
          return parseDetail('', plugin);
        }
      }),
    ),
  );

  const authorCounts = new Map();
  for (const plugin of detailedPlugins) {
    authorCounts.set(plugin.owner, (authorCounts.get(plugin.owner) ?? 0) + 1);
  }

  const plugins = detailedPlugins
    .map((plugin) => ({
      ...plugin,
      theme: inferTheme(plugin.displayName, plugin.summary),
    }))
    .map((plugin) => ({
      ...plugin,
      bestRank: plugin.bestRank,
      worstRank: plugin.worstRank,
      rankSpread: plugin.rankSpread,
      bestSorts: plugin.bestSorts,
      compositeScore:
        SORTS.reduce((total, sort) => total + (plugin.ranks?.[sort] ? 101 - plugin.ranks[sort] : 0), 0) +
        (plugin.verification?.tier === 'source-linked' ? 8 : 0) +
        (plugin.scanStatus === 'clean' ? 6 : 0) +
        Math.min(8, plugin.stats.versions),
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore || a.displayName.localeCompare(b.displayName));

  const authors = ownerProfiles(plugins);
  const aisaCandidates = buildAisaCandidates(plugins, authorCounts);
  const topThemes = countBy(plugins, (plugin) => plugin.theme, 8);
  const topCapabilityTags = countBy(plugins.flatMap((plugin) => plugin.capabilityTags.map((tag) => ({ tag }))), (item) => item.tag, 12);
  const identicalRankings = SORTS.every(
    (sort) =>
      rankingsBySort[sort].map((item) => item.href).join('|') === rankingsBySort.downloads.map((item) => item.href).join('|'),
  );
  const pluginByHref = new Map(plugins.map((plugin) => [plugin.href, plugin]));
  const rankingBoard = (sort) =>
    rankingsBySort[sort].map((item, index) => {
      const detail = pluginByHref.get(item.href);
      return {
        rank: index + 1,
        href: item.href,
        url: `${BASE_URL}${item.href}`,
        name: detail?.displayName ?? item.displayName,
        owner: detail?.owner ?? item.owner,
        family: detail?.family ?? item.family,
        theme: detail?.theme ?? inferTheme(item.displayName, item.summary),
        scanStatus: detail?.scanStatus ?? null,
        verificationTier: detail?.verification?.tier ?? null,
        bestRank: detail?.bestRank ?? index + 1,
        worstRank: detail?.worstRank ?? index + 1,
        rankSpread: detail?.rankSpread ?? 0,
        bestSorts: detail?.bestSorts ?? [sort],
      };
    });
  const divergenceHighlights = [...plugins]
    .filter((plugin) => plugin.rankSpread > 0)
    .sort((left, right) => right.rankSpread - left.rankSpread || left.bestRank - right.bestRank || left.displayName.localeCompare(right.displayName))
    .slice(0, 20);

  const report = {
    generatedAt: new Date().toISOString(),
    sources: SORTS.map((sort) => listUrl(sort)),
    methodology: {
      note: 'ClawHub publicly exposes plugin sorting by downloads, installs, and stars, but detail SSR payloads still expose little or no readable public count data for many plugins. This report therefore weights board position, verification quality, scan status, category fit, and author production density.',
      dataDate: formatDatasetDate(datasetDate),
      identicalRankingOrders: identicalRankings,
    },
    summary: {
      totalPlugins: plugins.length,
      codePlugins: plugins.filter((plugin) => plugin.family === 'code-plugin').length,
      bundlePlugins: plugins.filter((plugin) => plugin.family === 'bundle-plugin').length,
      sourceLinkedPlugins: plugins.filter((plugin) => plugin.verification?.tier === 'source-linked').length,
      cleanPlugins: plugins.filter((plugin) => plugin.scanStatus === 'clean' || plugin.llmAnalysis?.status === 'clean').length,
      suspiciousPlugins: plugins.filter((plugin) => plugin.scanStatus === 'suspicious' || plugin.llmAnalysis?.status === 'suspicious').length,
      executesCodePlugins: plugins.filter((plugin) => plugin.executesCode).length,
      publicStatsZeroPlugins: plugins.filter(
        (plugin) => plugin.stats.downloads === 0 && plugin.stats.installs === 0 && plugin.stats.stars === 0,
      ).length,
      topDownloadsPlugin: rankingBoard('downloads')[0]?.name ?? null,
      topInstallsPlugin: rankingBoard('installs')[0]?.name ?? null,
      topStarsPlugin: rankingBoard('stars')[0]?.name ?? null,
      topTheme: topThemes[0]?.name ?? null,
      topAuthor: authors[0]?.author ?? null,
    },
    rankings: {
      downloads: rankingBoard('downloads'),
      stars: rankingBoard('stars'),
      installs: rankingBoard('installs'),
      divergenceHighlights,
      compositeTop: plugins.slice(0, 20),
    },
    topThemes,
    topCapabilityTags,
    plugins,
    authors,
    aisaCandidates,
    mechanics: {
      rankingMechanics: [
        'ClawHub plugin discovery now spans separate downloads, installs, and stars boards.',
        'Type filters such as code-plugin vs bundle-plugin change how users narrow the catalog before click-through.',
        'Verified-only and executes-code filters function as practical trust and risk gates, not cosmetic toggles.',
        'Manifest/runtime coherence matters because detail pages surface runtime ID, capabilities, compatibility, and security scan data together.',
      ],
      breakoutMechanics: [
        'Task-first or system-first titles outperform abstract product names.',
        'Code plugins lead when they expose a real runtime integration or operational action.',
        'Focused sibling ladders outperform scattered one-off plugin releases.',
        'Security, governance, commerce, messaging, and workflow connectors remain the most repeatable plugin lanes.',
      ],
      trustMechanics: [
        'Source-linked provenance reduces cold-start trust friction.',
        'Security Scan, VirusTotal, and OpenClaw verdicts are now part of the conversion surface.',
        'Capability tags, runtimeId, and README copy should describe the same real behavior.',
        'Side effects such as config writes, gateway restarts, remote fetches, or persistent storage need to be declared explicitly.',
      ],
      publishMoves: [
        'Package for all three boards instead of optimizing for a single list view.',
        'Choose code-plugin vs bundle-plugin based on the true runtime surface, not on convenience.',
        'Keep one flagship plugin plus narrower siblings in the same lane to compound author trust.',
        'Align title, description, manifest, README, and shipped files before upload.',
      ],
    },
    viralPlaybook: {
      commonFactors: [
        'Plugin names win when they describe a concrete external system or admin action.',
        'Source-linked verification and scan coherence matter more than decorative copy.',
        'Code plugins dominate because users expect real runtime leverage from plugins.',
        'High-potential plugins explain side effects, setup paths, and trust boundaries clearly.',
        'Winning authors build focused plugin factories around one lane instead of shipping disconnected experiments.',
      ],
      authorPatterns: [
        'High-output authors cluster around a single theme and release adjacent plugins under one identity.',
        'Authors that publish governance, communication, or growth plugins create a stronger operational brand than generic “AI helper” authors.',
        'A small number of authors already show factory behavior by shipping multiple code plugins with similar install semantics.',
      ],
      aisaMoves: [
        'Turn business-growth, CRM, logistics, storage, and governance plugins into remote command-center APIs first.',
        'Use one flagship API lane plus 2-4 narrower SKU variants to create a plugin-to-API factory.',
        'Keep memory-core and low-level routing plugins as later-stage infrastructure rather than first-wave AISA products.',
      ],
    },
  };

  const zhReport = buildZhReport(report, datasetDate);
  const enReport = buildEnReport(report, datasetDate);

  for (const path of [OUTPUT_JSON, OUTPUT_ZH, OUTPUT_ZH_PUBLIC, OUTPUT_EN, OUTPUT_EN_PUBLIC]) {
    await mkdir(dirname(path), { recursive: true });
  }

  await writeFile(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(OUTPUT_ZH, `${zhReport}\n`, 'utf8');
  await writeFile(OUTPUT_ZH_PUBLIC, `${zhReport}\n`, 'utf8');
  await writeFile(OUTPUT_EN, `${enReport}\n`, 'utf8');
  await writeFile(OUTPUT_EN_PUBLIC, `${enReport}\n`, 'utf8');
  syncMarkdownDocx(ROOT, [OUTPUT_ZH, OUTPUT_ZH_PUBLIC, OUTPUT_EN, OUTPUT_EN_PUBLIC]);

  console.log(`Wrote ClawHub plugin report with ${plugins.length} plugins to ${OUTPUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
