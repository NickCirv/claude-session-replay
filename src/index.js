import { Command } from 'commander';
import chalk from 'chalk';
import { startRecording, stopRecording } from './recorder.js';
import { playSession } from './player.js';
import { exportSession } from './exporter.js';
import { listSessions, getSession, deleteSession } from './storage.js';

const program = new Command();

program
  .name('claude-session-replay')
  .description('Record and replay Claude Code sessions')
  .version('1.0.0');

program
  .command('record')
  .description('Start recording a Claude Code session')
  .option('-n, --name <name>', 'Session name (optional)')
  .action(async (opts) => {
    await startRecording(opts.name);
  });

program
  .command('stop')
  .description('Stop recording and save the session')
  .action(async () => {
    await stopRecording();
  });

program
  .command('list')
  .description('List all recorded sessions')
  .action(async () => {
    const sessions = await listSessions();
    if (sessions.length === 0) {
      console.log(chalk.dim('No sessions recorded yet. Run `claude-session-replay record` to start.'));
      return;
    }
    console.log(chalk.bold('\nRecorded sessions:\n'));
    for (const s of sessions) {
      const date = new Date(s.startedAt).toLocaleString();
      const duration = s.duration ? formatDuration(s.duration) : chalk.dim('recording...');
      const events = s.eventCount ?? 0;
      console.log(
        chalk.cyan(`  ${s.id}`) +
        chalk.dim(`  ${date}`) +
        chalk.yellow(`  ${events} events`) +
        `  ${duration}` +
        (s.name ? chalk.green(`  "${s.name}"`) : '')
      );
    }
    console.log();
  });

program
  .command('play <id>')
  .description('Replay a recorded session in the terminal')
  .option('-s, --speed <multiplier>', 'Playback speed (1, 2, 5, or "instant")', '1')
  .action(async (id, opts) => {
    const session = await getSession(id);
    if (!session) {
      console.error(chalk.red(`Session "${id}" not found. Run \`claude-session-replay list\` to see available sessions.`));
      process.exit(1);
    }
    const speed = opts.speed === 'instant' ? Infinity : parseFloat(opts.speed);
    if (isNaN(speed) || speed <= 0) {
      console.error(chalk.red('Speed must be a positive number or "instant".'));
      process.exit(1);
    }
    await playSession(session, speed);
  });

program
  .command('export <id>')
  .description('Export a session as a standalone HTML file')
  .option('--html', 'Export as HTML (default)', true)
  .option('-o, --output <path>', 'Output file path (default: ./<id>.html)')
  .action(async (id, opts) => {
    const session = await getSession(id);
    if (!session) {
      console.error(chalk.red(`Session "${id}" not found.`));
      process.exit(1);
    }
    const outPath = opts.output ?? `./${id}.html`;
    await exportSession(session, outPath);
    console.log(chalk.green(`Exported → ${outPath}`));
  });

program
  .command('delete <id>')
  .description('Delete a recorded session')
  .action(async (id) => {
    const deleted = await deleteSession(id);
    if (!deleted) {
      console.error(chalk.red(`Session "${id}" not found.`));
      process.exit(1);
    }
    console.log(chalk.green(`Deleted session ${id}.`));
  });

program.parse();

function formatDuration(ms) {
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m${rem > 0 ? `${rem}s` : ''}`;
}
