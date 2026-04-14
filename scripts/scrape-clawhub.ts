import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

type ItemType = 'skill' | 'plugin';
type DiscoverySource = 'account' | 'catalog';

interface CatalogItem {
  id: string;
  type: ItemType;
  owner: string;
  name: string;
  description: string;
  version: string;
  clawhubUrl: string;
  downloads: number | null;
  suspicious: boolean;
  suspiciousLabel: string | null;
  usesAisaApi: boolean;
  source: DiscoverySource;
  tags: string[];
  lastCheckedAt: string;
  readmeSnippet: string;
}

interface CatalogData {
  generatedAt: string;
  scannedAccounts: string[];
  sources: string[];
  notes: string[];
  stats: {
    total: number;
    skills: number;
    plugins: number;
    suspicious: number;
    aisa: number;
    owners: number;
  };
  items: CatalogItem[];
}

interface SeedItem {
  url: string;
  source: DiscoverySource;
  type?: ItemType;
  owner?: string;
  name?: string;
  description?: string;
  downloads?: number | null;
  heuristic?: boolean;
}

const BASE_URL = 'https://clawhub.ai';
const USER_AGENT = 'Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/xiaofengxyz/ClawSkillsScout)';
const CONCURRENCY = 6;
const OWNER_DISCOVERY_PATH = '';
const HASH_SKILL_PATH = /^\/[a-z0-9]{32,}\/[a-z0-9-]+$/i;
const PLUGIN_PATH = /^\/plugins\/[^/]+$/i;

function toAbsoluteUrl(href: string): string {
  return href.startsWith('http') ? href : `${BASE_URL}${href}`;
}

function decodeHref(href: string): string {
  try {
    return decodeURIComponent(href);
  } catch {
    return href;
  }
}

async function fetchHtml(url: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': USER_AGENT },
      });
      if (!response.ok) {
        throw new Error(`Failed ${url}: ${response.status}`);
      }
      return response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
}

function cleanText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function parseCsvLine(line: string): string[] {
  const columns = line.match(/("([^"]|"")*"|[^,]*)(?=,|$)/g) ?? [];
  return columns.map((column) => {
    const trimmed = column.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1).replace(/""/g, '"');
    }
    return trimmed;
  });
}

function extractTextGroup(pattern: RegExp, html: string): string {
  const match = pattern.exec(html);
  return cleanText(match?.[1]);
}

function extractNumber(pattern: RegExp, html: string): number | null {
  const value = extractTextGroup(pattern, html);
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function decodeJsString(value: string): string {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

function extractReadme(html: string): string {
  const readmeMatch = html.match(/readme:"((?:[^"\\]|\\.)*)",readmeError/s);
  if (!readmeMatch) return '';
  return decodeJsString(readmeMatch[1]);
}

function extractFrontmatterName(readme: string): string {
  const match = readme.match(/(?:^---\s*[\s\S]*?\n)?name:\s*["']?([A-Za-z0-9._-]+)["']?/im);
  return cleanText(match?.[1]);
}

function inferTypeFromUrl(url: string): ItemType {
  return url.includes('/plugins/') ? 'plugin' : 'skill';
}

function parseListPage(html: string, typeHint?: ItemType) {
  const $ = cheerio.load(html);
  const items: Array<{ href: string; owner: string; type: ItemType; name: string }> = [];
  $('a[href]').each((_, element) => {
    const rawHref = $(element).attr('href');
    if (!rawHref) return;
    const href = rawHref;
    const decodedHref = decodeHref(rawHref);
    const type = typeHint ?? inferTypeFromUrl(decodedHref);
    if (type === 'plugin') {
      if (!href.startsWith('/plugins/')) return;
    } else if (!/^\/[^/]+\/[^/]+/.test(decodedHref)) {
      return;
    }

    const name = cleanText($(element).find('h3').first().text());
    if (!name) return;

    let owner = '';
    const byText = cleanText($(element).text()).match(/\bby\s+([A-Za-z0-9@._-]+)/i);
    if (byText) {
      owner = byText[1].replace(/^@/, '');
    } else if (href.startsWith('/plugins/')) {
      const slug = decodedHref.split('/plugins/')[1] ?? '';
      owner = slug.split('/')[0].replace(/^@/, '');
    } else {
      owner = decodedHref.split('/')[1] ?? '';
    }

    items.push({
      href,
      owner,
      type,
      name,
    });
  });
  return items;
}

function parseOwnerProfilePage(html: string, owner: string) {
  const $ = cheerio.load(html);
  const items: Array<{ href: string; owner: string; type: ItemType; name: string }> = [];

  $('a[href]').each((_, element) => {
    const rawHref = ($(element).attr('href') ?? '').trim();
    if (!rawHref) return;

    const name = cleanText($(element).find('h3').first().text());
    if (!name) return;

    if (HASH_SKILL_PATH.test(rawHref)) {
      items.push({
        href: rawHref,
        owner,
        type: 'skill',
        name,
      });
      return;
    }

    if (PLUGIN_PATH.test(rawHref)) {
      items.push({
        href: rawHref,
        owner,
        type: 'plugin',
        name,
      });
    }
  });

  return items;
}

function parseDetailPage(html: string, url: string, source: DiscoverySource): CatalogItem {
  const type = inferTypeFromUrl(url);
  const owner =
    extractTextGroup(/owner:\$R\[\d+\]={handle:"([^"]+)"/, html) ||
    extractTextGroup(/owner:\{handle:"([^"]+)"/, html) ||
    extractTextGroup(/owner:"([^"]+)"/, html) ||
    extractTextGroup(/ownerHandle:"([^"]+)"/, html) ||
    (type === 'plugin'
      ? decodeURIComponent(url.split('/plugins/')[1] ?? '').split('/')[0].replace(/^@/, '')
      : url.replace(BASE_URL, '').split('/')[1] ?? 'unknown');

  const name =
    extractTextGroup(/displayName:"([^"]+)"/, html) ||
    extractTextGroup(/<title>([^<]+?)\s+—\s+ClawHub<\/title>/, html) ||
    'Unknown';

  const description =
    extractTextGroup(/<meta name="description" content="([^"]+)"/, html) ||
    extractTextGroup(/summary:"([^"]+)"/, html);

  const version =
    extractTextGroup(/version:"([^"]+)"/, html) ||
    extractTextGroup(/latestVersion:"([^"]+)"/, html) ||
    'unknown';

  const downloads =
    extractNumber(/stats:\$R\[\d+\]={comments:\d+,downloads:(\d+)/, html) ??
    extractNumber(/"downloads":\s*(\d+)/, html);

  const suspiciousLabel =
    extractTextGroup(/status:"(suspicious|malicious|safe|warning)"/i, html) ||
    extractTextGroup(/scan-result-status[^"]*scan-status-(suspicious|malicious|safe|warning)"/i, html) ||
    null;
  const suspicious = suspiciousLabel === 'suspicious' || suspiciousLabel === 'malicious';
  const readme = extractReadme(html);
  const usesAisaApi = /AISA_API_KEY|aisa api key|api\.aisa\.one|marketplace\.aisa\.one/i.test(`${html}\n${readme}`);
  const tags = [...new Set([...(usesAisaApi ? ['aisa'] : []), ...(suspicious ? ['suspicious'] : []), type])];
  const readmeSnippet = cleanText(readme).slice(0, 320);

  return {
    id: `${type}:${owner}:${url}`,
    type,
    owner,
    name,
    description,
    version,
    clawhubUrl: url,
    downloads,
    suspicious,
    suspiciousLabel,
    usesAisaApi,
    source,
    tags,
    lastCheckedAt: new Date().toISOString(),
    readmeSnippet,
  };
}

async function readSeedItems(): Promise<SeedItem[]> {
  const files = ['clawhub-projects-final-urls-final.csv', 'clawhub-projects-final-urls.csv', 'clawhub-hash-format-urls.csv'];
  const items = new Map<string, SeedItem>();

  for (const file of files) {
    try {
      const raw = await fs.readFile(path.join(process.cwd(), file), 'utf8');
      const lines = raw.split(/\r?\n/).filter(Boolean);
      const header = parseCsvLine(lines[0]);
      for (const line of lines.slice(1)) {
        const values = parseCsvLine(line);
        const row = Object.fromEntries(header.map((key, index) => [key, values[index] ?? '']));
        const url = row.URL || row.FullURL;
        if (!url) continue;
        items.set(url, {
          url,
          source: 'account',
          type: (row.Type?.toLowerCase() === 'plugin' ? 'plugin' : 'skill') as ItemType,
          owner: row.Author || row.Owner || row.username || undefined,
          name: row.Name || row.SkillName || undefined,
          description: row.Description || undefined,
          downloads: row.Downloads ? Number(row.Downloads) : null,
        });
      }
    } catch {
      // Seed file is optional.
    }
  }

  try {
    const manualSeedsPath = path.join(process.cwd(), 'config', 'manual-seeds.json');
    const manualSeeds = JSON.parse(await fs.readFile(manualSeedsPath, 'utf8')) as SeedItem[];
    for (const seed of manualSeeds) {
      items.set(seed.url, seed);
    }
  } catch {
    // Manual seeds are optional.
  }

  return [...items.values()];
}

async function scrapeOwner(owner: string) {
  const discovered = new Map<string, { href: string; type: ItemType; owner: string }>();

  try {
    const html = await fetchHtml(`${BASE_URL}/u/${owner}${OWNER_DISCOVERY_PATH}`);
    for (const item of parseOwnerProfilePage(html, owner)) {
      discovered.set(item.href, { href: item.href, type: item.type, owner: item.owner || owner });
    }
  } catch (error) {
    console.warn(`Skipping owner profile ${owner}:`, error);
  }

  return [...discovered.values()].map((item) => ({
    url: toAbsoluteUrl(item.href),
    source: 'account' as const,
  }));
}

async function scrapeCatalog(type: ItemType, maxPages = 3) {
  const found = new Map<string, { url: string; source: 'catalog' }>();
  for (let page = 1; page <= maxPages; page += 1) {
    const suffix = page === 1 ? '' : `?page=${page}`;
    const html = await fetchHtml(`${BASE_URL}/${type === 'plugin' ? 'plugins' : 'skills'}${suffix}`);
    const parsed = parseListPage(html, type);
    if (parsed.length === 0) break;
    for (const item of parsed) {
      found.set(item.href, { url: toAbsoluteUrl(item.href), source: 'catalog' });
    }
  }
  return [...found.values()];
}

function buildStats(items: CatalogItem[]) {
  const owners = new Set(items.map((item) => item.owner));
  return {
    total: items.length,
    skills: items.filter((item) => item.type === 'skill').length,
    plugins: items.filter((item) => item.type === 'plugin').length,
    suspicious: items.filter((item) => item.suspicious).length,
    aisa: items.filter((item) => item.usesAisaApi).length,
    owners: owners.size,
  };
}

function filterToAisaOwnerUniverse(items: CatalogItem[]) {
  const aisaOwners = new Set(items.filter((item) => item.usesAisaApi).map((item) => item.owner));
  return items.filter((item) => aisaOwners.has(item.owner));
}

function extractSlugFromUrl(url: string): string {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

function slugVariants(slug: string, readmeName: string): string[] {
  const variants = new Set<string>();
  const normalized = [slug, readmeName]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  for (const base of normalized) {
    variants.add(base);
    variants.add(base.replace(/^openclaw-aisa-/, ''));
    variants.add(base.replace(/^openclaw-/, ''));
    variants.add(base.replace(/^aisa-/, ''));
    variants.add(base.replace(/-api$/, ''));
    variants.add(base.replace(/-data$/, ''));
  }

  return [...variants].filter((value) => /^[a-z0-9-]+$/.test(value));
}

function buildHeuristicPluginSeeds(items: CatalogItem[]): SeedItem[] {
  const heuristics = new Map<string, SeedItem>();

  for (const item of items) {
    if (item.type !== 'skill' || !item.usesAisaApi) continue;

    const slug = extractSlugFromUrl(item.clawhubUrl);
    const readmeName = extractFrontmatterName(item.readmeSnippet);

    for (const variant of slugVariants(slug, readmeName)) {
      const url = `${BASE_URL}/plugins/%40clawhub%2F${variant}`;
      heuristics.set(url, {
        url,
        source: 'catalog',
        type: 'plugin',
        owner: item.owner,
        name: variant,
        heuristic: true,
      });
    }
  }

  return [...heuristics.values()];
}

async function main() {
  const accountsPath = path.join(process.cwd(), 'config', 'accounts.json');
  const outputPath = path.join(process.cwd(), 'public', 'data', 'catalog.json');
  const accounts = JSON.parse(await fs.readFile(accountsPath, 'utf8')) as string[];
  const seedItems = await readSeedItems();

  const accountItems = (await Promise.all(accounts.map((owner) => scrapeOwner(owner)))).flat();
  const catalogSkills = await scrapeCatalog('skill');
  const catalogPlugins = await scrapeCatalog('plugin');

  const queue = new Map<string, { url: string; source: DiscoverySource }>();
  for (const item of [...seedItems, ...accountItems, ...catalogSkills, ...catalogPlugins]) {
    queue.set(item.url, item);
  }

  const seedsByUrl = new Map(seedItems.map((item) => [item.url, item]));

  const limit = pLimit(CONCURRENCY);
  const allItems = (
    await Promise.all(
      [...queue.values()].map((item) =>
        limit(async () => {
          try {
            const html = await fetchHtml(item.url);
            const parsed = parseDetailPage(html, item.url, item.source);
            const seed = seedsByUrl.get(item.url);
            return {
              ...parsed,
              type: parsed.type ?? seed?.type ?? 'skill',
              owner: parsed.owner || seed?.owner || 'unknown',
              name: parsed.name !== 'Unknown' ? parsed.name : seed?.name || parsed.name,
              description: parsed.description || seed?.description || '',
              downloads: parsed.downloads ?? seed?.downloads ?? null,
            };
          } catch (error) {
            console.warn(`Failed to parse ${item.url}`, error);
            return null;
          }
        }),
      ),
    )
  )
    .filter((value): value is CatalogItem => value !== null)
    .sort((left, right) => {
      const score = Number(right.usesAisaApi) - Number(left.usesAisaApi);
      if (score !== 0) return score;
      return (right.downloads ?? -1) - (left.downloads ?? -1);
    });

  const heuristicSeeds = buildHeuristicPluginSeeds(allItems);
  const parsedUrls = new Set(allItems.map((item) => item.clawhubUrl));
  const heuristicResults = (
    await Promise.all(
      heuristicSeeds
        .filter((seed) => !parsedUrls.has(seed.url))
        .map((seed) =>
          limit(async () => {
            try {
              const html = await fetchHtml(seed.url);
              const parsed = parseDetailPage(html, seed.url, seed.source);
              if (!parsed.usesAisaApi) return null;
              const pluginItem: CatalogItem = {
                ...parsed,
                type: 'plugin',
                owner: parsed.owner || seed.owner || 'unknown',
                name: parsed.name !== 'Unknown' ? parsed.name : seed.name || parsed.name,
              };
              return pluginItem;
            } catch {
              return null;
            }
          }),
        ),
    )
  );

  const heuristicItems = heuristicResults.filter((value): value is CatalogItem => value !== null);

  const mergedItems = [...allItems, ...heuristicItems].sort((left, right) => {
    const score = Number(right.usesAisaApi) - Number(left.usesAisaApi);
    if (score !== 0) return score;
    return (right.downloads ?? -1) - (left.downloads ?? -1);
  });

  const items = filterToAisaOwnerUniverse(mergedItems);
  const aisaOwners = [...new Set(items.filter((item) => item.usesAisaApi).map((item) => item.owner))].sort((a, b) =>
    a.localeCompare(b),
  );

  const data: CatalogData = {
    generatedAt: new Date().toISOString(),
    scannedAccounts: accounts,
    sources: [
      `${BASE_URL}/u/{account}`,
      `${BASE_URL}/skills`,
      `${BASE_URL}/plugins`,
    ],
    notes: [
      'Known-account skill discovery reads hash links from /u/{account} profile pages, then follows those detail URLs.',
      'The exported dataset is pruned to owners that publish at least one AISA-using skill or plugin.',
      'Within AISA-owner accounts, non-AISA items are retained in the dataset for context.',
      'AISA detection is inferred from README and rendered page content.',
      'Plugin discovery uses public catalog pages, manual known-plugin seeds, and heuristic plugin slug guesses derived from AISA skills.',
      'Global discovery currently scans the first 3 pages of ClawHub skills and plugins.',
      'Suspicious status is inferred from rendered security scan output.',
    ],
    stats: buildStats(items),
    items,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${items.length} items across ${aisaOwners.length} AISA-owner accounts to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
