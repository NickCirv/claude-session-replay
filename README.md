<div align="center">

# claude-session-replay

**Record and replay Claude Code sessions — captures every tool call, edit, and bash command as a replayable timeline**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?labelColor=0B0A09)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?labelColor=0B0A09)](package.json)

</div>

## Install

```bash
npx github:NickCirv/claude-session-replay <command>
```

Or clone and run locally:

```bash
git clone https://github.com/NickCirv/claude-session-replay.git
cd claude-session-replay
npm install
node bin/replay.js <command>
```

## Usage

```bash
# Start recording (run Claude Code normally in another terminal)
npx github:NickCirv/claude-session-replay record
npx github:NickCirv/claude-session-replay record --name "building auth module"

# Stop recording and save
npx github:NickCirv/claude-session-replay stop

# List recorded sessions
npx github:NickCirv/claude-session-replay list

# Replay in terminal
npx github:NickCirv/claude-session-replay play <session-id>
npx github:NickCirv/claude-session-replay play <session-id> --speed 2
npx github:NickCirv/claude-session-replay play <session-id> --speed instant

# Export as standalone HTML
npx github:NickCirv/claude-session-replay export <session-id> --html
npx github:NickCirv/claude-session-replay export <session-id> -o my-session.html

# Delete a session
npx github:NickCirv/claude-session-replay delete <session-id>
```

| Flag | Command | Description |
|------|---------|-------------|
| `-n, --name <name>` | `record` | Label the session |
| `-s, --speed <n>` | `play` | Playback speed: `1`, `2`, `5`, or `instant` |
| `-o, --output <path>` | `export` | Output file path (default: `./<id>.html`) |

## What it does

Watches `~/.claude/projects/**/*.jsonl` for live Claude Code activity and stores each tool call (Read, Write, Edit, Bash, Glob, Grep, etc.) as a timestamped event. Sessions are saved to `~/.claude-replay/sessions/` as JSON files. The `play` command replays events with realistic timing; `export` generates a self-contained dark-theme HTML page with a filterable, clickable timeline — no server required.

| Event type | Description |
|------------|-------------|
| `tool` | Tool calls (Read, Write, Bash, etc.) |
| `assistant` | Claude text responses |
| `user` | User messages |

---
<sub>Node >=18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
</content>
</invoke>