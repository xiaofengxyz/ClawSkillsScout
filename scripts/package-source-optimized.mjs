import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const packagesRoot = path.join(root, 'packages', 'source-optimized');
const outputRoot = path.join(root, 'artifacts', 'optimized-release-zips');
const indexPath = path.join(outputRoot, 'index.json');

async function listPackages() {
  const owners = await fs.readdir(packagesRoot, { withFileTypes: true });
  const packages = [];
  for (const owner of owners) {
    if (!owner.isDirectory()) continue;
    const ownerDir = path.join(packagesRoot, owner.name);
    const skills = await fs.readdir(ownerDir, { withFileTypes: true });
    for (const skill of skills) {
      if (skill.isDirectory()) packages.push(path.join(ownerDir, skill.name));
    }
  }
  return packages.sort();
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });

  const packageDirs = await listPackages();
  const index = [];

  for (const packageDir of packageDirs) {
    const rel = path.relative(packagesRoot, packageDir).replaceAll(path.sep, '/');
    const [owner, slug] = rel.split('/');
    const zipPath = path.join(outputRoot, `${owner}--${slug}.zip`);
    const result = spawnSync('python3', ['-m', 'zipfile', '-c', zipPath, ...await collectFiles(packageDir)], {
      cwd: packageDir,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
    index.push({
      owner,
      slug,
      packageDir: path.relative(root, packageDir).replaceAll(path.sep, '/'),
      zip: path.relative(root, zipPath).replaceAll(path.sep, '/'),
    });
  }

  await fs.writeFile(indexPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), items: index }, null, 2)}\n`);
  console.log(`Packaged ${index.length} optimized release zips.`);
}

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectFiles(full);
      for (const item of nested) {
        files.push(path.join(entry.name, item).replaceAll(path.sep, '/'));
      }
    } else {
      files.push(entry.name);
    }
  }
  return files.sort();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
