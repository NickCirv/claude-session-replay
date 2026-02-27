import { promises as fs } from 'node:fs';

export async function exportSession(session, outPath) {
  const html = buildHtml(session);
  await fs.writeFile(outPath, html, 'utf8');
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDuration(ms) {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m${rem > 0 ? `${rem}s` : ''}`;
}

function renderEvents(events) {
  if (!events.length) return '<p class="no-events">No events recorded.</p>';
  const firstTs = new Date(events[0].timestamp).getTime();

  return events.map((ev, i) => {
    const elapsed = new Date(ev.timestamp).getTime() - firstTs;
    const type = ev.type || 'message';
    const iconMap = { Write: '&#x270E;', Edit: '&#x270E;', Read: '&#x1F4D6;', Bash: '$', Glob: '&#x2315;', Grep: '&#x2315;', WebSearch: '&#x2295;', WebFetch: '&#x2295;', TodoWrite: '&#x2713;', Task: '&#x2699;' };
    const typeIconMap = { tool: (iconMap[ev.tool] ?? '&#x2699;'), assistant: '&#x25C6;', user: '&#x25B6;' };
    const icon = typeIconMap[type] ?? '&middot;';
    const detail = escHtml(ev.detail || JSON.stringify(ev.input || {}, null, 2));
    const summary = escHtml(ev.summary || '');
    const elapsed2 = formatDuration(elapsed);
    const delay = Math.min(i * 40, 1200);

    return `<div class="event" data-type="${escHtml(type)}" style="animation-delay:${delay}ms" onclick="this.classList.toggle('expanded')">
  <span class="event-time">+${escHtml(elapsed2)}</span>
  <span class="event-icon">${icon}</span>
  <div class="event-body">
    <div class="event-summary">${summary}</div>
    <pre class="event-detail">${detail}</pre>
  </div>
</div>`;
  }).join('\n');
}

function buildHtml(session) {
  const events = session.events ?? [];
  const meta = {
    id: session.id,
    name: session.name ?? null,
    startedAt: session.startedAt,
    duration: session.duration ?? null,
    eventCount: events.length,
  };

  const nameHtml = meta.name ? `<span class="session-name">${escHtml(meta.name)}</span>` : '';
  const durationHtml = meta.duration ? `<span class="pill">${escHtml(formatDuration(meta.duration))}</span>` : '';
  const eventsHtml = renderEvents(events);
  const dateStr = escHtml(new Date(meta.startedAt).toLocaleString());
  const idStr = escHtml(meta.id);
  const countStr = escHtml(String(meta.eventCount));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Claude Session &middot; ${idStr}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d1117; --surface: #161b22; --surface2: #21262d;
      --border: #30363d; --text: #e6edf3; --text-muted: #8b949e;
      --cyan: #79c0ff; --green: #56d364; --yellow: #e3b341;
      --font-mono: 'SF Mono','Fira Code','Cascadia Code',Consolas,monospace;
      --font-sans: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      --radius: 8px;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); min-height: 100vh; line-height: 1.5; }
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; position: sticky; top: 0; z-index: 10; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo { font-family: var(--font-mono); font-size: 14px; color: var(--cyan); font-weight: 600; }
    .session-name { font-size: 15px; font-weight: 600; }
    .session-id { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); background: var(--surface2); border: 1px solid var(--border); border-radius: 4px; padding: 2px 8px; }
    .meta-pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .pill { font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 3px 10px; }
    main { max-width: 900px; margin: 0 auto; padding: 32px 24px 80px; }
    .filter-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-btn { font-size: 12px; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; font-family: var(--font-sans); }
    .filter-btn:hover { border-color: #484f58; color: var(--text); }
    .filter-btn.active { background: var(--surface2); border-color: var(--cyan); color: var(--cyan); }
    .timeline { display: flex; flex-direction: column; gap: 2px; }
    .event { display: flex; gap: 12px; padding: 10px 14px; border-radius: var(--radius); border: 1px solid transparent; transition: background 0.1s, border-color 0.1s; cursor: pointer; opacity: 0; transform: translateX(-8px); animation: reveal 0.25s ease forwards; }
    .event:hover { background: var(--surface2); border-color: var(--border); }
    @keyframes reveal { to { opacity: 1; transform: translateX(0); } }
    .event-time { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); min-width: 56px; padding-top: 2px; flex-shrink: 0; }
    .event-icon { font-size: 14px; width: 20px; flex-shrink: 0; text-align: center; padding-top: 1px; }
    .event-body { flex: 1; min-width: 0; }
    .event-summary { font-size: 13px; font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .event-detail { margin-top: 6px; font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; white-space: pre-wrap; word-break: break-all; display: none; }
    .event.expanded .event-detail { display: block; }
    .event[data-type="tool"] .event-icon, .event[data-type="tool"] .event-summary { color: var(--yellow); }
    .event[data-type="assistant"] .event-icon, .event[data-type="assistant"] .event-summary { color: var(--cyan); }
    .event[data-type="user"] .event-icon, .event[data-type="user"] .event-summary { color: var(--green); }
    .event[data-type="message"] .event-summary { color: var(--text-muted); }
    .no-events { text-align: center; color: var(--text-muted); font-size: 14px; padding: 60px 0; }
    footer { text-align: center; padding: 20px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border); margin-top: 40px; }
  </style>
</head>
<body>
<header>
  <div class="header-left">
    <span class="logo">claude-session-replay</span>
    ${nameHtml}
    <span class="session-id">${idStr}</span>
  </div>
  <div class="meta-pills">
    <span class="pill">${dateStr}</span>
    ${durationHtml}
    <span class="pill">${countStr} events</span>
  </div>
</header>
<main>
  <div class="filter-bar">
    <button class="filter-btn active" onclick="setFilter(this,'all')">All</button>
    <button class="filter-btn" onclick="setFilter(this,'tool')">Tools</button>
    <button class="filter-btn" onclick="setFilter(this,'assistant')">Assistant</button>
    <button class="filter-btn" onclick="setFilter(this,'user')">User</button>
  </div>
  <div class="timeline" id="timeline">
${eventsHtml}
  </div>
</main>
<footer>Generated by <strong>claude-session-replay</strong> &nbsp;&middot;&nbsp; Session ${idStr}</footer>
<script>
  function setFilter(btn, type) {
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('.event').forEach(function(ev) {
      ev.style.display = (type === 'all' || ev.dataset.type === type) ? 'flex' : 'none';
    });
  }
</script>
</body>
</html>`;
}
