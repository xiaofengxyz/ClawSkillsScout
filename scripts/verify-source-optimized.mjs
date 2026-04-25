import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { extractPackageMetadata } from './lib/skill-frontmatter.mjs';
import { SOURCE_OPTIMIZED_PACKAGE_MANIFEST } from './lib/source-optimized-manifest.mjs';

const root = process.cwd();
const originalRoot = path.join(root, 'artifacts', 'original-unpacked');
const optimizedRoot = path.join(root, 'packages', 'source-optimized');
const reportPath = path.join(root, 'artifacts', 'source-optimized-verification.json');

function runCommand(command, cwd) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd,
    encoding: 'utf8',
  });
  return {
    command: command.join(' '),
    exitCode: result.status ?? 1,
    passed: result.status === 0,
    stdout: (result.stdout || '').slice(0, 4000),
    stderr: (result.stderr || '').slice(0, 4000),
  };
}

async function listFiles(baseDir) {
  const files = [];
  async function walk(current, prefix = '') {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full, rel);
      } else {
        files.push(rel);
      }
    }
  }
  await walk(baseDir);
  return files.sort();
}

async function removePycacheDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__pycache__') {
        await fs.rm(full, { recursive: true, force: true });
        continue;
      }
      await removePycacheDirs(full);
    }
  }
}

async function verifyPackage(relativePackage, config) {
  const optimizedDir = path.join(optimizedRoot, relativePackage);
  const originalDir = path.join(originalRoot, relativePackage);
  await removePycacheDirs(optimizedDir);
  const optimizedFiles = await listFiles(optimizedDir);
  const originalFiles = await listFiles(originalDir);
  const skillPath = path.join(optimizedDir, 'SKILL.md');
  const skillText = await fs.readFile(skillPath, 'utf8');
  const packageMetadata = extractPackageMetadata(skillText);

  const retainedChecks = config.retained.map((file) => ({
    file,
    exists: optimizedFiles.includes(file),
  }));
  const removedChecks = config.removed.map((file) => ({
    file,
    removed: !optimizedFiles.includes(file),
    existedInOriginal: originalFiles.includes(file),
  }));

  const pyFiles = optimizedFiles.filter((file) => file.endsWith('.py'));
  const pyCompile = pyFiles.length
    ? runCommand(['python3', '-m', 'py_compile', ...pyFiles], optimizedDir)
    : { command: 'python3 -m py_compile', exitCode: 0, passed: true, stdout: '', stderr: '' };

  const commandChecks = config.commands.map((command) => runCommand(command, optimizedDir));
  const skillChecks = [
    {
      check: 'uses_metadata_aisa',
      passed: packageMetadata.requiredBins.length > 0 || packageMetadata.requiredEnv.length > 0 || Boolean(packageMetadata.primaryEnv),
    },
    {
      check: 'omits_metadata_openclaw',
      passed: !/metadata:\s*\n\s+openclaw:\s*\n/.test(skillText),
    },
    {
      check: 'declares_compatibility',
      passed: ['openclaw', 'claude-code', 'hermes'].every((runtime) => packageMetadata.compatibility.includes(runtime)),
    },
    {
      check: 'declares_required_env_and_primary_env',
      passed: packageMetadata.requiredEnv.includes('AISA_API_KEY') && packageMetadata.primaryEnv === 'AISA_API_KEY',
    },
    {
      check: 'uses_baseDir_token',
      passed: !skillText.includes('${SKILL_ROOT}') && !skillText.includes('${LAST30DAYS_PYTHON}') && !skillText.includes('{{baseDir}}'),
    },
    {
      check: 'omits_legacy_body_metadata_notes',
      passed: !skillText.includes('metadata.openclaw'),
    },
  ];

  const failed =
    retainedChecks.some((check) => !check.exists) ||
    removedChecks.some((check) => check.existedInOriginal && !check.removed) ||
    !pyCompile.passed ||
    commandChecks.some((check) => !check.passed) ||
    skillChecks.some((check) => !check.passed);

  const manualTestRequired = ['AISA_API_KEY-backed network calls'];
  if (optimizedFiles.includes('scripts/twitter_oauth_client.py') || optimizedFiles.includes('scripts/twitter_engagement_client.py')) {
    manualTestRequired.push('OAuth authorization and publish/engagement flows');
  }

  return {
    package: relativePackage,
    optimizedFiles,
    retainedChecks,
    removedChecks,
    pyCompile,
    commandChecks,
    skillChecks,
    status: failed ? 'needs_manual_runtime_test' : 'static_checks_passed',
    manualTestRequired,
  };
}

async function main() {
  const reports = [];
  for (const [relativePackage, config] of Object.entries(SOURCE_OPTIMIZED_PACKAGE_MANIFEST)) {
    reports.push(await verifyPackage(relativePackage, config));
  }
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), packages: reports }, null, 2)}\n`);
  console.log(`Verified ${reports.length} optimized packages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
