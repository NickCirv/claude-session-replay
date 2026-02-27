import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { watch } from 'chokidar';
import chalk from 'chalk';
import { saveSession, writeLock, readLock, clearLock } from './storage.js';

const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');

// Generate a short unique ID: YYYYMMDD-HHMMSS + 4 random chars
function generateId() {
  const now = new Date();
  const datePart = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${datePart}-${rand}`;
}

export async function startRecording(name) {
  const existing = await readLock();
  if (existing) {
    console.error(chalk.red(`Already recording session "${existing.id}". Run \`claude-session-replay stop\` first.`));
    process.exit(1);
  }

  const id = generateId();
  const startedAt = new Date().toISOString();
  const session = { id, name: name ?? null, startedAt, events: [] };

  await writeLock({ id, startedAt, pid: process.pid });
  await saveSession(session);

  console.log(chalk.green(`Recording started — session ID: ${chalk.bold(id)}`));
  console.log(chalk.dim(`Watching ${CLAUDE_PROJECTS_DIR} for Claude JSONL activity...`));
  console.log(chalk.dim('Run `claude-session-replay stop` to finish.\n'));

  const watcher = watch(`${CLAUDE_PROJECTS_DIR}/**/*.jsonl`, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
  });

  const seenPositions = new Map(); // file → bytes read so far

  async function processFile(filePath) {
    const prevPos = seenPositions.get(filePath) ?? 0;
    let content;
    try {
      const fd = await fs.open(filePath, 'r');
      const stat = await fd.stat();
      const newBytes = stat.size - prevPos;
      if (newBytes <= 0) {
        await fd.close();
        return;
      }
      const buf = Buffer.alloc(newBytes);
      await fd.read(buf, 0, newBytes, prevPos);
      await fd.close();
      content = buf.toString('utf8');
      seenPositions.set(filePath, stat.size);
    } catch {
      return;
    }

    const lines = content.split('\n').filter((l) => l.trim());
    const currentSession = await loadSession(id);

    for (const line of lines) {
      const event = parseLine(line, filePath);
      if (event) {
        currentSession.events.push(event);
        printLive(event);
      }
    }

    await saveSession(currentSession);
  }

  watcher.on('add', processFile);
  watcher.on('change', processFile);

  // Also scan existing files that might already be active
  try {
    const entries = await scanJsonlFiles(CLAUDE_PROJECTS_DIR);
    for (const f of entries) {
      const stat = await fs.stat(f);
      seenPositions.set(f, stat.size); // skip existing content
    }
  } catch {
    // Claude dir may not exist yet
  }

  // Keep process alive until SIGINT/SIGTERM or stop command
  const signals = ['SIGINT', 'SIGTERM'];
  for (const sig of signals) {
    process.on(sig, async () => {
      await watcher.close();
      await finishSession(id);
      process.exit(0);
    });
  }

  // Idle — let watcher drive the process
  await new Promise(() => {});
}

export async function stopRecording() {
  const lock = await readLock();
  if (!lock) {
    console.error(chalk.red('No active recording found.'));
    process.exit(1);
  }
  await finishSession(lock.id);
}

async function finishSession(id) {
  const session = await loadSession(id);
  if (!session) {
    await clearLock();
    return;
  }
  session.duration = new Date() - new Date(session.startedAt);
  session.endedAt = new Date().toISOString();
  await saveSession(session);
  await clearLock();

  console.log(chalk.green(`\nSession "${id}" saved — ${session.events.length} events captured.`));
  console.log(chalk.dim(`Replay with: claude-session-replay play ${id}`));
}

async function loadSession(id) {
  try {
    const { getSession } = await import('./storage.js');
    return await getSession(id);
  } catch {
    return null;
  }
}

function parseLine(line, filePath) {
  let raw;
  try {
    raw = JSON.parse(line);
  } catch {
    return null;
  }

  const ts = raw.timestamp ?? raw.ts ?? new Date().toISOString();

  // Claude Code JSONL schema has a `type` field
  const type = raw.type ?? raw.role ?? 'unknown';

  if (type === 'assistant' || type === 'user') {
    return parseMessageEvent(raw, ts, filePath);
  }

  if (raw.toolUse || raw.tool_use) {
    return parseToolEvent(raw, ts);
  }

  return {
    timestamp: ts,
    type: 'message',
    summary: `[${type}]`,
    detail: JSON.stringify(raw).slice(0, 300),
    raw,
  };
}

function parseMessageEvent(raw, ts, filePath) {
  const role = raw.type ?? raw.role;
  const content = extractContent(raw.message ?? raw);

  // Detect tool use blocks inside assistant messages
  if (Array.isArray(content)) {
    const events = [];
    for (const block of content) {
      if (block.type === 'tool_use') {
        events.push(buildToolEvent(block, ts));
      } else if (block.type === 'text' && block.text?.trim()) {
        events.push({
          timestamp: ts,
          type: role === 'assistant' ? 'assistant' : 'user',
          summary: truncate(block.text, 80),
          detail: block.text,
        });
      }
    }
    if (events.length === 1) return events[0];
    if (events.length > 1) {
      // Return first; caller will handle arrays — for now flatten to first
      return events[0];
    }
  }

  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return {
    timestamp: ts,
    type: role === 'assistant' ? 'assistant' : 'user',
    summary: truncate(text, 80),
    detail: text,
  };
}

function parseToolEvent(raw, ts) {
  const tool = raw.toolUse ?? raw.tool_use ?? raw;
  return buildToolEvent(tool, ts);
}

function buildToolEvent(block, ts) {
  const name = block.name ?? block.tool ?? 'UnknownTool';
  const input = block.input ?? block.parameters ?? {};

  let summary = `${name}`;
  let detail = JSON.stringify(input, null, 2);

  if (name === 'Write' || name === 'Edit') {
    const fp = input.file_path ?? input.path ?? '';
    summary = `${name}: ${path.basename(fp)}`;
    detail = fp;
  } else if (name === 'Read') {
    const fp = input.file_path ?? input.path ?? '';
    summary = `Read: ${path.basename(fp)}`;
    detail = fp;
  } else if (name === 'Bash') {
    const cmd = input.command ?? '';
    summary = `Bash: ${truncate(cmd, 60)}`;
    detail = cmd;
  } else if (name === 'Glob') {
    summary = `Glob: ${input.pattern ?? ''}`;
    detail = JSON.stringify(input);
  } else if (name === 'Grep') {
    summary = `Grep: ${input.pattern ?? ''}`;
    detail = JSON.stringify(input);
  } else if (name === 'WebSearch') {
    summary = `WebSearch: ${truncate(input.query ?? '', 60)}`;
    detail = input.query ?? '';
  } else if (name === 'WebFetch') {
    summary = `WebFetch: ${truncate(input.url ?? '', 60)}`;
    detail = input.url ?? '';
  } else if (name === 'TodoWrite') {
    summary = `TodoWrite: ${(input.todos ?? []).length} todos`;
    detail = JSON.stringify(input.todos ?? [], null, 2);
  }

  return {
    timestamp: ts,
    type: 'tool',
    tool: name,
    summary,
    detail,
    input,
  };
}

function extractContent(msg) {
  if (!msg) return '';
  if (typeof msg.content === 'string') return msg.content;
  if (Array.isArray(msg.content)) return msg.content;
  if (typeof msg === 'string') return msg;
  return '';
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function printLive(event) {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const prefix = chalk.dim(`[${time}]`);
  if (event.type === 'tool') {
    process.stdout.write(`${prefix} ${chalk.yellow('⚙')} ${chalk.bold(event.tool)} ${chalk.dim(event.summary.replace(event.tool + ': ', ''))}\n`);
  } else if (event.type === 'assistant') {
    process.stdout.write(`${prefix} ${chalk.cyan('◆')} ${chalk.dim(event.summary)}\n`);
  } else if (event.type === 'user') {
    process.stdout.write(`${prefix} ${chalk.green('▶')} ${chalk.dim(event.summary)}\n`);
  } else {
    process.stdout.write(`${prefix} ${chalk.dim(event.summary)}\n`);
  }
}

async function scanJsonlFiles(dir) {
  const results = [];
  async function walk(d) {
    let entries;
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.name.endsWith('.jsonl')) {
        results.push(full);
      }
    }
  }
  await walk(dir);
  return results;
}
