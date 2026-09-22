# claude-session-replay — implementation reference

Source revision: `6d72bfaf7fb9d47613ee25951316859a702d8268`. This reference records source declarations; it is not a transcript of a successful run.

## Entrypoint and runtime

[package.json](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/package.json) declares `bin/replay.js`. Node.js `>=20` and npm.

Executable mapping: `claude-session-replay` → `./bin/replay.js`.

## Supported workflow

Record/stop lifecycle; session listing; speed-controlled playback; HTML export and deletion.

Recording depends on compatible local JSONL formats and can capture sensitive prompts or tool content. Exports are shareable artifacts; inspect them before sharing. Delete removes saved recordings.

## Declared command interface

Options belong to the preceding command in the linked source; they are not necessarily global.

| Kind | Declaration | Source description | Source |
| --- | --- | --- | --- |
| command | `record` | Start recording a Claude Code session | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| option | `-n, --name <name>` | Session name (optional) | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| command | `stop` | Stop recording and save the session | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| command | `list` | List all recorded sessions | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| command | `play <id>` | Replay a recorded session in the terminal | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| option | `-s, --speed <multiplier>` | Playback speed (1, 2, 5, or "instant") | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| command | `export <id>` | Export a session as a standalone HTML file | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| option | `--html` | Export as HTML (default) | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| option | `-o, --output <path>` | Output file path (default: ./<id>.html) | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |
| command | `delete <id>` | Delete a recorded session | [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) |

## Option defaults

These are literal defaults or parsers declared by the command builder; flags belong to their command as shown above.

| Option | Declared default / parser |
| --- | --- |
| `-s, --speed <multiplier>` | `'1'` |
| `--html` | `true` |

## Package scripts

| Script | Exact command |
| --- | --- |
| `start` | `node bin/replay.js` |
| `test` | `node --test` |

## Implementation sources

[src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js).

## Verification boundary

No repository code, tests, network operation, hook installer or migration was executed for this review. Source inspection supports the documented interface; runtime correctness and external-service compatibility remain unverified.
