import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'packages', 'source-optimized');
const outputRoot = path.join(root, 'packages', 'source-optimized-zh');
const templatesRoot = path.join(root, 'templates', 'source-optimized-zh');
const EXCLUDED_BASENAMES = new Set(['CHECKLIST.md', 'README.md', '_meta.json']);
const EXCLUDED_EXTENSIONS = new Set(['.pyc', '.pyo', '.log']);
const EXCLUDED_SEGMENTS = new Set(['__pycache__', '.pytest_cache']);

const ZH_SKILLS = {
  '0xjordansg-yolo/openclaw-twitter': '0xjordansg-yolo/openclaw-twitter-zh/SKILL.md',
  'aisapay/aisa-twitter-api': 'aisapay/aisa-twitter-api-zh/SKILL.md',
  'aisadocs/openclaw-twitter-post-engage': 'aisadocs/openclaw-twitter-post-engage-zh/SKILL.md',
  'karensheng/x-intelligence-automation': 'karensheng/x-intelligence-automation-zh/SKILL.md',
  'chaimengphp/openclaw-aisa-twitter': 'chaimengphp/openclaw-aisa-twitter-zh/SKILL.md',
  '0xjordansg-yolo/openclaw-aisa-youtube': '0xjordansg-yolo/openclaw-aisa-youtube-zh/SKILL.md',
  '0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking':
    '0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking-zh/SKILL.md',
};

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

  for (const [relativePackage, templateRelative] of Object.entries(ZH_SKILLS)) {
    const sourceDir = path.join(sourceRoot, relativePackage);
    const targetRelative = templateRelative.replace(/\/SKILL\.md$/, '');
    const targetDir = path.join(outputRoot, targetRelative);
    const templatePath = path.join(templatesRoot, templateRelative);

    await copyTree(sourceDir, targetDir);
    await fs.copyFile(templatePath, path.join(targetDir, 'SKILL.md'));
  }

  console.log(`Prepared ${Object.keys(ZH_SKILLS).length} optimized Chinese source packages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
