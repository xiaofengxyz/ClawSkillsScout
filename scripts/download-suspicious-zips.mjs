import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const catalogPath = path.join(root, 'public', 'data', 'catalog.json');
const outputRoot = path.join(root, 'artifacts', 'original-zips');
const indexPath = path.join(outputRoot, 'index.json');

function extractSlug(url) {
  const normalized = url.replace(/\/+$/, '');
  return normalized.slice(normalized.lastIndexOf('/') + 1);
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
      '20',
      '--max-time',
      '180',
      '--user-agent',
      'Mozilla/5.0 (compatible; ClawSkillsScout/1.0; +https://github.com/xiaofengxyz/ClawSkillsScout)',
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

async function main() {
  const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
  const targets = catalog.items.filter(
    (item) => item.type === 'skill' && item.suspicious && typeof item.downloadUrl === 'string' && item.downloadUrl.length > 0,
  );

  await fs.mkdir(outputRoot, { recursive: true });
  const manifest = [];

  for (const item of targets) {
    const slug = extractSlug(item.clawhubUrl);
    const filePath = path.join(outputRoot, item.owner, `${slug}.zip`);
    let bytes;
    try {
      const stat = await fs.stat(filePath);
      bytes = stat.size;
      console.log(`Skipping existing ${item.owner}/${slug}`);
    } catch {
      bytes = await downloadFile(item.downloadUrl, filePath);
      console.log(`Downloaded ${item.owner}/${slug}`);
    }
    manifest.push({
      owner: item.owner,
      slug,
      clawhubUrl: item.clawhubUrl,
      downloadUrl: item.downloadUrl,
      file: path.relative(root, filePath).replaceAll(path.sep, '/'),
      bytes,
    });
  }

  await fs.writeFile(indexPath, `${JSON.stringify({ downloadedAt: new Date().toISOString(), items: manifest }, null, 2)}\n`);
  console.log(`Saved ${manifest.length} suspicious source zips.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
