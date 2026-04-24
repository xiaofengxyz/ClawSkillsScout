import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const catalogPath = path.join(root, 'public', 'data', 'catalog.json');
const accountsPath = path.join(root, 'config', 'accounts.json');
const outputRoot = path.join(root, 'public', 'downloads', 'clawHub');
const indexPath = path.join(outputRoot, 'index.json');
const userAgent = 'Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/xiaofengxyz/ClawSkillsScout)';
const mirrorDownloadBaseUrl = 'https://skills.volces.com/api/v1/download';

function extractSlug(url) {
  const normalized = url.replace(/\/+$/, '');
  return normalized.slice(normalized.lastIndexOf('/') + 1);
}

function parseArgs(argv) {
  return {
    force: argv.includes('--force'),
    refreshSeeds: !argv.includes('--skip-refresh-seeds'),
    scrape: argv.includes('--scrape'),
  };
}

async function commandExists(command) {
  return new Promise((resolve) => {
    const child = spawn('bash', ['-lc', `command -v ${command}`], {
      cwd: root,
      stdio: 'ignore',
    });
    child.on('exit', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

async function canRefreshRenderedSeeds() {
  const pythonExists = await commandExists('python3');
  if (!pythonExists) return false;

  return new Promise((resolve) => {
    const child = spawn('python3', ['-c', 'import importlib.util; import sys; sys.exit(0 if importlib.util.find_spec("playwright") and importlib.util.find_spec("bs4") else 1)'], {
      cwd: root,
      stdio: 'ignore',
    });
    child.on('exit', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

async function refreshRenderedOwnerSeedsIfAvailable() {
  const supported = await canRefreshRenderedSeeds();
  if (!supported) {
    console.warn('Skipping rendered owner seed refresh: python3, playwright, or bs4 is not available.');
    return false;
  }

  await runCommand('python3', ['extract_all_skills_correct.py']);
  return true;
}

function buildMirrorDownloadUrl(slug) {
  return `${mirrorDownloadBaseUrl}?slug=${encodeURIComponent(slug)}`;
}

function buildDownloadCandidates(item, slug) {
  const candidates = [
    {
      source: 'cn-mirror',
      url: buildMirrorDownloadUrl(slug),
    },
  ];

  if (typeof item.downloadUrl === 'string' && item.downloadUrl.length > 0) {
    candidates.push({
      source: 'clawhub',
      url: item.downloadUrl,
    });
  }

  return candidates;
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`${command} exited with code ${code ?? 'unknown'}`));
    });

    child.on('error', reject);
  });
}

async function downloadFile(url, filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  await new Promise((resolve, reject) => {
    const child = spawn('curl', [
      '-L',
      '--fail',
      '--retry',
      '3',
      '--retry-delay',
      '2',
      '--connect-timeout',
      '30',
      '--max-time',
      '300',
      '--user-agent',
      userAgent,
      '-o',
      filePath,
      url,
    ], {
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`curl exited with code ${code ?? 'unknown'} for ${url}`));
    });

    child.on('error', reject);
  });

  const stat = await fs.stat(filePath);
  return stat.size;
}

async function writeSummary({ trackedOwners, manifest, failures }) {
  const summary = {
    downloadedAt: new Date().toISOString(),
    generatedFromCatalog: path.relative(root, catalogPath).replaceAll(path.sep, '/'),
    trackedOwners: [...trackedOwners].sort(),
    total: manifest.length,
    failed: failures.length,
    items: manifest,
    failures,
  };

  await fs.writeFile(indexPath, `${JSON.stringify(summary, null, 2)}\n`);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildManifestKey(item) {
  return [String(item.owner ?? '').trim(), String(item.slug ?? '').trim()].join('::');
}

function upsertManifestItem(manifest, item) {
  const key = buildManifestKey(item);
  const index = manifest.findIndex((entry) => buildManifestKey(entry) === key);
  if (index >= 0) {
    manifest[index] = item;
    return;
  }
  manifest.push(item);
}

async function loadExistingManifest() {
  const manifest = [];

  try {
    const summary = JSON.parse(await fs.readFile(indexPath, 'utf8'));
    const items = Array.isArray(summary.items) ? summary.items : [];
    for (const item of items) {
      if (!item || typeof item.file !== 'string') continue;
      const filePath = path.join(root, item.file);
      if (!(await pathExists(filePath))) continue;
      upsertManifestItem(manifest, item);
    }
  } catch {
    // Fall through to filesystem scan below.
  }

  const ownerDirs = await fs.readdir(outputRoot, { withFileTypes: true }).catch(() => []);
  for (const ownerDir of ownerDirs) {
    if (!ownerDir.isDirectory()) continue;
    const owner = ownerDir.name;
    const ownerPath = path.join(outputRoot, owner);
    const entries = await fs.readdir(ownerPath, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.zip')) continue;
      const filePath = path.join(ownerPath, entry.name);
      const stat = await fs.stat(filePath).catch(() => null);
      if (!stat?.isFile()) continue;
      const slug = path.basename(entry.name, '.zip');
      upsertManifestItem(manifest, {
        owner,
        slug,
        name: slug,
        version: null,
        clawhubUrl: `https://clawhub.ai/skills/${slug}`,
        downloadUrl: null,
        downloadedFrom: 'existing-file',
        resolvedDownloadUrl: null,
        file: path.relative(root, filePath).replaceAll(path.sep, '/'),
        bytes: stat.size,
      });
    }
  }

  return manifest;
}

async function downloadWithFallback(item, slug, filePath) {
  const attempts = [];

  for (const candidate of buildDownloadCandidates(item, slug)) {
    try {
      const bytes = await downloadFile(candidate.url, filePath);
      return {
        bytes,
        downloadedFrom: candidate.source,
        resolvedDownloadUrl: candidate.url,
        attempts,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      attempts.push({
        source: candidate.source,
        url: candidate.url,
        error: message,
      });
      console.error(`Download attempt failed for ${item.owner}/${slug} via ${candidate.source}: ${message}`);
    }
  }

  const finalMessage = attempts.map((attempt) => `${attempt.source}: ${attempt.error}`).join(' | ');
  throw new Error(finalMessage || `No download candidate succeeded for ${item.owner}/${slug}`);
}

async function main() {
  const { force, refreshSeeds, scrape } = parseArgs(process.argv.slice(2));

  if (refreshSeeds) {
    await refreshRenderedOwnerSeedsIfAvailable();
  }

  if (scrape) {
    try {
      await runCommand('node', ['--import', 'tsx', 'scripts/scrape-clawhub.ts']);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Catalog scrape failed, continuing with existing ${path.relative(root, catalogPath)}: ${message}`);
    }
  }

  const [catalog, accounts] = await Promise.all([
    fs.readFile(catalogPath, 'utf8').then((content) => JSON.parse(content)),
    fs.readFile(accountsPath, 'utf8').then((content) => JSON.parse(content)),
  ]);

  const trackedOwners = new Set(accounts.map((item) => String(item).trim()).filter(Boolean));
  const targets = catalog.items
    .filter((item) => item.type === 'skill')
    .filter((item) => trackedOwners.has(item.owner))
    .filter((item) => typeof item.downloadUrl === 'string' && item.downloadUrl.length > 0)
    .sort((left, right) => {
      if (left.owner !== right.owner) return left.owner.localeCompare(right.owner);
      return left.name.localeCompare(right.name);
    });

  await fs.mkdir(outputRoot, { recursive: true });
  const manifest = await loadExistingManifest();
  const failures = [];

  for (const item of targets) {
    const slug = extractSlug(item.clawhubUrl);
    const filePath = path.join(outputRoot, item.owner, `${slug}.zip`);
    let bytes;

    if (!force) {
      try {
        const stat = await fs.stat(filePath);
        bytes = stat.size;
        console.log(`Skipping existing ${item.owner}/${slug}`);
      } catch {
        bytes = undefined;
      }
    }

    try {
      if (bytes === undefined) {
        const result = await downloadWithFallback(item, slug, filePath);
        bytes = result.bytes;
        console.log(`${force ? 'Refreshed' : 'Downloaded'} ${item.owner}/${slug} via ${result.downloadedFrom}`);
        upsertManifestItem(manifest, {
          owner: item.owner,
          slug,
          name: item.name,
          version: item.version,
          clawhubUrl: item.clawhubUrl,
          downloadUrl: item.downloadUrl,
          downloadedFrom: result.downloadedFrom,
          resolvedDownloadUrl: result.resolvedDownloadUrl,
          file: path.relative(root, filePath).replaceAll(path.sep, '/'),
          bytes,
        });
        await writeSummary({ trackedOwners, manifest, failures });
        continue;
      }

      upsertManifestItem(manifest, {
        owner: item.owner,
        slug,
        name: item.name,
        version: item.version,
        clawhubUrl: item.clawhubUrl,
        downloadUrl: item.downloadUrl,
        downloadedFrom: 'existing-file',
        resolvedDownloadUrl: null,
        file: path.relative(root, filePath).replaceAll(path.sep, '/'),
        bytes,
      });
      await writeSummary({ trackedOwners, manifest, failures });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({
        owner: item.owner,
        slug,
        name: item.name,
        clawhubUrl: item.clawhubUrl,
        downloadUrl: item.downloadUrl,
        error: message,
      });
      console.error(`Failed ${item.owner}/${slug}: ${message}`);
      await writeSummary({ trackedOwners, manifest, failures });
    }
  }
  console.log(`Saved ${manifest.length} account skill zips to ${path.relative(root, outputRoot)}.`);
  if (failures.length > 0) {
    console.log(`Recorded ${failures.length} download failures in ${path.relative(root, indexPath)}.`);
    if (manifest.length === 0) {
      process.exitCode = 1;
    } else {
      console.warn('Continuing with cached and successfully refreshed ClawHub skill archives.');
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
