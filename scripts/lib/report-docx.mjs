import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

export function syncMarkdownDocx(root, markdownPaths, { force = true } = {}) {
  const helperPath = resolve(root, 'scripts/sync-report-docx.py');
  const args = [helperPath];
  if (force) {
    args.push('--force');
  }
  args.push(...markdownPaths);

  const result = spawnSync('python3', args, {
    cwd: root,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`sync-report-docx.py failed with exit code ${result.status ?? 'unknown'}`);
  }
}
