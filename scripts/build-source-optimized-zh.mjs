import fs from 'node:fs/promises';
import path from 'node:path';
import { SOURCE_OPTIMIZED_PACKAGE_MANIFEST } from './lib/source-optimized-manifest.mjs';

const root = process.cwd();
const sourceRoot = path.join(root, 'packages', 'source-optimized');
const outputRoot = path.join(root, 'packages', 'source-optimized-zh');
const templatesRoot = path.join(root, 'templates', 'source-optimized-zh');
const EXCLUDED_BASENAMES = new Set(['CHECKLIST.md', 'README.md', '_meta.json']);
const EXCLUDED_EXTENSIONS = new Set(['.pyc', '.pyo', '.log']);
const EXCLUDED_SEGMENTS = new Set(['__pycache__', '.pytest_cache']);

async function copyTree(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await fs.mkdir(targetDir, { recursive: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_SEGMENTS.has(entry.name)) {
        continue;
      }
      await copyTree(sourcePath, targetPath);
    } else {
      if (EXCLUDED_BASENAMES.has(entry.name) || EXCLUDED_EXTENSIONS.has(path.extname(entry.name))) {
        continue;
      }
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });

  for (const [relativePackage, config] of Object.entries(SOURCE_OPTIMIZED_PACKAGE_MANIFEST)) {
    const templateRelative = config.zhTemplateSkill;
    if (!templateRelative) continue;
    const sourceDir = path.join(sourceRoot, relativePackage);
    const targetRelative = templateRelative.replace(/\/SKILL\.md$/, '');
    const targetDir = path.join(outputRoot, targetRelative);
    const templatePath = path.join(templatesRoot, templateRelative);

    await copyTree(sourceDir, targetDir);
    await fs.copyFile(templatePath, path.join(targetDir, 'SKILL.md'));
  }

  const zhCount = Object.values(SOURCE_OPTIMIZED_PACKAGE_MANIFEST).filter((config) => config.zhTemplateSkill).length;
  console.log(`Prepared ${zhCount} optimized Chinese source packages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
