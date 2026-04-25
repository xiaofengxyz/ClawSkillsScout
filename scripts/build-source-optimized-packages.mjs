import fs from 'node:fs/promises';
import path from 'node:path';
import { SOURCE_OPTIMIZED_PACKAGE_MANIFEST } from './lib/source-optimized-manifest.mjs';

const root = process.cwd();
const sourceRoot = path.join(root, 'artifacts', 'original-unpacked');
const outputRoot = path.join(root, 'packages', 'source-optimized');
const templatesRoot = path.join(root, 'templates', 'source-optimized');

async function copyFile(relativePackage, relativeFile) {
  const sourceFile = path.join(sourceRoot, relativePackage, relativeFile);
  const targetFile = path.join(outputRoot, relativePackage, relativeFile);
  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.copyFile(sourceFile, targetFile);
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });

  for (const [relativePackage, config] of Object.entries(SOURCE_OPTIMIZED_PACKAGE_MANIFEST)) {
    for (const relativeFile of config.retained) {
      await copyFile(relativePackage, relativeFile);
    }

    const templateRelative = config.templateSkill;
    if (templateRelative) {
      const templatePath = path.join(templatesRoot, templateRelative);
      const targetSkill = path.join(outputRoot, relativePackage, 'SKILL.md');
      await fs.copyFile(templatePath, targetSkill);
    }
  }

  console.log(`Prepared ${Object.keys(SOURCE_OPTIMIZED_PACKAGE_MANIFEST).length} optimized source packages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
