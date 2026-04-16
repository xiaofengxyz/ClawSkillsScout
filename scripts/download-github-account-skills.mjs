import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const root = process.cwd();
const catalogPath = path.join(root, 'public', 'data', 'catalog.json');
const outputRoot = path.join(root, 'public', 'downloads', 'github');
const indexPath = path.join(outputRoot, 'index.json');
const githubApiBaseUrl = 'https://api.github.com';
const githubWebBaseUrl = 'https://github.com';
const userAgent = 'Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/xiaofengxyz/ClawSkillsScout)';
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const ignoredPathParts = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build']);

function parseArgs(argv) {
  const owners = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--owner' && argv[index + 1]) {
      owners.push(argv[index + 1].trim());
      index += 1;
    }
  }

  return {
    force: argv.includes('--force'),
    owners,
  };
}

function sanitizeSegment(value) {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'root';
}

function normalizeOwner(value) {
  return String(value).trim().replace(/^@+/, '').toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function shouldIgnoreSkillPath(skillPath) {
  return skillPath
    .split('/')
    .some((part) => ignoredPathParts.has(part.toLowerCase()));
}

function buildHeaders(extra = {}) {
  const headers = {
    'user-agent': userAgent,
    accept: 'application/vnd.github+json',
    ...extra,
  };

  if (githubToken) {
    headers.authorization = `Bearer ${githubToken}`;
  }

  return headers;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, extraHeaders = {}) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: buildHeaders(extraHeaders),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed ${response.status} for ${url}: ${text.slice(0, 300)}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(attempt * 750);
      }
    }
  }

  throw lastError;
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url);

  return response.json();
}

async function downloadFile(url, filePath, extraHeaders = {}) {
  const response = await fetchWithRetry(url, extraHeaders);

  const arrayBuffer = await response.arrayBuffer();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
}

async function listOwnerRepos(owner) {
  const repos = [];

  for (let page = 1; page <= 10; page += 1) {
    const url = `${githubApiBaseUrl}/users/${encodeURIComponent(owner)}/repos?per_page=100&type=owner&sort=updated&page=${page}`;
    const batch = await fetchJson(url);
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }

  return repos;
}

async function loadRepoTree(owner, repo, branch) {
  const url = `${githubApiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  return fetchJson(url);
}

function findSkillDirs(tree) {
  const dirs = new Map();

  for (const entry of tree ?? []) {
    if (!entry || entry.type !== 'blob' || typeof entry.path !== 'string') continue;
    if (!entry.path.endsWith('SKILL.md')) continue;

    const skillDir = path.posix.dirname(entry.path);
    if (shouldIgnoreSkillPath(skillDir)) continue;

    dirs.set(skillDir, {
      skillPath: entry.path,
      skillDir,
    });
  }

  return [...dirs.values()].sort((left, right) => left.skillDir.localeCompare(right.skillDir));
}

async function runTar(args, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn('tar', args, {
      cwd,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`tar exited with code ${code ?? 'unknown'}`));
    });
    child.on('error', reject);
  });
}

async function withTempDir(prefix, callback) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    return await callback(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function findSingleChildDir(entries) {
  if (entries.length !== 1) return null;
  return entries[0].isDirectory() ? entries[0].name : null;
}

async function packageSkillFromRepo({
  owner,
  repo,
  defaultBranch,
  skillDir,
  outputFile,
}) {
  return withTempDir('github-skill-', async (tempDir) => {
    const archivePath = path.join(tempDir, 'repo.tar.gz');
    const extractRoot = path.join(tempDir, 'extract');
    const stageRoot = path.join(tempDir, 'stage');
    const packageName = path.basename(outputFile, '.tar.gz');
    const packageDir = path.join(stageRoot, packageName);
    const archiveUrl = `${githubWebBaseUrl}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/archive/refs/heads/${encodeURIComponent(defaultBranch)}.tar.gz`;

    await fs.mkdir(extractRoot, { recursive: true });
    await fs.mkdir(stageRoot, { recursive: true });
    await downloadFile(archiveUrl, archivePath, { accept: '*/*' });
    await runTar(['-xzf', archivePath, '-C', extractRoot], root);

    const extractedEntries = await fs.readdir(extractRoot, { withFileTypes: true });
    const repoRootName = findSingleChildDir(extractedEntries);
    if (!repoRootName) {
      throw new Error(`Unexpected extracted layout for ${owner}/${repo}`);
    }

    const repoRoot = path.join(extractRoot, repoRootName);
    const sourceDir = skillDir === '.' ? repoRoot : path.join(repoRoot, skillDir);

    const sourceStat = await fs.stat(sourceDir).catch(() => null);
    if (!sourceStat?.isDirectory()) {
      throw new Error(`Missing skill directory ${skillDir} in ${owner}/${repo}`);
    }

    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.cp(sourceDir, packageDir, { recursive: true });
    await runTar(['-czf', outputFile, '-C', stageRoot, packageName], root);
    const stat = await fs.stat(outputFile);
    return stat.size;
  });
}

async function writeSummary({ owners, manifest, failures }) {
  const summary = {
    downloadedAt: new Date().toISOString(),
    generatedFromCatalog: path.relative(root, catalogPath).replaceAll(path.sep, '/'),
    scannedOwners: [...owners].sort(),
    total: manifest.length,
    failed: failures.length,
    items: manifest,
    failures,
  };

  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(indexPath, `${JSON.stringify(summary, null, 2)}\n`);
}

async function main() {
  const { force, owners: cliOwners } = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
  const catalogOwners = Array.isArray(catalog.items)
    ? catalog.items.map((item) => normalizeOwner(item.owner))
    : [];
  const owners = unique(cliOwners.length > 0 ? cliOwners.map(normalizeOwner) : catalogOwners).sort((a, b) => a.localeCompare(b));

  await fs.mkdir(outputRoot, { recursive: true });

  const manifest = [];
  const failures = [];

  for (const owner of owners) {
    try {
      console.log(`Scanning GitHub owner ${owner}`);
      const repos = await listOwnerRepos(owner);

      for (const repo of repos) {
        const repoName = repo?.name;
        const defaultBranch = repo?.default_branch;
        if (!repoName || !defaultBranch || repo?.archived) continue;

        try {
          const treeResponse = await loadRepoTree(owner, repoName, defaultBranch);
          const skillDirs = findSkillDirs(treeResponse.tree);

          for (const skill of skillDirs) {
            const skillSlug = sanitizeSegment(skill.skillDir === '.' ? repoName : `${repoName}-${skill.skillDir.replaceAll('/', '-')}`);
            const outputFile = path.join(outputRoot, owner, `${skillSlug}.tar.gz`);

            let bytes = null;
            if (!force) {
              try {
                const stat = await fs.stat(outputFile);
                bytes = stat.size;
              } catch {
                bytes = null;
              }
            }

            if (bytes === null) {
              bytes = await packageSkillFromRepo({
                owner,
                repo: repoName,
                defaultBranch,
                skillDir: skill.skillDir,
                outputFile,
              });
              console.log(`${force ? 'Refreshed' : 'Downloaded'} GitHub skill ${owner}/${repoName}:${skill.skillDir}`);
            } else {
              console.log(`Skipping existing GitHub skill ${owner}/${repoName}:${skill.skillDir}`);
            }

            manifest.push({
              owner,
              repo: repoName,
              branch: defaultBranch,
              skillDir: skill.skillDir,
              skillPath: skill.skillPath,
              archiveType: 'tar.gz',
              githubUrl: `${githubWebBaseUrl}/${owner}/${repoName}`,
              file: path.relative(root, outputFile).replaceAll(path.sep, '/'),
              bytes,
            });
            await writeSummary({ owners, manifest, failures });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failures.push({
            owner,
            repo: repoName,
            error: message,
          });
          console.error(`Failed repo ${owner}/${repoName}: ${message}`);
          await writeSummary({ owners, manifest, failures });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({
        owner,
        repo: null,
        error: message,
      });
      console.error(`Failed owner ${owner}: ${message}`);
      await writeSummary({ owners, manifest, failures });
    }
  }

  console.log(`Saved ${manifest.length} GitHub skill archives to ${path.relative(root, outputRoot)}.`);
  if (failures.length > 0) {
    console.log(`Recorded ${failures.length} GitHub scan/download failures in ${path.relative(root, indexPath)}.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
