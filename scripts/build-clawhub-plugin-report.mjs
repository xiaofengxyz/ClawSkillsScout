import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import { syncMarkdownDocx } from './lib/report-docx.mjs';

const ROOT = process.cwd();
const BASE_URL = 'https://clawhub.ai';
const USER_AGENT = 'Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/xiaofengxyz/ClawSkillsScout)';
const DETAIL_CONCURRENCY = 5;
const LISTING_SURFACES = ['all-types', 'code-plugins', 'bundle-plugins', 'verified-only', 'executes-code'];

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

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && compactSpaces(item)) : [];
}

async function fileExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
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

function listUrl() {
  return `${BASE_URL}/plugins`;
}

function isJsonArtifact(value) {
  return compactSpaces(value).toLowerCase().endsWith('.json');
}

function isPluginDetailHref(href) {
  if (typeof href !== 'string') return false;
  if (!/^\/plugins\/[^?#]+$/.test(href)) return false;
  const slug = href.split('/').pop() ?? '';
  return !isJsonArtifact(slug);
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

function isValidListItem(item) {
  return !isJsonArtifact(item.displayName) && !isJsonArtifact(item.packageName);
}

function sanitizeCatalogEntries(hrefs, items) {
  const filteredHrefs = hrefs.filter(isPluginDetailHref);
  const filteredItems = items.filter(isValidListItem);

  if (filteredHrefs.length !== filteredItems.length) {
    throw new Error(`Plugin list parse mismatch after filtering: hrefs=${filteredHrefs.length}, items=${filteredItems.length}`);
  }

  return filteredItems.map((item, index) => ({
    ...item,
    href: filteredHrefs[index],
    url: `${BASE_URL}${filteredHrefs[index]}`,
    catalogRank: index + 1,
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
      href: fallback.href,
      url: fallback.url,
      owner: fallback.owner,
      ownerDisplayName: fallback.owner,
      displayName: fallback.displayName,
      family: fallback.family,
      packageName: fallback.packageName,
      summary: fallback.summary,
      latestVersion: fallback.latestVersion,
      releaseTag: fallback.latestVersion,
      runtimeId: null,
      detailStatus: 'partial',
      catalogRank: fallback.catalogRank,
      bundledSkills: [],
      capabilityTags: [],
      channels: [],
      commandNames: [],
      hooks: [],
      providers: [],
      serviceNames: [],
      toolNames: [],
      configSchema: false,
      configUiHints: false,
      executesCode: false,
      httpRouteCount: 0,
      materializesDependencies: false,
      setupEntry: false,
      channel: null,
      builtWithOpenClawVersion: null,
      pluginApiRange: null,
      isOfficial: false,
      latestReleaseId: null,
      scanStatus: null,
      stats: { downloads: 0, installs: 0, stars: 0, versions: 0 },
      verification: null,
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
    catalogRank: fallback.catalogRank,
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

function normalizeDetailFromExisting(existing, fallback) {
  if (!existing) {
    return parseDetail('', fallback);
  }

  return {
    href: fallback.href,
    url: fallback.url,
    owner: compactSpaces(existing.owner ?? fallback.owner),
    ownerDisplayName: compactSpaces(existing.ownerDisplayName ?? existing.owner ?? fallback.owner),
    displayName: compactSpaces(existing.displayName ?? existing.name ?? fallback.displayName),
    family: compactSpaces(existing.family ?? fallback.family),
    packageName: compactSpaces(existing.packageName ?? fallback.packageName),
    summary: compactSpaces(existing.summary ?? fallback.summary),
    latestVersion: compactSpaces(existing.latestVersion ?? fallback.latestVersion),
    releaseTag: compactSpaces(existing.releaseTag ?? existing.latestVersion ?? fallback.latestVersion),
    runtimeId: compactSpaces(existing.runtimeId ?? ''),
    detailStatus: compactSpaces(existing.detailStatus ?? 'cached'),
    catalogRank: toNumber(existing.catalogRank ?? fallback.catalogRank) || fallback.catalogRank,
    bundledSkills: stringArray(existing.bundledSkills),
    capabilityTags: stringArray(existing.capabilityTags),
    channels: stringArray(existing.channels),
    commandNames: stringArray(existing.commandNames),
    hooks: stringArray(existing.hooks),
    providers: stringArray(existing.providers),
    serviceNames: stringArray(existing.serviceNames),
    toolNames: stringArray(existing.toolNames),
    configSchema: Boolean(existing.configSchema),
    configUiHints: Boolean(existing.configUiHints),
    executesCode: Boolean(existing.executesCode),
    httpRouteCount: toNumber(existing.httpRouteCount),
    materializesDependencies: Boolean(existing.materializesDependencies),
    setupEntry: Boolean(existing.setupEntry),
    channel: compactSpaces(existing.channel ?? ''),
    builtWithOpenClawVersion: compactSpaces(existing.builtWithOpenClawVersion ?? ''),
    pluginApiRange: compactSpaces(existing.pluginApiRange ?? ''),
    isOfficial: Boolean(existing.isOfficial),
    latestReleaseId: compactSpaces(existing.latestReleaseId ?? ''),
    scanStatus: compactSpaces(existing.scanStatus ?? ''),
    stats: {
      downloads: toNumber(existing.stats?.downloads),
      installs: toNumber(existing.stats?.installs),
      stars: toNumber(existing.stats?.stars),
      versions: toNumber(existing.stats?.versions),
    },
    verification: existing.verification ?? null,
    staticScan: existing.staticScan ?? null,
    llmAnalysis: existing.llmAnalysis ?? null,
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
      catalogRank: plugin.catalogRank,
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
        .sort((a, b) => b.compositeScore - a.compositeScore || a.catalogRank - b.catalogRank || a.name.localeCompare(b.name))
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

function signalSummary(item, language) {
  const labels = [`#${item.catalogRank}`];
  const verificationTier = item.verificationTier ?? item.verification?.tier ?? null;
  if (verificationTier) {
    labels.push(verificationTier);
  }
  if (item.scanStatus) {
    labels.push(item.scanStatus);
  }
  if (item.executesCode) {
    labels.push(language === 'zh' ? '执行代码' : 'executes-code');
  }
  if (item.publicStatsZero) {
    labels.push(language === 'zh' ? '详情页公开计数缺失' : 'public-stats-hidden');
  }
  return labels.join(' / ');
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

function buildSurfaceTable(items, language, limit = 10) {
  return items.slice(0, limit).map((item) => ({
    [language === 'zh' ? '排名' : 'Rank']: item.rank,
    Plugin: item.name,
    [language === 'zh' ? '作者' : 'Owner']: item.owner,
    [language === 'zh' ? '类型' : 'Family']: item.family === 'bundle-plugin' ? 'Bundle' : 'Code',
    [language === 'zh' ? '信号' : 'Signals']: signalSummary(item, language),
  }));
}

function buildCompositeTable(items, language, limit = 10) {
  return items.slice(0, limit).map((item, index) => ({
    [language === 'zh' ? '排名' : 'Rank']: index + 1,
    Plugin: item.displayName,
    [language === 'zh' ? '作者' : 'Owner']: item.owner,
    [language === 'zh' ? '分数' : 'Score']: item.compositeScore,
    [language === 'zh' ? '信号' : 'Signals']: signalSummary(item, language),
  }));
}

function buildZhReport(report, datasetDate) {
  const topAuthors = report.authors.slice(0, 10).map((item, index) => ({
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

  return `# ClawHub Plugin 情报报告

- 生成时间：${report.generatedAt}
- 分析对象：ClawHub plugin 目录（公开目录页 + plugin 详情页 SSR 数据）
- 数据日期：${formatDatasetDate(datasetDate)}

## 一句话结论

截至 ${report.methodology.dataDate}，ClawHub 的 plugin 页面公开可见的是目录顺序、\`All types / Code plugins / Bundle plugins\` 过滤，以及 \`Verified only / Executes code\` 过滤；没有像 skill 页面那样明确公开 \`downloads / stars / installs\` 三套排序。因此 plugin 爆款判断应该回到真实可见面：目录曝光、类型过滤、验证状态、安全扫描、运行时边界和作者工厂。

## 关键发现

1. 当前 plugin 页面最强的公开分发表面不是“三榜”，而是目录曝光位次加上类型/信任过滤。
2. Code plugin 仍然是主流形态，但 Bundle plugin 适合承接说明型、跨宿主或低运行时耦合的分发层。
3. 能过 source-linked、scan clean、README/manifest/runtime 一致性的插件，冷启动信任成本明显更低。
4. \`Executes code\` 并不是坏事本身，但它会提高用户审查阈值，所以副作用、权限和远程依赖必须写清楚。
5. 高产作者的优势仍然来自“围绕一个系统边界连续发相邻插件”，而不是随机发散。
6. 最适合继续做 AISA API 的方向，依然是安全治理、业务增长、支付链路、存储物流和外部 SaaS 连接器。

## 公开目录前 10

${table(buildSurfaceTable(report.surfaces.catalogTop, 'zh'))}
## Code plugins 过滤面前 10

${table(buildSurfaceTable(report.surfaces.codePlugins, 'zh'))}
## Bundle plugins 过滤面前 10

${table(buildSurfaceTable(report.surfaces.bundlePlugins, 'zh'))}
## Verified only 过滤面前 10

${table(buildSurfaceTable(report.surfaces.verifiedOnly, 'zh'))}
## Executes code 过滤面前 10

${table(buildSurfaceTable(report.surfaces.executesCode, 'zh'))}
## 综合优先级 Top 10

${table(buildCompositeTable(report.surfaces.compositeTop, 'zh'))}
## 爆款作者画像

${table(topAuthors)}
## AISA API 最值得切的 10 个方向

${table(candidates)}
## 平台机制

- 当前公开可验证的 plugin 分发表面：目录顺序、Code / Bundle、Verified only、Executes code。
- 详情页信任表面：source-linked、Security Scan、VirusTotal、OpenClaw verdict、runtimeId、capability tags、compatibility。
- 组合判断时，目录顺序只是一层；真正影响安装的是验证、扫描、副作用说明和能力边界是否一致。
- ${report.methodology.usedExistingSnapshot ? '本次输出复用了仓库内已有快照来刷新口径与报告结构，因为当前环境下 live 抓取 ClawHub 不稳定。' : '本次输出基于 live 页面抓取完成。'}

## 发布动作

- 不要再把 plugin 包装成“冲三榜”，而要围绕真实过滤面优化：类型边界清楚、验证来源清楚、副作用清楚。
- 标题必须直接点系统、动作或结果，例如 channel、security、parcel、payment，而不是抽象概念名。
- Code plugin 和 Bundle plugin 要按真实运行时边界拆，不要为方便打包而混淆类型。
- 同一作者主线上持续发相邻插件，比单次爆款更容易积累分发资产。
`;
}

function buildEnReport(report, datasetDate) {
  const candidates = report.aisaCandidates.slice(0, 10).map((item, index) => ({
    Rank: index + 1,
    Plugin: item.name,
    Owner: item.owner,
    Theme: item.theme,
    Opportunity: item.opportunityScore,
  }));
  const authors = report.authors.slice(0, 10).map((item, index) => ({
    Rank: index + 1,
    Owner: item.author,
    Plugins: item.totalPlugins,
    Code: item.codePlugins,
    Bundle: item.bundlePlugins,
    Themes: item.primaryThemes.join(' / '),
  }));

  return `# ClawHub Plugin Intelligence Report

- Generated at: ${report.generatedAt}
- Dataset date: ${formatDatasetDateEn(datasetDate)}
- Source: public ClawHub plugin directory plus plugin detail SSR payloads

## Executive Summary

As of ${report.methodology.dataDate}, the public ClawHub plugin page visibly exposes current catalog order, \`All types / Code plugins / Bundle plugins\`, and \`Verified only / Executes code\` filters. It does not visibly expose skill-style \`downloads / stars / installs\` boards for plugins. So plugin breakout analysis should focus on the real visible surfaces: listing exposure, type filters, verification quality, security scan posture, runtime boundaries, and author-lane density.

## What Actually Wins

1. The strongest public plugin discovery surfaces are the listing itself plus type and trust filters, not separate public metric boards.
2. Code plugins still dominate the market, while bundle plugins work better as lighter distribution shells.
3. Source-linked verification, coherent scan results, and aligned README/runtime claims are major trust accelerators.
4. \`Executes code\` raises review scrutiny, so side effects and setup paths must be made explicit.
5. The best authors still win by shipping adjacent plugins in one clear lane.
6. Security, governance, growth ops, payments, storage, and workflow connectors remain the best AISA-conversion lanes.

## Current Catalog Top 10

${table(buildSurfaceTable(report.surfaces.catalogTop, 'en'))}
## Code Plugins View

${table(buildSurfaceTable(report.surfaces.codePlugins, 'en'))}
## Bundle Plugins View

${table(buildSurfaceTable(report.surfaces.bundlePlugins, 'en'))}
## Verified-only View

${table(buildSurfaceTable(report.surfaces.verifiedOnly, 'en'))}
## Executes-code View

${table(buildSurfaceTable(report.surfaces.executesCode, 'en'))}
## Composite Priority Top 10

${table(buildCompositeTable(report.surfaces.compositeTop, 'en'))}
## Author Factories

${table(authors)}
## Best AISA Conversion Targets

${table(candidates)}
## Repeatable Playbook

- Package for the real plugin surfaces that users can actually see today: listing position, type filters, and trust filters.
- Keep code-plugin vs bundle-plugin boundaries honest and obvious.
- Explain side effects, persistent storage, gateway restarts, remote fetches, and credentials clearly.
- Optimize for trust coherence before chasing vanity-board narratives that are not publicly visible on the current plugin page.
- ${report.methodology.usedExistingSnapshot ? 'This refresh reused the repository snapshot because live plugin fetching was unstable in this environment.' : 'This refresh completed from live plugin pages.'}
`;
}

async function readExistingReport() {
  if (!(await fileExists(OUTPUT_JSON))) {
    return null;
  }
  try {
    return JSON.parse(await readFile(OUTPUT_JSON, 'utf8'));
  } catch {
    return null;
  }
}

function existingDetailMap(snapshot) {
  const plugins = Array.isArray(snapshot?.plugins) ? snapshot.plugins : [];
  return new Map(
    plugins
      .filter((plugin) => typeof plugin?.href === 'string' && isPluginDetailHref(plugin.href))
      .map((plugin) => [plugin.href, plugin]),
  );
}

function deriveCatalogEntriesFromSnapshot(snapshot) {
  const byHref = existingDetailMap(snapshot);
  const sourceRows = Array.isArray(snapshot?.surfaces?.catalogTop)
    ? snapshot.surfaces.catalogTop
    : Array.isArray(snapshot?.rankings?.downloads)
      ? snapshot.rankings.downloads
      : Array.isArray(snapshot?.plugins)
        ? snapshot.plugins
        : [];

  return sourceRows
    .map((row, index) => {
      const href =
        typeof row?.href === 'string'
          ? row.href
          : typeof row?.url === 'string'
            ? (() => {
                try {
                  return new URL(row.url).pathname;
                } catch {
                  return null;
                }
              })()
            : null;
      if (!href || !isPluginDetailHref(href)) return null;
      const detail = byHref.get(href);
      return {
        href,
        url: `${BASE_URL}${href}`,
        displayName: compactSpaces(detail?.displayName ?? row.displayName ?? row.name),
        family: compactSpaces(detail?.family ?? row.family),
        latestVersion: compactSpaces(detail?.latestVersion ?? row.latestVersion ?? 'unknown'),
        packageName: compactSpaces(detail?.packageName ?? row.packageName ?? detail?.displayName ?? row.name ?? 'unknown'),
        owner: compactSpaces(detail?.owner ?? row.owner ?? 'unknown'),
        summary: compactSpaces(detail?.summary ?? row.summary ?? ''),
        catalogRank: toNumber(row.catalogRank ?? row.rank ?? index + 1) || index + 1,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.catalogRank - b.catalogRank || a.displayName.localeCompare(b.displayName));
}

async function loadCatalogSnapshot() {
  const existing = await readExistingReport();

  try {
    const html = await fetchText(listUrl());
    const entries = sanitizeCatalogEntries(extractListHrefs(html), extractListItems(html));
    return {
      mode: 'live',
      entries,
      existing,
    };
  } catch (error) {
    const fallbackEntries = existing ? deriveCatalogEntriesFromSnapshot(existing) : [];
    if (!fallbackEntries.length) {
      throw error;
    }
    console.warn(
      `Falling back to existing plugin snapshot because live catalog fetch failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      mode: 'existing-snapshot',
      entries: fallbackEntries,
      existing,
    };
  }
}

function buildSurfaceRow(plugin, rank) {
  return {
    rank,
    catalogRank: plugin.catalogRank,
    href: plugin.href,
    url: plugin.url,
    name: plugin.displayName,
    owner: plugin.owner,
    family: plugin.family,
    theme: plugin.theme,
    scanStatus: plugin.scanStatus ?? plugin.llmAnalysis?.status ?? null,
    verificationTier: plugin.verification?.tier ?? null,
    executesCode: Boolean(plugin.executesCode),
    publicStatsZero: Boolean(plugin.publicStatsZero),
    versions: toNumber(plugin.stats?.versions),
  };
}

function buildCompositeRow(plugin) {
  return {
    href: plugin.href,
    url: plugin.url,
    owner: plugin.owner,
    displayName: plugin.displayName,
    family: plugin.family,
    theme: plugin.theme,
    summary: plugin.summary,
    compositeScore: plugin.compositeScore,
    catalogRank: plugin.catalogRank,
    verificationTier: plugin.verification?.tier ?? null,
    verification: plugin.verification ?? null,
    scanStatus: plugin.scanStatus ?? plugin.llmAnalysis?.status ?? null,
    executesCode: Boolean(plugin.executesCode),
    publicStatsZero: Boolean(plugin.publicStatsZero),
    versions: toNumber(plugin.stats?.versions),
  };
}

async function main() {
  const datasetDate = new Date();
  const snapshot = await loadCatalogSnapshot();
  const existingByHref = existingDetailMap(snapshot.existing);
  const detailLimit = pLimit(DETAIL_CONCURRENCY);

  const detailedPlugins =
    snapshot.mode === 'existing-snapshot'
      ? snapshot.entries.map((entry) => normalizeDetailFromExisting(existingByHref.get(entry.href), entry))
      : await Promise.all(
          snapshot.entries.map((entry) =>
            detailLimit(async () => {
              try {
                const html = await fetchText(entry.url);
                return parseDetail(html, entry);
              } catch (error) {
                const cached = existingByHref.get(entry.href);
                if (cached) {
                  console.warn(
                    `Using cached plugin detail for ${entry.href} because live detail fetch failed: ${error instanceof Error ? error.message : String(error)}`,
                  );
                  return normalizeDetailFromExisting(cached, entry);
                }
                console.warn(
                  `Falling back to partial plugin detail for ${entry.href}: ${error instanceof Error ? error.message : String(error)}`,
                );
                return parseDetail('', entry);
              }
            }),
          ),
        );

  const plugins = detailedPlugins
    .filter((plugin) => isPluginDetailHref(plugin.href) && isValidListItem(plugin))
    .map((plugin) => ({
      ...plugin,
      theme: inferTheme(plugin.displayName, plugin.summary),
      publicStatsZero: plugin.stats.downloads === 0 && plugin.stats.installs === 0 && plugin.stats.stars === 0,
    }))
    .map((plugin) => {
      const visibilityScore = Math.max(1, 101 - plugin.catalogRank);
      const verificationBoost = plugin.verification?.tier === 'source-linked' ? 20 : plugin.verification ? 10 : 0;
      const cleanBoost = plugin.scanStatus === 'clean' || plugin.llmAnalysis?.status === 'clean' ? 12 : 0;
      const suspiciousPenalty = plugin.scanStatus === 'suspicious' || plugin.llmAnalysis?.status === 'suspicious' ? 14 : 0;
      const maturityBoost = Math.min(8, plugin.stats.versions);
      const boundaryBoost = plugin.executesCode ? 0 : 2;
      return {
        ...plugin,
        compositeScore: Number((visibilityScore + verificationBoost + cleanBoost + maturityBoost + boundaryBoost - suspiciousPenalty).toFixed(2)),
      };
    });

  const pluginsByCatalog = [...plugins].sort((a, b) => a.catalogRank - b.catalogRank || a.displayName.localeCompare(b.displayName));
  const pluginsByComposite = [...plugins].sort(
    (a, b) => b.compositeScore - a.compositeScore || a.catalogRank - b.catalogRank || a.displayName.localeCompare(b.displayName),
  );

  const authorCounts = new Map();
  for (const plugin of pluginsByCatalog) {
    authorCounts.set(plugin.owner, (authorCounts.get(plugin.owner) ?? 0) + 1);
  }

  const authors = ownerProfiles(pluginsByComposite);
  const aisaCandidates = buildAisaCandidates(pluginsByComposite, authorCounts);
  const topThemes = countBy(pluginsByCatalog, (plugin) => plugin.theme, 8);

  const toSurface = (items) => items.map((plugin, index) => buildSurfaceRow(plugin, index + 1));

  const report = {
    generatedAt: new Date().toISOString(),
    sources: [listUrl()],
    methodology: {
      note: `As of ${formatDatasetDate(datasetDate)}, the public ClawHub plugin SSR shows current catalog order plus the All types / Code plugins / Bundle plugins and Verified only / Executes code filters. No explicit public downloads / stars / installs plugin sort boards were visible in the SSR page.`,
      dataDate: formatDatasetDate(datasetDate),
      explicitSortBoardsVisible: false,
      visiblePublicSurfaces: LISTING_SURFACES,
      usedExistingSnapshot: snapshot.mode !== 'live',
    },
    summary: {
      totalPlugins: pluginsByCatalog.length,
      codePlugins: pluginsByCatalog.filter((plugin) => plugin.family === 'code-plugin').length,
      bundlePlugins: pluginsByCatalog.filter((plugin) => plugin.family === 'bundle-plugin').length,
      sourceLinkedPlugins: pluginsByCatalog.filter((plugin) => plugin.verification?.tier === 'source-linked').length,
      cleanPlugins: pluginsByCatalog.filter((plugin) => plugin.scanStatus === 'clean' || plugin.llmAnalysis?.status === 'clean').length,
      suspiciousPlugins: pluginsByCatalog.filter((plugin) => plugin.scanStatus === 'suspicious' || plugin.llmAnalysis?.status === 'suspicious').length,
      executesCodePlugins: pluginsByCatalog.filter((plugin) => plugin.executesCode).length,
      publicStatsZeroPlugins: pluginsByCatalog.filter((plugin) => plugin.publicStatsZero).length,
      topCatalogPlugin: pluginsByCatalog[0]?.displayName ?? null,
      topTheme: topThemes[0]?.name ?? null,
      topAuthor: authors[0]?.author ?? null,
    },
    surfaces: {
      catalogTop: toSurface(pluginsByCatalog.slice(0, 20)),
      codePlugins: toSurface(pluginsByCatalog.filter((plugin) => plugin.family === 'code-plugin').slice(0, 20)),
      bundlePlugins: toSurface(pluginsByCatalog.filter((plugin) => plugin.family === 'bundle-plugin').slice(0, 20)),
      verifiedOnly: toSurface(pluginsByCatalog.filter((plugin) => plugin.verification?.tier === 'source-linked').slice(0, 20)),
      executesCode: toSurface(pluginsByCatalog.filter((plugin) => plugin.executesCode).slice(0, 20)),
      compositeTop: pluginsByComposite.slice(0, 20).map(buildCompositeRow),
    },
    topThemes,
    plugins: pluginsByCatalog,
    authors,
    aisaCandidates,
    mechanics: {
      listingMechanics: [
        'The visible public plugin page currently exposes current catalog order plus the All types / Code plugins / Bundle plugins filters.',
        'Verified only and Executes code behave like practical trust and risk filters, not cosmetic toggles.',
        'There is no visible SSR evidence of separate public downloads / stars / installs boards for plugins on the current page.',
        'Type choice changes what users expect before they click: runtime leverage for code plugins, lighter distribution shells for bundle plugins.',
      ],
      breakoutMechanics: [
        'Task-first or system-first titles outperform abstract product names.',
        'Code plugins lead when they expose a real runtime integration or operational action.',
        'Focused sibling ladders outperform scattered one-off plugin releases.',
        'Security, governance, commerce, messaging, and workflow connectors remain the most repeatable plugin lanes.',
      ],
      trustMechanics: [
        'Source-linked provenance reduces cold-start trust friction.',
        'Security Scan, VirusTotal, and OpenClaw verdicts are part of the conversion surface.',
        'Capability tags, runtimeId, and README copy should describe the same real behavior.',
        'Side effects such as config writes, gateway restarts, remote fetches, or persistent storage need to be declared explicitly.',
      ],
      publishMoves: [
        'Package for the real public plugin surfaces that users can currently see, not for nonexistent public metric boards.',
        'Choose code-plugin vs bundle-plugin based on the true runtime surface, not on convenience.',
        'Keep one flagship plugin plus narrower siblings in the same lane to compound author trust.',
        'Align title, description, manifest, README, and shipped files before upload.',
      ],
    },
  };

  const zhReport = buildZhReport(report, datasetDate);
  const enReport = buildEnReport(report, datasetDate);

  await mkdir(dirname(OUTPUT_JSON), { recursive: true });
  await mkdir(dirname(OUTPUT_ZH), { recursive: true });
  await mkdir(dirname(OUTPUT_EN), { recursive: true });

  await writeFile(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(OUTPUT_ZH, zhReport);
  await writeFile(OUTPUT_ZH_PUBLIC, zhReport);
  await writeFile(OUTPUT_EN, enReport);
  await writeFile(OUTPUT_EN_PUBLIC, enReport);

  syncMarkdownDocx(ROOT, [OUTPUT_ZH, OUTPUT_ZH_PUBLIC, OUTPUT_EN, OUTPUT_EN_PUBLIC]);

  console.log(`Wrote ${OUTPUT_JSON}, ${OUTPUT_ZH}, ${OUTPUT_EN}, and public copies.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
