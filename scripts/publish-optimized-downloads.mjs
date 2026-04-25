import fs from 'node:fs/promises';
import path from 'node:path';
import { extractPackageMetadata } from './lib/skill-frontmatter.mjs';

const root = process.cwd();
const packagesRoot = path.join(root, 'packages', 'source-optimized');
const zipsRoot = path.join(root, 'artifacts', 'optimized-release-zips');
const publicDownloadsRoot = path.join(root, 'public', 'downloads', 'optimized');
const publicDataPath = path.join(root, 'public', 'data', 'optimized-packages.json');
const verificationPath = path.join(root, 'artifacts', 'source-optimized-verification.json');
const catalogPath = path.join(root, 'public', 'data', 'catalog.json');

async function main() {
  const verification = JSON.parse(await fs.readFile(verificationPath, 'utf8'));
  const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));

  await fs.mkdir(publicDownloadsRoot, { recursive: true });

  const items = [];
  for (const report of verification.packages) {
    const [owner, slug] = report.package.split('/');
    const zipName = `${owner}--${slug}.zip`;
    const zipSource = path.join(zipsRoot, zipName);
    const zipTarget = path.join(publicDownloadsRoot, zipName);
    const skillPath = path.join(packagesRoot, owner, slug, 'SKILL.md');
    const skillText = await fs.readFile(skillPath, 'utf8');
    const packageMetadata = extractPackageMetadata(skillText);
    await fs.copyFile(zipSource, zipTarget);

    const catalogItem = catalog.items.find((item) => item.owner === owner && item.clawhubUrl.endsWith(`/${slug}`));
    items.push({
      owner,
      slug,
      name: catalogItem?.name ?? slug,
      clawhubUrl: catalogItem?.clawhubUrl ?? null,
      suspiciousReason: catalogItem?.suspiciousReason ?? '',
      requiredBins: packageMetadata.requiredBins,
      requiredEnv: packageMetadata.requiredEnv,
      primaryEnv: packageMetadata.primaryEnv,
      compatibility: packageMetadata.compatibility,
      packageDir: `packages/source-optimized/${owner}/${slug}`,
      downloadPath: `downloads/optimized/${zipName}`,
      verificationStatus: report.status,
      retainedChecks: report.retainedChecks,
      removedChecks: report.removedChecks,
      manualTestRequired: report.manualTestRequired,
      checklistPath: `packages/source-optimized/${owner}/${slug}/CHECKLIST.md`,
    });
  }

  await fs.writeFile(
    publicDataPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2)}\n`,
  );

  console.log(`Published ${items.length} optimized download entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
