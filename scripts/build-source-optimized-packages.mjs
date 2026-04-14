import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'artifacts', 'original-unpacked');
const outputRoot = path.join(root, 'packages', 'source-optimized');

const PACKAGE_FILES = {
  '0xjordansg-yolo/openclaw-twitter': [
    'SKILL.md',
    'scripts/twitter_client.py',
    'scripts/twitter_oauth_client.py',
    'references/post_twitter.md',
  ],
  'aisapay/aisa-twitter-api': [
    'SKILL.md',
    'scripts/twitter_client.py',
    'scripts/twitter_oauth_client.py',
    'references/post_twitter.md',
  ],
  'aisadocs/openclaw-twitter-post-engage': [
    'SKILL.md',
    'scripts/twitter_client.py',
    'scripts/twitter_oauth_client.py',
    'scripts/twitter_engagement_client.py',
    'references/post_twitter.md',
    'references/engage_twitter.md',
  ],
  'karensheng/x-intelligence-automation': [
    'SKILL.md',
    'scripts/twitter_client.py',
    'scripts/twitter_oauth_client.py',
    'scripts/twitter_engagement_client.py',
    'references/post_twitter.md',
    'references/engage_twitter.md',
  ],
  'chaimengphp/openclaw-aisa-twitter': [
    'SKILL.md',
    'scripts/twitter_client.py',
    'scripts/twitter_oauth_client.py',
    'scripts/twitter_engagement_client.py',
    'references/post_twitter.md',
    'references/engage_twitter.md',
  ],
  '0xjordansg-yolo/openclaw-aisa-youtube': [
    'SKILL.md',
    'LICENSE.txt',
  ],
  '0xjordansg-yolo/openclaw-aisa-youtube-search-serp-video-channels-trends-content-tracking': [
    'SKILL.md',
    'scripts/youtube_client.py',
  ],
};

async function copyFile(relativePackage, relativeFile) {
  const sourceFile = path.join(sourceRoot, relativePackage, relativeFile);
  const targetFile = path.join(outputRoot, relativePackage, relativeFile);
  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.copyFile(sourceFile, targetFile);
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });

  for (const [relativePackage, files] of Object.entries(PACKAGE_FILES)) {
    for (const relativeFile of files) {
      await copyFile(relativePackage, relativeFile);
    }
  }

  console.log(`Prepared ${Object.keys(PACKAGE_FILES).length} optimized source packages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
