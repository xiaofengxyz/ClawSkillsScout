import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const packagesRoot = path.join(root, 'packages', 'source-optimized-zh');
const outputRoot = path.join(root, 'artifacts', 'optimized-release-zips-zh');
const publicRoot = path.join(root, 'public', 'downloads', 'optimized-zh');
const EXCLUDED_BASENAMES = new Set(['CHECKLIST.md', 'README.md', '_meta.json']);
const EXCLUDED_EXTENSIONS = new Set(['.pyc', '.pyo', '.log']);
const EXCLUDED_SEGMENTS = new Set(['__pycache__', '.pytest_cache']);

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

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_SEGMENTS.has(entry.name)) {
        continue;
      }
      const nested = await collectFiles(full);
      for (const item of nested) {
        files.push(path.join(entry.name, item).replaceAll(path.sep, '/'));
      }
    } else {
      if (EXCLUDED_BASENAMES.has(entry.name) || EXCLUDED_EXTENSIONS.has(path.extname(entry.name))) {
        continue;
      }
      files.push(entry.name);
    }
  }
  return files.sort();
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.rm(publicRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.mkdir(publicRoot, { recursive: true });

  const packageDirs = await listPackages();

  for (const packageDir of packageDirs) {
    const rel = path.relative(packagesRoot, packageDir).replaceAll(path.sep, '/');
    const [owner, slug] = rel.split('/');
    const zipName = `${owner}--${slug}.zip`;
    const zipPath = path.join(outputRoot, zipName);
    const files = await collectFiles(packageDir);
    const result = spawnSync('python3', ['-c', ZIP_PYTHON_SCRIPT, zipPath, packageDir, ...files], {
      cwd: root,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
    await fs.copyFile(zipPath, path.join(publicRoot, zipName));
  }

  console.log(`Packaged ${packageDirs.length} optimized Chinese release zips.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const ZIP_PYTHON_SCRIPT = `
import pathlib
import sys
import zipfile

zip_path = pathlib.Path(sys.argv[1])
package_dir = pathlib.Path(sys.argv[2])
files = sys.argv[3:]

with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for relative in files:
        archive.write(package_dir / relative, arcname=relative)
`;
