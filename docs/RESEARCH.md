# claude-session-replay — documentation research

Reviewed 21 September 2026. Public GitHub source only.

## Revision and scope

- Commit: [`6d72bfaf7fb9d47613ee25951316859a702d8268`](https://github.com/NickCirv/claude-session-replay/commit/6d72bfaf7fb9d47613ee25951316859a702d8268).
- Tree: `558c19a195fd9e95bbac638439bc7473ce3d623d`; truncated: `false`.
- Capture: 11 of 11 eligible text files; all eligible text files.
- Method: package and entrypoint inspection, implementation-interface review, targeted behavior/limitation inspection, and test-source review. This is not an exhaustive correctness or security audit.
- Commands run against repository code: **none**. External services, deployment and npm publication were not verified.

## Claim and evidence map

| Documentation claim | Pinned evidence | Assessment |
| --- | --- | --- |
| Runtime, executable and development commands | [package.json](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/package.json) | Source declaration inspected; runtime unverified |
| Captures selected local Claude session events and replays them in a terminal or HTML export. | [bin/replay.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/bin/replay.js) · [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) | Implementation interfaces inspected; behavior not executed |
| Record/stop lifecycle; session listing; speed-controlled playback; HTML export and deletion. | [bin/replay.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/bin/replay.js), [src/exporter.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/exporter.js), [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js), [src/player.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/player.js), [src/recorder.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/recorder.js), [src/storage.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/storage.js) | Source-backed scope, not a test result |
| Recording depends on compatible local JSONL formats and can capture sensitive prompts or tool content. Exports are shareable artifacts; inspect them before sharing. Delete removes saved recordings. | [bin/replay.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/bin/replay.js), [src/exporter.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/exporter.js), [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js), [src/player.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/player.js), [src/recorder.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/recorder.js), [src/storage.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/storage.js) | Material limits documented; service compatibility remains open |
| Existing checks | [test/smoke.test.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/test/smoke.test.js) | Test source read; no passing-run claim |

## Documentation inventory and disposition

| Existing document | Decision |
| --- | --- |
| [README.md](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/README.md) | Rewritten with source-specific purpose, direct checkout setup, limitations and verification status. Old section fragments retained where practical. |

Added `docs/REFERENCE.md` for the observed implementation and command surface, and this research record. Protected license and attribution files remain in their original locations without edits. No source or product UI was changed.

## Quality dimensions

| Dimension | Status | Evidence / next step |
| --- | --- | --- |
| Pinned provenance | Verified | Captured commit, tree and per-file hashes recorded below |
| Interface documentation | Partially verified | Source inspection only; run clean-checkout quickstart |
| Runtime behavior | Unverified | No repository execution in this review |
| Test results | Unverified | Existing tests were not run |
| Deployment / package availability | Unverified | No remote publish or live-service check |
| Visual / link checks | Unverified | Portfolio renderer and independent QA are separate from this authoring step |

## Unresolved issues

Recording depends on compatible local JSONL formats and can capture sensitive prompts or tool content. Exports are shareable artifacts; inspect them before sharing. Delete removes saved recordings.

## Captured source inventory

This lists captured provenance, not a claim that every line received a full audit. Binary/generated/excluded files are outside the eligible text capture.

| File | SHA-256 | Bytes |
| --- | --- | --- |
| [LICENSE](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/LICENSE) | `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d` | 1072 |
| [README.md](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/README.md) | `eef2d1c7298e484f247645cb683a65872036707813395860e2d3a8ea7768c356` | 2456 |
| [package.json](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/package.json) | `896c2c1cdaf832aef57e4a596837dd744295536ea5a5546ebe2287622953d786` | 942 |
| [.github/workflows/ci.yml](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/.github/workflows/ci.yml) | `e818f4e6bd805f798665dbbf04964d02f12fc59dd7f18903ad63d26d374ae3f0` | 380 |
| [bin/replay.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/bin/replay.js) | `b2c8f60d8498a4f67cc3547b6b42480362f8239b8885a37686a0fcea6a0eb28e` | 46 |
| [src/exporter.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/exporter.js) | `363bfa8782593e1a210a7caa6bc08e7c5ffa079aa40848304d07922ea988e7b7` | 7948 |
| [src/index.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/index.js) | `e01cfaaf259ea916cae7409e98c3cc4298348718ebf661c1875210ee90431fca` | 3445 |
| [src/player.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/player.js) | `d15e40e232670072da5ccf1c5519a230a9e295328abe54b4124768d8e97f3027` | 3927 |
| [src/recorder.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/recorder.js) | `e8a1c61616508a9cd65c65e65930fd62ee308d68f4d90691d6ba69199643527f` | 8726 |
| [src/storage.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/src/storage.js) | `f6c497b1e6cc7775bcab5710ded37539882bd92f5a0b9c63525053c33c62c99c` | 2102 |
| [test/smoke.test.js](https://github.com/NickCirv/claude-session-replay/blob/6d72bfaf7fb9d47613ee25951316859a702d8268/test/smoke.test.js) | `15b6af8bb4a2b667c9a71bb4a923cf8b55c586a8e3e58277c5257bbd942b647c` | 463 |
