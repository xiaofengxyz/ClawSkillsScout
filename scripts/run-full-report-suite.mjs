import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const steps = [
  {
    name: 'analyze:clawhub-growth',
    expectedOutputs: ['public/data/clawhub-growth-report.json'],
  },
  {
    name: 'analyze:clawhub-download-insights',
    expectedOutputs: ['public/data/clawhub-download-insights.json'],
  },
  {
    name: 'analyze:clawhub-plugins',
    expectedOutputs: ['public/data/clawhub-plugin-report.json'],
  },
  {
    name: 'analyze:clawhub-10k-system',
    expectedOutputs: ['public/data/clawhub-10k-system-report.json'],
    timeoutMs: 30 * 60 * 1000,
  },
  {
    name: 'analyze:clawhub-10k-followups',
    expectedOutputs: [
      'public/reports/ClawHub_10K_System_Report_ZH.md',
      'public/reports/ClawHub_10K_Boss_Brief_ZH.md',
    ],
  },
  {
    name: 'analyze:clawhub-multi-ranking',
    expectedOutputs: ['public/data/clawhub-multi-ranking-report.json'],
  },
  {
    name: 'analyze:clawhub-viral-boss',
    expectedOutputs: ['public/reports/ClawHub_Viral_Boss_Report_ZH.md'],
  },
  {
    name: 'analyze:aisa-expansion-plans',
    expectedOutputs: [
      'public/data/aisa-all-skills-breakout-plan.json',
      'public/data/clawhub-top200-aisa-conversion-plan.json',
    ],
  },
  {
    name: 'analyze:market-ecosystem',
    expectedOutputs: [
      'public/data/market-ecosystem-report.json',
      'public/reports/Claude_AISA_Report_ZH.md',
      'public/reports/Hermes_AISA_Report_ZH.md',
    ],
  },
  {
    name: 'analyze:agentskill',
    expectedOutputs: ['public/data/agentskill-report.json'],
  },
  {
    name: 'analyze:agentskills-so',
    expectedOutputs: ['public/data/agentskills-so-report.json'],
  },
];

async function pathExists(relativePath) {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function runNpmScript(name, timeoutMs = 20 * 60 * 1000) {
  await new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ['run', name], {
      cwd: root,
      stdio: 'inherit',
    });
    let timeoutHandle = null;
    let settled = false;

    const settle = (callback) => {
      if (settled) return;
      settled = true;
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      callback();
    };

    timeoutHandle = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000).unref();
      settle(() => reject(new Error(`npm run ${name} timed out after ${timeoutMs}ms`)));
    }, timeoutMs);

    child.on('exit', (code) => {
      settle(() => {
        if (code === 0) {
          resolve(undefined);
          return;
        }
        reject(new Error(`npm run ${name} exited with code ${code ?? 'unknown'}`));
      });
    });
    child.on('error', (error) => settle(() => reject(error)));
  });
}

async function main() {
  const warnings = [];

  for (const step of steps) {
    try {
      await runNpmScript(step.name, step.timeoutMs);
    } catch (error) {
      const missingOutputs = [];
      for (const relativePath of step.expectedOutputs) {
        if (!(await pathExists(relativePath))) {
          missingOutputs.push(relativePath);
        }
      }

      if (missingOutputs.length === 0) {
        const message = error instanceof Error ? error.message : String(error);
        const warning = `${step.name} failed, but cached outputs exist. Continuing with previous artifacts. Error: ${message}`;
        warnings.push(warning);
        console.warn(warning);
        continue;
      }

      throw new Error(
        `${step.name} failed and required cached outputs are missing: ${missingOutputs.join(', ')}`,
      );
    }
  }

  if (warnings.length > 0) {
    console.warn(`Full report suite completed with ${warnings.length} fallback warnings.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
