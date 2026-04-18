import { spawn } from 'node:child_process';
import path from 'node:path';

const scriptPath = path.join(process.cwd(), 'scripts', 'convert-github-skills-to-clawhub.py');

const child = spawn('python3', [scriptPath], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
