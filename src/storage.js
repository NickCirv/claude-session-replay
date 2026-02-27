import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SESSIONS_DIR = path.join(os.homedir(), '.claude-replay', 'sessions');
const LOCK_FILE = path.join(os.homedir(), '.claude-replay', 'recording.lock');

export async function ensureDir() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

export function sessionPath(id) {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

export async function listSessions() {
  await ensureDir();
  let files;
  try {
    files = await fs.readdir(SESSIONS_DIR);
  } catch {
    return [];
  }
  const sessions = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(SESSIONS_DIR, file), 'utf8');
      const session = JSON.parse(raw);
      sessions.push(summarise(session));
    } catch {
      // skip corrupt files
    }
  }
  return sessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

export async function getSession(id) {
  await ensureDir();
  try {
    const raw = await fs.readFile(sessionPath(id), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveSession(session) {
  await ensureDir();
  await fs.writeFile(sessionPath(session.id), JSON.stringify(session, null, 2), 'utf8');
}

export async function deleteSession(id) {
  try {
    await fs.unlink(sessionPath(id));
    return true;
  } catch {
    return false;
  }
}

export async function writeLock(data) {
  await ensureDir();
  await fs.writeFile(LOCK_FILE, JSON.stringify(data), 'utf8');
}

export async function readLock() {
  try {
    const raw = await fs.readFile(LOCK_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearLock() {
  try {
    await fs.unlink(LOCK_FILE);
  } catch {
    // already gone
  }
}

function summarise(session) {
  return {
    id: session.id,
    name: session.name ?? null,
    startedAt: session.startedAt,
    duration: session.duration ?? null,
    eventCount: (session.events ?? []).length,
  };
}
