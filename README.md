# claude-session-replay

Record and replay Claude Code sessions. Like Asciinema but for Claude Code — captures every tool call, edit, read, and bash command as a replayable timeline.

## Install

```bash
npm install -g claude-session-replay
# or run without install:
npx claude-session-replay <command>
```

## Usage

### Record a session

```bash
claude-session-replay record
claude-session-replay record --name "building auth module"
```

Watches `~/.claude/projects/` for new JSONL activity. Run Claude Code normally in another terminal. Press `Ctrl+C` or run `stop` to finish.

### Stop recording

```bash
claude-session-replay stop
```

### List sessions

```bash
claude-session-replay list
```

### Replay in terminal

```bash
claude-session-replay play 20260227-143022-a3f9
claude-session-replay play 20260227-143022-a3f9 --speed 2
claude-session-replay play 20260227-143022-a3f9 --speed instant
```

Speed options: `1` (realtime), `2`, `5`, `instant`.

### Export as HTML

```bash
claude-session-replay export 20260227-143022-a3f9 --html
claude-session-replay export 20260227-143022-a3f9 -o my-session.html
```

Generates a standalone dark-theme HTML file with a filterable, clickable timeline.

### Delete a session

```bash
claude-session-replay delete 20260227-143022-a3f9
```

## Storage

Sessions are saved to `~/.claude-replay/sessions/` as JSON files.

## How it works

1. `record` starts a `chokidar` watcher on `~/.claude/projects/**/*.jsonl`
2. New JSONL lines are parsed for tool calls (Read, Write, Edit, Bash, Glob, Grep, etc.)
3. Each event is stored as `{timestamp, type, tool, summary, detail}`
4. `play` prints events with realistic timing (capped at 3s gap per event)
5. `export` renders a standalone HTML page — no server required

## Event Types

| Type | Color | Description |
|------|-------|-------------|
| `tool` | Yellow | Tool calls (Read, Write, Bash, etc.) |
| `assistant` | Cyan | Claude text responses |
| `user` | Green | User messages |

## Tech

Node.js ESM · commander · chalk · chokidar · No Anthropic API required
