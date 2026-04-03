import { spawn, type ChildProcess } from 'node:child_process';

const childProcesses: ChildProcess[] = [];
let shuttingDown = false;

startProcess(process.execPath, [
  '--import',
  'tsx',
  'src/ui/settings-server.ts',
]);

startProcess(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
  '--prefix',
  'ui',
  'run',
  'dev',
]);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    shutdown(signal);
  });
}

function startProcess(command: string, args: string[]) {
  const child = spawn(command, args, {
    env: process.env,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    shutdown('SIGTERM');
    process.exitCode = code ?? 0;
  });

  childProcesses.push(child);
}

function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown && childProcesses.every((child) => child.killed)) {
    return;
  }

  shuttingDown = true;

  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}
