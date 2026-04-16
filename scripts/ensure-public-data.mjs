import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function ensureFile(filePath, contents) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents, 'utf8');
    console.log(`Created missing ${path.relative(root, filePath)}`);
  }
}

const optimizedPackagesPath = path.join(root, 'public', 'data', 'optimized-packages.json');

await ensureFile(
  optimizedPackagesPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), items: [] }, null, 2)}\n`,
);
