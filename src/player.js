import chalk from 'chalk';
import path from 'node:path';

const TYPE_COLORS = {
  tool: chalk.yellow,
  assistant: chalk.cyan,
  user: chalk.green,
  message: chalk.white,
  unknown: chalk.dim,
};

const TOOL_ICONS = {
  Write: '✎',
  Edit: '✎',
  Read: '📖',
  Bash: '$',
  Glob: '🔍',
  Grep: '🔍',
  WebSearch: '🌐',
  WebFetch: '🌐',
  TodoWrite: '✓',
  Task: '⚙',
};

export async function playSession(session, speed = 1) {
  const events = session.events ?? [];
  if (events.length === 0) {
    console.log(chalk.dim('No events in this session.'));
    return;
  }

  printHeader(session, speed);

  const firstTs = new Date(events[0].timestamp).getTime();

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const eventTs = new Date(event.timestamp).getTime();
    const prev = i > 0 ? new Date(events[i - 1].timestamp).getTime() : eventTs;
    const gap = eventTs - prev;

    if (gap > 0 && speed !== Infinity) {
      const delay = Math.min(gap / speed, 3000); // cap delay at 3s even at 1x
      await sleep(delay);
    }

    printEvent(event, eventTs - firstTs);
  }

  printFooter(session);
}

function printHeader(session, speed) {
  const bar = '─'.repeat(60);
  console.log('\n' + chalk.dim(bar));
  console.log(chalk.bold.cyan('  claude-session-replay'));
  console.log(chalk.dim(bar));
  if (session.name) {
    console.log(chalk.white(`  Session: `) + chalk.bold(session.name));
  }
  console.log(chalk.dim(`  ID:      ${session.id}`));
  console.log(chalk.dim(`  Date:    ${new Date(session.startedAt).toLocaleString()}`));
  if (session.duration) {
    console.log(chalk.dim(`  Length:  ${formatDuration(session.duration)}`));
  }
  console.log(chalk.dim(`  Events:  ${(session.events ?? []).length}`));
  console.log(chalk.dim(`  Speed:   ${speed === Infinity ? 'instant' : `${speed}x`}`));
  console.log(chalk.dim(bar) + '\n');
}

function printFooter(session) {
  const bar = '─'.repeat(60);
  console.log('\n' + chalk.dim(bar));
  console.log(chalk.bold.green('  Replay complete.'));
  console.log(chalk.dim(`  Export: claude-session-replay export ${session.id} --html`));
  console.log(chalk.dim(bar) + '\n');
}

function printEvent(event, elapsedMs) {
  const elapsed = chalk.dim(`[+${formatDuration(elapsedMs)}]`);

  if (event.type === 'tool') {
    const icon = TOOL_ICONS[event.tool] ?? '⚙';
    const colorFn = TYPE_COLORS.tool;
    console.log(`${elapsed} ${colorFn(`${icon} ${event.tool}`)} ${chalk.dim(stripToolPrefix(event.summary, event.tool))}`);

    // Print detail for Bash commands and edits
    if (event.tool === 'Bash' && event.detail) {
      const lines = event.detail.split('\n').slice(0, 3);
      for (const l of lines) {
        console.log(`         ${chalk.dim('│')} ${chalk.dim(l)}`);
      }
    } else if ((event.tool === 'Write' || event.tool === 'Edit') && event.input?.file_path) {
      console.log(`         ${chalk.dim('│')} ${chalk.dim(event.input.file_path)}`);
    }
  } else if (event.type === 'assistant') {
    console.log(`${elapsed} ${chalk.cyan('◆')} ${chalk.italic.dim(truncate(event.summary, 90))}`);
  } else if (event.type === 'user') {
    console.log(`${elapsed} ${chalk.green('▶')} ${chalk.bold(truncate(event.summary, 90))}`);
  } else {
    console.log(`${elapsed} ${chalk.dim(truncate(event.summary, 90))}`);
  }
}

function stripToolPrefix(summary, tool) {
  const prefix = `${tool}: `;
  return summary.startsWith(prefix) ? summary.slice(prefix.length) : summary;
}

function formatDuration(ms) {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m${rem > 0 ? `${rem}s` : ''}`;
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
